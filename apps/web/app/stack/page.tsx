import type { Metadata } from "next";
import InlineMusicLink from "../../components/inline-music-link";
import InlineBookLink from "../../components/inline-book-link";
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
              <span>Designing obscure UI interactions</span>
            </li>
            <li className="flex gap-3">
              <span className="text-black/30 mt-1">↳</span>
              <span>Tinkering with AI agent architectures</span>
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
              <span><strong>Editor:</strong> Cursor / VS Code</span>
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
              <span><strong>Browser:</strong> Arc</span>
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
              <span><strong>Daily driver:</strong> Claude 3.5 Sonnet (Best for coding & reasoning)</span>
            </li>
            <li className="flex gap-3">
              <span className="text-black/30 mt-1">↳</span>
              <span><strong>Heavy lifting:</strong> GPT-4o</span>
            </li>
            <li className="flex gap-3">
              <span className="text-black/30 mt-1">↳</span>
              <span><strong>Local/Fast tasks:</strong> Llama 3</span>
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
              <span><strong>TypeScript:</strong> The undisputed king for the web</span>
            </li>
            <li className="flex gap-3">
              <span className="text-black/30 mt-1">↳</span>
              <span><strong>Go:</strong> For fast, reliable, concurrent APIs</span>
            </li>
            <li className="flex gap-3">
              <span className="text-black/30 mt-1">↳</span>
              <span><strong>Python:</strong> For anything AI or script-related</span>
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
              <span><strong>Frontend:</strong> Next.js, React, Tailwind CSS, Motion</span>
            </li>
            <li className="flex gap-3">
              <span className="text-black/30 mt-1">↳</span>
              <span><strong>Backend:</strong> Go (Echo), Postgres (pgx)</span>
            </li>
            <li className="flex gap-3">
              <span className="text-black/30 mt-1">↳</span>
              <span><strong>Hosting:</strong> Vercel (Web), Railway (API/DB)</span>
            </li>
            <li className="flex gap-3">
              <span className="text-black/30 mt-1">↳</span>
              <span><strong>Payments & Edge:</strong> Stripe, Cloudflare</span>
            </li>
          </ul>
        </section>

      </div>
    </main>
  );
}