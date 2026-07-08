const DATE_INPUT_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

export function todayInputDate(): string {
  const now = new Date();
  return toInputDate(now);
}

export function toInputDate(date: Date): string {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function addDays(inputDate: string, amount: number): string {
  const date = inputToDate(inputDate);
  date.setDate(date.getDate() + amount);
  return toInputDate(date);
}

export function addMonths(inputDate: string, amount: number): string {
  const date = inputToDate(inputDate);
  date.setMonth(date.getMonth() + amount);
  return toInputDate(date);
}

export function compactDate(inputDate: string): string {
  return normalizeInputDate(inputDate).replaceAll('-', '');
}

export function slashDate(inputDate: string): string {
  return normalizeInputDate(inputDate).replaceAll('-', '/');
}

export function parseSourceDate(value: string | null | undefined): string | null {
  if (!value) return null;
  const trimmed = value.trim();
  if (DATE_INPUT_PATTERN.test(trimmed)) return trimmed;
  const compact = trimmed.match(/^(\d{4})(\d{2})(\d{2})$/);
  if (compact) return `${compact[1]}-${compact[2]}-${compact[3]}`;
  const slash = trimmed.match(/^(\d{4})\/(\d{1,2})\/(\d{1,2})$/);
  if (slash) {
    return `${slash[1]}-${slash[2].padStart(2, '0')}-${slash[3].padStart(2, '0')}`;
  }
  return null;
}

export function displayDate(value: string): string {
  const normalized = parseSourceDate(value) ?? value;
  const date = inputToDate(normalized);
  const day = ['日', '月', '火', '水', '木', '金', '土'][date.getDay()];
  return `${date.getMonth() + 1}/${date.getDate()}(${day})`;
}

export function displayDateLong(value: string): string {
  const normalized = parseSourceDate(value) ?? value;
  const date = inputToDate(normalized);
  const day = ['日', '月', '火', '水', '木', '金', '土'][date.getDay()];
  return `${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()}(${day})`;
}

export function normalizeCompactYmd(value: string | undefined): string {
  const parsed = parseSourceDate(value);
  return parsed ? compactDate(parsed) : '';
}

export function formatTimeToken(value: string): string {
  const padded = value.padStart(4, '0');
  return `${padded.slice(0, 2)}:${padded.slice(2)}`;
}

function inputToDate(inputDate: string): Date {
  const normalized = normalizeInputDate(inputDate);
  const [year, month, day] = normalized.split('-').map(Number);
  return new Date(year, month - 1, day);
}

function normalizeInputDate(inputDate: string): string {
  const parsed = parseSourceDate(inputDate);
  if (!parsed) return todayInputDate();
  return parsed;
}
