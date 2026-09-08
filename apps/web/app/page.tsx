import FeaturedCard from "../components/featured-card";
import LogosTicker from "../components/logos-ticker";
import Carousel from "../components/carousel";
import RichText from "../components/rich-text";
import { api } from "../lib/api";
import { content } from "../lib/content";

export default async function Home() {
  const [home, profile, projects, writings, skills, cv] = await Promise.all([
    content.home(),
    api.getProfile().catch((e) => { console.error("Profile fetch error:", e); return null; }),
    api.getProjects().catch((e) => { console.error("Projects fetch error:", e); return []; }),
    api.getBlogs().catch((e) => { console.error("Writings fetch error:", e); return []; }),
    api.getSkills().catch((e) => { console.error("Skills fetch error:", e); return []; }),
    api.getActiveCV().catch((e) => { console.error("CV fetch error:", e); return null; })
  ]);

  // Projects and writings endpoints already return published=true.
  const featuredProjects = projects?.filter(p => p.featured) || [];
  // If no featured projects, just show the top 3
  const displayProjects = featuredProjects.length > 0 ? featuredProjects : (projects || []).slice(0, 3);
  const displayWritings = (writings || []).slice(0, 3);

  const isOpenToWork = profile?.open_to_work ?? false;
  const ctx = { profile, cv, projects };

  return (
    <main className="flex w-full flex-col font-sans text-[#111] max-w-6xl mx-auto pb-24">

      {/* Top 2x1 Grid */}
      <div className="mt-8 sm:mt-16 grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-8 items-center min-h-[400px]">

        {/* Left Side: Intro Description Block */}
        <section className="max-w-xl">
          <div className="flex items-center gap-4 mb-1">
            <h1 className="text-xl sm:text-2xl font-medium tracking-tight">
              {home.name}
            </h1>

            {isOpenToWork && (
              <div className="flex items-center gap-2 rounded-full border border-black/10 bg-white/60 px-3 py-1 shadow-sm backdrop-blur-xl transition-all hover:bg-black/5 hover:border-black/20 cursor-default">
                <div className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500"></span>
                </div>
                <span className="text-xs font-medium text-black/70 tracking-tight">
                  Open to work
                </span>
              </div>
            )}
          </div>

          <p className="text-sm sm:text-base text-black/50 mb-10">
            {home.location}
          </p>

          <div className="space-y-6 text-base sm:text-lg leading-relaxed tracking-tight text-black/80">
            {home.paragraphs.map((paragraph, index) => (
              <div key={index}>
                <RichText text={paragraph} ctx={ctx} />
              </div>
            ))}
          </div>
        </section>

        {/* Right Side: Logos Ticker */}
        <LogosTicker skills={skills} />

      </div>

      {/* Featured Projects Carousel */}
      {displayProjects.length > 0 && (
        <Carousel title={home.projects_title}>
          {displayProjects.map((project, index) => (
            <FeaturedCard
              key={project.id}
              href={`/projects/${project.slug || project.id}`}
              title={project.title}
              image={project.image_url}
              liveUrl={project.live_url}
              className="w-[85vw] sm:w-[400px] lg:w-[480px]"
              priority={index < 2}
            />
          ))}
        </Carousel>
      )}

      {/* Featured Writings Carousel */}
      {displayWritings.length > 0 && (
        <Carousel title={home.writings_title}>
          {displayWritings.map((writing, index) => (
            <FeaturedCard
              key={writing.id}
              href={`/writings/${writing.slug || writing.id}`}
              title={writing.title}
              date={writing.published_at ? new Date(writing.published_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : undefined}
              image={writing.cover_image_url}
              className="w-[85vw] sm:w-[400px] lg:w-[480px]"
              priority={index < 2}
            />
          ))}
        </Carousel>
      )}

    </main>
  );
}
