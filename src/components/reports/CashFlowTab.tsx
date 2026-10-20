import React, { useMemo, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { Iconify } from 'react-native-iconify';
import { COLORS, getThemeColors } from '@/constants/colors';
import { useTheme } from '@/context/theme-context';
import { TransactionItem } from '@/data/dummyData';
import { getCategoriesForType } from '@/constants/categories';
import PeriodSelector from './PeriodSelector';
import CashFlowChart from './CashFlowChart';
import CategoryBreakdownCard from './CategoryBreakdownCard';
import { ReportPeriod, monthlyFlow, breakdownByType, summarize, formatRupiah } from '@/utils/reports';
import { useI18n } from '@/i18n';

interface Props {
  transactions: TransactionItem[];
  period: ReportPeriod;
  onPeriodChange: (p: ReportPeriod) => void;
  onSeeDetail: (type: 'income' | 'expense') => void;
}

export default function CashFlowTab({ transactions, period, onPeriodChange, onSeeDetail }: Props) {
  const { isDark } = useTheme();
  const palette = getThemeColors(isDark ? 'dark' : 'light');
  const { t } = useI18n();

  const [incomeCatLabel, setIncomeCatLabel] = useState('Semua');
  const [expenseCatLabel, setExpenseCatLabel] = useState('Semua');

  const summary = useMemo(() => summarize(transactions), [transactions]);
  const incomeBreakdown = useMemo(() => breakdownByType(transactions, 'income'), [transactions]);
  const expenseBreakdown = useMemo(() => breakdownByType(transactions, 'expense'), [transactions]);
  const chartData = useMemo(() => monthlyFlow(transactions, period === 'month' ? 1 : period === 'sixMonths' ? 6 : 12), [transactions, period]);

  const incomeFiltered = useMemo(() => {
    if (incomeCatLabel === 'Semua') return incomeBreakdown;
    return incomeBreakdown.filter((b) => b.label === incomeCatLabel);
  }, [incomeBreakdown, incomeCatLabel]);
  const expenseFiltered = useMemo(() => {
    if (expenseCatLabel === 'Semua') return expenseBreakdown;
    return expenseBreakdown.filter((b) => b.label === expenseCatLabel);
  }, [expenseBreakdown, expenseCatLabel]);

  return (
    <View style={styles.wrap}>
      <View style={[styles.card, { backgroundColor: palette.card, borderColor: isDark ? '#263550' : '#E2E8F0' }]}>
        <Text style={[styles.cardHead, { color: palette.textMuted }]}>{t('reports.balanceThisPeriod')}</Text>
        <Text style={[styles.bigBalance, { color: palette.textDark }]}>{formatRupiah(summary.balance)}</Text>
        <View style={styles.metaRow}>
          <View style={styles.meta}>
            <View style={[styles.metaDot, { backgroundColor: '#10B981' }]} />
            <Text style={[styles.metaLabel, { color: palette.textMuted }]}>{t('reports.income')}</Text>
            <Text style={[styles.metaValue, { color: palette.textDark }]}>{formatRupiah(summary.income)}</Text>
          </View>
          <View style={styles.meta}>
            <View style={[styles.metaDot, { backgroundColor: '#EF4444' }]} />
            <Text style={[styles.metaLabel, { color: palette.textMuted }]}>{t('reports.expense')}</Text>
            <Text style={[styles.metaValue, { color: palette.textDark }]}>{formatRupiah(summary.expense)}</Text>
          </View>
        </View>
        <View style={styles.period}>
          <PeriodSelector value={period} onChange={onPeriodChange} />
        </View>
      </View>

      <View style={[styles.card, { backgroundColor: palette.card, borderColor: isDark ? '#263550' : '#E2E8F0' }]}>
        <Text style={[styles.cardTitle, { color: palette.textDark }]}>{t('reports.cashFlowChartTitle')}</Text>
        <View style={styles.chart}>
          <CashFlowChart data={chartData} />
        </View>
      </View>

      <CategoryBreakdownCard
        title={t('reports.income')}
        total={incomeFiltered.reduce((s, b) => s + b.total, 0)}
        items={incomeFiltered}
        filterLabel={incomeCatLabel === 'Semua' ? t('common.all') : incomeCatLabel}
        onFilterPress={() => {
          const cats = getCategoriesForType('income');
          Alert.alert(t('reports.filterIncome'), t('reports.chooseCategory'), [
            { text: t('common.all'), onPress: () => setIncomeCatLabel('Semua') },
            ...cats.map((c) => ({ text: c.label, onPress: () => setIncomeCatLabel(c.label) })),
          ]);
        }}
        compact
      />

      <CategoryBreakdownCard
        title={t('reports.expense')}
        total={expenseFiltered.reduce((s, b) => s + b.total, 0)}
        items={expenseFiltered}
        filterLabel={expenseCatLabel === 'Semua' ? t('common.all') : expenseCatLabel}
        onFilterPress={() => {
          const cats = getCategoriesForType('expense');
          Alert.alert(t('reports.filterExpense'), t('reports.chooseCategory'), [
            { text: t('common.all'), onPress: () => setExpenseCatLabel('Semua') },
            ...cats.map((c) => ({ text: c.label, onPress: () => setExpenseCatLabel(c.label) })),
          ]);
        }}
      />

      <TouchableOpacity
        style={styles.action}
        activeOpacity={0.85}
        onPress={() => onSeeDetail('expense')}
      >
        <Text style={styles.actionLabel}>{t('reports.viewExpenseDetail')}</Text>
        <Iconify icon="ph:arrow-right-bold" size={16} color="#FFFFFF" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 14, paddingBottom: 120 },
  card: { borderWidth: 1, borderRadius: 18, padding: 16 },
  cardHead: { fontSize: 18, fontWeight: '700' },
  bigBalance: { fontSize: 28, fontWeight: '700', marginTop: 6 },
  metaRow: { flexDirection: 'row', gap: 16, marginTop: 16 },
  meta: { flex: 1 },
  metaDot: { width: 10, height: 10, borderRadius: 5, marginBottom: 6 },
  metaLabel: { fontSize: 18, fontWeight: '600' },
  metaValue: { fontSize: 18, fontWeight: '700' },
  period: { marginTop: 14 },
  cardTitle: { fontSize: 17, fontWeight: '700', marginBottom: 12 },
  chart: {},
  action: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: COLORS.primary, borderRadius: 16, paddingVertical: 16 },
  actionLabel: { color: '#FFFFFF', fontSize: 18, fontWeight: '700' },
});