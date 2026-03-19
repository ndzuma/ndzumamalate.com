import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft } from "@phosphor-icons/react/dist/ssr";
import { api } from "../../../lib/api";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { Metadata } from "next";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  try {
    const blog = await api.getBlogBySlug(slug);
    return {
      title: blog.title,
      description: blog.summary,
    };
  } catch {
    return { title: "Blog Not Found" };
  }
}

function formatDate(dateStr?: string) {
  if (!dateStr) return "Unknown Date";
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
}

export default async function BlogPage({ params }: Props) {
  const { slug } = await params;
  let blog;
  
  try {
    blog = await api.getBlogBySlug(slug);
  } catch {
    notFound();
  }

  let tagMap: Record<string, string> = {};
  try {
    const allTags = await api.getTags();
    allTags.forEach(t => tagMap[t.id] = t.name);
  } catch (e) {}

  return (
    <main className="flex w-full flex-col font-sans text-[#111] max-w-4xl mx-auto pb-24 mt-6 sm:mt-10">
      
      {/* Top Controls (Above Image) */}
      <div className="flex justify-between items-center mb-6">
        <Link 
          href="/blog" 
          className="flex items-center justify-center h-10 w-10 bg-black/5 hover:bg-black/10 text-black rounded-full transition-all"
          aria-label="Back to blog"
        >
          <ArrowLeft weight="bold" />
        </Link>
      </div>

      {/* Cover Image & Header Layout */}
      <div className="relative w-full aspect-[16/9] rounded-2xl overflow-hidden mb-8 bg-black/5">
        {blog.cover_image_url && (
          <Image 
            src={blog.cover_image_url} 
            alt={blog.title} 
            fill 
            className="object-cover"
            priority
          />
        )}
        
        {/* Soft diffused gradient from bottom left */}
        <div className="absolute inset-0 bg-gradient-to-tr from-black/80 via-black/10 to-transparent pointer-events-none" />
        
        {/* Title bottom left, pure text */}
        <div className="absolute bottom-4 left-4 md:bottom-6 md:left-6 z-10 max-w-[85%]">
          <h1 className="text-xl md:text-3xl font-semibold tracking-tight text-white drop-shadow-md">
            {blog.title}
          </h1>
        </div>
      </div>

      {/* Meta: Tags and Date (Plain text on one line) */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div className="text-sm font-medium text-black/60">
          {blog.tags?.map((t) => tagMap[t] || t).join(" · ") || "No tags"}
        </div>
        
        {blog.published_at && (
          <div className="text-sm font-mono text-black/50">
            {formatDate(blog.published_at)}
          </div>
        )}
      </div>

      <hr className="border-black/10 mb-6" />

      {/* Summary */}
      {blog.summary && (
        <div className="mb-6">
          <span className="block text-xs font-semibold text-black/40 uppercase tracking-wider mb-2">
            Short description
          </span>
          <p className="text-lg md:text-xl font-medium text-black/80 leading-relaxed">
            {blog.summary}
          </p>
        </div>
      )}

      <hr className="border-black/10 mb-8" />

      {/* Content */}
      {blog.content ? (
        <article className="prose prose-neutral prose-a:text-black hover:prose-a:text-black/70 prose-a:underline-offset-4 prose-img:rounded-xl max-w-none">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {blog.content}
          </ReactMarkdown>
        </article>
      ) : (
        <p className="text-black/50 italic">No content available for this blog post.</p>
      )}

    </main>
  );
}