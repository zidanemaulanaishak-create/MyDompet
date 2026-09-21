import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Iconify } from 'react-native-iconify';
import { formatMoneyPlain } from '@/utils/money';

interface Props {
  dailyAmount: number;
}

export default function BudgetInsightCard({ dailyAmount }: Props) {
  return (
    <View className="mx-5 -mt-6 rounded-2xl bg-card px-4 py-4 flex-row items-center gap-3"
      style={styles.card}>
      <View className="w-11 h-11 rounded-full items-center justify-center bg-[#E6FEEF]">
        <Iconify icon="ph:check-circle-fill" size={24} color="#10B981" />
      </View>
      <View className="flex-1">
        <Text className="text-lg font-bold text-textDark">Masih aman!</Text>
        <Text className="text-lg text-textMuted leading-[18px] mt-0.5">
          Kamu bisa pakai {formatMoneyPlain(dailyAmount)}/hari untuk sisa bulan ini.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    shadowColor: '#0E1F42',
    shadowOpacity: 0.1,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },
});