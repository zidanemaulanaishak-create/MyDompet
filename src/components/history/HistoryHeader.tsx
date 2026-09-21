import React from 'react';
import { View, Text } from 'react-native';

export function HistoryHeader() {
  return (
    <View className="flex-row items-center justify-between px-5 pt-4 pb-3">
      <Text className="text-[22px] font-bold text-[#0F172A]">Riwayat Transaksi</Text>
    </View>
  );
}