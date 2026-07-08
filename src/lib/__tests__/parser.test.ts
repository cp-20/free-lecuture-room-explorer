import { describe, expect, it } from 'vite-plus/test';
import { dayListHtml } from '../../../test/fixtures/facilityHtml';
import { parseFacilityHtml } from '../parser';

describe('施設予約 HTML parser', () => {
  it('単日表示の部屋、時間枠、空き状態を読む', () => {
    const dataset = parseFacilityHtml(dayListHtml);

    expect(dataset.rooms[0].name).toBe('M-B101');
    expect(dataset.rooms[0].slots).toHaveLength(2);
    expect(dataset.rooms[0].slots[0].status).toBe('reserved');
    expect(dataset.rooms[0].slots[1].status).toBe('blank');
    expect(dataset.timeSlots).toEqual(['08:50-09:40', '09:40-10:30']);
  });
});
