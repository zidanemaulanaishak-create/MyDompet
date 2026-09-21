import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, useWindowDimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Iconify } from 'react-native-iconify';
import { COLORS, getThemeColors } from '@/constants/colors';
import { useTheme } from '@/context/theme-context';
import { formatRupiah, weekOverWeekChange } from '@/utils/reports';
import WeeklyTrendSpline from './WeeklyTrendSpline';

interface Props {
  title: string;
  periodLabel: string;
  totalExpense: number;
  lastWeekExpense: number;
  trend: number[];
  onBack: () => void;
}

export default function WeeklyHeroHeader({ title, periodLabel, totalExpense, lastWeekExpense, trend, onBack }: Props) {
  const { isDark } = useTheme();
  const palette = getThemeColors(isDark ? 'dark' : 'light');
  const { width } = useWindowDimensions();
  const change = weekOverWeekChange(totalExpense, lastWeekExpense);
  const down = change <= 0;

  return (
    <View style={[styles.hero, { backgroundColor: palette.primary }]}>
      <LinearGradient
        colors={[palette.primary, palette.primaryDark]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={styles.gradient}
      >
        <View style={styles.topRow}>
          <TouchableOpacity style={styles.backBtn} onPress={onBack} activeOpacity={0.7} accessibilityLabel="Kembali">
            <Iconify icon="ph:caret-left-bold" size={20} color="#FFFFFF" />
          </TouchableOpacity>
          <View style={styles.titleRow}>
            <Text style={styles.title}>{title}</Text>
            <Iconify icon="ph:sparkle-bold" size={18} color={COLORS.orange} />
          </View>
          <View style={styles.backBtn} />
        </View>
        <Text style={styles.period}>{periodLabel}</Text>

        <View style={[styles.card, { backgroundColor: palette.card }]}>
          <Text style={[styles.label, { color: palette.textMuted }]}>Total Pengeluaran</Text>
          <View style={styles.nominalRow}>
            <Text style={[styles.nominal, { color: palette.textDark }]}>{formatRupiah(totalExpense)}</Text>
            <View style={[styles.badge, { backgroundColor: down ? '#E6F7EE' : '#FDECEC' }]}>
              <Text style={[styles.badgeText, { color: down ? '#0E9F6E' : '#E02424' }]}>
                {change > 0 ? '+' : ''}{change}%
              </Text>
            </View>
          </View>
          <Text style={[styles.compare, { color: palette.textMuted }]}>
            vs {formatRupiah(lastWeekExpense)} minggu lalu
          </Text>
          <View style={styles.chartWrap}>
            <WeeklyTrendSpline data={trend} width={Math.min(width - 88, 400)} height={120} />
          </View>
        </View>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  hero: {},
  gradient: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 72 },
  topRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  backBtn: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,255,255,0.18)' },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  title: { color: '#FFFFFF', fontSize: 18, fontWeight: '700' },
  period: { color: '#FFFFFF', fontSize: 17, fontWeight: '700', textAlign: 'center', marginTop: 12 },
  card: { borderRadius: 20, padding: 18, marginTop: 16, shadowColor: '#0A1128', shadowOpacity: 0.25, shadowRadius: 18, shadowOffset: { width: 0, height: 8 }, elevation: 8 },
  label: { fontSize: 17, fontWeight: '600' },
  nominalRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 6 },
  nominal: { fontSize: 28, fontWeight: '800' },
  badge: { borderRadius: 12, paddingHorizontal: 10, paddingVertical: 5 },
  badgeText: { fontSize: 17, fontWeight: '700' },
  compare: { fontSize: 18, marginTop: 4 },
  chartWrap: { marginTop: 12, alignItems: 'center' },
});
