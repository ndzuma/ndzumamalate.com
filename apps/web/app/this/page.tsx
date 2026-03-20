import type { Metadata } from "next";
import Image from "next/image";
import InlineMusicLink from "../../components/inline-music-link";
import InlineBookLink from "../../components/inline-book-link";
import InlineSocialLink from "../../components/inline-social-link";
import InlineProjectLink from "../../components/inline-project-link";
import InlineLink from "../../components/inline-link";
import FeaturedCard from "../../components/featured-card";
import { InteractiveFilter } from "./interactive-filter";
import { TableOfContents } from "./table-of-contents";
import {
  Database, HardDrives, CodeBlock, AppWindow, UserCircle,
  ArrowLeft, GithubLogo, Globe, ArrowUp
} from "@phosphor-icons/react/dist/ssr";

export const metadata: Metadata = {
  title: "This",
  description: "About this website.",
};

// Dummy profile for component demonstration
const dummyProfile = {
  id: 1,
  name: "Jane Doe",
  bio: "Developer",
  github_url: "https://github.com",
  linkedin_url: "https://linkedin.com",
  twitter_url: "https://twitter.com",
  threads_url: "https://threads.net",
  open_to_work: true,
  created_at: "",
  updated_at: ""
};

export default function ThisPage() {
  return (
    <main className="flex w-full flex-col font-sans text-[#111] max-w-6xl mx-auto pb-24 relative">
      <section className="mt-8 sm:mt-16 max-w-3xl mb-16 px-4 sm:px-0">
        <h1 className="text-2xl sm:text-3xl font-medium mb-4 tracking-tight">
          this
        </h1>
        <p className="text-base sm:text-lg text-black/60 leading-relaxed mb-4">
          How this site was built, the architecture behind it, and why it exists.
        </p>
        <div className="text-base sm:text-lg text-black/80 leading-relaxed space-y-4">
          <p>
            I built this over the course of a week using <strong>OpenCode</strong> as my coding agent, primarily powered by <strong>Gemini 3.1 Pro Preview</strong>. While the architecture and system design were fully thought out by myself, I used agents to write the boilerplate, debug, and rapidly prototype. I still had to step in frequently to fix logic, rebuild components, and correct the model when it missed my specific style guidelines or failed on implementation details.
          </p>
          <p>
            This setup is intentionally over-engineered. It is a public demonstration of my technical capabilities. However, I can't act like the design came purely from my own head—I had ideas from other people. You can find my references in the <a href="#inspirations" className="font-medium text-black bg-blue-100 px-1.5 py-0.5 rounded hover:bg-blue-200 transition-colors">inspirations</a> section below.
          </p>
          <p>
            Check out the <InlineProjectLink title="project repo" url="https://github.com/ndzuma/ndzumamalate.com" label="View on Github" />.
          </p>
        </div>
      </section>

      <div className="flex flex-col lg:flex-row gap-16 px-4 sm:px-0">
        <div className="flex-1 max-w-3xl space-y-24">

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
            <div className="mt-8 p-6 sm:p-8 rounded-3xl border border-black/10 bg-black/[0.02] overflow-hidden">
              <div className="flex flex-col md:flex-row items-center justify-between gap-6 md:gap-4 relative">

                {/* Frontend Side */}
                <div className="flex flex-col gap-4 w-full md:w-auto z-10">
                  <div className="flex items-center gap-4 p-4 bg-white border border-black/10 rounded-2xl shadow-sm w-full md:w-56">
                    <AppWindow className="w-6 h-6 text-black/50" />
                    <div>
                      <div className="text-sm font-medium">Next.js Client</div>
                      <div className="text-xs text-black/50 font-mono">React 19 • App Router</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 p-4 bg-white border border-black/10 rounded-2xl shadow-sm w-full md:w-56">
                    <UserCircle className="w-6 h-6 text-black/50" />
                    <div>
                      <div className="text-sm font-medium">Svelte Admin</div>
                      <div className="text-xs text-black/50 font-mono">Embedded SPA</div>
                    </div>
                  </div>
                </div>

                {/* Connector Lines */}
                <div className="flex md:flex-col items-center justify-center gap-2 text-black/30 font-mono text-[10px] uppercase tracking-widest md:w-24 rotate-90 md:rotate-0 z-0">
                  <span className="bg-black/5 px-2 py-1 rounded">REST API</span>
                  <div className="w-full h-px bg-black/10 border-t border-dashed border-black/20" />
                </div>

                {/* Backend Side */}
                <div className="flex flex-col gap-4 w-full md:w-auto z-10">
                  <div className="flex items-center gap-4 p-4 bg-black text-white border border-black rounded-2xl shadow-md w-full md:w-56 relative overflow-hidden">
                    <div className="absolute inset-0 bg-[radial-gradient(#fff_1px,transparent_1px)] opacity-10 [background-size:8px_8px]" />
                    <CodeBlock className="w-6 h-6 text-white/70 relative z-10" />
                    <div className="relative z-10">
                      <div className="text-sm font-medium">Go Binary</div>
                      <div className="text-xs text-white/50 font-mono">Echo v4 • API Core</div>
                    </div>
                  </div>
                  <div className="flex flex-wrap md:flex-col gap-2 w-full md:w-56">
                    <div className="flex items-center gap-2 text-xs font-mono text-black/60 bg-white border border-black/10 px-3 py-2 rounded-xl flex-1 justify-center">
                      <Database className="w-4 h-4" /> PostgreSQL
                    </div>
                    <div className="flex items-center gap-2 text-xs font-mono text-black/60 bg-white border border-black/10 px-3 py-2 rounded-xl flex-1 justify-center">
                      <HardDrives className="w-4 h-4" /> Redis
                    </div>
                  </div>
                </div>
              </div>
            </div>

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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
              <div className="w-full aspect-[4/3] rounded-2xl bg-black/5 border border-black/10 overflow-hidden relative shadow-sm flex flex-col">
                <div className="h-8 border-b border-black/10 bg-white/50 flex items-center px-4 gap-2">
                  <div className="w-2 h-2 rounded-full bg-red-400" />
                  <div className="w-2 h-2 rounded-full bg-yellow-400" />
                  <div className="w-2 h-2 rounded-full bg-green-400" />
                  <span className="text-[10px] font-mono text-black/40 ml-2">localhost:8080/#/dashboard</span>
                </div>
                <div className="flex-1 p-4 flex gap-4">
                  <div className="w-1/4 h-full bg-black/5 rounded-lg border border-black/5" />
                  <div className="flex-1 h-full bg-white rounded-lg border border-black/5 shadow-sm p-4 flex flex-col gap-3">
                    <div className="w-1/3 h-4 bg-black/10 rounded" />
                    <div className="w-full h-8 bg-black/5 rounded" />
                    <div className="w-full h-8 bg-black/5 rounded" />
                    <div className="w-full h-8 bg-black/5 rounded" />
                  </div>
                </div>
              </div>

              <div className="w-full aspect-[4/3] rounded-2xl bg-black/5 border border-black/10 overflow-hidden relative shadow-sm flex flex-col">
                <div className="h-8 border-b border-black/10 bg-white/50 flex items-center px-4 gap-2">
                  <div className="w-2 h-2 rounded-full bg-red-400" />
                  <div className="w-2 h-2 rounded-full bg-yellow-400" />
                  <div className="w-2 h-2 rounded-full bg-green-400" />
                  <span className="text-[10px] font-mono text-black/40 ml-2">localhost:8080/#/projects/edit</span>
                </div>
                <div className="flex-1 p-4 flex flex-col gap-3 bg-white">
                  <div className="w-1/2 h-6 bg-black/10 rounded" />
                  <div className="w-full h-10 border border-black/10 rounded flex items-center px-2">
                    <span className="text-[10px] text-black/30 font-mono">Title...</span>
                  </div>
                  <div className="w-full flex-1 border border-black/10 rounded p-2">
                    <span className="text-[10px] text-black/30 font-mono">Markdown Content...</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="text-center text-xs text-black/40 font-mono mt-2">Simulated CMS interface views</div>
          </div>
        </section>

        {/* SECTION 4: DESIGN & COMPONENTS */}
        <section id="design-system" className="scroll-mt-32">
          <h2 className="text-xl sm:text-2xl font-medium mb-6 tracking-tight flex items-center gap-3">
            <span className="text-black/30">04</span> Design System & Components
          </h2>
          <div className="space-y-12">
            <p className="text-black/70 leading-relaxed text-base">
              The aesthetic uses the <strong>Geist Sans</strong> font for structure and <strong>Geist Mono</strong> for technical details. Below are the actual components rendering dynamically.
            </p>

            {/* Typography & Colors */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-6 rounded-2xl bg-black/[0.02] border border-black/5 flex items-center gap-6">
                <Image src="/assets/Face logo.svg" alt="Face Logo" width={48} height={48} className="hover:scale-110 hover:rotate-12 transition-transform duration-500" />
                <div>
                  <div className="text-sm font-medium">Primary Logo</div>
                  <div className="text-xs text-black/50 font-mono">SVG vector</div>
                </div>
              </div>
              <div className="p-6 rounded-2xl bg-black/[0.02] border border-black/5 flex flex-col justify-center">
                <div className="text-sm font-medium mb-1">Color Palette</div>
                <div className="flex gap-2">
                  <div className="w-6 h-6 rounded-full bg-[var(--background)] border border-black/10 shadow-inner" title="Background" />
                  <div className="w-6 h-6 rounded-full bg-[var(--foreground)] border border-black/10 shadow-inner" title="Foreground" />
                  <div className="w-6 h-6 rounded-full bg-[var(--muted)] border border-black/10 shadow-inner" title="Muted" />
                  <div className="w-6 h-6 rounded-full bg-black/5 border border-black/10 shadow-inner" title="Lines" />
                </div>
              </div>
            </div>

            {/* Interaction Components */}
            <div className="space-y-6">
              <h3 className="text-sm font-medium text-black/60 uppercase tracking-widest border-b border-black/5 pb-2">Interaction & Layout Components</h3>

              <div className="p-6 sm:p-8 rounded-2xl border border-black/5 bg-white shadow-sm flex flex-col gap-8">

                {/* Navbar mock */}
                <div>
                  <div className="text-xs font-mono text-black/40 mb-3">Floating Navigation (Mocked)</div>
                  <div className="w-full border border-black/10 p-4 rounded-3xl bg-black/5">
                    <div className="flex items-center justify-between w-full">
                      <div className="h-10 w-10 bg-white border border-black/10 rounded-full shadow-sm flex items-center justify-center">
                         <Image src="/assets/Face logo.svg" alt="logo" width={20} height={20} />
                      </div>
                      <div className="hidden sm:flex items-center gap-1 rounded-[1.75rem] border border-black/[0.07] bg-white px-2 py-1.5 shadow-sm">
                        <div className="rounded-full px-3 py-1 text-xs font-medium bg-black text-white">This</div>
                        <div className="rounded-full px-3 py-1 text-xs font-medium text-black/50">Projects</div>
                      </div>
                      <div className="sm:hidden flex h-10 w-10 items-center justify-center rounded-full bg-white border border-black/5 text-black shadow-sm">
                         <div className="w-4 h-[2px] bg-black relative before:absolute before:-top-1.5 before:w-4 before:h-[2px] before:bg-black after:absolute after:top-1.5 after:w-4 after:h-[2px] after:bg-black" />
                      </div>
                      <div className="hidden sm:flex h-10 px-4 items-center justify-center rounded-full bg-white border border-black/5 text-black text-xs font-medium shadow-sm">
                        Contact me
                      </div>
                    </div>
                  </div>
                </div>

                {/* Filter Dropdown */}
                <InteractiveFilter />

                {/* Buttons */}
                <div>
                  <div className="text-xs font-mono text-black/40 mb-3">Action Buttons</div>
                  <div className="flex flex-wrap items-center gap-4">
                    <div className="flex items-center justify-center h-10 w-10 bg-black/5 hover:bg-black/10 text-black rounded-full transition-all cursor-pointer border border-black/5">
                      <ArrowLeft weight="bold" />
                    </div>
                    <div className="flex items-center bg-black/5 text-black rounded-full p-2 pr-4 hover:bg-black/10 transition-all cursor-pointer border border-black/5">
                      <GithubLogo weight="bold" className="w-5 h-5 shrink-0" />
                      <span className="text-sm font-medium ml-2">repo</span>
                    </div>
                    <div className="flex items-center bg-black/5 text-black rounded-full p-2 pr-4 hover:bg-black/10 transition-all cursor-pointer border border-black/5">
                      <Globe weight="bold" className="w-5 h-5 shrink-0" />
                      <span className="text-sm font-medium ml-2">try it</span>
                    </div>
                  </div>
                </div>

                {/* Back to top component mock */}
                <div>
                  <div className="text-xs font-mono text-black/40 mb-3">Back to Top Indicator (Footer style)</div>
                  <div className="p-4 bg-black/[0.02] border border-black/5 rounded-2xl inline-block">
                    <button 
                      className="flex items-center gap-1.5 hover:text-black transition-colors text-black/40"
                    >
                      <span className="text-sm">Back to top</span>
                      <ArrowUp weight="bold" className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Cover Image Component */}
                <div>
                  <div className="text-xs font-mono text-black/40 mb-3">Hero Cover Image (Projects & Blogs)</div>
                  <div className="relative w-full aspect-[16/9] sm:aspect-[21/9] rounded-2xl overflow-hidden bg-black/5 border border-black/10 flex items-end">
                    <div className="absolute inset-0 bg-[radial-gradient(#000_1px,transparent_1px)] opacity-[0.05] [background-size:16px_16px]" />
                    <div className="absolute inset-0 bg-gradient-to-tr from-black/60 via-black/5 to-transparent pointer-events-none" />
                    <div className="relative z-10 p-4 sm:p-6 text-white text-lg sm:text-2xl font-semibold tracking-tight drop-shadow-md">
                      Project Title Overlay
                    </div>
                  </div>
                </div>

                {/* Inline Interactions */}
                <div>
                  <div className="text-xs font-mono text-black/40 mb-3">Inline Micro-components</div>
                  <div className="text-sm text-black/80 leading-relaxed space-y-3">
                    <div>Embedded <InlineSocialLink profile={dummyProfile} /> link.</div>
                    <div>Currently playing <InlineMusicLink spotifyUrl="#" appleMusicUrl="#" />.</div>
                    <div>Referencing <InlineBookLink title="Dune" url="#" /> natively.</div>
                    <div>And internal linking via <InlineProjectLink title="demo" url="#" label="View Demo" />.</div>
                  </div>
                </div>

                {/* Featured Card */}
                <div>
                  <div className="text-xs font-mono text-black/40 mb-3">Featured Card Component</div>
                  <div className="relative max-w-[320px] ml-8 mt-14">
                    {/* Width Indicator */}
                    <div className="absolute -top-6 left-0 right-0 h-[1px] bg-black/10">
                      <div className="absolute -top-1 left-0 w-[1px] h-2 bg-black/20" />
                      <div className="absolute -top-1 right-0 w-[1px] h-2 bg-black/20" />
                      <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-white px-2 text-[10px] font-mono text-black/40 tracking-widest">100% Width</div>
                    </div>
                    
                    {/* Height/Aspect Indicator */}
                    <div className="absolute -left-6 top-0 bottom-0 w-[1px] bg-black/10">
                      <div className="absolute top-0 -left-1 w-2 h-[1px] bg-black/20" />
                      <div className="absolute bottom-0 -left-1 w-2 h-[1px] bg-black/20" />
                      <div className="absolute top-1/2 left-0 -translate-y-1/2 -translate-x-[120%] -rotate-90 bg-white mx-10 text-[10px] font-mono text-black/40 tracking-widest whitespace-nowrap">Aspect 16:9</div>
                    </div>

                    <FeaturedCard
                      href="#"
                      title="Component Demo"
                      date="2026"
                      repoUrl="#"
                      liveUrl="#"
                    />
                  </div>
                </div>

              </div>
            </div>
          </div>
        </section>

        {/* SECTION 5: SITEMAP */}
        <section id="sitemap" className="scroll-mt-32">
          <h2 className="text-xl sm:text-2xl font-medium mb-6 tracking-tight flex items-center gap-3">
            <span className="text-black/30">05</span> Sitemap
          </h2>
          <div className="font-mono text-sm text-black/70 bg-black/[0.02] border border-black/5 p-6 rounded-2xl leading-loose">
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">

            <SchemaTable name="projects">
              <SchemaRow name="id" type="UUID (PK)" />
              <SchemaRow name="title" type="TEXT" />
              <SchemaRow name="slug" type="TEXT (UNIQUE)" />
              <SchemaRow name="summary" type="TEXT" />
              <SchemaRow name="content" type="TEXT" />
              <SchemaRow name="image_url" type="TEXT" />
              <SchemaRow name="live_url" type="TEXT" />
              <SchemaRow name="repo_url" type="TEXT" />
              <SchemaRow name="featured" type="BOOLEAN" />
              <SchemaRow name="published" type="BOOLEAN" />
              <SchemaRow name="sort_order" type="INT" />
              <SchemaRow name="start_date" type="TIMESTAMPTZ" />
              <SchemaRow name="end_date" type="TIMESTAMPTZ" />
              <SchemaRow name="created_at" type="TIMESTAMPTZ" />
              <SchemaRow name="updated_at" type="TIMESTAMPTZ" />
            </SchemaTable>

            <SchemaTable name="experience">
              <SchemaRow name="id" type="UUID (PK)" />
              <SchemaRow name="company" type="TEXT" />
              <SchemaRow name="role" type="TEXT" />
              <SchemaRow name="type" type="TEXT" />
              <SchemaRow name="location" type="TEXT" />
              <SchemaRow name="description" type="TEXT" />
              <SchemaRow name="start_date" type="DATE" />
              <SchemaRow name="end_date" type="DATE" />
              <SchemaRow name="created_at" type="TIMESTAMPTZ" />
              <SchemaRow name="updated_at" type="TIMESTAMPTZ" />
            </SchemaTable>

            <SchemaTable name="blogs">
              <SchemaRow name="id" type="UUID (PK)" />
              <SchemaRow name="title" type="TEXT" />
              <SchemaRow name="slug" type="TEXT (UNIQUE)" />
              <SchemaRow name="summary" type="TEXT" />
              <SchemaRow name="content" type="TEXT" />
              <SchemaRow name="cover_image_url" type="TEXT" />
              <SchemaRow name="published" type="BOOLEAN" />
              <SchemaRow name="published_at" type="TIMESTAMPTZ" />
              <SchemaRow name="created_at" type="TIMESTAMPTZ" />
              <SchemaRow name="updated_at" type="TIMESTAMPTZ" />
            </SchemaTable>

            <SchemaTable name="skills">
              <SchemaRow name="id" type="UUID (PK)" />
              <SchemaRow name="name" type="TEXT" />
              <SchemaRow name="category" type="ENUM" />
              <SchemaRow name="icon_url" type="TEXT" />
              <SchemaRow name="proficiency" type="SMALLINT" />
              <SchemaRow name="sort_order" type="INT" />
              <SchemaRow name="created_at" type="TIMESTAMPTZ" />
            </SchemaTable>

            <SchemaTable name="profile">
              <SchemaRow name="id" type="INT (PK)" />
              <SchemaRow name="open_to_work" type="BOOLEAN" />
              <SchemaRow name="spotify_url" type="TEXT" />
              <SchemaRow name="apple_music_url" type="TEXT" />
              <SchemaRow name="currently_reading_title" type="TEXT" />
              <SchemaRow name="currently_reading_url" type="TEXT" />
              <SchemaRow name="github_url" type="TEXT" />
              <SchemaRow name="twitter_url" type="TEXT" />
              <SchemaRow name="linkedin_url" type="TEXT" />
              <SchemaRow name="website_url" type="TEXT" />
              <SchemaRow name="threads_url" type="TEXT" />
              <SchemaRow name="updated_at" type="TIMESTAMPTZ" />
            </SchemaTable>

            <SchemaTable name="tags">
              <SchemaRow name="id" type="UUID (PK)" />
              <SchemaRow name="name" type="TEXT (UNIQUE)" />
              <SchemaRow name="slug" type="TEXT (UNIQUE)" />
              <SchemaRow name="created_at" type="TIMESTAMPTZ" />
            </SchemaTable>

            <SchemaTable name="admin_users">
              <SchemaRow name="id" type="UUID (PK)" />
              <SchemaRow name="email" type="TEXT (UNIQUE)" />
              <SchemaRow name="password_hash" type="TEXT" />
              <SchemaRow name="last_login_at" type="TIMESTAMPTZ" />
              <SchemaRow name="created_at" type="TIMESTAMPTZ" />
              <SchemaRow name="updated_at" type="TIMESTAMPTZ" />
            </SchemaTable>

            <SchemaTable name="cv">
              <SchemaRow name="id" type="UUID (PK)" />
              <SchemaRow name="file_url" type="TEXT" />
              <SchemaRow name="label" type="TEXT" />
              <SchemaRow name="is_active" type="BOOLEAN (UNIQUE)" />
              <SchemaRow name="uploaded_at" type="TIMESTAMPTZ" />
            </SchemaTable>

            <SchemaTable name="webhook_endpoints">
              <SchemaRow name="id" type="UUID (PK)" />
              <SchemaRow name="url" type="TEXT (UNIQUE)" />
              <SchemaRow name="secret" type="TEXT" />
              <SchemaRow name="is_active" type="BOOLEAN" />
              <SchemaRow name="created_at" type="TIMESTAMPTZ" />
              <SchemaRow name="updated_at" type="TIMESTAMPTZ" />
            </SchemaTable>

            <SchemaTable name="project_tags">
              <SchemaRow name="project_id" type="UUID (FK)" />
              <SchemaRow name="tag_id" type="UUID (FK)" />
              <div className="pt-2 mt-1 border-t border-black/5 text-[10px] text-black/40 text-center">Composite PK</div>
            </SchemaTable>

            <SchemaTable name="blog_tags">
              <SchemaRow name="blog_id" type="UUID (FK)" />
              <SchemaRow name="tag_id" type="UUID (FK)" />
              <div className="pt-2 mt-1 border-t border-black/5 text-[10px] text-black/40 text-center">Composite PK</div>
            </SchemaTable>

          </div>
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
                  <div className="mb-1"><InlineLink title="Alex Gilev" url="https://x.com/alexgilev" color="blue" /></div>
                  <p className="text-black/60 leading-relaxed text-sm">
                    I saw his posts (<InlineLink title="here" url="https://x.com/alexgilev/status/2033277392790106502?s=20" color="gray" label="View Post" /> and <InlineLink title="here" url="https://x.com/alexgilev/status/2024906982277124343?s=20" color="gray" label="View Post" />) and really loved the simplicity. I tried implementing his style mainly in the CMS, but that minimalist DNA naturally carried over to the rest of the site.
                  </p>
                </div>
              </li>
              <li className="flex gap-3">
                <span className="text-black/30 mt-1">↳</span>
                <div>
                  <div className="mb-1"><InlineLink title="Akshit Verma" url="https://x.com/AkshitVrma" color="blue" /></div>
                  <p className="text-black/60 leading-relaxed text-sm">
                    His <InlineLink title="post" url="https://x.com/AkshitVrma/status/2031299775015039273?s=20" color="gray" label="View Post" /> made me realize I don't have to rely on standard static hyperlinks. It inspired me to come up with a more creative, interactive approach to inline references. I definitely borrowed his format for the main description section on the home page.
                  </p>
                </div>
              </li>
              <li className="flex gap-3">
                <span className="text-black/30 mt-1">↳</span>
                <div>
                  <div className="mb-1"><InlineLink title="Onur" url="https://x.com/onuro" color="blue" /></div>
                  <p className="text-black/60 leading-relaxed text-sm">
                    I really loved his <InlineLink title="real-time CMS" url="https://x.com/onuro/status/2031515169252094217?s=20" color="gray" label="View Post" /> built with Convex and Next.js. It looks stunning. I wanted to replicate that vibe but build the real-time layer completely from scratch using standard WebSockets/SSE via Go.
                  </p>
                </div>
              </li>
              <li className="flex gap-3">
                <span className="text-black/30 mt-1">↳</span>
                <div>
                  <div className="mb-1"><InlineLink title="Noah" url="https://x.com/itsnoahd" color="blue" /></div>
                  <p className="text-black/60 leading-relaxed text-sm">
                    He posted about his <InlineLink title="simple website" url="https://x.com/itsnoahd/status/2025951246696231407?s=20" color="gray" label="View Post" /> and I loved that he just had a raw list of his languages and tools. That directly inspired the Stack page on this site, which I then iterated on to make my own.
                  </p>
                </div>
              </li>
              <li className="flex gap-3">
                <span className="text-black/30 mt-1">↳</span>
                <div>
                  <div className="mb-1"><InlineLink title="Ben Davis" url="https://www.youtube.com/@bmdavis419" color="red" label="Watch Video" /></div>
                  <p className="text-black/60 leading-relaxed text-sm">
                    His video particularly convinced me to pick Svelte for my CMS. It got the ball over the line over HTMX, which Prime (<InlineLink title="@ThePrimeagen" url="https://x.com/ThePrimeagen" color="gray" />) almost swayed me into using.
                  </p>
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

// Helper components for DB Schema

function SchemaTable({ name, children }: { name: string, children: React.ReactNode }) {
  return (
    <div className="bg-white border border-black/10 rounded-2xl p-4 shadow-sm font-mono text-xs flex flex-col justify-start h-full">
      <div className="flex items-center gap-2 mb-3 pb-2 border-b border-black/5 text-black font-semibold">
        <Database className="w-4 h-4 text-black/40" /> {name}
      </div>
      <div className="flex flex-col gap-1.5 text-black/60">
        {children}
      </div>
    </div>
  );
}

function SchemaRow({ name, type }: { name: string, type: string }) {
  return (
    <div className="flex justify-between items-center gap-4">
      <span className="text-black/80">{name}</span>
      <span className="text-[10px] text-black/40">{type}</span>
    </div>
  );
}
