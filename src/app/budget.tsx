import React, { useState, useCallback, useMemo } from 'react';
import { ScrollView, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import BudgetHeader from '@/components/budget/BudgetHeader';
import MonthPickerSheet from '@/components/budget/MonthPickerSheet';
import BudgetInsightCard from '@/components/budget/BudgetInsightCard';
import BudgetAskAI from '@/components/budget/BudgetAskAI';
import BudgetCategoryList from '@/components/budget/BudgetCategoryList';
import BudgetLimitSheet from '@/components/budget/BudgetLimitSheet';
import { getThemeColors } from '@/constants/colors';
import { useTheme } from '@/context/theme-context';
import { BudgetCategory, currentBudgetMonthKey } from '@/data/budgetData';
import { useBudget } from '@/context/budget-context';
import { useTransactions } from '@/context/transaction-context';
import {
  buildBudget,
  dailyAllowance,
  remainingBudget,
  totalLimit,
  totalSpent,
} from '@/utils/budget';
import { monthLabel } from '@/utils/dates';
import { useI18n } from '@/i18n';

interface SheetMode {
  categoryId?: string;
  initialLimit?: number;
}

export default function BudgetScreen() {
  const insets = useSafeAreaInsets();
  const { t } = useI18n();
  const { isDark } = useTheme();
  const palette = getThemeColors(isDark ? 'dark' : 'light');
  const { transactions } = useTransactions();
  const { getBudgetsForMonth, setLimit, removeBudget } = useBudget();

  const [monthKey, setMonthKey] = useState(currentBudgetMonthKey());
  const [monthPickerOpen, setMonthPickerOpen] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [sheetMode, setSheetMode] = useState<SheetMode>({});

  const limits = useMemo(
    () =>
      getBudgetsForMonth(monthKey).map((b) => ({
        categoryId: b.categoryId,
        limit: b.limit,
      })),
    [getBudgetsForMonth, monthKey]
  );
  const budgetedIds = useMemo(() => limits.map((l) => l.categoryId), [limits]);

  const budget = useMemo(
    () => buildBudget(monthKey, limits, transactions),
    [monthKey, limits, transactions]
  );

  const spent = totalSpent(budget);
  const limit = totalLimit(budget);
  const remaining = remainingBudget(limit, spent);
  const daily = dailyAllowance(monthKey, remaining);
  const label = monthLabel(monthKey);

  const openAdd = useCallback(() => {
    setSheetMode({});
    setSheetOpen(true);
  }, []);

  const openEdit = useCallback((c: BudgetCategory) => {
    setSheetMode({ categoryId: c.categoryId, initialLimit: c.limit });
    setSheetOpen(true);
  }, []);

  const onPressEdit = useCallback(() => {
    openAdd();
  }, [openAdd]);

  const onPressInfo = useCallback(() => {
    Alert.alert(t('budget.remainingInfoTitle'), t('budget.remainingInfo'));
  }, [t]);

  return (
    <ScrollView
      className="flex-1"
      style={{ backgroundColor: palette.bg }}
      contentContainerStyle={{ paddingBottom: insets.bottom + 100 }}
      showsVerticalScrollIndicator={false}
    >
      <BudgetHeader
        monthLabel={label}
        limit={limit}
        spent={spent}
        onPressMonth={() => setMonthPickerOpen(true)}
        onPressInfo={onPressInfo}
        onPressEdit={onPressEdit}
      />

      <BudgetInsightCard dailyAmount={daily} />

      <BudgetAskAI />

      <BudgetCategoryList
        categories={budget?.categories ?? []}
        onAdd={openAdd}
        onEdit={openEdit}
      />

      <MonthPickerSheet
        visible={monthPickerOpen}
        selectedMonthKey={monthKey}
        onClose={() => setMonthPickerOpen(false)}
        onSelect={(k) => {
          setMonthKey(k);
          setMonthPickerOpen(false);
        }}
      />

      <BudgetLimitSheet
        visible={sheetOpen}
        monthKey={monthKey}
        categoryId={sheetMode.categoryId}
        initialLimit={sheetMode.initialLimit ?? 0}
        budgetedCategoryIds={budgetedIds}
        onClose={() => setSheetOpen(false)}
        onSave={(categoryId, lim) => setLimit(monthKey, categoryId, lim)}
        onDelete={(categoryId) => removeBudget(monthKey, categoryId)}
      />
    </ScrollView>
  );
}