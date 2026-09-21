import React from 'react';
import { View } from 'react-native';
import { TransactionItem } from '@/data/dummyData';
import { TransactionRow as CategoryTransactionRow } from '@/components/transaction/TransactionRow';
import { resolveCategory } from '@/constants/categoryVisuals';

interface RowProps {
  item: TransactionItem;
  onPress?: (item: TransactionItem) => void;
}

export function TransactionRow({ item, onPress }: RowProps) {
  const category = resolveCategory(item);
  const subtitle = `${category?.label ?? item.category} • ${item.date}`;
  return (
    <View className="mb-2">
      <CategoryTransactionRow item={item} onPress={onPress} subtitle={subtitle} />
    </View>
  );
}