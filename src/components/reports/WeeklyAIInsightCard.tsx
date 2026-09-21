import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Iconify } from 'react-native-iconify';
import { COLORS, getThemeColors } from '@/constants/colors';
import { useTheme } from '@/context/theme-context';

interface Props {
  txCount: number;
  threshold?: number;
  onAction?: () => void;
}

export default function WeeklyAIInsightCard({ txCount, threshold = 5, onAction }: Props) {
  const { isDark } = useTheme();
  const palette = getThemeColors(isDark ? 'dark' : 'light');
  const unlocked = txCount >= threshold;
  const remaining = Math.max(0, threshold - txCount);
  const progress = Math.min(1, txCount / threshold);

  return (
    <View
      style={[
        styles.card,
        { backgroundColor: isDark ? '#16233D' : '#F0F7FF', borderColor: isDark ? '#2A4468' : '#C9DEF7' },
      ]}
    >
      <View style={styles.row}>
        <View style={[styles.iconWrap, { backgroundColor: palette.primary }]}>
          <Iconify icon="ph:lightbulb-bold" size={24} color="#FFFFFF" />
        </View>
        <View style={styles.textWrap}>
          <Text style={[styles.title, { color: palette.textDark }]}>
            {unlocked ? 'Insight AI Siap Dibuka' : 'Insight Belum Bisa Dibuat'}
          </Text>
          <Text style={[styles.sub, { color: isDark ? '#A9B8D0' : '#3E5879' }]}>
            {unlocked
              ? 'Cukup data minggu ini. Buka analisis AI untuk pola pengeluaranmu.'
              : `Tinggal catat ${remaining} transaksi lagi di minggu ini untuk membuka analisis AI secara otomatis.`}
          </Text>
        </View>
      </View>
      <View style={[styles.track, { backgroundColor: isDark ? '#24344F' : '#D8E8FA' }]}>
        <View
          style={[styles.fill, { width: `${Math.round(progress * 100)}%`, backgroundColor: unlocked ? COLORS.orange : palette.primary }]}
        />
      </View>
      <Text style={[styles.count, { color: isDark ? '#A9B8D0' : '#3E5879' }]}>
        {txCount}/{threshold} transaksi minggu ini
      </Text>
      {unlocked ? (
        <TouchableOpacity style={[styles.cta, { backgroundColor: palette.primary }]} activeOpacity={0.85} onPress={onAction}>
          <Iconify icon="ph:sparkle-bold" size={16} color="#FFFFFF" />
          <Text style={styles.ctaLabel}>Lihat Analisis AI</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderWidth: 1, borderRadius: 18, padding: 18 },
  row: { flexDirection: 'row', gap: 14, alignItems: 'flex-start' },
  iconWrap: { width: 48, height: 48, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  textWrap: { flex: 1 },
  title: { fontSize: 18, fontWeight: '700' },
  sub: { fontSize: 17, marginTop: 6, lineHeight: 19 },
  track: { height: 8, borderRadius: 4, overflow: 'hidden', marginTop: 14 },
  fill: { height: 8, borderRadius: 4 },
  count: { fontSize: 18, fontWeight: '600', marginTop: 8 },
  cta: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, borderRadius: 14, paddingVertical: 13, marginTop: 12 },
  ctaLabel: { color: '#FFFFFF', fontSize: 18, fontWeight: '700' },
});
