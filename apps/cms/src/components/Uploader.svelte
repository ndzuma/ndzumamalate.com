<script>
  import { UploadSimple, CircleNotch } from 'phosphor-svelte';
  import { files } from '../lib/api.js';
  import { toast } from '../lib/toast.svelte.js';

  let { onUpload = () => {}, accept = "image/*", label = "Upload image", variant = 'secondary' } = $props();

  let uploading = $state(false);
  let fileInput = $state(null);

  async function handleFiles(e) {
    const fileList = Array.from(e.target.files || []);
    if (!fileList.length) return;

    uploading = true;
    try {
      const filesMeta = fileList.map(f => ({
        name: f.name,
        size: f.size,
        type: f.type || "application/octet-stream"
      }));

      const presignedUrls = await files.getPresignedUrls(filesMeta);

      const successfulUrls = [];
      for (let i = 0; i < fileList.length; i++) {
        const file = fileList[i];
        const uploadData = presignedUrls[i];

        if (!uploadData || !uploadData.url) continue;

        const formData = new FormData();
        for (const [key, value] of Object.entries(uploadData.fields)) {
          formData.append(key, value);
        }
        formData.append("file", file);

        const res = await fetch(uploadData.url, {
          method: 'POST',
          body: formData,
        });

        if (res.ok) {
          successfulUrls.push(uploadData.ufsUrl);
        } else {
          console.error("Upload error for file", file.name, await res.text());
        }
      }

      if (successfulUrls.length > 0) {
        onUpload(successfulUrls[0]);
      } else {
        throw new Error("No URL returned");
      }
    } catch (err) {
      console.error("Upload error:", err);
      toast("Upload failed", "error");
    } finally {
      uploading = false;
      if (fileInput) fileInput.value = '';
    }
  }

  function trigger() {
    if (fileInput) fileInput.click();
  }
</script>

<span class="uploader">
  <input
    type="file"
    bind:this={fileInput}
    onchange={handleFiles}
    accept={accept}
    style="display: none;"
  />
  <button class="btn btn-sm {variant === 'primary' ? 'btn-primary' : 'btn-secondary'}" onclick={trigger} disabled={uploading} type="button">
    {#if uploading}
      <span class="spin"><CircleNotch size={14} /></span>
      Uploading…
    {:else}
      <UploadSimple size={14} />
      {label}
    {/if}
  </button>
</span>

<style>
  .uploader { display: inline-block; }
  .spin { display: flex; animation: spin 1s linear infinite; }
  @keyframes spin { to { transform: rotate(360deg); } }
</style>
