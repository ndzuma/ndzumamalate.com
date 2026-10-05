/**
 * Pure text transforms behind the floating format bar. Each takes the current
 * value and selection and returns the new value plus the selection to restore.
 *
 * @typedef {{ value: string, start: number, end: number }} Edit
 */

/**
 * Wrap the selection in `before`/`after` (e.g. ** for bold). Toggles off when
 * the selection is already wrapped. With nothing selected, inserts
 * `placeholder` wrapped and selects it so typing replaces it.
 * @returns {Edit}
 */
export function wrap(value, start, end, before, after = before, placeholder = 'text') {
  const outerStart = start - before.length;
  const outerEnd = end + after.length;
  if (
    outerStart >= 0 &&
    value.slice(outerStart, start) === before &&
    value.slice(end, outerEnd) === after
  ) {
    return {
      value: value.slice(0, outerStart) + value.slice(start, end) + value.slice(outerEnd),
      start: outerStart,
      end: end - before.length,
    };
  }

  const selected = value.slice(start, end) || placeholder;
  return {
    value: value.slice(0, start) + before + selected + after + value.slice(end),
    start: start + before.length,
    end: start + before.length + selected.length,
  };
}

/**
 * Toggle a line prefix (e.g. "## " or "> ") on every line the selection
 * touches. Removes it only if every touched line already has it.
 * @returns {Edit}
 */
export function prefixLines(value, start, end, prefix) {
  const lineStart = value.lastIndexOf('\n', start - 1) + 1;
  const nextBreak = value.indexOf('\n', end);
  const lineEnd = nextBreak === -1 ? value.length : nextBreak;
  const lines = value.slice(lineStart, lineEnd).split('\n');
  const remove = lines.every((l) => l.startsWith(prefix));
  const next = lines.map((l) => (remove ? l.slice(prefix.length) : prefix + l)).join('\n');
  const delta = remove ? -prefix.length : prefix.length;
  return {
    value: value.slice(0, lineStart) + next + value.slice(lineEnd),
    start: Math.max(lineStart, start + delta),
    end: end + delta * lines.length,
  };
}

/**
 * Turn the selection into a markdown link to `url`; with nothing selected the
 * URL doubles as the label.
 * @returns {Edit}
 */
export function link(value, start, end, url) {
  const label = value.slice(start, end) || url;
  const text = `[${label}](${url})`;
  return {
    value: value.slice(0, start) + text + value.slice(end),
    start: start + text.length,
    end: start + text.length,
  };
}

/** Normalise a typed URL: bare domains get https://. */
export function normalizeUrl(raw) {
  const url = (raw || '').trim();
  if (!url) return '';
  if (/^(https?:|mailto:|\/|#)/i.test(url)) return url;
  return `https://${url}`;
}
