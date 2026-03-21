package db

import (
	"context"
	"errors"
	"fmt"
	"strings"
	"time"

	"ndzumamalate.com/apps/api/internal/models"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

type Store struct {
	pool *pgxpool.Pool
}

func NewStore(ctx context.Context, databaseURL string) (*Store, error) {
	if strings.TrimSpace(databaseURL) == "" {
		return nil, fmt.Errorf("DATABASE_URL is required")
	}

	pool, err := pgxpool.New(ctx, databaseURL)
	if err != nil {
		return nil, fmt.Errorf("connect postgres: %w", err)
	}

	if err := pool.Ping(ctx); err != nil {
		pool.Close()
		return nil, fmt.Errorf("ping postgres: %w", err)
	}

	return &Store{pool: pool}, nil
}

func (s *Store) Close() {
	if s != nil && s.pool != nil {
		s.pool.Close()
	}
}

func (s *Store) Ping(ctx context.Context) error {
	return s.pool.Ping(ctx)
}

func (s *Store) BootstrapAdmin(ctx context.Context, email, passwordHash string) (*models.AdminUser, bool, error) {
	tx, err := s.pool.BeginTx(ctx, pgx.TxOptions{})
	if err != nil {
		return nil, false, err
	}
	defer tx.Rollback(ctx)

	var count int
	if err := tx.QueryRow(ctx, `SELECT COUNT(*) FROM admin_users`).Scan(&count); err != nil {
		return nil, false, err
	}
	if count > 0 {
		return nil, false, nil
	}

	user := &models.AdminUser{}
	err = tx.QueryRow(ctx, `
		INSERT INTO admin_users (email, password_hash)
		VALUES ($1, $2)
		RETURNING id, email, password_hash, created_at, updated_at, last_login_at
	`, strings.ToLower(email), passwordHash).Scan(
		&user.ID,
		&user.Email,
		&user.PasswordHash,
		&user.CreatedAt,
		&user.UpdatedAt,
		&user.LastLoginAt,
	)
	if err != nil {
		return nil, false, err
	}

	if err := tx.Commit(ctx); err != nil {
		return nil, false, err
	}

	return user, true, nil
}

func (s *Store) GetAdminByEmail(ctx context.Context, email string) (*models.AdminUser, error) {
	row := s.pool.QueryRow(ctx, `
		SELECT id, email, password_hash, created_at, updated_at, last_login_at
		FROM admin_users
		WHERE email = $1
	`, strings.ToLower(email))

	user := &models.AdminUser{}
	err := row.Scan(&user.ID, &user.Email, &user.PasswordHash, &user.CreatedAt, &user.UpdatedAt, &user.LastLoginAt)
	if errors.Is(err, pgx.ErrNoRows) {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}
	return user, nil
}

func (s *Store) GetAdminByID(ctx context.Context, id string) (*models.AdminUser, error) {
	row := s.pool.QueryRow(ctx, `
		SELECT id, email, password_hash, created_at, updated_at, last_login_at
		FROM admin_users
		WHERE id = $1
	`, id)

	user := &models.AdminUser{}
	err := row.Scan(&user.ID, &user.Email, &user.PasswordHash, &user.CreatedAt, &user.UpdatedAt, &user.LastLoginAt)
	if errors.Is(err, pgx.ErrNoRows) {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}
	return user, nil
}

func (s *Store) UpdateAdminPassword(ctx context.Context, userID, passwordHash string) error {
	_, err := s.pool.Exec(ctx, `
		UPDATE admin_users
		SET password_hash = $2, updated_at = NOW()
		WHERE id = $1
	`, userID, passwordHash)
	return err
}

func (s *Store) UpdateAdminLastLogin(ctx context.Context, userID string, at time.Time) error {
	_, err := s.pool.Exec(ctx, `
		UPDATE admin_users
		SET last_login_at = $2, updated_at = NOW()
		WHERE id = $1
	`, userID, at)
	return err
}

func (s *Store) ListTags(ctx context.Context) ([]models.Tag, error) {
	rows, err := s.pool.Query(ctx, `SELECT id, name, slug, filter, created_at FROM tags ORDER BY name ASC`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	tags := make([]models.Tag, 0)
	for rows.Next() {
		var tag models.Tag
		if err := rows.Scan(&tag.ID, &tag.Name, &tag.Slug, &tag.Filter, &tag.CreatedAt); err != nil {
			return nil, err
		}
		tags = append(tags, tag)
	}

	return tags, rows.Err()
}

func (s *Store) CreateTag(ctx context.Context, input models.TagInput) (*models.Tag, error) {
	tag := &models.Tag{}
	err := s.pool.QueryRow(ctx, `
		INSERT INTO tags (name, slug, filter)
		VALUES ($1, $2, $3)
		RETURNING id, name, slug, filter, created_at
	`, input.Name, input.Slug, input.Filter).Scan(&tag.ID, &tag.Name, &tag.Slug, &tag.Filter, &tag.CreatedAt)
	if err != nil {
		return nil, err
	}
	return tag, nil
}

func (s *Store) UpdateTag(ctx context.Context, id string, input models.TagInput) (*models.Tag, error) {
	tag := &models.Tag{}
	err := s.pool.QueryRow(ctx, `
		UPDATE tags
		SET name = $2, slug = $3, filter = $4
		WHERE id = $1
		RETURNING id, name, slug, filter, created_at
	`, id, input.Name, input.Slug, input.Filter).Scan(&tag.ID, &tag.Name, &tag.Slug, &tag.Filter, &tag.CreatedAt)
	if errors.Is(err, pgx.ErrNoRows) {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}
	return tag, nil
}

func (s *Store) DeleteTag(ctx context.Context, id string) error {
	_, err := s.pool.Exec(ctx, `DELETE FROM tags WHERE id = $1`, id)
	return err
}

func (s *Store) ListProjects(ctx context.Context, publishedOnly bool) ([]models.Project, error) {
	query := `
		SELECT
			p.id,
			p.title,
			p.slug,
			COALESCE(p.summary, ''),
			COALESCE(p.content, ''),
			COALESCE(p.image_url, ''),
			COALESCE(p.live_url, ''),
			COALESCE(p.repo_url, ''),
			p.featured,
			p.published,
			COALESCE(p.sort_order, 0),
			COALESCE(array_remove(array_agg(t.slug ORDER BY pt.sort_order ASC), NULL), '{}') AS tags,
			p.start_date,
			p.end_date,
			p.created_at,
			p.updated_at
		FROM projects p
		LEFT JOIN project_tags pt ON pt.project_id = p.id
		LEFT JOIN tags t ON t.id = pt.tag_id
	`
	if publishedOnly {
		query += ` WHERE p.published = TRUE`
	}
	query += ` GROUP BY p.id ORDER BY p.sort_order ASC, p.featured DESC, p.updated_at DESC`

	rows, err := s.pool.Query(ctx, query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	projects := make([]models.Project, 0)
	for rows.Next() {
		var project models.Project
		if err := rows.Scan(
			&project.ID,
			&project.Title,
			&project.Slug,
			&project.Summary,
			&project.Content,
			&project.ImageURL,
			&project.LiveURL,
			&project.RepoURL,
			&project.Featured,
			&project.Published,
			&project.SortOrder,
			&project.Tags,
			&project.StartDate,
			&project.EndDate,
			&project.CreatedAt,
			&project.UpdatedAt,
		); err != nil {
			return nil, err
		}
		projects = append(projects, project)
	}

	return projects, rows.Err()
}

func (s *Store) GetProjectBySlug(ctx context.Context, slug string, publishedOnly bool) (*models.Project, error) {
	query := `
		SELECT
			p.id,
			p.title,
			p.slug,
			COALESCE(p.summary, ''),
			COALESCE(p.content, ''),
			COALESCE(p.image_url, ''),
			COALESCE(p.live_url, ''),
			COALESCE(p.repo_url, ''),
			p.featured,
			p.published,
			COALESCE(p.sort_order, 0),
			COALESCE(array_remove(array_agg(t.slug ORDER BY pt.sort_order ASC), NULL), '{}') AS tags,
			p.start_date,
			p.end_date,
			p.created_at,
			p.updated_at
		FROM projects p
		LEFT JOIN project_tags pt ON pt.project_id = p.id
		LEFT JOIN tags t ON t.id = pt.tag_id
		WHERE p.slug = $1
	`
	if publishedOnly {
		query += ` AND p.published = TRUE`
	}
	query += ` GROUP BY p.id`

	project := &models.Project{}
	err := s.pool.QueryRow(ctx, query, slug).Scan(
		&project.ID,
		&project.Title,
		&project.Slug,
		&project.Summary,
		&project.Content,
		&project.ImageURL,
		&project.LiveURL,
		&project.RepoURL,
		&project.Featured,
		&project.Published,
		&project.SortOrder,
		&project.Tags,
		&project.StartDate,
		&project.EndDate,
		&project.CreatedAt,
		&project.UpdatedAt,
	)
	if errors.Is(err, pgx.ErrNoRows) {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}
	return project, nil
}

func (s *Store) CreateProject(ctx context.Context, input models.ProjectInput) (*models.Project, error) {
	return s.upsertProject(ctx, "", input, true)
}

func (s *Store) UpdateProject(ctx context.Context, id string, input models.ProjectInput) (*models.Project, error) {
	return s.upsertProject(ctx, id, input, false)
}

func (s *Store) upsertProject(ctx context.Context, id string, input models.ProjectInput, create bool) (*models.Project, error) {
	startDate, err := nullableDate(input.StartDate)
	if err != nil {
		return nil, fmt.Errorf("invalid start_date: %w", err)
	}
	endDate, err := nullableDate(input.EndDate)
	if err != nil {
		return nil, fmt.Errorf("invalid end_date: %w", err)
	}

	tx, err := s.pool.BeginTx(ctx, pgx.TxOptions{})
	if err != nil {
		return nil, err
	}
	defer tx.Rollback(ctx)

	project := &models.Project{}
	if create {
		// Auto-assign sort_order: always append to end (0-based)
		sortOrder := input.SortOrder
		if sortOrder == 0 {
			var count int
			if err := tx.QueryRow(ctx, `SELECT COUNT(*) FROM projects`).Scan(&count); err != nil {
				return nil, err
			}
			sortOrder = count // 0-based: if 3 projects exist (0,1,2), new one gets 3
		}
		err = tx.QueryRow(ctx, `
			INSERT INTO projects (title, slug, summary, content, image_url, live_url, repo_url, featured, published, sort_order, start_date, end_date)
			VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
			RETURNING id, title, slug, COALESCE(summary, ''), COALESCE(content, ''), COALESCE(image_url, ''), COALESCE(live_url, ''), COALESCE(repo_url, ''), featured, published, COALESCE(sort_order, 0), start_date, end_date, created_at, updated_at
		`, input.Title, input.Slug, input.Summary, input.Content, input.ImageURL, input.LiveURL, input.RepoURL, input.Featured, input.Published, sortOrder, startDate, endDate).Scan(
			&project.ID, &project.Title, &project.Slug, &project.Summary, &project.Content, &project.ImageURL, &project.LiveURL, &project.RepoURL, &project.Featured, &project.Published, &project.SortOrder, &project.StartDate, &project.EndDate, &project.CreatedAt, &project.UpdatedAt,
		)
	} else {
		err = tx.QueryRow(ctx, `
			UPDATE projects
			SET title = $2, slug = $3, summary = $4, content = $5, image_url = $6, live_url = $7, repo_url = $8, featured = $9, published = $10, sort_order = $11, start_date = $12, end_date = $13
			WHERE id = $1
			RETURNING id, title, slug, COALESCE(summary, ''), COALESCE(content, ''), COALESCE(image_url, ''), COALESCE(live_url, ''), COALESCE(repo_url, ''), featured, published, COALESCE(sort_order, 0), start_date, end_date, created_at, updated_at
		`, id, input.Title, input.Slug, input.Summary, input.Content, input.ImageURL, input.LiveURL, input.RepoURL, input.Featured, input.Published, input.SortOrder, startDate, endDate).Scan(
			&project.ID, &project.Title, &project.Slug, &project.Summary, &project.Content, &project.ImageURL, &project.LiveURL, &project.RepoURL, &project.Featured, &project.Published, &project.SortOrder, &project.StartDate, &project.EndDate, &project.CreatedAt, &project.UpdatedAt,
		)
	}
	if errors.Is(err, pgx.ErrNoRows) {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}

	if _, err := tx.Exec(ctx, `DELETE FROM project_tags WHERE project_id = $1`, project.ID); err != nil {
		return nil, err
	}
	for i, tagID := range input.TagIDs {
		if _, err := tx.Exec(ctx, `INSERT INTO project_tags (project_id, tag_id, sort_order) VALUES ($1, $2, $3)`, project.ID, tagID, i); err != nil {
			return nil, err
		}
	}

	if err := tx.QueryRow(ctx, `
		SELECT COALESCE(array_remove(array_agg(t.slug ORDER BY pt.sort_order ASC), NULL), '{}')
		FROM project_tags pt
		LEFT JOIN tags t ON t.id = pt.tag_id
		WHERE pt.project_id = $1
	`, project.ID).Scan(&project.Tags); err != nil {
		return nil, err
	}

	if err := tx.Commit(ctx); err != nil {
		return nil, err
	}

	return project, nil
}

func (s *Store) DeleteProject(ctx context.Context, id string) error {
	tx, err := s.pool.BeginTx(ctx, pgx.TxOptions{})
	if err != nil {
		return err
	}
	defer tx.Rollback(ctx)

	// Get the sort_order of the project being deleted
	var deletedOrder int
	err = tx.QueryRow(ctx, `SELECT COALESCE(sort_order, 0) FROM projects WHERE id = $1`, id).Scan(&deletedOrder)
	if err != nil {
		return err
	}

	// Delete the project
	if _, err := tx.Exec(ctx, `DELETE FROM projects WHERE id = $1`, id); err != nil {
		return err
	}

	// Shift all projects above the deleted one down by 1 to keep contiguous ordering
	if _, err := tx.Exec(ctx, `UPDATE projects SET sort_order = sort_order - 1 WHERE sort_order > $1`, deletedOrder); err != nil {
		return err
	}

	return tx.Commit(ctx)
}

func (s *Store) SwapProjectOrder(ctx context.Context, id string, direction int) error {
	tx, err := s.pool.BeginTx(ctx, pgx.TxOptions{})
	if err != nil {
		return err
	}
	defer tx.Rollback(ctx)

	// Get current sort_order for the source project
	var currentOrder int
	err = tx.QueryRow(ctx, `SELECT COALESCE(sort_order, 0) FROM projects WHERE id = $1`, id).Scan(&currentOrder)
	if err != nil {
		return fmt.Errorf("project not found")
	}

	targetOrder := currentOrder + direction

	// Ensure target is in valid range
	var count int
	if err := tx.QueryRow(ctx, `SELECT COUNT(*) FROM projects`).Scan(&count); err != nil {
		return err
	}
	if targetOrder < 0 || targetOrder >= count {
		return fmt.Errorf("cannot move further in that direction")
	}

	// Swap: set the project at targetOrder to currentOrder, and source to targetOrder
	if _, err := tx.Exec(ctx, `UPDATE projects SET sort_order = $1 WHERE sort_order = $2 AND id != $3`, currentOrder, targetOrder, id); err != nil {
		return err
	}
	if _, err := tx.Exec(ctx, `UPDATE projects SET sort_order = $1 WHERE id = $2`, targetOrder, id); err != nil {
		return err
	}

	return tx.Commit(ctx)
}

func (s *Store) ListBlogs(ctx context.Context, publishedOnly bool) ([]models.Blog, error) {
	query := `
		SELECT
			b.id,
			b.title,
			b.slug,
			COALESCE(b.summary, ''),
			COALESCE(b.content, ''),
			COALESCE(b.cover_image_url, ''),
			b.published,
			b.published_at,
			COALESCE(array_remove(array_agg(t.slug), NULL), '{}') AS tags,
			b.created_at,
			b.updated_at
		FROM blogs b
		LEFT JOIN blog_tags bt ON bt.blog_id = b.id
		LEFT JOIN tags t ON t.id = bt.tag_id
	`
	if publishedOnly {
		query += ` WHERE b.published = TRUE`
	}
	query += ` GROUP BY b.id ORDER BY COALESCE(b.published_at, b.created_at) DESC`

	rows, err := s.pool.Query(ctx, query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	blogs := make([]models.Blog, 0)
	for rows.Next() {
		var blog models.Blog
		if err := rows.Scan(&blog.ID, &blog.Title, &blog.Slug, &blog.Summary, &blog.Content, &blog.CoverImageURL, &blog.Published, &blog.PublishedAt, &blog.Tags, &blog.CreatedAt, &blog.UpdatedAt); err != nil {
			return nil, err
		}
		blogs = append(blogs, blog)
	}

	return blogs, rows.Err()
}

func (s *Store) GetBlogBySlug(ctx context.Context, slug string, publishedOnly bool) (*models.Blog, error) {
	query := `
		SELECT
			b.id,
			b.title,
			b.slug,
			COALESCE(b.summary, ''),
			COALESCE(b.content, ''),
			COALESCE(b.cover_image_url, ''),
			b.published,
			b.published_at,
			COALESCE(array_remove(array_agg(t.slug), NULL), '{}') AS tags,
			b.created_at,
			b.updated_at
		FROM blogs b
		LEFT JOIN blog_tags bt ON bt.blog_id = b.id
		LEFT JOIN tags t ON t.id = bt.tag_id
		WHERE b.slug = $1
	`
	if publishedOnly {
		query += ` AND b.published = TRUE`
	}
	query += ` GROUP BY b.id`

	blog := &models.Blog{}
	err := s.pool.QueryRow(ctx, query, slug).Scan(&blog.ID, &blog.Title, &blog.Slug, &blog.Summary, &blog.Content, &blog.CoverImageURL, &blog.Published, &blog.PublishedAt, &blog.Tags, &blog.CreatedAt, &blog.UpdatedAt)
	if errors.Is(err, pgx.ErrNoRows) {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}
	return blog, nil
}

func (s *Store) CreateBlog(ctx context.Context, input models.BlogInput) (*models.Blog, error) {
	return s.upsertBlog(ctx, "", input, true)
}

func (s *Store) UpdateBlog(ctx context.Context, id string, input models.BlogInput) (*models.Blog, error) {
	return s.upsertBlog(ctx, id, input, false)
}

func (s *Store) upsertBlog(ctx context.Context, id string, input models.BlogInput, create bool) (*models.Blog, error) {
	publishedAt, err := nullableTimestamp(input.PublishedAt)
	if err != nil {
		return nil, err
	}

	tx, err := s.pool.BeginTx(ctx, pgx.TxOptions{})
	if err != nil {
		return nil, err
	}
	defer tx.Rollback(ctx)

	blog := &models.Blog{}
	if create {
		err = tx.QueryRow(ctx, `
			INSERT INTO blogs (title, slug, summary, content, cover_image_url, published, published_at)
			VALUES ($1, $2, $3, $4, $5, $6, $7)
			RETURNING id, title, slug, COALESCE(summary, ''), COALESCE(content, ''), COALESCE(cover_image_url, ''), published, published_at, created_at, updated_at
		`, input.Title, input.Slug, input.Summary, input.Content, input.CoverImageURL, input.Published, publishedAt).Scan(&blog.ID, &blog.Title, &blog.Slug, &blog.Summary, &blog.Content, &blog.CoverImageURL, &blog.Published, &blog.PublishedAt, &blog.CreatedAt, &blog.UpdatedAt)
	} else {
		err = tx.QueryRow(ctx, `
			UPDATE blogs
			SET title = $2, slug = $3, summary = $4, content = $5, cover_image_url = $6, published = $7, published_at = $8
			WHERE id = $1
			RETURNING id, title, slug, COALESCE(summary, ''), COALESCE(content, ''), COALESCE(cover_image_url, ''), published, published_at, created_at, updated_at
		`, id, input.Title, input.Slug, input.Summary, input.Content, input.CoverImageURL, input.Published, publishedAt).Scan(&blog.ID, &blog.Title, &blog.Slug, &blog.Summary, &blog.Content, &blog.CoverImageURL, &blog.Published, &blog.PublishedAt, &blog.CreatedAt, &blog.UpdatedAt)
	}
	if errors.Is(err, pgx.ErrNoRows) {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}

	// Manage blog_tags
	if _, err := tx.Exec(ctx, `DELETE FROM blog_tags WHERE blog_id = $1`, blog.ID); err != nil {
		return nil, err
	}
	for _, tagID := range input.TagIDs {
		if _, err := tx.Exec(ctx, `INSERT INTO blog_tags (blog_id, tag_id) VALUES ($1, $2)`, blog.ID, tagID); err != nil {
			return nil, err
		}
	}

	if err := tx.QueryRow(ctx, `
		SELECT COALESCE(array_remove(array_agg(t.slug), NULL), '{}')
		FROM blog_tags bt
		LEFT JOIN tags t ON t.id = bt.tag_id
		WHERE bt.blog_id = $1
	`, blog.ID).Scan(&blog.Tags); err != nil {
		return nil, err
	}

	if err := tx.Commit(ctx); err != nil {
		return nil, err
	}

	return blog, nil
}

func (s *Store) DeleteBlog(ctx context.Context, id string) error {
	_, err := s.pool.Exec(ctx, `DELETE FROM blogs WHERE id = $1`, id)
	return err
}

func (s *Store) ListSkills(ctx context.Context) ([]models.Skill, error) {
	rows, err := s.pool.Query(ctx, `SELECT id, name, category, COALESCE(icon_url, ''), proficiency, sort_order, created_at FROM skills ORDER BY sort_order ASC, name ASC`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	skills := make([]models.Skill, 0)
	for rows.Next() {
		var skill models.Skill
		if err := rows.Scan(&skill.ID, &skill.Name, &skill.Category, &skill.IconURL, &skill.Proficiency, &skill.SortOrder, &skill.CreatedAt); err != nil {
			return nil, err
		}
		skills = append(skills, skill)
	}

	return skills, rows.Err()
}

func (s *Store) CreateSkill(ctx context.Context, input models.SkillInput) (*models.Skill, error) {
	skill := &models.Skill{}
	err := s.pool.QueryRow(ctx, `
		INSERT INTO skills (name, category, icon_url, proficiency, sort_order)
		VALUES ($1, $2, $3, $4, $5)
		RETURNING id, name, category, COALESCE(icon_url, ''), proficiency, sort_order, created_at
	`, input.Name, input.Category, input.IconURL, input.Proficiency, input.SortOrder).Scan(&skill.ID, &skill.Name, &skill.Category, &skill.IconURL, &skill.Proficiency, &skill.SortOrder, &skill.CreatedAt)
	if err != nil {
		return nil, err
	}
	return skill, nil
}

func (s *Store) UpdateSkill(ctx context.Context, id string, input models.SkillInput) (*models.Skill, error) {
	skill := &models.Skill{}
	err := s.pool.QueryRow(ctx, `
		UPDATE skills
		SET name = $2, category = $3, icon_url = $4, proficiency = $5, sort_order = $6
		WHERE id = $1
		RETURNING id, name, category, COALESCE(icon_url, ''), proficiency, sort_order, created_at
	`, id, input.Name, input.Category, input.IconURL, input.Proficiency, input.SortOrder).Scan(&skill.ID, &skill.Name, &skill.Category, &skill.IconURL, &skill.Proficiency, &skill.SortOrder, &skill.CreatedAt)
	if errors.Is(err, pgx.ErrNoRows) {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}
	return skill, nil
}

func (s *Store) DeleteSkill(ctx context.Context, id string) error {
	_, err := s.pool.Exec(ctx, `DELETE FROM skills WHERE id = $1`, id)
	return err
}

func (s *Store) ListExperience(ctx context.Context) ([]models.Experience, error) {
	rows, err := s.pool.Query(ctx, `SELECT id, type, company, role, COALESCE(location, ''), COALESCE(description, ''), start_date, end_date, created_at, updated_at FROM experience ORDER BY start_date DESC`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	items := make([]models.Experience, 0)
	for rows.Next() {
		var item models.Experience
		if err := rows.Scan(&item.ID, &item.Type, &item.Company, &item.Role, &item.Location, &item.Description, &item.StartDate, &item.EndDate, &item.CreatedAt, &item.UpdatedAt); err != nil {
			return nil, err
		}
		items = append(items, item)
	}

	return items, rows.Err()
}

func (s *Store) CreateExperience(ctx context.Context, input models.ExperienceInput) (*models.Experience, error) {
	return s.upsertExperience(ctx, "", input, true)
}

func (s *Store) UpdateExperience(ctx context.Context, id string, input models.ExperienceInput) (*models.Experience, error) {
	return s.upsertExperience(ctx, id, input, false)
}

func (s *Store) upsertExperience(ctx context.Context, id string, input models.ExperienceInput, create bool) (*models.Experience, error) {
	startDate, err := time.Parse("2006-01-02", input.StartDate)
	if err != nil {
		return nil, fmt.Errorf("invalid start_date: %w", err)
	}
	endDate, err := nullableDate(input.EndDate)
	if err != nil {
		return nil, err
	}

	item := &models.Experience{}
	if create {
		err = s.pool.QueryRow(ctx, `
			INSERT INTO experience (type, company, role, location, description, start_date, end_date)
			VALUES ($1, $2, $3, $4, $5, $6, $7)
			RETURNING id, type, company, role, COALESCE(location, ''), COALESCE(description, ''), start_date, end_date, created_at, updated_at
		`, input.Type, input.Company, input.Role, input.Location, input.Description, startDate, endDate).Scan(&item.ID, &item.Type, &item.Company, &item.Role, &item.Location, &item.Description, &item.StartDate, &item.EndDate, &item.CreatedAt, &item.UpdatedAt)
	} else {
		err = s.pool.QueryRow(ctx, `
			UPDATE experience
			SET type = $2, company = $3, role = $4, location = $5, description = $6, start_date = $7, end_date = $8
			WHERE id = $1
			RETURNING id, type, company, role, COALESCE(location, ''), COALESCE(description, ''), start_date, end_date, created_at, updated_at
		`, id, input.Type, input.Company, input.Role, input.Location, input.Description, startDate, endDate).Scan(&item.ID, &item.Type, &item.Company, &item.Role, &item.Location, &item.Description, &item.StartDate, &item.EndDate, &item.CreatedAt, &item.UpdatedAt)
	}
	if errors.Is(err, pgx.ErrNoRows) {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}
	return item, nil
}

func (s *Store) DeleteExperience(ctx context.Context, id string) error {
	_, err := s.pool.Exec(ctx, `DELETE FROM experience WHERE id = $1`, id)
	return err
}

func (s *Store) ListCVs(ctx context.Context) ([]models.CV, error) {
	rows, err := s.pool.Query(ctx, `SELECT id, file_url, COALESCE(label, ''), is_active, uploaded_at FROM cv ORDER BY uploaded_at DESC`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	items := make([]models.CV, 0)
	for rows.Next() {
		var item models.CV
		if err := rows.Scan(&item.ID, &item.FileURL, &item.Label, &item.IsActive, &item.UploadedAt); err != nil {
			return nil, err
		}
		items = append(items, item)
	}

	return items, rows.Err()
}

func (s *Store) GetActiveCV(ctx context.Context) (*models.CV, error) {
	item := &models.CV{}
	err := s.pool.QueryRow(ctx, `SELECT id, file_url, COALESCE(label, ''), is_active, uploaded_at FROM cv WHERE is_active = TRUE LIMIT 1`).Scan(&item.ID, &item.FileURL, &item.Label, &item.IsActive, &item.UploadedAt)
	if errors.Is(err, pgx.ErrNoRows) {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}
	return item, nil
}

func (s *Store) CreateCV(ctx context.Context, input models.CVInput) (*models.CV, error) {
	return s.upsertCV(ctx, "", input, true)
}

func (s *Store) UpdateCV(ctx context.Context, id string, input models.CVInput) (*models.CV, error) {
	return s.upsertCV(ctx, id, input, false)
}

func (s *Store) upsertCV(ctx context.Context, id string, input models.CVInput, create bool) (*models.CV, error) {
	tx, err := s.pool.BeginTx(ctx, pgx.TxOptions{})
	if err != nil {
		return nil, err
	}
	defer tx.Rollback(ctx)

	if input.IsActive {
		if _, err := tx.Exec(ctx, `UPDATE cv SET is_active = FALSE WHERE is_active = TRUE`); err != nil {
			return nil, err
		}
	}

	item := &models.CV{}
	if create {
		err = tx.QueryRow(ctx, `
			INSERT INTO cv (file_url, label, is_active)
			VALUES ($1, $2, $3)
			RETURNING id, file_url, COALESCE(label, ''), is_active, uploaded_at
		`, input.FileURL, input.Label, input.IsActive).Scan(&item.ID, &item.FileURL, &item.Label, &item.IsActive, &item.UploadedAt)
	} else {
		err = tx.QueryRow(ctx, `
			UPDATE cv
			SET file_url = $2, label = $3, is_active = $4
			WHERE id = $1
			RETURNING id, file_url, COALESCE(label, ''), is_active, uploaded_at
		`, id, input.FileURL, input.Label, input.IsActive).Scan(&item.ID, &item.FileURL, &item.Label, &item.IsActive, &item.UploadedAt)
	}
	if errors.Is(err, pgx.ErrNoRows) {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}

	if err := tx.Commit(ctx); err != nil {
		return nil, err
	}
	return item, nil
}

func (s *Store) DeleteCV(ctx context.Context, id string) error {
	_, err := s.pool.Exec(ctx, `DELETE FROM cv WHERE id = $1`, id)
	return err
}

func (s *Store) GetProfile(ctx context.Context) (*models.Profile, error) {
	profile := &models.Profile{}
	err := s.pool.QueryRow(ctx, `
		SELECT id, open_to_work, COALESCE(spotify_url, ''), COALESCE(apple_music_url, ''), COALESCE(currently_reading_title, ''), COALESCE(currently_reading_url, ''), COALESCE(github_url, ''), COALESCE(twitter_url, ''), COALESCE(threads_url, ''), COALESCE(linkedin_url, ''), COALESCE(website_url, ''), updated_at
		FROM profile
		WHERE id = 1
	`).Scan(&profile.ID, &profile.OpenToWork, &profile.SpotifyURL, &profile.AppleMusicURL, &profile.CurrentlyReadingTitle, &profile.CurrentlyReadingURL, &profile.GitHubURL, &profile.TwitterURL, &profile.ThreadsURL, &profile.LinkedInURL, &profile.WebsiteURL, &profile.UpdatedAt)
	if errors.Is(err, pgx.ErrNoRows) {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}
	return profile, nil
}

func (s *Store) UpsertProfile(ctx context.Context, input models.ProfileInput) (*models.Profile, error) {
	profile := &models.Profile{}
	err := s.pool.QueryRow(ctx, `
		INSERT INTO profile (id, open_to_work, spotify_url, apple_music_url, currently_reading_title, currently_reading_url, github_url, twitter_url, threads_url, linkedin_url, website_url)
		VALUES (1, $1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
		ON CONFLICT (id) DO UPDATE
		SET open_to_work = EXCLUDED.open_to_work,
			spotify_url = EXCLUDED.spotify_url,
			apple_music_url = EXCLUDED.apple_music_url,
			currently_reading_title = EXCLUDED.currently_reading_title,
			currently_reading_url = EXCLUDED.currently_reading_url,
			github_url = EXCLUDED.github_url,
			twitter_url = EXCLUDED.twitter_url,
			threads_url = EXCLUDED.threads_url,
			linkedin_url = EXCLUDED.linkedin_url,
			website_url = EXCLUDED.website_url,
			updated_at = NOW()
		RETURNING id, open_to_work, COALESCE(spotify_url, ''), COALESCE(apple_music_url, ''), COALESCE(currently_reading_title, ''), COALESCE(currently_reading_url, ''), COALESCE(github_url, ''), COALESCE(twitter_url, ''), COALESCE(threads_url, ''), COALESCE(linkedin_url, ''), COALESCE(website_url, ''), updated_at
	`, input.OpenToWork, input.SpotifyURL, input.AppleMusicURL, input.CurrentlyReadingTitle, input.CurrentlyReadingURL, input.GitHubURL, input.TwitterURL, input.ThreadsURL, input.LinkedInURL, input.WebsiteURL).Scan(&profile.ID, &profile.OpenToWork, &profile.SpotifyURL, &profile.AppleMusicURL, &profile.CurrentlyReadingTitle, &profile.CurrentlyReadingURL, &profile.GitHubURL, &profile.TwitterURL, &profile.ThreadsURL, &profile.LinkedInURL, &profile.WebsiteURL, &profile.UpdatedAt)
	if err != nil {
		return nil, err
	}
	return profile, nil
}

func (s *Store) ListWebhookEndpoints(ctx context.Context) ([]models.WebhookEndpoint, error) {
	rows, err := s.pool.Query(ctx, `SELECT id, url, COALESCE(secret, ''), is_active, created_at, updated_at FROM webhook_endpoints ORDER BY created_at ASC`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	items := make([]models.WebhookEndpoint, 0)
	for rows.Next() {
		var item models.WebhookEndpoint
		if err := rows.Scan(&item.ID, &item.URL, &item.Secret, &item.IsActive, &item.CreatedAt, &item.UpdatedAt); err != nil {
			return nil, err
		}
		items = append(items, item)
	}

	return items, rows.Err()
}

func (s *Store) ListActiveWebhookEndpoints(ctx context.Context) ([]models.WebhookEndpoint, error) {
	rows, err := s.pool.Query(ctx, `SELECT id, url, COALESCE(secret, ''), is_active, created_at, updated_at FROM webhook_endpoints WHERE is_active = TRUE ORDER BY created_at ASC`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	items := make([]models.WebhookEndpoint, 0)
	for rows.Next() {
		var item models.WebhookEndpoint
		if err := rows.Scan(&item.ID, &item.URL, &item.Secret, &item.IsActive, &item.CreatedAt, &item.UpdatedAt); err != nil {
			return nil, err
		}
		items = append(items, item)
	}

	return items, rows.Err()
}

func (s *Store) CreateWebhookEndpoint(ctx context.Context, input models.WebhookEndpointInput) (*models.WebhookEndpoint, error) {
	item := &models.WebhookEndpoint{}
	err := s.pool.QueryRow(ctx, `
		INSERT INTO webhook_endpoints (url, secret, is_active)
		VALUES ($1, $2, $3)
		RETURNING id, url, COALESCE(secret, ''), is_active, created_at, updated_at
	`, input.URL, input.Secret, input.IsActive).Scan(&item.ID, &item.URL, &item.Secret, &item.IsActive, &item.CreatedAt, &item.UpdatedAt)
	if err != nil {
		return nil, err
	}
	return item, nil
}

func (s *Store) UpdateWebhookEndpoint(ctx context.Context, id string, input models.WebhookEndpointInput) (*models.WebhookEndpoint, error) {
	item := &models.WebhookEndpoint{}
	err := s.pool.QueryRow(ctx, `
		UPDATE webhook_endpoints
		SET url = $2, secret = $3, is_active = $4, updated_at = NOW()
		WHERE id = $1
		RETURNING id, url, COALESCE(secret, ''), is_active, created_at, updated_at
	`, id, input.URL, input.Secret, input.IsActive).Scan(&item.ID, &item.URL, &item.Secret, &item.IsActive, &item.CreatedAt, &item.UpdatedAt)
	if errors.Is(err, pgx.ErrNoRows) {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}
	return item, nil
}

func (s *Store) DeleteWebhookEndpoint(ctx context.Context, id string) error {
	_, err := s.pool.Exec(ctx, `DELETE FROM webhook_endpoints WHERE id = $1`, id)
	return err
}

func nullableDate(value string) (*time.Time, error) {
	if strings.TrimSpace(value) == "" {
		return nil, nil
	}
	parsed, err := time.Parse("2006-01-02", value)
	if err != nil {
		return nil, fmt.Errorf("invalid end_date: %w", err)
	}
	return &parsed, nil
}

func nullableTimestamp(value string) (*time.Time, error) {
	if strings.TrimSpace(value) == "" {
		return nil, nil
	}
	parsed, err := time.Parse(time.RFC3339, value)
	if err != nil {
		return nil, fmt.Errorf("invalid published_at: %w", err)
	}
	return &parsed, nil
}

// Login Events

func (s *Store) CreateLoginEvent(ctx context.Context, userID, ipAddress, userAgent string) (*models.LoginEvent, error) {
	q := `
		INSERT INTO login_events (user_id, is_active, ip_address, user_agent, last_seen_at, created_at)
		VALUES ($1, true, $2, $3, NOW(), NOW())
		RETURNING id, user_id, is_active, ip_address, user_agent, last_seen_at, created_at
	`
	var evt models.LoginEvent
	err := s.pool.QueryRow(ctx, q, userID, ipAddress, userAgent).Scan(
		&evt.ID, &evt.UserID, &evt.IsActive, &evt.IPAddress, &evt.UserAgent, &evt.LastSeenAt, &evt.CreatedAt,
	)
	if err != nil {
		return nil, fmt.Errorf("create login event: %w", err)
	}
	return &evt, nil
}

func (s *Store) DeactivateLoginEvents(ctx context.Context, userID string) error {
	q := `
		UPDATE login_events
		SET is_active = false, last_seen_at = NOW()
		WHERE user_id = $1 AND is_active = true
	`
	_, err := s.pool.Exec(ctx, q, userID)
	return err
}

func (s *Store) GetLatestLoginEvent(ctx context.Context, userID string) (*models.LoginEvent, error) {
	q := `
		SELECT id, user_id, is_active, ip_address, user_agent, last_seen_at, created_at
		FROM login_events
		WHERE user_id = $1
		ORDER BY last_seen_at DESC
		LIMIT 1
	`
	var evt models.LoginEvent
	err := s.pool.QueryRow(ctx, q, userID).Scan(
		&evt.ID, &evt.UserID, &evt.IsActive, &evt.IPAddress, &evt.UserAgent, &evt.LastSeenAt, &evt.CreatedAt,
	)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, nil // No login event found
		}
		return nil, fmt.Errorf("get latest login event: %w", err)
	}
	return &evt, nil
}

func (s *Store) GetRecentLoginEvents(ctx context.Context, userID string, limit int) ([]models.LoginEvent, error) {
	q := `
		SELECT id, user_id, is_active, ip_address, user_agent, last_seen_at, created_at
		FROM login_events
		WHERE user_id = $1
		ORDER BY last_seen_at DESC
		LIMIT $2
	`
	rows, err := s.pool.Query(ctx, q, userID, limit)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var events []models.LoginEvent
	for rows.Next() {
		var evt models.LoginEvent
		if err := rows.Scan(&evt.ID, &evt.UserID, &evt.IsActive, &evt.IPAddress, &evt.UserAgent, &evt.LastSeenAt, &evt.CreatedAt); err != nil {
			return nil, err
		}
		events = append(events, evt)
	}
	return events, rows.Err()
}
