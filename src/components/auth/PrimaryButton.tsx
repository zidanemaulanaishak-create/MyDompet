import React from 'react';
import { ActivityIndicator, Text, TouchableOpacity, View } from 'react-native';
import { getThemeColors } from '@/constants/colors';
import { useTheme } from '@/context/theme-context';

interface PrimaryButtonProps {
  label: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  className?: string;
}

export default function PrimaryButton({
  label,
  onPress,
  loading,
  disabled,
  className = '',
}: PrimaryButtonProps) {
  const { isDark, accent } = useTheme();
  const palette = getThemeColors(isDark ? 'dark' : 'light', accent);

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.85}
      className={`rounded-full py-4 items-center justify-center ${className}`}
      style={{
        backgroundColor: palette.primary,
        shadowColor: palette.primary,
        shadowOpacity: 0.4,
        shadowRadius: 14,
        shadowOffset: { width: 0, height: 8 },
        elevation: 8,
      }}
    >
      {loading ? (
        <View className="flex-row items-center gap-2">
          <ActivityIndicator color="#fff" size="small" />
          <Text className="text-white font-bold text-lg">{label}</Text>
        </View>
      ) : (
        <Text className="text-white font-bold text-lg">{label}</Text>
      )}
    </TouchableOpacity>
  );
}