<script>
  import { getPath, matchRoute } from './lib/router.svelte.js';
  import { checkAuth, isAuthenticated, isLoading } from './lib/auth.svelte.js';
  import Login from './pages/Login.svelte';
  import Dashboard from './pages/Dashboard.svelte';
  import Editor from './pages/Editor.svelte';
  import SkillForm from './pages/SkillForm.svelte';
  import ExperienceForm from './pages/ExperienceForm.svelte';
  import CvForm from './pages/CvForm.svelte';
  import ProfileForm from './pages/ProfileForm.svelte';
  import ChangePassword from './pages/ChangePassword.svelte';

  checkAuth();
</script>

{#if isLoading()}
  <div class="loader">
    <div class="loader-dot"></div>
  </div>
{:else if !isAuthenticated() || getPath() === '/login'}
  <Login />
{:else if getPath() === '/' || getPath() === '/dashboard'}
  <Dashboard />
{:else if matchRoute('/editor/:type/:id')}
  {@const params = matchRoute('/editor/:type/:id')}
  <Editor type={params.type} id={params.id} />
{:else if matchRoute('/editor/:type')}
  {@const params = matchRoute('/editor/:type')}
  <Editor type={params.type} id={null} />
{:else if getPath() === '/skills/new'}
  <SkillForm id={null} />
{:else if matchRoute('/skills/:id')}
  {@const params = matchRoute('/skills/:id')}
  <SkillForm id={params.id} />
{:else if getPath() === '/experience/new'}
  <ExperienceForm id={null} />
{:else if matchRoute('/experience/:id')}
  {@const params = matchRoute('/experience/:id')}
  <ExperienceForm id={params.id} />
{:else if getPath() === '/cv/new'}
  <CvForm id={null} />
{:else if matchRoute('/cv/:id')}
  {@const params = matchRoute('/cv/:id')}
  <CvForm id={params.id} />
{:else if getPath() === '/profile'}
  <ProfileForm />
{:else if getPath() === '/change-password'}
  <ChangePassword />
{:else}
  <Dashboard />
{/if}

<style>
  .loader {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100vh;
    width: 100%;
  }
  .loader-dot {
    width: 8px;
    height: 8px;
    background: #111;
    border-radius: 50%;
    animation: pulse 1s ease-in-out infinite;
  }
  @keyframes pulse {
    0%, 100% { opacity: 0.2; transform: scale(0.8); }
    50% { opacity: 1; transform: scale(1); }
  }
</style>
