<script lang="ts">
  import { ChevronLeft, ChevronRight } from '@lucide/svelte';
  import IconButton from '../../components/IconButton.svelte';
  import type { QueryState } from '../../lib/types';
  import type { TimeBlock } from './availability';

  export let state: QueryState;
  export let timeBlocks: TimeBlock[] = [];
  export let selectedTimeBlockIds: string[] = [];
  export let onMoveDate: (direction: number) => void = () => {};
  export let onDateChange: (value: string) => void = () => {};
  export let onTimeBlockToggle: (id: string) => void = () => {};
</script>

<section class="control-panel" aria-label="検索条件">
  <div class="date-controls">
    <IconButton title="前日" onClick={() => onMoveDate(-1)}>
      <ChevronLeft size={18} />
    </IconButton>
    <label class="date-field">
      <span>日付</span>
      <input
        id="date-from"
        name="date-from"
        type="date"
        value={state.date}
        on:change={(event) => onDateChange(event.currentTarget.value)}
      />
    </label>
    <IconButton title="翌日" onClick={() => onMoveDate(1)}>
      <ChevronRight size={18} />
    </IconButton>
  </div>

  {#if timeBlocks.length}
    <div class="time-filter" aria-label="空き時間帯フィルタ">
      <span>空き時間</span>
      <div class="time-chip-row">
        {#each timeBlocks as block}
          <button
            type="button"
            class:active={selectedTimeBlockIds.includes(block.id)}
            on:click={() => onTimeBlockToggle(block.id)}
          >
            {block.label}
          </button>
        {/each}
      </div>
    </div>
  {/if}
</section>

<style>
  .control-panel {
    position: sticky;
    top: 0;
    z-index: 10;
    display: grid;
    grid-template-columns: auto minmax(0, 1fr);
    gap: 6px;
    align-items: end;
    padding: 8px;
    border: 1px solid var(--line);
    border-radius: 8px;
    background: var(--panel);
    box-shadow: var(--shadow);
  }

  .date-controls {
    display: grid;
    grid-template-columns: 34px 132px 34px;
    align-items: end;
    gap: 5px;
  }

  .date-field {
    display: grid;
    gap: 3px;
    min-width: 0;
  }

  .date-field span,
  .time-filter > span {
    color: var(--muted);
    font-size: 0.72rem;
    font-weight: 700;
  }

  .date-field input {
    width: 100%;
    min-height: 36px;
    border: 0;
    color: var(--ink);
    outline: none;
  }

  .date-field input {
    padding: 0 8px;
    border: 1px solid var(--line);
    border-radius: 8px;
    background: #ffffff;
  }

  .time-filter {
    display: grid;
    gap: 3px;
    align-self: end;
    min-width: 0;
  }

  .time-filter > span {
    white-space: nowrap;
  }

  .time-chip-row {
    display: flex;
    align-items: stretch;
    gap: 4px;
    min-height: 36px;
    overflow-x: auto;
  }

  .time-chip-row button {
    flex: 0 0 auto;
    min-height: 36px;
    padding: 0 8px;
    border: 1px solid var(--line);
    border-radius: 8px;
    background: #ffffff;
    color: #4c5868;
    font-size: 0.76rem;
    cursor: pointer;
  }

  .time-chip-row button.active {
    border-color: #218567;
    background: #dff5eb;
    color: #0a6845;
    font-weight: 700;
  }

  :global(.control-panel .icon-button) {
    width: 34px;
    min-height: 36px;
  }

  @media (max-width: 900px) {
    .control-panel {
      grid-template-columns: 1fr;
    }

    .date-controls {
      grid-template-columns: 34px minmax(0, 1fr) 34px;
    }
  }

  @media (max-width: 560px) {
    .control-panel {
      position: static;
    }
  }
</style>
