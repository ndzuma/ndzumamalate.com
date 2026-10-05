<script>
  import Shell from '../components/Shell.svelte';
  import Switch from '../components/Switch.svelte';
  import { navigate } from '../lib/router.svelte.js';
  import { experience } from '../lib/api.js';
  import { toast } from '../lib/toast.svelte.js';
  import { FloppyDisk } from 'phosphor-svelte';

  let { id = null } = $props();

  let company = $state('');
  let role = $state('');
  let type = $state('Work');
  let location = $state('');
  let description = $state('');
  let startDate = $state('');
  let endDate = $state('');
  let isPresent = $state(false);
  let saving = $state(false);
  let loading = $state(false);
  let error = $state('');

  const isEducation = $derived(type === 'Education');

  async function loadItem() {
    if (!id) {
      isPresent = true;
      return;
    }
    loading = true;
    try {
      const items = await experience.list();
      const item = items.find(e => e.id === id);
      if (item) {
        company = item.company || '';
        role = item.role || '';
        type = item.type || 'Work';
        location = item.location || '';
        description = item.description || '';
        startDate = item.start_date ? item.start_date.split('T')[0] : '';
        endDate = item.end_date ? item.end_date.split('T')[0] : '';
        isPresent = !item.end_date;
      }
    } catch (_) {}
    loading = false;
  }
  loadItem();

  async function save() {
    saving = true;
    error = '';
    try {
      const finalEndDate = isPresent ? '' : endDate;
      const data = { company, role, type, location, description, start_date: startDate, end_date: finalEndDate };
      if (id) {
        await experience.update(id, data);
      } else {
        await experience.create(data);
      }
      toast(id ? 'Experience updated' : 'Experience created');
      navigate('/collection/experience');
    } catch (e) {
      error = e.message || 'Failed to save';
      toast(error, 'error');
    }
    saving = false;
  }
</script>

<Shell title={id ? 'Edit experience' : 'New experience'} crumbs={[{ label: 'Experience', href: '/collection/experience' }]}>
  {#snippet actions()}
    <button class="btn btn-secondary" onclick={() => navigate('/collection/experience')}>Cancel</button>
    <button class="btn btn-primary" onclick={save} disabled={saving}>
      <FloppyDisk size={14} />
      {saving ? 'Saving…' : id ? 'Save changes' : 'Create'}
    </button>
  {/snippet}

  {#if loading}
    <div class="loader-inline">Loading…</div>
  {:else}
    <form class="form" onsubmit={(e) => { e.preventDefault(); save(); }}>
      <div class="card card-pad stack">
        <div class="field">
          <label for="type">Type</label>
          <select id="type" bind:value={type} required>
            <option value="Work">Work</option>
            <option value="Education">Education</option>
            <option value="Hackathon">Hackathon</option>
            <option value="Open-Source">Open-Source</option>
            <option value="Volunteering">Volunteering</option>
          </select>
        </div>

        <div class="field-row">
          <div class="field">
            <label for="company">{isEducation ? 'University / school' : 'Company'}</label>
            <input id="company" bind:value={company} placeholder={isEducation ? 'e.g. Kingston University' : 'Company name'} required />
          </div>
          <div class="field">
            <label for="role">{isEducation ? 'Course / degree' : 'Role'}</label>
            <input id="role" bind:value={role} placeholder={isEducation ? 'e.g. BSc Computer Science' : 'Job title'} required />
          </div>
        </div>

        <div class="field">
          <label for="location">Location</label>
          <input id="location" bind:value={location} placeholder="City, Country" />
        </div>

        <div class="field">
          <label for="desc">Description</label>
          <textarea id="desc" bind:value={description} placeholder="What you did, what you learned…" rows="5"></textarea>
        </div>
      </div>

      <div class="card card-pad stack">
        <div class="field-row">
          <div class="field">
            <label for="start">Start date</label>
            <input id="start" type="date" bind:value={startDate} required />
          </div>
          <div class="field">
            <label for="end">End date</label>
            <input id="end" type="date" bind:value={endDate} disabled={isPresent} />
          </div>
        </div>
        <Switch bind:checked={isPresent} label="Currently active" hint="Shows “Present” instead of an end date." />

        {#if error}
          <div class="error-box">{error}</div>
        {/if}
      </div>
      <button type="submit" hidden aria-label="Save"></button>
    </form>
  {/if}
</Shell>

<style>
  .form { max-width: 680px; display: flex; flex-direction: column; gap: 14px; }
  .stack { display: flex; flex-direction: column; gap: 18px; }
</style>
