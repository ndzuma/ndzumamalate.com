import BlogClient from "../../components/blog-client";
import { api } from "../../lib/api";

export const metadata = {
  title: "Blog",
  description: "Writing about design engineering, building interfaces, and the intersection of human and agent experiences.",
};

export default async function BlogPage() {
  const allBlogs = await api.getBlogs() || [];

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

      <BlogClient initialBlogs={allBlogs} />
    </main>
  );
}
