import type { Metadata } from "next";
import InlineMusicLink from "../../components/inline-music-link";
import InlineBookLink from "../../components/inline-book-link";
import InlineTechLink from "../../components/inline-tech-link";
import InlineF1Widget from "../../components/inline-f1-widget";
import { api } from "../../lib/api";

export const metadata: Metadata = {
  title: "Stack",
  description: "More about my hobbies, tooling, and favourite stacks.",
};

export default async function StackPage() {
  const profile = await api.getProfile().catch(() => null);

  return (
    <main className="flex w-full flex-col font-sans text-[#111] max-w-6xl mx-auto pb-24">
      <section className="mt-8 sm:mt-16 max-w-2xl mb-12">
        <h1 className="text-2xl sm:text-3xl font-medium mb-4 tracking-tight">
          stack
        </h1>
        <p className="text-base sm:text-lg text-black/60 leading-relaxed">
          A little bit more about my personal interests, the tools I use every day, and what I love building with.
        </p>
      </section>

      <div className="max-w-2xl space-y-16">
        
        {/* Section: Hobbies */}
        <section>
          <h2 className="text-xl sm:text-2xl font-medium mb-6 tracking-tight flex items-center gap-3">
            <span className="text-black/30">01</span> Hobbies
          </h2>
          <ul className="space-y-3 text-black/80 text-base sm:text-lg">
            <li className="flex gap-3">
              <span className="text-black/30 mt-1">↳</span>
              <span>Playing basketball</span>
            </li>
            <li className="flex gap-3">
              <span className="text-black/30 mt-1">↳</span>
              <span>Music — specifically amapiano, afro house, and old school R&B</span>
            </li>
            <li className="flex gap-3">
              <span className="text-black/30 mt-1">↳</span>
              <span>Learning about <InlineTechLink />, finance, geopolitics, and Rocketry</span>
            </li>
            <li className="flex gap-3">
              <span className="text-black/30 mt-1">↳</span>
              <span>Obsessing over <InlineF1Widget align="center" /> (a recent rabbit hole)</span>
            </li>
            {profile?.currently_reading_title && profile?.currently_reading_url && (
              <li className="flex gap-3 text-black/80">
                <span className="text-black/30 mt-1">↳</span>
                <span>
                  Currently reading <InlineBookLink title={profile.currently_reading_title} url={profile.currently_reading_url} />
                </span>
              </li>
            )}
            {(profile?.spotify_url || profile?.apple_music_url) && (
              <li className="flex gap-3 text-black/80">
                <span className="text-black/30 mt-1">↳</span>
                <span className="flex items-center gap-1.5 flex-wrap">
                  Listening to <InlineMusicLink spotifyUrl={profile.spotify_url} appleMusicUrl={profile.apple_music_url} />
                </span>
              </li>
            )}
          </ul>
        </section>

        {/* Section: Tooling */}
        <section>
          <h2 className="text-xl sm:text-2xl font-medium mb-6 tracking-tight flex items-center gap-3">
            <span className="text-black/30">02</span> Tooling
          </h2>
          <ul className="space-y-3 text-black/80 text-base sm:text-lg">
            <li className="flex gap-3">
              <span className="text-black/30 mt-1">↳</span>
              <span><strong>Editor:</strong> Zed</span>
            </li>
            <li className="flex gap-3">
              <span className="text-black/30 mt-1">↳</span>
              <span><strong>Terminal:</strong> Ghostty</span>
            </li>
            <li className="flex gap-3">
              <span className="text-black/30 mt-1">↳</span>
              <span><strong>Design:</strong> Figma</span>
            </li>
            <li className="flex gap-3">
              <span className="text-black/30 mt-1">↳</span>
              <span><strong>Browser:</strong> Zen</span>
            </li>
            <li className="flex gap-3">
              <span className="text-black/30 mt-1">↳</span>
              <span><strong>AI Coding:</strong> Opencode</span>
            </li>
          </ul>
        </section>

        {/* Section: Choice of model */}
        <section>
          <h2 className="text-xl sm:text-2xl font-medium mb-6 tracking-tight flex items-center gap-3">
            <span className="text-black/30">03</span> Choice of model
          </h2>
          <ul className="space-y-3 text-black/80 text-base sm:text-lg">
            <li className="flex gap-3">
              <span className="text-black/30 mt-1">↳</span>
              <span><strong>Day to day:</strong> Gemini 3.1 Pro Preview (sometimes Kimi k2.5)</span>
            </li>
            <li className="flex gap-3">
              <span className="text-black/30 mt-1">↳</span>
              <span><strong>Heavy lifting:</strong> OpenAI GPT 5.4 or Claude Sonnet 4.6</span>
            </li>
            <li className="flex gap-3">
              <span className="text-black/30 mt-1">↳</span>
              <span><strong>Design/UI:</strong> Claude Opus 4.6</span>
            </li>
          </ul>
        </section>

        {/* Section: Favourite languages */}
        <section>
          <h2 className="text-xl sm:text-2xl font-medium mb-6 tracking-tight flex items-center gap-3">
            <span className="text-black/30">04</span> Favourite languages
          </h2>
          <ul className="space-y-3 text-black/80 text-base sm:text-lg">
            <li className="flex gap-3">
              <span className="text-black/30 mt-1">↳</span>
              <span><strong>Python:</strong> For most quick tasks or servers</span>
            </li>
            <li className="flex gap-3">
              <span className="text-black/30 mt-1">↳</span>
              <span><strong>Go:</strong> Mainly if I want to make binaries, if I want something fast out of the gate, and concurrent APIs</span>
            </li>
            <li className="flex gap-3">
              <span className="text-black/30 mt-1">↳</span>
              <span><strong>TypeScript:</strong> For the web</span>
            </li>
          </ul>
        </section>

        {/* Section: Favourite stack */}
        <section>
          <h2 className="text-xl sm:text-2xl font-medium mb-6 tracking-tight flex items-center gap-3">
            <span className="text-black/30">05</span> Favourite stack
          </h2>
          <ul className="space-y-3 text-black/80 text-base sm:text-lg">
            <li className="flex gap-3">
              <span className="text-black/30 mt-1">↳</span>
              <span><strong>Frontend:</strong> Next.js, React, Tailwind CSS, Motion, shadcn</span>
            </li>
            <li className="flex gap-3">
              <span className="text-black/30 mt-1">↳</span>
              <span><strong>Backend:</strong> Python (FastAPI), Go (Echo), Postgres, Convex</span>
            </li>
            <li className="flex gap-3">
              <span className="text-black/30 mt-1">↳</span>
              <span><strong>Hosting:</strong> Railway (for everything)</span>
            </li>
            <li className="flex gap-3">
              <span className="text-black/30 mt-1">↳</span>
              <span><strong>Auth:</strong> Clerk and Better Auth</span>
            </li>
            <li className="flex gap-3">
              <span className="text-black/30 mt-1">↳</span>
              <span><strong>Infrastructure:</strong> Cloudflare (domains & email routing), Tailscale (to use services from anywhere)</span>
            </li>
            <li className="flex gap-3">
              <span className="text-black/30 mt-1">↳</span>
              <span><strong>Analytics & Icons:</strong> PostHog, Phosphor Icons</span>
            </li>
            <li className="flex gap-3">
              <span className="text-black/30 mt-1">↳</span>
              <span><strong>Object Store:</strong> UploadThing or Convex (depending on the project)</span>
            </li>
          </ul>
        </section>

      </div>
    </main>
  );
}