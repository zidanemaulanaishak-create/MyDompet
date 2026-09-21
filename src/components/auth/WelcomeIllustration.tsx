import React from 'react';
import Svg, { Circle, G, Path, Rect } from 'react-native-svg';

const SKIN_1 = '#F6C28B';
const SKIN_2 = '#E8AE72';
const SHIRT_2 = '#38BDF8';
const PANTS = '#2E2A5E';
const SHOE = '#1E1B4B';
const HAIR = '#3B2417';
const COIN = '#FFD166';
const WALLET = '#FF961D';
const WHITE = '#FFFFFF';
const SPARKLE =
  'M0 -9 C1 -3 3 -1 9 0 C3 1 1 3 0 9 C-1 3 -3 1 -9 0 C-3 -1 -1 -3 0 -9 Z';

export default function WelcomeIllustration() {
  return (
    <Svg width="100%" height="100%" viewBox="0 0 360 250">
      <Circle cx={180} cy={125} r={100} fill="rgba(255,255,255,0.07)" />
      <Circle cx={86} cy={38} r={26} fill="rgba(255,255,255,0.06)" />
      <Circle cx={282} cy={182} r={30} fill="rgba(255,255,255,0.05)" />

      <Circle cx={60} cy={120} r={4} fill="rgba(255,255,255,0.3)" />
      <Circle cx={330} cy={32} r={3.5} fill="rgba(255,255,255,0.35)" />
      <Circle cx={52} cy={60} r={3} fill="rgba(255,255,255,0.3)" />

      <G transform="translate(58 40) rotate(-14)">
        <Rect x={0} y={0} width={54} height={36} rx={9} fill={WHITE} />
        <Rect x={10} y={8} width={34} height={6} rx={3} fill="#1A42BA" />
        <Rect x={28} y={20} width={16} height={6} rx={3} fill="#C7CBE0" />
        <Circle cx={14} cy={23} r={4.5} fill="#FF961D" />
      </G>

      <G transform="translate(300 46)">
        <Circle cx={0} cy={0} r={17} fill={COIN} />
        <Circle cx={0} cy={0} r={13} fill="rgba(255,255,255,0.3)" />
        <Path d={SPARKLE} scale={0.6} fill="#B7791F" />
      </G>

      <Circle cx={286} cy={112} r={10} fill={COIN} opacity={0.9} />

      <G transform="translate(48 168) rotate(8)">
        <Rect x={0} y={0} width={48} height={34} rx={10} fill={WALLET} />
        <Rect x={0} y={8} width={48} height={12} rx={6} fill="#FFB357" />
        <Circle cx={40} cy={4} r={3} fill="#E07B0B" />
      </G>

      <G transform="translate(250 22) scale(0.8)">
        <Path d={SPARKLE} fill={WHITE} opacity={0.9} />
      </G>
      <G transform="translate(96 168) scale(0.6)">
        <Path d={SPARKLE} fill={COIN} />
      </G>
      <G transform="translate(312 152) scale(0.7)">
        <Path d={SPARKLE} fill={WHITE} opacity={0.85} />
      </G>

      <Rect x={98} y={158} width={13} height={30} rx={6.5} fill={PANTS} />
      <Rect x={118} y={158} width={13} height={30} rx={6.5} fill={PANTS} />
      <Rect x={94} y={182} width={21} height={9} rx={4.5} fill={SHOE} />
      <Rect x={114} y={182} width={21} height={9} rx={4.5} fill={SHOE} />

      <Rect x={230} y={160} width={13} height={30} rx={6.5} fill={PANTS} />
      <Rect x={250} y={160} width={13} height={30} rx={6.5} fill={PANTS} />
      <Rect x={226} y={190} width={21} height={9} rx={4.5} fill={SHOE} />
      <Rect x={246} y={190} width={21} height={9} rx={4.5} fill={SHOE} />

      <Path d="M92 108 C 82 122 78 132 78 140" stroke={SKIN_1} strokeWidth={12} strokeLinecap="round" fill="none" />
      <Circle cx={78} cy={142} r={8.5} fill={SKIN_1} />

      <Path d="M248 108 C 258 122 262 132 262 140" stroke={SKIN_2} strokeWidth={12} strokeLinecap="round" fill="none" />
      <Circle cx={262} cy={142} r={8.5} fill={SKIN_2} />

      <Rect x={88} y={104} width={50} height={60} rx={24} fill={WHITE} />
      <Circle cx={113} cy={74} r={24} fill={SKIN_1} />
      <Path d="M89 66 C89 46 137 46 137 66 C133 58 93 58 89 66 Z" fill={HAIR} />
      <Circle cx={113} cy={70} r={5} fill={WHITE} />

      <Rect x={222} y={106} width={50} height={60} rx={24} fill={SHIRT_2} />
      <Circle cx={247} cy={78} r={24} fill={SKIN_2} />
      <Path d="M223 70 C223 48 271 48 271 70 C267 62 227 62 223 70 Z" fill={HAIR} />
      <Circle cx={247} cy={75} r={5} fill={WHITE} />

      <Path d="M132 110 C 148 92 160 74 172 64" stroke={SKIN_1} strokeWidth={13} strokeLinecap="round" fill="none" />
      <Circle cx={173} cy={64} r={10} fill={SKIN_1} />

      <Path d="M228 112 C 212 92 196 76 188 66" stroke={SKIN_2} strokeWidth={13} strokeLinecap="round" fill="none" />
      <Circle cx={187} cy={66} r={10} fill={SKIN_2} />
      <Circle cx={178} cy={60} r={3} fill="rgba(255,255,255,0.85)" />
    </Svg>
  );
}