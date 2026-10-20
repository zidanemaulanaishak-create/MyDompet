import React from 'react';
import { View, Text } from 'react-native';
import { Iconify } from 'react-native-iconify';
import { getThemeColors } from '@/constants/colors';
import { useTheme } from '@/context/theme-context';
import { useI18n } from '@/i18n';
import { WeeklySpending } from '@/data/dummyData';

interface Props {
  data: WeeklySpending[];
}

const CHART_HEIGHT = 96;

export default function SpendingChart({ data }: Props) {
  const { isDark } = useTheme();
  const { t } = useI18n();
  const palette = getThemeColors(isDark ? 'dark' : 'light');
  const max = Math.max(...data.map((d) => d.amount), 1);
  const todayIndex = data.length - 1;

  return (
    <View className="rounded-2xl p-4 mb-6" style={{ backgroundColor: palette.card }}>
      <View className="flex-row items-center gap-2 mb-4">
        <View className="w-8 h-8 rounded-full items-center justify-center" style={{ backgroundColor: palette.chipBlue }}>
          <Iconify icon="ph:chart-bar" size={16} color={palette.primary} />
        </View>
        <Text className="font-bold text-base flex-1" style={{ color: palette.textDark }}>
          {t('home.weeklySpending')}
        </Text>
        <Text className="text-sm" style={{ color: palette.textMuted }}>{t('home.last7Days')}</Text>
      </View>

      <View className="h-[2px] mb-5 -mx-4" style={{ backgroundColor: palette.border }} />

      <View className="flex-row items-end justify-between gap-2">
        {data.map((d, i) => {
          const height = Math.max(8, Math.round((d.amount / max) * CHART_HEIGHT));
          const isToday = i === todayIndex;
          return (
            <View key={d.day} className="flex-1 items-center gap-1.5">
              <View
                className="w-full rounded-t-[8px] rounded-b-[3px]"
                style={{ height, backgroundColor: isToday ? palette.sky : palette.chipBlue }}
              />
              <Text
                className="text-xs"
                style={{ color: isToday ? palette.primary : palette.textMuted, fontWeight: isToday ? '700' : '500' }}
              >
                {d.day}
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}