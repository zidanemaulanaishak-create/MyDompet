export interface ColorPalette {
  primary: string;
  primaryDark: string;
  sky: string;
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

export const COLORS: ColorPalette = {
  primary: '#1A42BA',
  primaryDark: '#122E85',
  sky: '#38BDF8',
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

export const DARK_COLORS: ColorPalette = {
  primary: '#4F7DFF',
  primaryDark: '#2F5BEA',
  sky: '#38BDF8',
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

export type ThemeMode = 'light' | 'dark';

export function getThemeColors(mode: ThemeMode): ColorPalette {
  return mode === 'dark' ? DARK_COLORS : COLORS;
}