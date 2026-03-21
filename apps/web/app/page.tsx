import FeaturedCard from "../components/featured-card";
import LogosTicker from "../components/logos-ticker";
import Carousel from "../components/carousel";
import InlineProjectLink from "../components/inline-project-link";
import InlineSocialLink from "../components/inline-social-link";
import InlineEmailLink from "../components/inline-email-link";
import InlineCvLink from "../components/inline-cv-link";
import { api } from "../lib/api";

export default async function Home() {
  const [profile, projects, blogs, skills, cv] = await Promise.all([
    api.getProfile().catch(() => null),
    api.getProjects().catch(() => []),
    api.getBlogs().catch(() => []),
    api.getSkills().catch(() => []),
    api.getActiveCV().catch(() => null)
  ]);

  // Projects and Blogs endpoints already return published=true.
  // For the homepage we show the first few. If you had a 'featured' flag, you could filter by it here:
  const featuredProjects = projects?.filter(p => p.featured) || [];
  // If no featured projects, just show the top 3
  const displayProjects = featuredProjects.length > 0 ? featuredProjects : (projects || []).slice(0, 3);
  const displayBlogs = (blogs || []).slice(0, 3);

  const isOpenToWork = profile?.open_to_work ?? false;

  return (
    <main className="flex w-full flex-col font-sans text-[#111] max-w-6xl mx-auto pb-24">

      {/* Top 2x1 Grid */}
      <div className="mt-8 sm:mt-16 grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-8 items-center min-h-[400px]">

        {/* Left Side: Intro Description Block */}
        <section className="max-w-xl">
          <div className="flex items-center gap-4 mb-1">
            <h1 className="text-xl sm:text-2xl font-medium tracking-tight">
              ndzuma malate
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
            London, UK
          </p>

          <div className="space-y-6 text-base sm:text-lg leading-relaxed tracking-tight text-black/80">
            <div>
              I'm a final-year CS & AI student who builds things. Pulseportfolio is live, <InlineProjectLink /> is in beta, and for my final year project an accessible software for visually impaired professionals. When I'm not coding I'm obsessing over music, learning about geopolitics and rocket engines, and I've recently fallen down an F1 rabbit hole.
            </div>
            <div>
              If you want to connect on an ambitious project, reach out on my <InlineSocialLink profile={profile} /> or shoot me an <InlineEmailLink />.
            </div>
            <div>
              Oh I forgot, here's my <InlineCvLink cv={cv} />.
            </div>
          </div>
        </section>

        {/* Right Side: Logos Ticker */}
        <LogosTicker skills={skills} />

      </div>

      {/* Featured Projects Carousel */}
      {displayProjects.length > 0 && (
        <Carousel title="Featured projects">
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

      {/* Featured Blogs Carousel */}
      {displayBlogs.length > 0 && (
        <Carousel title="Featured blogs">
          {displayBlogs.map((blog, index) => (
            <FeaturedCard
              key={blog.id}
              href={`/blog/${blog.slug || blog.id}`}
              title={blog.title}
              date={blog.published_at ? new Date(blog.published_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : undefined}
              image={blog.cover_image_url}
              className="w-[85vw] sm:w-[400px] lg:w-[480px]"
              priority={index < 2}
            />
          ))}
        </Carousel>
      )}

    </main>
  );
}
