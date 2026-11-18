import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import type { User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { storage } from '@/context/storage';
import { EMPTY_ONBOARDING, type OnboardingData, type Occupation, parseOnboarding } from '@/context/onboarding';
import {
  signInWithProvider as signInWithProviderFlow,
  type SocialProvider,
} from '@/services/socialAuth';
import { getAppPrefs } from '@/utils/appPrefs';
import { translate } from '@/i18n';
import { monthKey } from '@/utils/dates';
import {
  addIncomePeriod,
  parseIncomeHistory,
  type IncomePeriod,
} from '@/utils/income';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  avatarUrl: string | null;
  incomeHistory: IncomePeriod[];
}

interface AuthContextValue {
  user: AuthUser | null;
  isReady: boolean;
  onboarding: OnboardingData;
  onboardingReady: boolean;
  setOnboarding: (patch: Partial<OnboardingData>) => Promise<void>;
  completeOnboarding: () => Promise<void>;
  resetOnboarding: () => Promise<void>;
  signIn: (email: string, password: string) => Promise<string | null>;
  signUp: (name: string, email: string, password: string) => Promise<string | null>;
  updateName: (name: string) => Promise<string | null>;
  updateAvatar: (url: string | null) => Promise<void>;
  signInWithProvider: (provider: SocialProvider) => Promise<string | null>;
  signOut: () => Promise<void>;
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const ONBOARDING_PREFIX = 'mydompet_onboarding_';

function onboardingKey(email: string) {
  return `${ONBOARDING_PREFIX}${email.toLowerCase()}`;
}

export function isEmailValid(email: string) {
  return EMAIL_REGEX.test(email.trim());
}

export function getFirstName(name: string) {
  return name.trim().split(/\s+/)[0] ?? name.trim();
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
}

interface ProfileRow {
  name: string | null;
  email: string | null;
  occupation: string | null;
  main_income: number | null;
  onboarding_completed: boolean | null;
  avatar_url: string | null;
  income_history: unknown;
}

function toOccupation(value: string | null): Occupation | null {
  return value === 'pekerja' || value === 'pelajar' || value === 'mahasiswa' ? value : null;
}

async function fetchProfileRow(userId: string): Promise<ProfileRow | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('name, email, occupation, main_income, onboarding_completed, avatar_url, income_history')
    .eq('id', userId)
    .maybeSingle();

  if (!error) return (data as ProfileRow | null) ?? null;

  // Fallback sebelum migrasi 0006 dijalankan.
  const fallback = await supabase
    .from('profiles')
    .select('name, email, occupation, main_income, onboarding_completed')
    .eq('id', userId)
    .maybeSingle();

  if (!fallback.data) return null;
  return {
    ...(fallback.data as Omit<ProfileRow, 'avatar_url' | 'income_history'>),
    avatar_url: null,
    income_history: [],
  };
}

async function syncOnboardingToDb(
  userId: string,
  name: string,
  email: string,
  data: OnboardingData,
  incomeHistory: IncomePeriod[]
) {
  const base = {
    id: userId,
    name,
    email,
    occupation: data.occupation,
    main_income: data.mainIncome,
    onboarding_completed: data.completed,
  };

  const { error } = await supabase
    .from('profiles')
    .upsert({ ...base, income_history: incomeHistory }, { onConflict: 'id' });

  // Fallback sebelum migrasi 0006 dijalankan.
  if (error) {
    await supabase.from('profiles').upsert(base, { onConflict: 'id' });
  }
}

async function readOnboarding(email: string): Promise<OnboardingData> {
  try {
    const raw = await storage.getItem(onboardingKey(email));
    if (!raw) return EMPTY_ONBOARDING;
    return parseOnboarding(raw);
  } catch {
    return EMPTY_ONBOARDING;
  }
}

async function writeOnboarding(email: string, data: OnboardingData) {
  await storage.setItem(onboardingKey(email), JSON.stringify(data));
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [onboarding, setOnboardingState] = useState<OnboardingData>(EMPTY_ONBOARDING);
  const [onboardingReady, setOnboardingReady] = useState(false);

  useEffect(() => {
    let currentUserId: string | null = null;
    let mounted = true;

    function metadataDisplayName(user: User | undefined): string | null {
  const meta = user?.user_metadata as Record<string, unknown> | undefined;
  if (typeof meta?.full_name === 'string' && meta.full_name.trim()) return meta.full_name.trim();
  if (typeof meta?.name === 'string' && meta.name.trim()) return meta.name.trim();
  return null;
}

async function applySession(user?: User) {
      if (!mounted) return;
      if (!user?.id) {
        currentUserId = null;
        setUser(null);
        setOnboardingState(EMPTY_ONBOARDING);
        setOnboardingReady(true);
        return;
      }
      if (user.id === currentUserId) return;
      currentUserId = user.id;

      const [profile, localOnboard] = await Promise.all([
        fetchProfileRow(user.id),
        readOnboarding(user.email ?? ''),
      ]);
      if (!mounted) return;

      const fallbackEmail = user.email ?? profile?.email ?? '';

      let onboard: OnboardingData;
      if (profile) {
        onboard = {
          occupation: toOccupation(profile.occupation),
          mainIncome: typeof profile.main_income === 'number' ? profile.main_income : 0,
          sideIncome: 0,
          completed: profile.onboarding_completed === true,
        };
      } else if (localOnboard.completed) {
        // migrasi sekali: user lama yang datanya masih di AsyncStorage
        onboard = localOnboard;
        void syncOnboardingToDb(user.id, 'Pengguna', fallbackEmail, localOnboard, []);
      } else {
        onboard = localOnboard;
      }

      setUser({
        id: user.id,
        name: profile?.name ?? metadataDisplayName(user) ?? 'Pengguna',
        email: profile?.email ?? fallbackEmail,
        avatarUrl: profile?.avatar_url ?? null,
        incomeHistory: parseIncomeHistory(profile?.income_history),
      });
      setOnboardingState(onboard);
      setOnboardingReady(true);
    }

    async function restoreSession() {
      try {
        const { data } = await supabase.auth.getSession();
        await applySession(data.session?.user);
      } catch {
        // abaikan, state tetap dianggap siap agar tidak stuck
      } finally {
        if (mounted) {
          setIsReady(true);
          setOnboardingReady(true);
        }
      }
    }
    restoreSession();

    const { data: listener } = supabase.auth.onAuthStateChange(async (_event, session) => {
      await applySession(session?.user);
    });

    return () => {
      mounted = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  const signIn = useCallback(async (email: string, password: string): Promise<string | null> => {
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail) return 'Email wajib diisi.';
    if (!isEmailValid(cleanEmail)) return 'Format email tidak valid.';
    if (!password) return 'Password wajib diisi.';

    const { error } = await supabase.auth.signInWithPassword({
      email: cleanEmail,
      password,
    });

    if (error) {
      if (error.message.includes('Invalid login credentials')) {
        return 'Email atau password salah.';
      }
      return error.message;
    }
    return null;
  }, []);

  const signUp = useCallback(
    async (name: string, email: string, password: string): Promise<string | null> => {
      const cleanName = name.trim();
      const cleanEmail = email.trim().toLowerCase();
      if (!cleanName) return 'Nama lengkap wajib diisi.';
      if (cleanName.length < 3) return 'Nama minimal 3 karakter.';
      if (!cleanEmail) return 'Email wajib diisi.';
      if (!isEmailValid(cleanEmail)) return 'Format email tidak valid.';
      if (password.length < 8) return 'Password minimal 8 karakter.';

      const { error } = await supabase.auth.signUp({
        email: cleanEmail,
        password,
        options: { data: { name: cleanName } },
      });

      if (error) {
        const msg = (error.message ?? '').toLowerCase();
        const code = (error as { code?: string }).code;
        if (
          msg.includes('already registered') ||
          msg.includes('already exists') ||
          msg.includes('already in use') ||
          msg.includes('already been registered') ||
          msg.includes('user already') ||
          msg.includes('duplicate key') ||
          msg.includes('profiles_email') ||
          code === '23505' ||
          code === 'user_already_exists' ||
          code === 'email_exists'
        ) {
          return translate(getAppPrefs().locale, 'auth.errEmailTaken');
        }
        return error.message;
      }
      return null;
    },
    []
  );

  const updateName = useCallback(
    async (nextName: string): Promise<string | null> => {
      if (!user) {
        return translate(getAppPrefs().locale, 'profile.errLoginRequired');
      }
      const clean = nextName.trim();
      if (!clean) {
        return translate(getAppPrefs().locale, 'profile.errNameRequired');
      }
      if (clean.length < 3) {
        return translate(getAppPrefs().locale, 'profile.errNameMin');
      }

      const { error } = await supabase.auth.updateUser({ data: { name: clean } });
      if (error) {
        return translate(getAppPrefs().locale, 'profile.errUpdateFailed');
      }

      await supabase
        .from('profiles')
        .upsert({ id: user.id, name: clean, email: user.email }, { onConflict: 'id' });

      setUser((prev) => (prev ? { ...prev, name: clean } : prev));
      return null;
    },
    [user]
  );

  const updateAvatar = useCallback(
    async (url: string | null) => {
      if (!user) return;
      const { error } = await supabase
        .from('profiles')
        .upsert(
          { id: user.id, name: user.name, email: user.email, avatar_url: url },
          { onConflict: 'id' }
        );
      if (error) throw error;
      setUser((prev) => (prev ? { ...prev, avatarUrl: url } : prev));
    },
    [user]
  );

  const setOnboarding = useCallback(
    async (patch: Partial<OnboardingData>) => {
      if (!user) return;
      const next = { ...onboarding, ...patch };
      let nextHistory = user.incomeHistory;
      if (
        typeof patch.mainIncome === 'number' &&
        patch.mainIncome !== onboarding.mainIncome
      ) {
        nextHistory = addIncomePeriod(
          user.incomeHistory,
          monthKey(new Date()),
          patch.mainIncome,
          onboarding.mainIncome
        );
      }
      setOnboardingState(next);
      setUser((prev) => (prev ? { ...prev, incomeHistory: nextHistory } : prev));
      await writeOnboarding(user.email, next);
      await syncOnboardingToDb(user.id, user.name, user.email, next, nextHistory);
    },
    [user, onboarding]
  );

  const completeOnboarding = useCallback(async () => {
    if (!user) return;
    const next = { ...onboarding, completed: true };
    setOnboardingState(next);
    await writeOnboarding(user.email, next);
    await syncOnboardingToDb(user.id, user.name, user.email, next, user.incomeHistory);
  }, [user, onboarding]);

  const resetOnboarding = useCallback(async () => {
    if (!user) return;
    // Hanya reset profesi. Pendapatan, transaksi, dan saldo tetap aman.
    const next: OnboardingData = { ...onboarding, occupation: null, completed: true };
    setOnboardingState(next);
    await writeOnboarding(user.email, next);
    await syncOnboardingToDb(user.id, user.name, user.email, next, user.incomeHistory);
  }, [user, onboarding]);

  const signInWithProvider = useCallback(
    async (provider: SocialProvider): Promise<string | null> => {
      return signInWithProviderFlow(provider);
    },
    []
  );

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    setUser(null);
    setOnboardingState(EMPTY_ONBOARDING);
  }, []);

  const value = useMemo(
    () => ({
      user,
      isReady,
      onboarding,
      onboardingReady,
      setOnboarding,
      completeOnboarding,
      resetOnboarding,
      signIn,
      signUp,
      updateName,
      updateAvatar,
      signInWithProvider,
      signOut,
    }),
    [
      user,
      isReady,
      onboarding,
      onboardingReady,
      setOnboarding,
      completeOnboarding,
      resetOnboarding,
      signIn,
      signUp,
      updateName,
      updateAvatar,
      signInWithProvider,
      signOut,
    ]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}