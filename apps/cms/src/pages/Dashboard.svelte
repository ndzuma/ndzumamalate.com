<script>
  import Shell from '../components/Shell.svelte';
  import { navigate } from '../lib/router.svelte.js';
  import { projects, blogs, skills, experience, cv, tags, auth, profile as profileApi } from '../lib/api.js';
  import { Star, Article, Lightning, Briefcase, Plus, ArrowRight, House, Stack, PencilSimple, Broadcast } from 'phosphor-svelte';

  let allProjects = $state([]);
  let allBlogs = $state([]);
  let allSkills = $state([]);
  let allExperience = $state([]);
  let allCvs = $state([]);
  let allTags = $state([]);
  let loginActivities = $state([]);
  let profile = $state(null);
  let loading = $state(true);

  const featuredProjects = $derived(allProjects.filter((x) => x.featured).slice(0, 4));
  const drafts = $derived([
    ...allProjects.filter((x) => !x.published).map((x) => ({ ...x, kind: 'project', href: `/editor/project/${x.id}` })),
    ...allBlogs.filter((x) => !x.published).map((x) => ({ ...x, kind: 'writing', href: `/editor/blog/${x.id}` })),
  ].slice(0, 5));
  const activeCv = $derived(allCvs.find((c) => c.is_active));

  async function loadData() {
    loading = true;
    try {
      const [p, b, s, e, c, t, act, prof] = await Promise.all([
        projects.list().catch(() => []),
        blogs.list().catch(() => []),
        skills.list().catch(() => []),
        experience.list().catch(() => []),
        cv.list().catch(() => []),
        tags.list().catch(() => []),
        auth.activity().catch(() => []),
        profileApi.get().catch(() => null),
      ]);
      allProjects = p || [];
      allBlogs = b || [];
      allSkills = s || [];
      allExperience = e || [];
      allCvs = c || [];
      allTags = t || [];
      loginActivities = act || [];
      profile = prof;
    } catch (_) {}
    loading = false;
  }

  loadData();

  const stats = $derived([
    { label: 'Projects', value: allProjects.length, sub: `${allProjects.filter((x) => x.published).length} live`, icon: Star, href: '/collection/projects' },
    { label: 'Writings', value: allBlogs.length, sub: `${allBlogs.filter((x) => x.published).length} live`, icon: Article, href: '/collection/writings' },
    { label: 'Skills', value: allSkills.length, sub: `${allSkills.filter((x) => x.icon_url).length} with icons`, icon: Lightning, href: '/collection/skills' },
    { label: 'Experience', value: allExperience.length, sub: `${allTags.length} tags`, icon: Briefcase, href: '/collection/experience' },
  ]);

  function getDeviceName(ua) {
    if (!ua) return 'Unknown';
    if (ua.includes('iPhone')) return 'iPhone';
    if (ua.includes('iPad')) return 'iPad';
    if (ua.includes('Macintosh')) return 'Mac';
    if (ua.includes('Windows')) return 'Windows';
    if (ua.includes('Android')) return 'Android';
    if (ua.includes('Linux')) return 'Linux';
    return ua.split('/')[0].split(' ')[0] || 'Unknown';
  }

  function formatTimeAgo(dateString) {
    if (!dateString) return '--';
    const date = new Date(dateString);
    const diffMs = Date.now() - date.getTime();
    const mins = Math.floor(diffMs / 60000);
    if (mins < 60) return `${Math.max(mins, 0)} min ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours} hour${hours === 1 ? '' : 's'} ago`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days} day${days === 1 ? '' : 's'} ago`;
    const weeks = Math.floor(days / 7);
    if (weeks < 52) return `${weeks} week${weeks === 1 ? '' : 's'} ago`;
    return `${Math.floor(weeks / 52)} year${Math.floor(weeks / 52) === 1 ? '' : 's'} ago`;
  }

  function greeting() {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 18) return 'Good afternoon';
    return 'Good evening';
  }
</script>

<Shell title="Dashboard">
  {#snippet actions()}
    <button class="btn btn-secondary" onclick={() => navigate('/editor/blog')}>
      <Plus size={14} weight="bold" />
      New writing
    </button>
    <button class="btn btn-primary" onclick={() => navigate('/editor/project')}>
      <Plus size={14} weight="bold" />
      New project
    </button>
  {/snippet}

  <div class="page">
    <div class="hero">
      <div>
        <h1>{greeting()}, Ndzuma</h1>
        <p class="muted">Changes you make here go live on the site instantly.</p>
      </div>
      <div class="hero-badges">
        <span class="badge badge-success"><Broadcast size={12} weight="fill" /> Live sync on</span>
        {#if profile?.open_to_work}
          <span class="badge badge-accent">Open to work</span>
        {/if}
      </div>
    </div>

    <section class="stats">
      {#each stats as s}
        <button class="stat card" onclick={() => navigate(s.href)}>
          <div class="stat-top">
            <span class="stat-icon"><s.icon size={16} /></span>
            <span class="stat-label">{s.label}</span>
          </div>
          <div class="stat-value">{loading ? '–' : s.value}</div>
          <div class="stat-sub">{loading ? '' : s.sub}</div>
        </button>
      {/each}
    </section>

    <section class="grid">
      <div class="card col">
        <div class="card-head">
          <div>
            <div class="card-title">Featured projects</div>
            <div class="card-subtitle">Shown in the homepage carousel</div>
          </div>
          <button class="btn btn-ghost btn-sm" onclick={() => navigate('/collection/projects')}>
            Manage <ArrowRight size={12} />
          </button>
        </div>
        <div class="list">
          {#if loading}
            <div class="empty">Loading…</div>
          {:else if featuredProjects.length === 0}
            <div class="empty">No featured projects yet</div>
          {:else}
            {#each featuredProjects as p}
              <button class="row" onclick={() => navigate(`/editor/project/${p.id}`)}>
                <span class="row-thumb" style={p.image_url ? `background-image:url(${p.image_url})` : ''}></span>
                <span class="row-title">{p.title}</span>
                <span class="badge {p.published ? 'badge-success' : ''}">{p.published ? 'Live' : 'Draft'}</span>
              </button>
            {/each}
          {/if}
        </div>
      </div>

      <div class="card col">
        <div class="card-head">
          <div>
            <div class="card-title">Drafts</div>
            <div class="card-subtitle">Unpublished projects and writings</div>
          </div>
        </div>
        <div class="list">
          {#if loading}
            <div class="empty">Loading…</div>
          {:else if drafts.length === 0}
            <div class="empty">Everything is published</div>
          {:else}
            {#each drafts as d}
              <button class="row" onclick={() => navigate(d.href)}>
                <span class="row-icon"><PencilSimple size={14} /></span>
                <span class="row-title">{d.title}</span>
                <span class="badge">{d.kind}</span>
              </button>
            {/each}
          {/if}
        </div>
      </div>

      <div class="card col">
        <div class="card-head">
          <div>
            <div class="card-title">Pages</div>
            <div class="card-subtitle">Edit the copy on the public site</div>
          </div>
        </div>
        <div class="list">
          <button class="row" onclick={() => navigate('/pages/home')}>
            <span class="row-icon"><House size={14} /></span>
            <span class="row-title">Homepage</span>
            <ArrowRight size={12} class="row-arrow" />
          </button>
          <button class="row" onclick={() => navigate('/pages/stack')}>
            <span class="row-icon"><Stack size={14} /></span>
            <span class="row-title">Stack</span>
            <ArrowRight size={12} class="row-arrow" />
          </button>
          <button class="row" onclick={() => navigate('/pages/intros')}>
            <span class="row-icon"><Article size={14} /></span>
            <span class="row-title">Section intros</span>
            <ArrowRight size={12} class="row-arrow" />
          </button>
          <button class="row" onclick={() => navigate('/cv/new')}>
            <span class="row-icon"><Plus size={14} /></span>
            <span class="row-title">{activeCv ? `CV: ${activeCv.label || 'active'}` : 'Upload a CV'}</span>
            <ArrowRight size={12} class="row-arrow" />
          </button>
        </div>
      </div>

      <div class="card col">
        <div class="card-head">
          <div>
            <div class="card-title">Login activity</div>
            <div class="card-subtitle">Recent sessions on this account</div>
          </div>
        </div>
        <div class="list">
          {#if loading}
            <div class="empty">Loading…</div>
          {:else if loginActivities.length === 0}
            <div class="empty">No activity found</div>
          {:else}
            {#each loginActivities as act}
              <div class="row static" title={act.user_agent}>
                <span class="row-title">{getDeviceName(act.user_agent)} <span class="muted">· {act.ip_address || 'Unknown IP'}</span></span>
                {#if act.is_active}
                  <span class="badge badge-success">Active</span>
                {:else}
                  <span class="muted small">{formatTimeAgo(act.last_seen_at)}</span>
                {/if}
              </div>
            {/each}
          {/if}
        </div>
      </div>
    </section>
  </div>
</Shell>

<style>
  .page { display: flex; flex-direction: column; gap: 22px; }

  .hero {
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    gap: 16px;
    flex-wrap: wrap;
  }
  .hero h1 { margin-bottom: 4px; }
  .hero p { font-size: 13.5px; }
  .hero-badges { display: flex; gap: 6px; }

  .stats {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 14px;
  }

  .stat {
    padding: 16px 18px;
    text-align: left;
    display: flex;
    flex-direction: column;
    gap: 8px;
    transition: border-color 0.15s, transform 0.15s var(--ease), box-shadow 0.15s;
  }
  .stat:hover { border-color: var(--border-strong); box-shadow: var(--shadow); transform: translateY(-1px); }

  .stat-top { display: flex; align-items: center; gap: 8px; }
  .stat-icon {
    width: 26px;
    height: 26px;
    border-radius: 8px;
    background: var(--surface-3);
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--text-2);
  }
  .stat-label { font-size: 13px; color: var(--text-2); }
  .stat-value { font-size: 26px; font-weight: 500; letter-spacing: -0.02em; line-height: 1; }
  .stat-sub { font-size: 12px; color: var(--text-3); min-height: 16px; }

  .grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 14px;
  }

  .col { display: flex; flex-direction: column; }

  .card-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    padding: 16px 18px 12px;
  }

  .list { display: flex; flex-direction: column; padding: 0 8px 8px; }

  .row {
    display: flex;
    align-items: center;
    gap: 10px;
    width: 100%;
    padding: 9px 10px;
    border-radius: var(--radius-sm);
    text-align: left;
    font-size: 13px;
    color: var(--text);
    transition: background 0.12s;
  }
  .row:not(.static):hover { background: var(--surface-2); }
  .row-title { flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .row-thumb {
    width: 34px;
    height: 24px;
    border-radius: 6px;
    background: var(--surface-3) center/cover no-repeat;
    flex-shrink: 0;
  }
  .row-icon {
    width: 26px;
    height: 26px;
    border-radius: 7px;
    background: var(--surface-3);
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--text-2);
    flex-shrink: 0;
  }
  .row :global(.row-arrow) { color: var(--text-4); }

  .empty { padding: 20px 10px; font-size: 13px; color: var(--text-4); }

  @media (max-width: 900px) {
    .stats { grid-template-columns: repeat(2, 1fr); }
    .grid { grid-template-columns: 1fr; }
  }
</style>
