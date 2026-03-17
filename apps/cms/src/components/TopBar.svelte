<script>
  import logoIcon from '../assets/logo-icon-black.svg';

  /** @type {{ pageName: string, actions?: import('svelte').Snippet }} */
  let { pageName = 'Dashboard', actions } = $props();
</script>

<header class="topbar">
  <div class="breadcrumb">
    <img src={logoIcon} alt="Malate" class="brand-logo" />
    <span class="separator">\</span>
    <span class="page-name mono">{pageName.toUpperCase()}</span>
    {#if actions}
      {@render actions()}
    {/if}
  </div>
</header>

<style>
  .topbar {
    position: sticky;
    top: 0;
    z-index: 100;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 16px 24px;
    background: #fff;
    border-bottom: 1px solid #f0f0f0;
  }

  .breadcrumb {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .brand-logo {
    width: 22px;
    height: 22px;
  }

  .separator {
    color: #ccc;
    font-size: 14px;
    user-select: none;
  }

  .page-name {
    font-size: 12px;
    font-weight: 400;
    color: #666;
    letter-spacing: 0.06em;
  }
</style>
