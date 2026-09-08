import type { ReactNode } from "react";
import type { CV, Profile, Project } from "../types/api";
import InlineF1Widget from "./inline-f1-widget";
import InlineSpaceWidget from "./inline-space-widget";
import InlineTechLink from "./inline-tech-link";
import InlineSocialLink from "./inline-social-link";
import InlineEmailLink from "./inline-email-link";
import InlineCvLink from "./inline-cv-link";
import InlineBookLink from "./inline-book-link";
import InlineMusicLink from "./inline-music-link";
import InlineProjectLink from "./inline-project-link";
import InlineLink from "./inline-link";

/**
 * Renders CMS text with inline widget tokens and light markdown.
 *
 * Tokens (editable from the CMS "Pages" screen):
 *   {{f1}} {{f1:center}}        F1 standings card
 *   {{space}} {{space:center}}  Next rocket launch card
 *   {{tech}}                    Tech interests card
 *   {{social}}                  Social links card (from profile)
 *   {{email}}                   Contact email card
 *   {{cv}}                      Active CV card
 *   {{book}}                    Currently-reading card (from profile)
 *   {{music}}                   Listening card (from profile)
 *   {{project:slug}}            Project card, optional label: {{project:slug|Label}}
 *   {{link:https://url|Title|color|icon}}  Generic hover-link card
 *
 * Markdown: **bold**, [text](https://url)
 */

export type RichTextContext = {
  profile?: Profile | null;
  cv?: CV | null;
  projects?: Project[];
};

type Align = "left" | "center" | "right" | "auto";

const TOKEN = /\{\{\s*([a-z][a-z0-9_-]*)(?::([^}]*))?\s*\}\}/g;
const INLINE = /\*\*(.+?)\*\*|\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g;

function toAlign(value?: string): Align {
  return value === "left" || value === "center" || value === "right" ? value : "auto";
}

function splitArgs(raw?: string): string[] {
  if (!raw) return [];
  return raw.split("|").map((part) => part.trim());
}

/** Whether an item can be shown — hides lines whose only data is missing. */
export function isRenderable(text: string, ctx: RichTextContext): boolean {
  const profile = ctx.profile;
  const needsBook = /\{\{\s*book\s*\}\}/.test(text);
  if (needsBook && !(profile?.currently_reading_title && profile?.currently_reading_url)) return false;
  const needsMusic = /\{\{\s*music\s*\}\}/.test(text);
  if (needsMusic && !(profile?.spotify_url || profile?.apple_music_url)) return false;
  return true;
}

function renderToken(name: string, args: string[], ctx: RichTextContext, key: string): ReactNode {
  switch (name) {
    case "f1":
      return <InlineF1Widget key={key} align={toAlign(args[0])} />;
    case "space":
      return <InlineSpaceWidget key={key} align={toAlign(args[0])} />;
    case "tech":
      return <InlineTechLink key={key} />;
    case "social":
      return <InlineSocialLink key={key} profile={ctx.profile ?? null} />;
    case "email":
      return <InlineEmailLink key={key} />;
    case "cv":
      return <InlineCvLink key={key} cv={ctx.cv ?? null} />;
    case "book": {
      const profile = ctx.profile;
      if (!profile?.currently_reading_title || !profile.currently_reading_url) return null;
      return <InlineBookLink key={key} title={profile.currently_reading_title} url={profile.currently_reading_url} />;
    }
    case "music": {
      const profile = ctx.profile;
      if (!profile?.spotify_url && !profile?.apple_music_url) return null;
      return <InlineMusicLink key={key} spotifyUrl={profile.spotify_url} appleMusicUrl={profile.apple_music_url} />;
    }
    case "project": {
      const [slug, label, actionLabel] = args;
      const project = ctx.projects?.find((p) => p.slug === slug || p.id === slug);
      const title = label || project?.title || slug || "project";
      const url = project?.repo_url || project?.live_url;
      if (!url) return <span key={key} className="font-medium">{title}</span>;
      return <InlineProjectLink key={key} title={title} url={url} label={actionLabel || (project?.repo_url ? "See project" : "Visit project")} />;
    }
    case "link": {
      const [url, title, color, icon] = args;
      if (!url) return null;
      const colors = ["blue", "orange", "purple", "green", "gray", "red", "black"] as const;
      const icons = ["link", "x", "youtube"] as const;
      const safeColor = (colors as readonly string[]).includes(color) ? (color as (typeof colors)[number]) : "blue";
      const safeIcon = (icons as readonly string[]).includes(icon) ? (icon as (typeof icons)[number]) : "link";
      return <InlineLink key={key} title={title || url} url={url} color={safeColor} iconType={safeIcon} />;
    }
    default:
      return null;
  }
}

function renderInline(text: string, keyPrefix: string): ReactNode[] {
  const nodes: ReactNode[] = [];
  let last = 0;
  let i = 0;
  for (const match of text.matchAll(INLINE)) {
    const index = match.index ?? 0;
    if (index > last) nodes.push(text.slice(last, index));
    if (match[1] !== undefined) {
      nodes.push(<strong key={`${keyPrefix}-b${i++}`}>{match[1]}</strong>);
    } else {
      nodes.push(
        <a
          key={`${keyPrefix}-a${i++}`}
          href={match[3]}
          target="_blank"
          rel="noopener noreferrer"
          className="font-medium text-black underline decoration-black/20 underline-offset-4 hover:decoration-black/60 transition-colors"
        >
          {match[2]}
        </a>
      );
    }
    last = index + match[0].length;
  }
  if (last < text.length) nodes.push(text.slice(last));
  return nodes;
}

export function renderRichText(text: string, ctx: RichTextContext = {}): ReactNode[] {
  const nodes: ReactNode[] = [];
  let last = 0;
  let i = 0;
  for (const match of text.matchAll(TOKEN)) {
    const index = match.index ?? 0;
    if (index > last) nodes.push(...renderInline(text.slice(last, index), `t${i}`));
    nodes.push(renderToken(match[1], splitArgs(match[2]), ctx, `w${i++}`));
    last = index + match[0].length;
  }
  if (last < text.length) nodes.push(...renderInline(text.slice(last), `t${i}`));
  return nodes;
}

export default function RichText({ text, ctx }: { text: string; ctx?: RichTextContext }) {
  return <>{renderRichText(text, ctx)}</>;
}
