<script>
  import { UploadSimple, CircleNotch } from 'phosphor-svelte';
  import { files } from '../lib/api.js';
  import { toast } from '../lib/toast.svelte.js';
  
  let { onUpload = () => {} } = $props();

  let uploading = $state(false);
  let fileInput = $state(null);

  async function handleFiles(e) {
    const fileList = Array.from(e.target.files || []);
    if (!fileList.length) return;

    uploading = true;
    try {
      const formData = new FormData();
      for (const file of fileList) {
        formData.append("files", file);
      }

      const response = await files.upload(formData);
      
      const successfulUrls = [];
      for (const result of response) {
        if (result.data?.url) {
          successfulUrls.push(result.data.url);
        } else if (result.error) {
          console.error("Upload error:", result.error);
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

<div class="uploader">
  <input 
    type="file" 
    bind:this={fileInput} 
    onchange={handleFiles}
    accept="image/*"
    style="display: none;" 
  />
  <button class="upload-btn" onclick={trigger} disabled={uploading} type="button">
    {#if uploading}
      <span class="spin"><CircleNotch size={14} /></span>
      Uploading...
    {:else}
      <UploadSimple size={14} />
      Upload Image
    {/if}
  </button>
</div>

<style>
  .uploader {
    display: inline-block;
  }
  .upload-btn {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 6px 10px;
    background: #f5f5f5;
    border: 1px solid #e5e5e5;
    border-radius: 5px;
    font-size: 11px;
    font-weight: 500;
    color: #555;
    cursor: pointer;
    transition: all 0.1s;
    font-family: 'Geist Mono Variable', monospace;
  }
  .upload-btn:hover:not(:disabled) {
    background: #e5e5e5;
    color: #111;
    border-color: #ccc;
  }
  .upload-btn:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }
  .spin {
    display: flex;
    animation: spin 1s linear infinite;
  }
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
</style>
