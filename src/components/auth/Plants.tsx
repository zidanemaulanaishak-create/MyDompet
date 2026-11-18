import React from 'react';
import Svg, { Circle, Ellipse, G, Path } from 'react-native-svg';
import { getThemeColors, mixHex } from '@/constants/colors';
import { useTheme } from '@/context/theme-context';

interface UnitPlantProps {
  color: string;
  midColor: string;
  secondaryColor: string;
}

function UnitPlant({ color, midColor, secondaryColor }: UnitPlantProps) {
  return (
    <G>
      <Path
        d="M0 0 C-2 -30 5 -55 2 -96"
        stroke="#0B132B"
        strokeWidth={5}
        fill="none"
        strokeLinecap="round"
      />
      <Ellipse cx={-16} cy={-20} rx={17} ry={9} fill="#0B132B" transform="rotate(-30 -16 -20)" />
      <Ellipse cx={16} cy={-38} rx={17} ry={9} fill={color} transform="rotate(30 16 -38)" />
      <Ellipse cx={-18} cy={-56} rx={16} ry={8} fill={midColor} transform="rotate(-32 -18 -56)" />
      <Ellipse cx={14} cy={-74} rx={15} ry={8} fill={secondaryColor} transform="rotate(32 14 -74)" />
      <Circle cx={2} cy={-96} r={4.5} fill={secondaryColor} />
    </G>
  );
}

const PLANTS: { x: number; scale: number }[] = [
  { x: 60, scale: 1.18 },
  { x: 182, scale: 0.8 },
  { x: 294, scale: 1.02 },
];

interface PlantsProps {
  color?: string;
  secondaryColor?: string;
}

export default function Plants({ color, secondaryColor }: PlantsProps) {
  const { isDark, accent } = useTheme();
  const palette = getThemeColors(isDark ? 'dark' : 'light', accent);
  const primary = color ?? palette.primary;
  const secondary = secondaryColor ?? palette.sky;
  const midColor = mixHex(primary, secondary, 0.4);

  return (
    <Svg width="100%" height={190} style={{ position: 'absolute', bottom: 0 }}>
      {PLANTS.map((p, i) => (
        <G key={i} transform={`translate(${p.x} 188) scale(${p.scale})`}>
          <UnitPlant color={primary} midColor={midColor} secondaryColor={secondary} />
        </G>
      ))}
    </Svg>
  );
}