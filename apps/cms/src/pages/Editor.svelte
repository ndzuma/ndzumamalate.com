<script>
  import Shell from '../components/Shell.svelte';
  import Switch from '../components/Switch.svelte';
  import Uploader from '../components/Uploader.svelte';
  import { navigate } from '../lib/router.svelte.js';
  import { projects, blogs, tags as tagsApi } from '../lib/api.js';
  import { toast } from '../lib/toast.svelte.js';
  import markdownit from 'markdown-it';
  import { FloppyDisk, PaperPlaneTilt, Plus, Image, X, ArrowUp, ArrowDown, TextAlignLeft, SlidersHorizontal, Eye, ArrowSquareOut } from 'phosphor-svelte';

  /** @type {{ type: string, id: string | null }} */
  let { type = 'project', id = null } = $props();

  const isProject = $derived(type === 'project');
  const kind = $derived(isProject ? 'project' : 'writing');
  const collectionHref = $derived(isProject ? '/collection/projects' : '/collection/writings');
  const pageTitle = $derived(id ? (title || `Edit ${kind}`) : `New ${kind}`);

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
  let startDate = $state('');
  let endDate = $state('');
  let isPresent = $state(false);

  let allTags = $state([]);
  let saving = $state(false);
  let loading = $state(false);
  let slugTouched = $state(false);

  // 'details' | 'content'
  let tab = $state('details');
  let showPreview = $state(true);

  const cover = $derived(isProject ? imageUrl : coverImageUrl);
  function setCover(url) {
    if (isProject) imageUrl = url;
    else coverImageUrl = url;
  }

  // ── Cover image upload (drag & drop) ──
  let isDraggingImg = $state(false);

  async function uploadViaUploadthing(fileList) {
    const formData = new FormData();
    for (const file of fileList) formData.append("files", file);
    const token = import.meta.env.VITE_UPLOADTHING_TOKEN;
    const decoded = JSON.parse(atob(token));
    const res = await fetch("https://api.uploadthing.com/v6/uploadFiles", {
      method: "POST",
      headers: { "x-uploadthing-api-key": decoded.apiKey },
      body: formData,
    });
    if (!res.ok) throw new Error(`Upload failed: ${res.statusText}`);
    return res.json();
  }

  async function uploadCoverImage(file) {
    toast('Uploading cover image…', 'info');
    try {
      const response = await uploadViaUploadthing([file]);
      if (response[0]?.data?.url) setCover(response[0].data.url);
      else toast('Failed to upload', 'error');
    } catch (e) {
      toast('Upload failed', 'error');
    }
  }

  // ── Tag ordering (projects) ──
  function moveTagOrder(index, dir) {
    const newIdx = index + dir;
    if (newIdx < 0 || newIdx >= tagIds.length) return;
    const temp = tagIds[index];
    tagIds[index] = tagIds[newIdx];
    tagIds[newIdx] = temp;
  }

  // ── Inline tag creation ──
  let newTagName = $state('');
  let creatingTag = $state(false);

  // ── Derived preview ──
  const rendered = $derived(md.render(content || ''));
  const wordCount = $derived((content || '').trim().split(/\s+/).filter(Boolean).length);

  // ── Auto-slug from title ──
  function updateSlug() {
    if (!id && !slugTouched) {
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
          startDate = item.start_date ? item.start_date.split('T')[0] : '';
          endDate = item.end_date ? item.end_date.split('T')[0] : '';
          isPresent = !item.end_date && !!item.start_date;
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
    if (!title.trim()) {
      toast('Add a title first', 'error');
      tab = 'details';
      return;
    }
    saving = true;
    try {
      if (andPublish) published = true;
      const resolvedTagIds = resolveTagIds();

      if (isProject) {
        const data = {
          title, slug, summary, content,
          image_url: imageUrl,
          live_url: liveUrl,
          repo_url: repoUrl,
          featured, published,
          sort_order: sortOrder,
          start_date: startDate,
          end_date: isPresent ? '' : endDate,
          tag_ids: resolvedTagIds,
        };
        if (id) {
          await projects.update(id, data);
          toast(andPublish ? 'Published' : 'Project saved');
        } else {
          const created = await projects.create(data);
          if (created?.id) {
            id = created.id;
            navigate(`/editor/project/${created.id}`);
            toast(andPublish ? 'Published' : 'Project created');
          }
        }
      } else {
        const data = {
          title, slug, summary, content,
          cover_image_url: coverImageUrl,
          published,
          published_at: publishedAt ? `${publishedAt}T00:00:00Z` : '',
          tag_ids: resolvedTagIds,
        };
        if (id) {
          await blogs.update(id, data);
          toast(andPublish ? 'Published' : 'Writing saved');
        } else {
          const created = await blogs.create(data);
          if (created?.id) {
            id = created.id;
            navigate(`/editor/blog/${created.id}`);
            toast(andPublish ? 'Published' : 'Writing created');
          }
        }
      }
    } catch (e) {
      toast(e.message || 'Failed to save', 'error');
    }
    saving = false;
  }

  function handleEditorKeydown(e) {
    // Cmd/Ctrl+S is handled by the window listener.
    if (e.key === 'Tab') {
      e.preventDefault();
      const target = e.target;
      const start = target.selectionStart;
      const end = target.selectionEnd;
      content = content.substring(0, start) + '  ' + content.substring(end);
      requestAnimationFrame(() => {
        target.selectionStart = target.selectionEnd = start + 2;
      });
    }
  }

  function handleGlobalKeydown(e) {
    if ((e.metaKey || e.ctrlKey) && e.key === 's') {
      e.preventDefault();
      save();
    }
  }

  function isTagSelected(tag) {
    return tagIds.includes(tag.id) || tagIds.includes(tag.slug);
  }

  function toggleTag(tag) {
    if (isTagSelected(tag)) {
      tagIds = tagIds.filter(t => t !== tag.id && t !== tag.slug);
    } else {
      tagIds = [...tagIds, tag.id];
    }
  }

  async function deleteTag(tagId) {
    if (!confirm('Permanently delete this tag from all projects and writings?')) return;
    try {
      await tagsApi.delete(tagId);
      allTags = allTags.filter(t => t.id !== tagId);
      tagIds = tagIds.filter(t => t !== tagId);
      toast('Tag deleted');
    } catch (_) {
      toast('Failed to delete tag', 'error');
    }
  }

  // Resolve tagIds which might be slugs (from load) to UUIDs for save
  function resolveTagIds() {
    return tagIds.map(idOrSlug => {
      if (idOrSlug.length === 36 && idOrSlug.includes('-')) return idOrSlug;
      const found = allTags.find(t => t.slug === idOrSlug);
      return found?.id || idOrSlug;
    });
  }

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
    } catch (_) {
      toast('Failed to create tag', 'error');
    }
    creatingTag = false;
  }

  // ── Drag and drop image upload into markdown ──
  let isDragging = $state(false);
  async function handleDrop(e) {
    e.preventDefault();
    isDragging = false;

    const files = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith('image/'));
    if (!files.length) return;

    toast('Uploading image…', 'info');
    try {
      const response = await uploadViaUploadthing(files);
      for (const result of response) {
        if (result.data?.url) {
          const imgMarkdown = `\n![${result.data.name || 'image'}](${result.data.url})\n`;
          const target = e.target;
          if (target && target.tagName === 'TEXTAREA') {
            const start = target.selectionStart;
            const end = target.selectionEnd;
            content = content.substring(0, start) + imgMarkdown + content.substring(end);
            requestAnimationFrame(() => {
              target.selectionStart = target.selectionEnd = start + imgMarkdown.length;
            });
          } else {
            content += imgMarkdown;
          }
        } else if (result.error) {
          toast('Failed to upload image: ' + result.error.message, 'error');
        }
      }
    } catch (err) {
      toast('Failed to upload image', 'error');
    }
  }

  const liveHref = $derived(slug ? `https://ndzumamalate.com/${isProject ? 'projects' : 'writings'}/${slug}` : null);
</script>

<svelte:window onkeydown={handleGlobalKeydown} />

<Shell title={pageTitle} crumbs={[{ label: isProject ? 'Projects' : 'Writings', href: collectionHref }]} width="full" flush>
  {#snippet actions()}
    <div class="seg">
      <button class="seg-btn" class:active={tab === 'details'} onclick={() => tab = 'details'}>
        <SlidersHorizontal size={13} /> Details
      </button>
      <button class="seg-btn" class:active={tab === 'content'} onclick={() => tab = 'content'}>
        <TextAlignLeft size={13} /> Content
      </button>
    </div>
    {#if liveHref && published}
      <a class="btn btn-ghost btn-icon" href={liveHref} target="_blank" rel="noopener noreferrer" title="View live"><ArrowSquareOut size={15} /></a>
    {/if}
    <button class="btn btn-secondary" onclick={() => save()} disabled={saving}>
      <FloppyDisk size={14} />
      {saving ? 'Saving…' : 'Save'}
    </button>
    {#if !published}
      <button class="btn btn-primary" onclick={() => save(true)} disabled={saving}>
        <PaperPlaneTilt size={14} weight="fill" />
        Publish
      </button>
    {:else}
      <span class="badge badge-success live-badge">Live</span>
    {/if}
  {/snippet}

  {#if loading}
    <div class="loader-inline">Loading…</div>
  {:else if tab === 'details'}
    <div class="details">
      <div class="details-grid">
        <div class="col">
          <div class="card card-pad group">
            <div class="field">
              <label for="title">Title</label>
              <input id="title" bind:value={title} oninput={updateSlug} placeholder={isProject ? 'Project name' : 'Post title'} />
            </div>
            <div class="field">
              <label for="slug">Slug</label>
              <div class="slug-row">
                <span class="slug-prefix">/{isProject ? 'projects' : 'writings'}/</span>
                <input id="slug" bind:value={slug} oninput={() => slugTouched = true} placeholder="auto-generated" />
              </div>
            </div>
            <div class="field">
              <label for="summary">Short description</label>
              <textarea id="summary" bind:value={summary} placeholder="One or two sentences shown under the cover." rows="3"></textarea>
            </div>
          </div>

          {#if isProject}
            <div class="card card-pad group">
              <div class="card-title">Links</div>
              <div class="field-row">
                <div class="field">
                  <label for="live">Live URL</label>
                  <input id="live" bind:value={liveUrl} placeholder="https://…" />
                </div>
                <div class="field">
                  <label for="repo">Repository</label>
                  <input id="repo" bind:value={repoUrl} placeholder="https://github.com/…" />
                </div>
              </div>
            </div>

            <div class="card card-pad group">
              <div class="card-title">Timeline</div>
              <div class="field-row">
                <div class="field">
                  <label for="start">Start date</label>
                  <input id="start" type="date" bind:value={startDate} />
                </div>
                <div class="field">
                  <label for="end">End date</label>
                  <input id="end" type="date" bind:value={endDate} disabled={isPresent} />
                </div>
              </div>
              <Switch bind:checked={isPresent} label="Ongoing" hint="Shows “present” instead of an end date." />
            </div>
          {:else}
            <div class="card card-pad group">
              <div class="field">
                <label for="pub">Published date</label>
                <input id="pub" type="date" bind:value={publishedAt} />
              </div>
            </div>
          {/if}

          <div class="card card-pad group">
            <div class="card-title">Visibility</div>
            <Switch bind:checked={published} label="Published" hint="Visible on the public site." />
            {#if isProject}
              <div class="divider"></div>
              <Switch bind:checked={featured} label="Featured" hint="Shown in the homepage carousel." />
            {/if}
          </div>
        </div>

        <div class="col">
          <div class="card card-pad group">
            <div class="head">
              <div class="card-title">Cover image</div>
              {#if cover}
                <button class="btn btn-ghost btn-sm" onclick={() => setCover('')}><X size={12} /> Remove</button>
              {/if}
            </div>
            <div
              class="dropzone"
              class:dragging={isDraggingImg}
              class:has-image={!!cover}
              role="button"
              tabindex="0"
              ondrop={(e) => {
                e.preventDefault();
                isDraggingImg = false;
                const files = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith('image/'));
                if (files.length) uploadCoverImage(files[0]);
              }}
              ondragover={(e) => { e.preventDefault(); isDraggingImg = true; }}
              ondragleave={() => isDraggingImg = false}
            >
              {#if cover}
                <img src={cover} alt="Cover" />
              {:else}
                <div class="dropzone-empty">
                  <span class="dropzone-icon"><Image size={22} /></span>
                  <span>Drag & drop an image</span>
                  <Uploader onUpload={(url) => setCover(url)} label="Browse" />
                </div>
              {/if}
            </div>
            <input value={cover} oninput={(e) => setCover(e.target.value)} placeholder="…or paste an image URL" />
          </div>

          <div class="card card-pad group">
            <div class="card-title">Tags</div>
            {#if allTags.length > 0}
              <div class="tags">
                {#each allTags as tag}
                  <span class="tag-wrap">
                    <button class="tag" class:active={isTagSelected(tag)} onclick={() => toggleTag(tag)}>{tag.name}</button>
                    <button class="tag-x" onclick={(e) => { e.stopPropagation(); deleteTag(tag.id); }} title="Delete tag">&times;</button>
                  </span>
                {/each}
              </div>
            {:else}
              <span class="muted small">No tags yet</span>
            {/if}
            <div class="tag-create">
              <input bind:value={newTagName} placeholder="New tag" onkeydown={(e) => e.key === 'Enter' && (e.preventDefault(), createTag())} />
              <button class="btn btn-secondary btn-icon" onclick={createTag} disabled={creatingTag || !newTagName.trim()} title="Add tag"><Plus size={14} weight="bold" /></button>
            </div>

            {#if isProject && tagIds.length > 1}
              <div class="divider"></div>
              <div class="card-subtitle">Order shown on the project page</div>
              <div class="tag-order">
                {#each tagIds as tId, i}
                  {@const t = allTags.find(x => x.id === tId || x.slug === tId)}
                  {#if t}
                    <div class="tag-order-item">
                      <span>{t.name}</span>
                      <div class="tag-order-actions">
                        <button class="btn btn-ghost btn-icon btn-sm" onclick={() => moveTagOrder(i, -1)} disabled={i === 0}><ArrowUp size={12} /></button>
                        <button class="btn btn-ghost btn-icon btn-sm" onclick={() => moveTagOrder(i, 1)} disabled={i === tagIds.length - 1}><ArrowDown size={12} /></button>
                      </div>
                    </div>
                  {/if}
                {/each}
              </div>
            {/if}
          </div>
        </div>
      </div>
    </div>
  {:else}
    <div class="content-layout" class:split={showPreview}>
      <div class="editor-pane">
        <div class="pane-head">
          <span class="muted small">Markdown · {wordCount} words · drop images to upload</span>
          <button class="btn btn-ghost btn-sm" onclick={() => showPreview = !showPreview}>
            <Eye size={13} /> {showPreview ? 'Hide preview' : 'Show preview'}
          </button>
        </div>
        <textarea
          class="editor-textarea"
          class:dragging={isDragging}
          bind:value={content}
          onkeydown={handleEditorKeydown}
          ondrop={handleDrop}
          ondragover={(e) => { e.preventDefault(); isDragging = true; }}
          ondragleave={(e) => { e.preventDefault(); isDragging = false; }}
          placeholder="Start writing markdown…"
          spellcheck="true"
        ></textarea>
      </div>

      {#if showPreview}
        <div class="preview-pane">
          <div class="pane-head"><span class="muted small">Preview</span></div>
          <div class="preview-body">
            {#if cover}
              <div class="preview-cover"><img src={cover} alt="Cover" /></div>
            {/if}
            {#if title}
              <h1 class="preview-title">{title}</h1>
            {/if}
            {#if summary}
              <p class="preview-summary">{summary}</p>
            {/if}
            <div class="markdown-content">
              {@html rendered}
            </div>
          </div>
        </div>
      {/if}
    </div>
  {/if}
</Shell>

<style>
  .seg {
    display: inline-flex;
    padding: 3px;
    background: var(--surface-3);
    border-radius: var(--radius);
    gap: 2px;
  }
  .seg-btn {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    height: 30px;
    padding: 0 12px;
    border-radius: 8px;
    font-size: 12.5px;
    font-weight: 500;
    color: var(--text-3);
    transition: all 0.15s var(--ease);
  }
  .seg-btn:hover { color: var(--text); }
  .seg-btn.active { background: var(--surface); color: var(--text); box-shadow: var(--shadow-sm); }
  .live-badge { height: 30px; padding: 0 12px; }

  /* ── Details tab ── */
  .details { padding: 28px 24px 80px; max-width: 1180px; margin: 0 auto; width: 100%; }
  .details-grid { display: grid; grid-template-columns: 1.15fr 1fr; gap: 16px; align-items: start; }
  .col { display: flex; flex-direction: column; gap: 14px; }
  .group { display: flex; flex-direction: column; gap: 16px; }
  .head { display: flex; align-items: center; justify-content: space-between; }

  .slug-row {
    display: flex;
    align-items: center;
    border: 1px solid var(--border);
    border-radius: var(--radius);
    background: var(--surface);
    overflow: hidden;
  }
  .slug-row:focus-within { border-color: var(--text); box-shadow: 0 0 0 3px rgba(17, 19, 24, 0.06); }
  .slug-prefix { padding: 0 0 0 12px; font-size: 13px; color: var(--text-4); white-space: nowrap; }
  .slug-row input { border: none; border-radius: 0; box-shadow: none; padding-left: 2px; }
  .slug-row input:focus { box-shadow: none; }

  .dropzone {
    position: relative;
    border: 1.5px dashed var(--border-strong);
    border-radius: var(--radius);
    background: var(--surface-2);
    min-height: 190px;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
    transition: border-color 0.15s, background 0.15s;
  }
  .dropzone.dragging { border-color: var(--accent); background: var(--accent-soft); }
  .dropzone.has-image { border-style: solid; border-color: var(--border); background: var(--surface-3); padding: 0; }
  .dropzone img { width: 100%; max-height: 260px; object-fit: cover; display: block; }
  .dropzone-empty { display: flex; flex-direction: column; align-items: center; gap: 10px; color: var(--text-3); font-size: 13px; padding: 20px; }
  .dropzone-icon {
    width: 40px;
    height: 40px;
    border-radius: 12px;
    background: var(--surface);
    border: 1px solid var(--border);
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--text-2);
  }

  .tags { display: flex; flex-wrap: wrap; gap: 6px; }
  .tag-wrap { position: relative; display: inline-flex; }
  .tag {
    height: 28px;
    padding: 0 24px 0 11px;
    border-radius: 999px;
    border: 1px solid var(--border);
    background: var(--surface);
    font-size: 12.5px;
    color: var(--text-2);
    transition: all 0.12s;
  }
  .tag:hover { border-color: var(--border-strong); color: var(--text); }
  .tag.active { background: var(--text); color: #fff; border-color: var(--text); }
  .tag-x {
    position: absolute;
    right: 6px;
    top: 50%;
    transform: translateY(-50%);
    width: 16px;
    height: 16px;
    border-radius: 50%;
    font-size: 13px;
    line-height: 1;
    color: var(--text-4);
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .tag.active + .tag-x { color: rgba(255, 255, 255, 0.6); }
  .tag-x:hover { background: var(--danger); color: #fff; }

  .tag-create { display: flex; gap: 8px; }

  .tag-order { display: flex; flex-direction: column; gap: 6px; }
  .tag-order-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 6px 6px 6px 12px;
    background: var(--surface-2);
    border-radius: var(--radius-sm);
    font-size: 13px;
  }
  .tag-order-actions { display: flex; gap: 2px; }

  /* ── Content tab ── */
  .content-layout {
    flex: 1;
    display: grid;
    grid-template-columns: 1fr;
    min-height: calc(100vh - 60px);
  }
  .content-layout.split { grid-template-columns: 1fr 1fr; }

  .editor-pane, .preview-pane {
    display: flex;
    flex-direction: column;
    min-height: 0;
  }
  .editor-pane { background: var(--surface); border-right: 1px solid var(--border); }
  .preview-pane { background: var(--bg); }

  .pane-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: 40px;
    padding: 0 20px;
    border-bottom: 1px solid var(--border);
    flex-shrink: 0;
  }

  .editor-textarea {
    flex: 1;
    resize: none;
    border: none;
    border-radius: 0;
    outline: none;
    padding: 24px 28px 120px;
    font-family: var(--mono);
    font-size: 13.5px;
    line-height: 1.75;
    color: var(--text);
    background: var(--surface);
    box-shadow: none;
    min-height: 60vh;
  }
  .editor-textarea:focus { box-shadow: none; }
  .editor-textarea.dragging { box-shadow: inset 0 0 0 2px var(--accent); background: var(--accent-soft); }

  .preview-body {
    flex: 1;
    overflow-y: auto;
    padding: 32px 36px 120px;
    max-width: 760px;
    width: 100%;
  }
  .preview-cover { border-radius: 12px; overflow: hidden; margin-bottom: 24px; background: var(--surface-3); }
  .preview-cover img { width: 100%; max-height: 360px; object-fit: cover; display: block; }
  .preview-title { font-size: 2rem; font-weight: 600; line-height: 1.15; letter-spacing: -0.02em; margin-bottom: 10px; }
  .preview-summary { font-size: 16px; color: var(--text-2); margin-bottom: 24px; line-height: 1.6; }

  .markdown-content { font-size: 15px; line-height: 1.75; color: #222; }
  .markdown-content :global(h1) { font-size: 1.75rem; font-weight: 600; margin: 1.5em 0 0.5em; }
  .markdown-content :global(h2) { font-size: 1.4rem; font-weight: 600; margin: 1.4em 0 0.4em; }
  .markdown-content :global(h3) { font-size: 1.15rem; font-weight: 600; margin: 1.2em 0 0.3em; }
  .markdown-content :global(p) { margin: 0.8em 0; }
  .markdown-content :global(a) { color: var(--text); text-decoration: underline; text-underline-offset: 2px; }
  .markdown-content :global(strong) { font-weight: 600; }
  .markdown-content :global(ul), .markdown-content :global(ol) { margin: 0.8em 0; padding-left: 1.5em; }
  .markdown-content :global(li) { margin: 0.3em 0; }
  .markdown-content :global(blockquote) { border-left: 3px solid var(--border-strong); padding: 0.5em 0 0.5em 1em; margin: 1em 0; color: var(--text-2); font-style: italic; }
  .markdown-content :global(code) { font-family: var(--mono); font-size: 0.875em; background: var(--surface-3); padding: 0.15em 0.4em; border-radius: 4px; }
  .markdown-content :global(pre) { background: #111318; color: #e5e5e5; padding: 16px 20px; border-radius: 10px; overflow-x: auto; margin: 1em 0; font-size: 0.875em; line-height: 1.6; }
  .markdown-content :global(pre code) { background: none; padding: 0; color: inherit; }
  .markdown-content :global(hr) { border: none; border-top: 1px solid var(--border); margin: 2em 0; }
  .markdown-content :global(img) { max-width: 100%; border-radius: 8px; margin: 1em 0; }
  .markdown-content :global(table) { width: 100%; border-collapse: collapse; margin: 1em 0; }
  .markdown-content :global(th), .markdown-content :global(td) { padding: 8px 12px; border: 1px solid var(--border); text-align: left; font-size: 0.9em; }
  .markdown-content :global(th) { background: var(--surface-2); font-weight: 600; }

  @media (max-width: 900px) {
    .details-grid { grid-template-columns: 1fr; }
    .content-layout.split { grid-template-columns: 1fr; }
    .editor-pane { border-right: none; border-bottom: 1px solid var(--border); }
    .editor-textarea { min-height: 50vh; }
  }
</style>
