import React from 'react';
import { View } from 'react-native';
import Svg, { Rect } from 'react-native-svg';

interface BarChartLogoProps {
  size?: number;
}

export default function BarChartLogo({ size = 60 }: BarChartLogoProps) {
  return (
    <View
      className="items-center justify-center rounded-[24px]"
      style={{ width: size + 26, height: size + 26, backgroundColor: '#EAF2FE' }}
    >
      <Svg width={size} height={size} viewBox="0 0 64 64">
        <Rect x="8" y="30" width="10" height="22" rx="5" fill="#2563EB" />
        <Rect x="27" y="14" width="10" height="38" rx="5" fill="#2563EB" />
        <Rect x="46" y="23" width="10" height="29" rx="5" fill="#38BDF8" />
      </Svg>
    </View>
  );
}