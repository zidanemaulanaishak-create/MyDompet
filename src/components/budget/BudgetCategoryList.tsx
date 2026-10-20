import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Iconify } from 'react-native-iconify';
import { getThemeColors } from '@/constants/colors';
import { useTheme } from '@/context/theme-context';
import { BudgetCategory } from '@/data/budgetData';
import BudgetCategoryRow from './BudgetCategoryRow';
import { useI18n } from '@/i18n';

interface Props {
  categories: BudgetCategory[];
  onAdd: () => void;
  onEdit: (category: BudgetCategory) => void;
}

export default function BudgetCategoryList({ categories, onAdd, onEdit }: Props) {
  const { t } = useI18n();
  const { isDark } = useTheme();
  const palette = getThemeColors(isDark ? 'dark' : 'light');

  return (
    <View className="mb-6">
      <View className="flex-row items-center justify-between px-5 mb-3">
        <Text className="text-lg font-bold" style={{ color: palette.textDark }}>
          {t('budget.categoriesTitle')}
        </Text>
        <TouchableOpacity
          className="rounded-full bg-orange px-3.5 py-1.5 flex-row items-center gap-1"
          activeOpacity={0.85}
          onPress={onAdd}
        >
          <Iconify icon="ph:plus-bold" size={13} color="#FFFFFF" />
          <Text className="text-white text-lg font-bold">{t('budget.add')}</Text>
        </TouchableOpacity>
      </View>

      <View className="px-5">
        {categories.length === 0 ? (
          <Text className="text-lg px-1" style={{ color: palette.textMuted }}>
            {t('budget.empty')}
          </Text>
        ) : (
          categories.map((c) => (
            <BudgetCategoryRow key={c.categoryId} category={c} onEdit={onEdit} />
          ))
        )}
      </View>
    </View>
  );
}