<script>
  import Sidebar from './Sidebar.svelte';
  import { navigate } from '../lib/router.svelte.js';
  import { List, CaretRight } from 'phosphor-svelte';

  /**
   * @type {{
   *   title?: string,
   *   crumbs?: Array<{ label: string, href?: string }>,
   *   actions?: import('svelte').Snippet,
   *   children: import('svelte').Snippet,
   *   width?: 'default' | 'wide' | 'full',
   *   flush?: boolean
   * }}
   */
  let { title = '', crumbs = [], actions, children, width = 'default', flush = false } = $props();

  let menuOpen = $state(false);
</script>

<div class="shell">
  <Sidebar collapsed={!menuOpen} />

  {#if menuOpen}
    <button class="scrim" aria-label="Close menu" onclick={() => menuOpen = false}></button>
  {/if}

  <div class="main">
    <header class="topbar">
      <div class="topbar-left">
        <button class="btn btn-ghost btn-icon menu-btn" onclick={() => menuOpen = !menuOpen} aria-label="Menu">
          <List size={18} />
        </button>
        <nav class="crumbs" aria-label="Breadcrumb">
          {#each crumbs as crumb, i}
            {#if crumb.href}
              <button class="crumb link" onclick={() => navigate(crumb.href)}>{crumb.label}</button>
            {:else}
              <span class="crumb">{crumb.label}</span>
            {/if}
            {#if i < crumbs.length - 1}
              <CaretRight size={12} class="crumb-sep" />
            {/if}
          {/each}
          {#if title}
            {#if crumbs.length}
              <CaretRight size={12} class="crumb-sep" />
            {/if}
            <span class="crumb current">{title}</span>
          {/if}
        </nav>
      </div>
      {#if actions}
        <div class="topbar-actions">
          {@render actions()}
        </div>
      {/if}
    </header>

    <main class="content" class:wide={width === 'wide'} class:full={width === 'full'} class:flush>
      {@render children()}
    </main>
  </div>
</div>

<style>
  .shell {
    display: flex;
    min-height: 100vh;
    background: var(--bg);
  }

  .scrim {
    position: fixed;
    inset: 0;
    background: rgba(17, 19, 24, 0.3);
    z-index: 150;
    display: none;
  }

  .main {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
  }

  .topbar {
    position: sticky;
    top: 0;
    z-index: 100;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    height: 60px;
    padding: 0 24px;
    background: rgba(245, 246, 248, 0.85);
    backdrop-filter: blur(14px);
    -webkit-backdrop-filter: blur(14px);
    border-bottom: 1px solid var(--border);
  }

  .topbar-left {
    display: flex;
    align-items: center;
    gap: 8px;
    min-width: 0;
  }

  .menu-btn { display: none; }

  .crumbs {
    display: flex;
    align-items: center;
    gap: 6px;
    min-width: 0;
    overflow: hidden;
  }

  .crumb {
    font-size: 14px;
    color: var(--text-3);
    white-space: nowrap;
  }
  .crumb.link { transition: color 0.12s; }
  .crumb.link:hover { color: var(--text); }
  .crumb.current { color: var(--text); font-weight: 500; overflow: hidden; text-overflow: ellipsis; }
  .crumbs :global(.crumb-sep) { color: var(--text-4); flex-shrink: 0; }

  .topbar-actions {
    display: flex;
    align-items: center;
    gap: 8px;
    flex-shrink: 0;
  }

  .content {
    flex: 1;
    width: 100%;
    max-width: 1040px;
    margin: 0 auto;
    padding: 28px 24px 80px;
  }
  .content.wide { max-width: 1280px; }
  .content.full { max-width: none; }
  .content.flush { padding: 0; max-width: none; display: flex; flex-direction: column; min-height: 0; }

  @media (max-width: 900px) {
    .menu-btn { display: inline-flex; }
    .scrim { display: block; }
    .topbar { padding: 0 14px; }
    .content { padding: 20px 14px 80px; }
  }
</style>
