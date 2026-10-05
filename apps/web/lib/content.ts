import { api } from "./api";

/**
 * Editable page content. The API stores each page as a JSON document
 * (see migration 008); these defaults mirror the seeded rows so the site
 * renders sensibly even if the API has no row (or is unreachable on a
 * cold start).
 */

export type HomeContent = {
  name: string;
  location: string;
  paragraphs: string[];
  projects_title: string;
  writings_title: string;
};

export type StackSection = { title: string; items: string[] };

export type StackContent = {
  title: string;
  intro: string;
  sections: StackSection[];
};

export type IntroContent = { title: string; intro: string };

export const DEFAULT_HOME: HomeContent = {
  name: "ndzuma malate",
  location: "London, UK",
  paragraphs: [
    "I'm a final-year CS & AI student who builds things. Pulseportfolio is live, {{project:probetool|probeTool}} is in beta, and for my final year project an accessible software for visually impaired professionals. When I'm not coding I'm obsessing over music, learning about finance and rocketry, and I've recently fallen down an {{f1}} rabbit hole.",
    "If you want to connect on an ambitious project, reach out on my {{social}} or shoot me an {{email}}.",
    "Oh I forgot, here's my {{cv}}.",
  ],
  projects_title: "Featured projects",
  writings_title: "Featured writings",
};

export const DEFAULT_STACK: StackContent = {
  title: "stack",
  intro: "A little bit more about my personal interests, the tools I use every day, and what I love building with.",
  sections: [
    {
      title: "Hobbies",
      items: [
        "Playing basketball",
        "Learning about {{tech}}, finance and {{space}}",
        "Obsessing over {{f1:center}} (a recent rabbit hole)",
        "Currently reading {{book}}",
        "Listening to {{music}}",
      ],
    },
    {
      title: "Tooling",
      items: ["**Editor:** Zed", "**Terminal:** Ghostty", "**Design:** Figma", "**Browser:** Zen", "**AI Coding:** Opencode"],
    },
    {
      title: "Choice of model",
      items: [
        "**Day to day:** Gemini 3.1 Pro Preview (sometimes Kimi k2.5)",
        "**Heavy lifting:** OpenAI GPT 5.4 or Claude Sonnet 4.6",
        "**Design/UI:** Claude Opus 4.6",
      ],
    },
    {
      title: "Favourite languages",
      items: [
        "**Python:** For most quick tasks or servers",
        "**Go:** Mainly if I want to make binaries, if I want something fast out of the gate, and concurrent APIs",
        "**TypeScript:** For the web",
      ],
    },
    {
      title: "Favourite stack",
      items: [
        "**Frontend:** Next.js, React, Tailwind CSS, Motion, shadcn",
        "**Backend:** Python (FastAPI), Go (Echo), Postgres, Convex",
        "**Hosting:** Railway (for everything)",
        "**Auth:** Clerk and Better Auth",
        "**Infrastructure:** Cloudflare (domains & email routing), Tailscale (to use services from anywhere)",
        "**Analytics & Icons:** PostHog, Phosphor Icons",
        "**Object Store:** UploadThing or Convex (depending on the project)",
      ],
    },
  ],
};

export const DEFAULT_INTROS: Record<"projects" | "writings" | "experience", IntroContent> = {
  projects: {
    title: "projects",
    intro: "A selection of my recent work, side projects, and ongoing experiments in pushing the boundaries of interface design.",
  },
  writings: {
    title: "writings",
    intro: "Writing about design engineering, building interfaces, and the intersection of human and agent experiences.",
  },
  experience: {
    title: "experience",
    intro: "My professional journey and the technical skills I've picked up along the way.",
  },
};

async function loadPage<T extends object>(key: string, fallback: T): Promise<T> {
  try {
    const page = await api.getPage(key);
    const data = (page?.data ?? {}) as Partial<T>;
    return { ...fallback, ...stripEmpty(data) };
  } catch (error) {
    console.error(`Page content fetch error (${key}):`, error);
    return fallback;
  }
}

function stripEmpty<T extends object>(data: Partial<T>): Partial<T> {
  const out: Partial<T> = {};
  for (const [k, v] of Object.entries(data)) {
    if (v === null || v === undefined) continue;
    if (typeof v === "string" && v.trim() === "") continue;
    (out as Record<string, unknown>)[k] = v;
  }
  return out;
}

export const content = {
  home: () => loadPage<HomeContent>("home", DEFAULT_HOME),
  stack: () => loadPage<StackContent>("stack", DEFAULT_STACK),
  intro: (key: keyof typeof DEFAULT_INTROS) => loadPage<IntroContent>(key, DEFAULT_INTROS[key]),
};
