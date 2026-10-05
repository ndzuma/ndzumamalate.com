<script>
  import Shell from '../components/Shell.svelte';
  import Switch from '../components/Switch.svelte';
  import Uploader from '../components/Uploader.svelte';
  import { navigate } from '../lib/router.svelte.js';
  import { cv } from '../lib/api.js';
  import { toast } from '../lib/toast.svelte.js';
  import { FloppyDisk, FilePdf, ArrowSquareOut } from 'phosphor-svelte';

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
      toast(id ? 'CV updated' : 'CV added');
      navigate('/collection/cv');
    } catch (e) {
      error = e.message || 'Failed to save';
      toast(error, 'error');
    }
    saving = false;
  }
</script>

<Shell title={id ? 'Edit CV' : 'New CV'} crumbs={[{ label: 'CV', href: '/collection/cv' }]}>
  {#snippet actions()}
    <button class="btn btn-secondary" onclick={() => navigate('/collection/cv')}>Cancel</button>
    <button class="btn btn-primary" onclick={save} disabled={saving}>
      <FloppyDisk size={14} />
      {saving ? 'Saving…' : id ? 'Save changes' : 'Add CV'}
    </button>
  {/snippet}

  {#if loading}
    <div class="loader-inline">Loading…</div>
  {:else}
    <form class="form" onsubmit={(e) => { e.preventDefault(); save(); }}>
      <div class="card card-pad stack">
        <div class="field">
          <div class="label-row">
            <label for="file">File</label>
            <Uploader onUpload={(url) => fileUrl = url} accept=".pdf,.doc,.docx" label="Upload file" />
          </div>
          <div class="file-row">
            <span class="file-icon"><FilePdf size={18} weight="fill" /></span>
            <input id="file" bind:value={fileUrl} placeholder="https://…" required />
            {#if fileUrl}
              <a class="btn btn-ghost btn-icon" href={fileUrl} target="_blank" rel="noopener noreferrer" title="Open"><ArrowSquareOut size={15} /></a>
            {/if}
          </div>
        </div>

        <div class="field">
          <label for="label">Label</label>
          <input id="label" bind:value={label} placeholder="e.g. CV March 2026" />
          <span class="hint">Shown on the homepage CV card.</span>
        </div>

        <Switch bind:checked={isActive} label="Active CV" hint="Only one CV is live at a time." />

        {#if error}
          <div class="error-box">{error}</div>
        {/if}
      </div>
      <button type="submit" hidden aria-label="Save"></button>
    </form>
  {/if}
</Shell>

<style>
  .form { max-width: 640px; }
  .stack { display: flex; flex-direction: column; gap: 18px; }
  .label-row { display: flex; align-items: center; justify-content: space-between; }
  .file-row { display: flex; align-items: center; gap: 8px; }
  .file-icon {
    width: 38px;
    height: 38px;
    border-radius: var(--radius);
    background: var(--danger-soft);
    color: var(--danger);
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }
</style>
