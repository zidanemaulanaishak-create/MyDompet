import React from 'react';
import { ActivityIndicator, Text, TouchableOpacity, View } from 'react-native';
import { getThemeColors, withAlpha } from '@/constants/colors';
import { useTheme } from '@/context/theme-context';
import { useI18n } from '@/i18n';

interface AuthButtonProps {
  label: string;
  onPress: () => void;
  loading?: boolean;
  variant?: 'primary' | 'outline';
  disabled?: boolean;
  className?: string;
}

export default function AuthButton({
  label,
  onPress,
  loading,
  variant = 'primary',
  disabled,
  className = '',
}: AuthButtonProps) {
  const { isDark, accent } = useTheme();
  const { t } = useI18n();
  const palette = getThemeColors(isDark ? 'dark' : 'light', accent);

  if (variant === 'outline') {
    return (
      <TouchableOpacity
        onPress={onPress}
        disabled={disabled || loading}
        activeOpacity={0.8}
        className={`rounded-full border-2 py-4 items-center justify-center ${className}`}
        style={{
          borderColor: withAlpha(palette.primary, 0.7),
        }}
      >
        <Text className="font-bold text-lg" style={{ color: palette.primary }}>
          {label}
        </Text>
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
        backgroundColor: disabled || loading ? palette.textMuted : palette.primary,
        shadowColor: palette.primary,
        shadowOpacity: 0.45,
        shadowRadius: 14,
        shadowOffset: { width: 0, height: 8 },
        elevation: 8,
      }}
    >
      {loading ? (
        <View className="flex-row items-center gap-2">
          <ActivityIndicator color="#fff" size="small" />
          <Text className="text-white font-bold text-lg">{t('auth.processing')}</Text>
        </View>
      ) : (
        <Text className="text-white font-bold text-lg">{label}</Text>
      )}
    </TouchableOpacity>
  );
}