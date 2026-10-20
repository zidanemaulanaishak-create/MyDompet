import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/auth-context';
import type { FinancialGoal } from '@/data/goalsData';
import { formatDeadlineLabel } from '@/utils/goals';

interface GoalRow {
  id: string;
  user_id: string;
  name: string;
  target_amount: number | string;
  saved_amount: number | string;
  deadline_label: string;
  deadline_ts: number | string;
  icon: string;
  icon_bg: string;
  icon_color: string;
  image_uri: string | null;
  created_at: string;
}

export interface GoalInput {
  name: string;
  target: number;
  deadlineTs: number;
  icon?: string;
  iconBg?: string;
  iconColor?: string;
  imageUri?: string;
}

function toGoal(row: GoalRow): FinancialGoal {
  return {
    id: row.id,
    name: row.name,
    icon: row.icon,
    iconBg: row.icon_bg,
    iconColor: row.icon_color,
    imageUri: row.image_uri ?? undefined,
    deadline: row.deadline_label,
    deadlineTs: Number(row.deadline_ts),
    saved: Number(row.saved_amount),
    target: Number(row.target_amount),
    createdAt: new Date(row.created_at).getTime(),
  };
}

function cacheKey(userId: string): string {
  return `mydompet_goals_${userId}`;
}

async function readCache(userId: string): Promise<FinancialGoal[]> {
  try {
    const raw = await AsyncStorage.getItem(cacheKey(userId));
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as FinancialGoal[]) : [];
  } catch {
    return [];
  }
}

async function writeCache(userId: string, goals: FinancialGoal[]): Promise<void> {
  try {
    await AsyncStorage.setItem(cacheKey(userId), JSON.stringify(goals));
  } catch {
    // cache best-effort, abaikan
  }
}

interface GoalContextValue {
  goals: FinancialGoal[];
  isLoading: boolean;
  refresh: () => Promise<void>;
  addGoal: (input: GoalInput) => Promise<string | null>;
  updateGoal: (id: string, patch: Partial<GoalInput>) => Promise<string | null>;
  deleteGoal: (id: string) => Promise<string | null>;
  deposit: (id: string, amount: number) => Promise<string | null>;
  withdraw: (id: string, amount: number) => Promise<string | null>;
}

const GoalContext = createContext<GoalContextValue | null>(null);

export function GoalProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [goals, setGoals] = useState<FinancialGoal[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!user) {
      setGoals([]);
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('financial_goals')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      if (!error) {
        const next = (data ?? []).map((r) => toGoal(r as GoalRow));
        setGoals(next);
        void writeCache(user.id, next);
      }
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  // Reset saat user berganti/logout (adjust-state-during-render, bukan di effect).
  const [prevUserId, setPrevUserId] = useState<string | null>(null);
  const uid = user?.id ?? null;
  if (uid !== prevUserId) {
    setPrevUserId(uid);
    setGoals([]);
    setIsLoading(!!uid);
  }

  useEffect(() => {
    if (!user) return;
    let active = true;
    (async () => {
      // Tampilkan cache lokal dulu agar instan & tahan offline.
      const cached = await readCache(user.id);
      if (active && cached.length) setGoals(cached);
      const { data, error } = await supabase
        .from('financial_goals')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      if (!active) return;
      if (!error) {
        const next = (data ?? []).map((r) => toGoal(r as GoalRow));
        setGoals(next);
        void writeCache(user.id, next);
      }
      setIsLoading(false);
    })();
    return () => {
      active = false;
    };
  }, [user]);

  const addGoal = useCallback(
    async (input: GoalInput): Promise<string | null> => {
      if (!user) return 'Harus login dulu.';
      const name = input.name.trim();
      if (name.length < 3) return 'Isi nama target minimal 3 karakter.';
      if (!Number.isFinite(input.target) || input.target <= 0) {
        return 'Isi total target dengan angka lebih dari 0.';
      }
      const payload = {
        user_id: user.id,
        name,
        target_amount: Math.round(input.target),
        saved_amount: 0,
        deadline_label: formatDeadlineLabel(input.deadlineTs),
        deadline_ts: input.deadlineTs,
        icon: input.icon ?? 'ph:piggy-bank-bold',
        icon_bg: input.iconBg ?? '#FDF2E9',
        icon_color: input.iconColor ?? '#C2410C',
        image_uri: input.imageUri ?? null,
      };
      const { data, error } = await supabase
        .from('financial_goals')
        .insert(payload)
        .select()
        .single();
      if (error) return error.message;
      const goal = toGoal(data as GoalRow);
      setGoals((prev) => {
        const next = [goal, ...prev];
        void writeCache(user.id, next);
        return next;
      });
      return null;
    },
    [user]
  );

  const updateGoal = useCallback(
    async (id: string, patch: Partial<GoalInput>): Promise<string | null> => {
      if (!user) return 'Harus login dulu.';
      const current = goals.find((g) => g.id === id);
      if (!current) return 'Target tidak ditemukan.';
      const name = patch.name !== undefined ? patch.name.trim() : current.name;
      if (name.length < 3) return 'Isi nama target minimal 3 karakter.';
      const target = patch.target !== undefined ? patch.target : current.target;
      if (!Number.isFinite(target) || target <= 0) {
        return 'Isi total target dengan angka lebih dari 0.';
      }
      if (target < current.saved) {
        return 'Total target tidak boleh lebih kecil dari nominal terkumpul.';
      }
      const deadlineTs = patch.deadlineTs ?? current.deadlineTs;
      const update: Record<string, unknown> = {
        name,
        target_amount: Math.round(target),
        deadline_ts: deadlineTs,
        deadline_label: formatDeadlineLabel(deadlineTs),
      };
      if (patch.icon !== undefined) update.icon = patch.icon;
      if (patch.iconBg !== undefined) update.icon_bg = patch.iconBg;
      if (patch.iconColor !== undefined) update.icon_color = patch.iconColor;
      if (patch.imageUri !== undefined) update.image_uri = patch.imageUri ?? null;
      const { data, error } = await supabase
        .from('financial_goals')
        .update(update)
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single();
      if (error) return error.message;
      const updated = toGoal(data as GoalRow);
      setGoals((prev) => {
        const next = prev.map((g) => (g.id === id ? updated : g));
        void writeCache(user.id, next);
        return next;
      });
      return null;
    },
    [user, goals]
  );

  const deleteGoal = useCallback(
    async (id: string): Promise<string | null> => {
      if (!user) return 'Harus login dulu.';
      const { error } = await supabase
        .from('financial_goals')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);
      if (error) return error.message;
      setGoals((prev) => {
        const next = prev.filter((g) => g.id !== id);
        void writeCache(user.id, next);
        return next;
      });
      return null;
    },
    [user]
  );

  const deposit = useCallback(
    async (id: string, amount: number): Promise<string | null> => {
      if (!user) return 'Harus login dulu.';
      if (!Number.isFinite(amount) || amount <= 0) {
        return 'Isi jumlah nabung lebih dari 0.';
      }
      const current = goals.find((g) => g.id === id);
      if (!current) return 'Target tidak ditemukan.';
      const saved = current.saved + Math.round(amount);
      const { data, error } = await supabase
        .from('financial_goals')
        .update({ saved_amount: saved })
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single();
      if (error) return error.message;
      const updated = toGoal(data as GoalRow);
      setGoals((prev) => {
        const next = prev.map((g) => (g.id === id ? updated : g));
        void writeCache(user.id, next);
        return next;
      });
      return null;
    },
    [user, goals]
  );

  const withdraw = useCallback(
    async (id: string, amount: number): Promise<string | null> => {
      if (!user) return 'Harus login dulu.';
      if (!Number.isFinite(amount) || amount <= 0) {
        return 'Isi jumlah penarikan lebih dari 0.';
      }
      const current = goals.find((g) => g.id === id);
      if (!current) return 'Target tidak ditemukan.';
      if (Math.round(amount) > current.saved) {
        return 'Nominal penarikan melebihi tabungan terkumpul.';
      }
      const saved = current.saved - Math.round(amount);
      const { data, error } = await supabase
        .from('financial_goals')
        .update({ saved_amount: saved })
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single();
      if (error) return error.message;
      const updated = toGoal(data as GoalRow);
      setGoals((prev) => {
        const next = prev.map((g) => (g.id === id ? updated : g));
        void writeCache(user.id, next);
        return next;
      });
      return null;
    },
    [user, goals]
  );

  const value = useMemo<GoalContextValue>(
    () => ({ goals, isLoading, refresh, addGoal, updateGoal, deleteGoal, deposit, withdraw }),
    [goals, isLoading, refresh, addGoal, updateGoal, deleteGoal, deposit, withdraw]
  );

  return <GoalContext.Provider value={value}>{children}</GoalContext.Provider>;
}

export function useGoals(): GoalContextValue {
  const ctx = useContext(GoalContext);
  if (!ctx) {
    throw new Error('useGoals harus dipakai di dalam GoalProvider.');
  }
  return ctx;
}
