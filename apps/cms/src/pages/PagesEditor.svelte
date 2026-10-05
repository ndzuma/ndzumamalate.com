<script>
  import Shell from '../components/Shell.svelte';
  import TokenField from '../components/TokenField.svelte';
  import { pages, projects as projectsApi } from '../lib/api.js';
  import { toast } from '../lib/toast.svelte.js';
  import { FloppyDisk, Plus, Trash, ArrowUp, ArrowDown, ArrowSquareOut } from 'phosphor-svelte';

  /** @type {{ page: 'home' | 'stack' | 'intros' }} */
  let { page = 'home' } = $props();

  const titles = { home: 'Homepage', stack: 'Stack', intros: 'Section intros' };
  const siteUrl = 'https://ndzumamalate.com';
  const previewPath = { home: '/', stack: '/stack', intros: '/projects' };

  let loading = $state(true);
  let saving = $state(false);
  let allProjects = $state([]);

  // ── Home ──
  let home = $state({ name: '', location: '', paragraphs: [], projects_title: '', writings_title: '' });

  // ── Stack ──
  let stack = $state({ title: '', intro: '', sections: [] });

  // ── Intros ──
  const introKeys = ['projects', 'writings', 'experience'];
  let intros = $state({
    projects: { title: '', intro: '' },
    writings: { title: '', intro: '' },
    experience: { title: '', intro: '' },
  });

  async function load() {
    loading = true;
    try {
      const [list, projs] = await Promise.all([
        pages.list().catch(() => []),
        projectsApi.list().catch(() => []),
      ]);
      allProjects = projs || [];
      const byKey = Object.fromEntries((list || []).map((p) => [p.key, p.data || {}]));

      if (page === 'home') {
        const d = byKey.home || {};
        home = {
          name: d.name || '',
          location: d.location || '',
          paragraphs: Array.isArray(d.paragraphs) ? [...d.paragraphs] : [],
          projects_title: d.projects_title || '',
          writings_title: d.writings_title || '',
        };
      } else if (page === 'stack') {
        const d = byKey.stack || {};
        stack = {
          title: d.title || '',
          intro: d.intro || '',
          sections: Array.isArray(d.sections)
            ? d.sections.map((s) => ({ title: s.title || '', items: Array.isArray(s.items) ? [...s.items] : [] }))
            : [],
        };
      } else {
        for (const key of introKeys) {
          const d = byKey[key] || {};
          intros[key] = { title: d.title || '', intro: d.intro || '' };
        }
      }
    } catch (_) {
      toast('Failed to load page content', 'error');
    }
    loading = false;
  }

  $effect(() => {
    page;
    load();
  });

  async function save() {
    saving = true;
    try {
      if (page === 'home') {
        await pages.update('home', {
          ...home,
          paragraphs: home.paragraphs.map((p) => p.trim()).filter(Boolean),
        });
      } else if (page === 'stack') {
        await pages.update('stack', {
          ...stack,
          sections: stack.sections
            .map((s) => ({ title: s.title.trim(), items: s.items.map((i) => i.trim()).filter(Boolean) }))
            .filter((s) => s.title || s.items.length),
        });
      } else {
        await Promise.all(introKeys.map((key) => pages.update(key, intros[key])));
      }
      toast('Saved — live on the site');
    } catch (e) {
      toast(e.message || 'Failed to save', 'error');
    }
    saving = false;
  }

  function handleKeydown(e) {
    if ((e.metaKey || e.ctrlKey) && e.key === 's') {
      e.preventDefault();
      save();
    }
  }

  // ── list helpers ──
  function move(arr, i, dir) {
    const j = i + dir;
    if (j < 0 || j >= arr.length) return;
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
</script>

<svelte:window onkeydown={handleKeydown} />

<Shell title={titles[page] || 'Page'} crumbs={[{ label: 'Pages' }]}>
  {#snippet actions()}
    <a class="btn btn-secondary" href={siteUrl + previewPath[page]} target="_blank" rel="noopener noreferrer">
      <ArrowSquareOut size={14} />
      View live
    </a>
    <button class="btn btn-primary" onclick={save} disabled={saving || loading}>
      <FloppyDisk size={14} />
      {saving ? 'Saving…' : 'Save'}
    </button>
  {/snippet}

  {#if loading}
    <div class="loader-inline">Loading…</div>
  {:else if page === 'home'}
    <div class="stack">
      <div class="card card-pad group">
        <div>
          <div class="card-title">Intro</div>
          <div class="card-subtitle">The block next to the logo ticker.</div>
        </div>
        <div class="field-row">
          <div class="field">
            <label for="name">Name</label>
            <input id="name" bind:value={home.name} placeholder="ndzuma malate" />
          </div>
          <div class="field">
            <label for="loc">Location</label>
            <input id="loc" bind:value={home.location} placeholder="London, UK" />
          </div>
        </div>
      </div>

      <div class="card card-pad group">
        <div class="head">
          <div>
            <div class="card-title">Paragraphs</div>
            <div class="card-subtitle">Insert widgets like the F1 card anywhere in the text.</div>
          </div>
          <button class="btn btn-secondary btn-sm" onclick={() => home.paragraphs.push('')}>
            <Plus size={12} weight="bold" /> Add paragraph
          </button>
        </div>

        {#if home.paragraphs.length === 0}
          <div class="empty">No paragraphs yet.</div>
        {/if}

        {#each home.paragraphs as _, i}
          <div class="block">
            <div class="block-head">
              <span class="block-label">Paragraph {i + 1}</span>
              <div class="block-actions">
                <button class="btn btn-ghost btn-icon btn-sm" onclick={() => move(home.paragraphs, i, -1)} disabled={i === 0} title="Move up"><ArrowUp size={13} /></button>
                <button class="btn btn-ghost btn-icon btn-sm" onclick={() => move(home.paragraphs, i, 1)} disabled={i === home.paragraphs.length - 1} title="Move down"><ArrowDown size={13} /></button>
                <button class="btn btn-ghost btn-icon btn-sm danger" onclick={() => home.paragraphs.splice(i, 1)} title="Remove"><Trash size={13} /></button>
              </div>
            </div>
            <TokenField bind:value={home.paragraphs[i]} projects={allProjects} rows={4} placeholder="Write something…" />
          </div>
        {/each}
      </div>

      <div class="card card-pad group">
        <div>
          <div class="card-title">Carousels</div>
          <div class="card-subtitle">Headings above the featured rows.</div>
        </div>
        <div class="field-row">
          <div class="field">
            <label for="pt">Projects heading</label>
            <input id="pt" bind:value={home.projects_title} placeholder="Featured projects" />
          </div>
          <div class="field">
            <label for="wt">Writings heading</label>
            <input id="wt" bind:value={home.writings_title} placeholder="Featured writings" />
          </div>
        </div>
      </div>
    </div>
  {:else if page === 'stack'}
    <div class="stack">
      <div class="card card-pad group">
        <div class="field-row">
          <div class="field">
            <label for="st">Title</label>
            <input id="st" bind:value={stack.title} placeholder="stack" />
          </div>
        </div>
        <div class="field">
          <label for="si">Intro</label>
          <textarea id="si" bind:value={stack.intro} rows="2" placeholder="A little bit more about…"></textarea>
        </div>
      </div>

      <div class="head">
        <div>
          <div class="card-title">Sections</div>
          <div class="card-subtitle">Numbered automatically in order.</div>
        </div>
        <button class="btn btn-secondary btn-sm" onclick={() => stack.sections.push({ title: '', items: [''] })}>
          <Plus size={12} weight="bold" /> Add section
        </button>
      </div>

      {#each stack.sections as section, si}
        <div class="card card-pad group">
          <div class="block-head">
            <div class="section-num">{String(si + 1).padStart(2, '0')}</div>
            <input class="section-name" bind:value={section.title} placeholder="Section title" />
            <div class="block-actions">
              <button class="btn btn-ghost btn-icon btn-sm" onclick={() => move(stack.sections, si, -1)} disabled={si === 0} title="Move up"><ArrowUp size={13} /></button>
              <button class="btn btn-ghost btn-icon btn-sm" onclick={() => move(stack.sections, si, 1)} disabled={si === stack.sections.length - 1} title="Move down"><ArrowDown size={13} /></button>
              <button class="btn btn-ghost btn-icon btn-sm danger" onclick={() => stack.sections.splice(si, 1)} title="Remove section"><Trash size={13} /></button>
            </div>
          </div>

          <div class="items">
            {#each section.items as _, ii}
              <div class="item">
                <span class="item-arrow">↳</span>
                <div class="item-body">
                  <TokenField bind:value={section.items[ii]} projects={allProjects} multiline={false} placeholder="e.g. **Editor:** Zed" />
                </div>
                <div class="block-actions">
                  <button class="btn btn-ghost btn-icon btn-sm" onclick={() => move(section.items, ii, -1)} disabled={ii === 0} title="Move up"><ArrowUp size={13} /></button>
                  <button class="btn btn-ghost btn-icon btn-sm" onclick={() => move(section.items, ii, 1)} disabled={ii === section.items.length - 1} title="Move down"><ArrowDown size={13} /></button>
                  <button class="btn btn-ghost btn-icon btn-sm danger" onclick={() => section.items.splice(ii, 1)} title="Remove"><Trash size={13} /></button>
                </div>
              </div>
            {/each}
          </div>
          <button class="btn btn-ghost btn-sm self-start" onclick={() => section.items.push('')}>
            <Plus size={12} weight="bold" /> Add item
          </button>
        </div>
      {/each}
    </div>
  {:else}
    <div class="stack">
      {#each introKeys as key}
        <div class="card card-pad group">
          <div>
            <div class="card-title">{key.charAt(0).toUpperCase() + key.slice(1)} page</div>
            <div class="card-subtitle">Heading and intro paragraph at the top of /{key}.</div>
          </div>
          <div class="field">
            <label for="{key}-t">Title</label>
            <input id="{key}-t" bind:value={intros[key].title} placeholder={key} />
          </div>
          <div class="field">
            <label for="{key}-i">Intro</label>
            <textarea id="{key}-i" bind:value={intros[key].intro} rows="2"></textarea>
          </div>
        </div>
      {/each}
    </div>
  {/if}
</Shell>

<style>
  .stack { display: flex; flex-direction: column; gap: 14px; max-width: 820px; }
  .group { display: flex; flex-direction: column; gap: 16px; }
  .head { display: flex; align-items: center; justify-content: space-between; gap: 12px; }
  .empty { font-size: 13px; color: var(--text-4); }

  .block {
    display: flex;
    flex-direction: column;
    gap: 8px;
    padding: 14px;
    border: 1px solid var(--border);
    border-radius: var(--radius);
    background: var(--surface);
  }
  .block-head { display: flex; align-items: center; gap: 10px; }
  .block-label { font-size: 12px; font-weight: 500; color: var(--text-3); flex: 1; }
  .block-actions { display: flex; gap: 2px; flex-shrink: 0; }
  .block-actions .danger:hover { color: var(--danger); background: var(--danger-soft); }

  .section-num {
    font-size: 13px;
    color: var(--text-4);
    font-family: var(--mono);
    width: 28px;
    flex-shrink: 0;
  }
  .section-name { flex: 1; font-weight: 500; }

  .items { display: flex; flex-direction: column; gap: 10px; }
  .item { display: flex; align-items: flex-start; gap: 10px; }
  .item-arrow { color: var(--text-4); padding-top: 9px; flex-shrink: 0; }
  .item-body { flex: 1; min-width: 0; }
  .self-start { align-self: flex-start; }
</style>
