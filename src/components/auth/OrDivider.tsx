import React from 'react';
import { Text, View } from 'react-native';
import { getThemeColors } from '@/constants/colors';
import { useTheme } from '@/context/theme-context';

export default function OrDivider({ text }: { text: string }) {
  const { isDark } = useTheme();
  const palette = getThemeColors(isDark ? 'dark' : 'light');

  return (
    <View className="flex-row items-center my-6">
      <View className="flex-1 h-px" style={{ backgroundColor: palette.divider }} />
      <Text className="mx-4 text-lg font-medium" style={{ color: palette.textMuted }}>{text}</Text>
      <View className="flex-1 h-px" style={{ backgroundColor: palette.divider }} />
    </View>
  );
}