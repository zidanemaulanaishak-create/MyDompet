import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Iconify } from 'react-native-iconify';
import { getThemeColors } from '@/constants/colors';
import { useTheme } from '@/context/theme-context';

interface Props {
  size?: number;
}

export default function AIAvatar({ size = 32 }: Props) {
  const { isDark } = useTheme();
  const palette = getThemeColors(isDark ? 'dark' : 'light');

  return (
    <View style={[styles.avatar, { width: size, height: size, backgroundColor: palette.primary + '1A' }]}>
      <Iconify icon="ph:sparkle-bold" size={size * 0.5} color={palette.primary} />
    </View>
  );
}

const styles = StyleSheet.create({
  avatar: {
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
});