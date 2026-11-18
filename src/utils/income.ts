import { monthKey } from '@/utils/dates';

export interface IncomePeriod {
  from: string;
  amount: number;
}

const HISTORY_START = '1970-01';

function isIncomePeriod(value: unknown): value is IncomePeriod {
  if (!value || typeof value !== 'object') return false;
  const candidate = value as Record<string, unknown>;
  return (
    typeof candidate.from === 'string' &&
    /^\d{4}-\d{2}$/.test(candidate.from) &&
    typeof candidate.amount === 'number' &&
    Number.isFinite(candidate.amount)
  );
}

export function parseIncomeHistory(raw: unknown): IncomePeriod[] {
  let value = raw;
  if (typeof value === 'string') {
    try {
      value = JSON.parse(value);
    } catch {
      return [];
    }
  }
  if (!Array.isArray(value)) return [];
  return value
    .filter(isIncomePeriod)
    .map((p) => ({ from: p.from, amount: Math.max(0, p.amount) }))
    .sort((a, b) => a.from.localeCompare(b.from));
}

export function monthlyIncomeForMonth(
  history: IncomePeriod[],
  key: string,
  fallback: number
): number {
  if (!history.length) return fallback;
  let result = history[0].amount;
  for (const period of history) {
    if (period.from <= key) result = period.amount;
    else break;
  }
  return result;
}

export function addIncomePeriod(
  history: IncomePeriod[],
  key: string = monthKey(new Date()),
  amount: number,
  previousAmount: number
): IncomePeriod[] {
  const next = [...history];
  if (next.length === 0 && previousAmount > 0 && previousAmount !== amount) {
    next.push({ from: HISTORY_START, amount: previousAmount });
  }
  const index = next.findIndex((p) => p.from === key);
  if (index >= 0) next[index] = { from: key, amount };
  else next.push({ from: key, amount });
  return next.sort((a, b) => a.from.localeCompare(b.from));
}
