import React, { useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
import { getThemeColors } from '@/constants/colors';
import { useTheme } from '@/context/theme-context';
import {
  dailySpending,
  compareTopCategories,
  filterByWeek,
  getWeekRange,
  formatWeekLabel,
  summarize,
} from '@/utils/reports';
import DailySpendingChart from './DailySpendingChart';
import TopCategoriesComparison from './TopCategoriesComparison';
import WeeklyAIInsightCard from './WeeklyAIInsightCard';
import WeeklyHeroHeader from './WeeklyHeroHeader';
import { useTransactions } from '@/context/transaction-context';

interface Props {
  onBack: () => void;
  onOpenAI?: () => void;
}

export default function WeeklyRecapScreen({ onBack, onOpenAI }: Props) {
  const { isDark } = useTheme();
  const palette = getThemeColors(isDark ? 'dark' : 'light');

  const { transactions } = useTransactions();

  const data = useMemo(() => {
    const now = new Date();
    const { from, to } = getWeekRange(now);
    const lastWeekStart = new Date(from);
    lastWeekStart.setDate(lastWeekStart.getDate() - 7);
    return { from, to, lastWeekStart, label: formatWeekLabel(from, to) };
  }, []);

  const thisWeek = useMemo(() => filterByWeek(transactions, data.from), [transactions, data.from]);
  const lastWeek = useMemo(() => filterByWeek(transactions, data.lastWeekStart), [transactions, data.lastWeekStart]);

  const summary = useMemo(() => summarize(thisWeek), [thisWeek]);
  const lastSummary = useMemo(() => summarize(lastWeek), [lastWeek]);
  const daily = useMemo(() => dailySpending(transactions, data.from), [transactions, data.from]);
  const topCats = useMemo(() => compareTopCategories(thisWeek, lastWeek), [thisWeek, lastWeek]);

  return (
    <View style={[styles.root, { backgroundColor: palette.bg }]}>
      <WeeklyHeroHeader
        title="Insight Mingguan"
        periodLabel={data.label}
        totalExpense={summary.expense}
        lastWeekExpense={lastSummary.expense}
        trend={daily.map((d) => d.amount)}
        onBack={onBack}
      />
      <View style={[styles.body, { backgroundColor: palette.bg }]}>
        <WeeklyAIInsightCard txCount={thisWeek.length} onAction={onOpenAI} />
        <DailySpendingChart data={daily} />
        <TopCategoriesComparison items={topCats} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  body: { marginTop: -48, paddingHorizontal: 16, gap: 14, paddingBottom: 120, borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingTop: 16 },
});
