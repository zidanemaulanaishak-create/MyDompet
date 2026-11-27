import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { translate, type Locale } from '@/i18n';
import { ensureNotificationChannel, NOTIFICATION_CHANNEL } from '@/notifications/setup';

export const SPENDING_REMINDER_SLOTS = [
  {
    slot: 'morning',
    identifier: 'mydompet-spending-morning',
    hour: 8,
    minute: 0,
    titleKey: 'home.notifSpendingMorningTitle',
    bodyKey: 'home.notifSpendingMorningBody',
  },
  {
    slot: 'evening',
    identifier: 'mydompet-spending-evening',
    hour: 20,
    minute: 0,
    titleKey: 'home.notifSpendingEveningTitle',
    bodyKey: 'home.notifSpendingEveningBody',
  },
] as const;

const DAY_MS = 24 * 60 * 60 * 1000;

export function canUseWebNotifications(): boolean {
  return Platform.OS === 'web' && typeof window !== 'undefined' && 'Notification' in window;
}

export async function ensureNativeNotificationPermission(): Promise<boolean> {
  if (Platform.OS === 'web') return false;
  await ensureNotificationChannel();
  const { status: existing } = await Notifications.getPermissionsAsync();
  if (existing === 'granted') return true;
  const { status } = await Notifications.requestPermissionsAsync();
  return status === 'granted';
}

export async function syncNativeSpendingReminders(
  enabled: boolean,
  locale: Locale
): Promise<void> {
  if (Platform.OS === 'web') return;

  const granted = await ensureNativeNotificationPermission();
  if (!granted) return;

  await Promise.all(
    SPENDING_REMINDER_SLOTS.map((item) =>
      Notifications.cancelScheduledNotificationAsync(item.identifier)
    )
  );

  if (!enabled) return;

  for (const item of SPENDING_REMINDER_SLOTS) {
    await Notifications.scheduleNotificationAsync({
      identifier: item.identifier,
      content: {
        title: translate(locale, item.titleKey),
        body: translate(locale, item.bodyKey),
        sound: 'default',
        data: { type: 'spending', slot: item.slot, url: '/home' },
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        hour: item.hour,
        minute: item.minute,
        channelId: NOTIFICATION_CHANNEL,
      },
    });
  }
}

export async function requestWebNotificationPermission(): Promise<boolean> {
  if (!canUseWebNotifications()) return false;
  try {
    if (Notification.permission === 'granted') return true;
    const result = await Notification.requestPermission();
    return result === 'granted';
  } catch {
    return false;
  }
}

export function showWebNotification(opts: {
  title: string;
  body: string;
  id?: string;
  url?: string;
}): void {
  if (!canUseWebNotifications() || Notification.permission !== 'granted') return;
  const notification = new Notification(opts.title, {
    body: opts.body,
    tag: opts.id,
  });
  notification.onclick = () => {
    window.focus();
    notification.close();
    if (opts.url?.startsWith('/')) window.location.assign(opts.url);
  };
}

function msUntil(hour: number, minute: number): number {
  const now = new Date();
  const next = new Date(now);
  next.setHours(hour, minute, 0, 0);
  if (next.getTime() <= now.getTime()) next.setDate(next.getDate() + 1);
  return next.getTime() - now.getTime();
}

export function startWebSpendingReminders(locale: Locale, enabled: boolean): () => void {
  if (!enabled || !canUseWebNotifications()) return () => undefined;

  let disposed = false;
  const timeouts: number[] = [];
  const intervals: number[] = [];

  void requestWebNotificationPermission().then((granted) => {
    if (!granted || disposed) return;
    for (const item of SPENDING_REMINDER_SLOTS) {
      const show = () =>
        showWebNotification({
          title: translate(locale, item.titleKey),
          body: translate(locale, item.bodyKey),
          id: item.identifier,
          url: '/home',
        });
      timeouts.push(
        window.setTimeout(() => {
          if (disposed) return;
          show();
          intervals.push(window.setInterval(show, DAY_MS));
        }, msUntil(item.hour, item.minute))
      );
    }
  });

  return () => {
    disposed = true;
    for (const id of timeouts) window.clearTimeout(id);
    for (const id of intervals) window.clearInterval(id);
  };
}

export async function presentTestNotification(opts: {
  title: string;
  body: string;
  id: string;
  url: string;
  data: Record<string, unknown>;
}): Promise<void> {
  if (Platform.OS === 'web') {
    const granted = await requestWebNotificationPermission();
    if (granted) {
      showWebNotification({ title: opts.title, body: opts.body, id: opts.id, url: opts.url });
    }
    return;
  }

  const granted = await ensureNativeNotificationPermission();
  if (!granted) return;
  await Notifications.scheduleNotificationAsync({
    content: {
      title: opts.title,
      body: opts.body,
      sound: 'default',
      data: { ...opts.data, id: opts.id, url: opts.url },
    },
    trigger: null,
  });
}
