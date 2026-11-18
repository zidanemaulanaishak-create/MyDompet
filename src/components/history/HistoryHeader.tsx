import React from 'react';
import { View, Text } from 'react-native';
import { getThemeColors } from '@/constants/colors';
import { useTheme } from '@/context/theme-context';
import { useI18n } from '@/i18n';

export function HistoryHeader() {
  const { isDark, accent } = useTheme();
  const palette = getThemeColors(isDark ? 'dark' : 'light', accent);
  const { t } = useI18n();
  return (
    <View className="flex-row items-center justify-between px-5 pt-4 pb-3">
      <Text className="text-[22px] font-bold" style={{ color: palette.textDark }}>{t('history.title')}</Text>
    </View>
  );
}