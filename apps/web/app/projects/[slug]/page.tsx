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
    const project = await api.getProjectBySlug(slug);
    return {
      title: project.title,
      description: project.summary,
    };
  } catch {
    return { title: "Project Not Found" };
  }
}

function formatDate(dateStr?: string) {
  if (!dateStr) return "Present";
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
}

export default async function ProjectPage({ params }: Props) {
  const { slug } = await params;
  let project;
  
  try {
    project = await api.getProjectBySlug(slug);
  } catch {
    notFound();
  }

  // Handle resolving tag names if needed, but the API returns tag IDs if not expanded. 
  // Wait, does the API return tag strings or objects? Let's assume strings for now, or just render them.
  // Actually, we should fetch tags to map them if project.tags contains IDs.
  let tagMap: Record<string, string> = {};
  try {
    const allTags = await api.getTags();
    allTags.forEach(t => tagMap[t.id] = t.name);
  } catch (e) {}

  return (
    <main className="flex w-full flex-col font-sans text-[#111] max-w-4xl mx-auto pb-24 mt-8 sm:mt-16">
      
      {/* Top Controls (Above Image) */}
      <div className="flex justify-between items-center mb-6">
        <Link 
          href="/projects" 
          className="flex items-center justify-center h-10 w-10 bg-black/5 hover:bg-black/10 text-black rounded-full transition-all"
          aria-label="Back to projects"
        >
          <ArrowLeft weight="bold" />
        </Link>
        
        {(project.live_url || project.repo_url) && (
          <div className="flex gap-2">
            {project.live_url && (
              <a href={project.live_url} target="_blank" rel="noopener noreferrer" className="px-4 py-2 bg-black/5 hover:bg-black/10 text-black rounded-full text-sm font-medium transition-all">
                Live Site
              </a>
            )}
            {project.repo_url && (
              <a href={project.repo_url} target="_blank" rel="noopener noreferrer" className="px-4 py-2 bg-black text-white hover:bg-black/80 rounded-full text-sm font-medium transition-all">
                Source Code
              </a>
            )}
          </div>
        )}
      </div>

      {/* Cover Image & Header Layout */}
      <div className="relative w-full aspect-[16/9] rounded-2xl overflow-hidden mb-8 bg-black/5">
        {project.image_url && (
          <Image 
            src={project.image_url} 
            alt={project.title} 
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
            {project.title}
          </h1>
        </div>
      </div>

      {/* Meta: Tags and Date (Plain text on one line) */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div className="text-sm font-medium text-black/60">
          {project.tags?.map((t) => tagMap[t] || t).join(" · ") || "No tags"}
        </div>
        
        {(project.start_date || project.end_date) && (
          <div className="text-sm font-mono text-black/50">
            {formatDate(project.start_date)} — {formatDate(project.end_date)}
          </div>
        )}
      </div>

      <hr className="border-black/10 mb-6" />

      {/* Summary */}
      {project.summary && (
        <div className="mb-6">
          <span className="block text-xs font-semibold text-black/40 uppercase tracking-wider mb-2">
            Short description
          </span>
          <p className="text-lg md:text-xl font-medium text-black/80 leading-relaxed">
            {project.summary}
          </p>
        </div>
      )}

      <hr className="border-black/10 mb-8" />

      {/* Content */}
      {project.content ? (
        <article className="prose prose-neutral prose-a:text-black hover:prose-a:text-black/70 prose-a:underline-offset-4 prose-img:rounded-xl max-w-none">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {project.content}
          </ReactMarkdown>
        </article>
      ) : (
        <p className="text-black/50 italic">No content available for this project.</p>
      )}

    </main>
  );
}