import Image from "next/image";
import InlineMusicLink from "../../components/inline-music-link";
import InlineBookLink from "../../components/inline-book-link";
import InlineSocialLink from "../../components/inline-social-link";
import InlineProjectLink from "../../components/inline-project-link";
import InlineTechLink from "../../components/inline-tech-link";
import InlineEmailLink from "../../components/inline-email-link";
import InlineCvLink from "../../components/inline-cv-link";
import InlineF1Widget from "../../components/inline-f1-widget";
import FeaturedCard from "../../components/featured-card";
import { InteractiveFilter } from "./interactive-filter";
import LogosTicker from "../../components/logos-ticker";
import Carousel from "../../components/carousel";
import ContactForm from "../../components/contact-form";
import { ExperienceDescription } from "../../components/experience-description";
import { ArrowLeft, GithubLogo, Globe, ArrowUp } from "@phosphor-icons/react/dist/ssr";

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

const dummyCv = {
  id: "1",
  file_url: "#",
  label: "Resume.pdf",
  is_active: true,
  uploaded_at: "",
};

const dummySkills = [
  { id: "1", name: "TypeScript", category: "programming_language", icon_url: "https://cdn.simpleicons.org/typescript", proficiency: 100, sort_order: 1, created_at: "" },
  { id: "2", name: "React", category: "framework", icon_url: "https://cdn.simpleicons.org/react", proficiency: 100, sort_order: 2, created_at: "" },
  { id: "3", name: "Next.js", category: "framework", icon_url: "https://cdn.simpleicons.org/nextdotjs", proficiency: 100, sort_order: 3, created_at: "" },
  { id: "4", name: "Go", category: "programming_language", icon_url: "https://cdn.simpleicons.org/go", proficiency: 100, sort_order: 4, created_at: "" },
  { id: "5", name: "PostgreSQL", category: "database", icon_url: "https://cdn.simpleicons.org/postgresql", proficiency: 100, sort_order: 5, created_at: "" },
  { id: "6", name: "Redis", category: "database", icon_url: "https://cdn.simpleicons.org/redis", proficiency: 100, sort_order: 6, created_at: "" },
  { id: "7", name: "Bun", category: "tool", icon_url: "https://cdn.simpleicons.org/bun", proficiency: 100, sort_order: 7, created_at: "" },
  { id: "8", name: "Tailwind", category: "tool", icon_url: "https://cdn.simpleicons.org/tailwindcss", proficiency: 100, sort_order: 8, created_at: "" },
] as const;

export function DesignSystemShowcase() {
  return (
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
              <div>Internal linking via <InlineProjectLink title="demo" url="#" label="View Demo" />.</div>
              <div>Discussing <InlineTechLink /> and reaching out via <InlineEmailLink />.</div>
              <div>Downloading the active <InlineCvLink cv={dummyCv} />.</div>
              <div>Checking the latest <InlineF1Widget align="center" /> standings.</div>
            </div>
          </div>

          {/* Featured Card */}
          <div>
            <div className="text-xs font-mono text-black/40 mb-3">Featured Card Component</div>
            <div className="relative w-[85%] sm:w-full max-w-[320px] ml-8 mt-14">
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

          {/* Logos Ticker */}
          <div>
            <div className="text-xs font-mono text-black/40 mb-3">Infinite Logos Ticker</div>
            <div className="relative w-full border border-black/5 bg-black/[0.02] rounded-2xl py-8 overflow-hidden">
              <LogosTicker skills={dummySkills as any} />
            </div>
          </div>

          {/* Carousel */}
          <div>
            <div className="text-xs font-mono text-black/40 mb-3">Scrollable Carousel</div>
            <div className="relative w-full border border-black/5 bg-black/[0.02] rounded-2xl p-4 sm:p-6 overflow-hidden">
              <Carousel title="Demo Carousel" className="w-full">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="flex-none w-[200px] aspect-square rounded-xl bg-white border border-black/10 shadow-sm flex items-center justify-center text-black/40 font-mono text-sm">
                    Item {i + 1}
                  </div>
                ))}
              </Carousel>
            </div>
          </div>

          {/* Experience Description */}
          <div>
            <div className="text-xs font-mono text-black/40 mb-3">Expandable Text (Experience)</div>
            <div className="relative w-full border border-black/5 bg-black/[0.02] rounded-2xl p-6">
              <ExperienceDescription description="This is a really long experience description that demonstrates how the component truncates text by default but allows the user to expand it to read the full context. It's particularly useful for the experience timeline where brevity is preferred initially, but detail is available for those who are interested." />
            </div>
          </div>

          {/* Contact Form */}
          <div>
            <div className="text-xs font-mono text-black/40 mb-3">Contact Form</div>
            <div className="relative w-full max-w-md border border-black/5 bg-black/[0.02] rounded-2xl p-6 sm:p-8">
              <ContactForm />
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}