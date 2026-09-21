import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { storage } from '@/context/storage';
import { ThemeMode } from '@/constants/colors';

interface ThemeContextValue {
  mode: ThemeMode;
  isDark: boolean;
  isReady: boolean;
  setMode: (mode: ThemeMode) => Promise<void>;
  toggleTheme: () => Promise<void>;
}

const THEME_KEY = 'mydompet_theme';

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
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    async function restoreTheme() {
      try {
        const saved = await storage.getItem(THEME_KEY);
        if (saved === 'dark' || saved === 'light') {
          setModeState(saved);
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

  const value = useMemo<ThemeContextValue>(
    () => ({
      mode,
      isDark: mode === 'dark',
      isReady,
      setMode,
      toggleTheme,
    }),
    [mode, isReady, setMode, toggleTheme]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}