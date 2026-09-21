import type { ChatContextSnapshot } from '@/services/ai';
import { ALL_CATEGORIES } from '@/constants/categories';
import { itemType } from '@/constants/categoryVisuals';
import type { TransactionItem } from '@/data/dummyData';
import { buildBudget, categoryPercentUsed } from '@/utils/budget';
import { monthKey, parseItemDate } from '@/utils/dates';
import { breakdownByType, filterByPeriod, summarize, txAmount } from '@/utils/reports';

export interface SnapshotBudgetLimit {
  categoryId: string;
  limit: number;
}

export interface SnapshotInput {
  userName: string;
  occupation: string | null;
  mainIncome: number;
  transactions: TransactionItem[];
  budgets: SnapshotBudgetLimit[];
  recentCount?: number;
}

function categoryLabel(categoryId: string): string {
  return ALL_CATEGORIES.find((c) => c.id === categoryId)?.label ?? categoryId;
}

export function buildContextSnapshot(input: SnapshotInput): ChatContextSnapshot {
  const now = new Date();
  const currentMonthKey = monthKey(now);

  const monthTx = filterByPeriod(input.transactions, 'month');
  const monthSum = summarize(monthTx);
  const allSum = summarize(input.transactions);
  const monthBudget = buildBudget(currentMonthKey, input.budgets, input.transactions);

  const prevMonthKey = monthKey(new Date(now.getFullYear(), now.getMonth() - 1, 1));
  let prevExpense = 0;
  for (const tx of input.transactions) {
    if (itemType(tx) !== 'expense') continue;
    const d = parseItemDate(tx);
    if (d && monthKey(d) === prevMonthKey) prevExpense += txAmount(tx);
  }

  const top = breakdownByType(monthTx, 'expense')[0] ?? null;

  const budgetHits = monthBudget.categories
    .filter((c) => c.limit > 0 && (c.spent > 0 || categoryPercentUsed(c) >= 90))
    .map((c) => ({
      label: categoryLabel(c.categoryId),
      spent: c.spent,
      limit: c.limit,
      percent: categoryPercentUsed(c),
    }))
    .sort((a, b) => b.percent - a.percent)
    .slice(0, 3);

  const recentCount = input.recentCount ?? 5;
  const recentTransactions = input.transactions
    .slice(0, recentCount)
    .map((tx) => `${tx.name} · ${tx.amount}`);

  const budgetLimit = monthBudget.categories.reduce((sum, c) => sum + c.limit, 0);
  const budgetSpent = monthBudget.categories.reduce((sum, c) => sum + c.spent, 0);

  const dataVersion = [
    currentMonthKey,
    input.mainIncome,
    input.transactions.length,
    monthSum.income,
    monthSum.expense,
    prevExpense,
    allSum.expense,
    budgetLimit,
    budgetSpent,
    top?.id ?? 'none',
  ].join('|');

  return {
    userName: input.userName,
    occupation: input.occupation,
    mainIncome: input.mainIncome,
    monthIncome: monthSum.income,
    monthExpense: monthSum.expense,
    totalIncome: allSum.income,
    totalExpense: allSum.expense,
    budgetLimit,
    budgetSpent,
    prevMonthExpense: prevExpense,
    transactionCount: input.transactions.length,
    topExpenseCategory: top ? { label: top.label, total: top.total } : null,
    budgetHits,
    recentTransactions,
    dataVersion,
  };
}