import React from 'react';
import { Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { getThemeColors } from '@/constants/colors';
import { useTheme } from '@/context/theme-context';

interface BlueHeaderProps {
  title: string;
  subtitle: string;
  showLogo?: boolean;
  onBack?: () => void;
}

export default function BlueHeader({ title, subtitle, showLogo, onBack }: BlueHeaderProps) {
  const insets = useSafeAreaInsets();
  const { isDark, accent } = useTheme();
  const palette = getThemeColors(isDark ? 'dark' : 'light', accent);

  return (
    <View className="items-center px-8" style={{ paddingTop: insets.top + 14, paddingBottom: 42 }}>
      <Text
        className="text-center text-white font-extrabold text-[27px] tracking-tight"
        style={{ marginTop: showLogo ? 18 : 0 }}
      >
        {title}
      </Text>
      <Text
        className="text-center text-lg leading-5 mt-3 mb-10"
        style={{ color: palette.onPrimaryMuted }}
      >
        {subtitle}
      </Text>
    </View>
  );
}