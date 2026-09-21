import React from 'react';
import { View, Text } from 'react-native';
import { Iconify } from 'react-native-iconify';
import { COLORS } from '@/constants/colors';
import { WeeklySpending } from '@/data/dummyData';

interface Props {
  data: WeeklySpending[];
}

const CHART_HEIGHT = 96;

export default function SpendingChart({ data }: Props) {
  const max = Math.max(...data.map((d) => d.amount), 1);
  const todayIndex = data.length - 2;

  return (
    <View className="bg-card rounded-2xl p-4 mb-6">
      <View className="flex-row items-center gap-2 mb-4">
        <View className="w-8 h-8 rounded-full items-center justify-center bg-chipBlue">
          <Iconify icon="ph:chart-bar" size={16} color={COLORS.primary} />
        </View>
        <Text className="font-bold text-base text-textDark flex-1">
          Pengeluaran Minggu Ini
        </Text>
        <Text className="text-sm text-textMuted">7 hari terakhir</Text>
      </View>

      <View className="h-[2px] bg-[#D9D9D9] mb-5 -mx-4" />

      <View className="flex-row items-end justify-between gap-2">
        {data.map((d, i) => {
          const height = Math.max(8, Math.round((d.amount / max) * CHART_HEIGHT));
          const isToday = i === todayIndex;
          return (
            <View key={d.day} className="flex-1 items-center gap-1.5">
              <View
                className="w-full rounded-t-[8px] rounded-b-[3px]"
                style={{ height, backgroundColor: isToday ? COLORS.sky : COLORS.chipBlue }}
              />
              <Text
                className="text-xs"
                style={{ color: isToday ? COLORS.primary : COLORS.textMuted, fontWeight: isToday ? '700' : '500' }}
              >
                {d.day}
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}