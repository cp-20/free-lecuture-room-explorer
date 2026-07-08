import { describe, expect, it } from 'vite-plus/test';
import { FacilityFetchError } from '../../lib/facilityClient';
import { explorerErrorFromUnknown } from './explorerErrors';
import { moveDate, normalizeDayState, setDate } from './explorerState';
import type { QueryState } from '../../lib/types';
import {
  createTimeBlocks,
  filterRoomsByFreeBlocks,
  isRoomFreeForBlock,
  toggleTimeBlockFilter,
} from './availability';
import type { FacilityRoom } from '../../lib/types';

const baseState: QueryState = {
  date: '2026-07-05',
};

describe('施設検索状態', () => {
  it('URL から読む状態は単日の日付だけに正規化する', () => {
    expect(normalizeDayState(baseState)).toMatchObject({
      date: '2026-07-05',
    });
  });

  it('日付変更は単日の日付だけを更新する', () => {
    expect(setDate(baseState, '2026-07-06').date).toBe('2026-07-06');
  });

  it('日付移動は常に 1 日単位にする', () => {
    expect(moveDate(baseState, -1).date).toBe('2026-07-04');
  });

  it('fetch エラーを画面表示用の状態へ変換する', () => {
    expect(explorerErrorFromUnknown(new FacilityFetchError('cors', 'proxy error'))).toEqual({
      kind: 'cors',
      message: 'proxy error',
    });
  });
});

describe('空き状況表示ロジック', () => {
  it('公式時程では昼休みを独立した予約可能枠として表示する', () => {
    const blocks = createTimeBlocks([
      '08:50-09:40',
      '09:40-10:30',
      '10:45-11:35',
      '11:35-12:25',
      '12:25-13:30',
      '13:30-14:20',
      '14:20-15:10',
      '15:25-16:15',
      '16:15-17:05',
      '17:15-18:05',
      '18:05-18:55',
      '19:05-19:55',
      '19:55-20:45',
    ]);

    expect(blocks.map((block) => block.label)).toEqual([
      '1-2',
      '3-4',
      '昼休み',
      '5-6',
      '7-8',
      '9-10',
      '11-12',
    ]);
    expect(blocks[2]).toMatchObject({
      label: '昼休み',
      slotLabels: ['12:25-13:30'],
    });
    expect(blocks[3]).toMatchObject({
      label: '5-6',
      slotLabels: ['13:30-14:20', '14:20-15:10'],
    });
  });

  it('時刻が読めない場合は 2 つの時間スロットを 1 つの時限ブロックにまとめる', () => {
    expect(createTimeBlocks(['1', '2', '3'])).toEqual([
      {
        id: '1|2',
        label: '1-2',
        slotLabels: ['1', '2'],
      },
      {
        id: '3',
        label: '3',
        slotLabels: ['3'],
      },
    ]);
  });

  it('時限ブロックは含まれる全スロットが空いているときだけ空きにする', () => {
    const blocks = createTimeBlocks(['1', '2']);

    expect(isRoomFreeForBlock(room('partial', ['open', 'reserved']), blocks[0])).toBe(false);
    expect(isRoomFreeForBlock(room('all', ['open', 'open']), blocks[0])).toBe(true);
  });

  it('昼休み枠も通常の時間帯と同じように空き判定する', () => {
    const blocks = createTimeBlocks(['12:25-13:30']);

    expect(isRoomFreeForBlock(roomWithLabels('free-lunch', ['12:25-13:30'], ['open']), blocks[0])).toBe(true);
    expect(isRoomFreeForBlock(roomWithLabels('busy-lunch', ['12:25-13:30'], ['reserved']), blocks[0])).toBe(
      false,
    );
  });

  it('選んだ全時限が空いている部屋だけを元の順序で残す', () => {
    const rooms = [
      room('morning', ['open', 'reserved']),
      room('all', ['open', 'open']),
      room('none', ['reserved', 'reserved']),
    ];
    const blocks = createTimeBlocks(['1', '2']);

    expect(filterRoomsByFreeBlocks(rooms, blocks, [blocks[0].id]).map((item) => item.name)).toEqual(['all']);
    expect(toggleTimeBlockFilter(['1'], '2')).toEqual(['1', '2']);
    expect(toggleTimeBlockFilter(['1', '2'], '1')).toEqual(['2']);
  });

  it('時限フィルタが空なら元の順序を保つ', () => {
    const rooms = [room('first', ['reserved']), room('second', ['open'])];

    expect(filterRoomsByFreeBlocks(rooms, createTimeBlocks(['1']), []).map((item) => item.name)).toEqual([
      'first',
      'second',
    ]);
  });
});

function room(name: string, statuses: Array<'reserved' | 'open'>): FacilityRoom {
  return roomWithLabels(
    name,
    statuses.map((_, index) => `${index + 1}`),
    statuses,
  );
}

function roomWithLabels(
  name: string,
  labels: string[],
  statuses: Array<'reserved' | 'open'>,
): FacilityRoom {
  return {
    id: name,
    name,
    slots: statuses.map((status, index) => ({
      label: labels[index],
      status,
    })),
  };
}
