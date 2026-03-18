import FeaturedCard from "../components/featured-card";
import LogosTicker from "../components/logos-ticker";
import Carousel from "../components/carousel";
import InlineProjectLink from "../components/inline-project-link";
import InlineSocialLink from "../components/inline-social-link";
import InlineEmailLink from "../components/inline-email-link";

const projects = [
  {
    id: 1,
    title: "Agentic UI Framework",
    image: "/assets/project-1-placeholder.jpg",
    published: true
  },
  {
    id: 2,
    title: "Video Gen Workflows",
    image: "/assets/project-2-placeholder.jpg",
    published: true
  },
  {
    id: 3,
    title: "Brand Workshops powered by AI",
    image: "/assets/project-3-placeholder.jpg",
    published: true
  }
];

const blogs = [
  {
    id: 1,
    title: "Crafting Interfaces for Video Gen Workflows",
    date: "Mar 15, 2024",
    image: "/assets/blog-1-placeholder.jpg",
    published: true
  },
  {
    id: 2,
    title: "How Agentic UI is different?",
    date: "Feb 02, 2024",
    image: "/assets/blog-2-placeholder.jpg",
    published: true
  },
  {
    id: 3,
    title: "Thoughts on AI toolings",
    date: "Jan 12, 2024",
    image: "/assets/blog-3-placeholder.jpg",
    published: true
  }
];

export default function Home() {
  const publishedProjects = projects.filter(p => p.published);
  const publishedBlogs = blogs.filter(b => b.published);
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
            
            {/* Open to work pill (Mocked as true) */}
            <div className="flex items-center gap-2 rounded-full border border-black/10 bg-white/60 px-3 py-1 shadow-sm backdrop-blur-xl transition-all hover:bg-black/5 hover:border-black/20 cursor-default">
              <div className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500"></span>
              </div>
              <span className="text-xs font-medium text-black/70 tracking-tight">
                Open to work
              </span>
            </div>
          </div>
          
          <p className="text-sm sm:text-base text-black/50 mb-10">
            London, UK
          </p>

          <div className="space-y-6 text-base sm:text-lg leading-relaxed tracking-tight text-black/80">
            <div>
              I'm a final-year Computer Science & AI student who loves building software late into the night. Whether it's training machine learning models, architecting RAG pipelines, or crafting intuitive user interfaces, I constantly experiment with new ideas to ship faster and solve real problems.
            </div>
            <div>
              Lately, I've been expanding into system-level tools—like building <InlineProjectLink />, an AI-powered security scanning CLI with system tray integration. From winning hackathons under pressure to launching live products, I thrive on turning complex ideas into reality.
            </div>
            <div>
              If you want to connect on an ambitious project, reach out on my <InlineSocialLink /> or shoot me an <InlineEmailLink />.
            </div>
          </div>
        </section>

        {/* Right Side: Logos Ticker */}
        <LogosTicker />

      </div>

      {/* Featured Projects Carousel */}
      <Carousel title="Featured projects">
        {publishedProjects.slice(0, 3).map((project) => (
          <FeaturedCard 
            key={project.id}
            href={`/projects/${project.id}`}
            title={project.title}
            image={project.image}
            className="w-[85vw] sm:w-[400px] lg:w-[480px]"
          />
        ))}
      </Carousel>

      {/* Featured Blogs Carousel */}
      <Carousel title="Featured blogs">
        {publishedBlogs.slice(0, 3).map((blog) => (
          <FeaturedCard 
            key={blog.id}
            href={`/blog/${blog.id}`}
            title={blog.title}
            date={blog.date}
            image={blog.image}
            className="w-[85vw] sm:w-[400px] lg:w-[480px]"
          />
        ))}
      </Carousel>
      
    </main>
  );
}