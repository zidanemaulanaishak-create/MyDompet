import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Iconify } from 'react-native-iconify';
import { COLORS } from '@/constants/colors';

interface Props {
  icon: string;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export default function EmptyState({
  icon,
  title,
  description,
  actionLabel,
  onAction,
}: Props) {
  return (
    <View className="items-center py-8 px-4">
      <View
        className="w-14 h-14 rounded-full items-center justify-center mb-3"
        style={{ backgroundColor: COLORS.chipBlue }}
      >
        <Iconify icon={icon} size={26} color={COLORS.primary} />
      </View>
      <Text className="text-lg font-bold text-textDark">{title}</Text>
      {description ? (
        <Text className="text-lg text-textMuted text-center mt-1 max-w-[220px]">
          {description}
        </Text>
      ) : null}
      {actionLabel && onAction ? (
        <TouchableOpacity
          className="bg-primary rounded-xl px-4 py-2 mt-3"
          activeOpacity={0.8}
          onPress={onAction}
        >
          <Text className="text-white text-lg font-bold">{actionLabel}</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
}