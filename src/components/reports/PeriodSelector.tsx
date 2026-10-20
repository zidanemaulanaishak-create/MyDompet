import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { COLORS, getThemeColors } from '@/constants/colors';
import { useTheme } from '@/context/theme-context';
import { ReportPeriod } from '@/utils/reports';
import { useI18n } from '@/i18n';

interface Props {
  value: ReportPeriod;
  onChange: (period: ReportPeriod) => void;
}

const OPTIONS: ReportPeriod[] = ['month', 'sixMonths', 'year'];

const PERIOD_KEYS: Record<ReportPeriod, string> = {
  month: 'reports.periodMonth',
  sixMonths: 'reports.periodSixMonths',
  year: 'reports.periodYear',
};

export default function PeriodSelector({ value, onChange }: Props) {
  const { isDark } = useTheme();
  const palette = getThemeColors(isDark ? 'dark' : 'light');
  const { t } = useI18n();

  return (
    <View style={styles.row}>
      {OPTIONS.map((opt) => {
        const active = opt === value;
        return (
          <TouchableOpacity
            key={opt}
            style={[
              styles.chip,
              { borderColor: active ? COLORS.primary : isDark ? '#263550' : '#E2E8F0' },
              active && { backgroundColor: COLORS.chipBlue },
            ]}
            activeOpacity={0.75}
            onPress={() => onChange(opt)}
          >
            <Text style={[styles.label, { color: active ? COLORS.primary : palette.textMuted }]}>
              {t(PERIOD_KEYS[opt])}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  chip: { borderWidth: 1, borderRadius: 20, paddingHorizontal: 12, paddingVertical: 8 },
  label: { fontSize: 18, fontWeight: '700' },
});
