import React from 'react';
import { View } from 'react-native';
import Svg, { Rect } from 'react-native-svg';
import { getThemeColors } from '@/constants/colors';
import { useTheme } from '@/context/theme-context';

interface BarChartLogoProps {
  size?: number;
  color?: string;
  secondaryColor?: string;
}

export default function BarChartLogo({ size = 60, color, secondaryColor }: BarChartLogoProps) {
  const { isDark, accent } = useTheme();
  const palette = getThemeColors(isDark ? 'dark' : 'light', accent);
  const primary = color ?? palette.primary;
  const secondary = secondaryColor ?? palette.sky;

  return (
    <View
      className="items-center justify-center rounded-[24px]"
      style={{ width: size + 26, height: size + 26, backgroundColor: palette.chipBlue }}
    >
      <Svg width={size} height={size} viewBox="0 0 64 64">
        <Rect x="8" y="30" width="10" height="22" rx="5" fill={primary} />
        <Rect x="27" y="14" width="10" height="38" rx="5" fill={primary} />
        <Rect x="46" y="23" width="10" height="29" rx="5" fill={secondary} />
      </Svg>
    </View>
  );
}