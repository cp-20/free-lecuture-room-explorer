import { formatTimeToken } from './date';
import type { DaySlot, FacilityDataset, FacilityRoom, SlotStatus } from './types';

export class FacilityParseError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'FacilityParseError';
  }
}

// 元サイトの Ajax HTML は JSON ではないため、表の class と data-* 属性を頼りに空き状況へ変換する。
export function parseFacilityHtml(html: string): FacilityDataset {
  const doc = new DOMParser().parseFromString(html, 'text/html');
  const table = doc.querySelector<HTMLTableElement>('.tblDay');

  if (!table) {
    const pageTitle = cleanText(doc.querySelector('title')?.textContent ?? '');
    const portalHint = pageTitle.includes('ポータル') ? 'ポータルページへリダイレクトされています。' : '';
    throw new FacilityParseError(`施設予約の単日一覧 HTML として解析できません。${portalHint}`);
  }

  const rows = Array.from(table.querySelectorAll<HTMLTableRowElement>('tr.trRoom'));
  const rooms = rows.map(parseRoomRow);
  const timeSlots = unique(rooms.flatMap((room) => room.slots.map((slot) => slot.label))).filter(Boolean);

  return {
    rooms,
    timeSlots,
  };
}

function parseRoomRow(row: HTMLTableRowElement): FacilityRoom {
  const cells = Array.from(row.querySelectorAll<HTMLTableCellElement>('td[data-room][data-date]'));
  const id = cells[0]?.dataset.room ?? '';
  const titleHeaders = directChildren<HTMLTableCellElement>(row, 'th').filter(
    (th) =>
      th.classList.contains('sphide') &&
      !th.classList.contains('ths') &&
      !th.classList.contains('hideAtPrint'),
  );
  const nameHeader = titleHeaders.find((th) => th.textContent?.includes('授業時間割')) ?? titleHeaders.at(-1);
  const name = cleanText(nameHeader?.textContent ?? '').replace('授業時間割', '').trim();

  return {
    id,
    name,
    slots: cells.map(parseDaySlot),
  };
}

function parseDaySlot(cell: HTMLTableCellElement): DaySlot {
  const from = cell.dataset.timefrom ?? '';
  const to = cell.dataset.timeto ?? '';
  return {
    label: from && to ? `${formatTimeToken(from)}-${formatTimeToken(to)}` : '',
    status: slotStatus(cell),
  };
}

function slotStatus(cell: HTMLTableCellElement): SlotStatus {
  if (cell.classList.contains('tY')) return 'reserved';
  if (cell.classList.contains('tE')) return 'open';
  return 'blank';
}

function directChildren<T extends Element>(element: Element, tagName: string): T[] {
  return Array.from(element.children).filter((child): child is T => child.tagName.toLowerCase() === tagName);
}

export function cleanText(value: string): string {
  return value
    .replace(/\u00a0/g, ' ')
    .replace(/\u3000/g, ' ')
    .replace(/\r/g, '')
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n[ \t]+/g, '\n')
    .replace(/[ \t]{2,}/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

function unique<T>(values: T[]): T[] {
  return Array.from(new Set(values.filter(Boolean)));
}
