import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Iconify } from 'react-native-iconify';
import { COLORS, getThemeColors } from '@/constants/colors';
import { useTheme } from '@/context/theme-context';
import { CategoryTotal, formatRupiah } from '@/utils/reports';

interface Props {
  title: string;
  total: number;
  items: CategoryTotal[];
  filterLabel?: string;
  onFilterPress?: () => void;
  compact?: boolean;
}

export default function CategoryBreakdownCard({ title, total, items, filterLabel, onFilterPress, compact = false }: Props) {
  const { isDark } = useTheme();
  const palette = getThemeColors(isDark ? 'dark' : 'light');

  return (
    <View style={[styles.card, { backgroundColor: palette.card, borderColor: isDark ? '#263550' : '#E2E8F0' }]}>
      <View style={styles.head}>
        <Text style={[styles.title, { color: palette.textDark }]}>{title}</Text>
        {filterLabel ? (
          <TouchableOpacity
            style={[styles.filter, { borderColor: isDark ? '#334155' : '#E2E8F0', backgroundColor: isDark ? '#1E293B' : '#F8F9FA' }]}
            activeOpacity={0.7}
            onPress={onFilterPress}
          >
            <Text style={[styles.filterLabel, { color: palette.textMuted }]} numberOfLines={1}>
              {filterLabel}
            </Text>
          </TouchableOpacity>
        ) : null}
      </View>

      <Text style={[styles.total, { color: palette.textDark }]}>{formatRupiah(total)}</Text>

      {items.length === 0 ? (
        <Text style={[styles.empty, { color: palette.textMuted }]}>Belum ada data pada periode ini.</Text>
      ) : (
        <View style={styles.list}>
          {items.map((it) => (
            <View key={it.id} style={[styles.row, compact && styles.rowCompact, { borderColor: isDark ? '#263550' : '#F1F5F9' }]}>
              <View style={[styles.icon, { backgroundColor: COLORS.chipBlue }]}>
                <Iconify icon={it.icon} size={17} color={COLORS.primary} />
              </View>
              <View style={styles.mid}>
                <Text style={[styles.name, { color: palette.textDark }]}>{it.label}</Text>
                <View style={[styles.barTrack, { backgroundColor: isDark ? '#1E293B' : '#EDF2F7' }]}>
                  <View style={[styles.barFill, { width: `${Math.min(100, it.percent)}%` }]} />
                </View>
                <Text style={[styles.pct, { color: palette.textMuted }]}>{it.percent}%</Text>
              </View>
              <Text style={[styles.amount, { color: palette.textDark }]}>{formatRupiah(it.total)}</Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderWidth: 1, borderRadius: 18, padding: 16 },
  head: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  title: { fontSize: 17, fontWeight: '700' },
  filter: { borderWidth: 1, borderRadius: 20, paddingHorizontal: 10, paddingVertical: 6 },
  filterLabel: { fontSize: 18, fontWeight: '600' },
  total: { fontSize: 20, fontWeight: '700', marginTop: 8 },
  empty: { fontSize: 18, marginTop: 8 },
  list: { marginTop: 14, gap: 10 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 10, borderWidth: 1, borderRadius: 14, padding: 10 },
  rowCompact: { paddingVertical: 8 },
  icon: { width: 38, height: 38, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  mid: { flex: 1 },
  name: { fontSize: 18, fontWeight: '700' },
  barTrack: { height: 6, borderRadius: 3, overflow: 'hidden', marginTop: 6 },
  barFill: { height: 6, borderRadius: 3, backgroundColor: COLORS.primary },
  pct: { fontSize: 18, marginTop: 4 },
  amount: { fontSize: 18, fontWeight: '700', textAlign: 'right' },
});
