<script>
  import Shell from '../components/Shell.svelte';
  import { navigate } from '../lib/router.svelte.js';
  import { changePassword } from '../lib/auth.svelte.js';
  import { toast } from '../lib/toast.svelte.js';
  import { LockKey } from 'phosphor-svelte';

  let currentPassword = $state('');
  let newPassword = $state('');
  let confirmPassword = $state('');
  let saving = $state(false);
  let error = $state('');

  async function save() {
    error = '';
    if (newPassword !== confirmPassword) {
      error = 'Passwords do not match';
      toast(error, 'error');
      return;
    }
    if (newPassword.length < 8) {
      error = 'Password must be at least 8 characters';
      toast(error, 'error');
      return;
    }
    saving = true;
    const result = await changePassword(currentPassword, newPassword);
    if (result.ok) {
      toast('Password changed');
      navigate('/dashboard');
    } else {
      error = result.error || 'Failed to change password';
      toast(error, 'error');
    }
    saving = false;
  }
</script>

<Shell title="Change password" crumbs={[{ label: 'Settings' }]}>
  <form class="form" onsubmit={(e) => { e.preventDefault(); save(); }}>
    <div class="card card-pad stack">
      <div class="field">
        <label for="cur">Current password</label>
        <input id="cur" type="password" bind:value={currentPassword} autocomplete="current-password" required />
      </div>
      <div class="field">
        <label for="new">New password</label>
        <input id="new" type="password" bind:value={newPassword} autocomplete="new-password" required />
        <span class="hint">At least 8 characters.</span>
      </div>
      <div class="field">
        <label for="conf">Confirm new password</label>
        <input id="conf" type="password" bind:value={confirmPassword} autocomplete="new-password" required />
      </div>

      {#if error}
        <div class="error-box">{error}</div>
      {/if}

      <div class="actions">
        <button type="button" class="btn btn-secondary" onclick={() => navigate('/dashboard')}>Cancel</button>
        <button type="submit" class="btn btn-primary" disabled={saving}>
          <LockKey size={14} />
          {saving ? 'Updating…' : 'Update password'}
        </button>
      </div>
    </div>
  </form>
</Shell>

<style>
  .form { max-width: 520px; }
  .stack { display: flex; flex-direction: column; gap: 18px; }
  .actions { display: flex; justify-content: flex-end; gap: 8px; }
</style>
