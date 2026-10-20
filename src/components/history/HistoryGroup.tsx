import React from 'react';
import { View, Text } from 'react-native';
import { TransactionItem } from '@/data/dummyData';
import { TransactionRow } from '@/components/transaction/TransactionRow';
import { itemType } from '@/constants/categoryVisuals';
import { getThemeColors } from '@/constants/colors';
import { useTheme } from '@/context/theme-context';
import { useI18n } from '@/i18n';
import { formatMoneyPlain } from '@/utils/money';

interface GroupProps {
  title: string;
  items: TransactionItem[];
  subtitle?: string;
  onPressItem?: (item: TransactionItem) => void;
  onLongPressItem?: (item: TransactionItem) => void;
}

export function HistoryGroup({ title, items, subtitle, onPressItem, onLongPressItem }: GroupProps) {
  const { isDark } = useTheme();
  const palette = getThemeColors(isDark ? 'dark' : 'light');
  const { t } = useI18n();
  const net = items.reduce((acc, tx) => {
    if (tx.amountValue == null) return acc;
    return acc + (itemType(tx) === 'income' ? tx.amountValue : -tx.amountValue);
  }, 0);

  const showNet = items.some((tx) => tx.amountValue != null);

  return (
    <View className="rounded-2xl border shadow-sm mb-4 overflow-hidden"
      style={{ backgroundColor: palette.card, borderColor: palette.divider, borderWidth: 1 }}>
      <View className="flex-row items-center justify-between px-4 pt-4 pb-2">
        <Text className="text-lg font-bold" style={{ color: palette.textDark }}>{title}</Text>
        <View className="flex-row items-center gap-2">
          {showNet ? (
            <Text
              className="text-lg font-semibold"
              style={{ color: net >= 0 ? palette.green : palette.red }}
            >
              {net < 0 ? '-' : '+'}
              {formatMoneyPlain(Math.abs(net), items[0]?.currency)}
            </Text>
          ) : null}
          <Text className="text-lg" style={{ color: palette.textMuted }}>
            {t('history.txCount', { count: items.length })}
          </Text>
        </View>
      </View>
      <View className="h-[1px] mx-4 mb-1" style={{ backgroundColor: palette.divider }} />
      {items.map((tx, index) => (
        <View key={tx.id}>
          {index > 0 ? (
            <View className="h-[1px] mx-4" style={{ backgroundColor: palette.divider }} />
          ) : null}
          <TransactionRow item={tx} onPress={onPressItem} onLongPress={onLongPressItem} subtitle={subtitle} />
        </View>
      ))}
    </View>
  );
}