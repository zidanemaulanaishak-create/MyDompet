export interface ColorPalette {
  primary: string;
  primaryDark: string;
  sky: string;
  onPrimaryMuted: string;
  onPrimarySoft: string;
  bg: string;
  card: string;
  orange: string;
  green: string;
  red: string;
  textDark: string;
  textMuted: string;
  chipBlue: string;
  border: string;
  divider: string;
  inputBg: string;
  track: string;
}

export type ThemeMode = 'light' | 'dark';
export type AccentId = 'blue' | 'green' | 'purple' | 'orange' | 'teal' | 'red';

export const DEFAULT_ACCENT: AccentId = 'blue';

type AccentTokens = Pick<ColorPalette, 'primary' | 'primaryDark' | 'chipBlue' | 'sky'>;

interface AccentPreset {
  id: AccentId;
  labelKey: string;
  swatch: string;
  light: AccentTokens;
  dark: AccentTokens;
}

export const ACCENT_PRESETS: AccentPreset[] = [
  {
    id: 'blue',
    labelKey: 'profile.accentBlue',
    swatch: '#1A42BA',
    light: { primary: '#1A42BA', primaryDark: '#122E85', chipBlue: '#E8F0FE', sky: '#38BDF8' },
    dark: { primary: '#4F7DFF', primaryDark: '#2F5BEA', chipBlue: '#172B4D', sky: '#7DD3FC' },
  },
  {
    id: 'green',
    labelKey: 'profile.accentGreen',
    swatch: '#059669',
    light: { primary: '#059669', primaryDark: '#047857', chipBlue: '#DCFCE7', sky: '#6EE7B7' },
    dark: { primary: '#34D399', primaryDark: '#059669', chipBlue: '#064E3B', sky: '#A7F3D0' },
  },
  {
    id: 'purple',
    labelKey: 'profile.accentPurple',
    swatch: '#7C3AED',
    light: { primary: '#7C3AED', primaryDark: '#5B21B6', chipBlue: '#EDE9FE', sky: '#C4B5FD' },
    dark: { primary: '#A78BFA', primaryDark: '#7C3AED', chipBlue: '#2E1065', sky: '#DDD6FE' },
  },
  {
    id: 'orange',
    labelKey: 'profile.accentOrange',
    swatch: '#EA580C',
    light: { primary: '#EA580C', primaryDark: '#C2410C', chipBlue: '#FFEDD5', sky: '#FDBA74' },
    dark: { primary: '#FB923C', primaryDark: '#EA580C', chipBlue: '#431407', sky: '#FED7AA' },
  },
  {
    id: 'teal',
    labelKey: 'profile.accentTeal',
    swatch: '#0D9488',
    light: { primary: '#0D9488', primaryDark: '#0F766E', chipBlue: '#CCFBF1', sky: '#5EEAD4' },
    dark: { primary: '#2DD4BF', primaryDark: '#0D9488', chipBlue: '#134E4A', sky: '#99F6E4' },
  },
  {
    id: 'red',
    labelKey: 'profile.accentRed',
    swatch: '#DC2626',
    light: { primary: '#DC2626', primaryDark: '#B91C1C', chipBlue: '#FEE2E2', sky: '#FDA4AF' },
    dark: { primary: '#F87171', primaryDark: '#DC2626', chipBlue: '#450A0A', sky: '#FECDD3' },
  },
];

const BASE_COLORS: ColorPalette = {
  primary: '#1A42BA',
  primaryDark: '#122E85',
  sky: '#38BDF8',
  onPrimaryMuted: '#B9C2FF',
  onPrimarySoft: 'rgba(18, 46, 133, 0.75)',
  bg: '#F8F9FA',
  card: '#FFFFFF',
  orange: '#FF961D',
  green: '#10B981',
  red: '#EF4444',
  textDark: '#172031',
  textMuted: '#8A8D9F',
  chipBlue: '#E8F0FE',
  border: '#E2E8F0',
  divider: '#F1F5F9',
  inputBg: '#F8F9FA',
  track: '#EDEEF3',
};

const BASE_DARK_COLORS: ColorPalette = {
  primary: '#4F7DFF',
  primaryDark: '#2F5BEA',
  sky: '#38BDF8',
  onPrimaryMuted: '#B9C2FF',
  onPrimarySoft: 'rgba(47, 91, 234, 0.75)',
  bg: '#0B1220',
  card: '#151E2E',
  orange: '#FF9F2D',
  green: '#34D399',
  red: '#F87171',
  textDark: '#F8FAFC',
  textMuted: '#94A3B8',
  chipBlue: '#172B4D',
  border: '#23314D',
  divider: '#1E2A42',
  inputBg: '#151E2E',
  track: '#24344F',
};

function hexToRgb(hex: string): [number, number, number] {
  const raw = hex.replace('#', '');
  const normalized = raw.length === 3
    ? raw.split('').map((char) => char + char).join('')
    : raw;
  return [
    parseInt(normalized.slice(0, 2), 16),
    parseInt(normalized.slice(2, 4), 16),
    parseInt(normalized.slice(4, 6), 16),
  ];
}

export function withAlpha(hex: string, alpha: number): string {
  const [r, g, b] = hexToRgb(hex);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export function mixHex(from: string, to: string, amount: number): string {
  const source = hexToRgb(from);
  const target = hexToRgb(to);
  const channel = (index: number) =>
    Math.round(source[index] + (target[index] - source[index]) * amount)
      .toString(16)
      .padStart(2, '0');
  return `#${channel(0)}${channel(1)}${channel(2)}`;
}

function buildPalette(base: ColorPalette, tokens: AccentTokens): ColorPalette {
  const merged = { ...base, ...tokens };
  return {
    ...merged,
    onPrimaryMuted: mixHex(merged.primary, '#FFFFFF', 0.68),
    onPrimarySoft: withAlpha(merged.primaryDark, 0.75),
  };
}

// Kompatibilitas ekspor lama (default = blue)
export const COLORS: ColorPalette = buildPalette(BASE_COLORS, ACCENT_PRESETS[0].light);
export const DARK_COLORS: ColorPalette = buildPalette(BASE_DARK_COLORS, ACCENT_PRESETS[0].dark);

export function getThemeColors(
  mode: ThemeMode,
  accent: AccentId = DEFAULT_ACCENT
): ColorPalette {
  const preset = ACCENT_PRESETS.find((p) => p.id === accent) ?? ACCENT_PRESETS[0];
  const base = mode === 'dark' ? BASE_DARK_COLORS : BASE_COLORS;
  const tokens = mode === 'dark' ? preset.dark : preset.light;
  return buildPalette(base, tokens);
}
