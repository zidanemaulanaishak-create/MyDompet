import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ScrollView,
  Alert,
} from 'react-native';
import { Iconify } from 'react-native-iconify';
import { useTheme } from '@/context/theme-context';
import { getThemeColors } from '@/constants/colors';
import { useI18n } from '@/i18n';
import { useSettings } from '@/context/settings-context';
import { useAuth } from '@/context/auth-context';
import { CURRENCIES } from '@/constants/currencies';

interface Props {
  visible: boolean;
  onClose: () => void;
}

export default function AccountSettingsSheet({ visible, onClose }: Props) {
  const { isDark } = useTheme();
  const palette = getThemeColors(isDark ? 'dark' : 'light');
  const { t } = useI18n();
  const { currencyCode, setCurrencyCode } = useSettings();
  const { user, resetOnboarding } = useAuth();

  const handleReset = () => {
    Alert.alert(t('profile.resetFinanceTitle'), t('profile.resetFinanceMsg'), [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('common.reset'),
        style: 'destructive',
        onPress: async () => {
          await resetOnboarding();
          onClose();
        },
      },
    ]);
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <TouchableOpacity style={styles.overlay} onPress={onClose} activeOpacity={1}>
        <View style={[styles.sheet, { backgroundColor: palette.card }]}>
          <View style={[styles.handle, { backgroundColor: isDark ? palette.divider : '#E2E8F0' }]} />
          <View style={styles.header}>
            <Text style={[styles.title, { color: palette.textDark }]}>
              {t('profile.accountSettingsSheetTitle')}
            </Text>
            <TouchableOpacity onPress={onClose} hitSlop={8}>
              <Iconify icon="ph:x-bold" size={22} color={palette.textMuted} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
            <Text style={[styles.label, { color: palette.textMuted }]}>
              {t('profile.emailLabel')}
            </Text>
            <View
              style={[
                styles.infoBox,
                { borderColor: palette.border, backgroundColor: palette.inputBg },
              ]}
            >
              <Iconify icon="ph:envelope-simple-bold" size={18} color={palette.textMuted} />
              <Text style={[styles.infoText, { color: palette.textDark }]}>
                {user?.email ?? '—'}
              </Text>
            </View>

            <Text style={[styles.label, { color: palette.textMuted }]}>
              {t('profile.currency')}
            </Text>
            <View style={styles.currencyGrid}>
              {CURRENCIES.map((c) => {
                const active = c.code === currencyCode;
                return (
                  <TouchableOpacity
                    key={c.code}
                    activeOpacity={0.8}
                    onPress={() => void setCurrencyCode(c.code)}
                    style={[
                      styles.currencyChip,
                      {
                        borderColor: active ? palette.primary : palette.border,
                        backgroundColor: active
                          ? isDark
                            ? '#172B4D'
                            : '#E8F0FE'
                          : 'transparent',
                      },
                    ]}
                  >
                    <Text style={styles.currencyFlag}>{c.flag}</Text>
                    <Text
                      style={[
                        styles.currencyCode,
                        { color: active ? palette.primary : palette.textDark },
                      ]}
                    >
                      {c.code}
                    </Text>
                    {active ? (
                      <Iconify icon="ph:check-circle-fill" size={16} color={palette.primary} />
                    ) : null}
                  </TouchableOpacity>
                );
              })}
            </View>

            <Text style={[styles.label, { color: palette.textMuted }]}>
              {t('profile.dataManagement')}
            </Text>
            <TouchableOpacity
              activeOpacity={0.75}
              onPress={handleReset}
              style={[
                styles.dangerRow,
                {
                  borderColor: isDark ? 'rgba(248,113,113,0.3)' : '#FECACA',
                  backgroundColor: isDark ? 'rgba(248,113,113,0.08)' : '#FFF7F7',
                },
              ]}
            >
              <View
                style={[
                  styles.dangerIcon,
                  { backgroundColor: isDark ? 'rgba(248,113,113,0.16)' : '#FEE2E2' },
                ]}
              >
                <Iconify icon="ph:arrow-counter-clockwise-bold" size={20} color={palette.red} />
              </View>
              <View style={styles.dangerText}>
                <Text style={[styles.dangerTitle, { color: palette.red }]}>
                  {t('profile.resetFinance')}
                </Text>
                <Text style={[styles.dangerSubtitle, { color: palette.textMuted }]}>
                  {t('profile.resetFinanceSubtitle')}
                </Text>
              </View>
            </TouchableOpacity>
          </ScrollView>
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
    paddingBottom: 20,
    maxHeight: '85%',
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
    marginBottom: 6,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
  },
  content: {
    paddingBottom: 24,
  },
  label: {
    fontSize: 13,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: 16,
    marginBottom: 8,
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderWidth: 1.5,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  infoText: {
    fontSize: 15,
    fontWeight: '600',
  },
  currencyGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  currencyChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderWidth: 1.5,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 9,
  },
  currencyFlag: {
    fontSize: 16,
  },
  currencyCode: {
    fontSize: 14,
    fontWeight: '700',
  },
  dangerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderRadius: 16,
    padding: 14,
  },
  dangerIcon: {
    width: 42,
    height: 42,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dangerText: {
    flex: 1,
  },
  dangerTitle: {
    fontSize: 15,
    fontWeight: '700',
  },
  dangerSubtitle: {
    fontSize: 13,
    marginTop: 2,
    lineHeight: 18,
  },
});
