<script>
  import TopBar from '../components/TopBar.svelte';
  import BottomNav from '../components/BottomNav.svelte';
  import { navigate } from '../lib/router.svelte.js';
  import { profile } from '../lib/api.js';
  import { toast } from '../lib/toast.svelte.js';
  import { ArrowLeft, FloppyDisk } from 'phosphor-svelte';

  let openToWork = $state(false);
  let spotifyUrl = $state('');
  let appleMusicUrl = $state('');
  let currentlyReadingTitle = $state('');
  let currentlyReadingUrl = $state('');
  let githubUrl = $state('');
  let twitterUrl = $state('');
  let linkedinUrl = $state('');
  let websiteUrl = $state('');
  let saving = $state(false);
  let loading = $state(true);
  let error = $state('');

  async function loadProfile() {
    try {
      const data = await profile.get();
      if (data && data.id) {
        openToWork = data.open_to_work || false;
        spotifyUrl = data.spotify_url || '';
        appleMusicUrl = data.apple_music_url || '';
        currentlyReadingTitle = data.currently_reading_title || '';
        currentlyReadingUrl = data.currently_reading_url || '';
        githubUrl = data.github_url || '';
        twitterUrl = data.twitter_url || '';
        linkedinUrl = data.linkedin_url || '';
        websiteUrl = data.website_url || '';
      }
    } catch (_) {}
    loading = false;
  }
  loadProfile();

  async function save() {
    saving = true;
    error = '';
    try {
      await profile.update({
        open_to_work: openToWork,
        spotify_url: spotifyUrl,
        apple_music_url: appleMusicUrl,
        currently_reading_title: currentlyReadingTitle,
        currently_reading_url: currentlyReadingUrl,
        github_url: githubUrl,
        twitter_url: twitterUrl,
        linkedin_url: linkedinUrl,
        website_url: websiteUrl,
      });
      toast('Profile updated');
      navigate('/dashboard');
    } catch (e) {
      error = e.message || 'Failed to save';
      toast(error, 'error');
    }
    saving = false;
  }
</script>

<div class="form-page">
  <TopBar pageName="Profile" />

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
          <label class="checkbox-label">
            <input type="checkbox" bind:checked={openToWork} />
            <span>Open to work</span>
          </label>
        </div>

        <div class="section-label mono">SOCIAL LINKS</div>

        <div class="field">
          <label class="mono">GITHUB URL</label>
          <input bind:value={githubUrl} placeholder="https://github.com/..." />
        </div>

        <div class="field">
          <label class="mono">TWITTER URL</label>
          <input bind:value={twitterUrl} placeholder="https://twitter.com/..." />
        </div>

        <div class="field">
          <label class="mono">LINKEDIN URL</label>
          <input bind:value={linkedinUrl} placeholder="https://linkedin.com/in/..." />
        </div>

        <div class="field">
          <label class="mono">WEBSITE URL</label>
          <input bind:value={websiteUrl} placeholder="https://..." />
        </div>

        <div class="section-label mono">MUSIC</div>

        <div class="field">
          <label class="mono">SPOTIFY URL</label>
          <input bind:value={spotifyUrl} placeholder="https://open.spotify.com/..." />
        </div>

        <div class="field">
          <label class="mono">APPLE MUSIC URL</label>
          <input bind:value={appleMusicUrl} placeholder="https://music.apple.com/..." />
        </div>

        <div class="section-label mono">CURRENTLY READING</div>

        <div class="field">
          <label class="mono">BOOK TITLE</label>
          <input bind:value={currentlyReadingTitle} placeholder="Book title" />
        </div>

        <div class="field">
          <label class="mono">BOOK URL</label>
          <input bind:value={currentlyReadingUrl} placeholder="https://..." />
        </div>

        {#if error}
          <div class="error mono">{error}</div>
        {/if}

        <button type="submit" class="submit-btn" disabled={saving}>
          <FloppyDisk size={14} />
          {saving ? 'Saving...' : 'Update Profile'}
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

  .section-label {
    font-size: 11px;
    font-weight: 500;
    color: #999;
    letter-spacing: 0.06em;
    padding-top: 8px;
    border-top: 1px solid #f0f0f0;
  }

  .field {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .field label.mono {
    font-size: 11px;
    font-weight: 500;
    color: #999;
    letter-spacing: 0.06em;
  }

  .field input:not([type="checkbox"]) {
    padding: 10px 12px;
    border: 1px solid #e5e5e5;
    border-radius: 6px;
    font-size: 14px;
  }

  .field input:not([type="checkbox"]):focus {
    border-color: #111;
    outline: none;
  }

  .checkbox-label {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 14px;
    color: #333;
    cursor: pointer;
  }

  .checkbox-label input[type="checkbox"] {
    width: 16px;
    height: 16px;
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
