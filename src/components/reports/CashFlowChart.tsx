import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { getThemeColors } from '@/constants/colors';
import { useTheme } from '@/context/theme-context';
import { MonthFlow, formatCompact } from '@/utils/reports';

interface Props {
  data: MonthFlow[];
}

const CHART_HEIGHT = 120;

export default function CashFlowChart({ data }: Props) {
  const { isDark } = useTheme();
  const palette = getThemeColors(isDark ? 'dark' : 'light');
  const max = Math.max(...data.flatMap((d) => [d.income, d.expense]), 1);
  const topTick = Math.ceil(max / 3);

  return (
    <View>
      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.dot, { backgroundColor: '#10B981' }]} />
          <Text style={[styles.legendLabel, { color: palette.textMuted }]}>Pemasukan</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.dot, { backgroundColor: '#EF4444' }]} />
          <Text style={[styles.legendLabel, { color: palette.textMuted }]}>Pengeluaran</Text>
        </View>
      </View>

      <View style={styles.chartRow}>
        <View style={styles.yAxis}>
          {[3, 2, 1].map((i) => (
            <Text key={i} style={[styles.yLabel, { color: palette.textMuted }]}>
              {formatCompact(topTick * i)}
            </Text>
          ))}
        </View>
        <View style={styles.bars}>
          {data.map((d) => {
            const hIn = Math.max(4, Math.round((d.income / max) * CHART_HEIGHT));
            const hOut = Math.max(4, Math.round((d.expense / max) * CHART_HEIGHT));
            return (
              <View key={d.key} style={styles.group}>
                <View style={styles.pair}>
                  <View style={[styles.bar, { height: hIn, backgroundColor: '#10B981' }]} />
                  <View style={[styles.bar, { height: hOut, backgroundColor: '#EF4444' }]} />
                </View>
                <Text style={[styles.xLabel, { color: palette.textMuted }]}>{d.shortLabel}</Text>
              </View>
            );
          })}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  legend: { flexDirection: 'row', gap: 16, marginBottom: 14 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  dot: { width: 10, height: 10, borderRadius: 5 },
  legendLabel: { fontSize: 18, fontWeight: '600' },
  chartRow: { flexDirection: 'row', gap: 8 },
  yAxis: { height: CHART_HEIGHT, justifyContent: 'space-between', paddingBottom: 18 },
  yLabel: { fontSize: 9 },
  bars: { flex: 1, flexDirection: 'row', justifyContent: 'space-between', gap: 4 },
  group: { flex: 1, alignItems: 'center' },
  pair: { flexDirection: 'row', alignItems: 'flex-end', gap: 3, height: CHART_HEIGHT },
  bar: { width: 10, borderRadius: 5 },
  xLabel: { fontSize: 18, marginTop: 6 },
});
