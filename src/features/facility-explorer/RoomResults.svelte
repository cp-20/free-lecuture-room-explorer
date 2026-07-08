<script lang="ts">
  import { CalendarDays, LoaderCircle } from '@lucide/svelte';
  import type { FacilityDataset, FacilityRoom } from '../../lib/types';
  import { isRoomFreeForBlock, type TimeBlock } from './availability';

  export let dataset: FacilityDataset | null = null;
  export let rooms: FacilityRoom[] = [];
  export let loading = false;
  export let timeBlocks: TimeBlock[] = [];
  export let selectedTimeBlockIds: string[] = [];

  $: gridTemplate = `minmax(70px, 96px) repeat(${timeBlocks.length}, minmax(42px, 1fr))`;
  $: gridMinWidth = `${96 + timeBlocks.length * 42}px`;
</script>

<section class="results-panel">
  {#if loading}
    <div class="empty-state">
      <span class="spin"><LoaderCircle size={26} /></span>
      <p>読み込み中</p>
    </div>
  {:else if dataset && rooms.length > 0}
    <div class="matrix-wrap">
      <div
        class="matrix-header"
        style={`grid-template-columns: ${gridTemplate}; min-width: ${gridMinWidth};`}
      >
        <div class="room-column header-room">教室</div>
        {#each timeBlocks as block}
          <div
            class:selected-column={selectedTimeBlockIds.includes(block.id)}
            class="time-column"
          >
            <span>{block.label}</span>
          </div>
        {/each}
      </div>

      <div class="matrix-body">
        {#each rooms as room}
          <article
            class="matrix-row"
            style={`grid-template-columns: ${gridTemplate}; min-width: ${gridMinWidth};`}
          >
            <div class="room-column">
              <strong>{room.name || room.id}</strong>
            </div>

            {#each timeBlocks as block}
              {@const free = isRoomFreeForBlock(room, block)}
              <span
                class="slot-cell"
                class:free
                class:reserved={!free}
                class:selected-column={selectedTimeBlockIds.includes(block.id)}
              >
                {free ? '○' : '×'}
              </span>
            {/each}
          </article>
        {/each}
      </div>
    </div>
  {:else}
    <div class="empty-state">
      <CalendarDays size={30} />
      <p>表示できる部屋がありません</p>
    </div>
  {/if}
</section>

<style>
  .results-panel {
    margin-top: 8px;
  }

  .matrix-wrap {
    overflow-x: auto;
    border: 1px solid var(--line);
    border-radius: 8px;
    background: #ffffff;
  }

  .matrix-header,
  .matrix-row {
    display: grid;
    width: 100%;
  }

  .matrix-header {
    border-bottom: 1px solid var(--line);
    background: #f0f3f8;
  }

  .matrix-body {
    display: grid;
  }

  .matrix-row {
    border-bottom: 1px solid #e7ebf2;
  }

  .matrix-row:last-child {
    border-bottom: 0;
  }

  .room-column {
    position: sticky;
    left: 0;
    z-index: 3;
    display: grid;
    align-content: center;
    min-height: 28px;
    padding: 4px 6px;
    border-right: 1px solid var(--line);
    background: #ffffff;
  }

  .header-room {
    background: #f0f3f8;
  }

  .room-column strong {
    overflow: hidden;
    font-size: 0.78rem;
    line-height: 1.14;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .time-column {
    display: grid;
    place-items: center;
    min-height: 30px;
    padding: 3px;
    border-right: 1px solid #dce2ec;
    color: #546173;
    font-size: 0.64rem;
    font-weight: 700;
    line-height: 1.06;
    text-align: center;
  }

  .slot-cell {
    display: grid;
    place-items: center;
    min-height: 28px;
    border-right: 1px solid #edf0f5;
    color: #0a6845;
    font-size: 0.72rem;
    font-weight: 800;
  }

  .slot-cell.free {
    background: #e8f8f1;
  }

  .slot-cell.reserved {
    background: #f5f7fa;
    color: #8b95a5;
  }

  .slot-cell.selected-column,
  .time-column.selected-column {
    box-shadow: inset 0 0 0 2px #218567;
  }

  .slot-cell.selected-column.free {
    background: #bfe9d7;
  }

  .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 8px;
    min-height: 220px;
    border: 1px dashed var(--line);
    border-radius: 8px;
    color: var(--muted);
    background: #ffffff;
  }

  .spin {
    display: inline-grid;
    place-items: center;
    animation: spin 0.9s linear infinite;
  }

  .empty-state p {
    margin: 0;
  }

  @keyframes spin {
    to {
      transform: rotate(1turn);
    }
  }
</style>
