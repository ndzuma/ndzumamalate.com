<script>
  import logoIcon from '../assets/Face logo.svg';
  import { navigate, getPath } from '../lib/router.svelte.js';
  import { logout, getUser } from '../lib/auth.svelte.js';
  import {
    SquaresFour, Star, Article, Lightning, Briefcase, FilePdf, Tag,
    House, Stack, TextAlignLeft, Info, UserCircle, Plugs, Password, SignOut,
    MagnifyingGlass, Plus
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
    { label: 'This', href: '/pages/this', icon: Info, match: (p) => p === '/pages/this' },
  ];

  const settings = [
    { label: 'Profile', href: '/profile', icon: UserCircle, match: (p) => p === '/profile' },
    { label: 'Webhooks', href: '/webhooks', icon: Plugs, match: (p) => p === '/webhooks' },
    { label: 'Change password', href: '/change-password', icon: Password, match: (p) => p === '/change-password' },
  ];

  let query = $state('');
  let accountOpen = $state(false);

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

<svelte:window onclick={(e) => { if (!e.target.closest('.account')) accountOpen = false; }} />

<aside class="sidebar" class:collapsed>
  <div class="brand">
    <div class="brand-logo">
      <img src={logoIcon} alt="" />
    </div>
    <span class="brand-name">Malate</span>

    <div class="account">
      <button class="avatar" onclick={() => accountOpen = !accountOpen} title={email} aria-label="Account" aria-expanded={accountOpen}>
        {initials(email)}
      </button>
      {#if accountOpen}
        <div class="account-menu fade-up">
          <div class="account-meta">
            <div class="account-email">{email || 'Signed in'}</div>
            <div class="account-role">Admin</div>
          </div>
          <button class="menu-item danger" onclick={logout}><SignOut size={15} /> Log out</button>
        </div>
      {/if}
    </div>
  </div>

  <div class="rule"></div>

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
    {#each mainMenu as item}
      <button class="nav-item" class:active={item.match(path)} onclick={() => go(item.href)}>
        <item.icon size={18} weight={item.match(path) ? 'fill' : 'regular'} />
        <span>{item.label}</span>
      </button>
    {/each}

    <div class="group-label">Collections</div>
    {#each collections as item}
      <button class="nav-item" class:active={item.match(path)} onclick={() => go(item.href)}>
        <item.icon size={18} weight={item.match(path) ? 'fill' : 'regular'} />
        <span>{item.label}</span>
      </button>
    {/each}

    <div class="group-label">Pages</div>
    {#each pages as item}
      <button class="nav-item" class:active={item.match(path)} onclick={() => go(item.href)}>
        <item.icon size={18} weight={item.match(path) ? 'fill' : 'regular'} />
        <span>{item.label}</span>
      </button>
    {/each}
  </nav>

  <div class="rule"></div>

  <div class="bottom">
    {#each settings as item}
      <button class="nav-item" class:active={item.match(path)} onclick={() => go(item.href)}>
        <item.icon size={18} weight={item.match(path) ? 'fill' : 'regular'} />
        <span>{item.label}</span>
      </button>
    {/each}
  </div>
</aside>

<style>
  .sidebar {
    width: 264px;
    flex-shrink: 0;
    height: 100%;
    display: flex;
    flex-direction: column;
    padding: 20px 14px 14px;
    gap: 14px;
    background: var(--frame);
    border-right: 1px solid var(--border);
  }

  /* ── Brand + account ── */
  .brand {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 0 6px 0 8px;
  }
  .brand-logo {
    width: 34px;
    height: 34px;
    border-radius: 11px;
    background: var(--surface);
    border: 1px solid var(--border);
    box-shadow: var(--shadow-sm);
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }
  .brand-logo img { width: 24px; height: 24px; }
  .brand-name {
    flex: 1;
    font-size: 13px;
    font-weight: 600;
    letter-spacing: 0.22em;
    text-transform: uppercase;
    color: var(--text);
  }

  .account { position: relative; }
  .avatar {
    width: 30px;
    height: 30px;
    border-radius: 50%;
    background: var(--text);
    color: #fff;
    font-size: 10.5px;
    font-weight: 600;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 0 0 3px var(--frame), 0 0 0 4px var(--border);
    transition: transform 0.15s var(--ease);
  }
  .avatar:hover { transform: scale(1.05); }

  .account-menu {
    position: absolute;
    top: calc(100% + 10px);
    right: 0;
    width: 220px;
    padding: 6px;
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: var(--radius-lg);
    box-shadow: var(--shadow-lg);
    z-index: 40;
  }
  .account-meta { padding: 8px 10px 10px; border-bottom: 1px dashed var(--border-strong); margin-bottom: 4px; }
  .account-email { font-size: 12.5px; font-weight: 500; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .account-role { font-size: 11px; color: var(--text-3); margin-top: 2px; }
  .menu-item {
    display: flex;
    align-items: center;
    gap: 9px;
    width: 100%;
    padding: 8px 10px;
    border-radius: var(--radius-sm);
    font-size: 13px;
    color: var(--text-2);
    text-align: left;
  }
  .menu-item:hover { background: var(--surface-3); color: var(--text); }
  .menu-item.danger:hover { background: var(--danger-soft); color: var(--danger); }

  .rule {
    height: 0;
    border-top: 1px dashed var(--border-strong);
    margin: 4px 8px;
    flex-shrink: 0;
  }

  /* ── Search ── */
  .search {
    position: relative;
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 0 12px;
    height: 38px;
    border: 1px solid var(--border);
    border-radius: 12px;
    background: rgba(255, 255, 255, 0.6);
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

  /* ── Nav ── */
  .nav {
    display: flex;
    flex-direction: column;
    gap: 3px;
    flex: 1;
    overflow-y: auto;
    min-height: 0;
  }

  .group-label {
    font-size: 12px;
    font-weight: 500;
    color: var(--text-3);
    padding: 14px 12px 6px;
  }

  .nav-item {
    display: flex;
    align-items: center;
    gap: 12px;
    width: 100%;
    min-height: 40px;
    padding: 8px 12px;
    border: 1px solid transparent;
    border-radius: 12px;
    font-size: 14px;
    color: var(--text-3);
    text-align: left;
    transition: background 0.14s var(--ease), color 0.14s, border-color 0.14s;
  }
  .nav-item:hover { background: rgba(17, 19, 24, 0.035); color: var(--text); }
  /* Active item is a raised pill sitting on the frame. */
  .nav-item.active {
    background: var(--surface);
    border-color: var(--border);
    color: var(--text);
    box-shadow: 0 1px 2px rgba(17, 19, 24, 0.05), inset 0 1px 0 #fff;
  }

  .bottom {
    display: flex;
    flex-direction: column;
    gap: 3px;
  }

  @media (max-width: 900px) {
    .sidebar {
      position: fixed;
      inset: 0 auto 0 0;
      z-index: 200;
      background: var(--frame);
      border-right: 1px solid var(--border);
      transform: translateX(-100%);
      transition: transform 0.22s var(--ease);
      box-shadow: var(--shadow-lg);
    }
    .sidebar:not(.collapsed) { transform: translateX(0); }
  }
</style>
