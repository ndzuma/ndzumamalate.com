<script>
  /**
   * Floating pill toolbar that formats the selection of a textarea/input.
   * Styles live in global.css (.format-bar, .fb-*) so callers can render
   * matching buttons through the `lead` snippet.
   */
  import { wrap, prefixLines, link, normalizeUrl } from '../lib/format.js';
  import { TextB, TextItalic, TextStrikethrough, TextHTwo, Quotes, Code, LinkSimple, Check, X } from 'phosphor-svelte';

  /**
   * @type {{
   *   el: HTMLTextAreaElement | HTMLInputElement | null,
   *   value: string,
   *   tools?: Array<'link' | 'heading' | 'bold' | 'italic' | 'strike' | 'code' | 'quote'>,
   *   lead?: import('svelte').Snippet,
   *   linkLabel?: string
   * }}
   */
  let { el = null, value = $bindable(''), tools = ['link', 'bold'], lead, linkLabel = 'Add link' } = $props();

  const TOOLS = {
    heading: { icon: TextHTwo, title: 'Heading', run: (v, s, e) => prefixLines(v, s, e, '## ') },
    bold: { icon: TextB, title: 'Bold (⌘B)', run: (v, s, e) => wrap(v, s, e, '**', '**', 'bold') },
    italic: { icon: TextItalic, title: 'Italic (⌘I)', run: (v, s, e) => wrap(v, s, e, '_', '_', 'italic') },
    strike: { icon: TextStrikethrough, title: 'Strikethrough', run: (v, s, e) => wrap(v, s, e, '~~', '~~', 'text') },
    code: { icon: Code, title: 'Inline code', run: (v, s, e) => wrap(v, s, e, '`', '`', 'code') },
    quote: { icon: Quotes, title: 'Quote', run: (v, s, e) => prefixLines(v, s, e, '> ') },
  };

  const formatTools = $derived(tools.filter((t) => t !== 'link'));

  let linking = $state(false);
  let url = $state('');
  let urlInput = $state(null);
  let saved = { start: 0, end: 0 };

  function selection() {
    const len = (value || '').length;
    const start = el?.selectionStart ?? len;
    return { start, end: el?.selectionEnd ?? start };
  }

  function commit(result) {
    value = result.value;
    requestAnimationFrame(() => {
      el?.focus();
      try { el?.setSelectionRange(result.start, result.end); } catch (_) {}
    });
  }

  /** Run a tool by id — exposed so callers can bind keyboard shortcuts. */
  export function run(id) {
    if (id === 'link') return startLink();
    const tool = TOOLS[id];
    if (!tool || !el) return;
    const { start, end } = selection();
    commit(tool.run(value || '', start, end));
  }

  function startLink() {
    saved = selection();
    url = '';
    linking = true;
    requestAnimationFrame(() => urlInput?.focus());
  }

  function applyLink() {
    const href = normalizeUrl(url);
    if (!href) return;
    linking = false;
    commit(link(value || '', saved.start, saved.end, href));
  }

  function cancelLink() {
    linking = false;
    el?.focus();
  }

  // Buttons must not steal focus, or the textarea loses its selection.
  function keepSelection(e) {
    if (e.target.closest('button')) e.preventDefault();
  }
</script>

<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
<div class="format-bar" role="toolbar" aria-label="Formatting" tabindex="-1" onmousedown={keepSelection}>
  {#if linking}
    <span class="fb-link-icon"><LinkSimple size={16} /></span>
    <input
      class="fb-input"
      bind:this={urlInput}
      bind:value={url}
      placeholder="Paste a link…"
      onkeydown={(e) => {
        if (e.key === 'Enter') { e.preventDefault(); applyLink(); }
        if (e.key === 'Escape') { e.preventDefault(); cancelLink(); }
      }}
    />
    <button type="button" class="fb-btn" title="Apply link" onclick={applyLink} disabled={!url.trim()}>
      <Check size={16} weight="bold" />
    </button>
    <button type="button" class="fb-btn" title="Cancel" onclick={cancelLink}>
      <X size={16} />
    </button>
  {:else}
    {#if lead}
      {@render lead()}
    {/if}
    {#if tools.includes('link')}
      <button type="button" class="fb-btn fb-label" onclick={startLink}>
        <LinkSimple size={17} /> {linkLabel}
      </button>
    {/if}
    {#if formatTools.length && (lead || tools.includes('link'))}
      <span class="fb-sep"></span>
    {/if}
    {#each formatTools as id}
      {@const tool = TOOLS[id]}
      <button type="button" class="fb-btn" title={tool.title} aria-label={tool.title} onclick={() => run(id)}>
        <tool.icon size={18} />
      </button>
    {/each}
  {/if}
</div>
