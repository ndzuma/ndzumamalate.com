<script>
  import TopBar from '../components/TopBar.svelte';
  import BottomNav from '../components/BottomNav.svelte';
  import { toast } from '../lib/toast.svelte.js';
  import { navigate } from '../lib/router.svelte.js';
  import { webhooks } from '../lib/api.js';
  import { ArrowLeft, Plus, Trash, PencilSimple, FloppyDisk, Eye, EyeSlash, CheckCircle, XCircle } from 'phosphor-svelte';

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
      const data = {
        url: formUrl.trim(),
        secret: formSecret,
        is_active: formActive,
      };
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

  // ── Inline two-click delete ──
  let deleteConfirmId = $state(null);
  let deleteTimeout = $state(null);

  function requestDelete(item) {
    if (deleteConfirmId === item.id) {
      // Second click — execute delete
      clearTimeout(deleteTimeout);
      executeDelete(item);
    } else {
      // First click — enter confirm state
      clearTimeout(deleteTimeout);
      deleteConfirmId = item.id;
      deleteTimeout = setTimeout(() => {
        deleteConfirmId = null;
      }, 3000);
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
      await webhooks.update(item.id, {
        url: item.url,
        secret: item.secret || '',
        is_active: !item.is_active,
      });
      await loadWebhooks();
      toast(item.is_active ? 'Webhook deactivated' : 'Webhook activated');
    } catch (_) {
      toast('Failed to update webhook', 'error');
    }
  }
</script>

<div class="form-page">
  <TopBar pageName="Webhooks" />

  <main class="form-content">
    <button class="back-link" onclick={() => navigate('/dashboard')}>
      <ArrowLeft size={14} />
      <span>Back to dashboard</span>
    </button>

    {#if editing !== null}
      <!-- ── Create / Edit Form ── -->
      <div class="form-card">
        <h2 class="form-title mono">{editing === 'new' ? 'NEW WEBHOOK' : 'EDIT WEBHOOK'}</h2>

        <form onsubmit={(e) => { e.preventDefault(); save(); }}>
          <div class="field">
            <label class="mono">ENDPOINT URL</label>
            <input bind:value={formUrl} placeholder="https://example.com/webhook" required />
          </div>

          <div class="field">
            <label class="mono">SECRET (HMAC SIGNING)</label>
            <div class="secret-row">
              <input
                type={showSecret ? 'text' : 'password'}
                bind:value={formSecret}
                placeholder="Optional signing secret"
              />
              <button
                type="button"
                class="secret-toggle"
                onclick={() => showSecret = !showSecret}
              >
                {#if showSecret}
                  <EyeSlash size={14} />
                {:else}
                  <Eye size={14} />
                {/if}
              </button>
            </div>
          </div>

          <div class="field">
            <label class="checkbox-label">
              <input type="checkbox" bind:checked={formActive} />
              <span>Active</span>
            </label>
          </div>

          {#if error}
            <div class="error mono">{error}</div>
          {/if}

          <div class="form-actions">
            <button type="submit" class="submit-btn" disabled={saving}>
              <FloppyDisk size={14} />
              {saving ? 'Saving...' : editing === 'new' ? 'Create' : 'Update'}
            </button>
            <button type="button" class="cancel-btn" onclick={cancelEdit}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    {:else}
      <!-- ── List View ── -->
      <div class="list-header">
        <span class="mono list-count">{allWebhooks.length} ENDPOINT{allWebhooks.length !== 1 ? 'S' : ''}</span>
        <button class="add-btn" onclick={startCreate}>
          <Plus size={14} />
          Add endpoint
        </button>
      </div>

      {#if loading}
        <div class="list-empty">Loading...</div>
      {:else if allWebhooks.length === 0}
        <div class="list-empty">
          <p>No webhook endpoints configured</p>
          <p class="list-empty-sub">Webhooks notify external services when content changes.</p>
        </div>
      {:else}
        <div class="webhook-list">
          {#each allWebhooks as wh}
            <div class="webhook-item">
              <div class="webhook-info">
                <div class="webhook-url">{wh.url}</div>
                <div class="webhook-meta">
                  <button
                    class="status-pill"
                    class:active={wh.is_active}
                    onclick={() => toggleActive(wh)}
                    title={wh.is_active ? 'Click to deactivate' : 'Click to activate'}
                  >
                    {#if wh.is_active}
                      <CheckCircle size={10} weight="fill" />
                      <span>Active</span>
                    {:else}
                      <XCircle size={10} weight="fill" />
                      <span>Inactive</span>
                    {/if}
                  </button>
                  {#if wh.secret}
                    <span class="mono secret-badge">HMAC</span>
                  {/if}
                </div>
              </div>
              <div class="webhook-actions">
                <button class="icon-btn" onclick={() => startEdit(wh)} title="Edit">
                  <PencilSimple size={14} />
                </button>
                <button
                  class="delete-btn"
                  class:confirming={deleteConfirmId === wh.id}
                  onclick={() => requestDelete(wh)}
                  title={deleteConfirmId === wh.id ? 'Click again to confirm' : 'Delete'}
                >
                  {#if deleteConfirmId === wh.id}
                    <span class="delete-confirm-text">Are you sure?</span>
                  {:else}
                    <Trash size={14} />
                  {/if}
                </button>
              </div>
            </div>
          {/each}
        </div>
      {/if}
    {/if}
  </main>

  <BottomNav />
</div>

<style>
  .form-page {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    background: #fff;
  }

  .form-content {
    max-width: 640px;
    width: 100%;
    margin: 0 auto;
    padding: 32px 24px 120px;
  }

  .back-link {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    font-size: 13px;
    color: #666;
    margin-bottom: 28px;
    background: none;
    border: none;
    cursor: pointer;
    padding: 0;
  }

  .back-link:hover { color: #111; }

  /* ── List View ── */
  .list-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 20px;
  }

  .list-count {
    font-size: 11px;
    color: #999;
    letter-spacing: 0.06em;
  }

  .add-btn {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 8px 16px;
    border: 1px solid #e5e5e5;
    border-radius: 8px;
    font-size: 13px;
    font-weight: 450;
    color: #333;
    background: #fff;
    cursor: pointer;
    transition: all 0.12s;
  }

  .add-btn:hover { border-color: #111; color: #111; }

  .list-empty {
    padding: 48px 0;
    text-align: center;
    font-size: 13px;
    color: #bbb;
  }

  .list-empty-sub {
    font-size: 12px;
    margin-top: 4px;
    color: #ccc;
  }

  .webhook-list {
    display: flex;
    flex-direction: column;
    gap: 1px;
    border: 1px solid #e5e5e5;
    border-radius: 10px;
    overflow: hidden;
  }

  .webhook-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    padding: 14px 16px;
    background: #fff;
    border-bottom: 1px solid #f5f5f5;
  }

  .webhook-item:last-child {
    border-bottom: none;
  }

  .webhook-info {
    flex: 1;
    min-width: 0;
  }

  .webhook-url {
    font-size: 13px;
    font-weight: 450;
    color: #111;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    margin-bottom: 4px;
  }

  .webhook-meta {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .status-pill {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    padding: 2px 8px;
    font-size: 10px;
    border-radius: 20px;
    border: 1px solid #e5e5e5;
    background: #fafafa;
    color: #999;
    cursor: pointer;
    transition: all 0.12s;
  }

  .status-pill:hover { border-color: #111; color: #111; }

  .status-pill.active {
    background: #111;
    color: #fff;
    border-color: #111;
  }

  .status-pill.active:hover { opacity: 0.85; }

  .secret-badge {
    font-size: 9px;
    color: #999;
    letter-spacing: 0.08em;
    padding: 2px 6px;
    background: #f5f5f5;
    border-radius: 4px;
  }

  .webhook-actions {
    display: flex;
    gap: 4px;
    flex-shrink: 0;
  }

  .icon-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 28px;
    height: 28px;
    border-radius: 6px;
    color: #666;
    background: none;
    border: none;
    cursor: pointer;
    transition: all 0.1s;
  }

  .icon-btn:hover { background: #f0f0f0; color: #111; }
  .icon-btn.danger:hover { background: #fef2f2; color: #dc2626; }

  .delete-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 28px;
    min-width: 28px;
    border-radius: 6px;
    color: #666;
    background: none;
    border: none;
    cursor: pointer;
    transition: all 0.15s;
    padding: 0 4px;
  }

  .delete-btn:hover {
    background: #fef2f2;
    color: #dc2626;
  }

  .delete-btn.confirming {
    background: #dc2626;
    color: #fff;
    border-radius: 6px;
    padding: 0 10px;
  }

  .delete-btn.confirming:hover {
    background: #b91c1c;
    color: #fff;
  }

  .delete-confirm-text {
    font-size: 11px;
    font-weight: 500;
    white-space: nowrap;
  }

  /* ── Form ── */
  .form-card {
    border: 1px solid #e5e5e5;
    border-radius: 10px;
    padding: 24px;
  }

  .form-title {
    font-size: 12px;
    font-weight: 500;
    color: #999;
    letter-spacing: 0.06em;
    margin-bottom: 20px;
  }

  form {
    display: flex;
    flex-direction: column;
    gap: 18px;
  }

  .field {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .field label {
    font-size: 11px;
    font-weight: 500;
    color: #999;
    letter-spacing: 0.06em;
  }

  .field input:not([type="checkbox"]) {
    padding: 10px 12px;
    border: 1px solid #e5e5e5;
    border-radius: 6px;
    font-size: 14px;
  }

  .field input:not([type="checkbox"]):focus {
    border-color: #111;
    outline: none;
  }

  .secret-row {
    display: flex;
    gap: 4px;
  }

  .secret-row input {
    flex: 1;
  }

  .secret-toggle {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 38px;
    border: 1px solid #e5e5e5;
    border-radius: 6px;
    background: #fff;
    color: #666;
    cursor: pointer;
    transition: all 0.1s;
    flex-shrink: 0;
  }

  .secret-toggle:hover { border-color: #111; color: #111; }

  .checkbox-label {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 14px;
    color: #333;
    cursor: pointer;
  }

  .checkbox-label input[type="checkbox"] {
    width: 16px;
    height: 16px;
    accent-color: #111;
    cursor: pointer;
  }

  .error {
    font-size: 12px;
    color: #dc2626;
    padding: 8px 12px;
    background: #fef2f2;
    border-radius: 6px;
  }

  .form-actions {
    display: flex;
    gap: 8px;
  }

  .submit-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    flex: 1;
    padding: 10px;
    background: #111;
    color: #fff;
    border: none;
    border-radius: 6px;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    transition: opacity 0.12s;
  }

  .submit-btn:hover { opacity: 0.85; }
  .submit-btn:disabled { opacity: 0.5; cursor: not-allowed; }

  .cancel-btn {
    padding: 10px 20px;
    background: #fff;
    color: #666;
    border: 1px solid #e5e5e5;
    border-radius: 6px;
    font-size: 14px;
    cursor: pointer;
    transition: border-color 0.12s;
  }

  .cancel-btn:hover { border-color: #111; color: #111; }
</style>
