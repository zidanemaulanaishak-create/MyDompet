import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Iconify } from 'react-native-iconify';
import { COLORS } from '@/constants/colors';
import { GoalItem } from '@/data/dummyData';

interface CardProps {
  item: GoalItem;
  onPress?: (item: GoalItem) => void;
}

export function GoalCard({ item, onPress }: CardProps) {
  const isCake = item.icon === 'ph:cake-bold';
  return (
    <TouchableOpacity
      className="border-[1.5px] border-[#D9D9D9] rounded-xl p-3 mb-3"
      activeOpacity={0.7}
      onPress={() => onPress?.(item)}
    >
      <View className="flex-row items-center mb-2.5">
        <View
          className="w-10 h-10 rounded-[10px] items-center justify-center mr-2.5"
          style={{ backgroundColor: isCake ? '#FDECEC' : '#EEF2FF' }}
        >
          <Iconify
            icon={item.icon}
            size={22}
            color={isCake ? COLORS.red : COLORS.primary}
          />
        </View>
        <View className="flex-1">
          <Text className="text-lg font-bold text-textDark">{item.name}</Text>
          <Text className="text-lg text-textMuted mt-0.5">Waktu: {item.days}</Text>
        </View>
        <Iconify icon="ph:caret-right-bold" size={16} color={COLORS.textMuted} />
      </View>

      <View className="h-1.5 rounded-full bg-[#EDEEF3] overflow-hidden">
        <View
          className="h-1.5 bg-orange rounded-full"
          style={{ width: `${item.progress * 100}%` }}
        />
      </View>

      <View className="flex-row justify-between mt-2">
        <Text className="text-lg font-bold text-textDark">{item.saved}</Text>
        <Text className="text-lg text-textMuted">{item.target}</Text>
      </View>
    </TouchableOpacity>
  );
}