<script lang="ts">
  import { Building2 } from '@lucide/svelte';
</script>

<section class="app-header">
  <div class="brand-block">
    <div class="brand-mark"><Building2 size={24} /></div>
    <div>
      <p class="eyebrow">施設予約ビューア</p>
      <h1>空き講義室 Explorer</h1>
    </div>
  </div>
</section>

<style>
  .app-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    margin-bottom: 8px;
  }

  .brand-block {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .brand-mark {
    display: grid;
    place-items: center;
    width: 36px;
    height: 36px;
    border-radius: 8px;
    color: #ffffff;
    background: #1d3f72;
    box-shadow: var(--shadow);
  }

  .eyebrow {
    margin: 0 0 2px;
    color: var(--muted);
    font-size: 0.7rem;
    font-weight: 700;
    letter-spacing: 0;
  }

  h1 {
    margin: 0;
    font-size: 1.25rem;
    line-height: 1.12;
    letter-spacing: 0;
  }

  @media (max-width: 740px) {
    .app-header {
      align-items: flex-start;
    }

    .brand-mark {
      width: 34px;
      height: 34px;
    }
  }
</style>
