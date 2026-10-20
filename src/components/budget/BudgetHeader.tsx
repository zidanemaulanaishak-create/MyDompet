import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Iconify } from 'react-native-iconify';
import { formatMoneyPlain } from '@/utils/money';
import { percentUsed, remainingBudget } from '@/utils/budget';
import { useI18n } from '@/i18n';

interface Props {
  monthLabel: string;
  limit: number;
  spent: number;
  onPressMonth: () => void;
  onPressInfo: () => void;
  onPressEdit: () => void;
}

export default function BudgetHeader({
  monthLabel,
  limit,
  spent,
  onPressMonth,
  onPressInfo,
  onPressEdit,
}: Props) {
  const { t } = useI18n();
  const remaining = remainingBudget(limit, spent);
  const used = percentUsed(spent, limit);

  return (
    <View className="bg-primary px-5 pt-4 pb-12 overflow-hidden">
      <View className="absolute -top-16 -right-14 w-48 h-48 rounded-full bg-sky/20" />
      <View className="absolute top-24 -left-20 w-40 h-40 rounded-full bg-white/10" />

      <View className="flex-row items-center justify-between">
        <TouchableOpacity
          className="flex-row items-center bg-white/15 rounded-full pl-4 pr-3 py-2"
          activeOpacity={0.8}
          onPress={onPressMonth}
        >
          <Text className="text-white text-lg font-bold">{monthLabel}</Text>
          <Iconify icon="ph:caret-down-bold" size={14} color="#E6EBFF" />
        </TouchableOpacity>
        <TouchableOpacity
          className="w-9 h-9 rounded-full bg-white/15 items-center justify-center"
          activeOpacity={0.8}
          onPress={onPressInfo}
        >
          <Iconify icon="ph:info-bold" size={18} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      <View className="flex-row items-center justify-between mt-6">
        <Text className="text-[#B9C2FF] text-lg tracking-wider font-semibold">{t('budget.remaining')}</Text>
        <TouchableOpacity
          className="rounded-full border border-white/40 px-3.5 py-1"
          activeOpacity={0.8}
          onPress={onPressEdit}
        >
          <Text className="text-white text-lg font-bold">{t('common.edit')}</Text>
        </TouchableOpacity>
      </View>

      <Text className="text-white text-[32px] font-extrabold mt-1.5">
        {formatMoneyPlain(remaining)}
      </Text>

      <View className="mt-5">
        <View className="h-2.5 rounded-full bg-white/20 overflow-hidden">
          <View
            className="h-2.5 rounded-full"
            style={{ width: `${Math.min(100, used)}%`, backgroundColor: '#4ADE80' }}
          />
        </View>
        <View className="flex-row items-center justify-between mt-2">
          <Text className="text-white text-lg font-medium">
            {t('budget.usedAmount', { amount: formatMoneyPlain(spent) })}
          </Text>
          <Text className="text-[#B9C2FF] text-lg">
            {t('budget.fromLimit', { amount: formatMoneyPlain(limit), percent: used })}
          </Text>
        </View>
      </View>
    </View>
  );
}