import React, { useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Iconify } from 'react-native-iconify';
import { COLORS, getThemeColors } from '@/constants/colors';
import { useTheme } from '@/context/theme-context';
import { TransactionItem } from '@/data/dummyData';
import PeriodSelector from './PeriodSelector';
import DonutChart from './DonutChart';
import { ReportPeriod, summarize, formatRupiah } from '@/utils/reports';

interface Props {
  transactions: TransactionItem[];
  period: ReportPeriod;
  onPeriodChange: (p: ReportPeriod) => void;
  onSeeDetail: () => void;
}

export default function BalanceTab({ transactions, period, onPeriodChange, onSeeDetail }: Props) {
  const { isDark } = useTheme();
  const palette = getThemeColors(isDark ? 'dark' : 'light');

  const summary = useMemo(() => summarize(transactions), [transactions]);
  const incomeTotal = summary.income;
  const expenseTotal = summary.expense;
  const incomePct = incomeTotal > 0 ? Math.round((incomeTotal / (incomeTotal + expenseTotal)) * 100) : 50;
  const expensePct = 100 - incomePct;

  return (
    <View style={styles.wrap}>
      <View style={[styles.card, { backgroundColor: palette.card, borderColor: isDark ? '#263550' : '#E2E8F0' }]}>
        <Text style={[styles.label, { color: palette.textMuted }]}>Total kas / saldo</Text>
        <Text style={[styles.big, { color: palette.textDark }]}>{formatRupiah(summary.balance)}</Text>
        <Text style={[styles.sub, { color: palette.textMuted }]}>Keuangan hari ini</Text>
        <View style={styles.period}>
          <PeriodSelector value={period} onChange={onPeriodChange} />
        </View>
      </View>

      <View style={[styles.card, { backgroundColor: palette.card, borderColor: isDark ? '#263550' : '#E2E8F0' }]}>
        <Text style={[styles.sectionTitle, { color: palette.textDark }]}>Distribusi Arus Keuangan</Text>
        <View style={styles.donutWrap}>
          <DonutChart percent={incomePct} label="Pemasukan" />
        </View>
        <View style={styles.legendRow}>
          <View style={styles.legendItem}>
            <View style={[styles.dot, { backgroundColor: COLORS.primary }]} />
            <Text style={[styles.legendText, { color: palette.textDark }]}>Pemasukan</Text>
            <Text style={[styles.legendPct, { color: palette.textDark }]}>{incomePct}%</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.dot, { backgroundColor: '#F87171' }]} />
            <Text style={[styles.legendText, { color: palette.textDark }]}>Pengeluaran</Text>
            <Text style={[styles.legendPct, { color: palette.textDark }]}>{expensePct}%</Text>
          </View>
        </View>
      </View>

      <TouchableOpacity style={styles.action} activeOpacity={0.85} onPress={onSeeDetail}>
        <Iconify icon="ph:list-bold" size={17} color="#FFFFFF" />
        <Text style={styles.actionLabel}>Lihat Semua Transaksi</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 14, paddingBottom: 120 },
  card: { borderWidth: 1, borderRadius: 18, padding: 16 },
  label: { fontSize: 18, fontWeight: '700' },
  big: { fontSize: 28, fontWeight: '700', marginTop: 6 },
  sub: { fontSize: 18, marginTop: 4 },
  period: { marginTop: 14 },
  sectionTitle: { fontSize: 17, fontWeight: '700', marginBottom: 12 },
  donutWrap: { alignItems: 'center', marginTop: 4 },
  legendRow: { flexDirection: 'row', gap: 24, marginTop: 18, justifyContent: 'center' },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  dot: { width: 10, height: 10, borderRadius: 5 },
  legendText: { fontSize: 18, fontWeight: '700' },
  legendPct: { fontSize: 18, fontWeight: '700' },
  action: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: COLORS.primary, borderRadius: 16, paddingVertical: 16 },
  actionLabel: { color: '#FFFFFF', fontSize: 18, fontWeight: '700' },
});