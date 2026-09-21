import { TransactionItem } from '@/data/dummyData';

const MONTHS: Record<string, number> = {
  januari: 0,
  februari: 1,
  maret: 2,
  april: 3,
  mei: 4,
  juni: 5,
  juli: 6,
  agustus: 7,
  september: 8,
  oktober: 9,
  november: 10,
  desember: 11,
};

export function parseItemDate(item: TransactionItem): Date | null {
  if (item.timestamp) {
    return new Date(item.timestamp);
  }
  if (!item.date) {
    return null;
  }
  const trimmed = item.date.trim();
  const match = trimmed.match(/^(\d{1,2})\s+([A-Za-z]+)(?:\s+(\d{4}))?$/);
  if (!match) {
    return null;
  }
  const day = Number(match[1]);
  const month = MONTHS[match[2].toLowerCase()];
  if (month == null || day < 1 || day > 31) {
    return null;
  }
  const year = match[3] ? Number(match[3]) : new Date().getFullYear();
  return new Date(year, month, day);
}

function pad(n: number): string {
  return String(n).padStart(2, '0');
}

export function monthKey(date: Date): string {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}`;
}

const MONTH_LABEL = new Intl.DateTimeFormat('id-ID', { month: 'long', year: 'numeric' });

export function monthLabel(key: string): string {
  if (!key) return 'Tanpa Tanggal';
  const [year, m] = key.split('-').map(Number);
  return MONTH_LABEL.format(new Date(year, m - 1, 1));
}

export function startOfDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

export function endOfDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59, 999);
}