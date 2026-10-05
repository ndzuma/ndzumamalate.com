<script>
  import { getPath, matchRoute } from './lib/router.svelte.js';
  import { checkAuth, isAuthenticated, isLoading } from './lib/auth.svelte.js';
  import Login from './pages/Login.svelte';
  import Dashboard from './pages/Dashboard.svelte';
  import Collection from './pages/Collection.svelte';
  import Editor from './pages/Editor.svelte';
  import SkillForm from './pages/SkillForm.svelte';
  import ExperienceForm from './pages/ExperienceForm.svelte';
  import CvForm from './pages/CvForm.svelte';
  import ProfileForm from './pages/ProfileForm.svelte';
  import ChangePassword from './pages/ChangePassword.svelte';
  import WebhookForm from './pages/WebhookForm.svelte';
  import PagesEditor from './pages/PagesEditor.svelte';
  import Toast from './components/Toast.svelte';

  checkAuth();

  // "writing" is the public name; the API still calls the resource "blog".
  function editorType(type) {
    return type === 'writing' || type === 'blog' ? 'blog' : 'project';
  }
</script>

<Toast />

{#if isLoading()}
  <div class="loader">
    <div class="loader-dot"></div>
  </div>
{:else if !isAuthenticated() || getPath() === '/login'}
  <Login />
{:else if getPath() === '/' || getPath() === '/dashboard'}
  <Dashboard />
{:else if matchRoute('/collection/:type')}
  {@const params = matchRoute('/collection/:type')}
  <Collection type={params.type} />
{:else if matchRoute('/editor/:type/:id')}
  {@const params = matchRoute('/editor/:type/:id')}
  <Editor type={editorType(params.type)} id={params.id} />
{:else if matchRoute('/editor/:type')}
  {@const params = matchRoute('/editor/:type')}
  <Editor type={editorType(params.type)} id={null} />
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
{:else if matchRoute('/pages/:key')}
  {@const params = matchRoute('/pages/:key')}
  <PagesEditor page={params.key} />
{:else if getPath() === '/profile'}
  <ProfileForm />
{:else if getPath() === '/change-password'}
  <ChangePassword />
{:else if getPath() === '/webhooks'}
  <WebhookForm />
{:else}
  <Dashboard />
{/if}
