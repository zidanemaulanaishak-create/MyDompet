import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { useAuth } from '@/context/auth-context';
import {
  Category,
  EXPENSE_CATEGORIES,
  INCOME_CATEGORIES,
  getCategoriesForType,
  getCategoryById,
  registerCustomCategories,
} from '@/constants/categories';
import {
  CATEGORY_ERRORS,
  createCustomCategory,
  deleteCustomCategory,
  fetchCustomCategories,
  updateCustomCategory,
} from '@/services/categories';

type CategoryType = 'expense' | 'income';

interface CategoriesContextValue {
  categories: Category[];
  expenseCategories: Category[];
  incomeCategories: Category[];
  isLoading: boolean;
  refresh: () => Promise<void>;
  getCategoriesForType: (type: CategoryType) => Category[];
  getCategoryById: (id: string, type?: CategoryType) => Category | undefined;
  createCategory: (label: string, type: CategoryType) => Promise<Category>;
  updateCategory: (category: Category, label: string) => Promise<Category>;
  deleteCategory: (categoryId: string) => Promise<void>;
}

const CategoriesContext = createContext<CategoriesContextValue | null>(null);

export function useCategories() {
  const ctx = useContext(CategoriesContext);
  if (!ctx) {
    throw new Error('useCategories must be used within a CategoriesProvider');
  }
  return ctx;
}

export function CategoriesProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const userId = user?.id;
  const [customCategories, setCustomCategories] = useState<Category[]>([]);
  const [isLoading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    if (!userId) {
      setCustomCategories([]);
      registerCustomCategories([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const rows = await fetchCustomCategories(userId);
      setCustomCategories(rows);
      registerCustomCategories(rows);
    } catch (error) {
      console.warn('Gagal memuat kategori:', error);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    let active = true;
    (async () => {
      if (!userId) {
        if (active) {
          setCustomCategories([]);
          registerCustomCategories([]);
          setLoading(false);
        }
        return;
      }

      if (active) setLoading(true);
      try {
        const rows = await fetchCustomCategories(userId);
        if (active) {
          setCustomCategories(rows);
          registerCustomCategories(rows);
        }
      } catch (error) {
        console.warn('Gagal memuat kategori:', error);
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [userId]);

  const createCategory = useCallback(
    async (label: string, type: CategoryType) => {
      if (!userId) throw new Error(CATEGORY_ERRORS.AUTH);
      const created = await createCustomCategory(userId, label, type);
      await refresh();
      return created;
    },
    [refresh, userId],
  );

  const updateCategory = useCallback(
    async (category: Category, label: string) => {
      if (!userId) throw new Error(CATEGORY_ERRORS.AUTH);
      const updated = await updateCustomCategory(userId, category, label);
      await refresh();
      return updated;
    },
    [refresh, userId],
  );

  const deleteCategory = useCallback(
    async (categoryId: string) => {
      if (!userId) throw new Error(CATEGORY_ERRORS.AUTH);
      await deleteCustomCategory(userId, categoryId);
      await refresh();
    },
    [refresh, userId],
  );

  const value = useMemo<CategoriesContextValue>(() => {
    const expenseCategories = [
      ...EXPENSE_CATEGORIES,
      ...customCategories.filter((c) => (c.type ?? 'expense') === 'expense'),
    ];
    const incomeCategories = [
      ...INCOME_CATEGORIES,
      ...customCategories.filter((c) => (c.type ?? 'income') === 'income'),
    ];
    return {
      categories: [...expenseCategories, ...incomeCategories],
      expenseCategories,
      incomeCategories,
      isLoading,
      refresh,
      getCategoriesForType,
      getCategoryById,
      createCategory,
      updateCategory,
      deleteCategory,
    };
  }, [createCategory, customCategories, deleteCategory, isLoading, refresh, updateCategory]);

  return <CategoriesContext.Provider value={value}>{children}</CategoriesContext.Provider>;
}
