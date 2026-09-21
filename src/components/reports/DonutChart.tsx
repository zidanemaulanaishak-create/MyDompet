import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { COLORS, getThemeColors } from '@/constants/colors';
import { useTheme } from '@/context/theme-context';

interface Props {
  percent: number;
  label: string;
}

export default function DonutChart({ percent, label }: Props) {
  const { isDark } = useTheme();
  const palette = getThemeColors(isDark ? 'dark' : 'light');
  const size = 148;
  const stroke = 16;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const filled = Math.max(0, Math.min(100, percent));
  const dash = (filled / 100) * circumference;
  const center = size / 2;

  return (
    <View style={styles.wrap}>
      <View style={{ width: size, height: size }}>
        <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          <Circle cx={center} cy={center} r={radius} stroke={isDark ? '#1E293B' : '#E2E8F0'} strokeWidth={stroke} fill="transparent" />
          <Circle
            cx={center}
            cy={center}
            r={radius}
            stroke={COLORS.primary}
            strokeWidth={stroke}
            strokeLinecap="round"
            fill="transparent"
            strokeDasharray={`${dash} ${circumference}`}
            transform={`rotate(-90 ${center} ${center})`}
          />
        </Svg>
        <View style={styles.center}>
          <Text style={[styles.percent, { color: palette.textDark }]}>{Math.round(filled)}%</Text>
          <Text style={[styles.label, { color: palette.textMuted }]} numberOfLines={1}>
            {label}
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center' },
  center: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, alignItems: 'center', justifyContent: 'center' },
  percent: { fontSize: 26, fontWeight: '700' },
  label: { fontSize: 18, fontWeight: '500', marginTop: 2 },
});
