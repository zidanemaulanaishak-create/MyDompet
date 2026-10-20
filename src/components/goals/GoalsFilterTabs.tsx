import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { COLORS, getThemeColors } from '@/constants/colors';
import { useTheme } from '@/context/theme-context';
import { GoalFilter } from '@/data/goalsData';
import { useI18n } from '@/i18n';

interface Props {
  value: GoalFilter;
  onChange: (f: GoalFilter) => void;
}

const TABS: { key: GoalFilter; labelKey: string }[] = [
  { key: 'all', labelKey: 'common.all' },
  { key: 'active', labelKey: 'goals.filterActive' },
  { key: 'done', labelKey: 'goals.filterDone' },
];

export default function GoalsFilterTabs({ value, onChange }: Props) {
  const { t } = useI18n();
  const { isDark } = useTheme();
  const palette = getThemeColors(isDark ? 'dark' : 'light');
  return (
    <View style={styles.row}>
      {TABS.map((tab) => {
        const active = tab.key === value;
        return (
          <TouchableOpacity
            key={tab.key}
            style={[styles.chip, active ? styles.chipActive : [styles.chipIdle, { backgroundColor: palette.divider }]]}
            activeOpacity={0.8}
            onPress={() => onChange(tab.key)}
          >
            <Text style={[styles.chipLabel, active ? styles.chipLabelActive : [styles.chipLabelIdle, { color: palette.textMuted }]]}>
              {t(tab.labelKey)}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 10, paddingHorizontal: 16, marginTop: 16 },
  chip: { paddingHorizontal: 18, paddingVertical: 10, borderRadius: 20 },
  chipActive: { backgroundColor: COLORS.primary },
  chipIdle: {},
  chipLabel: { fontSize: 14, fontWeight: '700' },
  chipLabelActive: { color: '#FFFFFF' },
  chipLabelIdle: {},
});
