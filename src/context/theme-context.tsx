import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { storage } from '@/context/storage';
import {
  DEFAULT_ACCENT,
  ThemeMode,
  type AccentId,
} from '@/constants/colors';

interface ThemeContextValue {
  mode: ThemeMode;
  isDark: boolean;
  isReady: boolean;
  accent: AccentId;
  setMode: (mode: ThemeMode) => Promise<void>;
  toggleTheme: () => Promise<void>;
  setAccent: (accent: AccentId) => Promise<void>;
}

const THEME_KEY = 'mydompet_theme';
const ACCENT_KEY = 'mydompet_accent';

const ACCENT_IDS: AccentId[] = ['blue', 'green', 'purple', 'orange', 'teal', 'red'];

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return ctx;
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [mode, setModeState] = useState<ThemeMode>('light');
  const [accent, setAccentState] = useState<AccentId>(DEFAULT_ACCENT);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    async function restoreTheme() {
      try {
        const [savedMode, savedAccent] = await Promise.all([
          storage.getItem(THEME_KEY),
          storage.getItem(ACCENT_KEY),
        ]);
        if (savedMode === 'dark' || savedMode === 'light') {
          setModeState(savedMode);
        }
        if (savedAccent && ACCENT_IDS.includes(savedAccent as AccentId)) {
          setAccentState(savedAccent as AccentId);
        }
      } catch (e) {
        console.warn('Gagal memuat tema:', e);
      } finally {
        setIsReady(true);
      }
    }
    restoreTheme();
  }, []);

  const setMode = useCallback(async (next: ThemeMode) => {
    setModeState(next);
    try {
      await storage.setItem(THEME_KEY, next);
    } catch (e) {
      console.warn('Gagal menyimpan tema:', e);
    }
  }, []);

  const toggleTheme = useCallback(async () => {
    const next: ThemeMode = mode === 'dark' ? 'light' : 'dark';
    setModeState(next);
    try {
      await storage.setItem(THEME_KEY, next);
    } catch (e) {
      console.warn('Gagal menyimpan tema:', e);
    }
  }, [mode]);

  const setAccent = useCallback(async (next: AccentId) => {
    setAccentState(next);
    try {
      await storage.setItem(ACCENT_KEY, next);
    } catch (e) {
      console.warn('Gagal menyimpan warna:', e);
    }
  }, []);

  const value = useMemo<ThemeContextValue>(
    () => ({
      mode,
      isDark: mode === 'dark',
      isReady,
      accent,
      setMode,
      toggleTheme,
      setAccent,
    }),
    [mode, isReady, accent, setMode, toggleTheme, setAccent]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}