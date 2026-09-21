import React, { useCallback, useEffect, useRef, useState } from 'react';
import { RefreshControl, ScrollView, View } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import HeaderSummary from '@/components/home/HeaderSummary';
import QuickActions from '@/components/home/QuickActions';
import SpendingChart from '@/components/home/SpendingChart';
import AIInsightCard from '@/components/home/AIInsightCard';
import BudgetCard from '@/components/home/BudgetCard';
import TransactionList from '@/components/home/TransactionList';
import GoalList from '@/components/home/GoalList';
import { quickActions, goals, weeklySpending } from '@/data/dummyData';
import { getFirstName, useAuth } from '@/context/auth-context';
import { useTransactions } from '@/context/transaction-context';
import { useBudget } from '@/context/budget-context';
import { filterByPeriod, summarize, formatRupiah } from '@/utils/reports';
import { buildBudget, totalLimit, totalSpent } from '@/utils/budget';
import { monthKey, monthLabel } from '@/utils/dates';
import { buildRuleInsight } from '@/utils/insights';
import { buildContextSnapshot } from '@/services/snapshot';
import { requestInsight, type InsightResult } from '@/services/ai';

export default function HomeScreen() {
  const { user, onboarding } = useAuth();
  const { transactions: liveTransactions, refresh: refreshTransactions } = useTransactions();
  const { getBudgetsForMonth } = useBudget();
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);
  const [aiInsight, setAiInsight] = useState<{ version: string; result: InsightResult } | null>(
    null
  );

  const name = user ? getFirstName(user.name) : 'Teman';

  const today = new Date();
  const currentMonthKey = monthKey(today);
  const mainIncome = onboarding?.mainIncome ?? 0;

  const budgetLimits = getBudgetsForMonth(currentMonthKey).map((b) => ({
    categoryId: b.categoryId,
    limit: b.limit,
  }));
  const monthBudget = buildBudget(currentMonthKey, budgetLimits, liveTransactions);

  const monthSum = summarize(filterByPeriod(liveTransactions, 'month'));
  const allSum = summarize(liveTransactions);

  const monthIncome = monthSum.income;
  const monthExpense = monthSum.expense;

  const totalIncome = allSum.income;
  const totalExpense = allSum.expense;

  const monthBalance = mainIncome + monthSum.income - monthExpense;
  const totalBalance = mainIncome + allSum.income - allSum.expense;

  const snapshot = buildContextSnapshot({
    userName: user?.name ?? 'Teman',
    occupation: onboarding?.occupation ?? null,
    mainIncome,
    transactions: liveTransactions,
    budgets: budgetLimits,
  });

  const ruleInsight = buildRuleInsight(snapshot);
  const insight = aiInsight && aiInsight.version === snapshot.dataVersion ? aiInsight.result : ruleInsight;

  const monthDate = new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(today);

  const dataRef = useRef<{
    userName: string;
    occupation: string | null;
    mainIncome: number;
    transactions: typeof liveTransactions;
    budgets: typeof budgetLimits;
  } | null>(null);

  useEffect(() => {
    dataRef.current = {
      userName: user?.name ?? 'Teman',
      occupation: onboarding?.occupation ?? null,
      mainIncome,
      transactions: liveTransactions,
      budgets: budgetLimits,
    };
  }, [user, onboarding, mainIncome, liveTransactions, budgetLimits]);

  const version = snapshot.dataVersion;

  useFocusEffect(
    useCallback(() => {
      let active = true;
      const d = dataRef.current;
      if (!d || !version) return;
      const snap = buildContextSnapshot({
        userName: d.userName,
        occupation: d.occupation,
        mainIncome: d.mainIncome,
        transactions: d.transactions,
        budgets: d.budgets,
      });
      const rule = buildRuleInsight(snap);
      (async () => {
        const res = await requestInsight(snap, rule);
        if (active) setAiInsight({ version: snap.dataVersion, result: res });
      })();
      return () => {
        active = false;
      };
    }, [version])
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await refreshTransactions();
    } finally {
      setRefreshing(false);
    }
  }, [refreshTransactions]);

  const onQuickAction = (label: string) => {
    switch (label) {
      case 'AI Assitant':
        router.push('/ai-assistant');
        break;
      case 'Upload':
        router.push('/upload');
        break;
      case 'Financial Goals':
        router.push('/goals' as never);
        break;
      case 'Weekly Rekap':
        router.push('/weekly' as never);
        break;
      case 'Laporan Keuangan':
        router.push('/reports');
        break;
      default:
        router.push('/transactions');
        break;
    }
  };

  const onAsk = (text: string) => {
    router.push({ pathname: '/ai-assistant', params: { q: text } });
  };

  return (
    <ScrollView
      className="flex-1 bg-bg"
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: 100 }}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <HeaderSummary
        name={name}
        balanceLabel="SISA KEUANGAN"
        monthLabel={monthLabel(currentMonthKey)}
        monthDate={monthDate}
        monthBalance={formatRupiah(monthBalance)}
        monthIncome={formatRupiah(monthIncome)}
        monthExpense={formatRupiah(monthExpense)}
        totalBalance={formatRupiah(totalBalance)}
        totalIncome={formatRupiah(totalIncome)}
        totalExpense={formatRupiah(totalExpense)}
      />

      <QuickActions
        items={quickActions}
        onPress={(item) => onQuickAction(item.label)}
      />

      <View className="px-4 pt-4">
        <SpendingChart data={weeklySpending} />

        <BudgetCard allowance={totalLimit(monthBudget)} spent={totalSpent(monthBudget)} monthLabel={monthLabel(currentMonthKey)} />

        <AIInsightCard
          insightText={insight.insight}
          suggestions={insight.suggestions}
          onSuggestionPress={onAsk}
        />

        <TransactionList
          items={liveTransactions}
          onSeeAll={() => router.push('/transactions')}
          onPressItem={(tx) => onAsk(`Lihat detail transaksi: ${tx.name}`)}
        />

        <GoalList
          title="Financial Goals"
          items={goals}
          onSeeAll={() => router.push('/goals' as never)}
          onPressItem={(g) => onAsk(`Lihat target: ${g.name}`)}
        />
      </View>
    </ScrollView>
  );
}