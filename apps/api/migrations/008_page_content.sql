-- Editable page content (homepage, stack page, section intros).
-- Stored as JSONB documents keyed by page so the frontend can render
-- rich text with inline widget tokens like {{f1}} or {{project:slug}}.
CREATE TABLE IF NOT EXISTS page_content (
  key TEXT PRIMARY KEY,
  data JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DROP TRIGGER IF EXISTS trg_page_content_updated_at ON page_content;
CREATE TRIGGER trg_page_content_updated_at
  BEFORE UPDATE ON page_content FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- Seed with the content that used to be hard-coded in the Next.js app so the
-- site renders identically after this migration. Existing rows are never touched.
INSERT INTO page_content (key, data) VALUES
('home', $json$
{
  "name": "ndzuma malate",
  "location": "London, UK",
  "paragraphs": [
    "I'm a final-year CS & AI student who builds things. Pulseportfolio is live, {{project:probetool|probeTool}} is in beta, and for my final year project an accessible software for visually impaired professionals. When I'm not coding I'm obsessing over music, learning about finance and rocketry, and I've recently fallen down an {{f1}} rabbit hole.",
    "If you want to connect on an ambitious project, reach out on my {{social}} or shoot me an {{email}}.",
    "Oh I forgot, here's my {{cv}}."
  ],
  "projects_title": "Featured projects",
  "writings_title": "Featured writings"
}
$json$::jsonb),
('stack', $json$
{
  "title": "stack",
  "intro": "A little bit more about my personal interests, the tools I use every day, and what I love building with.",
  "sections": [
    {
      "title": "Hobbies",
      "items": [
        "Playing basketball",
        "Learning about {{tech}}, finance and {{space}}",
        "Obsessing over {{f1:center}} (a recent rabbit hole)",
        "Currently reading {{book}}",
        "Listening to {{music}}"
      ]
    },
    {
      "title": "Tooling",
      "items": [
        "**Editor:** Zed",
        "**Terminal:** Ghostty",
        "**Design:** Figma",
        "**Browser:** Zen",
        "**AI Coding:** Opencode"
      ]
    },
    {
      "title": "Choice of model",
      "items": [
        "**Day to day:** Gemini 3.1 Pro Preview (sometimes Kimi k2.5)",
        "**Heavy lifting:** OpenAI GPT 5.4 or Claude Sonnet 4.6",
        "**Design/UI:** Claude Opus 4.6"
      ]
    },
    {
      "title": "Favourite languages",
      "items": [
        "**Python:** For most quick tasks or servers",
        "**Go:** Mainly if I want to make binaries, if I want something fast out of the gate, and concurrent APIs",
        "**TypeScript:** For the web"
      ]
    },
    {
      "title": "Favourite stack",
      "items": [
        "**Frontend:** Next.js, React, Tailwind CSS, Motion, shadcn",
        "**Backend:** Python (FastAPI), Go (Echo), Postgres, Convex",
        "**Hosting:** Railway (for everything)",
        "**Auth:** Clerk and Better Auth",
        "**Infrastructure:** Cloudflare (domains & email routing), Tailscale (to use services from anywhere)",
        "**Analytics & Icons:** PostHog, Phosphor Icons",
        "**Object Store:** UploadThing or Convex (depending on the project)"
      ]
    }
  ]
}
$json$::jsonb),
('projects', $json$
{
  "title": "projects",
  "intro": "A selection of my recent work, side projects, and ongoing experiments in pushing the boundaries of interface design."
}
$json$::jsonb),
('writings', $json$
{
  "title": "writings",
  "intro": "Writing about design engineering, building interfaces, and the intersection of human and agent experiences."
}
$json$::jsonb),
('experience', $json$
{
  "title": "experience",
  "intro": "My professional journey and the technical skills I've picked up along the way."
}
$json$::jsonb)
ON CONFLICT (key) DO NOTHING;
