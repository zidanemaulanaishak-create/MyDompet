import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { RefreshControl, ScrollView, View } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import HeaderSummary from '@/components/home/HeaderSummary';
import QuickActions from '@/components/home/QuickActions';
import SpendingChart from '@/components/home/SpendingChart';
import AIInsightCard from '@/components/home/AIInsightCard';
import BudgetCard from '@/components/home/BudgetCard';
import TransactionList from '@/components/home/TransactionList';
import GoalList from '@/components/home/GoalList';
import { quickActions } from '@/data/dummyData';
import type { GoalItem } from '@/data/dummyData';
import { useGoals } from '@/context/goal-context';
import { daysLeftLabel, formatRupiah as formatGoalRupiah, goalProgress } from '@/utils/goals';
import { getFirstName, useAuth } from '@/context/auth-context';
import { useTransactions } from '@/context/transaction-context';
import { useBudget } from '@/context/budget-context';
import { useTheme } from '@/context/theme-context';
import { getThemeColors } from '@/constants/colors';
import { filterByPeriod, summarize, formatRupiah, txAmount } from '@/utils/reports';
import { buildBudget, totalLimit, totalSpent } from '@/utils/budget';
import { monthKey, monthLabel, parseItemDate } from '@/utils/dates';
import { itemType } from '@/constants/categoryVisuals';
import { buildRuleInsight } from '@/utils/insights';
import { buildContextSnapshot } from '@/services/snapshot';
import { requestInsight, type InsightResult } from '@/services/ai';
import { useI18n, shortDayNames } from '@/i18n';

export default function HomeScreen() {
  const { user, onboarding } = useAuth();
  const { transactions: liveTransactions, refresh: refreshTransactions } = useTransactions();
  const { getBudgetsForMonth } = useBudget();
  const { goals: liveGoals, refresh: refreshGoals } = useGoals();
  const router = useRouter();
  const { isDark } = useTheme();
  const { t, locale } = useI18n();
  const palette = getThemeColors(isDark ? 'dark' : 'light');
  const [refreshing, setRefreshing] = useState(false);
  const [aiInsight, setAiInsight] = useState<{ version: string; result: InsightResult } | null>(
    null
  );

  const name = user ? getFirstName(user.name) : t('home.friend');

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

  const dayNames = shortDayNames[locale];

  const weeklyData = useMemo(() => {
    const now = new Date();
    const buckets = new Map<string, number>();
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
      buckets.set(`${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`, 0);
    }
    for (const tx of liveTransactions) {
      if (itemType(tx) !== 'expense') continue;
      const d = parseItemDate(tx);
      if (!d) continue;
      const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
      if (!buckets.has(key)) continue;
      buckets.set(key, (buckets.get(key) ?? 0) + txAmount(tx));
    }
    return [...buckets.entries()].map(([key, amount]) => {
      const parts = key.split('-').map(Number);
      const day = new Date(parts[0], parts[1], parts[2]).getDay();
      return { day: dayNames[day] ?? '', amount };
    });
  }, [liveTransactions, dayNames]);

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
      await Promise.all([refreshTransactions(), refreshGoals()]);
    } finally {
      setRefreshing(false);
    }
  }, [refreshTransactions, refreshGoals]);

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
      className="flex-1"
      style={{ backgroundColor: palette.bg }}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: 100 }}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <HeaderSummary
        name={name}
        balanceLabel={t('home.sisaKeuangan')}
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
        <SpendingChart data={weeklyData} />

        <BudgetCard allowance={totalLimit(monthBudget)} spent={totalSpent(monthBudget)} monthLabel={monthLabel(currentMonthKey)} />

        <AIInsightCard
          insightText={insight.insight}
          suggestions={insight.suggestions}
          onSuggestionPress={onAsk}
        />

        <TransactionList
          items={liveTransactions}
          onSeeAll={() => router.push('/transactions')}
          onPressItem={(tx) => onAsk(t('home.detailTransaction', { name: tx.name }))}
        />

        <GoalList
          title={t('home.goals')}
          items={liveGoals.slice(0, 3).map(
            (g): GoalItem => ({
              id: g.id,
              name: g.name,
              days: daysLeftLabel(g.deadlineTs, locale),
              saved: formatGoalRupiah(g.saved),
              target: `${Math.round(goalProgress(g) * 100)}% ${t('home.goalOf')} ${formatGoalRupiah(g.target)}`,
              icon: g.icon || 'ph:target-bold',
              progress: goalProgress(g),
            })
          )}
          onSeeAll={() => router.push('/goals' as never)}
          onPressItem={() => router.push('/goals' as never)}
        />
      </View>
    </ScrollView>
  );
}