import React from 'react';
import { Text, useWindowDimensions, View } from 'react-native';
import { Image } from 'expo-image';
import { Link, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Iconify } from 'react-native-iconify';
import PrimaryButton from '@/components/auth/PrimaryButton';
import WelcomeIllustration from '@/components/auth/WelcomeIllustration';
import { COLORS } from '@/constants/colors';

const FEATURES: { label: string; icon: string }[] = [
  { label: 'AI Saran', icon: 'ph:sparkle-bold' },
  { label: 'Data Aman', icon: 'ph:lock' },
  { label: 'Pengingat', icon: 'ph:bell-bold' },
];

export default function WelcomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();

  const illWidth = Math.min(width * 0.86, 420);
  const illHeight = illWidth * (250 / 360);

  return (
    <View className="flex-1 bg-primary">
      <View className="items-center px-6" style={{ paddingTop: insets.top + 16 }}>
        <Text className="mt-4 text-center text-white text-[25px] font-extrabold tracking-tight">
          Halo, Selamat Datang!
        </Text>
        <Text className="mt-2 text-center text-[#C7D2FE] text-lg leading-5 px-6">
          Kelola keuangan kamu jadi lebih mudah dan teratur
        </Text>
      </View>

      <View className="flex-1 items-center justify-center px-4" style={{ paddingBottom: 10 }}>
        <View style={{ width: illWidth, height: illHeight }}>
          <WelcomeIllustration />
        </View>
      </View>

      <View
        className="bg-white rounded-t-[44px] px-6 pt-6"
        style={{ paddingBottom: Math.max(insets.bottom, 20) }}
      >
        <View className="flex-row justify-center items-center gap-6 mt-1">
          {FEATURES.map((f) => (
            <View key={f.label} className="flex-row items-center gap-1.5">
              <Iconify icon={f.icon} size={16} color={COLORS.orange} />
              <Text className="text-[#64748B] text-sm font-semibold">{f.label}</Text>
            </View>
          ))}
        </View>

        <View className="mt-6">
          <PrimaryButton label="Get Started" onPress={() => router.push('/login')} />
        </View>

        <View className="flex-row justify-center items-center mt-5">
          <Text className="text-[#8A8D9F] text-lg">Belum punya akun? </Text>
          <Link href="/register">
            <Text className="text-orange text-lg font-bold">Register</Text>
          </Link>
        </View>
      </View>
    </View>
  );
}