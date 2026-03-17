package models

import "time"

type AdminUser struct {
	ID           string     `json:"id"`
	Email        string     `json:"email"`
	PasswordHash string     `json:"-"`
	CreatedAt    time.Time  `json:"created_at"`
	UpdatedAt    time.Time  `json:"updated_at"`
	LastLoginAt  *time.Time `json:"last_login_at,omitempty"`
}

type Tag struct {
	ID        string    `json:"id"`
	Name      string    `json:"name"`
	Slug      string    `json:"slug"`
	CreatedAt time.Time `json:"created_at"`
}

type TagInput struct {
	Name string `json:"name"`
	Slug string `json:"slug"`
}

type Project struct {
	ID        string    `json:"id"`
	Title     string    `json:"title"`
	Slug      string    `json:"slug"`
	Summary   string    `json:"summary,omitempty"`
	Content   string    `json:"content,omitempty"`
	ImageURL  string    `json:"image_url,omitempty"`
	LiveURL   string    `json:"live_url,omitempty"`
	RepoURL   string    `json:"repo_url,omitempty"`
	Featured  bool      `json:"featured"`
	Published bool      `json:"published"`
	SortOrder int       `json:"sort_order"`
	Tags      []string  `json:"tags"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

type ProjectInput struct {
	Title     string   `json:"title"`
	Slug      string   `json:"slug"`
	Summary   string   `json:"summary"`
	Content   string   `json:"content"`
	ImageURL  string   `json:"image_url"`
	LiveURL   string   `json:"live_url"`
	RepoURL   string   `json:"repo_url"`
	Featured  bool     `json:"featured"`
	Published bool     `json:"published"`
	SortOrder int      `json:"sort_order"`
	TagIDs    []string `json:"tag_ids"`
}

type Blog struct {
	ID            string     `json:"id"`
	Title         string     `json:"title"`
	Slug          string     `json:"slug"`
	Summary       string     `json:"summary,omitempty"`
	Content       string     `json:"content,omitempty"`
	CoverImageURL string     `json:"cover_image_url,omitempty"`
	Published     bool       `json:"published"`
	PublishedAt   *time.Time `json:"published_at,omitempty"`
	Tags          []string   `json:"tags"`
	CreatedAt     time.Time  `json:"created_at"`
	UpdatedAt     time.Time  `json:"updated_at"`
}

type BlogInput struct {
	Title         string   `json:"title"`
	Slug          string   `json:"slug"`
	Summary       string   `json:"summary"`
	Content       string   `json:"content"`
	CoverImageURL string   `json:"cover_image_url"`
	Published     bool     `json:"published"`
	PublishedAt   string   `json:"published_at"`
	TagIDs        []string `json:"tag_ids"`
}

type SkillCategory string

const (
	SkillCategoryProgrammingLanguage SkillCategory = "programming_language"
	SkillCategoryFramework           SkillCategory = "framework"
	SkillCategoryDatabase            SkillCategory = "database"
	SkillCategoryTool                SkillCategory = "tool"
	SkillCategorySoftSkill           SkillCategory = "soft_skill"
	SkillCategoryOther               SkillCategory = "other"
)

type Skill struct {
	ID          string        `json:"id"`
	Name        string        `json:"name"`
	Category    SkillCategory `json:"category"`
	IconURL     string        `json:"icon_url,omitempty"`
	Proficiency int16         `json:"proficiency"`
	SortOrder   int           `json:"sort_order"`
	CreatedAt   time.Time     `json:"created_at"`
}

type SkillInput struct {
	Name        string        `json:"name"`
	Category    SkillCategory `json:"category"`
	IconURL     string        `json:"icon_url"`
	Proficiency int16         `json:"proficiency"`
	SortOrder   int           `json:"sort_order"`
}

type Experience struct {
	ID          string     `json:"id"`
	Company     string     `json:"company"`
	Role        string     `json:"role"`
	Location    string     `json:"location,omitempty"`
	Description string     `json:"description,omitempty"`
	StartDate   time.Time  `json:"start_date"`
	EndDate     *time.Time `json:"end_date,omitempty"`
	CreatedAt   time.Time  `json:"created_at"`
	UpdatedAt   time.Time  `json:"updated_at"`
}

type ExperienceInput struct {
	Company     string `json:"company"`
	Role        string `json:"role"`
	Location    string `json:"location"`
	Description string `json:"description"`
	StartDate   string `json:"start_date"`
	EndDate     string `json:"end_date"`
}

type CV struct {
	ID         string    `json:"id"`
	FileURL    string    `json:"file_url"`
	Label      string    `json:"label,omitempty"`
	IsActive   bool      `json:"is_active"`
	UploadedAt time.Time `json:"uploaded_at"`
}

type CVInput struct {
	FileURL  string `json:"file_url"`
	Label    string `json:"label"`
	IsActive bool   `json:"is_active"`
}

type Profile struct {
	ID                    int       `json:"id"`
	OpenToWork            bool      `json:"open_to_work"`
	SpotifyURL            string    `json:"spotify_url,omitempty"`
	AppleMusicURL         string    `json:"apple_music_url,omitempty"`
	CurrentlyReadingTitle string    `json:"currently_reading_title,omitempty"`
	CurrentlyReadingURL   string    `json:"currently_reading_url,omitempty"`
	GitHubURL             string    `json:"github_url,omitempty"`
	TwitterURL            string    `json:"twitter_url,omitempty"`
	LinkedInURL           string    `json:"linkedin_url,omitempty"`
	WebsiteURL            string    `json:"website_url,omitempty"`
	UpdatedAt             time.Time `json:"updated_at"`
}

type ProfileInput struct {
	OpenToWork            bool   `json:"open_to_work"`
	SpotifyURL            string `json:"spotify_url"`
	AppleMusicURL         string `json:"apple_music_url"`
	CurrentlyReadingTitle string `json:"currently_reading_title"`
	CurrentlyReadingURL   string `json:"currently_reading_url"`
	GitHubURL             string `json:"github_url"`
	TwitterURL            string `json:"twitter_url"`
	LinkedInURL           string `json:"linkedin_url"`
	WebsiteURL            string `json:"website_url"`
}

type WebhookEndpoint struct {
	ID        string    `json:"id"`
	URL       string    `json:"url"`
	Secret    string    `json:"secret,omitempty"`
	IsActive  bool      `json:"is_active"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

type WebhookEndpointInput struct {
	URL      string `json:"url"`
	Secret   string `json:"secret"`
	IsActive bool   `json:"is_active"`
}

type ContactMessage struct {
	Name    string `json:"name"`
	Email   string `json:"email"`
	Subject string `json:"subject"`
	Message string `json:"message"`
}

type Event struct {
	Type       string      `json:"type"`
	Resource   string      `json:"resource"`
	Action     string      `json:"action"`
	ResourceID string      `json:"resource_id,omitempty"`
	OccurredAt time.Time   `json:"occurred_at"`
	Payload    interface{} `json:"payload,omitempty"`
}
