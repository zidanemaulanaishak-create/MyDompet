import React from 'react';
import { View, Text } from 'react-native';
import { TransactionItem } from '@/data/dummyData';
import { TransactionRow } from '@/components/transaction/TransactionRow';
import { itemType } from '@/constants/categoryVisuals';
import { formatMoneyPlain } from '@/utils/money';

interface GroupProps {
  title: string;
  items: TransactionItem[];
  subtitle?: string;
  onPressItem?: (item: TransactionItem) => void;
  onLongPressItem?: (item: TransactionItem) => void;
}

export function HistoryGroup({ title, items, subtitle, onPressItem, onLongPressItem }: GroupProps) {
  const net = items.reduce((acc, tx) => {
    if (tx.amountValue == null) return acc;
    return acc + (itemType(tx) === 'income' ? tx.amountValue : -tx.amountValue);
  }, 0);

  const showNet = items.some((tx) => tx.amountValue != null);

  return (
    <View className="bg-card rounded-2xl border border-[#F1F5F9] shadow-sm mb-4 overflow-hidden">
      <View className="flex-row items-center justify-between px-4 pt-4 pb-2">
        <Text className="text-lg font-bold text-[#0F172A]">{title}</Text>
        <View className="flex-row items-center gap-2">
          {showNet ? (
            <Text
              className="text-lg font-semibold"
              style={{ color: net >= 0 ? '#16A34A' : '#DC2626' }}
            >
              {net < 0 ? '-' : '+'}
              {formatMoneyPlain(Math.abs(net), items[0]?.currency)}
            </Text>
          ) : null}
          <Text className="text-lg text-[#64748B]">
            {items.length} transaksi
          </Text>
        </View>
      </View>
      <View className="h-[1px] bg-[#F1F5F9] mx-4 mb-1" />
      {items.map((tx, index) => (
        <View key={tx.id}>
          {index > 0 ? (
            <View className="h-[1px] bg-[#F1F5F9] mx-4" />
          ) : null}
          <TransactionRow item={tx} onPress={onPressItem} onLongPress={onLongPressItem} subtitle={subtitle} />
        </View>
      ))}
    </View>
  );
}