<script>
  /** @type {{ pageName: string }} */
  let { pageName = 'Dashboard' } = $props();
</script>

<header class="topbar">
  <div class="breadcrumb">
    <span class="brand mono">MALATE CMS</span>
    <span class="separator">\</span>
    <span class="page-name mono">{pageName.toUpperCase()}</span>
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

  .brand {
    font-size: 13px;
    font-weight: 600;
    letter-spacing: 0.08em;
    color: #111;
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
