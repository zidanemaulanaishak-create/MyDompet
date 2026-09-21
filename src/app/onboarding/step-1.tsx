import React from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Iconify } from 'react-native-iconify';
import OnboardingShell from '@/components/onboarding/OnboardingShell';
import { useAuth } from '@/context/auth-context';
import { COLORS } from '@/constants/colors';
import type { Occupation } from '@/context/onboarding';

interface ProfileOption {
  key: Occupation;
  icon: string;
  title: string;
  description: string;
}

const OPTIONS: ProfileOption[] = [
  {
    key: 'pekerja',
    icon: 'ph:briefcase-bold',
    title: 'Pekerja',
    description:
      'Kelola gaji bulanan, alokasi tabungan, dan strategi pengeluaran rutin dengan mudah.',
  },
  {
    key: 'pelajar',
    icon: 'ph:graduation-cap-bold',
    title: 'Pelajar',
    description:
      'Optimalkan uang saku, mulai menabung target impian, dan pelajari literasi keuangan.',
  },
  {
    key: 'mahasiswa',
    icon: 'ph:student-bold',
    title: 'Mahasiswa',
    description:
      'Manajemen biaya kuliah, uang kos, dan alokasi dana darurat harian.',
  },
];

export default function OnboardingStep1Screen() {
  const router = useRouter();
  const { onboarding, setOnboarding } = useAuth();
  const selected = onboarding?.occupation ?? null;

  const pick = (key: Occupation) => {
    void setOnboarding({ occupation: key });
  };

  const handleContinue = () => {
    if (!selected) return;
    router.push('/onboarding/step-2');
  };

  return (
    <OnboardingShell
      step={1}
      title="Pilih Profil Anda"
      subtitle="AI MyDompet akan menyesuaikan strategi & rekomendasi finansial berdasarkan kebutuhan harian Anda."
      actionLabel="Lanjutkan"
      onAction={handleContinue}
      actionDisabled={!selected}
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ gap: 14, paddingBottom: 8 }}
      >
        {OPTIONS.map((opt) => {
          const active = selected === opt.key;
          return (
            <TouchableOpacity
              key={opt.key}
              activeOpacity={0.85}
              onPress={() => pick(opt.key)}
              accessibilityRole="button"
              accessibilityState={{ selected: active }}
              className="flex-row items-start gap-4 p-4 rounded-2xl"
              style={{
                backgroundColor: active ? '#F0F4FE' : '#FFFFFF',
                borderWidth: 2,
                borderColor: active ? COLORS.primary : '#E8EEF7',
              }}
            >
              <View
                className="w-14 h-14 rounded-full items-center justify-center"
                style={{ backgroundColor: active ? '#DCE6FB' : '#F0F4FE' }}
              >
                <Iconify
                  icon={opt.icon}
                  size={26}
                  color={active ? COLORS.primary : '#5B78C9'}
                />
              </View>
              <View className="flex-1">
                <View className="flex-row items-center justify-between">
                  <Text className="text-[17px] font-bold" style={{ color: '#0F172A' }}>
                    {opt.title}
                  </Text>
                  <View
                    className="w-6 h-6 rounded-full items-center justify-center"
                    style={{
                      borderWidth: 2,
                      borderColor: active ? COLORS.primary : '#CBD5E1',
                      backgroundColor: active ? COLORS.primary : 'transparent',
                    }}
                  >
                    {active ? (
                      <Iconify icon="ph:check-bold" size={13} color="#FFFFFF" />
                    ) : null}
                  </View>
                </View>
                <Text className="text-[13px] leading-5 mt-1" style={{ color: '#64748B' }}>
                  {opt.description}
                </Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </OnboardingShell>
  );
}
