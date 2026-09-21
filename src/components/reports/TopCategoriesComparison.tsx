import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Iconify } from 'react-native-iconify';
import { COLORS, getThemeColors } from '@/constants/colors';
import { useTheme } from '@/context/theme-context';
import { TopCategoryComparison, formatRupiah } from '@/utils/reports';

interface Props {
  items: TopCategoryComparison[];
}

export default function TopCategoriesComparison({ items }: Props) {
  const { isDark } = useTheme();
  const palette = getThemeColors(isDark ? 'dark' : 'light');

  return (
    <View style={[styles.card, { backgroundColor: palette.card, borderColor: isDark ? '#263550' : '#E2E8F0' }]}>
      <Text style={[styles.title, { color: palette.textDark }]}>Pengeluaran Terbanyak</Text>
      <Text style={[styles.sub, { color: isDark ? '#94A3B8' : '#64748B' }]}>
        Perbandingan kategori pengeluaran teratas kamu
      </Text>

      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.dot, { backgroundColor: palette.primary }]} />
          <Text style={[styles.legendLabel, { color: palette.textMuted }]}>Minggu ini</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.dot, { backgroundColor: COLORS.sky }]} />
          <Text style={[styles.legendLabel, { color: palette.textMuted }]}>Minggu lalu</Text>
        </View>
      </View>

      {items.length === 0 ? (
        <View style={styles.emptyWrap}>
          <View style={[styles.emptyIcon, { backgroundColor: isDark ? '#1E293B' : '#F1F5F9' }]}>
            <Iconify icon="ph:chart-bar-bold" size={30} color={palette.textMuted} />
          </View>
          <Text style={[styles.emptyText, { color: palette.textDark }]}>
            Belum ada data untuk kategori terbanyak.
          </Text>
          <Text style={[styles.emptySub, { color: palette.textMuted }]}>
            Catat lebih banyak transaksi untuk melihat analisis.
          </Text>
        </View>
      ) : (
        <View style={styles.list}>
          {items.map((it) => {
            const max = Math.max(it.thisWeek, it.lastWeek, 1);
            return (
              <View key={it.id} style={styles.row}>
                <View style={[styles.icon, { backgroundColor: isDark ? '#1E293B' : COLORS.chipBlue }]}>
                  <Iconify icon={it.icon} size={20} color={palette.primary} />
                </View>
                <View style={styles.mid}>
                  <Text style={[styles.name, { color: palette.textDark }]}>{it.label}</Text>
                  <View style={[styles.track, { backgroundColor: isDark ? '#1E293B' : '#EDF2F7' }]}>
                    <View style={[styles.fillNow, { width: `${Math.max(4, (it.thisWeek / max) * 100)}%`, backgroundColor: palette.primary }]} />
                  </View>
                  <View style={[styles.track, { backgroundColor: isDark ? '#1E293B' : '#EDF2F7' }]}>
                    <View style={[styles.fillPrev, { width: `${Math.max(4, (it.lastWeek / max) * 100)}%`, backgroundColor: COLORS.sky }]} />
                  </View>
                </View>
                <View style={styles.amounts}>
                  <Text style={[styles.now, { color: palette.textDark }]}>{formatRupiah(it.thisWeek)}</Text>
                  <Text style={[styles.prev, { color: palette.textMuted }]}>{formatRupiah(it.lastWeek)}</Text>
                </View>
              </View>
            );
          })}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderWidth: 1, borderRadius: 18, padding: 18 },
  title: { fontSize: 18, fontWeight: '700' },
  sub: { fontSize: 17, marginTop: 4 },
  legend: { flexDirection: 'row', gap: 16, marginTop: 14, marginBottom: 16 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  dot: { width: 12, height: 12, borderRadius: 6 },
  legendLabel: { fontSize: 18, fontWeight: '600' },
  list: { gap: 14 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  icon: { width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  mid: { flex: 1, gap: 5 },
  name: { fontSize: 18, fontWeight: '700' },
  track: { height: 8, borderRadius: 4, overflow: 'hidden' },
  fillNow: { height: 8, borderRadius: 4 },
  fillPrev: { height: 8, borderRadius: 4, opacity: 0.85 },
  amounts: { alignItems: 'flex-end', gap: 4 },
  now: { fontSize: 17, fontWeight: '700' },
  prev: { fontSize: 12 },
  emptyWrap: { alignItems: 'center', paddingVertical: 24, gap: 8 },
  emptyIcon: { width: 64, height: 64, borderRadius: 32, alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  emptyText: { fontSize: 18, fontWeight: '700', textAlign: 'center' },
  emptySub: { fontSize: 17, textAlign: 'center' },
});
