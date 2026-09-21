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
import { TransactionItem } from '@/data/dummyData';
import { resolveCategory, itemType } from '@/constants/categoryVisuals';
import { getCurrencyByCode } from '@/constants/currencies';
import { txAmount } from '@/utils/reports';

interface TransactionRow {
  id: string;
  user_id: string;
  name: string;
  category: string | null;
  category_id: string | null;
  icon: string | null;
  note: string | null;
  type: 'expense' | 'income';
  currency: string;
  amount: number | string;
  tx_date: string;
  created_at: string;
}

const FULL_MONTHS_ID = [
  'Januari',
  'Februari',
  'Maret',
  'April',
  'Mei',
  'Juni',
  'Juli',
  'Agustus',
  'September',
  'Oktober',
  'November',
  'Desember',
];

function toDateLabel(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const startToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startThat = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const diffDays = Math.round((startToday.getTime() - startThat.getTime()) / 86400000);
  if (diffDays === 0) return 'Hari ini';
  if (diffDays === 1) return 'Kemarin';
  return `${d.getDate()} ${FULL_MONTHS_ID[d.getMonth()]}`;
}

function toItem(row: TransactionRow): TransactionItem {
  const amount = Number(row.amount);
  const type = row.type;
  const symbol = getCurrencyByCode(row.currency)?.symbol ?? 'Rp';
  return {
    id: row.id,
    name: row.name,
    category: row.category ?? '',
    categoryId: row.category_id ?? undefined,
    icon: row.icon ?? '',
    note: row.note ?? undefined,
    type,
    currency: row.currency,
    amountValue: amount,
    amount: `${type === 'expense' ? '-' : '+'}${symbol} ${amount.toLocaleString('id-ID')}`,
    date: toDateLabel(row.tx_date),
    timestamp: new Date(row.tx_date).getTime(),
  };
}

function toRow(tx: TransactionItem, userId: string) {
  const type = itemType(tx);
  const cat = resolveCategory(tx);
  return {
    user_id: userId,
    name: tx.name,
    category: tx.category ?? cat?.label ?? null,
    category_id: tx.categoryId ?? cat?.id ?? null,
    icon: tx.icon ?? cat?.icon ?? null,
    note: tx.note ?? null,
    type,
    currency: tx.currency ?? 'IDR',
    amount: txAmount(tx),
    tx_date: new Date(
      typeof tx.timestamp === 'number' ? tx.timestamp : Date.now()
    ).toISOString(),
  };
}

interface TransactionContextValue {
  transactions: TransactionItem[];
  addTransaction: (tx: TransactionItem) => Promise<void>;
  updateTransaction: (tx: TransactionItem) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
  refresh: () => Promise<void>;
}

const TransactionContext = createContext<TransactionContextValue | null>(null);

export function TransactionProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<TransactionItem[]>([]);

  useEffect(() => {
    if (!user) return;
    let active = true;
    (async () => {
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('tx_date', { ascending: false });
      if (!active) return;
      if (!error) setTransactions((data ?? []).map((r) => toItem(r as TransactionRow)));
    })();
    return () => {
      active = false;
    };
  }, [user]);

  const addTransaction = useCallback(
    async (tx: TransactionItem) => {
      if (!user) return;
      const { data, error } = await supabase
        .from('transactions')
        .insert(toRow(tx, user.id))
        .select()
        .single();
      if (error) throw error;
      setTransactions((prev) => [data ? toItem(data as TransactionRow) : tx, ...prev]);
    },
    [user]
  );

  const updateTransaction = useCallback(
    async (tx: TransactionItem) => {
      if (!user || !tx.id) return;
      const { data, error } = await supabase
        .from('transactions')
        .update(toRow(tx, user.id))
        .eq('id', tx.id)
        .select()
        .single();
      if (error) throw error;
      setTransactions((prev) =>
        prev.map((p) => (p.id === tx.id ? (data ? toItem(data as TransactionRow) : tx) : p))
      );
    },
    [user]
  );

  const deleteTransaction = useCallback(
    async (id: string) => {
      if (!user) return;
      const { error } = await supabase.from('transactions').delete().eq('id', id).eq('user_id', user.id);
      if (error) throw error;
      setTransactions((prev) => prev.filter((p) => p.id !== id));
    },
    [user]
  );

  const refresh = useCallback(async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', user.id)
      .order('tx_date', { ascending: false });
    if (error) throw error;
    setTransactions((data ?? []).map((r) => toItem(r as TransactionRow)));
  }, [user]);

  const value = useMemo<TransactionContextValue>(
    () => ({
      transactions,
      addTransaction,
      updateTransaction,
      deleteTransaction,
      refresh,
    }),
    [transactions, addTransaction, updateTransaction, deleteTransaction, refresh]
  );

  return <TransactionContext.Provider value={value}>{children}</TransactionContext.Provider>;
}

export function useTransactions(): TransactionContextValue {
  const ctx = useContext(TransactionContext);
  if (!ctx) {
    throw new Error('useTransactions harus dipakai di dalam TransactionProvider.');
  }
  return ctx;
}