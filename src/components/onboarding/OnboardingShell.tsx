import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Iconify } from 'react-native-iconify';
import { Image } from 'expo-image';
import { getThemeColors } from '@/constants/colors';
import { useTheme } from '@/context/theme-context';
import { useI18n } from '@/i18n';

interface Props {
  step: 1 | 2;
  title: string;
  subtitle: string;
  onBack?: () => void;
  children: React.ReactNode;
  actionLabel: string;
  onAction: () => void;
  actionDisabled?: boolean;
}

export default function OnboardingShell({
  step,
  title,
  subtitle,
  onBack,
  children,
  actionLabel,
  onAction,
  actionDisabled,
}: Props) {
  const insets = useSafeAreaInsets();
  const { isDark } = useTheme();
  const { t } = useI18n();
  const palette = getThemeColors(isDark ? 'dark' : 'light');
  const progress = step === 1 ? '50%' : '100%';

  return (
    <View className="flex-1" style={{ backgroundColor: palette.bg }}>
      {/* Top navigation */}
      <View
        className="flex-row items-center gap-3 px-5"
        style={{ paddingTop: insets.top + 12, paddingBottom: 12 }}
      >
        {onBack ? (
          <TouchableOpacity
            onPress={onBack}
            activeOpacity={0.7}
            className="w-10 h-10 rounded-full items-center justify-center"
            style={{ backgroundColor: isDark ? '#1C2942' : '#F0F4FE' }}
            accessibilityLabel={t('common.back')}
          >
            <Iconify icon="ph:arrow-left-bold" size={20} color={palette.primary} />
          </TouchableOpacity>
        ) : (
          <View className="w-10 h-10" />
        )}
        <View className="flex-row items-center gap-2">
          <Image
            source={require('@/assets/images/logo.png')}
            style={{ width: 26, height: 26 }}
            contentFit="contain"
          />
          <Text className="text-[17px] font-extrabold" style={{ color: palette.primary }}>
            MyDompet
          </Text>
        </View>
      </View>

      {/* Progress indicator */}
      <View className="px-5 pt-2">
        <View className="flex-row items-center justify-between mb-2">
          <Text className="text-[13px] font-bold" style={{ color: palette.primary }}>
            {t('onboarding.stepOf', { step })}
          </Text>
          <Text className="text-[13px] font-semibold" style={{ color: palette.textMuted }}>
            {step === 1 ? '50%' : '100%'}
          </Text>
        </View>
        <View className="h-2 rounded-full overflow-hidden" style={{ backgroundColor: palette.track }}>
          <View
            className="h-2 rounded-full"
            style={{ width: progress, backgroundColor: palette.primary }}
          />
        </View>
      </View>

      {/* Titles */}
      <View className="px-5 pt-6">
        <Text className="text-[26px] font-extrabold leading-8" style={{ color: palette.textDark }}>
          {title}
        </Text>
        <Text className="text-[14px] leading-5 mt-2" style={{ color: palette.textMuted }}>
          {subtitle}
        </Text>
      </View>

      {/* Scrollable content */}
      <View className="flex-1 px-5 pt-6">{children}</View>

      {/* Bottom action area */}
      <View
        className="px-5"
        style={{ paddingBottom: Math.max(insets.bottom, 20), paddingTop: 8 }}
      >
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={onAction}
          disabled={actionDisabled}
          className="rounded-2xl py-4 items-center"
          style={{
            backgroundColor: actionDisabled
              ? isDark
                ? '#23314D'
                : '#C3CEEB'
              : palette.primary,
            shadowColor: palette.primary,
            shadowOpacity: actionDisabled ? 0 : 0.35,
            shadowRadius: 14,
            shadowOffset: { width: 0, height: 8 },
            elevation: actionDisabled ? 0 : 6,
          }}
        >
          <Text className="text-white text-[16px] font-bold">{actionLabel}</Text>
        </TouchableOpacity>
        <Text className="text-[12px] text-center mt-3" style={{ color: palette.textMuted }}>
          {t('onboarding.editableNote')}
        </Text>
      </View>
    </View>
  );
}
