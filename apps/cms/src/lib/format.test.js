import { describe, expect, it } from 'vitest';
import { wrap, prefixLines, link, normalizeUrl } from './format.js';

describe('wrap', () => {
  it('wraps the selection and keeps it selected', () => {
    const r = wrap('hello world', 6, 11, '**');
    expect(r.value).toBe('hello **world**');
    expect(r.value.slice(r.start, r.end)).toBe('world');
  });

  it('unwraps when the selection is already wrapped', () => {
    const r = wrap('hello **world**', 8, 13, '**');
    expect(r.value).toBe('hello world');
    expect(r.value.slice(r.start, r.end)).toBe('world');
  });

  it('inserts a selected placeholder when nothing is selected', () => {
    const r = wrap('a ', 2, 2, '_', '_', 'italic');
    expect(r.value).toBe('a _italic_');
    expect(r.value.slice(r.start, r.end)).toBe('italic');
  });
});

describe('prefixLines', () => {
  it('prefixes every touched line', () => {
    const r = prefixLines('one\ntwo\nthree', 1, 5, '> ');
    expect(r.value).toBe('> one\n> two\nthree');
  });

  it('removes the prefix when every line has it', () => {
    const r = prefixLines('## Title', 4, 4, '## ');
    expect(r.value).toBe('Title');
    expect(r.start).toBe(1);
  });
});

describe('link', () => {
  it('links the selection', () => {
    expect(link('see docs', 4, 8, 'https://x.dev').value).toBe('see [docs](https://x.dev)');
  });

  it('uses the url as the label when nothing is selected', () => {
    expect(link('', 0, 0, 'https://x.dev').value).toBe('[https://x.dev](https://x.dev)');
  });
});

describe('normalizeUrl', () => {
  it('adds https to bare domains only', () => {
    expect(normalizeUrl('x.dev')).toBe('https://x.dev');
    expect(normalizeUrl('http://x.dev')).toBe('http://x.dev');
    expect(normalizeUrl('mailto:a@b.c')).toBe('mailto:a@b.c');
    expect(normalizeUrl('  ')).toBe('');
  });
});
