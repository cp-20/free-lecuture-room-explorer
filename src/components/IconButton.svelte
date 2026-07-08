<script lang="ts">
  export let href = '';
  export let title = '';
  export let label = '';
  export let disabled = false;
  export let onClick: (() => void | Promise<void>) | undefined = undefined;
</script>

{#if href}
  <a class="icon-button" {href} target="_blank" rel="noreferrer" {title} aria-label={label || title}>
    <slot />
  </a>
{:else}
  <button class="icon-button" type="button" {disabled} on:click={onClick} {title} aria-label={label || title}>
    <slot />
  </button>
{/if}

<style>
  .icon-button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 38px;
    min-height: 38px;
    padding: 0;
    border: 1px solid var(--line);
    border-radius: 8px;
    background: #ffffff;
    color: var(--ink);
    text-decoration: none;
    cursor: pointer;
  }

  .icon-button:disabled {
    opacity: 0.62;
    cursor: wait;
  }
</style>
