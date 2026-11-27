import React, { useRef, useState } from 'react';
import {
  NativeScrollEvent,
  NativeSyntheticEvent,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';
import { Iconify } from 'react-native-iconify';
import { Image } from 'expo-image';
import AnimatedPressable from '@/components/ui/AnimatedPressable';
import { getThemeColors } from '@/constants/colors';
import { useTheme } from '@/context/theme-context';
import { useI18n } from '@/i18n';

interface Props {
  name: string;
  avatarUrl?: string | null;
  onNotificationPress: () => void;
  unreadCount: number;
  balanceLabel: string;
  monthLabel: string;
  monthDate: string;
  monthBalance: string;
  monthIncome: string;
  monthExpense: string;
  totalBalance: string;
  totalIncome: string;
  totalExpense: string;
}

export default function HeaderSummary({
  name,
  avatarUrl,
  onNotificationPress,
  unreadCount,
  balanceLabel,
  monthLabel,
  monthDate,
  monthBalance,
  monthIncome,
  monthExpense,
  totalBalance,
  totalIncome,
  totalExpense,
}: Props) {
  const { width } = useWindowDimensions();
  const { isDark, accent } = useTheme();
  const palette = getThemeColors(isDark ? 'dark' : 'light', accent);
  const { t } = useI18n();
  const scrollRef = useRef<ScrollView>(null);
  const [active, setActive] = useState(0);
  const [showBalance, setShowBalance] = useState(true);

  const TABS = [monthLabel, t('home.totalBalance')];

  const SLIDES = [
    {
      key: 'month',
      amount: monthBalance,
      date: monthDate,
      income: monthIncome,
      expense: monthExpense,
    },
    {
      key: 'total',
      amount: totalBalance,
      date: t('home.totalPeriod'),
      income: totalIncome,
      expense: totalExpense,
    },
  ];

  const goTo = (index: number) => {
    scrollRef.current?.scrollTo({ x: index * width, animated: true });
    setActive(index);
  };

  const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const idx = Math.round(e.nativeEvent.contentOffset.x / width);
    if (idx >= 0 && idx < SLIDES.length && idx !== active) {
      setActive(idx);
    }
  };

  const greeting = (() => {
    const h = new Date().getHours();
    if (h < 11) return t('home.goodMorning');
    if (h < 15) return t('home.goodAfternoon');
    if (h < 19) return t('home.goodEvening');
    return t('home.goodNight');
  })();

  const initials = name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase();

  return (
    <View className="px-5 pt-4 pb-16 overflow-hidden" style={{ backgroundColor: palette.primary }}>
      <View className="flex-row items-center justify-between">
        <View className="flex-1">
          <Text
            className="text-white text-base font-semibold"
            style={{ color: palette.onPrimaryMuted }}
          >
            {greeting},
          </Text>
          <Text className="text-white text-2xl font-bold">{t('home.hello', { name })}</Text>
        </View>

        <View className="flex-row items-center gap-3">
          <View className="w-10 h-10 rounded-full bg-white/15 items-center justify-center overflow-hidden">
            {avatarUrl ? (
              <Image
                source={{ uri: avatarUrl }}
                style={{ width: '100%', height: '100%' }}
                contentFit="cover"
                cachePolicy="memory-disk"
              />
            ) : (
              <Text className="text-white text-lg font-bold">{initials}</Text>
            )}
          </View>
          <AnimatedPressable
            className="w-10 h-10 rounded-full bg-white/15 items-center justify-center"
            activeOpacity={0.85}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            accessibilityLabel={t('home.notifTitle')}
            onPress={onNotificationPress}
          >
            <Iconify icon="ph:bell-bold" size={20} color="#FFFFFF" />
            {unreadCount > 0 ? (
              <View
                className="absolute top-1 right-1 w-2.5 h-2.5 rounded-full bg-red border-[1.5px]"
                style={{ borderColor: palette.primary }}
              />
            ) : null}
          </AnimatedPressable>
        </View>
      </View>

      <View className="flex-row items-center gap-2 mt-5">
        {TABS.map((tab, i) => (
              <TouchableOpacity
                key={tab}
                activeOpacity={0.8}
                onPress={() => goTo(i)}
                className={i === active ? 'px-3 py-1.5 rounded-2xl' : 'px-3 py-1.5'}
                style={i === active ? { backgroundColor: palette.sky } : undefined}
              >
                <Text
                  className={
                    i === active
                      ? 'text-base font-bold'
                      : 'text-base font-semibold'
                  }
                  style={{ color: i === active ? palette.primary : palette.onPrimaryMuted }}
                >
                  {tab}
                </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView
        horizontal
        ref={scrollRef}
        className="-mx-5 mt-3 mb-2"
        showsHorizontalScrollIndicator={false}
        snapToInterval={width}
        decelerationRate="fast"
        scrollEventThrottle={16}
        contentContainerStyle={styles.carouselContent}
        onScroll={onScroll}
      >
        {SLIDES.map((s) => (
          <View key={s.key} style={[styles.slide, { width: width - 40 }]}>
            <Text className="text-sm font-semibold tracking-wider" style={{ color: palette.onPrimaryMuted }}>{balanceLabel}</Text>
            <View className="flex-row items-center mt-3">
              <Text className="text-white text-4xl font-bold">
                {showBalance ? s.amount : '••••••••'}
              </Text>
              <TouchableOpacity
                className="ml-2 p-1"
                activeOpacity={0.7}
                onPress={() => setShowBalance((v) => !v)}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Iconify
                  icon={showBalance ? 'ph:eye' : 'ph:eye-slash'}
                  size={18}
                  color={palette.onPrimaryMuted}
                />
              </TouchableOpacity>
            </View>
            <Text className="text-m mt-3" style={{ color: palette.onPrimaryMuted }}>{s.date}</Text>

            <View className="flex-row mt-8 gap-2">
              <View
                className="flex-1 flex-row items-center gap-2 py-4 px-2.5 rounded-[10px]"
                style={{ backgroundColor: palette.onPrimarySoft }}
              >
                <View className="w-10 h-10 rounded-full items-center justify-center bg-[rgba(16,185,129,0.35)]">
                  <Iconify icon="ph:arrow-down-left-bold" size={16} color={palette.green} />
                </View>
                <Text className="text-white font-bold text-xl">{s.income}</Text>
              </View>
              <View
                className="flex-1 flex-row items-center gap-2 py-4 px-2.5 rounded-[10px]"
                style={{ backgroundColor: palette.onPrimarySoft }}
              >
                <View className="w-10 h-10 rounded-full items-center justify-center bg-[rgba(239,68,68,0.35)]">
                  <Iconify icon="ph:arrow-up-right-bold" size={16} color={palette.red} />
                </View>
                <Text className="text-white font-bold text-xl">{s.expense}</Text>
              </View>
            </View>
          </View>
        ))}
      </ScrollView>

      <View className="flex-row items-center gap-1.5 justify-center -mx-5 mt-7 mb-4">
        {SLIDES.map((_, i) => (
          <View
            key={i}
            className={
              i === active
                ? 'w-5 h-1.5 rounded-full'
                : 'w-1.5 h-1.5 rounded-full bg-white/30'
            }
            style={i === active ? { backgroundColor: palette.sky } : undefined}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  carouselContent: {
    paddingHorizontal: 20,
    gap: 40,
  },
  slide: {},
});