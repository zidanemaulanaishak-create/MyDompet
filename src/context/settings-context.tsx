import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { storage } from '@/context/storage';
import type { AppLocale } from '@/utils/appPrefs';
import { setAppPrefs } from '@/utils/appPrefs';

export interface NotificationPrefs {
  budgetReminder: boolean;
  goalReminder: boolean;
  promo: boolean;
}

export const EMPTY_NOTIFICATION_PREFS: NotificationPrefs = {
  budgetReminder: false,
  goalReminder: false,
  promo: false,
};

interface SettingsContextValue {
  language: AppLocale;
  isReady: boolean;
  setLanguage: (lang: AppLocale) => Promise<void>;
  currencyCode: string;
  setCurrencyCode: (code: string) => Promise<void>;
  notifications: NotificationPrefs;
  setNotifications: (patch: Partial<NotificationPrefs>) => Promise<void>;
}

const LANGUAGE_KEY = 'mydompet_lang';
const CURRENCY_KEY = 'mydompet_currency';
const NOTIFICATIONS_KEY = 'mydompet_notifications';

const SettingsContext = createContext<SettingsContextValue | null>(null);

function parseNotificationPrefs(raw: string | null): NotificationPrefs {
  if (!raw) return EMPTY_NOTIFICATION_PREFS;
  try {
    const parsed = JSON.parse(raw) as Partial<NotificationPrefs>;
    return {
      budgetReminder: parsed.budgetReminder === true,
      goalReminder: parsed.goalReminder === true,
      promo: parsed.promo === true,
    };
  } catch {
    return EMPTY_NOTIFICATION_PREFS;
  }
}

export function useSettings(): SettingsContextValue {
  const ctx = useContext(SettingsContext);
  if (!ctx) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return ctx;
}

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<AppLocale>('id');
  const [currencyCode, setCurrencyCodeState] = useState('IDR');
  const [notifications, setNotificationsState] = useState<NotificationPrefs>(
    EMPTY_NOTIFICATION_PREFS
  );
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    async function restoreAll() {
      try {
        const [lang, currency, notif] = await Promise.all([
          storage.getItem(LANGUAGE_KEY),
          storage.getItem(CURRENCY_KEY),
          storage.getItem(NOTIFICATIONS_KEY),
        ]);
        const resolvedLang: AppLocale = lang === 'en' ? 'en' : 'id';
        const resolvedCurrency = currency || 'IDR';
        const resolvedNotif = parseNotificationPrefs(notif);
        setLanguageState(resolvedLang);
        setCurrencyCodeState(resolvedCurrency);
        setNotificationsState(resolvedNotif);
        setAppPrefs({ locale: resolvedLang, currencyCode: resolvedCurrency });
      } catch (e) {
        console.warn('Gagal memuat pengaturan:', e);
      } finally {
        setIsReady(true);
      }
    }
    restoreAll();
  }, []);

  const setLanguage = useCallback(async (lang: AppLocale) => {
    setLanguageState(lang);
    setAppPrefs({ locale: lang });
    try {
      await storage.setItem(LANGUAGE_KEY, lang);
    } catch (e) {
      console.warn('Gagal menyimpan bahasa:', e);
    }
  }, []);

  const setCurrencyCode = useCallback(async (code: string) => {
    const next = code.toUpperCase();
    setCurrencyCodeState(next);
    setAppPrefs({ currencyCode: next });
    try {
      await storage.setItem(CURRENCY_KEY, next);
    } catch (e) {
      console.warn('Gagal menyimpan mata uang:', e);
    }
  }, []);

  const setNotifications = useCallback(
    async (patch: Partial<NotificationPrefs>) => {
      setNotificationsState((prev) => {
        const next = { ...prev, ...patch };
        void storage
          .setItem(NOTIFICATIONS_KEY, JSON.stringify(next))
          .catch((e) => console.warn('Gagal menyimpan notifikasi:', e));
        return next;
      });
    },
    []
  );

  const value = useMemo<SettingsContextValue>(
    () => ({
      language,
      isReady,
      setLanguage,
      currencyCode,
      setCurrencyCode,
      notifications,
      setNotifications,
    }),
    [language, isReady, setLanguage, currencyCode, setCurrencyCode, notifications, setNotifications]
  );

  return (
    <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>
  );
}