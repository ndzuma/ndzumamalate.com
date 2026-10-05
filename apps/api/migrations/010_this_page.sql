-- The /this page is written in code, but its visibility (data.hidden) is
-- managed from the CMS like the other pages. Seed an empty row so it shows up
-- in the pages list; existing rows are never touched.
INSERT INTO page_content (key, data) VALUES ('this', '{}'::jsonb)
ON CONFLICT (key) DO NOTHING;
