import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
} from 'react-native';
import { Iconify } from 'react-native-iconify';
import { getThemeColors } from '@/constants/colors';
import { useTheme } from '@/context/theme-context';
import { useI18n } from '@/i18n';
import type { Locale } from '@/i18n';

interface Props {
  visible: boolean;
  current: Locale;
  onClose: () => void;
  onSelect: (lang: Locale) => void;
}

const OPTIONS: { key: Locale; labelKey: string; short: string }[] = [
  { key: 'id', labelKey: 'profile.langIndonesian', short: 'ID' },
  { key: 'en', labelKey: 'profile.langEnglish', short: 'EN' },
];

export default function LanguageSheet({
  visible,
  current,
  onClose,
  onSelect,
}: Props) {
  const { isDark } = useTheme();
  const palette = getThemeColors(isDark ? 'dark' : 'light');
  const { t } = useI18n();

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <TouchableOpacity
        style={styles.overlay}
        onPress={onClose}
        activeOpacity={1}
      >
        <View
          style={[styles.sheet, { backgroundColor: palette.card }]}
        >
          <View style={[styles.handle, { backgroundColor: isDark ? palette.divider : '#E2E8F0' }]} />
          <View style={styles.header}>
            <Text style={[styles.title, { color: palette.textDark }]}>
              {t('profile.languageSheetTitle')}
            </Text>
            <TouchableOpacity onPress={onClose} hitSlop={8}>
              <Iconify icon="ph:x-bold" size={22} color={palette.textMuted} />
            </TouchableOpacity>
          </View>

          {OPTIONS.map((opt) => {
            const active = opt.key === current;
            return (
              <TouchableOpacity
                key={opt.key}
                style={[
                  styles.row,
                  { borderBottomColor: isDark ? palette.divider : '#F1F5F9' },
                  active && styles.rowActive,
                ]}
                activeOpacity={0.7}
                onPress={() => onSelect(opt.key)}
              >
                <View
                  style={[styles.badge, { backgroundColor: isDark ? '#172B4D' : '#E8F0FE' }]}
                >
                  <Text style={[styles.badgeText, { color: palette.primary }]}>
                    {opt.short}
                  </Text>
                </View>
                <Text style={[styles.rowLabel, { color: palette.textDark }]}>
                  {t(opt.labelKey)}
                </Text>
                {active && (
                  <Iconify
                    icon="ph:check-circle-fill"
                    size={22}
                    color={palette.primary}
                  />
                )}
              </TouchableOpacity>
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
  },
  rowActive: {
    opacity: 1,
  },
  badge: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  badgeText: {
    fontSize: 13,
    fontWeight: '800',
  },
  rowLabel: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
  },
});