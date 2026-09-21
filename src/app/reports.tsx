import React, { useState, useMemo, useCallback } from 'react';
import { ScrollView, View, StyleSheet } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useTransactions } from '@/context/transaction-context';
import { ReportPeriod, filterByPeriod } from '@/utils/reports';
import ReportHeader from '@/components/reports/ReportHeader';
import ReportTabs, { ReportTab } from '@/components/reports/ReportTabs';
import CashFlowTab from '@/components/reports/CashFlowTab';
import BalanceTab from '@/components/reports/BalanceTab';
import { getThemeColors } from '@/constants/colors';
import { useTheme } from '@/context/theme-context';

export default function ReportsScreen() {
  const router = useRouter();
  const { isDark } = useTheme();
  const palette = getThemeColors(isDark ? 'dark' : 'light');
  const { transactions } = useTransactions();
  const params = useLocalSearchParams<{ period?: ReportPeriod }>();

  const [tab, setTab] = useState<ReportTab>('flow');
  const [period, setPeriod] = useState<ReportPeriod>(() => {
    if (params.period && ['month', 'sixMonths', 'year'].includes(params.period)) return params.period;
    return 'month';
  });

  const filtered = useMemo(() => filterByPeriod(transactions, period), [transactions, period]);

  const title = tab === 'flow' ? 'Laporan Keuangan' : 'Total Keuanganmu';

  const handleBack = useCallback(() => {
    if (router.canGoBack()) router.back();
    else router.replace('/home');
  }, [router]);

  const handleSeeDetail = useCallback(
    (type?: 'income' | 'expense') => {
      if (type) {
        router.push({ pathname: '/transactions', params: { type, period } });
      } else {
        router.push({ pathname: '/transactions', params: { period } });
      }
    },
    [router, period]
  );

  return (
    <View style={[styles.root, { backgroundColor: palette.bg }]}>
      <ReportHeader title={title} onBack={handleBack} />
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.tabWrap}>
          <ReportTabs active={tab} onChange={setTab} />
        </View>

        {tab === 'flow' ? (
          <CashFlowTab
            transactions={filtered}
            period={period}
            onPeriodChange={setPeriod}
            onSeeDetail={handleSeeDetail}
          />
        ) : (
          <BalanceTab
            transactions={filtered}
            period={period}
            onPeriodChange={setPeriod}
            onSeeDetail={handleSeeDetail}
          />
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  content: { paddingHorizontal: 16, paddingTop: 12 },
  tabWrap: { marginBottom: 14 },
});