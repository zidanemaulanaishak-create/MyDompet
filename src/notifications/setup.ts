import Constants from 'expo-constants';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import type { AppNotification, NotificationType } from '@/types/notifications';

export const NOTIFICATION_CHANNEL = 'mydompet-default';

if (Platform.OS !== 'web') {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
    }),
  });
}

export async function ensureNotificationChannel(): Promise<void> {
  if (Platform.OS !== 'android') return;
  try {
    await Notifications.setNotificationChannelAsync(NOTIFICATION_CHANNEL, {
      name: 'MyDompet',
      description: 'Pengingat anggaran dan target keuangan',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#1A42BA',
    });
  } catch (e) {
    console.warn('Gagal membuat channel notifikasi:', e);
  }
}

export function getExpoProjectId(): string | null {
  const config = Constants.expoConfig as {
    extra?: { eas?: { projectId?: string } };
  } | null;
  return config?.extra?.eas?.projectId ?? process.env.EXPO_PUBLIC_EAS_PROJECT_ID ?? null;
}

export function toAppNotification(
  notification: Notifications.Notification
): AppNotification {
  const data = (notification.request.content.data ?? {}) as Record<string, unknown>;
  const type: NotificationType =
    data.type === 'budget' || data.type === 'goal' || data.type === 'spending'
      ? data.type
      : 'budget';
  const dataId = typeof data.id === 'string' && data.id ? data.id : '';
  const slot = typeof data.slot === 'string' && data.slot ? data.slot : 'daily';
  const day = new Date(notification.date || Date.now()).toISOString().slice(0, 10);
  const id =
    dataId ||
    (type === 'spending' ? `spending-${slot}-${day}` : notification.request.identifier);
  return {
    id: id || String(notification.date),
    type,
    title: notification.request.content.title ?? '',
    body: notification.request.content.body ?? '',
    data,
    read: false,
    createdAt: notification.date || Date.now(),
  };
}
