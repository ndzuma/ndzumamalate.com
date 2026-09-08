<script>
  /** @type {{ checked: boolean, label?: string, hint?: string, disabled?: boolean, onchange?: (v: boolean) => void }} */
  let { checked = $bindable(false), label = '', hint = '', disabled = false, onchange } = $props();

  function toggle() {
    if (disabled) return;
    checked = !checked;
    onchange?.(checked);
  }
</script>

<div class="switch-row" class:disabled>
  {#if label}
    <div class="switch-text">
      <span class="switch-label">{label}</span>
      {#if hint}<span class="switch-hint">{hint}</span>{/if}
    </div>
  {/if}
  <button
    type="button"
    class="switch"
    class:on={checked}
    role="switch"
    aria-checked={checked}
    aria-label={label || 'Toggle'}
    onclick={toggle}
    {disabled}
  >
    <span class="knob"></span>
  </button>
</div>

<style>
  .switch-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
  }
  .switch-row.disabled { opacity: 0.6; }

  .switch-text { display: flex; flex-direction: column; gap: 2px; min-width: 0; }
  .switch-label { font-size: 13.5px; font-weight: 500; color: var(--text); }
  .switch-hint { font-size: 12px; color: var(--text-3); }

  .switch {
    position: relative;
    width: 40px;
    height: 24px;
    border-radius: 999px;
    background: var(--border-strong);
    transition: background 0.18s var(--ease);
    flex-shrink: 0;
  }
  .switch.on { background: var(--accent); }

  .knob {
    position: absolute;
    top: 3px;
    left: 3px;
    width: 18px;
    height: 18px;
    border-radius: 50%;
    background: #fff;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
    transition: transform 0.18s var(--ease);
  }
  .switch.on .knob { transform: translateX(16px); }
</style>
