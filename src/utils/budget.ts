import { BudgetCategory, MonthlyBudget } from '@/data/budgetData';
import { TransactionItem } from '@/data/dummyData';
import { itemType, resolveCategory } from '@/constants/categoryVisuals';
import { monthKey, parseItemDate } from '@/utils/dates';
import { txAmount } from '@/utils/reports';

export interface BudgetLimit {
  categoryId: string;
  limit: number;
}

export function buildBudget(
  monthKeyStr: string,
  limits: BudgetLimit[],
  transactions: TransactionItem[]
): MonthlyBudget {
  const byId = new Map<
    string,
    { limit: number; spent: number; txs: TransactionItem[] }
  >(limits.map((l) => [l.categoryId, { limit: l.limit, spent: 0, txs: [] }]));

  const monthTx = transactions.filter((tx) => {
    if (itemType(tx) !== 'expense') return false;
    const d = parseItemDate(tx);
    if (!d) return false;
    return monthKey(d) === monthKeyStr;
  });

  for (const tx of monthTx) {
    const cat = resolveCategory(tx);
    const id = cat?.id ?? tx.categoryId ?? tx.category ?? 'other';
    const entry = byId.get(id);
    if (!entry) continue;
    entry.spent += txAmount(tx);
    entry.txs.push(tx);
  }

  const categories: BudgetCategory[] = Array.from(byId.entries()).map(
    ([categoryId, e]) => ({
      categoryId,
      limit: e.limit,
      spent: e.spent,
      transactions: e.txs,
    })
  );

  return { monthKey: monthKeyStr, categories };
}

export function categoryPercentUsed(category: BudgetCategory): number {
  if (!category.limit) return 0;
  return Math.round((category.spent / category.limit) * 100);
}

export function percentUsed(spent: number, limit: number): number {
  if (!limit) return 0;
  return Math.round((spent / limit) * 100);
}

export function remainingBudget(limit: number, spent: number): number {
  return Math.max(0, limit - spent);
}

export function totalSpent(budget: MonthlyBudget | null): number {
  if (!budget) return 0;
  return budget.categories.reduce((sum, c) => sum + c.spent, 0);
}

export function totalLimit(budget: MonthlyBudget | null): number {
  if (!budget) return 0;
  return budget.categories.reduce((sum, c) => sum + c.limit, 0);
}

export function dailyAllowance(monthKeyStr: string, remaining: number): number {
  const [year, m] = monthKeyStr.split('-').map(Number);
  if (!year || !m) return remaining;
  const lastDay = new Date(year, m, 0).getDate();
  const now = new Date();
  const today = Math.min(now.getDate(), lastDay);
  const days = Math.max(1, lastDay - today + 1);
  return Math.floor(remaining / days);
}