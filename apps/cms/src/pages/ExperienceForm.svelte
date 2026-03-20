<script>
  import TopBar from '../components/TopBar.svelte';
  import BottomNav from '../components/BottomNav.svelte';
  import { navigate } from '../lib/router.svelte.js';
  import { experience } from '../lib/api.js';
  import { toast } from '../lib/toast.svelte.js';
  import { ArrowLeft, FloppyDisk } from 'phosphor-svelte';

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
      navigate('/dashboard');
    } catch (e) {
      error = e.message || 'Failed to save';
      toast(error, 'error');
    }
    saving = false;
  }
</script>

<div class="form-page">
  <TopBar pageName={id ? 'Edit Experience' : 'New Experience'} />

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
          <label class="mono">{type === 'Education' ? 'UNI / SCHOOL' : 'COMPANY'}</label>
          <input bind:value={company} placeholder={type === 'Education' ? 'e.g. University of Science' : 'Company name'} required />
        </div>

        <div class="field">
          <label class="mono">{type === 'Education' ? 'COURSE / DEGREE' : 'ROLE'}</label>
          <input bind:value={role} placeholder={type === 'Education' ? 'e.g. BSc Computer Science' : 'Job title'} required />
        </div>

        <div class="field">
          <label class="mono">TYPE</label>
          <select bind:value={type} required>
            <option value="Work">Work</option>
            <option value="Education">Education</option>
            <option value="Hackathon">Hackathon</option>
            <option value="Open-Source">Open-Source</option>
            <option value="Volunteering">Volunteering</option>
          </select>
        </div>

        <div class="field">
          <label class="mono">LOCATION</label>
          <input bind:value={location} placeholder="City, Country" />
        </div>

        <div class="field">
          <label class="mono">DESCRIPTION</label>
          <textarea bind:value={description} placeholder="Brief description of your role" rows="4"></textarea>
        </div>

        <div class="field-row">
          <div class="field">
            <label class="mono">START DATE</label>
            <input type="date" bind:value={startDate} required />
          </div>
          <div class="field">
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <label class="mono">END DATE</label>
              <label class="checkbox-label" style="margin: 0;">
                <input type="checkbox" bind:checked={isPresent} />
                <span>Currently active</span>
              </label>
            </div>
            <input type="date" bind:value={endDate} disabled={isPresent} />
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
  .field select,
  .field textarea {
    padding: 10px 12px;
    border: 1px solid #e5e5e5;
    border-radius: 6px;
    font-size: 14px;
    resize: vertical;
    background: #fff;
  }

  .field input:focus,
  .field select:focus,
  .field textarea:focus {
    border-color: #111;
    outline: none;
  }

  .field-row {
    display: flex;
    gap: 16px;
  }

  .checkbox-label {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 11px;
    color: #555;
    cursor: pointer;
  }

  .checkbox-label input[type="checkbox"] {
    width: 12px;
    height: 12px;
    margin: 0;
    padding: 0;
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
