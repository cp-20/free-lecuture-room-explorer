import type { DaySlot, FacilityRoom } from "../../lib/types";

export interface TimeBlock {
  id: string;
  label: string;
  slotLabels: string[];
}

interface IndexedSlot {
  label: string;
  range: TimeRange | null;
}

interface TimeRange {
  from: string;
  to: string;
}

interface KnownTimeBlock {
  label: string;
  starts: string[];
}

const KNOWN_TIME_BLOCKS: KnownTimeBlock[] = [
  { label: "1-2", starts: ["08:50", "09:40"] },
  { label: "3-4", starts: ["10:45", "11:35"] },
  { label: "昼休み", starts: ["12:25"] },
  { label: "5-6", starts: ["13:30", "14:20"] },
  { label: "7-8", starts: ["15:25", "16:15"] },
  { label: "9-10", starts: ["17:15", "18:05"] },
  { label: "11-12", starts: ["19:05", "19:55"] },
];

export function isSlotFree(slot: DaySlot): boolean {
  return slot.status !== "reserved";
}

export function slotForLabel(
  room: FacilityRoom,
  label: string,
): DaySlot | undefined {
  return room.slots.find((slot) => slot.label === label);
}

export function createTimeBlocks(slotLabels: string[]): TimeBlock[] {
  const indexedSlots = slotLabels.map((label) => ({
    label,
    range: timeRangeFromLabel(label),
  }));
  const knownBlocks = createKnownTimeBlocks(indexedSlots);
  if (knownBlocks.length > 0) return knownBlocks;

  return createFallbackTimeBlocks(indexedSlots);
}

// 元サイトの昼休みスロットは予約されることがあるため、公式時程に寄せつつ独立した枠として扱う。
function createKnownTimeBlocks(indexedSlots: IndexedSlot[]): TimeBlock[] {
  return KNOWN_TIME_BLOCKS.map((definition) => {
    const slots = definition.starts
      .map((start) => indexedSlots.find((slot) => slot.range?.from === start))
      .filter((slot): slot is IndexedSlot => Boolean(slot));
    if (slots.length !== definition.starts.length) return null;

    return {
      id: slots.map((slot) => slot.label).join("|"),
      label: definition.label,
      slotLabels: slots.map((slot) => slot.label),
    };
  }).filter((block): block is TimeBlock => Boolean(block));
}

function createFallbackTimeBlocks(indexedSlots: IndexedSlot[]): TimeBlock[] {
  const blocks: TimeBlock[] = [];
  const labels = indexedSlots.map((slot) => slot.label);
  for (let index = 0; index < labels.length; index += 2) {
    const blockLabels = labels.slice(index, index + 2);
    const periodStart = index + 1;
    const periodEnd = Math.min(index + 2, labels.length);
    blocks.push({
      id: blockLabels.join("|"),
      label: periodStart === periodEnd
        ? `${periodStart}`
        : `${periodStart}-${periodEnd}`,
      slotLabels: blockLabels,
    });
  }
  return blocks;
}

function timeRangeFromLabel(label: string): TimeRange | null {
  const values = label.match(/\d{1,2}:\d{2}/g);
  if (!values || values.length < 2) return null;
  return {
    from: normalizeTime(values[0]),
    to: normalizeTime(values[1]),
  };
}

function normalizeTime(value: string): string {
  const [hour = "", minute = ""] = value.split(":");
  return `${hour.padStart(2, "0")}:${minute}`;
}

export function isRoomFreeForBlock(
  room: FacilityRoom,
  block: TimeBlock,
): boolean {
  return block.slotLabels.every((label) => {
    const slot = slotForLabel(room, label);
    return slot ? isSlotFree(slot) : false;
  });
}

export function toggleTimeBlockFilter(
  selectedBlockIds: string[],
  id: string,
): string[] {
  const values = new Set(selectedBlockIds);
  if (values.has(id)) values.delete(id);
  else values.add(id);
  return Array.from(values);
}

export function filterRoomsByFreeBlocks(
  rooms: FacilityRoom[],
  timeBlocks: TimeBlock[],
  selectedBlockIds: string[],
): FacilityRoom[] {
  if (selectedBlockIds.length === 0) return rooms;

  // 複数選択時は「選んだ全時間帯が空いている部屋」だけを残す。
  const selectedBlocks = timeBlocks.filter((block) =>
    selectedBlockIds.includes(block.id)
  );
  return rooms.filter((room) =>
    selectedBlocks.every((block) => isRoomFreeForBlock(room, block))
  );
}
