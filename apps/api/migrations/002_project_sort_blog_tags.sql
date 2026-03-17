-- Add sort_order to projects for manual ordering
ALTER TABLE projects ADD COLUMN IF NOT EXISTS sort_order INT DEFAULT 0;

-- Add blog_tags join table for tagging blogs
CREATE TABLE IF NOT EXISTS blog_tags (
  blog_id UUID REFERENCES blogs(id) ON DELETE CASCADE,
  tag_id UUID REFERENCES tags(id) ON DELETE CASCADE,
  PRIMARY KEY (blog_id, tag_id)
);
