import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Iconify } from 'react-native-iconify';
import { COLORS, getThemeColors } from '@/constants/colors';
import { useTheme } from '@/context/theme-context';
import { DaySpending, formatRupiah } from '@/utils/reports';

interface Props {
  data: DaySpending[];
}

const BAR_HEIGHT = 110;

export default function DailySpendingChart({ data }: Props) {
  const { isDark } = useTheme();
  const palette = getThemeColors(isDark ? 'dark' : 'light');
  const max = Math.max(...data.map((d) => d.amount), 1);
  const empty = data.every((d) => d.amount === 0);
  const todayIdx = (new Date().getDay() + 6) % 7;

  return (
    <View style={[styles.card, { backgroundColor: palette.card, borderColor: isDark ? '#263550' : '#E2E8F0' }]}>
      <Text style={[styles.title, { color: palette.textDark }]}>Pola Keuangan Harian</Text>
      {empty ? (
        <View style={styles.emptyWrap}>
          <View style={[styles.dashed, { borderColor: isDark ? '#334155' : '#CBD5E1' }]}>
            <Text style={[styles.emptyText, { color: palette.textMuted }]}>Belum ada pengeluaran minggu ini</Text>
            <Text style={[styles.emptySub, { color: palette.textMuted }]}>Catat transaksi untuk melihat pola harianmu</Text>
          </View>
        </View>
      ) : (
        <View style={styles.bars}>
          {data.map((d, i) => {
            const h = Math.max(10, Math.round((d.amount / max) * BAR_HEIGHT));
            const isToday = i === todayIdx;
            return (
              <View key={d.day} style={styles.col}>
                <Text style={[styles.value, { color: isToday ? palette.primary : palette.textMuted }]} numberOfLines={1}>
                  {d.amount > 0 ? formatRupiah(d.amount).replace('Rp ', '') : '0'}
                </Text>
                <View style={styles.barTrack}>
                  <View
                    style={[
                      styles.bar,
                      { height: h, backgroundColor: isToday ? palette.primary : isDark ? '#334155' : COLORS.chipBlue },
                    ]}
                  />
                </View>
                <Text style={[styles.day, { color: isToday ? palette.primary : palette.textMuted, fontWeight: isToday ? '700' : '500' }]}>
                  {d.day}
                </Text>
              </View>
            );
          })}
        </View>
      )}
      <TouchableOpacity style={[styles.cta, { backgroundColor: palette.primary }]} activeOpacity={0.85}>
        <Text style={styles.ctaLabel}>Catat Transaksi Hari Ini</Text>
        <Iconify icon="ph:plus-bold" size={16} color="#FFFFFF" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderWidth: 1, borderRadius: 18, padding: 18 },
  title: { fontSize: 18, fontWeight: '700', marginBottom: 16 },
  bars: { flexDirection: 'row', justifyContent: 'space-between', gap: 4, alignItems: 'flex-end' },
  col: { flex: 1, alignItems: 'center', gap: 6 },
  value: { fontSize: 18, fontWeight: '600' },
  barTrack: { height: BAR_HEIGHT, justifyContent: 'flex-end' },
  bar: { width: 22, borderRadius: 8 },
  day: { fontSize: 12 },
  emptyWrap: { paddingVertical: 8 },
  dashed: { borderWidth: 1.5, borderStyle: 'dashed', borderRadius: 14, paddingVertical: 28, alignItems: 'center', gap: 6 },
  emptyText: { fontSize: 18, fontWeight: '600' },
  emptySub: { fontSize: 12 },
  cta: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, borderRadius: 14, paddingVertical: 14, marginTop: 16 },
  ctaLabel: { color: '#FFFFFF', fontSize: 18, fontWeight: '700' },
});
