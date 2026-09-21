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
import { COLORS } from '@/constants/colors';

interface Props {
  name: string;
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
  const scrollRef = useRef<ScrollView>(null);
  const [active, setActive] = useState(0);
  const [showBalance, setShowBalance] = useState(true);

  const TABS = [monthLabel, 'Total Saldo'];

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
      date: 'Total Seluruh Periode',
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
    if (h < 11) return 'Selamat Pagi';
    if (h < 15) return 'Selamat Siang';
    if (h < 19) return 'Selamat Sore';
    return 'Selamat Malam';
  })();

  const initials = name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase();

  return (
    <View className="bg-primary px-5 pt-4 pb-16 overflow-hidden">
      <View className="flex-row items-center justify-between">
        <View className="flex-1">
          <Text className="text-white text-base text-[#B9C2FF] font-semibold">
            {greeting},
          </Text>
          <Text className="text-white text-2xl font-bold">Halo {name}!</Text>
        </View>

        <View className="flex-row items-center gap-3">
          <View className="w-9 h-9 rounded-full bg-white/15 items-center justify-center">
            <Text className="text-white text-base font-bold">{initials}</Text>
          </View>
          <View className="w-9 h-9 rounded-full bg-white/15 items-center justify-center">
            <Iconify icon="ph:bell-bold" size={18} color="#FFFFFF" />
            <View className="absolute top-1 right-1 w-2 h-2 rounded-full bg-red border-[1.5px] border-primary" />
          </View>
        </View>
      </View>

      <View className="flex-row items-center gap-2 mt-5">
        {TABS.map((tab, i) => (
          <TouchableOpacity
            key={tab}
            activeOpacity={0.8}
            onPress={() => goTo(i)}
            className={i === active ? 'bg-sky px-3 py-1.5 rounded-2xl' : 'px-3 py-1.5'}
          >
<Text
              className={
                i === active
                  ? 'text-primary text-base font-bold'
                  : 'text-[#CBD3FF] text-base font-semibold'
              }
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
            <Text className="text-[#B9C2FF] text-sm font-semibold tracking-wider">{balanceLabel}</Text>
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
                  color="#B9C2FF"
                />
              </TouchableOpacity>
            </View>
            <Text className="text-[#B9C2FF] text-m mt-3">{s.date}</Text>

            <View className="flex-row mt-8 gap-2">
              <View className="flex-1 flex-row items-center gap-2 py-4 px-2.5 rounded-[10px] bg-[rgba(1,54,129,0.75)]">
                <View className="w-10 h-10 rounded-full items-center justify-center bg-[rgba(16,185,129,0.35)]">
                  <Iconify icon="ph:arrow-down-left-bold" size={16} color={COLORS.green} />
                </View>
                <Text className="text-white font-bold text-xl">{s.income}</Text>
              </View>
              <View className="flex-1 flex-row items-center gap-2 py-4 px-2.5 rounded-[10px] bg-[rgba(1,54,129,0.75)]">
                <View className="w-10 h-10 rounded-full items-center justify-center bg-[rgba(239,68,68,0.35)]">
                  <Iconify icon="ph:arrow-up-right-bold" size={16} color={COLORS.red} />
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
                  ? 'w-5 h-1.5 rounded-full bg-sky'
                  : 'w-1.5 h-1.5 rounded-full bg-white/30'
            }
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