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

export interface AuthUser {
  id: string;
  name: string;
  email: string;
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
}

function toOccupation(value: string | null): Occupation | null {
  return value === 'pekerja' || value === 'pelajar' || value === 'mahasiswa' ? value : null;
}

async function fetchProfileRow(userId: string): Promise<ProfileRow | null> {
  const { data } = await supabase
    .from('profiles')
    .select('name, email, occupation, main_income, onboarding_completed')
    .eq('id', userId)
    .maybeSingle();

  return data ?? null;
}

async function syncOnboardingToDb(
  userId: string,
  name: string,
  email: string,
  data: OnboardingData
) {
  await supabase.from('profiles').upsert(
    {
      id: userId,
      name,
      email,
      occupation: data.occupation,
      main_income: data.mainIncome,
      onboarding_completed: data.completed,
    },
    { onConflict: 'id' }
  );
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
        void syncOnboardingToDb(user.id, 'Pengguna', fallbackEmail, localOnboard);
      } else {
        onboard = localOnboard;
      }

      setUser({
        id: user.id,
        name: profile?.name ?? metadataDisplayName(user) ?? 'Pengguna',
        email: profile?.email ?? fallbackEmail,
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
        if (error.message.includes('already registered')) {
          return 'Email sudah terdaftar. Silakan masuk.';
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

  const setOnboarding = useCallback(
    async (patch: Partial<OnboardingData>) => {
      if (!user) return;
      setOnboardingState((prev) => {
        const next = { ...prev, ...patch };
        void writeOnboarding(user.email, next);
        void syncOnboardingToDb(user.id, user.name, user.email, next);
        return next;
      });
    },
    [user]
  );

  const completeOnboarding = useCallback(async () => {
    if (!user) return;
    setOnboardingState((prev) => {
      const next = { ...prev, completed: true };
      void writeOnboarding(user.email, next);
      void syncOnboardingToDb(user.id, user.name, user.email, next);
      return next;
    });
  }, [user]);

  const resetOnboarding = useCallback(async () => {
    if (!user) return;
    setOnboardingState(EMPTY_ONBOARDING);
    await writeOnboarding(user.email, EMPTY_ONBOARDING);
    await syncOnboardingToDb(user.id, user.name, user.email, EMPTY_ONBOARDING);
  }, [user]);

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
      signInWithProvider,
      signOut,
    ]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}