import React from 'react';
import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import { Iconify } from 'react-native-iconify';
import { COLORS } from '@/constants/colors';

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
  return (
    <TouchableOpacity
      className="h-11 px-3.5 rounded-xl flex-row items-center gap-1.5 border"
      style={{
        backgroundColor: active ? COLORS.primary : '#FFFFFF',
        borderColor: active ? COLORS.primary : '#E2E8F0',
      }}
      activeOpacity={0.8}
      onPress={onPress}
    >
      <Iconify
        icon={icon}
        size={16}
        color={active ? '#FFFFFF' : COLORS.textMuted}
      />
      <Text
        className="text-lg font-semibold"
        style={{ color: active ? '#FFFFFF' : COLORS.textDark }}
      >
        {label}
      </Text>
      {badge > 0 ? (
        <View className="min-w-[16px] h-4 px-1 rounded-full items-center justify-center"
          style={{ backgroundColor: active ? '#FFFFFF' : COLORS.primary }}
        >
          <Text
            className="text-lg font-bold"
            style={{ color: active ? COLORS.primary : '#FFFFFF' }}
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
  return (
    <View className="px-5 pb-8 mt-4">
      <View className="flex-row items-center gap-2">
        <FilterPill
          label="Tanggal"
          icon="ph:calendar-bold"
          active={dateActive}
          badge={dateActive ? dateFilterCount : 0}
          onPress={onPressDate}
        />
        <FilterPill
          label="Kategori"
          icon="ph:funnel-bold"
          active={categoryActive}
          badge={categoryActive ? categoryFilterCount : 0}
          onPress={onPressCategory}
        />
        <View className="flex-1 h-11 flex-row items-center bg-white border border-[#E2E8F0] rounded-xl px-3">
          <Iconify icon="ph:magnifying-glass-bold" size={18} color={COLORS.textMuted} />
          <TextInput
            className="flex-1 ml-2 text-lg"
            style={{ color: COLORS.textDark }}
            placeholder="Cari transaksi…"
            placeholderTextColor="#94A3B8"
            value={query}
            onChangeText={onChangeQuery}
            returnKeyType="search"
          />
          {query.length > 0 ? (
            <TouchableOpacity onPress={() => onChangeQuery('')} hitSlop={8}>
              <Iconify icon="ph:x-bold" size={16} color={COLORS.textMuted} />
            </TouchableOpacity>
          ) : null}
        </View>
      </View>
      <View className="h-[2px] bg-[#E2E8F0] -mx-5 mt-6" />
    </View>
  );
}