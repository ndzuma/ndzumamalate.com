import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft } from "@phosphor-icons/react/dist/ssr";
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
    const writing = await api.getBlogBySlug(slug);
    return {
      title: writing.title,
      description: writing.summary,
    };
  } catch {
    return { title: "Writing Not Found" };
  }
}

function formatDate(dateStr?: string) {
  if (!dateStr) return "unknown date";
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }).toLowerCase();
}

export default async function WritingPage({ params }: Props) {
  const { slug } = await params;
  let writing;

  try {
    writing = await api.getBlogBySlug(slug);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) notFound();
    throw error;
  }

  const tagMap: Record<string, string> = {};
  try {
    const allTags = await api.getTags();
    allTags.forEach(t => {
      tagMap[t.id] = t.name;
      tagMap[t.slug] = t.name;
    });
  } catch {}

  const displayTags = writing.tags || [];

  return (
    <main className="flex w-full flex-col font-sans text-[#111] max-w-4xl mx-auto pb-24 mt-6 sm:mt-10">

      {/* Top Controls (Above Image) */}
      <div className="flex justify-between items-center mb-6">
        <Link
          href="/writings"
          className="flex items-center justify-center h-10 w-10 bg-black/5 hover:bg-black/10 text-black rounded-full transition-all"
          aria-label="Back to writings"
        >
          <ArrowLeft weight="bold" />
        </Link>
      </div>

      {/* Cover Image & Header Layout */}
      <div className="relative w-full aspect-[16/9] rounded-2xl overflow-hidden mb-8 bg-black/5">
        {writing.cover_image_url && (
          <Image
            src={writing.cover_image_url}
            alt={writing.title}
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
            {writing.title}
          </h1>
        </div>
      </div>

      {/* Meta: Tags and Date (Plain text on one line) */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-10">
        <div className="text-sm font-medium text-black/60">
          {displayTags.map((t) => tagMap[t] || t).join(" · ") || "No tags"}
        </div>

        {writing.published_at && (
          <div className="text-sm font-medium text-black/50 lowercase">
            {formatDate(writing.published_at)}
          </div>
        )}
      </div>

      {/* Summary */}
      {writing.summary && (
        <div className="mb-12">
          <span className="block text-xs font-semibold text-black/40 tracking-wider mb-2">
            short description
          </span>
          <p className="text-lg md:text-xl font-medium text-black/80 leading-relaxed">
            {writing.summary}
          </p>
        </div>
      )}

      {/* Content */}
      {writing.content ? (
        <article className="prose prose-neutral prose-a:text-black hover:prose-a:text-black/70 prose-a:underline-offset-4 prose-img:rounded-xl max-w-none">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {writing.content}
          </ReactMarkdown>
        </article>
      ) : (
        <p className="text-black/50 italic">No content available for this post.</p>
      )}

    </main>
  );
}
