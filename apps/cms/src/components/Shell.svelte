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

<!-- Only the page area scrolls, so the sidebar and header never move. -->
<div class="shell">
  <div class="frame">
    <Sidebar collapsed={!menuOpen} />

    {#if menuOpen}
      <button class="scrim" aria-label="Close menu" onclick={() => menuOpen = false}></button>
    {/if}

    <div class="panel">
      <header class="topbar">
        <div class="topbar-left">
          <button class="btn btn-ghost btn-icon menu-btn" onclick={() => menuOpen = !menuOpen} aria-label="Menu">
            <List size={18} />
          </button>
          <nav class="crumbs" aria-label="Breadcrumb">
            {#each crumbs as crumb}
              {#if crumb.href}
                <button class="crumb link" onclick={() => navigate(crumb.href)}>{crumb.label}</button>
              {:else}
                <span class="crumb">{crumb.label}</span>
              {/if}
              <CaretRight size={12} class="crumb-sep" />
            {/each}
            {#if title}
              <h1 class="crumb current">{title}</h1>
            {/if}
          </nav>
        </div>
        {#if actions}
          <div class="topbar-actions">
            {@render actions()}
          </div>
        {/if}
      </header>

      <div class="scroller">
        <main class="content" class:wide={width === 'wide'} class:full={width === 'full'} class:flush>
          {@render children()}
        </main>
      </div>
    </div>
  </div>
</div>

<style>
  .shell {
    height: 100vh;
    background: var(--bg);
  }

  .frame {
    position: relative;
    display: flex;
    height: 100%;
  }

  .scrim {
    position: fixed;
    inset: 0;
    background: rgba(17, 19, 24, 0.3);
    z-index: 150;
    display: none;
  }

  .panel {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    background: var(--surface);
  }

  .topbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    height: 68px;
    padding: 0 28px;
    border-bottom: 1px solid var(--border);
    flex-shrink: 0;
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
    gap: 8px;
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
  .crumb.current {
    font-size: 18px;
    font-weight: 500;
    letter-spacing: -0.015em;
    color: var(--text);
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .crumbs :global(.crumb-sep) { color: var(--text-4); flex-shrink: 0; }

  .topbar-actions {
    display: flex;
    align-items: center;
    gap: 8px;
    flex-shrink: 0;
  }

  .scroller {
    flex: 1;
    min-height: 0;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
  }

  .content {
    flex: 1 0 auto;
    width: 100%;
    max-width: 1040px;
    margin: 0 auto;
    padding: 32px 28px 80px;
  }
  .content.wide { max-width: 1280px; }
  .content.full { max-width: none; }
  .content.flush { padding: 0; max-width: none; display: flex; flex-direction: column; }

  @media (max-width: 900px) {
    .menu-btn { display: inline-flex; }
    .scrim { display: block; }
    .topbar { padding: 0 14px; height: 60px; }
    .crumb.current { font-size: 16px; }
    .content { padding: 20px 14px 80px; }
  }
</style>
