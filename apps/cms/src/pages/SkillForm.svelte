<script>
  import TopBar from '../components/TopBar.svelte';
  import BottomNav from '../components/BottomNav.svelte';
  import { navigate } from '../lib/router.svelte.js';
  import { skills } from '../lib/api.js';
  import { ArrowLeft, FloppyDisk } from 'phosphor-svelte';

  let { id = null } = $props();

  let name = $state('');
  let category = $state('programming_language');
  let iconUrl = $state('');
  let proficiency = $state(3);
  let sortOrder = $state(0);
  let saving = $state(false);
  let loading = $state(false);
  let error = $state('');

  const categories = [
    { value: 'programming_language', label: 'Programming Language' },
    { value: 'framework', label: 'Framework' },
    { value: 'database', label: 'Database' },
    { value: 'tool', label: 'Tool' },
    { value: 'soft_skill', label: 'Soft Skill' },
    { value: 'other', label: 'Other' },
  ];

  async function loadItem() {
    if (!id) return;
    loading = true;
    try {
      const items = await skills.list();
      const item = items.find(s => s.id === id);
      if (item) {
        name = item.name || '';
        category = item.category || 'programming_language';
        iconUrl = item.icon_url || '';
        proficiency = item.proficiency ?? 3;
        sortOrder = item.sort_order ?? 0;
      }
    } catch (_) {}
    loading = false;
  }
  loadItem();

  async function save() {
    saving = true;
    error = '';
    try {
      const data = { name, category, icon_url: iconUrl, proficiency: Number(proficiency), sort_order: Number(sortOrder) };
      if (id) {
        await skills.update(id, data);
      } else {
        await skills.create(data);
      }
      navigate('/dashboard');
    } catch (e) {
      error = e.message || 'Failed to save';
    }
    saving = false;
  }
</script>

<div class="form-page">
  <TopBar pageName={id ? 'Edit Skill' : 'New Skill'} />

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
          <label class="mono">NAME</label>
          <input bind:value={name} placeholder="e.g. TypeScript" required />
        </div>

        <div class="field">
          <label class="mono">CATEGORY</label>
          <select bind:value={category}>
            {#each categories as cat}
              <option value={cat.value}>{cat.label}</option>
            {/each}
          </select>
        </div>

        <div class="field">
          <label class="mono">ICON URL</label>
          <input bind:value={iconUrl} placeholder="https://..." />
        </div>

        <div class="field-row">
          <div class="field">
            <label class="mono">PROFICIENCY (1-5)</label>
            <input type="number" min="1" max="5" bind:value={proficiency} />
          </div>
          <div class="field">
            <label class="mono">SORT ORDER</label>
            <input type="number" bind:value={sortOrder} />
          </div>
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
    flex: 1;
  }

  .field label {
    font-size: 11px;
    font-weight: 500;
    color: #999;
    letter-spacing: 0.06em;
  }

  .field input,
  .field select {
    padding: 10px 12px;
    border: 1px solid #e5e5e5;
    border-radius: 6px;
    font-size: 14px;
  }

  .field input:focus,
  .field select:focus {
    border-color: #111;
    outline: none;
  }

  .field-row {
    display: flex;
    gap: 16px;
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
