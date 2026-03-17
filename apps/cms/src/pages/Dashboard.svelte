<script>
  import TopBar from '../components/TopBar.svelte';
  import BottomNav from '../components/BottomNav.svelte';
  import { navigate } from '../lib/router.svelte.js';
  import { getUser } from '../lib/auth.svelte.js';
  import { projects, blogs, skills, experience, cv, tags } from '../lib/api.js';
  import { Star, Article, Lightning, Briefcase, FilePdf, Tag, Trash, PencilSimple, Plus, CaretDown } from 'phosphor-svelte';

  // ── Data ──
  let featuredProjects = $state([]);
  let featuredPosts = $state([]);
  let allProjects = $state([]);
  let allBlogs = $state([]);
  let allSkills = $state([]);
  let allExperience = $state([]);
  let allCvs = $state([]);
  let allTags = $state([]);
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
      const [p, b, s, e, c, t] = await Promise.all([
        projects.list().catch(() => []),
        blogs.list().catch(() => []),
        skills.list().catch(() => []),
        experience.list().catch(() => []),
        cv.list().catch(() => []),
        tags.list().catch(() => []),
      ]);
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
      case 'tags': return ['name', 'slug'];
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
  let tagForm = $state({ name: '', slug: '' });

  function editTag(item) {
    editingTag = item.id;
    tagForm = { name: item.name, slug: item.slug };
  }

  async function saveTag() {
    if (!editingTag) return;
    try {
      await tags.update(editingTag, tagForm);
      editingTag = null;
      await loadData();
    } catch (_) {}
  }

  async function deleteItem(item) {
    if (!confirm(`Delete this ${activeTab.replace(/s$/, '')}?`)) return;
    try {
      const api = { projects, blogs, skills, experience, cv, tags }[activeTab];
      await api.delete(item.id);
      await loadData();
    } catch (_) {}
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
          <div class="card-item">
            <span class="item-title">{getUser()?.email || '--'}</span>
            <span class="item-meta mono">ACTIVE</span>
          </div>
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
              {#each getTableData() as item}
                <tr>
                  {#each getTableColumns() as col}
                    <td>
                      {#if editingTag === item.id && activeTab === 'tags' && (col === 'name' || col === 'slug')}
                        <input
                          class="inline-edit"
                          bind:value={tagForm[col]}
                          onkeydown={(e) => e.key === 'Enter' && saveTag()}
                        />
                      {:else}
                        {formatCell(item[col])}
                      {/if}
                    </td>
                  {/each}
                  <td class="actions-col">
                    <div class="row-actions">
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
                        <button class="icon-btn danger" onclick={() => deleteItem(item)} title="Delete">
                          <Trash size={14} />
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

  .inline-edit {
    padding: 4px 8px;
    font-size: 13px;
    border: 1px solid #111;
    border-radius: 4px;
    width: 100%;
    max-width: 200px;
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
