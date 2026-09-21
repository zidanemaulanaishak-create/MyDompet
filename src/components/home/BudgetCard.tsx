import React from 'react';
import { View, Text } from 'react-native';
import { Iconify } from 'react-native-iconify';
import { COLORS } from '@/constants/colors';

interface Props {
  allowance: number;
  spent: number;
  monthLabel?: string;
}

function formatRupiah(n: number): string {
  return 'Rp ' + n.toLocaleString('id-ID');
}

export default function BudgetCard({ allowance, spent, monthLabel }: Props) {
  const hasBudget = allowance > 0;
  const big = hasBudget && spent > allowance;
  const percent = hasBudget ? Math.round((spent / allowance) * 100) : 0;
  const barColor = big ? COLORS.red : percent >= 80 ? COLORS.orange : COLORS.green;

  return (
    <View className="bg-card rounded-2xl p-4 mb-6 shadow-sm">
      <View className="flex-row items-center gap-2 mb-4">
        <View className="w-8 h-8 rounded-full items-center justify-center bg-chipBlue">
          <Iconify icon="ph:wallet-bold" size={16} color={COLORS.primary} />
        </View>
        <Text className="font-bold text-lg text-textDark flex-1">
          Budget Bulan Ini
        </Text>
        <Text className="text-lg text-textMuted">{monthLabel ?? 'Bulan ini'}</Text>
      </View>

      <View className="flex-row items-end justify-between mb-2.5">
        <View>
          <Text className="text-lg text-textMuted">Terpakai</Text>
          <Text className="text-xl font-extrabold text-textDark">
            {formatRupiah(spent)}
          </Text>
        </View>
        <Text className="text-lg text-textMuted mb-1">
          dari {formatRupiah(allowance)}
        </Text>
      </View>

      <View className="h-2.5 rounded-full bg-[#EDEEF3] overflow-hidden">
        <View
          className="h-2.5 rounded-full"
          style={{ width: `${Math.min(100, percent)}%`, backgroundColor: barColor }}
        />
      </View>

      <Text
        className="text-lg mt-2"
        style={{ color: !hasBudget ? COLORS.textMuted : big ? COLORS.red : COLORS.textMuted }}
      >
        {!hasBudget
          ? 'Belum ada budget bulan ini. Atur dari halaman Budget.'
          : big
            ? `Budget sudah terlewati ${percent - 100}%.`
            : `Sudah terpakai ${percent}% dari budget bulan ini.`}
      </Text>
    </View>
  );
}