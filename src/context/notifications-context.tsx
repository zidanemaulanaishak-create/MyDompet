import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { useAuth } from '@/context/auth-context';
import { useSettings } from '@/context/settings-context';
import { useI18n } from '@/i18n';
import { presentTestNotification } from '@/notifications/spendingReminder';
import {
  fetchNotifications,
  markAllNotificationsRead,
  markNotificationRead,
  registerPushToken,
  sendPushNotification,
  syncNotificationPrefs,
} from '@/services/notifications';
import type { AppNotification, NotificationType } from '@/types/notifications';

interface NotificationsContextValue {
  notifications: AppNotification[];
  unreadCount: number;
  refresh: () => Promise<void>;
  markRead: (id: string) => Promise<void>;
  markAllRead: () => Promise<void>;
  addLocal: (notification: AppNotification) => void;
  sendTest: (type: NotificationType) => Promise<void>;
}

const NotificationsContext = createContext<NotificationsContextValue | null>(null);

function mergeNotifications(
  current: AppNotification[],
  incoming: AppNotification[]
): AppNotification[] {
  const byId = new Map<string, AppNotification>();
  for (const item of current) byId.set(item.id, item);
  for (const item of incoming) byId.set(item.id, item);
  return Array.from(byId.values()).sort((a, b) => b.createdAt - a.createdAt);
}

export function NotificationsProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const { notifications: prefs, isReady: settingsReady } = useSettings();
  const { t } = useI18n();
  const [items, setItems] = useState<AppNotification[]>([]);

  const notifications = useMemo(
    () =>
      (user ? items : [])
        .filter((item) =>
          item.type === 'budget' ? prefs.budgetReminder : prefs.goalReminder
        )
        .sort((a, b) => b.createdAt - a.createdAt),
    [user, items, prefs.budgetReminder, prefs.goalReminder]
  );

  const unreadCount = useMemo(
    () => notifications.filter((item) => !item.read).length,
    [notifications]
  );

  const refresh = useCallback(async () => {
    if (!user) {
      setItems([]);
      return;
    }
    try {
      const rows = await fetchNotifications(user.id);
      setItems((prev) => mergeNotifications(prev, rows));
    } catch (e) {
      console.warn('Gagal memuat notifikasi:', e);
    }
  }, [user]);

  useEffect(() => {
    if (!user) return;
    let active = true;
    (async () => {
      try {
        const rows = await fetchNotifications(user.id);
        if (active) setItems(rows);
      } catch (e) {
        console.warn('Gagal memuat notifikasi:', e);
      }
    })();
    return () => {
      active = false;
    };
  }, [user]);

  useEffect(() => {
    if (!user || !settingsReady) return;
    void syncNotificationPrefs(user.id, {
      budgetReminder: prefs.budgetReminder,
      goalReminder: prefs.goalReminder,
    });
  }, [user, settingsReady, prefs.budgetReminder, prefs.goalReminder]);

  useEffect(() => {
    if (!user) return;
    void registerPushToken(user.id);
  }, [user]);

  useEffect(() => {
    if (Platform.OS === 'web') return;
    void Notifications.setBadgeCountAsync(unreadCount).catch(() => undefined);
  }, [unreadCount]);

  const markRead = useCallback(async (id: string) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, read: true } : item))
    );
    await markNotificationRead(id);
  }, []);

  const markAllRead = useCallback(async () => {
    if (!user) return;
    setItems((prev) => prev.map((item) => ({ ...item, read: true })));
    await markAllNotificationsRead(user.id);
  }, [user]);

  const addLocal = useCallback((notification: AppNotification) => {
    setItems((prev) => mergeNotifications(prev, [notification]));
  }, []);

  const sendTest = useCallback(
    async (type: NotificationType) => {
      if (!user) return;
      const id = `test-${type}-${Date.now()}`;
      const title = t('home.notifTestTitle');
      const body =
        type === 'budget'
          ? t('home.notifTestBudget')
          : type === 'goal'
            ? t('home.notifTestGoal')
            : t('home.notifTestSpendingBody');
      const url = type === 'budget' ? '/budget' : type === 'goal' ? '/goals' : '/home';
      const data = {
        test: true,
        type,
        ...(type === 'spending' ? { slot: 'test' } : {}),
      };

      await presentTestNotification({ title, body, id, url, data });
      addLocal({
        id,
        type,
        title,
        body,
        data: { ...data, url },
        read: false,
        createdAt: Date.now(),
      });

      if (type !== 'spending') {
        void sendPushNotification(user.id, {
          type,
          title,
          body,
          dedupeKey: id,
          url,
          data,
        }).catch(() => undefined);
      }
      await refresh();
    },
    [user, t, addLocal, refresh]
  );

  const value = useMemo<NotificationsContextValue>(
    () => ({
      notifications,
      unreadCount,
      refresh,
      markRead,
      markAllRead,
      addLocal,
      sendTest,
    }),
    [notifications, unreadCount, refresh, markRead, markAllRead, addLocal, sendTest]
  );

  return (
    <NotificationsContext.Provider value={value}>{children}</NotificationsContext.Provider>
  );
}

export function useNotifications(): NotificationsContextValue {
  const ctx = useContext(NotificationsContext);
  if (!ctx) {
    throw new Error('useNotifications harus dipakai di dalam NotificationsProvider.');
  }
  return ctx;
}
