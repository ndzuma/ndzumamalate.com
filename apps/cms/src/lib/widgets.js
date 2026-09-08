/**
 * Inline widget tokens understood by the public site's RichText renderer
 * (apps/web/components/rich-text.tsx). Keep the two lists in sync.
 */
export const WIDGETS = [
  { id: 'f1', token: '{{f1}}', label: 'F1 standings', description: 'Hover card with the latest race, drivers and teams.', color: 'red' },
  { id: 'space', token: '{{space}}', label: 'Next launch', description: 'Countdown to the next rocket launch.', color: 'blue' },
  { id: 'tech', token: '{{tech}}', label: 'Tech interests', description: 'Small card listing tech topics.', color: 'purple' },
  { id: 'social', token: '{{social}}', label: 'Social links', description: 'LinkedIn, GitHub, X and Threads from your profile.', color: 'blue' },
  { id: 'email', token: '{{email}}', label: 'Email', description: 'Your contact email as a hover card.', color: 'blue' },
  { id: 'cv', token: '{{cv}}', label: 'CV', description: 'Link to the active CV.', color: 'pink' },
  { id: 'book', token: '{{book}}', label: 'Currently reading', description: 'Book from your profile. The line hides if none is set.', color: 'orange' },
  { id: 'music', token: '{{music}}', label: 'Listening to', description: 'Spotify / Apple Music from your profile. Hides if unset.', color: 'purple' },
  { id: 'project', token: '{{project:slug}}', label: 'Project', description: 'Card linking to one of your projects. Optional custom label: {{project:slug|Label}}', color: 'blue', needsProject: true },
  { id: 'link', token: '{{link:https://example.com|Label}}', label: 'Custom link', description: 'Any URL as a hover card: {{link:url|Label|color|icon}}', color: 'gray', needsLink: true },
];

export const TOKEN_RE = /\{\{\s*([a-z][a-z0-9_-]*)(?::([^}]*))?\s*\}\}/g;

/** Human label for a token, used by the preview chips. */
export function describeToken(name, args) {
  const parts = (args || '').split('|').map((s) => s.trim());
  switch (name) {
    case 'project':
      return parts[1] ? `${parts[1]} (project)` : `project: ${parts[0] || '?'}`;
    case 'link':
      return parts[1] ? `${parts[1]} (link)` : `link: ${parts[0] || '?'}`;
    case 'f1':
      return parts[0] ? `F1 · ${parts[0]}` : 'F1';
    case 'space':
      return parts[0] ? `space · ${parts[0]}` : 'space';
    default: {
      const w = WIDGETS.find((x) => x.id === name);
      return w ? w.label : name;
    }
  }
}

/**
 * Split text into segments for previewing: plain text, tokens, bold, links.
 * @returns {Array<{ type: 'text'|'token'|'bold'|'link', value: string, name?: string, args?: string, href?: string }>}
 */
export function segment(text) {
  const out = [];
  const re = /\{\{\s*([a-z][a-z0-9_-]*)(?::([^}]*))?\s*\}\}|\*\*(.+?)\*\*|\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g;
  let last = 0;
  for (const m of (text || '').matchAll(re)) {
    const i = m.index ?? 0;
    if (i > last) out.push({ type: 'text', value: text.slice(last, i) });
    if (m[1]) out.push({ type: 'token', value: m[0], name: m[1], args: m[2] || '' });
    else if (m[3] !== undefined) out.push({ type: 'bold', value: m[3] });
    else out.push({ type: 'link', value: m[4], href: m[5] });
    last = i + m[0].length;
  }
  if (last < (text || '').length) out.push({ type: 'text', value: text.slice(last) });
  return out;
}

/** Insert `snippet` into `value` at the given selection, returning the new value and caret. */
export function insertAt(value, start, end, snippet) {
  const before = value.slice(0, start);
  const after = value.slice(end);
  const needsSpaceBefore = before && !/\s$/.test(before);
  const needsSpaceAfter = after && !/^\s/.test(after);
  const text = `${needsSpaceBefore ? ' ' : ''}${snippet}${needsSpaceAfter ? ' ' : ''}`;
  return { value: before + text + after, caret: before.length + text.length };
}
