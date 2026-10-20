import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Iconify } from 'react-native-iconify';
import { getThemeColors } from '@/constants/colors';
import { useTheme } from '@/context/theme-context';

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
  const { isDark } = useTheme();
  const palette = getThemeColors(isDark ? 'dark' : 'light');
  return (
    <View className="items-center py-8 px-4">
      <View
        className="w-14 h-14 rounded-full items-center justify-center mb-3"
        style={{ backgroundColor: palette.chipBlue }}
      >
        <Iconify icon={icon} size={26} color={palette.primary} />
      </View>
      <Text className="text-lg font-bold" style={{ color: palette.textDark }}>{title}</Text>
      {description ? (
        <Text className="text-lg text-center mt-1 max-w-[220px]" style={{ color: palette.textMuted }}>
          {description}
        </Text>
      ) : null}
      {actionLabel && onAction ? (
        <TouchableOpacity
          className="rounded-xl px-4 py-2 mt-3"
          style={{ backgroundColor: palette.primary }}
          activeOpacity={0.8}
          onPress={onAction}
        >
          <Text className="text-white text-lg font-bold">{actionLabel}</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
}