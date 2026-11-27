import Constants from 'expo-constants';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { supabase } from '@/lib/supabase';
import { ensureNotificationChannel, getExpoProjectId } from '@/notifications/setup';
import type { AppNotification, NotificationType, SendPushInput } from '@/types/notifications';

interface NotificationRow {
  id: string;
  user_id: string;
  type: NotificationType;
  title: string;
  body: string;
  data: Record<string, unknown> | null;
  read: boolean;
  created_at: string;
}

function toNotification(row: NotificationRow): AppNotification {
  return {
    id: row.id,
    type: row.type === 'goal' || row.type === 'spending' ? row.type : 'budget',
    title: row.title,
    body: row.body,
    data: row.data ?? {},
    read: row.read,
    createdAt: new Date(row.created_at).getTime(),
  };
}

export async function registerPushToken(userId: string): Promise<string | null> {
  if (Platform.OS === 'web') return null;
  if (Platform.OS === 'android' && Constants.appOwnership === 'expo') {
    console.warn('Push tidak tersedia di Expo Go Android; dilewati.');
    return null;
  }
  await ensureNotificationChannel();

  const { status: existing } = await Notifications.getPermissionsAsync();
  let status = existing;
  if (status !== 'granted') {
    status = (await Notifications.requestPermissionsAsync()).status;
  }
  if (status !== 'granted') return null;

  const projectId = getExpoProjectId();
  if (!projectId) {
    console.warn('ProjectId EAS tidak ditemukan; push token dilewati.');
    return null;
  }

  try {
    const token = (await Notifications.getExpoPushTokenAsync({ projectId })).data;
    const { error } = await supabase.from('push_tokens').upsert(
      { user_id: userId, token, platform: Platform.OS },
      { onConflict: 'token' }
    );
    if (error) console.warn('Gagal menyimpan push token:', error.message);
    return token;
  } catch (e) {
    console.warn('Gagal mendapatkan push token:', e);
    return null;
  }
}

export async function syncNotificationPrefs(
  userId: string,
  prefs: { budgetReminder: boolean; goalReminder: boolean }
): Promise<void> {
  const { error } = await supabase
    .from('profiles')
    .update({
      budget_reminder: prefs.budgetReminder,
      goal_reminder: prefs.goalReminder,
    })
    .eq('id', userId);
  if (error) console.warn('Gagal menyinkronkan preferensi notifikasi:', error.message);
}

export async function sendPushNotification(
  userId: string,
  input: SendPushInput
): Promise<void> {
  const { error } = await supabase.functions.invoke('send-push', {
    body: {
      userId,
      type: input.type,
      title: input.title,
      body: input.body,
      dedupeKey: input.dedupeKey,
      url: input.url,
      data: {
        ...(input.data ?? {}),
        type: input.type,
        ...(input.url ? { url: input.url } : {}),
      },
    },
  });
  if (error) throw error;
}

export async function fetchNotifications(userId: string): Promise<AppNotification[]> {
  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(100);
  if (error) throw error;
  return (data ?? []).map((row) => toNotification(row as NotificationRow));
}

export async function markNotificationRead(id: string): Promise<void> {
  const { error } = await supabase.from('notifications').update({ read: true }).eq('id', id);
  if (error) console.warn('Gagal menandai notifikasi:', error.message);
}

export async function markAllNotificationsRead(userId: string): Promise<void> {
  const { error } = await supabase
    .from('notifications')
    .update({ read: true })
    .eq('user_id', userId)
    .eq('read', false);
  if (error) console.warn('Gagal menandai semua notifikasi:', error.message);
}
