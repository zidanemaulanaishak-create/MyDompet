import { useEffect } from 'react';
import { Platform } from 'react-native';
import { useAuth } from '@/context/auth-context';
import { useSettings } from '@/context/settings-context';
import { useI18n } from '@/i18n';
import {
  startWebSpendingReminders,
  syncNativeSpendingReminders,
} from '@/notifications/spendingReminder';

export function useDailySpendingReminder() {
  const { user } = useAuth();
  const { notifications, isReady } = useSettings();
  const { locale } = useI18n();
  const enabled = isReady && !!user && notifications.spendingReminder;

  useEffect(() => {
    if (!isReady) return undefined;

    if (Platform.OS === 'web') {
      return startWebSpendingReminders(locale, enabled);
    }

    void syncNativeSpendingReminders(enabled, locale).catch((e) => {
      console.warn('Gagal menjadwalkan pengingat pengeluaran:', e);
    });
    return undefined;
  }, [enabled, isReady, locale]);
}
