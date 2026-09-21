import React, { useMemo } from 'react';
import { View } from 'react-native';
import Svg, { Defs, LinearGradient, Path, Stop, Line } from 'react-native-svg';
import { COLORS, getThemeColors } from '@/constants/colors';
import { useTheme } from '@/context/theme-context';

interface Props {
  data: number[];
  width?: number;
  height?: number;
}

function smoothPath(points: { x: number; y: number }[]): string {
  if (points.length === 0) return '';
  if (points.length === 1) return `M ${points[0].x} ${points[0].y}`;
  let d = `M ${points[0].x} ${points[0].y}`;
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[Math.max(0, i - 1)];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[Math.min(points.length - 1, i + 2)];
    const c1x = p1.x + (p2.x - p0.x) / 6;
    const c1y = p1.y + (p2.y - p0.y) / 6;
    const c2x = p2.x - (p3.x - p1.x) / 6;
    const c2y = p2.y - (p3.y - p1.y) / 6;
    d += ` C ${c1x} ${c1y}, ${c2x} ${c2y}, ${p2.x} ${p2.y}`;
  }
  return d;
}

export default function WeeklyTrendSpline({ data, width = 320, height = 120 }: Props) {
  const { isDark } = useTheme();
  const palette = getThemeColors(isDark ? 'dark' : 'light');
  const pad = 8;

  const { line, area } = useMemo(() => {
    const max = Math.max(...data, 1);
    const min = 0;
    const iw = width - pad * 2;
    const ih = height - pad * 2;
    const pts = data.map((v, i) => ({
      x: data.length === 1 ? width / 2 : pad + (i / (data.length - 1)) * iw,
      y: pad + ih - ((v - min) / Math.max(1, max - min)) * ih,
    }));
    const line = smoothPath(pts);
    const area =
      pts.length === 0
        ? ''
        : `${line} L ${pts[pts.length - 1].x} ${height - pad} L ${pts[0].x} ${height - pad} Z`;
    return { line, area };
  }, [data, width, height]);

  const empty = data.every((v) => v === 0);

  return (
    <View>
      <Svg width={width} height={height}>
        <Defs>
          <LinearGradient id="weeklyArea" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor={COLORS.sky} stopOpacity="0.45" />
            <Stop offset="1" stopColor={COLORS.sky} stopOpacity="0.05" />
          </LinearGradient>
        </Defs>
        {[0.25, 0.5, 0.75].map((f) => (
          <Line
            key={f}
            x1={pad}
            x2={width - pad}
            y1={height * f}
            y2={height * f}
            stroke={isDark ? '#263550' : '#E2E8F0'}
            strokeWidth="1"
            strokeDasharray={empty ? '5,5' : undefined}
          />
        ))}
        {area ? <Path d={area} fill="url(#weeklyArea)" /> : null}
        {line && !empty ? <Path d={line} fill="none" stroke={palette.primary} strokeWidth="2.5" strokeLinecap="round" /> : null}
      </Svg>
    </View>
  );
}
