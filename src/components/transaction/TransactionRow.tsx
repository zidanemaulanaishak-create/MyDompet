import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Iconify } from 'react-native-iconify';
import { TransactionItem } from '@/data/dummyData';
import {
  getCategoryColor,
  itemType,
  resolveCategory,
} from '@/constants/categoryVisuals';
import { formatMoney } from '@/utils/money';

interface RowProps {
  item: TransactionItem;
  onPress?: (item: TransactionItem) => void;
  onLongPress?: (item: TransactionItem) => void;
  subtitle?: string;
}

export function TransactionRow({ item, onPress, onLongPress, subtitle }: RowProps) {
  const type = itemType(item);
  const category = resolveCategory(item);
  const bgColor = getCategoryColor(item);
  const icon = category?.icon ?? item.icon;

  const amount =
    item.amountValue != null
      ? formatMoney(item.amountValue, item.currency, type)
      : item.amount;

  return (
    <TouchableOpacity
      className="flex-row items-center px-4 py-3"
      activeOpacity={0.7}
      onPress={() => onPress?.(item)}
      onLongPress={() => onLongPress?.(item)}
    >
      <View
        className="w-[42px] h-[42px] rounded-full items-center justify-center mr-3"
        style={{ backgroundColor: bgColor }}
      >
        <Iconify icon={icon} size={22} />
      </View>
      <View className="flex-1 pr-2">
        <Text className="text-lg font-semibold text-[#0F172A]" numberOfLines={1}>
          {item.name}
        </Text>
        <Text className="text-lg text-[#64748B] mt-0.5" numberOfLines={1}>
          {subtitle ?? category?.label ?? item.category ?? ''}
        </Text>
      </View>
      <Text
        className="text-lg font-semibold"
        style={{ color: type === 'income' ? '#16A34A' : '#DC2626' }}
        numberOfLines={1}
      >
        {amount}
      </Text>
    </TouchableOpacity>
  );
}