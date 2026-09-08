<script>
  import { getToasts, dismiss } from '../lib/toast.svelte.js';
  import { CheckCircle, Warning, Info, X } from 'phosphor-svelte';

  const toasts = $derived(getToasts());

  const icons = {
    success: CheckCircle,
    error: Warning,
    info: Info,
  };
</script>

{#if toasts.length > 0}
  <div class="toast-container">
    {#each toasts as t (t.id)}
      {@const Icon = icons[t.type] || Info}
      <div class="toast" class:error={t.type === 'error'} class:info={t.type === 'info'}>
        <span class="toast-icon"><Icon size={15} weight="fill" /></span>
        <span class="toast-msg">{t.message}</span>
        <button class="toast-close" onclick={() => dismiss(t.id)} aria-label="Dismiss">
          <X size={12} />
        </button>
      </div>
    {/each}
  </div>
{/if}

<style>
  .toast-container {
    position: fixed;
    bottom: 24px;
    left: 50%;
    transform: translateX(-50%);
    display: flex;
    flex-direction: column-reverse;
    gap: 8px;
    z-index: 9999;
    pointer-events: none;
  }

  .toast {
    pointer-events: all;
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 10px 12px 10px 14px;
    background: var(--text);
    color: #fff;
    border-radius: 12px;
    font-size: 13px;
    font-weight: 450;
    box-shadow: var(--shadow-lg);
    animation: toast-in 0.2s var(--ease);
    white-space: nowrap;
  }

  .toast-icon { color: #7ee2a2; display: flex; }
  .toast.error { background: var(--danger); }
  .toast.error .toast-icon { color: #fff; }
  .toast.info { background: #2a2d35; }
  .toast.info .toast-icon { color: #9db9ff; }

  .toast-msg { flex: 1; }

  .toast-close {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 22px;
    height: 22px;
    background: rgba(255, 255, 255, 0.14);
    color: #fff;
    border-radius: 6px;
    flex-shrink: 0;
    transition: background 0.1s;
  }
  .toast-close:hover { background: rgba(255, 255, 255, 0.26); }

  @keyframes toast-in {
    from { opacity: 0; transform: translateY(8px); }
    to { opacity: 1; transform: translateY(0); }
  }
</style>
