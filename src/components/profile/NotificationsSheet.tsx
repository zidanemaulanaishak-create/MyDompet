import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Switch,
} from 'react-native';
import { Iconify } from 'react-native-iconify';
import { useTheme } from '@/context/theme-context';
import { getThemeColors } from '@/constants/colors';
import { useI18n } from '@/i18n';
import { useSettings, type NotificationPrefs } from '@/context/settings-context';

interface Props {
  visible: boolean;
  onClose: () => void;
}

interface Option {
  key: keyof NotificationPrefs;
  icon: string;
  title: string;
  description: string;
}

const OPTIONS: Option[] = [
  {
    key: 'budgetReminder',
    icon: 'ph:wallet-bold',
    title: 'profile.notifBudget',
    description: 'profile.notifBudgetDesc',
  },
  {
    key: 'goalReminder',
    icon: 'ph:target-bold',
    title: 'profile.notifGoal',
    description: 'profile.notifGoalDesc',
  },
 
];

export default function NotificationsSheet({ visible, onClose }: Props) {
  const { isDark } = useTheme();
  const palette = getThemeColors(isDark ? 'dark' : 'light');
  const { t } = useI18n();
  const { notifications, setNotifications } = useSettings();

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <TouchableOpacity style={styles.overlay} onPress={onClose} activeOpacity={1}>
        <View style={[styles.sheet, { backgroundColor: palette.card }]}>
          <View style={[styles.handle, { backgroundColor: isDark ? palette.divider : '#E2E8F0' }]} />
          <View style={styles.header}>
            <Text style={[styles.title, { color: palette.textDark }]}>
              {t('profile.notificationsSheetTitle')}
            </Text>
            <TouchableOpacity onPress={onClose} hitSlop={8}>
              <Iconify icon="ph:x-bold" size={22} color={palette.textMuted} />
            </TouchableOpacity>
          </View>

          {OPTIONS.map((opt) => {
            const active = notifications[opt.key];
            return (
              <View
                key={opt.key}
                style={[styles.row, { borderBottomColor: isDark ? palette.divider : '#F1F5F9' }]}
              >
                <View
                  style={[styles.iconBox, { backgroundColor: isDark ? '#172B4D' : '#E8F0FE' }]}
                >
                  <Iconify icon={opt.icon} size={20} color={palette.primary} />
                </View>
                <View style={styles.rowText}>
                  <Text style={[styles.rowTitle, { color: palette.textDark }]}>
                    {t(opt.title)}
                  </Text>
                  <Text style={[styles.rowDesc, { color: palette.textMuted }]}>
                    {t(opt.description)}
                  </Text>
                </View>
                <Switch
                  value={active}
                  onValueChange={(v) => void setNotifications({ [opt.key]: v })}
                  trackColor={{ false: isDark ? palette.divider : '#E2E8F0', true: palette.primary }}
                  thumbColor="#FFFFFF"
                  ios_backgroundColor={isDark ? palette.divider : '#E2E8F0'}
                />
              </View>
            );
          })}
        </View>
      </TouchableOpacity>
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
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 40,
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
    marginBottom: 10,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: 12,
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
    fontSize: 16,
    fontWeight: '700',
  },
  rowDesc: {
    fontSize: 13,
    marginTop: 2,
    lineHeight: 18,
  },
});
