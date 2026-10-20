import React, { useState, useMemo, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useTransactions } from '@/context/transaction-context';
import { TransactionItem } from '@/data/dummyData';
import { resolveCategory, itemType } from '@/constants/categoryVisuals';
import { getThemeColors } from '@/constants/colors';
import { useTheme } from '@/context/theme-context';
import { endOfDay, monthKey, monthLabel, parseItemDate, startOfDay } from '@/utils/dates';
import { getPeriodRange, ReportPeriod } from '@/utils/reports';
import { useI18n } from '@/i18n';
import { HistoryHeader } from '@/components/history/HistoryHeader';
import { HistorySearchBar } from '@/components/history/HistorySearchBar';
import { HistoryGroup } from '@/components/history/HistoryGroup';
import HistoryFilterSheet, { FilterMode } from '@/components/history/HistoryFilterSheet';
import EmptyState from '@/components/home/EmptyState';

interface HistoryGroupData {
  key: string;
  title: string;
  items: TransactionItem[];
}

export default function TransactionsScreen() {
  const insets = useSafeAreaInsets();
  const { isDark } = useTheme();
  const palette = getThemeColors(isDark ? 'dark' : 'light');
  const { t } = useI18n();
  const router = useRouter();
  const params = useLocalSearchParams<{ type?: string; period?: ReportPeriod }>();
  const { transactions, deleteTransaction } = useTransactions();

  const [query, setQuery] = useState('');
  const [selectedCatIds, setSelectedCatIds] = useState<string[]>([]);
  const [typeFilter, setTypeFilter] = useState<'income' | 'expense' | null>(() =>
    params.type === 'income' || params.type === 'expense' ? params.type : null
  );
  const [dateFrom, setDateFrom] = useState<Date | null>(() => {
    if (params.period && ['month', 'sixMonths', 'year'].includes(params.period)) {
      return getPeriodRange(params.period).from;
    }
    return null;
  });
  const [dateTo, setDateTo] = useState<Date | null>(() => {
    if (params.period && ['month', 'sixMonths', 'year'].includes(params.period)) {
      return getPeriodRange(params.period).to;
    }
    return null;
  });
  const [sheetOpen, setSheetOpen] = useState(false);
  const [sheetMode, setSheetMode] = useState<FilterMode>('date');
  const [sheetSession, setSheetSession] = useState(0);

  const dateActive = dateFrom !== null || dateTo !== null;
  const categoryActive = selectedCatIds.length > 0;
  const isFiltering = query.trim().length > 0 || dateActive || categoryActive || typeFilter !== null;

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const catSet = new Set(selectedCatIds);
    return transactions.filter((tx) => {
      if (typeFilter && itemType(tx) !== typeFilter) return false;
      if (q) {
        const category = resolveCategory(tx);
        const haystack = [
          tx.name,
          category?.label ?? tx.category,
          tx.note ?? '',
          tx.amount,
        ]
          .join(' ')
          .toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      if (catSet.size > 0) {
        const category = resolveCategory(tx);
        if (!category || !catSet.has(category.id)) return false;
      }
      if (dateActive) {
        const d = parseItemDate(tx);
        if (!d) return false;
        const time = d.getTime();
        if (dateFrom && time < startOfDay(dateFrom).getTime()) return false;
        if (dateTo && time > endOfDay(dateTo).getTime()) return false;
      }
      return true;
    });
  }, [transactions, query, selectedCatIds, dateFrom, dateTo, dateActive, typeFilter]);

  const groups = useMemo<HistoryGroupData[]>(() => {
    const map = new Map<string, TransactionItem[]>();
    for (const tx of filtered) {
      const d = parseItemDate(tx);
      const key = d ? monthKey(d) : '';
      const list = map.get(key);
      if (list) list.push(tx);
      else map.set(key, [tx]);
    }
    return [...map.entries()]
      .sort((a, b) => {
        if (a[0] === '') return 1;
        if (b[0] === '') return -1;
        return b[0].localeCompare(a[0]);
      })
      .map(([key, items]) => ({ key, title: monthLabel(key), items }));
  }, [filtered]);

  const openSheet = useCallback((openMode: FilterMode) => {
    setSheetMode(openMode);
    setSheetSession((s) => s + 1);
    setSheetOpen(true);
  }, []);

  const resetFilters = useCallback(() => {
    setQuery('');
    setSelectedCatIds([]);
    setTypeFilter(null);
    setDateFrom(null);
    setDateTo(null);
  }, []);

  const handlePressItem = useCallback(
    (item: TransactionItem) => {
      router.push(`/add-transaction?id=${item.id}`);
    },
    [router]
  );

  const handleLongPressItem = useCallback(
    (item: TransactionItem) => {
      Alert.alert(t('transactions.deleteTitle'), item.name, [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('common.delete'),
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteTransaction(item.id);
            } catch {
              Alert.alert(t('transactions.deleteFailed'), t('common.tryAgain'));
            }
          },
        },
      ]);
    },
    [deleteTransaction, t]
  );

  return (
    <View className="flex-1" style={{ backgroundColor: palette.bg }}>
      <ScrollView
        contentContainerStyle={{ paddingBottom: insets.bottom + 104 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <HistoryHeader />
        <HistorySearchBar
          query={query}
          onChangeQuery={setQuery}
          dateActive={dateActive}
          categoryActive={categoryActive}
          dateFilterCount={dateActive ? 1 : 0}
          categoryFilterCount={selectedCatIds.length}
          onPressDate={() => openSheet('date')}
          onPressCategory={() => openSheet('category')}
        />

        {isFiltering ? (
          <View className="flex-row items-center justify-between px-5 pb-3">
            <Text className="text-lg" style={{ color: palette.textMuted }}>
              {t('transactions.showingCount', { count: filtered.length })}
              {typeFilter ? ` • ${typeFilter === 'income' ? t('transactions.income') : t('transactions.expense')}` : ''}
            </Text>
            <TouchableOpacity onPress={resetFilters} hitSlop={8}>
              <Text className="text-lg font-bold" style={{ color: palette.primary }}>{t('transactions.resetFilter')}</Text>
            </TouchableOpacity>
          </View>
        ) : null}

        {groups.length === 0 ? (
          <View className="px-5 pt-6">
            <EmptyState
              icon="ph:receipt"
              title={isFiltering ? t('transactions.noResults') : t('transactions.emptyTitle')}
              description={
                isFiltering
                  ? t('transactions.noResultsDesc')
                  : t('transactions.emptyDesc')
              }
            />
          </View>
        ) : (
          <View className="px-5">
            {groups.map((group) => (
              <HistoryGroup
                key={group.key}
                title={group.title}
                items={group.items}
                onPressItem={handlePressItem}
                onLongPressItem={handleLongPressItem}
              />
            ))}
          </View>
        )}
      </ScrollView>

      <HistoryFilterSheet
        key={sheetSession}
        visible={sheetOpen}
        mode={sheetMode}
        onClose={() => setSheetOpen(false)}
        selectedCategoryIds={selectedCatIds}
        onApplyCategories={setSelectedCatIds}
        dateFrom={dateFrom}
        dateTo={dateTo}
        onApplyDates={(from, to) => {
          setDateFrom(from);
          setDateTo(to);
        }}
      />
    </View>
  );
}