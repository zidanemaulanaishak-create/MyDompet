import React, { useMemo } from 'react';
import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Iconify } from 'react-native-iconify';
import { useRouter } from 'expo-router';
import AnimatedPressable from '@/components/ui/AnimatedPressable';
import AnimatedSheetBackdrop from '@/components/ui/AnimatedSheetBackdrop';
import { getThemeColors } from '@/constants/colors';
import { useNotifications } from '@/context/notifications-context';
import { useTheme } from '@/context/theme-context';
import { useI18n } from '@/i18n';
import type { AppNotification, NotificationType } from '@/types/notifications';

interface Props {
  visible: boolean;
  onClose: () => void;
}

function relativeTime(timestamp: number, locale: 'id' | 'en'): string {
  const diff = Math.max(0, Date.now() - timestamp);
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return locale === 'id' ? 'Baru saja' : 'Just now';
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d`;
  return new Date(timestamp).toLocaleDateString(locale === 'id' ? 'id-ID' : 'en-US', {
    day: 'numeric',
    month: 'short',
  });
}

export default function NotificationsCenterSheet({ visible, onClose }: Props) {
  const router = useRouter();
  const { isDark, accent } = useTheme();
  const palette = getThemeColors(isDark ? 'dark' : 'light', accent);
  const { t, locale } = useI18n();
  const { notifications, unreadCount, markRead, markAllRead, sendTest } =
    useNotifications();

  const { unread, read } = useMemo(
    () => ({
      unread: notifications.filter((item) => !item.read),
      read: notifications.filter((item) => item.read),
    }),
    [notifications]
  );

  const handlePress = (item: AppNotification) => {
    void markRead(item.id);
    onClose();
    const url = item.data.url;
    if (typeof url === 'string' && url.startsWith('/')) {
      router.push(url as any);
    }
  };

  const handleTest = (type: NotificationType) => {
    void sendTest(type);
  };

  const renderRow = (item: AppNotification) => {
    const meta =
      item.type === 'budget'
        ? { icon: 'ph:wallet-bold', color: palette.primary, background: palette.chipBlue }
        : item.type === 'goal'
          ? { icon: 'ph:target-bold', color: palette.orange, background: palette.orange + '22' }
          : { icon: 'ph:clock-bold', color: palette.primary, background: palette.chipBlue };

    return (
      <AnimatedPressable
        key={item.id}
        activeOpacity={0.75}
        onPress={() => handlePress(item)}
        style={[styles.row, { borderBottomColor: isDark ? palette.divider : '#F1F5F9' }]}
      >
        <View style={[styles.iconBox, { backgroundColor: meta.background }]}>
          <Iconify icon={meta.icon} size={20} color={meta.color} />
        </View>
        <View style={styles.rowText}>
          <Text style={[styles.rowTitle, { color: palette.textDark }]} numberOfLines={1}>
            {item.title}
          </Text>
          <Text style={[styles.rowBody, { color: palette.textMuted }]} numberOfLines={2}>
            {item.body}
          </Text>
        </View>
        <View style={styles.rowMeta}>
          {!item.read ? <View style={[styles.dot, { backgroundColor: palette.primary }]} /> : null}
          <Text style={[styles.time, { color: palette.textMuted }]}>
            {relativeTime(item.createdAt, locale)}
          </Text>
        </View>
      </AnimatedPressable>
    );
  };

  const renderSection = (title: string, items: AppNotification[]) => {
    if (items.length === 0) return null;
    return (
      <View>
        <Text style={[styles.sectionTitle, { color: palette.textMuted }]}>{title}</Text>
        {items.map(renderRow)}
      </View>
    );
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <AnimatedSheetBackdrop style={styles.overlay} onPress={onClose}>
        <View style={[styles.sheet, { backgroundColor: palette.card }]}>
          <View style={[styles.handle, { backgroundColor: isDark ? palette.divider : '#E2E8F0' }]} />
          <View style={styles.header}>
            <View style={styles.headerTitle}>
              <Iconify icon="ph:bell-bold" size={22} color={palette.primary} />
              <Text style={[styles.title, { color: palette.textDark }]}>
                {t('home.notifTitle')}
              </Text>
            </View>
            <TouchableOpacity onPress={onClose} hitSlop={8}>
              <Iconify icon="ph:x-bold" size={22} color={palette.textMuted} />
            </TouchableOpacity>
          </View>

          <View style={styles.actions}>
            <TouchableOpacity
              disabled={unreadCount === 0}
              onPress={() => void markAllRead()}
              style={[styles.actionButton, { backgroundColor: palette.chipBlue }]}
            >
              <Text style={[styles.actionText, { color: palette.primary }]}>
                {t('home.notifMarkAll')}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                onClose();
                router.push('/profile' as any);
              }}
              style={[styles.actionButton, { backgroundColor: palette.chipBlue }]}
            >
              <Text style={[styles.actionText, { color: palette.primary }]}>
                {t('home.notifSettings')}
              </Text>
            </TouchableOpacity>
          </View>

          {notifications.length === 0 ? (
            <View style={styles.empty}>
              <Iconify icon="ph:bell-slash-bold" size={40} color={palette.textMuted} />
              <Text style={[styles.emptyTitle, { color: palette.textDark }]}>
                {t('home.notifEmpty')}
              </Text>
              <Text style={[styles.emptyBody, { color: palette.textMuted }]}>
                {t('home.notifEmptyDesc')}
              </Text>
            </View>
          ) : (
            <ScrollView style={styles.list} showsVerticalScrollIndicator={false}>
              {renderSection(t('home.notifNew'), unread)}
              {renderSection(t('home.notifOld'), read)}
              <View style={styles.testRow}>
                <TouchableOpacity
                  onPress={() => handleTest('budget')}
                  style={[styles.testButton, { borderColor: palette.border }]}
                >
                  <Text style={[styles.testText, { color: palette.textMuted }]}>
                    {t('home.notifTestBudget')}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => handleTest('goal')}
                  style={[styles.testButton, { borderColor: palette.border }]}
                >
                  <Text style={[styles.testText, { color: palette.textMuted }]}>
                    {t('home.notifTestGoal')}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => handleTest('spending')}
                  style={[styles.testButton, { borderColor: palette.border }]}
                >
                  <Text style={[styles.testText, { color: palette.textMuted }]}>
                    {t('home.notifTestSpending')}
                  </Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          )}
        </View>
      </AnimatedSheetBackdrop>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(2,8,23,0.5)',
  },
  sheet: {
    maxHeight: '82%',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 32,
  },
  handle: {
    width: 40,
    height: 5,
    borderRadius: 3,
    alignSelf: 'center',
    marginBottom: 14,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 14,
    marginBottom: 6,
  },
  actionButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
  },
  actionText: {
    fontSize: 12,
    fontWeight: '700',
  },
  list: {
    flexGrow: 0,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    marginTop: 14,
    marginBottom: 4,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowText: {
    flex: 1,
  },
  rowTitle: {
    fontSize: 15,
    fontWeight: '700',
  },
  rowBody: {
    fontSize: 13,
    marginTop: 2,
    lineHeight: 18,
  },
  rowMeta: {
    alignItems: 'flex-end',
    gap: 6,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  time: {
    fontSize: 11,
  },
  empty: {
    alignItems: 'center',
    paddingVertical: 48,
    gap: 10,
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: '800',
  },
  emptyBody: {
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 19,
    paddingHorizontal: 24,
  },
  testRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 18,
  },
  testButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: 'center',
  },
  testText: {
    fontSize: 12,
    fontWeight: '600',
  },
});
