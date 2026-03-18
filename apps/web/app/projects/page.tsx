import FeaturedCard from "../../components/featured-card";

const allProjects = [
  {
    id: 1,
    title: "Agentic UI Framework",
    image: "/assets/project-1-placeholder.jpg",
    repoUrl: "https://github.com",
    liveUrl: "https://vercel.com"
  },
  {
    id: 2,
    title: "Video Gen Workflows",
    image: "/assets/project-2-placeholder.jpg",
    repoUrl: "https://github.com",
    liveUrl: "https://vercel.com"
  },
  {
    id: 3,
    title: "Brand Workshops powered by AI",
    image: "/assets/project-3-placeholder.jpg",
    repoUrl: "https://github.com"
  },
  {
    id: 4,
    title: "Trading Extensions",
    image: "/assets/project-4-placeholder.jpg",
    liveUrl: "https://vercel.com"
  }
];

export default function ProjectsPage() {
  return (
    <main className="flex w-full flex-col font-sans text-[#111] max-w-6xl mx-auto pb-24">
      <section className="mt-8 sm:mt-16 max-w-2xl mb-12">
        <h1 className="text-2xl sm:text-3xl font-medium mb-4 tracking-tight">
          projects
        </h1>
        <p className="text-base sm:text-lg text-black/60 leading-relaxed">
          A selection of my recent work, side projects, and ongoing experiments in pushing the boundaries of interface design.
        </p>
      </section>

      {/* Filter Row */}
      <div className="flex justify-end mb-8 border-b border-black/5 pb-4">
        <div className="flex gap-2 items-center text-sm overflow-x-auto hide-scrollbar">
          <span className="text-black/40 mr-2 shrink-0">Filter by:</span>
          {['All', 'Next.js', 'AI/ML', 'Design', 'Fintech'].map(tag => (
            <button key={tag} className="px-3 py-1.5 rounded-full bg-black/5 hover:bg-black/10 text-black/70 transition-colors whitespace-nowrap">
              {tag}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {allProjects.map((project) => (
          <FeaturedCard 
            key={project.id}
            href={`/projects/${project.id}`}
            title={project.title}
            image={project.image}
            repoUrl={project.repoUrl}
            liveUrl={project.liveUrl}
          />
        ))}
      </div>
    </main>
  );
}
