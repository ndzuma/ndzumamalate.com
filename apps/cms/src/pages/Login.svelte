<script>
  import { login, getError, isLoading } from '../lib/auth.svelte.js';
  import { navigate } from '../lib/router.svelte.js';

  let email = $state('');
  let password = $state('');

  async function handleSubmit(e) {
    e.preventDefault();
    const success = await login(email, password);
    if (success) navigate('/dashboard');
  }
</script>

<div class="login-page">
  <div class="login-card">
    <div class="login-header">
      <span class="brand mono">MALATE CMS</span>
    </div>

    <form onsubmit={handleSubmit}>
      <div class="field">
        <label class="mono" for="email">EMAIL</label>
        <input
          id="email"
          type="email"
          bind:value={email}
          placeholder="admin@example.com"
          autocomplete="email"
          required
        />
      </div>

      <div class="field">
        <label class="mono" for="password">PASSWORD</label>
        <input
          id="password"
          type="password"
          bind:value={password}
          placeholder="Enter password"
          autocomplete="current-password"
          required
        />
      </div>

      {#if getError()}
        <div class="error mono">{getError()}</div>
      {/if}

      <button type="submit" class="submit-btn" disabled={isLoading()}>
        {isLoading() ? 'Signing in...' : 'Sign in'}
      </button>
    </form>
  </div>
</div>

<style>
  .login-page {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 100vh;
    background: #fff;
  }

  .login-card {
    width: 100%;
    max-width: 360px;
    padding: 0 24px;
  }

  .login-header {
    margin-bottom: 48px;
  }

  .brand {
    font-size: 13px;
    font-weight: 600;
    letter-spacing: 0.08em;
    color: #111;
  }

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

  label {
    font-size: 11px;
    font-weight: 500;
    color: #666;
    letter-spacing: 0.06em;
  }

  input {
    padding: 10px 12px;
    border: 1px solid #e5e5e5;
    border-radius: 6px;
    font-size: 14px;
    transition: border-color 0.15s;
  }

  input:focus {
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

  .submit-btn {
    padding: 10px 0;
    background: #111;
    color: #fff;
    border: none;
    border-radius: 6px;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    transition: opacity 0.15s;
    margin-top: 4px;
  }

  .submit-btn:hover {
    opacity: 0.85;
  }

  .submit-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
</style>
