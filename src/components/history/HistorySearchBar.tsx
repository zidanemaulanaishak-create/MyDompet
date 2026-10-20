import React from 'react';
import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import { Iconify } from 'react-native-iconify';
import { getThemeColors } from '@/constants/colors';
import { useTheme } from '@/context/theme-context';
import { useI18n } from '@/i18n';

interface SearchBarProps {
  query: string;
  onChangeQuery: (value: string) => void;
  dateActive: boolean;
  categoryActive: boolean;
  dateFilterCount: number;
  categoryFilterCount: number;
  onPressDate: () => void;
  onPressCategory: () => void;
}

function FilterPill({
  label,
  icon,
  active,
  badge,
  onPress,
}: {
  label: string;
  icon: string;
  active: boolean;
  badge: number;
  onPress: () => void;
}) {
  const { isDark } = useTheme();
  const palette = getThemeColors(isDark ? 'dark' : 'light');
  return (
    <TouchableOpacity
      className="h-11 px-3.5 rounded-xl flex-row items-center gap-1.5 border"
      style={{
        backgroundColor: active ? palette.primary : palette.card,
        borderColor: active ? palette.primary : palette.border,
      }}
      activeOpacity={0.8}
      onPress={onPress}
    >
      <Iconify
        icon={icon}
        size={16}
        color={active ? '#FFFFFF' : palette.textMuted}
      />
      <Text
        className="text-lg font-semibold"
        style={{ color: active ? '#FFFFFF' : palette.textDark }}
      >
        {label}
      </Text>
      {badge > 0 ? (
        <View className="min-w-[16px] h-4 px-1 rounded-full items-center justify-center"
          style={{ backgroundColor: active ? palette.card : palette.primary }}
        >
          <Text
            className="text-lg font-bold"
            style={{ color: active ? palette.primary : '#FFFFFF' }}
          >
            {badge}
          </Text>
        </View>
      ) : null}
    </TouchableOpacity>
  );
}

export function HistorySearchBar({
  query,
  onChangeQuery,
  dateActive,
  categoryActive,
  dateFilterCount,
  categoryFilterCount,
  onPressDate,
  onPressCategory,
}: SearchBarProps) {
  const { t } = useI18n();
  const { isDark } = useTheme();
  const palette = getThemeColors(isDark ? 'dark' : 'light');
  return (
    <View className="px-5 pb-8 mt-4">
      <View className="flex-row items-center gap-2">
        <FilterPill
          label={t('common.date')}
          icon="ph:calendar-bold"
          active={dateActive}
          badge={dateActive ? dateFilterCount : 0}
          onPress={onPressDate}
        />
        <FilterPill
          label={t('common.category')}
          icon="ph:funnel-bold"
          active={categoryActive}
          badge={categoryActive ? categoryFilterCount : 0}
          onPress={onPressCategory}
        />
        <View className="flex-1 h-11 flex-row items-center border rounded-xl px-3"
          style={{ backgroundColor: palette.card, borderColor: palette.border }}>
          <Iconify icon="ph:magnifying-glass-bold" size={18} color={palette.textMuted} />
          <TextInput
            className="flex-1 ml-2 text-lg"
            style={{ color: palette.textDark }}
            placeholder={t('transactions.search')}
            placeholderTextColor={palette.textMuted}
            value={query}
            onChangeText={onChangeQuery}
            returnKeyType="search"
          />
          {query.length > 0 ? (
            <TouchableOpacity onPress={() => onChangeQuery('')} hitSlop={8}>
              <Iconify icon="ph:x-bold" size={16} color={palette.textMuted} />
            </TouchableOpacity>
          ) : null}
        </View>
      </View>
      <View className="h-[2px] -mx-5 mt-6" style={{ backgroundColor: palette.border }} />
    </View>
  );
}