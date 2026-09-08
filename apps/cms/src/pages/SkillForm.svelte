<script>
  import Shell from '../components/Shell.svelte';
  import { navigate } from '../lib/router.svelte.js';
  import { skills } from '../lib/api.js';
  import { toast } from '../lib/toast.svelte.js';
  import { FloppyDisk } from 'phosphor-svelte';

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
    { value: 'programming_language', label: 'Programming language' },
    { value: 'framework', label: 'Framework' },
    { value: 'database', label: 'Database' },
    { value: 'tool', label: 'Tool' },
    { value: 'soft_skill', label: 'Soft skill' },
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
      toast(id ? 'Skill updated' : 'Skill created');
      navigate('/collection/skills');
    } catch (e) {
      error = e.message || 'Failed to save';
      toast(error, 'error');
    }
    saving = false;
  }
</script>

<Shell title={id ? 'Edit skill' : 'New skill'} crumbs={[{ label: 'Skills', href: '/collection/skills' }]}>
  {#snippet actions()}
    <button class="btn btn-secondary" onclick={() => navigate('/collection/skills')}>Cancel</button>
    <button class="btn btn-primary" onclick={save} disabled={saving}>
      <FloppyDisk size={14} />
      {saving ? 'Saving…' : id ? 'Save changes' : 'Create skill'}
    </button>
  {/snippet}

  {#if loading}
    <div class="loader-inline">Loading…</div>
  {:else}
    <form class="form" onsubmit={(e) => { e.preventDefault(); save(); }}>
      <div class="card card-pad stack">
        <div class="field">
          <label for="name">Name</label>
          <input id="name" bind:value={name} placeholder="e.g. TypeScript" required />
        </div>

        <div class="field-row">
          <div class="field">
            <label for="category">Category</label>
            <select id="category" bind:value={category}>
              {#each categories as cat}
                <option value={cat.value}>{cat.label}</option>
              {/each}
            </select>
            <span class="hint">Groups the skill on the experience page and homepage ticker.</span>
          </div>
          <div class="field">
            <label for="prof">Proficiency (1–5)</label>
            <input id="prof" type="number" min="1" max="5" bind:value={proficiency} />
          </div>
        </div>

        <div class="field">
          <label for="icon">Icon URL</label>
          <div class="icon-row">
            <span class="icon-preview">
              {#if iconUrl}<img src={iconUrl} alt="" />{/if}
            </span>
            <input id="icon" bind:value={iconUrl} placeholder="https://cdn.simpleicons.org/typescript" />
          </div>
          <span class="hint">Skills with an icon scroll in the homepage logo ticker.</span>
        </div>

        <div class="field">
          <label for="sort">Sort order</label>
          <input id="sort" type="number" bind:value={sortOrder} />
        </div>

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
  .icon-row { display: flex; gap: 10px; align-items: center; }
  .icon-preview {
    width: 38px;
    height: 38px;
    border-radius: var(--radius);
    background: var(--surface-3);
    border: 1px solid var(--border);
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    overflow: hidden;
  }
  .icon-preview img { width: 22px; height: 22px; object-fit: contain; }
</style>
