<script>
  import { navigate, getPath } from '../lib/router.svelte.js';
  import { logout } from '../lib/auth.svelte.js';
  import { House, NotePencil, GearSix, SignOut, Password, Plugs } from 'phosphor-svelte';

  let optionsOpen = $state(false);
  let hoveredBtn = $state(null);

  const isHome = $derived(getPath() === '/' || getPath() === '/dashboard');
  const isEditor = $derived(getPath().startsWith('/editor'));

  function activeKey() {
    if (isHome) return 'home';
    if (isEditor) return 'editor';
    return null;
  }

  // When hovering a *different* button than the active one, the active label collapses
  const anotherHovered = $derived(hoveredBtn !== null && hoveredBtn !== activeKey());

  function toggleOptions() {
    optionsOpen = !optionsOpen;
  }

  function closeOptions() {
    optionsOpen = false;
  }

  function go(path) {
    closeOptions();
    navigate(path);
  }

  function handleLogout() {
    closeOptions();
    logout();
  }
</script>

<svelte:window onclick={(e) => {
  if (optionsOpen && !e.target.closest('.navbar')) closeOptions();
}} />

<nav class="navbar">
  {#if optionsOpen}
    <div class="options-popup">
      <button class="option-item" onclick={() => go('/webhooks')}>
        <Plugs size={16} />
        <span>Webhooks</span>
      </button>
      <button class="option-item" onclick={() => go('/change-password')}>
        <Password size={16} />
        <span>Change password</span>
      </button>
      <button class="option-item" onclick={() => go('/profile')}>
        <GearSix size={16} />
        <span>Edit profile</span>
      </button>
    </div>
  {/if}

  <div class="navbar-inner">
    <button
      class="nav-btn"
      class:active={isHome}
      class:compacted={isHome && anotherHovered}
      class:hovered={hoveredBtn === 'home'}
      onmouseenter={() => hoveredBtn = 'home'}
      onmouseleave={() => hoveredBtn = null}
      onclick={() => go('/dashboard')}
    >
      <span class="nav-icon"><House size={18} weight={isHome ? 'fill' : 'regular'} /></span>
      <span class="nav-label">Home</span>
    </button>

    <button
      class="nav-btn"
      class:active={isEditor}
      class:compacted={isEditor && anotherHovered}
      class:hovered={hoveredBtn === 'editor'}
      onmouseenter={() => hoveredBtn = 'editor'}
      onmouseleave={() => hoveredBtn = null}
      onclick={() => go('/editor/project')}
    >
      <span class="nav-icon"><NotePencil size={18} weight={isEditor ? 'fill' : 'regular'} /></span>
      <span class="nav-label">Editor</span>
    </button>

    <div class="nav-divider"></div>

    <button
      class="nav-btn"
      class:active={optionsOpen}
      class:compacted={optionsOpen && anotherHovered}
      class:hovered={hoveredBtn === 'options'}
      onmouseenter={() => hoveredBtn = 'options'}
      onmouseleave={() => hoveredBtn = null}
      onclick={toggleOptions}
    >
      <span class="nav-icon"><GearSix size={18} weight={optionsOpen ? 'fill' : 'regular'} /></span>
      <span class="nav-label">Options</span>
    </button>

    <button
      class="nav-btn"
      class:hovered={hoveredBtn === 'logout'}
      onmouseenter={() => hoveredBtn = 'logout'}
      onmouseleave={() => hoveredBtn = null}
      onclick={handleLogout}
    >
      <span class="nav-icon"><SignOut size={18} /></span>
      <span class="nav-label">Logout</span>
    </button>
  </div>
</nav>

<style>
  .navbar {
    position: fixed;
    bottom: 24px;
    left: 50%;
    transform: translateX(-50%);
    z-index: 1000;
  }

  .navbar-inner {
    display: flex;
    align-items: center;
    gap: 4px;
    padding: 6px 8px;
    background: #111;
    border-radius: 14px;
    box-shadow: 0 4px 24px rgba(0, 0, 0, 0.18), 0 1px 4px rgba(0, 0, 0, 0.1);
  }

  /* ── Nav button ── */
  .nav-btn {
    display: flex;
    align-items: center;
    gap: 0px;
    padding: 9px 11px;
    color: rgba(255, 255, 255, 0.4);
    border-radius: 8px;
    background: transparent;
    border: none;
    cursor: pointer;
    white-space: nowrap;
    overflow: hidden;
    transition:
      background 0.28s cubic-bezier(0.4, 0, 0.2, 1),
      color 0.28s cubic-bezier(0.4, 0, 0.2, 1),
      padding 0.28s cubic-bezier(0.4, 0, 0.2, 1),
      gap 0.28s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .nav-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    width: 18px;
    height: 18px;
  }

  /* ── Label (hidden by default) ── */
  .nav-label {
    font-size: 13px;
    font-weight: 500;
    letter-spacing: 0.01em;
    display: block;
    max-width: 0;
    opacity: 0;
    overflow: hidden;
    transition:
      max-width 0.28s cubic-bezier(0.4, 0, 0.2, 1),
      opacity 0.22s cubic-bezier(0.4, 0, 0.2, 1);
  }

  /* ── Active: label visible, lighter pill ── */
  .nav-btn.active {
    background: #2a2a2a;
    color: #fff;
    gap: 7px;
    padding: 9px 16px 9px 12px;
    box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.07);
  }

  .nav-btn.active .nav-label {
    max-width: 80px;
    opacity: 1;
  }

  /* ── Active + compacted: another btn is hovered, collapse label but keep styling ── */
  .nav-btn.active.compacted {
    gap: 0px;
    padding: 9px 11px;
  }

  .nav-btn.active.compacted .nav-label {
    max-width: 0;
    opacity: 0;
  }

  /* ── Hovered (non-active): reveal label ── */
  .nav-btn.hovered:not(.active) {
    color: rgba(255, 255, 255, 0.85);
    background: rgba(255, 255, 255, 0.07);
    gap: 7px;
    padding: 9px 14px 9px 11px;
  }

  .nav-btn.hovered:not(.active) .nav-label {
    max-width: 80px;
    opacity: 1;
  }

  /* ── Active + hovered (hovering the active button itself): keep expanded ── */
  .nav-btn.active.hovered {
    background: #333;
    gap: 7px;
    padding: 9px 16px 9px 12px;
  }

  .nav-btn.active.hovered .nav-label {
    max-width: 80px;
    opacity: 1;
  }

  /* ── Divider ── */
  .nav-divider {
    width: 1px;
    height: 20px;
    background: rgba(255, 255, 255, 0.1);
    margin: 0 2px;
    flex-shrink: 0;
  }

  /* ── Options popup ── */
  .options-popup {
    position: absolute;
    bottom: calc(100% + 8px);
    left: 50%;
    transform: translateX(-50%);
    background: #fff;
    border: 1px solid #e5e5e5;
    border-radius: 10px;
    padding: 6px;
    min-width: 200px;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
    animation: popup-in 0.12s ease-out;
  }

  @keyframes popup-in {
    from { opacity: 0; transform: translateX(-50%) translateY(4px); }
    to { opacity: 1; transform: translateX(-50%) translateY(0); }
  }

  .option-item {
    display: flex;
    align-items: center;
    gap: 10px;
    width: 100%;
    padding: 10px 14px;
    font-size: 13px;
    color: #333;
    border-radius: 6px;
    transition: background 0.1s;
    background: none;
    border: none;
    cursor: pointer;
    text-align: left;
  }

  .option-item:hover {
    background: #f5f5f5;
  }
</style>
