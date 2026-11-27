import { supabase } from '@/lib/supabase';
import type { Category } from '@/constants/categories';

export const CATEGORY_ERRORS = {
  AUTH: 'AUTH_REQUIRED',
  EXISTS: 'CATEGORY_EXISTS',
  IN_USE: 'CATEGORY_IN_USE',
} as const;

interface CategoryRow {
  id: string;
  label: string;
  icon: string;
  type: 'expense' | 'income';
  user_id: string;
}

function isDuplicate(error: { code?: string; message?: string }): boolean {
  return error.code === '23505' || /duplicate/i.test(error.message ?? '');
}

function toCategory(row: CategoryRow): Category {
  return {
    id: row.id,
    label: row.label,
    icon: row.icon,
    type: row.type,
    custom: true,
  };
}

function makeCustomId() {
  return `custom_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
}

export async function fetchCustomCategories(userId: string): Promise<Category[]> {
  const { data, error } = await supabase
    .from('categories')
    .select('id,label,icon,type,user_id')
    .eq('user_id', userId)
    .order('label', { ascending: true });

  if (error) throw error;
  return (data ?? []).map((row) => toCategory(row as CategoryRow));
}

export async function createCustomCategory(
  userId: string,
  label: string,
  type: 'expense' | 'income',
): Promise<Category> {
  const clean = label.trim();
  const category: Category = {
    id: makeCustomId(),
    label: clean,
    icon: type === 'expense' ? 'twemoji:label' : 'twemoji:money-with-wings',
    type,
    custom: true,
  };

  const { error } = await supabase.from('categories').insert({
    id: category.id,
    label: clean,
    icon: category.icon,
    type,
    user_id: userId,
    is_custom: true,
  });

  if (error) {
    if (isDuplicate(error)) throw new Error(CATEGORY_ERRORS.EXISTS);
    throw error;
  }
  return category;
}

export async function updateCustomCategory(
  userId: string,
  category: Category,
  label: string,
): Promise<Category> {
  const clean = label.trim();
  const { error } = await supabase
    .from('categories')
    .update({ label: clean })
    .eq('id', category.id)
    .eq('user_id', userId);

  if (error) {
    if (isDuplicate(error)) throw new Error(CATEGORY_ERRORS.EXISTS);
    throw error;
  }

  const txUpdate = await supabase
    .from('transactions')
    .update({ category: clean })
    .eq('user_id', userId)
    .eq('category_id', category.id);

  if (txUpdate.error) throw txUpdate.error;
  return { ...category, label: clean };
}

export async function countCategoryUsage(userId: string, categoryId: string): Promise<number> {
  const [transactions, budgets] = await Promise.all([
    supabase
      .from('transactions')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('category_id', categoryId),
    supabase
      .from('budgets')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('category_id', categoryId),
  ]);

  if (transactions.error) throw transactions.error;
  if (budgets.error) throw budgets.error;
  return (transactions.count ?? 0) + (budgets.count ?? 0);
}

export async function deleteCustomCategory(userId: string, categoryId: string): Promise<void> {
  const usage = await countCategoryUsage(userId, categoryId);
  if (usage > 0) throw new Error(CATEGORY_ERRORS.IN_USE);

  const { error } = await supabase
    .from('categories')
    .delete()
    .eq('id', categoryId)
    .eq('user_id', userId);

  if (error) throw error;
}
