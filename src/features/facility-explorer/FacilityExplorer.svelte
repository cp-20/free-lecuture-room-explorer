<script lang="ts">
  import { onMount } from 'svelte';
  import AppHeader from '../../components/AppHeader.svelte';
  import NoticePanel from '../../components/NoticePanel.svelte';
  import { fetchFacilityHtml } from '../../lib/facilityClient';
  import { parseFacilityHtml } from '../../lib/parser';
  import { browserSearchFromState, buildFacilityRequest, queryStateFromSearch } from '../../lib/query';
  import type { FacilityDataset, QueryState } from '../../lib/types';
  import FacilityControls from './FacilityControls.svelte';
  import RoomResults from './RoomResults.svelte';
  import { createTimeBlocks, filterRoomsByFreeBlocks, toggleTimeBlockFilter } from './availability';
  import { emptyExplorerError, explorerErrorFromUnknown } from './explorerErrors';
  import {
    createInitialQueryState,
    moveDate,
    normalizeDayState,
    setDate,
  } from './explorerState';

  let state: QueryState = createInitialQueryState();
  let dataset: FacilityDataset | null = null;
  let loading = false;
  let errorState = emptyExplorerError;
  let selectedTimeBlockIds: string[] = [];
  let lastUrl = '';

  $: request = buildFacilityRequest(state);
  $: timeBlocks = createTimeBlocks(dataset?.timeSlots ?? []);
  $: filteredRooms = filterRoomsByFreeBlocks(dataset?.rooms ?? [], timeBlocks, selectedTimeBlockIds);

  onMount(() => {
    const restoredState = normalizeDayState(queryStateFromSearch(window.location.search));
    state = restoredState;
    void refresh(restoredState);
  });

  async function refresh(targetState = state) {
    const activeRequest = buildFacilityRequest(targetState);
    loading = true;
    errorState = emptyExplorerError;
    lastUrl = activeRequest.ajaxUrl;

    try {
      const html = await fetchFacilityHtml(activeRequest.ajaxUrl);
      dataset = parseFacilityHtml(html);
      const nextBlocks = createTimeBlocks(dataset.timeSlots);
      selectedTimeBlockIds = selectedTimeBlockIds.filter((id) => nextBlocks.some((block) => block.id === id));
      syncLocation(targetState);
    } catch (error) {
      dataset = null;
      errorState = explorerErrorFromUnknown(error);
    } finally {
      loading = false;
    }
  }

  function updateDate(value: string) {
    const nextState = setDate(state, value);
    state = nextState;
    void refresh(nextState);
  }

  function moveDateAndRefresh(direction: number) {
    const nextState = moveDate(state, direction);
    state = nextState;
    void refresh(nextState);
  }

  function syncLocation(targetState: QueryState) {
    if (!window.history.replaceState) return;
    window.history.replaceState({}, '', browserSearchFromState(targetState));
  }
</script>

<svelte:head>
  <title>空き講義室 Explorer</title>
</svelte:head>

<main class="app-shell">
  <AppHeader />

  <FacilityControls
    {state}
    {timeBlocks}
    {selectedTimeBlockIds}
    onMoveDate={moveDateAndRefresh}
    onDateChange={updateDate}
    onTimeBlockToggle={(id) => (selectedTimeBlockIds = toggleTimeBlockFilter(selectedTimeBlockIds, id))}
  />

  {#if errorState.message}
    <NoticePanel
      kind="error"
      title={errorState.kind === 'cors' ? 'CORS / proxy error' : 'Fetch failed'}
      message={errorState.message}
      href={lastUrl}
    />
  {/if}

  <RoomResults {dataset} rooms={filteredRooms} {loading} {timeBlocks} {selectedTimeBlockIds} />
</main>

<style>
  .app-shell {
    width: min(760px, 100%);
    margin: 0 auto;
    padding: 12px;
  }

  @media (max-width: 740px) {
    .app-shell {
      padding: 10px;
    }
  }
</style>
