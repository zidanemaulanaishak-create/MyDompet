import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Iconify } from 'react-native-iconify';
import { getThemeColors } from '@/constants/colors';
import { useTheme } from '@/context/theme-context';

interface Props {
  icon: string;
  title: string;
  subtitle: string;
  onPress: () => void;
}

export default function UploadOptionCard({ icon, title, subtitle, onPress }: Props) {
  const { isDark } = useTheme();
  const palette = getThemeColors(isDark ? 'dark' : 'light');

  return (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: palette.card, borderColor: palette.border }]}
      activeOpacity={0.7}
      onPress={onPress}
    >
      <View style={[styles.iconWrap, { backgroundColor: isDark ? '#1C2942' : '#EEF2F7' }]}>
        <Iconify icon={icon} size={22} color={palette.primary} />
      </View>
      <View style={styles.textWrap}>
        <Text style={[styles.title, { color: palette.textDark }]}>{title}</Text>
        <Text style={[styles.subtitle, { color: palette.textMuted }]}>{subtitle}</Text>
      </View>
      <Iconify icon="ph:caret-right-bold" size={16} color={palette.textMuted} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
    shadowColor: '#1A2E5A',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    elevation: 2,
  },
  iconWrap: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textWrap: { flex: 1 },
  title: { fontSize: 17, fontWeight: '700' },
  subtitle: { fontSize: 17, marginTop: 3 },
});
