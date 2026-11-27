import React from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Iconify } from 'react-native-iconify';
import OnboardingShell from '@/components/onboarding/OnboardingShell';
import { useAuth } from '@/context/auth-context';
import { getThemeColors, mixHex, withAlpha } from '@/constants/colors';
import { useTheme } from '@/context/theme-context';
import { useI18n } from '@/i18n';
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
    title: 'onboarding.occWorker',
    description: 'onboarding.occWorkerDesc',
  },
  {
    key: 'pelajar',
    icon: 'ph:graduation-cap-bold',
    title: 'onboarding.occStudent',
    description: 'onboarding.occStudentDesc',
  },
  {
    key: 'mahasiswa',
    icon: 'ph:student-bold',
    title: 'onboarding.occCollege',
    description: 'onboarding.occCollegeDesc',
  },
  {
    key: 'irt',
    icon: 'ph:house-bold',
    title: 'onboarding.occIrt',
    description: 'onboarding.occIrtDesc',
  },
];

export default function OnboardingStep1Screen() {
  const router = useRouter();
  const { onboarding, setOnboarding } = useAuth();
  const { isDark, accent } = useTheme();
  const { t } = useI18n();
  const palette = getThemeColors(isDark ? 'dark' : 'light', accent);
  const inactiveIconColor = mixHex(palette.primary, palette.textMuted, isDark ? 0.35 : 0.5);
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
      title={t('onboarding.selectProfile')}
      subtitle={t('onboarding.selectProfileSub')}
      actionLabel={t('onboarding.continue')}
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
                backgroundColor: active ? palette.chipBlue : palette.card,
                borderWidth: 2,
                borderColor: active ? palette.primary : palette.track,
              }}
            >
              <View
                className="w-14 h-14 rounded-full items-center justify-center"
                style={{
                  backgroundColor: active
                    ? withAlpha(palette.primary, isDark ? 0.24 : 0.12)
                    : palette.chipBlue,
                }}
              >
                <Iconify icon={opt.icon} size={26} color={active ? palette.primary : inactiveIconColor} />
              </View>
              <View className="flex-1">
                <View className="flex-row items-center justify-between">
                  <Text className="text-[17px] font-bold" style={{ color: palette.textDark }}>
                    {t(opt.title)}
                  </Text>
                  <View
                    className="w-6 h-6 rounded-full items-center justify-center"
                    style={{
                      borderWidth: 2,
                      borderColor: active ? palette.primary : palette.border,
                      backgroundColor: active ? palette.primary : 'transparent',
                    }}
                  >
                    {active ? (
                      <Iconify icon="ph:check-bold" size={13} color="#FFFFFF" />
                    ) : null}
                  </View>
                </View>
                <Text className="text-[13px] leading-5 mt-1" style={{ color: palette.textMuted }}>
                  {t(opt.description)}
                </Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </OnboardingShell>
  );
}
