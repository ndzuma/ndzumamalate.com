import type { Metadata } from "next";
import Image from "next/image";
import InlineProjectLink from "../../components/inline-project-link";
import InlineLink from "../../components/inline-link";
import { TableOfContents } from "./table-of-contents";
import { CmsPreviewCard } from "./cms-preview-card";
import { ArchitectureDiagram } from "./architecture-diagram";
import { DatabaseSchemaGrid } from "./database-schema";
import { DesignSystemShowcase } from "./design-system";

export const metadata: Metadata = {
  title: "This",
  description: "About this website.",
};

export default function ThisPage() {
  return (
    <main className="flex w-full flex-col font-sans text-[#111] max-w-6xl mx-auto pb-24 relative">
      <section className="mt-8 sm:mt-16 max-w-2xl mb-16">
        <h1 className="text-2xl sm:text-3xl font-medium mb-4 tracking-tight">
          this
        </h1>
        <p className="text-base sm:text-lg text-black/60 leading-relaxed mb-4">
          How this site was built, the architecture behind it, and why it exists.
        </p>
        <div className="text-base sm:text-lg text-black/80 leading-relaxed space-y-4">
          <div>
            I built this over a week with the help of <strong>OpenCode</strong> and <strong>Gemini 3.1 Pro Preview</strong>. I designed the systems and architecture, while agents handled boilerplate and rapid prototyping. I stepped in frequently to fix logic, rebuild components, and enforce my style guidelines.
          </div>
          <div>
            This setup is intentionally over-engineered to demonstrate my technical capabilities. The design is heavily inspired by others, and you can find my references in the <a href="#inspirations" className="font-medium text-black bg-blue-100 px-1.5 py-0.5 rounded hover:bg-blue-200 transition-colors">inspirations</a> section below. The website uses Phosphor Icons, and the home screen logo ticker uses Simple Icons.
          </div>
          <div>
            Check out the <InlineProjectLink title="project repo" url="https://github.com/ndzuma/ndzumamalate.com" label="View on Github" />.
          </div>
        </div>
      </section>

      <div className="flex flex-col lg:flex-row gap-16">
        <div className="flex-1 max-w-2xl space-y-24">

          {/* SECTION 1: SYSTEM ARCHITECTURE */}
          <section id="architecture" className="scroll-mt-32">
          <h2 className="text-xl sm:text-2xl font-medium mb-6 tracking-tight flex items-center gap-3">
            <span className="text-black/30">01</span> Architecture & Systems
          </h2>
          <div className="space-y-6 text-black/80 text-base leading-relaxed">
            <p>
              Built as a <strong>Turborepo monorepo</strong> managed by <strong>Bun</strong>. This ensures fast execution and keeps the frontend, CMS, and API tightly coupled for rapid iteration.
            </p>
            <ul className="space-y-4 text-black/70">
              <li className="flex gap-3">
                <span className="text-black/30 mt-1">↳</span>
                <div>
                  <strong>Go API (Echo):</strong> The entire backend runs on Go. I chose this to showcase my comfort with strictly typed, compiled languages and to benefit from its speed and concurrency model. It connects to <strong>PostgreSQL</strong> (via pgx v5) and uses <strong>Redis</strong> for JWT refresh rotation.
                </div>
              </li>
              <li className="flex gap-3">
                <span className="text-black/30 mt-1">↳</span>
                <div>
                  <strong>Custom WebSockets Layer:</strong> Instead of relying on a managed service like Convex (which I use frequently), I built a raw Server-Sent Events / WebSockets layer in Go. I wanted updates made in the CMS to instantly reflect on the public site, while proving I can build real-time infrastructure at a low level.
                </div>
              </li>
              <li className="flex gap-3">
                <span className="text-black/30 mt-1">↳</span>
                <div>
                  <strong>Next.js App Router:</strong> The public-facing site. It consumes the Go REST API, handles caching and ISR, and integrates with <strong>PostHog</strong> for product analytics and <strong>Resend</strong> for communications.
                </div>
              </li>
            </ul>

            {/* Responsive Diagram */}
            <ArchitectureDiagram />

            <div className="mt-8 p-6 rounded-2xl bg-[#fffae6] border border-[#f0e6b4] text-[#8a7222]">
              <h3 className="text-sm font-semibold mb-2 uppercase tracking-widest text-[#a88c2e]">Thoughtful Considerations</h3>
              <p className="text-sm leading-relaxed">
                Is exposing my entire architecture, API routes, and database schema a smart security move? Probably not. It gives potential attackers a literal roadmap of the system. But whatever. The API is secured with strict JWT HTTP-only cookies, password hashing (bcrypt), and proper origin policies. I value transparency and demonstration of skill more than security through obscurity. Well, only in this case. 😂
              </p>
            </div>

          </div>
        </section>

        {/* SECTION 2: API DESIGN */}
        <section id="api-design" className="scroll-mt-32">
          <h2 className="text-xl sm:text-2xl font-medium mb-6 tracking-tight flex items-center gap-3">
            <span className="text-black/30">02</span> API & Routing Design
          </h2>
          <div className="space-y-6 text-black/80 text-base leading-relaxed">
            <p>
              The Go API strictly separates concerns into handlers, db stores, and services. It provides standard REST endpoints consumed by both the Next.js frontend and the Svelte CMS. 
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              <div className="flex flex-col gap-6">
                {/* Public */}
                <div className="p-6 rounded-2xl border border-black/5 bg-black/[0.02]">
                  <h3 className="text-sm font-medium mb-4 text-black/90">Public Routes (v1/public)</h3>
                  <div className="font-mono text-[11px] text-black/60 space-y-2 leading-tight">
                    <div className="flex items-center gap-2"><span className="px-1.5 py-0.5 rounded bg-green-100 text-green-700 font-bold">GET</span> /health (root)</div>
                    <div className="flex items-center gap-2"><span className="px-1.5 py-0.5 rounded bg-green-100 text-green-700 font-bold">GET</span> /projects [/:slug]</div>
                    <div className="flex items-center gap-2"><span className="px-1.5 py-0.5 rounded bg-green-100 text-green-700 font-bold">GET</span> /blogs [/:slug]</div>
                    <div className="flex items-center gap-2"><span className="px-1.5 py-0.5 rounded bg-green-100 text-green-700 font-bold">GET</span> /skills</div>
                    <div className="flex items-center gap-2"><span className="px-1.5 py-0.5 rounded bg-green-100 text-green-700 font-bold">GET</span> /experience</div>
                    <div className="flex items-center gap-2"><span className="px-1.5 py-0.5 rounded bg-green-100 text-green-700 font-bold">GET</span> /profile</div>
                    <div className="flex items-center gap-2"><span className="px-1.5 py-0.5 rounded bg-green-100 text-green-700 font-bold">GET</span> /tags</div>
                    <div className="flex items-center gap-2"><span className="px-1.5 py-0.5 rounded bg-green-100 text-green-700 font-bold">GET</span> /cv/active</div>
                    <div className="flex items-center gap-2"><span className="px-1.5 py-0.5 rounded bg-blue-100 text-blue-700 font-bold">POST</span> /contact</div>
                    <div className="flex items-center gap-2"><span className="px-1.5 py-0.5 rounded bg-purple-100 text-purple-700 font-bold">SSE</span> /events (realtime)</div>
                    <div className="flex items-center gap-2"><span className="px-1.5 py-0.5 rounded bg-green-100 text-green-700 font-bold">GET</span> /f1 (proxy)</div>
                  </div>
                  <div className="pt-3 border-t border-black/5 mt-4 text-[11px] text-black/40">
                    No auth required. Used by Next.js for ISR & static generation. Open to the public.
                  </div>
                </div>

                {/* Auth */}
                <div className="p-6 rounded-2xl border border-black/5 bg-black/[0.02]">
                  <h3 className="text-sm font-medium mb-4 text-black/90">Auth Routes (v1/auth)</h3>
                  <div className="font-mono text-[11px] text-black/60 space-y-2 leading-tight">
                    <div className="flex items-center gap-2"><span className="px-1.5 py-0.5 rounded bg-blue-100 text-blue-700 font-bold">POST</span> /login</div>
                    <div className="flex items-center gap-2"><span className="px-1.5 py-0.5 rounded bg-blue-100 text-blue-700 font-bold">POST</span> /refresh</div>
                    <div className="flex items-center gap-2"><span className="px-1.5 py-0.5 rounded bg-blue-100 text-blue-700 font-bold">POST</span> /logout</div>
                    <div className="flex items-center gap-2"><span className="px-1.5 py-0.5 rounded bg-green-100 text-green-700 font-bold">GET</span> /me</div>
                    <div className="flex items-center gap-2"><span className="px-1.5 py-0.5 rounded bg-green-100 text-green-700 font-bold">GET</span> /activity</div>
                    <div className="flex items-center gap-2"><span className="px-1.5 py-0.5 rounded bg-blue-100 text-blue-700 font-bold">POST</span> /change-password</div>
                  </div>
                  <div className="pt-3 border-t border-black/5 mt-4 text-[11px] text-black/40">
                    Handles login and session state. Issues HTTP-only cookies.
                  </div>
                </div>
              </div>

              {/* Admin */}
              <div className="p-6 rounded-2xl border border-black/5 bg-black/[0.02] flex flex-col">
                <h3 className="text-sm font-medium mb-4 text-black/90">Admin Routes (v1/admin)</h3>
                <div className="font-mono text-[11px] text-black/60 space-y-3 leading-tight flex-1">
                  
                  <div className="flex flex-col gap-1">
                    <div className="flex gap-1.5"><span className="px-1 py-0.5 rounded bg-green-100 text-green-700 font-bold">GET</span><span className="px-1 py-0.5 rounded bg-blue-100 text-blue-700 font-bold">POST</span><span className="px-1 py-0.5 rounded bg-orange-100 text-orange-700 font-bold">PUT</span><span className="px-1 py-0.5 rounded bg-red-100 text-red-700 font-bold">DEL</span></div>
                    <div>/tags [/:id]</div>
                  </div>

                  <div className="flex flex-col gap-1">
                    <div className="flex gap-1.5"><span className="px-1 py-0.5 rounded bg-green-100 text-green-700 font-bold">GET</span><span className="px-1 py-0.5 rounded bg-blue-100 text-blue-700 font-bold">POST</span><span className="px-1 py-0.5 rounded bg-orange-100 text-orange-700 font-bold">PUT</span><span className="px-1 py-0.5 rounded bg-red-100 text-red-700 font-bold">DEL</span></div>
                    <div>/projects [/:id] [/:id/reorder]</div>
                  </div>

                  <div className="flex flex-col gap-1">
                    <div className="flex gap-1.5"><span className="px-1 py-0.5 rounded bg-green-100 text-green-700 font-bold">GET</span><span className="px-1 py-0.5 rounded bg-blue-100 text-blue-700 font-bold">POST</span><span className="px-1 py-0.5 rounded bg-orange-100 text-orange-700 font-bold">PUT</span><span className="px-1 py-0.5 rounded bg-red-100 text-red-700 font-bold">DEL</span></div>
                    <div>/blogs [/:id]</div>
                  </div>

                  <div className="flex flex-col gap-1">
                    <div className="flex gap-1.5"><span className="px-1 py-0.5 rounded bg-green-100 text-green-700 font-bold">GET</span><span className="px-1 py-0.5 rounded bg-blue-100 text-blue-700 font-bold">POST</span><span className="px-1 py-0.5 rounded bg-orange-100 text-orange-700 font-bold">PUT</span><span className="px-1 py-0.5 rounded bg-red-100 text-red-700 font-bold">DEL</span></div>
                    <div>/skills [/:id]</div>
                  </div>

                  <div className="flex flex-col gap-1">
                    <div className="flex gap-1.5"><span className="px-1 py-0.5 rounded bg-green-100 text-green-700 font-bold">GET</span><span className="px-1 py-0.5 rounded bg-blue-100 text-blue-700 font-bold">POST</span><span className="px-1 py-0.5 rounded bg-orange-100 text-orange-700 font-bold">PUT</span><span className="px-1 py-0.5 rounded bg-red-100 text-red-700 font-bold">DEL</span></div>
                    <div>/experience [/:id]</div>
                  </div>

                  <div className="flex flex-col gap-1">
                    <div className="flex gap-1.5"><span className="px-1 py-0.5 rounded bg-green-100 text-green-700 font-bold">GET</span><span className="px-1 py-0.5 rounded bg-blue-100 text-blue-700 font-bold">POST</span><span className="px-1 py-0.5 rounded bg-orange-100 text-orange-700 font-bold">PUT</span><span className="px-1 py-0.5 rounded bg-red-100 text-red-700 font-bold">DEL</span></div>
                    <div>/cv [/:id]</div>
                  </div>

                  <div className="flex flex-col gap-1">
                    <div className="flex gap-1.5"><span className="px-1 py-0.5 rounded bg-green-100 text-green-700 font-bold">GET</span><span className="px-1 py-0.5 rounded bg-blue-100 text-blue-700 font-bold">POST</span><span className="px-1 py-0.5 rounded bg-orange-100 text-orange-700 font-bold">PUT</span><span className="px-1 py-0.5 rounded bg-red-100 text-red-700 font-bold">DEL</span></div>
                    <div>/webhooks [/:id]</div>
                  </div>

                  <div className="flex items-center gap-2 pt-2"><span className="px-1.5 py-0.5 rounded bg-green-100 text-green-700 font-bold">GET</span><span className="px-1.5 py-0.5 rounded bg-orange-100 text-orange-700 font-bold">PUT</span> /profile (upsert)</div>
                  <div className="flex items-center gap-2"><span className="px-1.5 py-0.5 rounded bg-blue-100 text-blue-700 font-bold">POST</span> /upload</div>
                </div>
                <div className="pt-3 border-t border-black/5 mt-4 text-[11px] text-black/40">
                  Requires RS256 JWT in HttpOnly cookies. Used exclusively by the CMS. Do not expose.
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* SECTION 3: THE CMS */}
        <section id="custom-cms" className="scroll-mt-32">
          <h2 className="text-xl sm:text-2xl font-medium mb-6 tracking-tight flex items-center gap-3">
            <span className="text-black/30">03</span> Custom Embedded CMS
          </h2>
          <div className="space-y-6 text-black/80 text-base leading-relaxed">
            <p>
              I built a custom Content Management System using <strong>Svelte 5</strong> and Vite. I had never worked with Svelte prior to this, but picked it to demonstrate my ability to adopt new tools efficiently. It relies on <strong>hash-based routing</strong> to avoid history API conflicts, and the entire production build is embedded straight into the Go API binary using Go's <code>embed</code> package. No separate frontend hosting required for the admin panel.
            </p>

            {/* CMS Previews */}
            <div className="flex flex-col gap-8 mt-8">
              <CmsPreviewCard 
                route="#/dashboard"
                src="https://5qpxxrwjkp.ufs.sh/f/NnmmcSZaZgmnbaXgHSs5XIqnNegTBwEPySRKdH9FZYkVlG7D"
                alt="CMS Dashboard"
              />
              <CmsPreviewCard 
                route="#/editor/project"
                src="https://5qpxxrwjkp.ufs.sh/f/NnmmcSZaZgmnYpwAySGB6idegsExNlF1TjK2ztVPQJkuoHCG"
                alt="CMS Editor"
              />
              <CmsPreviewCard 
                route="#/editor/project/options"
                src="https://5qpxxrwjkp.ufs.sh/f/NnmmcSZaZgmnsCI4tbwTDK0PjnZO3QpC5NarmI862qXtLyvV"
                alt="CMS Editor Options"
              />
            </div>
            <div className="text-center text-xs text-black/40 font-mono mt-2">CMS interface views</div>
          </div>
        </section>

        {/* SECTION 4: DESIGN & COMPONENTS */}
        <section id="design-system" className="scroll-mt-32">
          <h2 className="text-xl sm:text-2xl font-medium mb-6 tracking-tight flex items-center gap-3">
            <span className="text-black/30">04</span> Design System & Components
          </h2>
          <DesignSystemShowcase />
        </section>

        {/* SECTION 5: SITEMAP */}
        <section id="sitemap" className="scroll-mt-32">
          <h2 className="text-xl sm:text-2xl font-medium mb-6 tracking-tight flex items-center gap-3">
            <span className="text-black/30">05</span> Sitemap
          </h2>
          <div className="font-mono text-sm text-black/70 bg-black/[0.02] border border-black/5 p-6 rounded-2xl leading-loose overflow-x-auto">
            <div>/ (Home)</div>
            <div className="pl-6 border-l border-black/10 ml-2">├── /projects</div>
            <div className="pl-12 border-l border-black/10 ml-2 text-black/50">└── /[slug]</div>
            <div className="pl-6 border-l border-black/10 ml-2">├── /experience</div>
            <div className="pl-6 border-l border-black/10 ml-2">├── /stack</div>
            <div className="pl-6 border-l border-black/10 ml-2">├── /blog</div>
            <div className="pl-12 border-l border-black/10 ml-2 text-black/50">└── /[slug]</div>
            <div className="pl-6 border-l border-black/10 ml-2">├── /contact</div>
            <div className="pl-6 border-l border-transparent ml-2">└── /this (you are here)</div>
          </div>
        </section>

        {/* SECTION 6: DATABASE SCHEMA */}
        <section id="database-schema" className="scroll-mt-32">
          <h2 className="text-xl sm:text-2xl font-medium mb-6 tracking-tight flex items-center gap-3">
            <span className="text-black/30">06</span> Database Schema
          </h2>
          <p className="text-black/70 mb-6 text-base leading-relaxed">
            The raw tables powering the backend, extracted from the Go API's SQL migrations.
          </p>
          <DatabaseSchemaGrid />
        </section>

        {/* SECTION 7: INSPIRATIONS */}
        <section id="inspirations" className="scroll-mt-32">
          <h2 className="text-xl sm:text-2xl font-medium mb-6 tracking-tight flex items-center gap-3">
            <span className="text-black/30">07</span> Inspirations
          </h2>
          <div className="space-y-6 text-black/80 text-base leading-relaxed">
            <p className="text-black/70 italic">
              "Good artists copy, great artists steal." The aesthetic and interactive choices on this site were heavily influenced by several incredible designers and engineers:
            </p>
            <ul className="space-y-6 text-black/70">
              <li className="flex gap-3">
                <span className="text-black/30 mt-1">↳</span>
                <div>
                  <div className="mb-1"><InlineLink title="Alex Gilev" url="https://x.com/alexgilev" color="blue" label="Go to profile" iconType="x" /></div>
                  <div className="text-black/60 leading-relaxed text-sm">
                    I saw his posts (<InlineLink title="here" url="https://x.com/alexgilev/status/2033277392790106502?s=20" color="black" label="Go to X post" iconType="x" /> and <InlineLink title="here" url="https://x.com/alexgilev/status/2024906982277124343?s=20" color="black" label="Go to X post" iconType="x" />) and really loved the simplicity. I tried implementing his style mainly in the CMS, but that minimalist DNA naturally carried over to the rest of the site.
                  </div>
                </div>
              </li>
              <li className="flex gap-3">
                <span className="text-black/30 mt-1">↳</span>
                <div>
                  <div className="mb-1"><InlineLink title="Akshit Verma" url="https://x.com/AkshitVrma" color="blue" label="Go to profile" iconType="x" /></div>
                  <div className="text-black/60 leading-relaxed text-sm">
                    His <InlineLink title="post" url="https://x.com/AkshitVrma/status/2031299775015039273?s=20" color="black" label="Go to X post" iconType="x" /> made me realize I don't have to rely on standard static hyperlinks. It inspired me to come up with a more creative, interactive approach to inline references. I definitely borrowed his format for the main description section on the home page.
                  </div>
                </div>
              </li>
              <li className="flex gap-3">
                <span className="text-black/30 mt-1">↳</span>
                <div>
                  <div className="mb-1"><InlineLink title="Onur" url="https://x.com/onuro" color="blue" label="Go to profile" iconType="x" /></div>
                  <div className="text-black/60 leading-relaxed text-sm">
                    I really loved his <InlineLink title="real-time CMS" url="https://x.com/onuro/status/2031515169252094217?s=20" color="black" label="Go to X post" iconType="x" /> built with Convex and Next.js. It looks stunning. I wanted to replicate that vibe but build the real-time layer completely from scratch using standard WebSockets/SSE via Go.
                  </div>
                </div>
              </li>
              <li className="flex gap-3">
                <span className="text-black/30 mt-1">↳</span>
                <div>
                  <div className="mb-1"><InlineLink title="Noah" url="https://x.com/itsnoahd" color="blue" label="Go to profile" iconType="x" /></div>
                  <div className="text-black/60 leading-relaxed text-sm">
                    He posted about his <InlineLink title="simple website" url="https://x.com/itsnoahd/status/2025951246696231407?s=20" color="black" label="Go to X post" iconType="x" /> and I loved that he just had a raw list of his languages and tools. That directly inspired the Stack page on this site, which I then iterated on to make my own.
                  </div>
                </div>
              </li>
              <li className="flex gap-3">
                <span className="text-black/30 mt-1">↳</span>
                <div>
                  <div className="mb-1"><InlineLink title="Ben Davis" url="https://www.youtube.com/@bmdavis419" color="red" label="Go to profile" iconType="youtube" /></div>
                  <div className="text-black/60 leading-relaxed text-sm">
                    His <InlineLink title="video" url="https://youtu.be/MIVpfEKT9qg?si=VY9GbOtOlib5oDfY" color="black" label="Watch video" iconType="youtube" /> particularly convinced me to pick Svelte for my CMS. It got the ball over the line over HTMX, which Prime (<InlineLink title="@ThePrimeagen" url="https://x.com/ThePrimeagen" color="black" label="Go to profile" iconType="x" />) almost swayed me into using.
                  </div>
                </div>
              </li>
            </ul>
          </div>
        </section>

        </div>

        {/* Sidebar TOC */}
        <aside className="hidden lg:block w-64 shrink-0">
          <TableOfContents />
        </aside>

      </div>
    </main>
  );
}

