<script lang="ts">
  import { AlertTriangle, Info } from '@lucide/svelte';

  export let kind: 'info' | 'error' = 'info';
  export let title = '';
  export let message = '';
  export let href = '';
</script>

<section class:error-panel={kind === 'error'} class="notice-panel">
  {#if kind === 'error'}
    <AlertTriangle size={20} />
  {:else}
    <Info size={20} />
  {/if}
  <div>
    <strong>{title}</strong>
    <p>{message}</p>
    {#if href}
      <a href={href} target="_blank" rel="noreferrer">{href}</a>
    {/if}
  </div>
</section>

<style>
  .notice-panel {
    display: flex;
    gap: 12px;
    margin-top: 14px;
    padding: 14px;
    border: 1px solid var(--line);
    border-radius: 8px;
    background: var(--panel);
    box-shadow: var(--shadow);
  }

  .notice-panel p {
    display: -webkit-box;
    overflow: hidden;
    margin: 4px 0 0;
    color: #4b5565;
    line-height: 1.55;
    line-clamp: 4;
    -webkit-line-clamp: 4;
    -webkit-box-orient: vertical;
  }

  .notice-panel a {
    display: block;
    overflow-wrap: anywhere;
    margin-top: 6px;
    color: #245fa8;
  }

  .error-panel {
    border-color: #f1b8b1;
    color: var(--red);
    background: #fff8f7;
  }
</style>
