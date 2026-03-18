<script>
  import TopBar from '../components/TopBar.svelte';
  import BottomNav from '../components/BottomNav.svelte';
  import { navigate } from '../lib/router.svelte.js';
  import { projects, blogs, tags as tagsApi } from '../lib/api.js';
  import { toast } from '../lib/toast.svelte.js';
  import markdownit from 'markdown-it';
  import { ArrowLeft, FloppyDisk, Eye, CaretDown, Plus } from 'phosphor-svelte';

  /** @type {{ type: string, id: string | null }} */
  let { type = 'project', id = null } = $props();

  const isProject = $derived(type === 'project');
  const pageName = $derived(id ? `Edit ${isProject ? 'Project' : 'Blog'}` : `New ${isProject ? 'Project' : 'Blog'}`);

  // ── Type switcher ──
  let typeSwitcherOpen = $state(false);

  function switchType(newType) {
    typeSwitcherOpen = false;
    if (newType === type) return;
    if (id || title || content) {
      if (!confirm(`Switch to ${newType}? Unsaved changes will be lost.`)) return;
    }
    navigate(`/editor/${newType}`);
  }

  const md = markdownit({
    html: true,
    linkify: true,
    typographer: true,
    breaks: true,
  });

  // ── Form state ──
  let title = $state('');
  let slug = $state('');
  let summary = $state('');
  let content = $state('');
  let imageUrl = $state('');
  let liveUrl = $state('');
  let repoUrl = $state('');
  let coverImageUrl = $state('');
  let featured = $state(false);
  let published = $state(false);
  let tagIds = $state([]);
  let publishedAt = $state('');
  let sortOrder = $state(0);

  let allTags = $state([]);
  let saving = $state(false);
  let loading = $state(false);
  let optionsPanelOpen = $state(true);

  // ── Image aspect ratio toggle ──
  const ratioOptions = ['original', '16:9', '4:3'];
  let coverRatio = $state('original');

  // ── Inline tag creation ──
  let newTagName = $state('');
  let creatingTag = $state(false);

  // ── Derived preview ──
  const rendered = $derived(md.render(content || ''));

  // ── Auto-slug from title ──
  function updateSlug() {
    if (!id) {
      slug = title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');
    }
  }

  // ── Load existing data ──
  async function loadItem() {
    if (!id) return;
    loading = true;
    try {
      // Fetch all items, find by ID
      if (isProject) {
        const items = await projects.list();
        const item = items.find(p => p.id === id);
        if (item) {
          title = item.title || '';
          slug = item.slug || '';
          summary = item.summary || '';
          content = item.content || '';
          imageUrl = item.image_url || '';
          liveUrl = item.live_url || '';
          repoUrl = item.repo_url || '';
          featured = item.featured || false;
          published = item.published || false;
          sortOrder = item.sort_order ?? 0;
          tagIds = item.tags || [];
        }
      } else {
        const items = await blogs.list();
        const item = items.find(b => b.id === id);
        if (item) {
          title = item.title || '';
          slug = item.slug || '';
          summary = item.summary || '';
          content = item.content || '';
          coverImageUrl = item.cover_image_url || '';
          published = item.published || false;
          publishedAt = item.published_at ? item.published_at.split('T')[0] : '';
          tagIds = item.tags || [];
        }
      }
    } catch (_) {}
    loading = false;
  }

  async function loadTags() {
    try {
      allTags = await tagsApi.list() || [];
    } catch (_) {
      allTags = [];
    }
  }

  loadItem();
  loadTags();

  // ── Save ──
  async function save(andPublish = false) {
    saving = true;
    try {
      if (andPublish) published = true;

      if (isProject) {
        // Resolve tag slugs to IDs
        const resolvedTagIds = resolveTagIds();
        const data = {
          title, slug, summary, content,
          image_url: imageUrl,
          live_url: liveUrl,
          repo_url: repoUrl,
          featured, published,
          sort_order: sortOrder,
          tag_ids: resolvedTagIds,
        };
        if (id) {
          await projects.update(id, data);
          toast('Project updated');
        } else {
          const created = await projects.create(data);
          if (created?.id) {
            id = created.id;
            navigate(`/editor/project/${created.id}`);
            toast('Project created');
          }
        }
      } else {
        // Resolve tag slugs to IDs
        const resolvedTagIds = resolveTagIds();
        const data = {
          title, slug, summary, content,
          cover_image_url: coverImageUrl,
          published,
          published_at: publishedAt ? `${publishedAt}T00:00:00Z` : '',
          tag_ids: resolvedTagIds,
        };
        if (id) {
          await blogs.update(id, data);
          toast('Blog updated');
        } else {
          const created = await blogs.create(data);
          if (created?.id) {
            id = created.id;
            navigate(`/editor/blog/${created.id}`);
            toast('Blog created');
          }
        }
      }
      if (andPublish) toast('Published', 'success');
    } catch (e) {
      toast('Failed to save', 'error');
    }
    saving = false;
  }

  function handleEditorKeydown(e) {
    // Cmd/Ctrl+S to save
    if ((e.metaKey || e.ctrlKey) && e.key === 's') {
      e.preventDefault();
      save();
    }
    // Tab inserts spaces
    if (e.key === 'Tab') {
      e.preventDefault();
      const target = e.target;
      const start = target.selectionStart;
      const end = target.selectionEnd;
      content = content.substring(0, start) + '  ' + content.substring(end);
      // Restore cursor in next tick
      requestAnimationFrame(() => {
        target.selectionStart = target.selectionEnd = start + 2;
      });
    }
  }

  function toggleTag(tagId) {
    if (tagIds.includes(tagId)) {
      tagIds = tagIds.filter(t => t !== tagId);
    } else {
      tagIds = [...tagIds, tagId];
    }
  }

  // Resolve tagIds which might be slugs (from load) to UUIDs for save
  function resolveTagIds() {
    return tagIds.map(idOrSlug => {
      // If it looks like a UUID, use as-is
      if (idOrSlug.length === 36 && idOrSlug.includes('-')) return idOrSlug;
      // Otherwise find by slug
      const found = allTags.find(t => t.slug === idOrSlug);
      return found?.id || idOrSlug;
    });
  }

  // ── Inline tag creation ──
  async function createTag() {
    if (!newTagName.trim()) return;
    creatingTag = true;
    try {
      const tagSlug = newTagName.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
      const created = await tagsApi.create({ name: newTagName.trim(), slug: tagSlug });
      if (created?.id) {
        allTags = [...allTags, created];
        tagIds = [...tagIds, created.id];
      }
      newTagName = '';
    } catch (_) {}
    creatingTag = false;
  }
</script>

<svelte:window onclick={(e) => {
  if (typeSwitcherOpen && !e.target.closest('.type-switcher')) typeSwitcherOpen = false;
}} />

<div class="editor-page">
  <TopBar pageName={pageName}>
    {#snippet actions()}
      {#if !id}
        <div class="type-switcher">
          <button class="type-trigger" onclick={() => typeSwitcherOpen = !typeSwitcherOpen}>
            <span class="mono">{isProject ? 'PROJECT' : 'BLOG'}</span>
            <CaretDown size={10} />
          </button>
          {#if typeSwitcherOpen}
            <div class="type-menu">
              <button class="type-option" class:active={isProject} onclick={() => switchType('project')}>
                Project
              </button>
              <button class="type-option" class:active={!isProject} onclick={() => switchType('blog')}>
                Blog
              </button>
            </div>
          {/if}
        </div>
      {/if}
    {/snippet}
  </TopBar>

  {#if loading}
    <div class="loader-center">Loading...</div>
  {:else}
    <div class="editor-layout">
      <!-- ── Left: Editor ── -->
      <div class="editor-pane">
        <!-- Options panel floating top-right of editor -->
        <div class="options-panel" class:collapsed={!optionsPanelOpen}>
          <button class="options-toggle" onclick={() => optionsPanelOpen = !optionsPanelOpen}>
            <Eye size={14} />
            <span class="mono">{optionsPanelOpen ? 'HIDE OPTIONS' : 'OPTIONS'}</span>
          </button>

          {#if optionsPanelOpen}
            <div class="options-fields">
              <div class="opt-group">
                <label class="mono">TITLE</label>
                <input bind:value={title} oninput={updateSlug} placeholder="Enter title" />
              </div>

              <div class="opt-group">
                <label class="mono">SLUG</label>
                <input bind:value={slug} placeholder="auto-generated-slug" />
              </div>

              <div class="opt-group">
                <label class="mono">SUMMARY</label>
                <textarea bind:value={summary} placeholder="Brief description" rows="2"></textarea>
              </div>

              {#if isProject}
                <div class="opt-group">
                  <label class="mono">IMAGE URL</label>
                  <input bind:value={imageUrl} placeholder="https://..." />
                </div>
                <div class="opt-group">
                  <label class="mono">LIVE URL</label>
                  <input bind:value={liveUrl} placeholder="https://..." />
                </div>
                <div class="opt-group">
                  <label class="mono">REPO URL</label>
                  <input bind:value={repoUrl} placeholder="https://github.com/..." />
                </div>
                <div class="opt-row">
                  <label class="checkbox-label">
                    <input type="checkbox" bind:checked={featured} />
                    <span>Featured</span>
                  </label>
                  <label class="checkbox-label">
                    <input type="checkbox" bind:checked={published} />
                    <span>Published</span>
                  </label>
                </div>
              {:else}
                <div class="opt-group">
                  <label class="mono">COVER IMAGE URL</label>
                  <input bind:value={coverImageUrl} placeholder="https://..." />
                </div>
                <div class="opt-group">
                  <label class="mono">PUBLISHED AT</label>
                  <input type="date" bind:value={publishedAt} />
                </div>
                <div class="opt-row">
                  <label class="checkbox-label">
                    <input type="checkbox" bind:checked={published} />
                    <span>Published</span>
                  </label>
                </div>
              {/if}

              <!-- Tags section (shared for both projects and blogs) -->
              <div class="opt-group">
                <label class="mono">TAGS</label>
                {#if allTags.length > 0}
                  <div class="tags-grid">
                    {#each allTags as tag}
                      <button
                        class="tag-chip"
                        class:active={tagIds.includes(tag.id) || tagIds.includes(tag.slug)}
                        onclick={() => toggleTag(tag.id)}
                      >
                        {tag.name}
                      </button>
                    {/each}
                  </div>
                {:else}
                  <span class="tags-empty">No tags yet</span>
                {/if}
                <div class="tag-create-row">
                  <input
                    class="tag-create-input"
                    bind:value={newTagName}
                    placeholder="New tag name"
                    onkeydown={(e) => e.key === 'Enter' && (e.preventDefault(), createTag())}
                  />
                  <button class="tag-create-btn" onclick={createTag} disabled={creatingTag || !newTagName.trim()}>
                    <Plus size={12} />
                  </button>
                </div>
              </div>

              {#if imageUrl || coverImageUrl}
                <div class="opt-group">
                  <div class="ratio-header">
                    <label class="mono">COVER IMAGE</label>
                    <div class="ratio-toggle">
                      {#each ratioOptions as r}
                        <button
                          class="ratio-btn"
                          class:active={coverRatio === r}
                          onclick={() => coverRatio = r}
                        >{r === 'original' ? 'Auto' : r}</button>
                      {/each}
                    </div>
                  </div>
                  <div class="cover-preview" class:ratio-16-9={coverRatio === '16:9'} class:ratio-4-3={coverRatio === '4:3'}>
                    <img src={isProject ? imageUrl : coverImageUrl} alt="Cover" />
                  </div>
                </div>
              {/if}

              <div class="opt-actions">
                <button class="save-btn" onclick={() => save()} disabled={saving}>
                  <FloppyDisk size={14} />
                  {saving ? 'Saving...' : id ? 'Update' : 'Save'}
                </button>
                {#if !published}
                  <button class="publish-btn" onclick={() => save(true)} disabled={saving}>
                    {id ? 'Update & Publish' : 'Save & Publish'}
                  </button>
                {/if}
              </div>
            </div>
          {/if}
        </div>

        <!-- Actual editor textarea -->
        <textarea
          class="editor-textarea"
          bind:value={content}
          onkeydown={handleEditorKeydown}
          placeholder="Start writing markdown..."
          spellcheck="true"
        ></textarea>
      </div>

      <!-- ── Right: Preview ── -->
      <div class="preview-pane">
        <div class="preview-header">
          <span class="mono">PREVIEW</span>
        </div>
        <div class="preview-body">
          {#if title}
            <h1 class="preview-title">{title}</h1>
          {/if}
          {#if (isProject && imageUrl) || (!isProject && coverImageUrl)}
            <div class="preview-cover" class:ratio-16-9={coverRatio === '16:9'} class:ratio-4-3={coverRatio === '4:3'}>
              <img src={isProject ? imageUrl : coverImageUrl} alt="Cover" />
            </div>
          {/if}
          <div class="markdown-content">
            {@html rendered}
          </div>
        </div>
      </div>
    </div>

  {/if}

  <BottomNav />
</div>

<style>
  .editor-page {
    height: 100vh;
    display: flex;
    flex-direction: column;
    background: #fff;
    overflow: hidden;
  }

  .loader-center {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 13px;
    color: #999;
  }

  /* ── Split layout ── */
  .editor-layout {
    flex: 1;
    display: grid;
    grid-template-columns: 1fr 1fr;
    min-height: 0;
    overflow: hidden;
  }

  /* ── Editor pane ── */
  .editor-pane {
    position: relative;
    display: flex;
    flex-direction: column;
    border-right: 1px solid #e5e5e5;
    min-height: 0;
  }

  .editor-textarea {
    flex: 1;
    resize: none;
    border: none;
    outline: none;
    padding: 24px;
    padding-top: 24px;
    font-family: 'Geist Mono Variable', 'SF Mono', 'Fira Code', monospace;
    font-size: 13.5px;
    line-height: 1.7;
    color: #111;
    background: #fff;
    overflow-y: auto;
    border-radius: 0;
  }

  .editor-textarea::placeholder {
    color: #ccc;
  }

  /* ── Options panel (floating top-right in editor) ── */
  .options-panel {
    position: absolute;
    top: 12px;
    right: 12px;
    z-index: 20;
    background: #fff;
    border: 1px solid #e5e5e5;
    border-radius: 10px;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
    max-width: 280px;
    width: 100%;
    max-height: calc(100% - 24px);
    overflow-y: auto;
    transition: all 0.15s;
  }

  .options-panel.collapsed {
    max-width: 140px;
  }

  .options-toggle {
    display: flex;
    align-items: center;
    gap: 6px;
    width: 100%;
    padding: 10px 14px;
    font-size: 11px;
    color: #666;
    background: none;
    border: none;
    border-bottom: 1px solid #f0f0f0;
    cursor: pointer;
    transition: color 0.1s;
  }

  .options-toggle:hover { color: #111; }

  .options-fields {
    padding: 12px 14px;
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .opt-group {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .opt-group label {
    font-size: 10px;
    font-weight: 500;
    color: #999;
    letter-spacing: 0.06em;
  }

  .opt-group input,
  .opt-group textarea {
    padding: 6px 10px;
    font-size: 12px;
    border: 1px solid #e5e5e5;
    border-radius: 5px;
    background: #fafafa;
  }

  .opt-group input:focus,
  .opt-group textarea:focus {
    border-color: #111;
    background: #fff;
    outline: none;
  }

  .opt-group textarea {
    resize: vertical;
    min-height: 40px;
  }

  .opt-row {
    display: flex;
    gap: 16px;
  }

  .checkbox-label {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 12px;
    color: #555;
    cursor: pointer;
  }

  .checkbox-label input[type="checkbox"] {
    width: 14px;
    height: 14px;
    accent-color: #111;
    cursor: pointer;
  }

  .tags-grid {
    display: flex;
    flex-wrap: wrap;
    gap: 4px;
  }

  .tag-chip {
    padding: 3px 10px;
    font-size: 11px;
    border: 1px solid #e5e5e5;
    border-radius: 20px;
    background: #fff;
    color: #666;
    cursor: pointer;
    transition: all 0.1s;
  }

  .tag-chip:hover { border-color: #111; color: #111; }
  .tag-chip.active {
    background: #111;
    color: #fff;
    border-color: #111;
  }

  .tags-empty {
    font-size: 11px;
    color: #bbb;
  }

  .tag-create-row {
    display: flex;
    gap: 4px;
    margin-top: 4px;
  }

  .tag-create-input {
    flex: 1;
    padding: 5px 8px;
    font-size: 11px;
    border: 1px solid #e5e5e5;
    border-radius: 5px;
    background: #fafafa;
  }

  .tag-create-input:focus {
    border-color: #111;
    background: #fff;
    outline: none;
  }

  .tag-create-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 28px;
    height: 28px;
    border: 1px solid #e5e5e5;
    border-radius: 5px;
    background: #fff;
    color: #666;
    cursor: pointer;
    transition: all 0.1s;
    flex-shrink: 0;
  }

  .tag-create-btn:hover { border-color: #111; color: #111; }
  .tag-create-btn:disabled { opacity: 0.3; cursor: not-allowed; }

  .cover-preview {
    border-radius: 6px;
    overflow: hidden;
    border: 1px solid #e5e5e5;
  }

  .cover-preview img {
    width: 100%;
    height: auto;
    object-fit: cover;
    display: block;
  }

  .cover-preview.ratio-16-9 {
    aspect-ratio: 16 / 9;
  }
  .cover-preview.ratio-16-9 img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .cover-preview.ratio-4-3 {
    aspect-ratio: 4 / 3;
  }
  .cover-preview.ratio-4-3 img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .ratio-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 6px;
  }

  .ratio-toggle {
    display: flex;
    gap: 2px;
    background: #f5f5f5;
    border-radius: 5px;
    padding: 2px;
  }

  .ratio-btn {
    padding: 2px 7px;
    font-size: 10px;
    font-weight: 500;
    color: #999;
    border: none;
    border-radius: 4px;
    background: none;
    cursor: pointer;
    transition: all 0.1s;
    white-space: nowrap;
  }

  .ratio-btn:hover { color: #555; }
  .ratio-btn.active {
    background: #fff;
    color: #111;
    box-shadow: 0 1px 3px rgba(0,0,0,0.06);
  }

  /* ── Preview cover aspect ratios ── */
  .preview-cover {
    margin-bottom: 24px;
    border-radius: 8px;
    overflow: hidden;
  }

  .preview-cover img {
    width: 100%;
    max-height: 400px;
    object-fit: cover;
    display: block;
  }

  .preview-cover.ratio-16-9 {
    aspect-ratio: 16 / 9;
  }
  .preview-cover.ratio-16-9 img {
    width: 100%;
    height: 100%;
    max-height: none;
    object-fit: cover;
  }

  .preview-cover.ratio-4-3 {
    aspect-ratio: 4 / 3;
  }
  .preview-cover.ratio-4-3 img {
    width: 100%;
    height: 100%;
    max-height: none;
    object-fit: cover;
  }

  .opt-actions {
    display: flex;
    flex-direction: column;
    gap: 6px;
    padding-top: 4px;
  }

  .save-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    padding: 8px;
    background: #111;
    color: #fff;
    border: none;
    border-radius: 6px;
    font-size: 12px;
    font-weight: 500;
    cursor: pointer;
    transition: opacity 0.12s;
  }

  .save-btn:hover { opacity: 0.85; }
  .save-btn:disabled { opacity: 0.5; cursor: not-allowed; }

  .publish-btn {
    padding: 7px;
    background: #fff;
    color: #111;
    border: 1px solid #e5e5e5;
    border-radius: 6px;
    font-size: 12px;
    font-weight: 450;
    cursor: pointer;
    transition: border-color 0.12s;
    text-align: center;
  }

  .publish-btn:hover { border-color: #111; }
  .publish-btn:disabled { opacity: 0.5; cursor: not-allowed; }

  /* ── Preview pane ── */
  .preview-pane {
    display: flex;
    flex-direction: column;
    min-height: 0;
    overflow: hidden;
    background: #fafafa;
  }

  .preview-header {
    padding: 10px 24px;
    border-bottom: 1px solid #e5e5e5;
    background: #fff;
  }

  .preview-header .mono {
    font-size: 11px;
    color: #999;
    letter-spacing: 0.06em;
  }

  .preview-body {
    flex: 1;
    overflow-y: auto;
    padding: 32px 32px 120px;
  }

  .preview-title {
    font-size: 2rem;
    font-weight: 600;
    line-height: 1.2;
    letter-spacing: -0.02em;
    color: #111;
    margin-bottom: 24px;
  }

  /* ── Markdown rendered content ── */
  .markdown-content {
    font-size: 15px;
    line-height: 1.75;
    color: #222;
  }

  .markdown-content :global(h1) { font-size: 1.75rem; font-weight: 600; margin: 1.5em 0 0.5em; }
  .markdown-content :global(h2) { font-size: 1.4rem; font-weight: 600; margin: 1.4em 0 0.4em; }
  .markdown-content :global(h3) { font-size: 1.15rem; font-weight: 600; margin: 1.2em 0 0.3em; }
  .markdown-content :global(p) { margin: 0.8em 0; }
  .markdown-content :global(a) { color: #111; text-decoration: underline; text-underline-offset: 2px; }
  .markdown-content :global(a:hover) { opacity: 0.7; }
  .markdown-content :global(strong) { font-weight: 600; }
  .markdown-content :global(em) { font-style: italic; }
  .markdown-content :global(ul), .markdown-content :global(ol) { margin: 0.8em 0; padding-left: 1.5em; }
  .markdown-content :global(li) { margin: 0.3em 0; }
  .markdown-content :global(blockquote) {
    border-left: 3px solid #e5e5e5;
    padding: 0.5em 0 0.5em 1em;
    margin: 1em 0;
    color: #666;
    font-style: italic;
  }
  .markdown-content :global(code) {
    font-family: 'Geist Mono Variable', 'SF Mono', monospace;
    font-size: 0.875em;
    background: #f0f0f0;
    padding: 0.15em 0.4em;
    border-radius: 4px;
  }
  .markdown-content :global(pre) {
    background: #111;
    color: #e5e5e5;
    padding: 16px 20px;
    border-radius: 8px;
    overflow-x: auto;
    margin: 1em 0;
    font-size: 0.875em;
    line-height: 1.6;
  }
  .markdown-content :global(pre code) {
    background: none;
    padding: 0;
    color: inherit;
  }
  .markdown-content :global(hr) {
    border: none;
    border-top: 1px solid #e5e5e5;
    margin: 2em 0;
  }
  .markdown-content :global(img) {
    max-width: 100%;
    border-radius: 6px;
    margin: 1em 0;
  }
  .markdown-content :global(table) {
    width: 100%;
    border-collapse: collapse;
    margin: 1em 0;
  }
  .markdown-content :global(th),
  .markdown-content :global(td) {
    padding: 8px 12px;
    border: 1px solid #e5e5e5;
    text-align: left;
    font-size: 0.9em;
  }
  .markdown-content :global(th) {
    background: #f5f5f5;
    font-weight: 600;
  }

  /* ── Type switcher ── */
  .type-switcher {
    position: relative;
    margin-left: 8px;
  }

  .type-trigger {
    display: flex;
    align-items: center;
    gap: 4px;
    padding: 4px 10px;
    font-size: 11px;
    font-weight: 500;
    color: #666;
    border: 1px solid #e5e5e5;
    border-radius: 5px;
    background: #fff;
    cursor: pointer;
    transition: border-color 0.12s;
  }

  .type-trigger:hover { border-color: #111; color: #111; }

  .type-menu {
    position: absolute;
    top: calc(100% + 4px);
    left: 0;
    background: #fff;
    border: 1px solid #e5e5e5;
    border-radius: 8px;
    padding: 4px;
    min-width: 120px;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.06);
    z-index: 50;
    animation: type-menu-in 0.1s ease-out;
  }

  @keyframes type-menu-in {
    from { opacity: 0; transform: translateY(-4px); }
    to { opacity: 1; transform: translateY(0); }
  }

  .type-option {
    display: block;
    width: 100%;
    padding: 7px 12px;
    font-size: 13px;
    color: #555;
    border-radius: 5px;
    background: none;
    border: none;
    cursor: pointer;
    text-align: left;
    transition: background 0.1s;
  }

  .type-option:hover { background: #f5f5f5; }
  .type-option.active { color: #111; font-weight: 500; }

  @media (max-width: 768px) {
    .editor-layout {
      grid-template-columns: 1fr;
      grid-template-rows: 1fr 1fr;
    }
    .editor-pane {
      border-right: none;
      border-bottom: 1px solid #e5e5e5;
    }
    .options-panel {
      max-width: 240px;
    }
  }
</style>
