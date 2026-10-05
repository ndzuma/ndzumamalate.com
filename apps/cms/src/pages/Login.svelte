<script>
  import { login, getError, isLoading } from '../lib/auth.svelte.js';
  import { navigate } from '../lib/router.svelte.js';
  import logoIcon from '../assets/Face logo.svg';
  import { ArrowRight } from 'phosphor-svelte';

  let email = $state('');
  let password = $state('');

  async function handleSubmit(e) {
    e.preventDefault();
    const success = await login(email, password);
    if (success) navigate('/dashboard');
  }
</script>

<div class="login-page">
  <div class="login-card card fade-up">
    <div class="login-header">
      <div class="login-logo"><img src={logoIcon} alt="Malate" /></div>
      <h1>Welcome back</h1>
      <p class="muted">Sign in to manage ndzumamalate.com</p>
    </div>

    <form onsubmit={handleSubmit}>
      <div class="field">
        <label for="email">Email</label>
        <input
          id="email"
          type="email"
          bind:value={email}
          placeholder="you@example.com"
          autocomplete="email"
          required
        />
      </div>

      <div class="field">
        <label for="password">Password</label>
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
        <div class="error-box">{getError()}</div>
      {/if}

      <button type="submit" class="btn btn-primary btn-lg btn-block" disabled={isLoading()}>
        {isLoading() ? 'Signing in…' : 'Sign in'}
        {#if !isLoading()}<ArrowRight size={15} weight="bold" />{/if}
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
    padding: 24px;
    background:
      radial-gradient(ellipse 60% 50% at 20% 0%, rgba(47, 107, 255, 0.08), transparent),
      radial-gradient(ellipse 50% 40% at 90% 100%, rgba(124, 58, 237, 0.07), transparent),
      var(--bg);
  }

  .login-card {
    width: 100%;
    max-width: 400px;
    padding: 36px 32px;
    box-shadow: var(--shadow);
  }

  .login-header { margin-bottom: 28px; }
  .login-header h1 { font-size: 1.375rem; margin-bottom: 4px; }
  .login-header p { font-size: 13px; }

  .login-logo {
    width: 44px;
    height: 44px;
    border-radius: 12px;
    background: var(--surface-3);
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 18px;
  }
  .login-logo img { width: 30px; height: 30px; }

  form {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }
</style>
