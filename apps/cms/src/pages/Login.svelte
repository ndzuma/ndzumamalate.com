<script>
  import { login, getError, isLoading } from '../lib/auth.svelte.js';
  import { navigate } from '../lib/router.svelte.js';
  import logoIcon from '../assets/Face logo.svg';
  import { EnvelopeSimple, LockSimple, Info, Eye, EyeSlash } from 'phosphor-svelte';

  let email = $state('');
  let password = $state('');
  let showPassword = $state(false);

  const ready = $derived(email.trim() !== '' && password !== '');

  async function handleSubmit(e) {
    e.preventDefault();
    if (!ready) return;
    const success = await login(email, password);
    if (success) navigate('/dashboard');
  }

  // Skeleton rows for the workspace preview on the right.
  const groups = [
    { label: null, rows: [56, 56, 80, 80, 80, 80] },
    { label: 'Collections', rows: [80, 68, 80] },
    { label: 'Pages', rows: [80, 52, 80] },
  ];
</script>

<div class="login-page">
  <div class="frame">
    <img class="brand" src={logoIcon} alt="Malate" />

    <div class="panel fade-up">
      <form class="form-side" onsubmit={handleSubmit}>
        <div class="form-head">
          <h1>Sign in</h1>
          <p class="muted">Manage everything on ndzumamalate.com.</p>
        </div>

        <div class="fields">
          <div class="field">
            <label for="email">Email</label>
            <div class="input-icon">
              <EnvelopeSimple size={15} />
              <input
                id="email"
                type="email"
                bind:value={email}
                placeholder="you@example.com"
                autocomplete="email"
                required
              />
            </div>
          </div>

          <div class="field">
            <label for="password">Password</label>
            <div class="input-icon">
              <LockSimple size={15} />
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                bind:value={password}
                placeholder="Enter password"
                autocomplete="current-password"
                required
              />
              <button
                type="button"
                class="reveal"
                onclick={() => showPassword = !showPassword}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {#if showPassword}<EyeSlash size={15} />{:else}<Eye size={15} />{/if}
              </button>
            </div>
          </div>

          <p class="note">
            <Info size={15} weight="fill" />
            Changes you save go live on the site instantly.
          </p>

          {#if getError()}
            <div class="error-box">{getError()}</div>
          {/if}
        </div>

        <button type="submit" class="btn btn-lg btn-block submit" class:ready disabled={isLoading()}>
          {isLoading() ? 'Signing in…' : 'Continue'}
        </button>
      </form>

      <div class="art-side" aria-hidden="true">
        <div class="preview">
          <div class="preview-sidebar">
            <div class="preview-brand">
              <img src={logoIcon} alt="" />
              <span>Malate</span>
            </div>
            {#each groups as group}
              <div class="preview-group">
                {#if group.label}<div class="preview-label">{group.label}</div>{/if}
                {#each group.rows as w}
                  <div class="preview-row">
                    <span class="dot"></span>
                    <span class="bar" style="width: {w}px"></span>
                  </div>
                {/each}
              </div>
            {/each}
          </div>
          <div class="preview-main"></div>
        </div>
      </div>
    </div>
  </div>
</div>

<style>
  .login-page {
    min-height: 100vh;
    padding: 24px;
    background: #ececec;
    display: flex;
  }

  .frame {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 40px;
    padding: 48px 24px;
    background: #f9f9f9;
    border: 1px solid #e4e4e4;
    border-radius: 28px;
  }

  .brand { width: 40px; height: 40px; }

  .panel {
    width: 100%;
    max-width: 1040px;
    min-height: 560px;
    display: grid;
    grid-template-columns: 1fr 1fr;
    background: var(--surface);
    border: 1px solid #e8e8e8;
    border-radius: 24px;
    padding: 6px;
    box-shadow: 0 1px 2px rgba(17, 19, 24, 0.03);
  }

  /* ── Form ── */
  .form-side {
    display: flex;
    flex-direction: column;
    padding: 42px 46px 40px;
  }

  .form-head { margin-bottom: 32px; }
  .form-head h1 { font-size: 1.375rem; font-weight: 600; letter-spacing: -0.02em; margin-bottom: 4px; }
  .form-head p { font-size: 13.5px; }

  .fields {
    display: flex;
    flex-direction: column;
    gap: 20px;
    flex: 1;
  }

  .field > label { color: var(--text); font-weight: 500; }

  .input-icon {
    position: relative;
    display: flex;
    align-items: center;
    color: var(--text-3);
  }
  .input-icon > :global(svg:first-child) {
    position: absolute;
    left: 13px;
    pointer-events: none;
  }
  .input-icon input {
    height: 42px;
    padding-left: 36px;
  }
  .reveal {
    position: absolute;
    right: 6px;
    width: 30px;
    height: 30px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: var(--radius-sm);
    color: var(--text-3);
    transition: background 0.15s, color 0.15s;
  }
  .reveal:hover { background: var(--surface-3); color: var(--text); }
  .input-icon:has(.reveal) input { padding-right: 42px; }

  .note {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 13px;
    color: var(--text-2);
  }
  .note :global(svg) { color: var(--text-3); flex-shrink: 0; }

  .submit {
    margin-top: 32px;
    height: 46px;
    background: var(--surface-3);
    color: var(--text-3);
    border-color: var(--border);
  }
  .submit.ready {
    background: var(--text);
    color: #fff;
    border-color: var(--text);
  }
  .submit.ready:hover:not(:disabled) { background: #2a2d35; }

  /* ── Art panel ── */
  .art-side {
    position: relative;
    overflow: hidden;
    border-radius: 19px;
    border: 1px solid #ececec;
    background-color: #ebe8e4;
    /* Fine grain over a warm wash, like paper. */
    background-image:
      url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 0.45  0 0 0 0 0.42  0 0 0 0 0.38  0 0 0 0.55 0'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>"),
      radial-gradient(ellipse 80% 60% at 100% 0%, #f6f4f1, transparent),
      linear-gradient(160deg, #e4e0db, #efedea);
  }

  .preview {
    position: absolute;
    top: 84px;
    left: 84px;
    right: 0;
    bottom: 0;
    display: flex;
    background: #fafafa;
    border-top-left-radius: 14px;
    border-left: 1px solid #e6e6e6;
    border-top: 1px solid #e6e6e6;
    box-shadow: -10px -10px 40px rgba(17, 19, 24, 0.04);
  }

  .preview-sidebar {
    width: 74%;
    flex-shrink: 0;
    padding: 22px 24px;
    border-right: 1px solid #ececec;
    display: flex;
    flex-direction: column;
    gap: 22px;
  }
  .preview-main { flex: 1; background: var(--surface); }

  .preview-brand {
    display: flex;
    align-items: center;
    gap: 10px;
    font-size: 14px;
    font-weight: 500;
    color: var(--text);
  }
  .preview-brand img {
    width: 22px;
    height: 22px;
    padding: 2px;
    border-radius: 6px;
    background: var(--surface-3);
  }

  .preview-group { display: flex; flex-direction: column; gap: 15px; }
  .preview-label { font-size: 12.5px; color: var(--text-3); margin-bottom: 2px; }
  .preview-row { display: flex; align-items: center; gap: 12px; }
  .dot { width: 12px; height: 12px; border-radius: 50%; background: #ececec; flex-shrink: 0; }
  .bar { height: 6px; border-radius: 3px; background: #ececec; }

  @media (max-width: 860px) {
    .login-page { padding: 0; }
    .frame { border-radius: 0; border: none; padding: 32px 16px; gap: 28px; }
    .panel { grid-template-columns: 1fr; max-width: 460px; min-height: 0; }
    .form-side { padding: 30px 26px 28px; }
    .art-side { display: none; }
  }
</style>
