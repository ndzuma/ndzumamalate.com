<script>
  import TopBar from '../components/TopBar.svelte';
  import BottomNav from '../components/BottomNav.svelte';
  import { navigate } from '../lib/router.svelte.js';
  import { changePassword } from '../lib/auth.svelte.js';
  import { ArrowLeft, FloppyDisk } from 'phosphor-svelte';

  let currentPassword = $state('');
  let newPassword = $state('');
  let confirmPassword = $state('');
  let saving = $state(false);
  let error = $state('');
  let success = $state(false);

  async function save() {
    error = '';
    if (newPassword !== confirmPassword) {
      error = 'Passwords do not match';
      return;
    }
    if (newPassword.length < 8) {
      error = 'Password must be at least 8 characters';
      return;
    }
    saving = true;
    const result = await changePassword(currentPassword, newPassword);
    if (result.ok) {
      success = true;
      setTimeout(() => navigate('/dashboard'), 1500);
    } else {
      error = result.error || 'Failed to change password';
    }
    saving = false;
  }
</script>

<div class="form-page">
  <TopBar pageName="Change Password" />

  <main class="form-content">
    <button class="back-link" onclick={() => navigate('/dashboard')}>
      <ArrowLeft size={14} />
      <span>Back to dashboard</span>
    </button>

    {#if success}
      <div class="success mono">Password changed. Redirecting...</div>
    {:else}
      <form onsubmit={(e) => { e.preventDefault(); save(); }}>
        <div class="field">
          <label class="mono">CURRENT PASSWORD</label>
          <input type="password" bind:value={currentPassword} required />
        </div>

        <div class="field">
          <label class="mono">NEW PASSWORD</label>
          <input type="password" bind:value={newPassword} required />
        </div>

        <div class="field">
          <label class="mono">CONFIRM NEW PASSWORD</label>
          <input type="password" bind:value={confirmPassword} required />
        </div>

        {#if error}
          <div class="error mono">{error}</div>
        {/if}

        <button type="submit" class="submit-btn" disabled={saving}>
          <FloppyDisk size={14} />
          {saving ? 'Saving...' : 'Change Password'}
        </button>
      </form>
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

  .field input {
    padding: 10px 12px;
    border: 1px solid #e5e5e5;
    border-radius: 6px;
    font-size: 14px;
  }

  .field input:focus {
    border-color: #111;
    outline: none;
  }

  .error {
    font-size: 12px;
    color: #dc2626;
    padding: 8px 12px;
    background: #fef2f2;
    border-radius: 6px;
  }

  .success {
    font-size: 13px;
    color: #16a34a;
    padding: 12px 16px;
    background: #f0fdf4;
    border: 1px solid #bbf7d0;
    border-radius: 8px;
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
