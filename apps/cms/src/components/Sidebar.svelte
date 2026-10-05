<script>
  import logoIcon from '../assets/Face logo.svg';
  import { navigate, getPath } from '../lib/router.svelte.js';
  import { logout, getUser } from '../lib/auth.svelte.js';
  import {
    SquaresFour, Star, Article, Lightning, Briefcase, FilePdf, Tag,
    House, Stack, TextAlignLeft, UserCircle, Plugs, Password, SignOut,
    MagnifyingGlass, CaretUpDown, Plus
  } from 'phosphor-svelte';

  let { collapsed = false } = $props();

  const path = $derived(getPath());
  const user = $derived(getUser());
  const email = $derived(user?.email || user?.Email || '');

  const mainMenu = [
    { label: 'Dashboard', href: '/dashboard', icon: SquaresFour, match: (p) => p === '/' || p === '/dashboard' },
  ];

  const collections = [
    { label: 'Projects', href: '/collection/projects', icon: Star, match: (p) => p.startsWith('/collection/projects') || p.startsWith('/editor/project') },
    { label: 'Writings', href: '/collection/writings', icon: Article, match: (p) => p.startsWith('/collection/writings') || p.startsWith('/editor/blog') || p.startsWith('/editor/writing') },
    { label: 'Skills', href: '/collection/skills', icon: Lightning, match: (p) => p.startsWith('/collection/skills') || p.startsWith('/skills') },
    { label: 'Experience', href: '/collection/experience', icon: Briefcase, match: (p) => p.startsWith('/collection/experience') || p.startsWith('/experience') },
    { label: 'CV', href: '/collection/cv', icon: FilePdf, match: (p) => p.startsWith('/collection/cv') || p.startsWith('/cv') },
    { label: 'Tags', href: '/collection/tags', icon: Tag, match: (p) => p.startsWith('/collection/tags') },
  ];

  const pages = [
    { label: 'Homepage', href: '/pages/home', icon: House, match: (p) => p === '/pages/home' },
    { label: 'Stack', href: '/pages/stack', icon: Stack, match: (p) => p === '/pages/stack' },
    { label: 'Section intros', href: '/pages/intros', icon: TextAlignLeft, match: (p) => p === '/pages/intros' },
  ];

  const settings = [
    { label: 'Profile', href: '/profile', icon: UserCircle, match: (p) => p === '/profile' },
    { label: 'Webhooks', href: '/webhooks', icon: Plugs, match: (p) => p === '/webhooks' },
    { label: 'Change password', href: '/change-password', icon: Password, match: (p) => p === '/change-password' },
  ];

  let query = $state('');

  const searchable = [
    ...mainMenu, ...collections, ...pages, ...settings,
    { label: 'New project', href: '/editor/project', icon: Plus, match: () => false },
    { label: 'New writing', href: '/editor/blog', icon: Plus, match: () => false },
    { label: 'New skill', href: '/skills/new', icon: Plus, match: () => false },
    { label: 'New experience', href: '/experience/new', icon: Plus, match: () => false },
    { label: 'New CV', href: '/cv/new', icon: Plus, match: () => false },
  ];

  const results = $derived(
    query.trim()
      ? searchable.filter((i) => i.label.toLowerCase().includes(query.trim().toLowerCase())).slice(0, 6)
      : []
  );

  function go(href) {
    query = '';
    navigate(href);
  }

  function initials(email) {
    if (!email) return 'M';
    return email.slice(0, 2).toUpperCase();
  }
</script>

<aside class="sidebar" class:collapsed>
  <div class="workspace">
    <div class="workspace-logo">
      <img src={logoIcon} alt="Malate" />
    </div>
    <div class="workspace-meta">
      <div class="workspace-name">Malate</div>
      <div class="workspace-sub">Personal site</div>
    </div>
    <CaretUpDown size={14} class="workspace-caret" />
  </div>

  <div class="search">
    <MagnifyingGlass size={14} />
    <input
      placeholder="Search…"
      bind:value={query}
      onkeydown={(e) => {
        if (e.key === 'Enter' && results[0]) go(results[0].href);
        if (e.key === 'Escape') query = '';
      }}
    />
    {#if results.length}
      <div class="search-results fade-up">
        {#each results as r}
          <button class="search-item" onclick={() => go(r.href)}>
            <r.icon size={14} />
            <span>{r.label}</span>
          </button>
        {/each}
      </div>
    {/if}
  </div>

  <nav class="nav">
    <div class="group-label">Main menu</div>
    {#each mainMenu as item}
      <button class="nav-item" class:active={item.match(path)} onclick={() => go(item.href)}>
        <item.icon size={17} weight={item.match(path) ? 'fill' : 'regular'} />
        <span>{item.label}</span>
      </button>
    {/each}

    <div class="group-label">Collections</div>
    {#each collections as item}
      <button class="nav-item" class:active={item.match(path)} onclick={() => go(item.href)}>
        <item.icon size={17} weight={item.match(path) ? 'fill' : 'regular'} />
        <span>{item.label}</span>
      </button>
    {/each}

    <div class="group-label">Pages</div>
    {#each pages as item}
      <button class="nav-item" class:active={item.match(path)} onclick={() => go(item.href)}>
        <item.icon size={17} weight={item.match(path) ? 'fill' : 'regular'} />
        <span>{item.label}</span>
      </button>
    {/each}
  </nav>

  <div class="bottom">
    {#each settings as item}
      <button class="nav-item" class:active={item.match(path)} onclick={() => go(item.href)}>
        <item.icon size={17} weight={item.match(path) ? 'fill' : 'regular'} />
        <span>{item.label}</span>
      </button>
    {/each}

    <div class="account">
      <div class="avatar">{initials(email)}</div>
      <div class="account-meta">
        <div class="account-email" title={email}>{email || 'Signed in'}</div>
        <div class="account-role">Admin</div>
      </div>
      <button class="btn btn-ghost btn-icon btn-sm" onclick={logout} title="Log out" aria-label="Log out">
        <SignOut size={15} />
      </button>
    </div>
  </div>
</aside>

<style>
  .sidebar {
    width: 256px;
    flex-shrink: 0;
    height: 100vh;
    position: sticky;
    top: 0;
    display: flex;
    flex-direction: column;
    background: var(--surface);
    border-right: 1px solid var(--border);
    padding: 14px 12px;
    gap: 12px;
  }

  .workspace {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 8px 8px;
    border-radius: var(--radius);
    border: 1px solid var(--border);
    background: var(--surface);
    transition: background 0.15s;
  }
  .workspace:hover { background: var(--surface-2); }

  .workspace-logo {
    width: 32px;
    height: 32px;
    border-radius: 9px;
    background: var(--surface-3);
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
    flex-shrink: 0;
  }
  .workspace-logo img { width: 24px; height: 24px; }

  .workspace-meta { flex: 1; min-width: 0; line-height: 1.2; }
  .workspace-name { font-size: 13.5px; font-weight: 500; }
  .workspace-sub { font-size: 11.5px; color: var(--text-3); margin-top: 2px; }
  .workspace :global(.workspace-caret) { color: var(--text-3); }

  .search {
    position: relative;
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 0 10px;
    height: 36px;
    border: 1px solid var(--border);
    border-radius: var(--radius);
    background: var(--surface-2);
    color: var(--text-3);
    transition: border-color 0.15s, background 0.15s;
  }
  .search:focus-within { border-color: var(--border-strong); background: var(--surface); }
  .search input {
    border: none;
    background: transparent;
    padding: 0;
    height: 100%;
    font-size: 13px;
    box-shadow: none;
    color: var(--text);
  }
  .search input:focus { box-shadow: none; }

  .search-results {
    position: absolute;
    top: calc(100% + 6px);
    left: 0;
    right: 0;
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    box-shadow: var(--shadow-lg);
    padding: 4px;
    z-index: 30;
  }
  .search-item {
    display: flex;
    align-items: center;
    gap: 8px;
    width: 100%;
    padding: 8px 10px;
    font-size: 13px;
    color: var(--text);
    border-radius: var(--radius-sm);
    text-align: left;
  }
  .search-item:hover { background: var(--surface-3); }

  .nav {
    display: flex;
    flex-direction: column;
    gap: 2px;
    flex: 1;
    overflow-y: auto;
    min-height: 0;
  }

  .group-label {
    font-size: 11.5px;
    font-weight: 500;
    color: var(--text-3);
    padding: 10px 10px 6px;
  }

  .nav-item {
    display: flex;
    align-items: center;
    gap: 10px;
    width: 100%;
    padding: 8px 10px;
    border-radius: var(--radius-sm);
    font-size: 13.5px;
    color: var(--text-2);
    text-align: left;
    transition: background 0.14s var(--ease), color 0.14s;
  }
  .nav-item:hover { background: var(--surface-3); color: var(--text); }
  .nav-item.active { background: var(--surface-3); color: var(--text); font-weight: 500; }

  .bottom {
    display: flex;
    flex-direction: column;
    gap: 2px;
    padding-top: 10px;
    border-top: 1px solid var(--border);
  }

  .account {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-top: 8px;
    padding: 8px 8px;
    border-radius: var(--radius);
    background: var(--surface-2);
  }
  .avatar {
    width: 30px;
    height: 30px;
    border-radius: 50%;
    background: var(--text);
    color: #fff;
    font-size: 11px;
    font-weight: 600;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }
  .account-meta { flex: 1; min-width: 0; line-height: 1.2; }
  .account-email { font-size: 12.5px; font-weight: 500; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .account-role { font-size: 11px; color: var(--text-3); margin-top: 2px; }

  @media (max-width: 900px) {
    .sidebar {
      position: fixed;
      inset: 0 auto 0 0;
      z-index: 200;
      transform: translateX(-100%);
      transition: transform 0.22s var(--ease);
      box-shadow: var(--shadow-lg);
    }
    .sidebar:not(.collapsed) { transform: translateX(0); }
  }
</style>
