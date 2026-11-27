import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Iconify } from 'react-native-iconify';
import OnboardingShell from '@/components/onboarding/OnboardingShell';
import { useAuth } from '@/context/auth-context';
import { getThemeColors } from '@/constants/colors';
import { useTheme } from '@/context/theme-context';
import { useI18n } from '@/i18n';
import {
  formatRupiahInput,
  parseRupiah,
  OCCUPATION_LABEL_KEYS,
} from '@/context/onboarding';

interface MoneyFieldProps {
  label: string;
  value: number;
  onChange: (v: number) => void;
  optional?: boolean;
}

function MoneyField({ label, value, onChange, optional }: MoneyFieldProps) {
  const [focused, setFocused] = useState(false);
  const { isDark, accent } = useTheme();
  const { t } = useI18n();
  const palette = getThemeColors(isDark ? 'dark' : 'light', accent);

  return (
    <View className="mb-5">
      <Text className="text-[14px] font-bold mb-2" style={{ color: palette.textDark }}>
        {label}
        {optional ? (
          <Text className="text-[13px] font-semibold" style={{ color: palette.textMuted }}>
            {'  ' + t('onboarding.optionalLabel')}
          </Text>
        ) : null}
      </Text>
      <View
        className="flex-row items-center rounded-2xl px-4"
        style={{
          borderWidth: 1.5,
          borderColor: focused ? palette.primary : palette.border,
          backgroundColor: palette.inputBg,
        }}
      >
        <TextInput
          className="flex-1 text-[17px] font-bold py-3.5"
          style={{ color: palette.textDark }}
          placeholder="0"
          placeholderTextColor={palette.textMuted}
          keyboardType="numeric"
          value={formatRupiahInput(value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          onChangeText={(text) => onChange(parseRupiah(text))}
        />
      </View>
    </View>
  );
}

export default function OnboardingStep2Screen() {
  const router = useRouter();
  const { onboarding, setOnboarding, completeOnboarding } = useAuth();
  const { isDark, accent } = useTheme();
  const { t } = useI18n();
  const palette = getThemeColors(isDark ? 'dark' : 'light', accent);
  const mainIncome = onboarding?.mainIncome ?? 0;
  const isIrt = onboarding?.occupation === 'irt';
  const occupationName = onboarding?.occupation
    ? t(OCCUPATION_LABEL_KEYS[onboarding.occupation])
    : '';

  const handleFinish = async () => {
    await setOnboarding({ mainIncome });
    await completeOnboarding();
  };

  return (
    <OnboardingShell
      step={2}
      title={t('onboarding.financeTitle')}
      subtitle={t('onboarding.financeSub')}
      onBack={() => (router.canGoBack() ? router.back() : router.replace('/onboarding/step-1'))}
      actionLabel={t('onboarding.finishDashboard')}
      onAction={handleFinish}
      actionDisabled={!isIrt && mainIncome <= 0}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        className="flex-1"
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ paddingBottom: 8 }}
        >
          <View className="flex-row items-center gap-2 mb-5">
            <View
              className="w-8 h-8 rounded-full items-center justify-center"
              style={{ backgroundColor: palette.chipBlue }}
            >
              <Iconify icon="ph:wallet-bold" size={18} color={palette.primary} />
            </View>
            <Text className="text-[14px] font-bold" style={{ color: palette.primary }}>
              {occupationName
                ? t('onboarding.profileValue', { name: occupationName })
                : t('onboarding.profileSelected')}
            </Text>
          </View>

          <MoneyField
            label={t('onboarding.mainIncome')}
            value={mainIncome}
            onChange={(v) => setOnboarding({ mainIncome: v })}
            optional={isIrt}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </OnboardingShell>
  );
}
