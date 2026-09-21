import React from 'react';
import Svg, { Circle, Ellipse, G, Path } from 'react-native-svg';

function UnitPlant() {
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
      <Ellipse cx={16} cy={-38} rx={17} ry={9} fill="#2563EB" transform="rotate(30 16 -38)" />
      <Ellipse cx={-18} cy={-56} rx={16} ry={8} fill="#3B82F6" transform="rotate(-32 -18 -56)" />
      <Ellipse cx={14} cy={-74} rx={15} ry={8} fill="#38BDF8" transform="rotate(32 14 -74)" />
      <Circle cx={2} cy={-96} r={4.5} fill="#38BDF8" />
    </G>
  );
}

const PLANTS: { x: number; scale: number }[] = [
  { x: 60, scale: 1.18 },
  { x: 182, scale: 0.8 },
  { x: 294, scale: 1.02 },
];

export default function Plants() {
  return (
    <Svg width="100%" height={190} style={{ position: 'absolute', bottom: 0 }}>
      {PLANTS.map((p, i) => (
        <G key={i} transform={`translate(${p.x} 188) scale(${p.scale})`}>
          <UnitPlant />
        </G>
      ))}
    </Svg>
  );
}