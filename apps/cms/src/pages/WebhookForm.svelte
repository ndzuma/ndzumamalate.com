<script>
  import Shell from '../components/Shell.svelte';
  import Switch from '../components/Switch.svelte';
  import { toast } from '../lib/toast.svelte.js';
  import { webhooks } from '../lib/api.js';
  import { Plus, Trash, PencilSimple, FloppyDisk, Eye, EyeSlash, CheckCircle, XCircle, Broadcast } from 'phosphor-svelte';

  let allWebhooks = $state([]);
  let loading = $state(true);
  let error = $state('');

  // ── Form state ──
  let editing = $state(null); // null = list view, 'new' = create, id = editing
  let formUrl = $state('');
  let formSecret = $state('');
  let formActive = $state(true);
  let saving = $state(false);
  let showSecret = $state(false);

  async function loadWebhooks() {
    loading = true;
    try {
      allWebhooks = await webhooks.list() || [];
    } catch (_) {
      allWebhooks = [];
    }
    loading = false;
  }

  loadWebhooks();

  function startCreate() {
    editing = 'new';
    formUrl = '';
    formSecret = '';
    formActive = true;
    showSecret = false;
    error = '';
  }

  function startEdit(item) {
    editing = item.id;
    formUrl = item.url || '';
    formSecret = item.secret || '';
    formActive = item.is_active ?? true;
    showSecret = false;
    error = '';
  }

  function cancelEdit() {
    editing = null;
    error = '';
  }

  async function save() {
    if (!formUrl.trim()) {
      error = 'URL is required';
      return;
    }
    saving = true;
    error = '';
    try {
      const data = { url: formUrl.trim(), secret: formSecret, is_active: formActive };
      if (editing === 'new') {
        await webhooks.create(data);
        toast('Webhook created');
      } else {
        await webhooks.update(editing, data);
        toast('Webhook updated');
      }
      editing = null;
      await loadWebhooks();
    } catch (e) {
      error = e.message || 'Failed to save';
      toast('Failed to save webhook', 'error');
    }
    saving = false;
  }

  let deleteConfirmId = $state(null);
  let deleteTimeout = null;

  function requestDelete(item) {
    if (deleteConfirmId === item.id) {
      clearTimeout(deleteTimeout);
      executeDelete(item);
    } else {
      clearTimeout(deleteTimeout);
      deleteConfirmId = item.id;
      deleteTimeout = setTimeout(() => { deleteConfirmId = null; }, 3000);
    }
  }

  async function executeDelete(item) {
    deleteConfirmId = null;
    try {
      await webhooks.delete(item.id);
      await loadWebhooks();
      toast('Webhook deleted');
    } catch (_) {
      toast('Failed to delete webhook', 'error');
    }
  }

  async function toggleActive(item) {
    try {
      await webhooks.update(item.id, { url: item.url, secret: item.secret || '', is_active: !item.is_active });
      await loadWebhooks();
      toast(item.is_active ? 'Webhook deactivated' : 'Webhook activated');
    } catch (_) {
      toast('Failed to update webhook', 'error');
    }
  }
</script>

<Shell title="Webhooks" crumbs={[{ label: 'Settings' }]}>
  {#snippet actions()}
    {#if editing === null}
      <button class="btn btn-primary" onclick={startCreate}>
        <Plus size={14} weight="bold" />
        Add endpoint
      </button>
    {/if}
  {/snippet}

  <div class="page">
    <div class="card info">
      <span class="info-icon"><Broadcast size={16} weight="fill" /></span>
      <div>
        <div class="card-title">The public site syncs on its own</div>
        <div class="card-subtitle">ndzumamalate.com listens to the API event stream directly, so you don't need a webhook for it. Add endpoints here only for other services that should be notified when content changes (payloads are HMAC-signed with the secret).</div>
      </div>
    </div>

    {#if editing !== null}
      <form class="card card-pad stack" onsubmit={(e) => { e.preventDefault(); save(); }}>
        <div class="card-title">{editing === 'new' ? 'New endpoint' : 'Edit endpoint'}</div>

        <div class="field">
          <label for="url">Endpoint URL</label>
          <input id="url" bind:value={formUrl} placeholder="https://example.com/webhook" required />
        </div>

        <div class="field">
          <label for="secret">Signing secret</label>
          <div class="secret-row">
            <input id="secret" type={showSecret ? 'text' : 'password'} bind:value={formSecret} placeholder="Optional — sent as X-Ndz-Signature (sha256 HMAC)" />
            <button type="button" class="btn btn-secondary btn-icon" onclick={() => showSecret = !showSecret} title={showSecret ? 'Hide' : 'Show'}>
              {#if showSecret}<EyeSlash size={15} />{:else}<Eye size={15} />{/if}
            </button>
          </div>
        </div>

        <Switch bind:checked={formActive} label="Active" hint="Inactive endpoints are kept but not called." />

        {#if error}
          <div class="error-box">{error}</div>
        {/if}

        <div class="actions">
          <button type="button" class="btn btn-secondary" onclick={cancelEdit}>Cancel</button>
          <button type="submit" class="btn btn-primary" disabled={saving}>
            <FloppyDisk size={14} />
            {saving ? 'Saving…' : editing === 'new' ? 'Create' : 'Save changes'}
          </button>
        </div>
      </form>
    {:else if loading}
      <div class="loader-inline">Loading…</div>
    {:else if allWebhooks.length === 0}
      <div class="card empty">
        <p>No webhook endpoints configured.</p>
        <p class="muted small">Only needed for third-party integrations.</p>
      </div>
    {:else}
      <div class="card list">
        {#each allWebhooks as wh}
          <div class="item">
            <div class="item-info">
              <div class="item-url">{wh.url}</div>
              <div class="item-meta">
                <button class="pill" class:on={wh.is_active} onclick={() => toggleActive(wh)} title={wh.is_active ? 'Click to deactivate' : 'Click to activate'}>
                  {#if wh.is_active}
                    <CheckCircle size={11} weight="fill" /> Active
                  {:else}
                    <XCircle size={11} weight="fill" /> Inactive
                  {/if}
                </button>
                {#if wh.secret}
                  <span class="badge">Signed</span>
                {/if}
              </div>
            </div>
            <div class="item-actions">
              <button class="btn btn-ghost btn-icon btn-sm" onclick={() => startEdit(wh)} title="Edit"><PencilSimple size={14} /></button>
              <button
                class="btn btn-sm {deleteConfirmId === wh.id ? 'btn-danger' : 'btn-ghost btn-icon'}"
                onclick={() => requestDelete(wh)}
                title={deleteConfirmId === wh.id ? 'Click again to confirm' : 'Delete'}
              >
                {#if deleteConfirmId === wh.id}Confirm?{:else}<Trash size={14} />{/if}
              </button>
            </div>
          </div>
        {/each}
      </div>
    {/if}
  </div>
</Shell>

<style>
  .page { max-width: 720px; display: flex; flex-direction: column; gap: 14px; }
  .stack { display: flex; flex-direction: column; gap: 18px; }
  .actions { display: flex; justify-content: flex-end; gap: 8px; }

  .info {
    display: flex;
    gap: 12px;
    padding: 14px 16px;
    background: var(--accent-soft);
    border-color: transparent;
  }
  .info-icon {
    width: 30px;
    height: 30px;
    border-radius: 9px;
    background: #fff;
    color: var(--accent);
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }
  .info .card-subtitle { color: var(--text-2); margin-top: 2px; line-height: 1.5; }

  .secret-row { display: flex; gap: 8px; }

  .empty { padding: 40px; text-align: center; }

  .list { display: flex; flex-direction: column; }
  .item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    padding: 14px 16px;
    border-bottom: 1px solid var(--border);
  }
  .item:last-child { border-bottom: none; }
  .item-info { flex: 1; min-width: 0; }
  .item-url { font-size: 13px; font-weight: 500; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; margin-bottom: 6px; }
  .item-meta { display: flex; align-items: center; gap: 6px; }
  .item-actions { display: flex; gap: 2px; }

  .pill {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    height: 22px;
    padding: 0 9px;
    border-radius: 999px;
    font-size: 11px;
    font-weight: 500;
    background: var(--surface-3);
    color: var(--text-3);
    transition: all 0.12s;
  }
  .pill:hover { color: var(--text); }
  .pill.on { background: var(--success-soft); color: var(--success); }
</style>
