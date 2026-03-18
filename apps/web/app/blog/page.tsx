import FeaturedCard from "../../components/featured-card";

const allBlogs = [
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
  },
  {
    id: 4,
    title: "Designing for dense data",
    date: "Dec 05, 2023",
    image: "/assets/blog-4-placeholder.jpg"
  }
];

export default function BlogPage() {
  return (
    <main className="flex w-full flex-col font-sans text-[#111] max-w-6xl mx-auto pb-24">
      <section className="mt-8 sm:mt-16 max-w-2xl mb-12">
        <h1 className="text-2xl sm:text-3xl font-medium mb-4 tracking-tight">
          blog
        </h1>
        <p className="text-base sm:text-lg text-black/60 leading-relaxed">
          Writing about design engineering, building interfaces, and the intersection of human and agent experiences.
        </p>
      </section>

      {/* Filter Row */}
      <div className="flex justify-end mb-8 border-b border-black/5 pb-4">
        <div className="flex gap-2 items-center text-sm overflow-x-auto hide-scrollbar">
          <span className="text-black/40 mr-2 shrink-0">Filter by:</span>
          {['All', 'Design', 'Engineering', 'Agents', 'Thoughts'].map(tag => (
            <button key={tag} className="px-3 py-1.5 rounded-full bg-black/5 hover:bg-black/10 text-black/70 transition-colors whitespace-nowrap">
              {tag}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {allBlogs.map((blog) => (
          <FeaturedCard 
            key={blog.id}
            href={`/blog/${blog.id}`}
            title={blog.title}
            date={blog.date}
            image={blog.image}
          />
        ))}
      </div>
    </main>
  );
}
