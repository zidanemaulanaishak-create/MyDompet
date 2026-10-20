import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Iconify } from 'react-native-iconify';
import { COLORS, getThemeColors } from '@/constants/colors';
import { useTheme } from '@/context/theme-context';
import { useI18n } from '@/i18n';

export type ReportTab = 'flow' | 'balance';

interface Props {
  active: ReportTab;
  onChange: (tab: ReportTab) => void;
}

const TABS: { key: ReportTab; labelKey: string; icon: string }[] = [
  { key: 'flow', labelKey: 'reports.flowTab', icon: 'ph:arrows-left-right-bold' },
  { key: 'balance', labelKey: 'reports.balanceTab', icon: 'ph:wallet-bold' },
];

export default function ReportTabs({ active, onChange }: Props) {
  const { isDark } = useTheme();
  const palette = getThemeColors(isDark ? 'dark' : 'light');
  const { t } = useI18n();

  return (
    <View style={[styles.wrap, { backgroundColor: palette.card, borderColor: isDark ? '#263550' : '#E2E8F0' }]}>
      {TABS.map((tab) => {
        const isActive = tab.key === active;
        return (
          <TouchableOpacity
            key={tab.key}
            style={[styles.tab, isActive && { backgroundColor: COLORS.primary }]}
            activeOpacity={0.8}
            onPress={() => onChange(tab.key)}
          >
            <Iconify icon={tab.icon} size={17} color={isActive ? '#FFFFFF' : palette.textMuted} />
            <Text style={[styles.label, { color: isActive ? '#FFFFFF' : palette.textMuted }]} numberOfLines={1}>
              {t(tab.labelKey)}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row', gap: 6, borderWidth: 1, borderRadius: 28, padding: 6,
    shadowColor: '#1A2E5A', shadowOpacity: 0.08, shadowOffset: { width: 0, height: 4 }, shadowRadius: 12, elevation: 4,
  },
  tab: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, borderRadius: 22, paddingVertical: 11, paddingHorizontal: 8 },
  label: { fontSize: 18, fontWeight: '700' },
});
