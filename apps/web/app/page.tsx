import FeaturedCard from "../components/featured-card";
import LogosTicker from "../components/logos-ticker";
import Carousel from "../components/carousel";

const projects = [
  {
    id: 1,
    title: "Agentic UI Framework",
    image: "/assets/project-1-placeholder.jpg"
  },
  {
    id: 2,
    title: "Video Gen Workflows",
    image: "/assets/project-2-placeholder.jpg"
  },
  {
    id: 3,
    title: "Brand Workshops powered by AI",
    image: "/assets/project-3-placeholder.jpg"
  }
];

const blogs = [
  {
    id: 1,
    title: "Crafting Interfaces for Video Gen Workflows",
    date: "Mar 15, 2024",
    image: "/assets/blog-1-placeholder.jpg"
  },
  {
    id: 2,
    title: "How Agentic UI is different?",
    date: "Feb 02, 2024",
    image: "/assets/blog-2-placeholder.jpg"
  },
  {
    id: 3,
    title: "Thoughts on AI toolings",
    date: "Jan 12, 2024",
    image: "/assets/blog-3-placeholder.jpg"
  }
];

export default function Home() {
  return (
    <main className="flex w-full flex-col font-sans text-[#111] max-w-6xl mx-auto pb-24">
      
      {/* Top 2x1 Grid */}
      <div className="mt-8 sm:mt-16 grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-8 items-center min-h-[400px]">
        
        {/* Left Side: Intro Description Block */}
        <section className="max-w-xl">
          <h1 className="text-xl sm:text-2xl font-medium mb-1 tracking-tight">
            ndzuma malate
          </h1>
          <p className="text-sm sm:text-base text-black/50 mb-10">
            5:38am in Maputo, MZ
          </p>

          <div className="space-y-6 text-base sm:text-lg leading-relaxed tracking-tight text-black/80">
            <p>
              I design interfaces with care and document them on my <a href="#" className="font-medium text-black bg-yellow-100 px-1 rounded hover:bg-yellow-200 transition-colors cursor-pointer">Twitter</a>.
            </p>
            <p>
              I craft interfaces for advanced workflows, trading extensions, and almost everything in between. 
              Design is just where I start. I do whatever it takes to ship something truly polished, and I keep pushing this craft every day.
            </p>
            <p>
              I'm probably tinkering with my agent right now. If you want to get in touch, DM me on <a href="#" className="font-medium text-black bg-yellow-100 px-1 rounded hover:bg-yellow-200 transition-colors cursor-pointer">Telegram</a>, or if you're an SSO connoisseur, <a href="mailto:hello@example.com" className="font-medium text-black bg-yellow-100 px-1 rounded hover:bg-yellow-200 transition-colors cursor-pointer">hello@ndzuma.com</a>.
            </p>
          </div>
        </section>

        {/* Right Side: Logos Ticker */}
        <LogosTicker />

      </div>

      {/* Featured Projects Carousel */}
      <Carousel title="Featured projects">
        {projects.slice(0, 3).map((project) => (
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
        {blogs.slice(0, 3).map((blog) => (
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