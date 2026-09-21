import React, { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Iconify } from 'react-native-iconify';
import { BudgetCategory } from '@/data/budgetData';
import { getCategoryById } from '@/constants/categories';
import { getPastelBg } from '@/constants/categoryVisuals';
import { COLORS } from '@/constants/colors';
import { formatMoneyPlain } from '@/utils/money';
import { categoryPercentUsed } from '@/utils/budget';
import { TransactionRow } from '@/components/transaction/TransactionRow';

interface Props {
  category: BudgetCategory;
  onEdit?: (category: BudgetCategory) => void;
}

export default function BudgetCategoryRow({ category, onEdit }: Props) {
  const [expanded, setExpanded] = useState(false);
  const meta = getCategoryById(category.categoryId, 'expense');
  const icon = meta?.icon ?? 'twemoji:label';
  const label = meta?.label ?? 'Tidak Terkategori';
  const pastel = getPastelBg(category.categoryId);
  const used = categoryPercentUsed(category);
  const big = category.spent > category.limit;
  const barColor = big ? COLORS.red : used >= 80 ? COLORS.orange : COLORS.green;

  return (
    <View className="bg-card rounded-2xl border border-[#F1F5F9] mb-3 overflow-hidden">
      <TouchableOpacity
        className="flex-row items-center px-4 py-3.5"
        activeOpacity={0.8}
        onPress={() => setExpanded((v) => !v)}
      >
        <View
          className="w-[42px] h-[42px] rounded-full items-center justify-center mr-3"
          style={{ backgroundColor: pastel }}
        >
          <Iconify icon={icon} size={22} />
        </View>

        <View className="flex-1">
          <View className="flex-row items-center justify-between">
            <Text className="text-lg font-bold text-[#0F172A]">{label}</Text>
            <View className="flex-row items-center gap-4">
              <TouchableOpacity onPress={() => onEdit?.(category)} hitSlop={8}>
                <Iconify icon="ph:pencil-bold" size={16} color={COLORS.textMuted} />
              </TouchableOpacity>
              <Iconify
                icon={expanded ? 'ph:caret-down-bold' : 'ph:caret-right-bold'}
                size={16}
                color={COLORS.textMuted}
              />
            </View>
          </View>

          <View className="h-[6px] rounded-full bg-[#EDEEF3] overflow-hidden mt-2.5">
            <View
              className="h-[6px] rounded-full"
              style={{ width: `${Math.min(100, used)}%`, backgroundColor: barColor }}
            />
          </View>

          <View className="flex-row items-center justify-between mt-1.5">
            <Text className="text-lg text-[#64748B]">
              Terpakai {formatMoneyPlain(category.spent)}
            </Text>
            <Text className="text-lg text-[#64748B]">
              dari {formatMoneyPlain(category.limit)}
            </Text>
          </View>
        </View>
      </TouchableOpacity>

      {expanded ? (
        <Animated.View entering={FadeInDown.duration(200)}>
          {category.transactions.length === 0 ? (
            <Text className="text-lg text-[#64748B] px-4 pb-4">
              Belum ada transaksi di kategori ini bulan ini.
            </Text>
          ) : (
            category.transactions.map((tx, i) => (
              <View key={tx.id}>
                {i > 0 ? <View className="h-[1px] bg-[#F1F5F9] mx-4" /> : null}
                <TransactionRow item={tx} />
              </View>
            ))
          )}
        </Animated.View>
      ) : null}
    </View>
  );
}