import React from 'react';
import { Image } from 'expo-image';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Iconify } from 'react-native-iconify';
import { COLORS } from '@/constants/colors';

interface BlueHeaderProps {
  title: string;
  subtitle: string;
  showLogo?: boolean;
  onBack?: () => void;
}

export default function BlueHeader({ title, subtitle, showLogo, onBack }: BlueHeaderProps) {
  const insets = useSafeAreaInsets();

  return (
    <View className="items-center px-8" style={{ paddingTop: insets.top + 14, paddingBottom: 42 }}>
      <Text
        className="text-center text-white font-extrabold text-[27px] tracking-tight"
        style={{ marginTop: showLogo ? 18 : 0 }}
      >
        {title}
      </Text>
      <Text className="text-center text-[#C7D2FE] text-lg leading-5 mt-3 mb-10">{subtitle}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  backBtn: {
    shadowColor: '#000000',
    shadowOpacity: 0.2,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },
  logo: {
    shadowColor: '#000000',
    shadowOpacity: 0.25,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8,
  },
});