import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/auth-context';

interface BudgetRow {
  id: string;
  user_id: string;
  month_key: string;
  category_id: string;
  limit_amount: number | string;
  created_at: string;
}

export interface BudgetEntry {
  id: string;
  monthKey: string;
  categoryId: string;
  limit: number;
}

interface BudgetContextValue {
  budgets: BudgetEntry[];
  getBudgetsForMonth: (monthKey: string) => BudgetEntry[];
  setLimit: (monthKey: string, categoryId: string, limit: number) => Promise<void>;
  removeBudget: (monthKey: string, categoryId: string) => Promise<void>;
}

const BudgetContext = createContext<BudgetContextValue | null>(null);

function toEntry(row: BudgetRow): BudgetEntry {
  return {
    id: row.id,
    monthKey: row.month_key,
    categoryId: row.category_id,
    limit: Number(row.limit_amount),
  };
}

export function BudgetProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [budgets, setBudgets] = useState<BudgetEntry[]>([]);

  useEffect(() => {
    if (!user) return;
    let active = true;
    (async () => {
      const { data, error } = await supabase
        .from('budgets')
        .select('*')
        .eq('user_id', user.id)
        .order('month_key', { ascending: false });
      if (!active) return;
      if (!error) setBudgets((data ?? []).map((r) => toEntry(r as BudgetRow)));
    })();
    return () => {
      active = false;
    };
  }, [user]);

  const getBudgetsForMonth = useCallback(
    (monthKey: string) => budgets.filter((b) => b.monthKey === monthKey),
    [budgets]
  );

  const setLimit = useCallback(
    async (monthKey: string, categoryId: string, limit: number) => {
      if (!user) return;
      const { data, error } = await supabase
        .from('budgets')
        .upsert(
          {
            user_id: user.id,
            month_key: monthKey,
            category_id: categoryId,
            limit_amount: limit,
          },
          { onConflict: 'user_id,month_key,category_id' }
        )
        .select()
        .single();
      if (error) throw error;
      setBudgets((prev) => {
        const next = prev.filter((b) => !(b.monthKey === monthKey && b.categoryId === categoryId));
        const entry = data ? toEntry(data as BudgetRow) : { id: '', monthKey, categoryId, limit };
        return [entry, ...next];
      });
    },
    [user]
  );

  const removeBudget = useCallback(
    async (monthKey: string, categoryId: string) => {
      if (!user) return;
      const { error } = await supabase
        .from('budgets')
        .delete()
        .eq('user_id', user.id)
        .eq('month_key', monthKey)
        .eq('category_id', categoryId);
      if (error) throw error;
      setBudgets((prev) =>
        prev.filter((b) => !(b.monthKey === monthKey && b.categoryId === categoryId))
      );
    },
    [user]
  );

  const value = useMemo<BudgetContextValue>(
    () => ({
      budgets,
      getBudgetsForMonth,
      setLimit,
      removeBudget,
    }),
    [budgets, getBudgetsForMonth, setLimit, removeBudget]
  );

  return <BudgetContext.Provider value={value}>{children}</BudgetContext.Provider>;
}

export function useBudget(): BudgetContextValue {
  const ctx = useContext(BudgetContext);
  if (!ctx) {
    throw new Error('useBudget harus dipakai di dalam BudgetProvider.');
  }
  return ctx;
}