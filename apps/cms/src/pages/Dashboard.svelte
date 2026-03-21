<script>
  import TopBar from '../components/TopBar.svelte';
  import BottomNav from '../components/BottomNav.svelte';
  import { toast } from '../lib/toast.svelte.js';
  import { navigate } from '../lib/router.svelte.js';
  import { getUser } from '../lib/auth.svelte.js';
  import { projects, blogs, skills, experience, cv, tags, auth } from '../lib/api.js';
  import { Star, Article, Lightning, Briefcase, FilePdf, Tag, Trash, PencilSimple, Plus, CaretDown, ArrowUp, ArrowDown, CheckCircle } from 'phosphor-svelte';

  // ── Data ──
  let featuredProjects = $state([]);
  let featuredPosts = $state([]);
  let allProjects = $state([]);
  let allBlogs = $state([]);
  let allSkills = $state([]);
  let allExperience = $state([]);
  let allCvs = $state([]);
  let allTags = $state([]);
  let loginActivities = $state([]);
  let loadingData = $state(true);

  // ── Active tab ──
  let activeTab = $state('projects');
  let dropdownOpen = $state(false);

  const tabOptions = [
    { value: 'projects', label: 'Projects', icon: Star },
    { value: 'blogs', label: 'Blogs', icon: Article },
    { value: 'skills', label: 'Skills', icon: Lightning },
    { value: 'experience', label: 'Experience', icon: Briefcase },
    { value: 'cv', label: 'CV', icon: FilePdf },
    { value: 'tags', label: 'Tags', icon: Tag },
  ];

  const activeLabel = $derived(tabOptions.find(t => t.value === activeTab)?.label || 'Projects');

  async function loadData() {
    loadingData = true;
    try {
      const [p, b, s, e, c, t, act] = await Promise.all([
        projects.list().catch(() => []),
        blogs.list().catch(() => []),
        skills.list().catch(() => []),
        experience.list().catch(() => []),
        cv.list().catch(() => []),
        tags.list().catch(() => []),
        auth.activity().catch(() => []),
      ]);
      loginActivities = act || [];
      allProjects = p || [];
      allBlogs = b || [];
      allSkills = s || [];
      allExperience = e || [];
      allCvs = c || [];
      allTags = t || [];
      featuredProjects = allProjects.filter(x => x.featured).slice(0, 3);
      featuredPosts = allBlogs.filter(x => x.published).slice(0, 3);
    } catch (_) {}
    loadingData = false;
  }

  loadData();

  function getTableData() {
    switch (activeTab) {
      case 'projects': return allProjects;
      case 'blogs': return allBlogs;
      case 'skills': return allSkills;
      case 'experience': return allExperience;
      case 'cv': return allCvs;
      case 'tags': return allTags;
      default: return [];
    }
  }

  function getTableColumns() {
    switch (activeTab) {
      case 'projects': return ['title', 'slug', 'published', 'featured'];
      case 'blogs': return ['title', 'slug', 'published'];
      case 'skills': return ['name', 'category', 'proficiency'];
      case 'experience': return ['company', 'role', 'location'];
      case 'cv': return ['label', 'file_url', 'is_active'];
      case 'tags': return ['name', 'slug', 'filter'];
      default: return [];
    }
  }

  function editItem(item) {
    if (activeTab === 'projects') navigate(`/editor/project/${item.id}`);
    else if (activeTab === 'blogs') navigate(`/editor/blog/${item.id}`);
    else if (activeTab === 'skills') navigate(`/skills/${item.id}`);
    else if (activeTab === 'experience') navigate(`/experience/${item.id}`);
    else if (activeTab === 'cv') navigate(`/cv/${item.id}`);
    else if (activeTab === 'tags') editTag(item);
  }

  // ── Inline tag editing ──
  let editingTag = $state(null);
    let tagForm = $state({ name: '', slug: '', filter: false });

    function editTag(item) {
      editingTag = item.id;
      tagForm = { name: item.name, slug: item.slug, filter: item.filter };
    }

  async function saveTag() {
    if (!editingTag) return;
    try {
      await tags.update(editingTag, tagForm);
      editingTag = null;
      await loadData();
    } catch (_) {}
  }

  // ── Project reorder ──
  async function moveProject(index, direction) {
    const sorted = [...allProjects];
    const item = sorted[index];
    if (!item) return;

    try {
      await projects.reorder(item.id, direction);
      await loadData();
      toast('Project order updated');
    } catch (_) {
      toast('Failed to reorder', 'error');
    }
  }

  function resolveTagIds(slugs) {
    if (!slugs) return [];
    return slugs.map(slug => {
      const found = allTags.find(t => t.slug === slug);
      return found?.id || slug;
    });
  }

  // ── Projects toggle ──
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
        tag_ids: resolveTagIds(item.tags)
      };
      payload[field] = !item[field];
      await projects.update(item.id, payload);
      await loadData();
      toast('Project updated');
    } catch (_) {
      toast('Failed to update project', 'error');
    }
  }

  // ── Blogs toggle ──
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
        tag_ids: resolveTagIds(item.tags)
      };
      payload[field] = !item[field];
      await blogs.update(item.id, payload);
      await loadData();
      toast('Blog updated');
    } catch (_) {
      toast('Failed to update blog', 'error');
    }
  }

  // ── CV active toggle ──
  async function toggleCvActive(item) {
    try {
      await cv.update(item.id, {
        file_url: item.file_url,
        label: item.label,
        is_active: !item.is_active,
      });
      await loadData();
      toast(item.is_active ? 'CV deactivated' : 'CV set as active');
    } catch (_) {
      toast('Failed to update CV', 'error');
    }
  }

  // ── Tag filter toggle ──
  async function toggleTagFilter(item) {
    try {
      await tags.update(item.id, {
        name: item.name,
        slug: item.slug,
        filter: !item.filter,
      });
      await loadData();
      toast(item.filter ? 'Tag hidden from filters' : 'Tag shown in filters');
    } catch (_) {
      toast('Failed to update tag filter', 'error');
    }
  }

  // ── Inline two-click delete ──
  let deleteConfirmId = $state(null);
  let deleteTimeout = $state(null);

  function requestDelete(item) {
    if (deleteConfirmId === item.id) {
      // Second click — execute delete
      clearTimeout(deleteTimeout);
      executeDelete(item);
    } else {
      // First click — enter confirm state
      clearTimeout(deleteTimeout);
      deleteConfirmId = item.id;
      deleteTimeout = setTimeout(() => {
        deleteConfirmId = null;
      }, 3000);
    }
  }

  async function executeDelete(item) {
    deleteConfirmId = null;
    try {
      const api = { projects, blogs, skills, experience, cv, tags }[activeTab];
      await api.delete(item.id);
      await loadData();
      const label = activeTab.replace(/s$/, '');
      toast(`${label.charAt(0).toUpperCase() + label.slice(1)} deleted`);
    } catch (_) {
      toast('Failed to delete', 'error');
    }
  }

  function formatCell(value) {
    if (value === true) return 'Yes';
    if (value === false) return 'No';
    if (value === null || value === undefined) return '--';
    if (typeof value === 'string' && value.length > 50) return value.slice(0, 50) + '...';
    return String(value);
  }

  function selectTab(value) {
    activeTab = value;
    dropdownOpen = false;
  }

  function getDeviceName(ua) {
    if (!ua) return 'Unknown';
    if (ua.includes('Macintosh')) return 'Mac';
    if (ua.includes('Windows')) return 'Windows';
    if (ua.includes('iPhone')) return 'iPhone';
    if (ua.includes('iPad')) return 'iPad';
    if (ua.includes('Android')) return 'Android';
    if (ua.includes('Linux')) return 'Linux';
    // Fallback to the first word if we don't recognize it
    return ua.split('/')[0].split(' ')[0] || 'Unknown';
  }

  function formatTimeAgo(dateString) {
    if (!dateString) return '--';
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    
    if (diffHours < 24) return `${diffHours} hour${diffHours === 1 ? '' : 's'} ago`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 7) return `${diffDays} day${diffDays === 1 ? '' : 's'} ago`;
    const diffWeeks = Math.floor(diffDays / 7);
    if (diffWeeks < 52) return `${diffWeeks} week${diffWeeks === 1 ? '' : 's'} ago`;
    const diffYears = Math.floor(diffWeeks / 52);
    return `${diffYears} year${diffYears === 1 ? '' : 's'} ago`;
  }
</script>

<svelte:window onclick={(e) => {
  if (dropdownOpen && !e.target.closest('.tab-dropdown')) dropdownOpen = false;
}} />

<div class="page">
  <TopBar pageName="Dashboard" />

  <main class="content">
    <!-- ── Summary Cards ── -->
    <section class="cards-row">
      <div class="card">
        <div class="card-label mono">FEATURED PROJECTS</div>
        <div class="card-body">
          {#if featuredProjects.length === 0}
            <span class="empty-text">No featured projects</span>
          {:else}
            {#each featuredProjects as p}
              <div class="card-item">
                <span class="item-title">{p.title}</span>
                <span class="item-meta mono">{p.published ? 'LIVE' : 'DRAFT'}</span>
              </div>
            {/each}
          {/if}
        </div>
      </div>

      <div class="card">
        <div class="card-label mono">FEATURED POSTS</div>
        <div class="card-body">
          {#if featuredPosts.length === 0}
            <span class="empty-text">No published posts</span>
          {:else}
            {#each featuredPosts as b}
              <div class="card-item">
                <span class="item-title">{b.title}</span>
                <span class="item-meta mono">{b.published ? 'LIVE' : 'DRAFT'}</span>
              </div>
            {/each}
          {/if}
        </div>
      </div>

      <div class="card">
        <div class="card-label mono">LOGIN ACTIVITY</div>
        <div class="card-body">
          {#if loginActivities.length === 0}
            <span class="empty-text">No activity found</span>
          {:else}
            {#each loginActivities as act}
              <div class="card-item">
                <span class="item-title" title="{act.user_agent}">
                  {getDeviceName(act.user_agent)} • {act.ip_address || 'Unknown IP'}
                </span>
                {#if act.is_active}
                  <span class="item-meta mono" style="color: #10b981;">ACTIVE</span>
                {:else}
                  <span class="item-meta mono">{formatTimeAgo(act.last_seen_at).toUpperCase()}</span>
                {/if}
              </div>
            {/each}
          {/if}
        </div>
      </div>
    </section>

    <!-- ── Action Buttons ── -->
    <section class="actions-row">
      <button class="action-btn" onclick={() => navigate('/editor/project')}>
        <Plus size={14} />
        Add project
      </button>
      <button class="action-btn" onclick={() => navigate('/editor/blog')}>
        <Plus size={14} />
        Add blog
      </button>
      <button class="action-btn" onclick={() => navigate('/skills/new')}>
        <Plus size={14} />
        Add skill
      </button>
      <button class="action-btn" onclick={() => navigate('/experience/new')}>
        <Plus size={14} />
        Add experience
      </button>
      <button class="action-btn" onclick={() => navigate('/cv/new')}>
        <Plus size={14} />
        Change / Add CV
      </button>
    </section>

    <!-- ── Tab Selector + Table ── -->
    <section class="table-section">
      <div class="table-header">
        <div class="tab-dropdown">
          <button class="tab-trigger" onclick={() => dropdownOpen = !dropdownOpen}>
            <span class="mono">{activeLabel.toUpperCase()}</span>
            <CaretDown size={12} />
          </button>
          {#if dropdownOpen}
            <div class="tab-menu">
              {#each tabOptions as opt}
                <button
                  class="tab-option"
                  class:active={activeTab === opt.value}
                  onclick={() => selectTab(opt.value)}
                >
                  <opt.icon size={14} />
                  <span>{opt.label}</span>
                </button>
              {/each}
            </div>
          {/if}
        </div>
        <span class="table-count mono">{getTableData().length} ITEMS</span>
      </div>

      <div class="table-wrap">
        {#if loadingData}
          <div class="table-empty">Loading...</div>
        {:else if getTableData().length === 0}
          <div class="table-empty">No {activeLabel.toLowerCase()} found</div>
        {:else}
          <table>
            <thead>
              <tr>
                {#each getTableColumns() as col}
                  <th class="mono">{col.toUpperCase().replace(/_/g, ' ')}</th>
                {/each}
                <th class="mono actions-col">ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {#each getTableData() as item, idx}
                <tr>
                  {#each getTableColumns() as col}
                    <td>
                      {#if editingTag === item.id && activeTab === 'tags'}
                        {#if col === 'name' || col === 'slug'}
                          <input
                            class="inline-edit"
                            bind:value={tagForm[col]}
                            onkeydown={(e) => e.key === 'Enter' && saveTag()}
                          />
                        {:else if col === 'filter'}
                          <input type="checkbox" bind:checked={tagForm.filter} />
                        {/if}
                      {:else if (col === 'published' || col === 'featured') && activeTab === 'projects'}
                        <button
                          class="active-badge"
                          class:is-active={item[col]}
                          onclick={() => toggleProjectBool(item, col)}
                          title={item[col] ? `${col} (click to undo)` : `Click to set as ${col}`}
                        >
                          <CheckCircle size={12} weight={item[col] ? 'fill' : 'regular'} />
                          <span>{item[col] ? 'Yes' : 'No'}</span>
                        </button>
                      {:else if col === 'published' && activeTab === 'blogs'}
                        <button
                          class="active-badge"
                          class:is-active={item[col]}
                          onclick={() => toggleBlogBool(item, col)}
                          title={item[col] ? `${col} (click to undo)` : `Click to set as ${col}`}
                        >
                          <CheckCircle size={12} weight={item[col] ? 'fill' : 'regular'} />
                          <span>{item[col] ? 'Yes' : 'No'}</span>
                        </button>
                      {:else if col === 'is_active' && activeTab === 'cv'}
                        <button
                          class="active-badge"
                          class:is-active={item.is_active}
                          onclick={() => toggleCvActive(item)}
                          title={item.is_active ? 'Active CV (click to deactivate)' : 'Click to set as active'}
                        >
                          <CheckCircle size={12} weight={item.is_active ? 'fill' : 'regular'} />
                          <span>{item.is_active ? 'Active' : 'Inactive'}</span>
                        </button>
                      {:else if col === 'filter' && activeTab === 'tags'}
                        <button
                          class="active-badge"
                          class:is-active={item.filter}
                          onclick={() => toggleTagFilter(item)}
                          title={item.filter ? 'Visible in filters (click to hide)' : 'Hidden from filters (click to show)'}
                        >
                          <CheckCircle size={12} weight={item.filter ? 'fill' : 'regular'} />
                          <span>{item.filter ? 'Visible' : 'Hidden'}</span>
                        </button>
                      {:else}
                        {formatCell(item[col])}
                      {/if}
                    </td>
                  {/each}
                  <td class="actions-col">
                    <div class="row-actions">
                      {#if activeTab === 'projects'}
                        <button
                          class="icon-btn"
                          onclick={() => moveProject(idx, -1)}
                          disabled={idx === 0}
                          title="Move up"
                        >
                          <ArrowUp size={14} />
                        </button>
                        <button
                          class="icon-btn"
                          onclick={() => moveProject(idx, 1)}
                          disabled={idx === getTableData().length - 1}
                          title="Move down"
                        >
                          <ArrowDown size={14} />
                        </button>
                      {/if}
                      {#if editingTag === item.id && activeTab === 'tags'}
                        <button class="icon-btn" onclick={saveTag} title="Save">
                          <PencilSimple size={14} weight="fill" />
                        </button>
                        <button class="icon-btn" onclick={() => editingTag = null} title="Cancel">
                          <Trash size={14} />
                        </button>
                      {:else}
                        <button class="icon-btn" onclick={() => editItem(item)} title="Edit">
                          <PencilSimple size={14} />
                        </button>
                        <button
                          class="delete-btn"
                          class:confirming={deleteConfirmId === item.id}
                          onclick={() => requestDelete(item)}
                          title={deleteConfirmId === item.id ? 'Click again to confirm' : 'Delete'}
                        >
                          {#if deleteConfirmId === item.id}
                            <span class="delete-confirm-text">Are you sure?</span>
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
        {/if}
      </div>
    </section>
  </main>

  <BottomNav />
</div>

<style>
  .page {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    background: #fff;
  }

  .content {
    flex: 1;
    max-width: 1080px;
    width: 100%;
    margin: 0 auto;
    padding: 32px 24px 120px;
    display: flex;
    flex-direction: column;
    gap: 32px;
  }

  /* ── Cards ── */
  .cards-row {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 16px;
  }

  .card {
    border: 1px solid #e5e5e5;
    border-radius: 10px;
    padding: 20px;
    background: #fff;
  }

  .card-label {
    font-size: 11px;
    font-weight: 500;
    color: #999;
    letter-spacing: 0.06em;
    margin-bottom: 16px;
  }

  .card-body {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .card-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
  }

  .item-title {
    font-size: 13px;
    font-weight: 450;
    color: #111;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .item-meta {
    font-size: 10px;
    color: #999;
    flex-shrink: 0;
  }

  .empty-text {
    font-size: 13px;
    color: #bbb;
  }

  /* ── Actions ── */
  .actions-row {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
  }

  .action-btn {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 8px 16px;
    border: 1px solid #e5e5e5;
    border-radius: 8px;
    font-size: 13px;
    font-weight: 450;
    color: #333;
    background: #fff;
    cursor: pointer;
    transition: all 0.12s;
  }

  .action-btn:hover {
    border-color: #111;
    color: #111;
  }

  /* ── Table Section ── */
  .table-section {
    display: flex;
    flex-direction: column;
    gap: 0;
  }

  .table-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding-bottom: 12px;
    border-bottom: 1px solid #e5e5e5;
  }

  .table-count {
    font-size: 11px;
    color: #999;
  }

  .tab-dropdown {
    position: relative;
  }

  .tab-trigger {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 6px 12px;
    font-size: 12px;
    font-weight: 500;
    color: #111;
    border: 1px solid #e5e5e5;
    border-radius: 6px;
    background: #fff;
    cursor: pointer;
    transition: border-color 0.12s;
  }

  .tab-trigger:hover {
    border-color: #111;
  }

  .tab-menu {
    position: absolute;
    top: calc(100% + 4px);
    left: 0;
    background: #fff;
    border: 1px solid #e5e5e5;
    border-radius: 8px;
    padding: 4px;
    min-width: 180px;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.06);
    z-index: 50;
    animation: dropdown-in 0.1s ease-out;
  }

  @keyframes dropdown-in {
    from { opacity: 0; transform: translateY(-4px); }
    to { opacity: 1; transform: translateY(0); }
  }

  .tab-option {
    display: flex;
    align-items: center;
    gap: 8px;
    width: 100%;
    padding: 8px 12px;
    font-size: 13px;
    color: #555;
    border-radius: 5px;
    transition: background 0.1s;
    background: none;
    border: none;
    cursor: pointer;
    text-align: left;
  }

  .tab-option:hover { background: #f5f5f5; }
  .tab-option.active { color: #111; font-weight: 500; }

  /* ── Table ── */
  .table-wrap {
    overflow-x: auto;
  }

  table {
    width: 100%;
    border-collapse: collapse;
  }

  th {
    font-size: 11px;
    font-weight: 500;
    color: #999;
    text-align: left;
    padding: 12px 16px;
    letter-spacing: 0.04em;
    border-bottom: 1px solid #f0f0f0;
  }

  td {
    font-size: 13px;
    color: #333;
    padding: 12px 16px;
    border-bottom: 1px solid #f5f5f5;
    max-width: 240px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  tr:hover td {
    background: #fafafa;
  }

  .actions-col {
    width: 100px;
    text-align: right;
  }

  .row-actions {
    display: flex;
    align-items: center;
    gap: 4px;
    justify-content: flex-end;
  }

  .icon-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 28px;
    height: 28px;
    border-radius: 6px;
    color: #666;
    background: none;
    border: none;
    cursor: pointer;
    transition: all 0.1s;
  }

  .icon-btn:hover {
    background: #f0f0f0;
    color: #111;
  }

  .icon-btn.danger:hover {
    background: #fef2f2;
    color: #dc2626;
  }

  .delete-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 28px;
    min-width: 28px;
    border-radius: 6px;
    color: #666;
    background: none;
    border: none;
    cursor: pointer;
    transition: all 0.15s;
    padding: 0 4px;
  }

  .delete-btn:hover {
    background: #fef2f2;
    color: #dc2626;
  }

  .delete-btn.confirming {
    background: #dc2626;
    color: #fff;
    border-radius: 6px;
    padding: 0 10px;
  }

  .delete-btn.confirming:hover {
    background: #b91c1c;
    color: #fff;
  }

  .delete-confirm-text {
    font-size: 11px;
    font-weight: 500;
    white-space: nowrap;
  }

  .inline-edit {
    padding: 4px 8px;
    font-size: 13px;
    border: 1px solid #111;
    border-radius: 4px;
    width: 100%;
    max-width: 200px;
  }

  .icon-btn:disabled {
    opacity: 0.2;
    cursor: not-allowed;
    pointer-events: none;
  }

  .active-badge {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    padding: 3px 10px;
    font-size: 11px;
    border-radius: 20px;
    border: 1px solid #e5e5e5;
    background: #fafafa;
    color: #999;
    cursor: pointer;
    transition: all 0.12s;
  }

  .active-badge:hover {
    border-color: #111;
    color: #111;
  }

  .active-badge.is-active {
    background: #111;
    color: #fff;
    border-color: #111;
  }

  .active-badge.is-active:hover {
    opacity: 0.85;
  }

  .table-empty {
    padding: 48px 0;
    text-align: center;
    font-size: 13px;
    color: #bbb;
  }

  @media (max-width: 768px) {
    .cards-row {
      grid-template-columns: 1fr;
    }
    .content {
      padding: 20px 16px 120px;
    }
  }
</style>
