import React from 'react';
import { View, Text } from 'react-native';
import { Iconify } from 'react-native-iconify';
import { getThemeColors } from '@/constants/colors';
import { useTheme } from '@/context/theme-context';
import { useI18n } from '@/i18n';

interface Props {
  allowance: number;
  spent: number;
  monthLabel?: string;
}

function formatRupiah(n: number): string {
  return 'Rp ' + n.toLocaleString('id-ID');
}

export default function BudgetCard({ allowance, spent, monthLabel }: Props) {
  const { isDark } = useTheme();
  const { t } = useI18n();
  const palette = getThemeColors(isDark ? 'dark' : 'light');
  const hasBudget = allowance > 0;
  const big = hasBudget && spent > allowance;
  const percent = hasBudget ? Math.round((spent / allowance) * 100) : 0;
  const barColor = big ? palette.red : percent >= 80 ? palette.orange : palette.green;

  return (
    <View className="rounded-2xl p-4 mb-6 shadow-sm" style={{ backgroundColor: palette.card }}>
      <View className="flex-row items-center gap-2 mb-4">
        <View className="w-8 h-8 rounded-full items-center justify-center" style={{ backgroundColor: palette.chipBlue }}>
          <Iconify icon="ph:wallet-bold" size={16} color={palette.primary} />
        </View>
        <Text className="font-bold text-lg flex-1" style={{ color: palette.textDark }}>
          {t('home.budgetCard')}
        </Text>
        <Text className="text-lg" style={{ color: palette.textMuted }}>{monthLabel ?? t('home.thisMonth')}</Text>
      </View>

      <View className="flex-row items-end justify-between mb-2.5">
        <View>
          <Text className="text-lg" style={{ color: palette.textMuted }}>{t('home.spent')}</Text>
          <Text className="text-xl font-extrabold" style={{ color: palette.textDark }}>
            {formatRupiah(spent)}
          </Text>
        </View>
        <Text className="text-lg mb-1" style={{ color: palette.textMuted }}>
          {t('home.fromLimit', { limit: formatRupiah(allowance) })}
        </Text>
      </View>

      <View className="h-2.5 rounded-full overflow-hidden" style={{ backgroundColor: palette.track }}>
        <View
          className="h-2.5 rounded-full"
          style={{ width: `${Math.min(100, percent)}%`, backgroundColor: barColor }}
        />
      </View>

      <Text
        className="text-lg mt-2"
        style={{ color: !hasBudget ? palette.textMuted : big ? palette.red : palette.textMuted }}
      >
        {!hasBudget
          ? t('home.noBudget')
          : big
            ? t('home.budgetExceeded', { percent: percent - 100 })
            : t('home.spentPercent', { percent })}
      </Text>
    </View>
  );
}