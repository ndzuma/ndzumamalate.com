<script>
  import Shell from '../components/Shell.svelte';
  import { toast } from '../lib/toast.svelte.js';
  import { navigate } from '../lib/router.svelte.js';
  import { projects, blogs, skills, experience, cv, tags } from '../lib/api.js';
  import { Trash, PencilSimple, Plus, ArrowUp, ArrowDown, CheckCircle, Check, X, MagnifyingGlass } from 'phosphor-svelte';

  /** @type {{ type: string }} */
  let { type = 'projects' } = $props();

  const meta = {
    projects: { label: 'Projects', singular: 'project', api: projects, columns: ['title', 'slug', 'published', 'featured'], create: '/editor/project' },
    writings: { label: 'Writings', singular: 'writing', api: blogs, columns: ['title', 'slug', 'published'], create: '/editor/blog' },
    skills: { label: 'Skills', singular: 'skill', api: skills, columns: ['name', 'category', 'proficiency'], create: '/skills/new' },
    experience: { label: 'Experience', singular: 'experience', api: experience, columns: ['company', 'role', 'type', 'location'], create: '/experience/new' },
    cv: { label: 'CV', singular: 'CV', api: cv, columns: ['label', 'file_url', 'is_active'], create: '/cv/new' },
    tags: { label: 'Tags', singular: 'tag', api: tags, columns: ['name', 'slug', 'filter'], create: null },
  };

  const current = $derived(meta[type] || meta.projects);

  let items = $state([]);
  let allTags = $state([]);
  let loading = $state(true);
  let search = $state('');

  const filtered = $derived(
    search.trim()
      ? items.filter((it) => current.columns.some((c) => String(it[c] ?? '').toLowerCase().includes(search.trim().toLowerCase())))
      : items
  );

  async function load() {
    loading = true;
    try {
      const [list, t] = await Promise.all([
        current.api.list().catch(() => []),
        type === 'projects' || type === 'writings' ? tags.list().catch(() => []) : Promise.resolve([]),
      ]);
      items = list || [];
      allTags = t || [];
    } catch (_) {
      items = [];
    }
    loading = false;
  }

  $effect(() => {
    type;
    search = '';
    editingTag = null;
    load();
  });

  function editItem(item) {
    if (type === 'projects') navigate(`/editor/project/${item.id}`);
    else if (type === 'writings') navigate(`/editor/blog/${item.id}`);
    else if (type === 'skills') navigate(`/skills/${item.id}`);
    else if (type === 'experience') navigate(`/experience/${item.id}`);
    else if (type === 'cv') navigate(`/cv/${item.id}`);
    else if (type === 'tags') editTag(item);
  }

  // ── Inline tag editing / creation ──
  let editingTag = $state(null);
  let tagForm = $state({ name: '', slug: '', filter: false });
  let newTagName = $state('');

  function editTag(item) {
    editingTag = item.id;
    tagForm = { name: item.name, slug: item.slug, filter: item.filter };
  }

  async function saveTag() {
    if (!editingTag) return;
    try {
      await tags.update(editingTag, tagForm);
      editingTag = null;
      await load();
      toast('Tag updated');
    } catch (_) {
      toast('Failed to update tag', 'error');
    }
  }

  async function createTag() {
    const name = newTagName.trim();
    if (!name) return;
    try {
      const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
      await tags.create({ name, slug, filter: false });
      newTagName = '';
      await load();
      toast('Tag created');
    } catch (_) {
      toast('Failed to create tag', 'error');
    }
  }

  // ── Project reorder ──
  async function moveProject(index, direction) {
    const item = items[index];
    if (!item) return;
    try {
      await projects.reorder(item.id, direction);
      await load();
    } catch (_) {
      toast('Failed to reorder', 'error');
    }
  }

  function resolveTagIds(slugs) {
    if (!slugs) return [];
    return slugs.map((slug) => allTags.find((t) => t.slug === slug)?.id || slug);
  }

  async function toggleProjectBool(item, field) {
    try {
      const payload = {
        title: item.title,
        slug: item.slug,
        summary: item.summary,
        content: item.content,
        image_url: item.image_url,
        live_url: item.live_url,
        repo_url: item.repo_url,
        featured: item.featured,
        published: item.published,
        sort_order: item.sort_order,
        start_date: item.start_date ? item.start_date.split('T')[0] : '',
        end_date: item.end_date ? item.end_date.split('T')[0] : '',
        tag_ids: resolveTagIds(item.tags),
      };
      payload[field] = !item[field];
      await projects.update(item.id, payload);
      await load();
      toast('Project updated');
    } catch (_) {
      toast('Failed to update project', 'error');
    }
  }

  async function toggleBlogBool(item, field) {
    try {
      const payload = {
        title: item.title,
        slug: item.slug,
        summary: item.summary,
        content: item.content,
        cover_image_url: item.cover_image_url,
        published: item.published,
        published_at: item.published_at || '',
        tag_ids: resolveTagIds(item.tags),
      };
      payload[field] = !item[field];
      await blogs.update(item.id, payload);
      await load();
      toast('Writing updated');
    } catch (_) {
      toast('Failed to update writing', 'error');
    }
  }

  async function toggleCvActive(item) {
    try {
      await cv.update(item.id, { file_url: item.file_url, label: item.label, is_active: !item.is_active });
      await load();
      toast(item.is_active ? 'CV deactivated' : 'CV set as active');
    } catch (_) {
      toast('Failed to update CV', 'error');
    }
  }

  async function toggleTagFilter(item) {
    try {
      await tags.update(item.id, { name: item.name, slug: item.slug, filter: !item.filter });
      await load();
      toast(item.filter ? 'Tag hidden from filters' : 'Tag shown in filters');
    } catch (_) {
      toast('Failed to update tag', 'error');
    }
  }

  // ── Two-click delete ──
  let deleteConfirmId = $state(null);
  let deleteTimeout = null;

  function requestDelete(item) {
    if (deleteConfirmId === item.id) {
      clearTimeout(deleteTimeout);
      executeDelete(item);
    } else {
      clearTimeout(deleteTimeout);
      deleteConfirmId = item.id;
      deleteTimeout = setTimeout(() => { deleteConfirmId = null; }, 3000);
    }
  }

  async function executeDelete(item) {
    deleteConfirmId = null;
    try {
      await current.api.delete(item.id);
      await load();
      toast(`${current.singular.charAt(0).toUpperCase() + current.singular.slice(1)} deleted`);
    } catch (_) {
      toast('Failed to delete', 'error');
    }
  }

  function formatCell(col, value) {
    if (value === true) return 'Yes';
    if (value === false) return 'No';
    if (value === null || value === undefined || value === '') return '—';
    if (col === 'category') return String(value).replace(/_/g, ' ');
    if (typeof value === 'string' && value.length > 60) return value.slice(0, 60) + '…';
    return String(value);
  }

  function header(col) {
    return col.replace(/_/g, ' ').replace(/^\w/, (c) => c.toUpperCase());
  }
</script>

<Shell title={current.label} crumbs={[{ label: 'Collections' }]} width="wide">
  {#snippet actions()}
    {#if current.create}
      <button class="btn btn-primary" onclick={() => navigate(current.create)}>
        <Plus size={14} weight="bold" />
        New {current.singular}
      </button>
    {/if}
  {/snippet}

  <div class="page">
    <div class="toolbar">
      <div class="search">
        <MagnifyingGlass size={14} />
        <input placeholder="Filter {current.label.toLowerCase()}…" bind:value={search} />
      </div>
      <span class="muted small">{filtered.length} of {items.length}</span>
    </div>

    {#if type === 'tags'}
      <div class="card tag-create">
        <input
          placeholder="New tag name"
          bind:value={newTagName}
          onkeydown={(e) => e.key === 'Enter' && (e.preventDefault(), createTag())}
        />
        <button class="btn btn-secondary" onclick={createTag} disabled={!newTagName.trim()}>
          <Plus size={14} weight="bold" /> Add tag
        </button>
      </div>
    {/if}

    <div class="card table-card">
      {#if loading}
        <div class="loader-inline">Loading…</div>
      {:else if filtered.length === 0}
        <div class="loader-inline">No {current.label.toLowerCase()} found</div>
      {:else}
        <div class="table-wrap">
          <table class="table">
            <thead>
              <tr>
                {#each current.columns as col}
                  <th>{header(col)}</th>
                {/each}
                <th class="actions-col"></th>
              </tr>
            </thead>
            <tbody>
              {#each filtered as item, idx}
                <tr>
                  {#each current.columns as col}
                    <td>
                      {#if editingTag === item.id && type === 'tags'}
                        {#if col === 'name' || col === 'slug'}
                          <input class="inline-edit" bind:value={tagForm[col]} onkeydown={(e) => e.key === 'Enter' && saveTag()} />
                        {:else if col === 'filter'}
                          <label class="inline-check"><input type="checkbox" bind:checked={tagForm.filter} /> Show in filters</label>
                        {/if}
                      {:else if (col === 'published' || col === 'featured') && type === 'projects'}
                        <button class="pill" class:on={item[col]} onclick={() => toggleProjectBool(item, col)} title="Toggle {col}">
                          <CheckCircle size={12} weight={item[col] ? 'fill' : 'regular'} />
                          {item[col] ? (col === 'published' ? 'Live' : 'Featured') : (col === 'published' ? 'Draft' : 'No')}
                        </button>
                      {:else if col === 'published' && type === 'writings'}
                        <button class="pill" class:on={item[col]} onclick={() => toggleBlogBool(item, col)} title="Toggle published">
                          <CheckCircle size={12} weight={item[col] ? 'fill' : 'regular'} />
                          {item[col] ? 'Live' : 'Draft'}
                        </button>
                      {:else if col === 'is_active' && type === 'cv'}
                        <button class="pill" class:on={item.is_active} onclick={() => toggleCvActive(item)}>
                          <CheckCircle size={12} weight={item.is_active ? 'fill' : 'regular'} />
                          {item.is_active ? 'Active' : 'Inactive'}
                        </button>
                      {:else if col === 'filter' && type === 'tags'}
                        <button class="pill" class:on={item.filter} onclick={() => toggleTagFilter(item)}>
                          <CheckCircle size={12} weight={item.filter ? 'fill' : 'regular'} />
                          {item.filter ? 'Visible' : 'Hidden'}
                        </button>
                      {:else if col === 'title' || col === 'name' || col === 'company'}
                        <button class="cell-link" onclick={() => editItem(item)}>{formatCell(col, item[col])}</button>
                      {:else if col === 'file_url'}
                        <a class="muted" href={item[col]} target="_blank" rel="noopener noreferrer">{formatCell(col, item[col])}</a>
                      {:else}
                        <span class="muted">{formatCell(col, item[col])}</span>
                      {/if}
                    </td>
                  {/each}
                  <td class="actions-col">
                    <div class="row-actions">
                      {#if type === 'projects' && !search}
                        <button class="btn btn-ghost btn-icon btn-sm" onclick={() => moveProject(idx, -1)} disabled={idx === 0} title="Move up">
                          <ArrowUp size={14} />
                        </button>
                        <button class="btn btn-ghost btn-icon btn-sm" onclick={() => moveProject(idx, 1)} disabled={idx === filtered.length - 1} title="Move down">
                          <ArrowDown size={14} />
                        </button>
                      {/if}
                      {#if editingTag === item.id && type === 'tags'}
                        <button class="btn btn-primary btn-icon btn-sm" onclick={saveTag} title="Save"><Check size={14} weight="bold" /></button>
                        <button class="btn btn-ghost btn-icon btn-sm" onclick={() => editingTag = null} title="Cancel"><X size={14} /></button>
                      {:else}
                        <button class="btn btn-ghost btn-icon btn-sm" onclick={() => editItem(item)} title="Edit">
                          <PencilSimple size={14} />
                        </button>
                        <button
                          class="btn btn-sm {deleteConfirmId === item.id ? 'btn-danger' : 'btn-ghost btn-icon'}"
                          onclick={() => requestDelete(item)}
                          title={deleteConfirmId === item.id ? 'Click again to confirm' : 'Delete'}
                        >
                          {#if deleteConfirmId === item.id}
                            Confirm?
                          {:else}
                            <Trash size={14} />
                          {/if}
                        </button>
                      {/if}
                    </div>
                  </td>
                </tr>
              {/each}
            </tbody>
          </table>
        </div>
      {/if}
    </div>
  </div>
</Shell>

<style>
  .page { display: flex; flex-direction: column; gap: 14px; }

  .toolbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
  }

  .search {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 0 12px;
    height: 36px;
    width: 300px;
    max-width: 100%;
    border: 1px solid var(--border);
    border-radius: var(--radius);
    background: var(--surface);
    color: var(--text-3);
  }
  .search:focus-within { border-color: var(--text); }
  .search input { border: none; padding: 0; height: 100%; box-shadow: none; background: transparent; }
  .search input:focus { box-shadow: none; }

  .tag-create {
    display: flex;
    gap: 8px;
    padding: 10px;
    align-items: center;
  }
  .tag-create input { max-width: 320px; }

  .table-card { overflow: hidden; }
  .table-wrap { overflow-x: auto; }

  .actions-col { width: 1%; white-space: nowrap; }
  .row-actions { display: flex; align-items: center; gap: 2px; justify-content: flex-end; }

  .cell-link {
    font-weight: 500;
    color: var(--text);
    text-align: left;
    max-width: 100%;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .cell-link:hover { text-decoration: underline; text-underline-offset: 3px; }

  .pill {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    height: 24px;
    padding: 0 9px;
    border-radius: 999px;
    font-size: 11.5px;
    font-weight: 500;
    background: var(--surface-3);
    color: var(--text-3);
    border: 1px solid transparent;
    transition: all 0.12s;
  }
  .pill:hover { border-color: var(--border-strong); color: var(--text); }
  .pill.on { background: var(--success-soft); color: var(--success); }

  .inline-edit { max-width: 200px; padding: 5px 8px; font-size: 13px; }
  .inline-check { display: inline-flex; align-items: center; gap: 6px; font-size: 12px; color: var(--text-2); }
</style>
