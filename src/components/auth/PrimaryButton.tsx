import React from 'react';
import { ActivityIndicator, Text, TouchableOpacity, View } from 'react-native';
import { COLORS } from '@/constants/colors';

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
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.85}
      className={`rounded-full bg-primary py-4 items-center justify-center ${className}`}
      style={{
        shadowColor: COLORS.primary,
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