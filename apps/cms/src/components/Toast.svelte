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
      <div class="toast" class:error={t.type === 'error'} class:info={t.type === 'info'}>
        <svelte:component this={icons[t.type] || Info} size={15} weight="fill" />
        <span class="toast-msg">{t.message}</span>
        <button class="toast-close" onclick={() => dismiss(t.id)}>
          <X size={12} />
        </button>
      </div>
    {/each}
  </div>
{/if}

<style>
  .toast-container {
    position: fixed;
    bottom: 80px;
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
    gap: 8px;
    padding: 10px 16px;
    background: #111;
    color: #fff;
    border-radius: 10px;
    font-size: 13px;
    font-weight: 450;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
    animation: toast-in 0.2s ease-out;
    white-space: nowrap;
  }

  .toast.error {
    background: #dc2626;
  }

  .toast.info {
    background: #555;
  }

  .toast-msg {
    flex: 1;
  }

  .toast-close {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 20px;
    height: 20px;
    border: none;
    background: rgba(255, 255, 255, 0.15);
    color: #fff;
    border-radius: 4px;
    cursor: pointer;
    flex-shrink: 0;
    transition: background 0.1s;
  }

  .toast-close:hover {
    background: rgba(255, 255, 255, 0.25);
  }

  @keyframes toast-in {
    from { opacity: 0; transform: translateY(8px); }
    to { opacity: 1; transform: translateY(0); }
  }
</style>
