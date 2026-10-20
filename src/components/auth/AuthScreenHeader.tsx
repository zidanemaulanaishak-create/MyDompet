import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View, useWindowDimensions } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { Iconify } from 'react-native-iconify';
import { useRouter } from 'expo-router';
import { getThemeColors } from '@/constants/colors';
import { useTheme } from '@/context/theme-context';

interface AuthScreenHeaderProps {
  title: string;
}

export default function AuthScreenHeader({ title }: AuthScreenHeaderProps) {
  const { width } = useWindowDimensions();
  const router = useRouter();
  const { isDark } = useTheme();
  const palette = getThemeColors(isDark ? 'dark' : 'light');

  const goBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/welcome');
    }
  };

  return (
    <View style={{ height: 230 }}>
      <View className="absolute inset-0">
        <Svg width={width} height={230}>
          <Circle cx={58} cy={-12} r={222} fill={palette.primary} />
        </Svg>
      </View>

      <TouchableOpacity
        onPress={goBack}
        className="absolute top-[52px] left-5 w-11 h-11 rounded-full bg-white items-center justify-center"
        style={styles.backBtn}
        hitSlop={10}
        activeOpacity={0.85}
      >
        <Iconify icon="ph:arrow-left" size={20} color={palette.primary} />
      </TouchableOpacity>

      <Text
        className="absolute left-0 right-0 text-center text-white font-extrabold text-[26px] tracking-wide"
        style={{ top: 122 }}
      >
        {title}
      </Text>

      <TouchableOpacity
        className="absolute top-[52px] right-5 w-11 h-11 rounded-full items-center justify-center"
        hitSlop={10}
        activeOpacity={0.7}
        onPress={() => console.log('info')}
      >
        <Iconify icon="ph:info" size={23} color={palette.primary} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  backBtn: {
    shadowColor: '#000000',
    shadowOpacity: 0.18,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },
});