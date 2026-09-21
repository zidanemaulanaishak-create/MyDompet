import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Iconify } from 'react-native-iconify';
import { COLORS } from '@/constants/colors';
import { TransactionItem } from '@/data/dummyData';
import { TransactionRow } from './TransactionsRow';
import EmptyState from './EmptyState';

interface Props {
  items: TransactionItem[];
  onSeeAll?: () => void;
  onPressItem?: (item: TransactionItem) => void;
}

export default function TransactionList({ items, onSeeAll, onPressItem }: Props) {
  return (
    <View className="bg-card rounded-2xl p-4 mb-6 shadow-sm">
      <TouchableOpacity
        className="flex-row justify-between items-center mb-4"
        onPress={onSeeAll}
      >
        <Text className="text-lg font-bold text-textDark">Transaksi Terbaru</Text>
        <Iconify icon="ph:caret-right-bold" size={15} color={COLORS.textMuted} />
      </TouchableOpacity>
      <View className="h-[2px] bg-[#D9D9D9] mb-4 -mx-4" />
      {items.length === 0 ? (
        <EmptyState
          icon="ph:receipt"
          title="Belum ada transaksi"
          description="Transaksi masuk dan keluar akan tampil di sini."
        />
      ) : (
        items.map((tx) => (
          <TransactionRow key={tx.id} item={tx} onPress={onPressItem} />
        ))
      )}
    </View>
  );
}