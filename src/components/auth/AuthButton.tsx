import React from 'react';
import { ActivityIndicator, Text, TouchableOpacity, View } from 'react-native';

interface AuthButtonProps {
  label: string;
  onPress: () => void;
  loading?: boolean;
  variant?: 'primary' | 'outline';
  disabled?: boolean;
  className?: string;
}

const PRIMARY = '#2563EB';

export default function AuthButton({
  label,
  onPress,
  loading,
  variant = 'primary',
  disabled,
  className = '',
}: AuthButtonProps) {
  if (variant === 'outline') {
    return (
      <TouchableOpacity
        onPress={onPress}
        disabled={disabled || loading}
        activeOpacity={0.8}
        className={`rounded-full border-2 border-[#3B82F6]/70 py-4 items-center justify-center ${className}`}
      >
        <Text className="text-[#7FB0FF] font-bold text-lg">{label}</Text>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.85}
      className={`rounded-full py-4 items-center justify-center ${className}`}
      style={{
        backgroundColor: disabled || loading ? '#60A5FA' : PRIMARY,
        shadowColor: PRIMARY,
        shadowOpacity: 0.45,
        shadowRadius: 14,
        shadowOffset: { width: 0, height: 8 },
        elevation: 8,
      }}
    >
      {loading ? (
        <View className="flex-row items-center gap-2">
          <ActivityIndicator color="#fff" size="small" />
          <Text className="text-white font-bold text-lg">Memproses…</Text>
        </View>
      ) : (
        <Text className="text-white font-bold text-lg">{label}</Text>
      )}
    </TouchableOpacity>
  );
}