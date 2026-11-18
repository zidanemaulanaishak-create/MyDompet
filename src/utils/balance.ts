import type { TransactionItem } from '@/data/dummyData';
import { monthKey, parseItemDate } from '@/utils/dates';
import { filterByPeriod, summarize } from '@/utils/reports';
import { monthlyIncomeForMonth, type IncomePeriod } from '@/utils/income';

const MAX_MONTHS = 600;

export function activeMonthKeys(
  transactions: TransactionItem[],
  now: Date = new Date()
): string[] {
  const currentKey = monthKey(now);
  let earliest: Date | null = null;
  for (const tx of transactions) {
    const date = parseItemDate(tx);
    if (!date) continue;
    if (!earliest || date.getTime() < earliest.getTime()) earliest = date;
  }
  if (!earliest) return [currentKey];

  const start = new Date(earliest.getFullYear(), earliest.getMonth(), 1);
  const end = new Date(now.getFullYear(), now.getMonth(), 1);
  if (start.getTime() > end.getTime()) return [currentKey];

  const keys: string[] = [];
  const cursor = new Date(start);
  while (cursor.getTime() <= end.getTime() && keys.length < MAX_MONTHS) {
    keys.push(monthKey(cursor));
    cursor.setMonth(cursor.getMonth() + 1);
  }
  return keys.length ? keys : [currentKey];
}

export interface BalanceSummary {
  monthBalance: number;
  totalBalance: number;
  monthIncome: number;
  monthExpense: number;
  totalIncome: number;
  totalExpense: number;
}

export function computeBalances(params: {
  transactions: TransactionItem[];
  mainIncome: number;
  incomeHistory: IncomePeriod[];
  now?: Date;
}): BalanceSummary {
  const now = params.now ?? new Date();
  const currentKey = monthKey(now);
  const monthSum = summarize(filterByPeriod(params.transactions, 'month'));
  const allSum = summarize(params.transactions);

  const currentIncome = monthlyIncomeForMonth(
    params.incomeHistory,
    currentKey,
    params.mainIncome
  );

  let totalMonthlyIncome = 0;
  for (const key of activeMonthKeys(params.transactions, now)) {
    totalMonthlyIncome += monthlyIncomeForMonth(
      params.incomeHistory,
      key,
      params.mainIncome
    );
  }

  const monthIncome = currentIncome + monthSum.income;
  const totalIncome = totalMonthlyIncome + allSum.income;

  return {
    monthBalance: monthIncome - monthSum.expense,
    totalBalance: totalIncome - allSum.expense,
    monthIncome,
    monthExpense: monthSum.expense,
    totalIncome,
    totalExpense: allSum.expense,
  };
}
