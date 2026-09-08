import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, GithubLogo, Globe } from "@phosphor-icons/react/dist/ssr";
import { api, ApiError } from "../../../lib/api";
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
  if (!dateStr) return "present";
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }).toLowerCase();
}

export default async function ProjectPage({ params }: Props) {
  const { slug } = await params;
  let project;

  try {
    project = await api.getProjectBySlug(slug);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) notFound();
    throw error;
  }

  // The API returns tag slugs; map them to display names.
  const tagMap: Record<string, string> = {};
  try {
    const allTags = await api.getTags();
    allTags.forEach(t => {
      tagMap[t.id] = t.name;
      tagMap[t.slug] = t.name;
    });
  } catch {}

  const displayTags = project.tags || [];

  return (
    <main className="flex w-full flex-col font-sans text-[#111] max-w-4xl mx-auto pb-24 mt-6 sm:mt-10">

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
            {project.repo_url && (
              <a
                href={project.repo_url}
                target="_blank"
                rel="noopener noreferrer"
                className="group/btn flex items-center bg-black/5 text-black rounded-full p-2 pr-4 hover:bg-black/10 hover:scale-[1.05] hover:-rotate-2 transition-all duration-300"
                title="Go to repo"
              >
                <GithubLogo weight="bold" className="w-5 h-5 shrink-0" />
                <span className="text-sm font-medium whitespace-nowrap ml-2">
                  repo
                </span>
              </a>
            )}
            {project.live_url && (
              <a
                href={project.live_url}
                target="_blank"
                rel="noopener noreferrer"
                className="group/btn flex items-center bg-black/5 text-black rounded-full p-2 pr-4 hover:bg-black/10 hover:scale-[1.05] hover:rotate-2 transition-all duration-300"
                title="Try it out"
              >
                <Globe weight="bold" className="w-5 h-5 shrink-0" />
                <span className="text-sm font-medium whitespace-nowrap ml-2">
                  try it
                </span>
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
            sizes="(max-width: 896px) 100vw, 896px"
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
      <div className="flex flex-wrap items-center justify-between gap-4 mb-10">
        <div className="text-sm font-medium text-black/60">
          {displayTags.map((t) => tagMap[t] || t).join(" · ") || "No tags"}
        </div>

        {(project.start_date || project.end_date) && (
          <div className="text-sm font-medium text-black/50 lowercase">
            {formatDate(project.start_date)} — {formatDate(project.end_date)}
          </div>
        )}
      </div>

      {/* Summary */}
      {project.summary && (
        <div className="mb-12">
          <span className="block text-xs font-semibold text-black/40 tracking-wider mb-2">
            short description
          </span>
          <p className="text-lg md:text-xl font-medium text-black/80 leading-relaxed">
            {project.summary}
          </p>
        </div>
      )}

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
