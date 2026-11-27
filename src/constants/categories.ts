export interface Category {
  id: string;
  label: string;
  icon: string;
  color?: string;
  type?: 'expense' | 'income';
  custom?: boolean;
}

export const EXPENSE_CATEGORIES: Category[] = [
  { id: 'food', label: 'Makanan & Minuman', icon: 'twemoji:pot-of-food' },
  { id: 'shopping', label: 'Belanja', icon: 'twemoji:shopping-bags' },
  { id: 'transport', label: 'Transportasi', icon: 'twemoji:oncoming-automobile' },
  { id: 'bills', label: 'Tagihan & Bayar', icon: 'twemoji:receipt' },
  { id: 'health', label: 'Kesehatan', icon: 'twemoji:medical-symbol' },
  { id: 'entertainment', label: 'Hiburan', icon: 'twemoji:clapper-board' },
  { id: 'education', label: 'Pendidikan', icon: 'twemoji:open-book' },
  { id: 'personal', label: 'Perawatan Diri', icon: 'twemoji:person-getting-haircut' },
  { id: 'gift', label: 'Hadiah & Amal', icon: 'twemoji:wrapped-gift' },
  { id: 'other', label: 'Lainnya', icon: 'twemoji:label' },
];

export const INCOME_CATEGORIES: Category[] = [
  { id: 'salary', label: 'Gaji', icon: 'twemoji:briefcase' },
  { id: 'freelance', label: 'Freelance / Sampingan', icon: 'twemoji:laptop' },
  { id: 'investment', label: 'Investasi', icon: 'twemoji:chart-increasing' },
  { id: 'gift_income', label: 'Hadiah', icon: 'twemoji:wrapped-gift' },
  { id: 'refund', label: 'Pengembalian', icon: 'twemoji:counterclockwise-arrows-button' },
  { id: 'other_income', label: 'Lainnya', icon: 'twemoji:money-with-wings' },
];

export const ALL_CATEGORIES = [...EXPENSE_CATEGORIES, ...INCOME_CATEGORIES];

let customCategories: Category[] = [];

export function registerCustomCategories(next: Category[]) {
  customCategories = next;
  ALL_CATEGORIES.splice(
    0,
    ALL_CATEGORIES.length,
    ...EXPENSE_CATEGORIES,
    ...INCOME_CATEGORIES,
    ...next,
  );
}

export function getCategoriesForType(type: 'expense' | 'income'): Category[] {
  const base = type === 'expense' ? EXPENSE_CATEGORIES : INCOME_CATEGORIES;
  return [...base, ...customCategories.filter((c) => (c.type ?? type) === type)];
}

export function getCategoryById(id: string, type?: 'expense' | 'income'): Category | undefined {
  const pool = type ? getCategoriesForType(type) : ALL_CATEGORIES;
  return pool.find((c) => c.id === id);
}

export function getDefaultCategory(type: 'expense' | 'income'): Category {
  return getCategoriesForType(type)[0];
}