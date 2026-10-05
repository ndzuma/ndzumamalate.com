<script>
  /**
   * Text field with an inline-widget toolbar. Widgets are inserted as tokens
   * like {{f1}} at the caret; the preview below shows them as chips so it's
   * obvious what will render on the site.
   */
  import { WIDGETS, segment, describeToken, insertAt } from '../lib/widgets.js';
  import { Plus, Sparkle } from 'phosphor-svelte';

  /** @type {{ value: string, placeholder?: string, rows?: number, projects?: any[], multiline?: boolean, preview?: boolean, id?: string }} */
  let { value = $bindable(''), placeholder = '', rows = 3, projects = [], multiline = true, preview = true, id = undefined } = $props();

  let el = $state(null);
  let menuOpen = $state(false);
  let projectPickerOpen = $state(false);
  let linkPickerOpen = $state(false);
  let linkUrl = $state('');
  let linkLabel = $state('');

  const segments = $derived(segment(value || ''));

  function insert(snippet) {
    const start = el?.selectionStart ?? (value || '').length;
    const end = el?.selectionEnd ?? start;
    const res = insertAt(value || '', start, end, snippet);
    value = res.value;
    menuOpen = false;
    projectPickerOpen = false;
    linkPickerOpen = false;
    requestAnimationFrame(() => {
      el?.focus();
      try { el.selectionStart = el.selectionEnd = res.caret; } catch (_) {}
    });
  }

  function pick(widget) {
    if (widget.needsProject) {
      menuOpen = false;
      projectPickerOpen = true;
      return;
    }
    if (widget.needsLink) {
      menuOpen = false;
      linkUrl = '';
      linkLabel = '';
      linkPickerOpen = true;
      return;
    }
    insert(widget.token);
  }

  function insertLink() {
    if (!linkUrl.trim()) return;
    const label = linkLabel.trim();
    insert(`{{link:${linkUrl.trim()}${label ? `|${label}` : ''}}}`);
  }

  function closeAll() {
    menuOpen = false;
    projectPickerOpen = false;
    linkPickerOpen = false;
  }
</script>

<svelte:window onclick={(e) => { if (!e.target.closest('.token-field')) closeAll(); }} />

<div class="token-field">
  <div class="editor">
    {#if multiline}
      <textarea {id} bind:this={el} bind:value {placeholder} {rows}></textarea>
    {:else}
      <input {id} bind:this={el} bind:value {placeholder} />
    {/if}

    <div class="toolbar">
      <div class="menu-anchor">
        <button type="button" class="btn btn-secondary btn-sm" onclick={() => { menuOpen = !menuOpen; projectPickerOpen = false; linkPickerOpen = false; }}>
          <Sparkle size={13} weight="fill" class="spark" />
          Insert widget
        </button>

        {#if menuOpen}
          <div class="menu fade-up">
            {#each WIDGETS as w}
              <button type="button" class="menu-item" onclick={() => pick(w)}>
                <span class="chip chip-{w.color}">{w.label}</span>
                <span class="menu-desc">{w.description}</span>
              </button>
            {/each}
          </div>
        {/if}

        {#if projectPickerOpen}
          <div class="menu fade-up">
            <div class="menu-title">Pick a project</div>
            {#if projects.length === 0}
              <div class="menu-desc" style="padding: 8px 10px;">No projects yet</div>
            {:else}
              {#each projects as p}
                <button type="button" class="menu-item" onclick={() => insert(`{{project:${p.slug || p.id}}}`)}>
                  <span class="chip chip-blue">{p.title}</span>
                  <span class="menu-desc">{p.repo_url || p.live_url || 'no link set'}</span>
                </button>
              {/each}
            {/if}
          </div>
        {/if}

        {#if linkPickerOpen}
          <div class="menu link-menu fade-up">
            <div class="menu-title">Custom link</div>
            <input placeholder="https://…" bind:value={linkUrl} onkeydown={(e) => e.key === 'Enter' && (e.preventDefault(), insertLink())} />
            <input placeholder="Label (optional)" bind:value={linkLabel} onkeydown={(e) => e.key === 'Enter' && (e.preventDefault(), insertLink())} />
            <button type="button" class="btn btn-primary btn-sm" onclick={insertLink} disabled={!linkUrl.trim()}>
              <Plus size={12} weight="bold" /> Insert
            </button>
          </div>
        {/if}
      </div>
      <span class="hint">**bold** and [text](url) also work</span>
    </div>
  </div>

  {#if preview && value}
    <div class="preview">
      {#each segments as s}
        {#if s.type === 'token'}
          <span class="chip chip-token" title={s.value}>{describeToken(s.name, s.args)}</span>
        {:else if s.type === 'bold'}
          <strong>{s.value}</strong>
        {:else if s.type === 'link'}
          <a href={s.href} target="_blank" rel="noopener noreferrer">{s.value}</a>
        {:else}
          {s.value}
        {/if}
      {/each}
    </div>
  {/if}
</div>

<style>
  .token-field { display: flex; flex-direction: column; gap: 8px; }
  .editor { display: flex; flex-direction: column; gap: 8px; }

  .toolbar {
    display: flex;
    align-items: center;
    gap: 10px;
    flex-wrap: wrap;
  }
  .toolbar .hint { font-size: 11.5px; color: var(--text-4); }
  .toolbar :global(.spark) { color: var(--token); }

  .menu-anchor { position: relative; }

  .menu {
    position: absolute;
    top: calc(100% + 6px);
    left: 0;
    width: 340px;
    max-height: 320px;
    overflow-y: auto;
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: var(--radius-lg);
    box-shadow: var(--shadow-lg);
    padding: 6px;
    z-index: 60;
  }
  .link-menu { display: flex; flex-direction: column; gap: 8px; padding: 10px; width: 300px; }

  .menu-title {
    font-size: 11.5px;
    font-weight: 500;
    color: var(--text-3);
    padding: 6px 10px 4px;
  }

  .menu-item {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 3px;
    width: 100%;
    padding: 8px 10px;
    border-radius: var(--radius-sm);
    text-align: left;
    transition: background 0.12s;
  }
  .menu-item:hover { background: var(--surface-2); }
  .menu-desc { font-size: 11.5px; color: var(--text-3); line-height: 1.4; }

  .chip {
    display: inline-flex;
    align-items: center;
    height: 20px;
    padding: 0 7px;
    border-radius: 6px;
    font-size: 12px;
    font-weight: 500;
    line-height: 1;
    vertical-align: middle;
    white-space: nowrap;
  }
  .chip-token { background: var(--token-soft); color: var(--token); margin: 0 1px; }
  .chip-blue { background: #e4edff; color: #2456c9; }
  .chip-red { background: #ffe4e4; color: #c0262b; }
  .chip-purple { background: var(--token-soft); color: var(--token); }
  .chip-pink { background: #ffe3f0; color: #c0266f; }
  .chip-orange { background: #ffedd8; color: #b45309; }
  .chip-gray { background: var(--surface-3); color: var(--text-2); }

  .preview {
    font-size: 13.5px;
    line-height: 1.7;
    color: var(--text-2);
    padding: 10px 12px;
    background: var(--surface-2);
    border: 1px dashed var(--border);
    border-radius: var(--radius);
    white-space: pre-wrap;
  }
  .preview a { color: var(--text); text-decoration: underline; text-underline-offset: 3px; }
  .preview strong { color: var(--text); font-weight: 600; }
</style>
