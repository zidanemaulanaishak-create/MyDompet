import React from 'react';
import { View } from 'react-native';
import { getThemeColors } from '@/constants/colors';
import { useTheme } from '@/context/theme-context';

export default function IndexPlaceholder() {
  const { isDark, accent } = useTheme();
  const palette = getThemeColors(isDark ? 'dark' : 'light', accent);
  return <View style={{ flex: 1, backgroundColor: palette.primary }} />;
}