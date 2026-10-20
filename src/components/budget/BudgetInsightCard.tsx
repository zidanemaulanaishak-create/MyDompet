import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Iconify } from 'react-native-iconify';
import { getThemeColors } from '@/constants/colors';
import { useTheme } from '@/context/theme-context';
import { formatMoneyPlain } from '@/utils/money';
import { useI18n } from '@/i18n';

interface Props {
  dailyAmount: number;
}

export default function BudgetInsightCard({ dailyAmount }: Props) {
  const { t } = useI18n();
  const { isDark } = useTheme();
  const palette = getThemeColors(isDark ? 'dark' : 'light');

  return (
    <View
      className="mx-5 -mt-6 rounded-2xl px-4 py-4 flex-row items-center gap-3"
      style={[styles.card, { backgroundColor: palette.card }]}
    >
      <View
        className="w-11 h-11 rounded-full items-center justify-center"
        style={{ backgroundColor: isDark ? 'rgba(16,185,129,0.18)' : '#E6FEEF' }}
      >
        <Iconify icon="ph:check-circle-fill" size={24} color={palette.green} />
      </View>
      <View className="flex-1">
        <Text className="text-lg font-bold" style={{ color: palette.textDark }}>
          {t('budget.safeTitle')}
        </Text>
        <Text
          className="text-lg leading-[18px] mt-0.5"
          style={{ color: palette.textMuted }}
        >
          {t('budget.dailyAllowance', { amount: formatMoneyPlain(dailyAmount) })}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    shadowColor: '#0E1F42',
    shadowOpacity: 0.1,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },
});