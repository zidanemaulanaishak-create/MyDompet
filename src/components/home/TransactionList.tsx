import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Iconify } from 'react-native-iconify';
import { getThemeColors } from '@/constants/colors';
import { useTheme } from '@/context/theme-context';
import { useI18n } from '@/i18n';
import { TransactionItem } from '@/data/dummyData';
import { TransactionRow } from './TransactionsRow';
import EmptyState from './EmptyState';

interface Props {
  items: TransactionItem[];
  onSeeAll?: () => void;
  onPressItem?: (item: TransactionItem) => void;
}

export default function TransactionList({ items, onSeeAll, onPressItem }: Props) {
  const { isDark } = useTheme();
  const { t } = useI18n();
  const palette = getThemeColors(isDark ? 'dark' : 'light');
  return (
    <View className="rounded-2xl p-4 mb-6 shadow-sm" style={{ backgroundColor: palette.card }}>
      <TouchableOpacity
        className="flex-row justify-between items-center mb-4"
        onPress={onSeeAll}
      >
        <Text className="text-lg font-bold" style={{ color: palette.textDark }}>{t('home.latestTransactions')}</Text>
        <Iconify icon="ph:caret-right-bold" size={15} color={palette.textMuted} />
      </TouchableOpacity>
      <View className="h-[2px] mb-4 -mx-4" style={{ backgroundColor: palette.border }} />
      {items.length === 0 ? (
        <EmptyState
          icon="ph:receipt"
          title={t('home.noTransactions')}
          description={t('home.noTxDesc')}
        />
      ) : (
        items.map((tx) => (
          <TransactionRow key={tx.id} item={tx} onPress={onPressItem} />
        ))
      )}
    </View>
  );
}