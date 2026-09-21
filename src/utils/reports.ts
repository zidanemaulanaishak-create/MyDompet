import { TransactionItem } from '@/data/dummyData';
import { resolveCategory, itemType } from '@/constants/categoryVisuals';
import { parseItemDate, monthKey } from '@/utils/dates';

export type ReportPeriod = 'month' | 'sixMonths' | 'year';

export const PERIOD_LABELS: Record<ReportPeriod, string> = {
  month: 'Bulan ini',
  sixMonths: '6 Bulan terakhir',
  year: 'Tahun ini',
};

export function getPeriodRange(period: ReportPeriod): { from: Date; to: Date } {
  const now = new Date();
  const to = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
  if (period === 'month') {
    return { from: new Date(now.getFullYear(), now.getMonth(), 1), to };
  }
  if (period === 'year') {
    return { from: new Date(now.getFullYear(), 0, 1), to };
  }
  const from = new Date(now.getFullYear(), now.getMonth() - 5, 1);
  return { from, to };
}

export function filterByPeriod(items: TransactionItem[], period: ReportPeriod): TransactionItem[] {
  const { from, to } = getPeriodRange(period);
  return items.filter((tx) => {
    const d = parseItemDate(tx);
    if (!d) return false;
    return d.getTime() >= from.getTime() && d.getTime() <= to.getTime();
  });
}

export function txAmount(tx: TransactionItem): number {
  if (typeof tx.amountValue === 'number') return Math.abs(tx.amountValue);
  const digits = (tx.amount || '').replace(/[^0-9]/g, '');
  return digits ? parseInt(digits, 10) : 0;
}

export interface CategoryTotal {
  id: string;
  label: string;
  icon: string;
  total: number;
  percent: number;
}

export function summarize(items: TransactionItem[]): { income: number; expense: number; balance: number } {
  let income = 0;
  let expense = 0;
  for (const tx of items) {
    const amt = txAmount(tx);
    if (itemType(tx) === 'income') income += amt;
    else expense += amt;
  }
  return { income, expense, balance: income - expense };
}

export function breakdownByType(items: TransactionItem[], type: 'income' | 'expense'): CategoryTotal[] {
  const map = new Map<string, { label: string; icon: string; total: number }>();
  let grand = 0;
  for (const tx of items) {
    if (itemType(tx) !== type) continue;
    const amt = txAmount(tx);
    grand += amt;
    const cat = resolveCategory(tx);
    const id = cat?.id ?? tx.categoryId ?? tx.category ?? 'other';
    const entry = map.get(id) ?? { label: cat?.label ?? tx.category ?? 'Lainnya', icon: cat?.icon ?? tx.icon ?? 'twemoji:label', total: 0 };
    entry.total += amt;
    map.set(id, entry);
  }
  return [...map.entries()]
    .map(([id, v]) => ({ id, label: v.label, icon: v.icon, total: v.total, percent: grand > 0 ? Math.round((v.total / grand) * 100) : 0 }))
    .sort((a, b) => b.total - a.total);
}

export interface MonthFlow {
  key: string;
  shortLabel: string;
  income: number;
  expense: number;
}

const SHORT_MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];

export function monthlyFlow(items: TransactionItem[], months: number): MonthFlow[] {
  const now = new Date();
  const buckets: MonthFlow[] = [];
  for (let i = months - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = monthKey(d);
    buckets.push({ key, shortLabel: SHORT_MONTHS[d.getMonth()], income: 0, expense: 0 });
  }
  const byKey = new Map(buckets.map((b) => [b.key, b]));
  for (const tx of items) {
    const d = parseItemDate(tx);
    if (!d) continue;
    const bucket = byKey.get(monthKey(d));
    if (!bucket) continue;
    if (itemType(tx) === 'income') bucket.income += txAmount(tx);
    else bucket.expense += txAmount(tx);
  }
  return buckets;
}

export function formatRupiah(n: number): string {
  const sign = n < 0 ? '-' : '';
  return `${sign}Rp ${Math.abs(Math.round(n)).toLocaleString('id-ID')}`;
}

export function formatCompact(n: number): string {
  const abs = Math.abs(n);
  if (abs >= 1_000_000) return `Rp ${(n / 1_000_000).toLocaleString('id-ID', { maximumFractionDigits: 1 })}jt`;
  if (abs >= 1_000) return `Rp ${(n / 1_000).toLocaleString('id-ID', { maximumFractionDigits: 1 })}rb`;
  return formatRupiah(n);
}

const DAY_LABELS = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];

export function startOfWeek(d: Date): Date {
  const c = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const day = (c.getDay() + 6) % 7;
  c.setDate(c.getDate() - day);
  c.setHours(0, 0, 0, 0);
  return c;
}

export function getWeekRange(d: Date = new Date()): { from: Date; to: Date } {
  const from = startOfWeek(d);
  const to = new Date(from);
  to.setDate(to.getDate() + 6);
  to.setHours(23, 59, 59, 999);
  return { from, to };
}

const FULL_MONTHS = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];

export function formatWeekLabel(from: Date, to: Date): string {
  if (from.getMonth() === to.getMonth()) {
    return `Ringkasan ${from.getDate()} - ${to.getDate()} ${FULL_MONTHS[to.getMonth()]}`;
  }
  return `Ringkasan ${from.getDate()} ${FULL_MONTHS[from.getMonth()]} - ${to.getDate()} ${FULL_MONTHS[to.getMonth()]}`;
}

export function filterByWeek(items: TransactionItem[], weekStart: Date): TransactionItem[] {
  const from = startOfWeek(weekStart);
  const to = new Date(from);
  to.setDate(to.getDate() + 6);
  to.setHours(23, 59, 59, 999);
  return items.filter((tx) => {
    const d = parseItemDate(tx);
    if (!d) return false;
    return d.getTime() >= from.getTime() && d.getTime() <= to.getTime();
  });
}

export interface DaySpending {
  day: string;
  amount: number;
}

export function dailySpending(items: TransactionItem[], weekStart: Date): DaySpending[] {
  const from = startOfWeek(weekStart);
  const totals = [0, 0, 0, 0, 0, 0, 0];
  for (const tx of items) {
    if (itemType(tx) !== 'expense') continue;
    const d = parseItemDate(tx);
    if (!d) continue;
    if (d.getTime() < from.getTime() || d.getTime() > from.getTime() + 7 * 86400000) continue;
    const idx = (d.getDay() + 6) % 7;
    totals[idx] += txAmount(tx);
  }
  return ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'].map((day, i) => ({ day, amount: totals[i] }));
}

export interface TopCategoryComparison {
  id: string;
  label: string;
  icon: string;
  thisWeek: number;
  lastWeek: number;
}

export function compareTopCategories(
  thisWeek: TransactionItem[],
  lastWeek: TransactionItem[],
  topN = 3
): TopCategoryComparison[] {
  const current = breakdownByType(thisWeek, 'expense');
  const prevMap = new Map(breakdownByType(lastWeek, 'expense').map((b) => [b.id, b.total]));
  return current.slice(0, topN).map((c) => ({
    id: c.id,
    label: c.label,
    icon: c.icon,
    thisWeek: c.total,
    lastWeek: prevMap.get(c.id) ?? 0,
  }));
}

export function weekOverWeekChange(thisWeek: number, lastWeek: number): number {
  if (lastWeek <= 0) return thisWeek > 0 ? 100 : 0;
  return Math.round(((thisWeek - lastWeek) / lastWeek) * 100);
}

export { DAY_LABELS };
