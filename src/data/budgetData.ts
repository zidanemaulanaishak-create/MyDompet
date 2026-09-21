import { TransactionItem } from '@/data/dummyData';
import { monthKey } from '@/utils/dates';

export interface BudgetCategory {
  categoryId: string;
  limit: number;
  spent: number;
  transactions: TransactionItem[];
}

export interface MonthlyBudget {
  monthKey: string;
  categories: BudgetCategory[];
}

export function currentBudgetMonthKey(): string {
  return monthKey(new Date());
}

export function getRecentMonthKeys(count: number): string[] {
  const keys: string[] = [];
  const now = new Date();
  for (let i = count - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    keys.push(monthKey(d));
  }
  return keys;
}