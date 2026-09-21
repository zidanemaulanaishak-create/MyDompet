import {
  Category,
  ALL_CATEGORIES,
  EXPENSE_CATEGORIES,
  INCOME_CATEGORIES,
} from '@/constants/categories';
import { TransactionItem } from '@/data/dummyData';

export const CATEGORY_PASTEL_BG: Record<string, string> = {
  food: '#FEE2E2',
  shopping: '#FEF3C7',
  transport: '#DBEAFE',
  bills: '#E0E7FF',
  health: '#FCE7F3',
  entertainment: '#EDE9FE',
  education: '#CFFAFE',
  personal: '#FFE4E6',
  gift: '#FEF9C3',
  other: '#F1F5F9',
  salary: '#D1FAE5',
  freelance: '#D1FAE5',
  investment: '#DBEAFE',
  gift_income: '#FEF9C3',
  refund: '#D1FAE5',
  other_income: '#D1FAE5',
};

export const DEFAULT_PASTEL_BG = '#F1F5F9';

export function getPastelBg(categoryId?: string): string {
  if (categoryId && CATEGORY_PASTEL_BG[categoryId]) {
    return CATEGORY_PASTEL_BG[categoryId];
  }
  return DEFAULT_PASTEL_BG;
}

export function resolveCategory(item: TransactionItem): Category | undefined {
  if (item.categoryId) {
    return ALL_CATEGORIES.find((c) => c.id === item.categoryId);
  }
  if (item.icon) {
    return ALL_CATEGORIES.find((c) => c.icon === item.icon);
  }
  if (item.category) {
    return ALL_CATEGORIES.find(
      (c) => c.label.toLowerCase() === item.category!.toLowerCase()
    );
  }
  return undefined;
}

export type TransactionType = 'expense' | 'income';

export function itemType(item: TransactionItem): TransactionType {
  if (item.type) return item.type;
  const category = resolveCategory(item);
  if (category) {
    if (EXPENSE_CATEGORIES.some((c) => c.id === category.id)) return 'expense';
    if (INCOME_CATEGORIES.some((c) => c.id === category.id)) return 'income';
  }
  return item.amount.startsWith('-') ? 'expense' : 'income';
}

export function getCategoryColor(item: TransactionItem): string {
  if (item.categoryId && CATEGORY_PASTEL_BG[item.categoryId]) {
    return CATEGORY_PASTEL_BG[item.categoryId];
  }
  const category = resolveCategory(item);
  return getPastelBg(category?.id);
}