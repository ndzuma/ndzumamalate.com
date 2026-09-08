<script>
  import Shell from '../components/Shell.svelte';
  import Switch from '../components/Switch.svelte';
  import { navigate } from '../lib/router.svelte.js';
  import { profile } from '../lib/api.js';
  import { toast } from '../lib/toast.svelte.js';
  import { FloppyDisk } from 'phosphor-svelte';

  let openToWork = $state(false);
  let spotifyUrl = $state('');
  let appleMusicUrl = $state('');
  let currentlyReadingTitle = $state('');
  let currentlyReadingUrl = $state('');
  let githubUrl = $state('');
  let twitterUrl = $state('');
  let threadsUrl = $state('');
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
        threadsUrl = data.threads_url || '';
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
        threads_url: threadsUrl,
        linkedin_url: linkedinUrl,
        website_url: websiteUrl,
      });
      toast('Profile updated');
    } catch (e) {
      error = e.message || 'Failed to save';
      toast(error, 'error');
    }
    saving = false;
  }
</script>

<Shell title="Profile" crumbs={[{ label: 'Settings' }]}>
  {#snippet actions()}
    <button class="btn btn-secondary" onclick={() => navigate('/dashboard')}>Back</button>
    <button class="btn btn-primary" onclick={save} disabled={saving}>
      <FloppyDisk size={14} />
      {saving ? 'Saving…' : 'Save changes'}
    </button>
  {/snippet}

  {#if loading}
    <div class="loader-inline">Loading…</div>
  {:else}
    <form class="form" onsubmit={(e) => { e.preventDefault(); save(); }}>
      <div class="card card-pad">
        <Switch bind:checked={openToWork} label="Open to work" hint="Shows a green badge next to your name on the homepage." />
      </div>

      <div class="card card-pad stack">
        <div>
          <div class="card-title">Social links</div>
          <div class="card-subtitle">Used by the footer and the {'{{social}}'} widget.</div>
        </div>
        <div class="field-row">
          <div class="field">
            <label for="gh">GitHub</label>
            <input id="gh" bind:value={githubUrl} placeholder="https://github.com/…" />
          </div>
          <div class="field">
            <label for="li">LinkedIn</label>
            <input id="li" bind:value={linkedinUrl} placeholder="https://linkedin.com/in/…" />
          </div>
        </div>
        <div class="field-row">
          <div class="field">
            <label for="tw">X / Twitter</label>
            <input id="tw" bind:value={twitterUrl} placeholder="https://x.com/…" />
          </div>
          <div class="field">
            <label for="th">Threads</label>
            <input id="th" bind:value={threadsUrl} placeholder="https://threads.net/…" />
          </div>
        </div>
        <div class="field">
          <label for="web">Website</label>
          <input id="web" bind:value={websiteUrl} placeholder="https://…" />
        </div>
      </div>

      <div class="card card-pad stack">
        <div>
          <div class="card-title">Listening to</div>
          <div class="card-subtitle">Powers the {'{{music}}'} widget on the stack page.</div>
        </div>
        <div class="field-row">
          <div class="field">
            <label for="sp">Spotify</label>
            <input id="sp" bind:value={spotifyUrl} placeholder="https://open.spotify.com/…" />
          </div>
          <div class="field">
            <label for="am">Apple Music</label>
            <input id="am" bind:value={appleMusicUrl} placeholder="https://music.apple.com/…" />
          </div>
        </div>
      </div>

      <div class="card card-pad stack">
        <div>
          <div class="card-title">Currently reading</div>
          <div class="card-subtitle">Powers the {'{{book}}'} widget. Leave empty to hide the line.</div>
        </div>
        <div class="field-row">
          <div class="field">
            <label for="bt">Book title</label>
            <input id="bt" bind:value={currentlyReadingTitle} placeholder="Book title" />
          </div>
          <div class="field">
            <label for="bu">Book URL</label>
            <input id="bu" bind:value={currentlyReadingUrl} placeholder="https://…" />
          </div>
        </div>
      </div>

      {#if error}
        <div class="error-box">{error}</div>
      {/if}
      <button type="submit" hidden aria-label="Save"></button>
    </form>
  {/if}
</Shell>

<style>
  .form { max-width: 720px; display: flex; flex-direction: column; gap: 14px; }
  .stack { display: flex; flex-direction: column; gap: 16px; }
</style>
