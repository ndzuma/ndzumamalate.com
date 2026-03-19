<script>
  import TopBar from '../components/TopBar.svelte';
  import BottomNav from '../components/BottomNav.svelte';
  import { navigate } from '../lib/router.svelte.js';
  import { cv } from '../lib/api.js';
  import { toast } from '../lib/toast.svelte.js';
  import { ArrowLeft, FloppyDisk } from 'phosphor-svelte';
  import Uploader from '../components/Uploader.svelte';

  let { id = null } = $props();

  let fileUrl = $state('');
  let label = $state('');
  let isActive = $state(false);
  let saving = $state(false);
  let loading = $state(false);
  let error = $state('');

  async function loadItem() {
    if (!id) return;
    loading = true;
    try {
      const items = await cv.list();
      const item = items.find(c => c.id === id);
      if (item) {
        fileUrl = item.file_url || '';
        label = item.label || '';
        isActive = item.is_active || false;
      }
    } catch (_) {}
    loading = false;
  }
  loadItem();

  async function save() {
    saving = true;
    error = '';
    try {
      const data = { file_url: fileUrl, label, is_active: isActive };
      if (id) {
        await cv.update(id, data);
      } else {
        await cv.create(data);
      }
      toast(id ? 'CV updated' : 'CV created');
      navigate('/dashboard');
    } catch (e) {
      error = e.message || 'Failed to save';
      toast(error, 'error');
    }
    saving = false;
  }
</script>

<div class="form-page">
  <TopBar pageName={id ? 'Edit CV' : 'New CV'} />

  {#if loading}
    <div class="loader-center">Loading...</div>
  {:else}
    <main class="form-content">
      <button class="back-link" onclick={() => navigate('/dashboard')}>
        <ArrowLeft size={14} />
        <span>Back to dashboard</span>
      </button>

      <form onsubmit={(e) => { e.preventDefault(); save(); }}>
        <div class="field">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <label class="mono">FILE URL</label>
            <Uploader onUpload={(url) => fileUrl = url} />
          </div>
          <input bind:value={fileUrl} placeholder="https://..." required />
        </div>

        <div class="field">
          <label class="mono">LABEL</label>
          <input bind:value={label} placeholder="e.g. CV March 2026" />
        </div>

        <div class="field">
          <label class="checkbox-label">
            <input type="checkbox" bind:checked={isActive} />
            <span>Set as active CV</span>
          </label>
        </div>

        {#if error}
          <div class="error mono">{error}</div>
        {/if}

        <button type="submit" class="submit-btn" disabled={saving}>
          <FloppyDisk size={14} />
          {saving ? 'Saving...' : id ? 'Update' : 'Create'}
        </button>
      </form>
    </main>
  {/if}

  <BottomNav />
</div>

<style>
  .form-page {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    background: #fff;
  }

  .loader-center {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 13px;
    color: #999;
  }

  .form-content {
    max-width: 520px;
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

  form {
    display: flex;
    flex-direction: column;
    gap: 20px;
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

  .field input[type="text"],
  .field input[type="url"],
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

  .submit-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
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
</style>
