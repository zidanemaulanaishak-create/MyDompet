import React, { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Iconify } from 'react-native-iconify';
import { BudgetCategory } from '@/data/budgetData';
import { getCategoryById } from '@/constants/categories';
import { getPastelBg } from '@/constants/categoryVisuals';
import { getThemeColors } from '@/constants/colors';
import { useTheme } from '@/context/theme-context';
import { formatMoneyPlain } from '@/utils/money';
import { categoryPercentUsed } from '@/utils/budget';
import { TransactionRow } from '@/components/transaction/TransactionRow';
import { useI18n } from '@/i18n';

interface Props {
  category: BudgetCategory;
  onEdit?: (category: BudgetCategory) => void;
}

export default function BudgetCategoryRow({ category, onEdit }: Props) {
  const [expanded, setExpanded] = useState(false);
  const { t } = useI18n();
  const { isDark } = useTheme();
  const palette = getThemeColors(isDark ? 'dark' : 'light');
  const meta = getCategoryById(category.categoryId, 'expense');
  const icon = meta?.icon ?? 'twemoji:label';
  const label = meta?.label ?? t('budget.uncategorized');
  const pastel = getPastelBg(category.categoryId);
  const used = categoryPercentUsed(category);
  const big = category.spent > category.limit;
  const barColor = big ? palette.red : used >= 80 ? palette.orange : palette.green;

  return (
    <View
      className="rounded-2xl border mb-3 overflow-hidden"
      style={{ backgroundColor: palette.card, borderColor: palette.divider }}
    >
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
            <Text className="text-lg font-bold" style={{ color: palette.textDark }}>
              {label}
            </Text>
            <View className="flex-row items-center gap-4">
              <TouchableOpacity onPress={() => onEdit?.(category)} hitSlop={8}>
                <Iconify icon="ph:pencil-bold" size={16} color={palette.textMuted} />
              </TouchableOpacity>
              <Iconify
                icon={expanded ? 'ph:caret-down-bold' : 'ph:caret-right-bold'}
                size={16}
                color={palette.textMuted}
              />
            </View>
          </View>

          <View className="h-[6px] rounded-full overflow-hidden mt-2.5" style={{ backgroundColor: palette.track }}>
            <View
              className="h-[6px] rounded-full"
              style={{ width: `${Math.min(100, used)}%`, backgroundColor: barColor }}
            />
          </View>

          <View className="flex-row items-center justify-between mt-1.5">
            <Text className="text-lg" style={{ color: palette.textMuted }}>
              {t('budget.usedAmount', { amount: formatMoneyPlain(category.spent) })}
            </Text>
            <Text className="text-lg" style={{ color: palette.textMuted }}>
              {t('budget.fromAmount', { amount: formatMoneyPlain(category.limit) })}
            </Text>
          </View>
        </View>
      </TouchableOpacity>

      {expanded ? (
        <Animated.View entering={FadeInDown.duration(200)}>
          {category.transactions.length === 0 ? (
            <Text className="text-lg px-4 pb-4" style={{ color: palette.textMuted }}>
              {t('budget.noTransactions')}
            </Text>
          ) : (
            category.transactions.map((tx, i) => (
              <View key={tx.id}>
                {i > 0 ? (
                  <View
                    className="h-[1px] mx-4"
                    style={{ backgroundColor: palette.divider }}
                  />
                ) : null}
                <TransactionRow item={tx} />
              </View>
            ))
          )}
        </Animated.View>
      ) : null}
    </View>
  );
}