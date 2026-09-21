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
import { COLORS } from '@/constants/colors';
import { formatRupiahInput, parseRupiah } from '@/context/onboarding';

interface MoneyFieldProps {
  label: string;
  value: number;
  onChange: (v: number) => void;
  optional?: boolean;
}

function MoneyField({ label, value, onChange, optional }: MoneyFieldProps) {
  const [focused, setFocused] = useState(false);

  return (
    <View className="mb-5">
      <Text className="text-[14px] font-bold mb-2" style={{ color: '#0F172A' }}>
        {label}
        {optional ? (
          <Text className="text-[13px] font-semibold" style={{ color: '#94A3B8' }}>
            {'  (Opsional)'}
          </Text>
        ) : null}
      </Text>
      <View
        className="flex-row items-center rounded-2xl px-4"
        style={{
          borderWidth: 1.5,
          borderColor: focused ? COLORS.primary : '#E2E8F0',
          backgroundColor: '#F8F9FA',
        }}
      >
        <TextInput
          className="flex-1 text-[17px] font-bold py-3.5"
          style={{ color: '#0F172A' }}
          placeholder="0"
          placeholderTextColor="#94A3B8"
          keyboardType="numeric"
          value={formatRupiahInput(value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          onChangeText={(t) => onChange(parseRupiah(t))}
        />
      </View>
    </View>
  );
}

export default function OnboardingStep2Screen() {
  const router = useRouter();
  const { onboarding, setOnboarding, completeOnboarding } = useAuth();
  const mainIncome = onboarding?.mainIncome ?? 0;

  const handleFinish = async () => {
    await setOnboarding({ mainIncome });
    await completeOnboarding();
  };

  return (
    <OnboardingShell
      step={2}
      title="Informasi Keuangan"
      subtitle="Masukkan estimasi saldo atau pemasukan bulanan untuk pengelolaan otomatis."
      onBack={() => (router.canGoBack() ? router.back() : router.replace('/onboarding/step-1'))}
      actionLabel="Selesai & Masuk Dashboard"
      onAction={handleFinish}
      actionDisabled={mainIncome <= 0}
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
              style={{ backgroundColor: '#F0F4FE' }}
            >
              <Iconify icon="ph:wallet-bold" size={18} color={COLORS.primary} />
            </View>
            <Text className="text-[14px] font-bold" style={{ color: COLORS.primary }}>
              {onboarding?.occupation
                ? `Profil: ${onboarding.occupation.charAt(0).toUpperCase() + onboarding.occupation.slice(1)}`
                : 'Profil terpilih'}
            </Text>
          </View>

          <MoneyField
            label="Pemasukan Utama / Gaji Bulanan"
            value={mainIncome}
            onChange={(v) => setOnboarding({ mainIncome: v })}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </OnboardingShell>
  );
}
