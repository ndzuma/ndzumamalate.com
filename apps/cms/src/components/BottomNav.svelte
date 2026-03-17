<script>
  import { navigate, getPath } from '../lib/router.svelte.js';
  import { logout } from '../lib/auth.svelte.js';
  import { House, NotePencil, GearSix, SignOut, CaretUp, Password } from 'phosphor-svelte';

  let optionsOpen = $state(false);

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
      class:active={getPath() === '/' || getPath() === '/dashboard'}
      onclick={() => go('/dashboard')}
      title="Home"
    >
      <House size={20} weight={getPath() === '/' || getPath() === '/dashboard' ? 'fill' : 'regular'} />
    </button>

    <button
      class="nav-btn"
      class:active={getPath().startsWith('/editor')}
      onclick={() => go('/editor/project')}
      title="New editor"
    >
      <NotePencil size={20} weight={getPath().startsWith('/editor') ? 'fill' : 'regular'} />
    </button>

    <div class="nav-divider"></div>

    <button
      class="nav-btn"
      class:active={optionsOpen}
      onclick={toggleOptions}
      title="Options"
    >
      <GearSix size={20} weight={optionsOpen ? 'fill' : 'regular'} />
      <CaretUp size={10} class="caret" />
    </button>

    <button class="nav-btn" onclick={handleLogout} title="Log out">
      <SignOut size={20} />
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
    padding: 8px 12px;
    background: #111;
    border-radius: 14px;
    box-shadow: 0 4px 24px rgba(0, 0, 0, 0.12), 0 1px 4px rgba(0, 0, 0, 0.08);
  }

  .nav-btn {
    display: flex;
    align-items: center;
    gap: 4px;
    padding: 8px 10px;
    color: #888;
    border-radius: 8px;
    transition: all 0.15s;
    background: none;
    border: none;
    cursor: pointer;
  }

  .nav-btn:hover {
    color: #fff;
    background: rgba(255, 255, 255, 0.08);
  }

  .nav-btn.active {
    color: #fff;
  }

  .nav-divider {
    width: 1px;
    height: 20px;
    background: rgba(255, 255, 255, 0.15);
    margin: 0 4px;
  }

  :global(.caret) {
    opacity: 0.5;
  }

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
