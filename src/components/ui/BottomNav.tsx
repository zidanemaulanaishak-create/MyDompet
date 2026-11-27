import React, { useCallback, useEffect, useState } from 'react';
import {
  LayoutChangeEvent,
  Text,
  TouchableOpacity,
  View,
  StyleSheet,
} from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { Iconify } from 'react-native-iconify';
import { useRouter, usePathname } from 'expo-router';
import { getThemeColors } from '@/constants/colors';
import { useTheme } from '@/context/theme-context';
import { useI18n } from '@/i18n';
import { animateTo, springTo } from '@/utils/animation';

interface NavItemConfig {
  key: string;
  route: string;
  label: string;
  iconActive: string;
  iconInactive: string;
}

const NAV_ITEMS: NavItemConfig[] = [
  {
    key: 'home',
    route: '/home',
    label: 'nav.home',
    iconActive: 'ph:house-fill',
    iconInactive: 'ph:house',
  },
  {
    key: 'transactions',
    route: '/transactions',
    label: 'nav.transactions',
    iconActive: 'ph:receipt-fill',
    iconInactive: 'ph:receipt',
  },
];

const NAV_ITEMS_RIGHT: NavItemConfig[] = [
  {
    key: 'budget',
    route: '/budget',
    label: 'nav.budget',
    iconActive: 'ph:chart-bar-fill',
    iconInactive: 'ph:chart-bar',
  },
  {
    key: 'profile',
    route: '/profile',
    label: 'nav.profile',
    iconActive: 'ph:user-fill',
    iconInactive: 'ph:user',
  },
];

const ALL_ITEMS = [...NAV_ITEMS, ...NAV_ITEMS_RIGHT];

function NavItem({
  item,
  active,
  onLayout,
}: {
  item: NavItemConfig;
  active: boolean;
  onLayout: (event: LayoutChangeEvent) => void;
}) {
  const router = useRouter();
  const { isDark, accent } = useTheme();
  const { t } = useI18n();
  const reducedMotion = useReducedMotion();
  const scale = useSharedValue(1);
  const palette = getThemeColors(isDark ? 'dark' : 'light', accent);

  const iconStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <View className="flex-1" collapsable={false} onLayout={onLayout}>
      <TouchableOpacity
        className="flex-1 items-center justify-center gap-0.5"
        activeOpacity={0.9}
        onPressIn={() => {
          if (!reducedMotion) animateTo(scale, 0.86, 100);
        }}
        onPressOut={() => {
          if (!reducedMotion) springTo(scale, 1);
        }}
        onPress={() => {
          if (!active) router.replace(item.route as any);
        }}
      >
        <Animated.View style={iconStyle}>
          <Iconify
            icon={active ? item.iconActive : item.iconInactive}
            size={22}
            color={active ? palette.primary : palette.textMuted}
          />
        </Animated.View>
        <Text
          className="text-xs font-semibold"
          style={{ color: active ? palette.primary : palette.textMuted }}
        >
          {t(item.label)}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

interface Props {
  onFabPress?: () => void;
}

export default function BottomNav({ onFabPress }: Props) {
  const pathname = usePathname();
  const router = useRouter();
  const { isDark, accent } = useTheme();
  const { t } = useI18n();
  const reducedMotion = useReducedMotion();
  const palette = getThemeColors(isDark ? 'dark' : 'light', accent);
  const bg = isDark ? palette.card : palette.bg;

  const [layouts, setLayouts] = useState<{ x: number; width: number }[]>([]);
  const activeIndex = ALL_ITEMS.findIndex((item) => pathname === item.route);
  const indicatorX = useSharedValue(0);
  const indicatorWidth = useSharedValue(0);
  const fabScale = useSharedValue(0.7);

  useEffect(() => {
    const target = activeIndex >= 0 ? layouts[activeIndex] : null;
    if (!target) return;
    const config = {
      duration: reducedMotion ? 0 : 260,
      easing: Easing.out(Easing.cubic),
    };
    indicatorX.value = withTiming(target.x, config);
    indicatorWidth.value = withTiming(target.width, config);
  }, [activeIndex, layouts, reducedMotion, indicatorX, indicatorWidth]);

  useEffect(() => {
    fabScale.value = reducedMotion
      ? 1
      : withSpring(1, { damping: 11, stiffness: 220 });
  }, [reducedMotion, fabScale]);

  const indicatorStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: indicatorX.value }],
    width: indicatorWidth.value,
    opacity: indicatorWidth.value > 0 ? 1 : 0,
  }));

  const fabStyle = useAnimatedStyle(() => ({
    transform: [{ scale: fabScale.value }],
  }));

  const handleLayout = useCallback((index: number, event: LayoutChangeEvent) => {
    const { x, width } = event.nativeEvent.layout;
    setLayouts((prev) => {
      const current = prev[index];
      if (current && Math.abs(current.x - x) < 0.5 && Math.abs(current.width - width) < 0.5) {
        return prev;
      }
      const next = [...prev];
      next[index] = { x, width };
      return next;
    });
  }, []);

  return (
    <View
      className="absolute bottom-0 left-0 right-0 h-[78px] flex-row items-center
                 rounded-t-[20px] shadow-lg pb-2.5"
      style={[styles.bar, { backgroundColor: bg }]}
    >
      <Animated.View
        pointerEvents="none"
        style={[styles.indicator, { backgroundColor: palette.chipBlue }, indicatorStyle]}
      />

      {NAV_ITEMS.map((item, index) => (
        <NavItem
          key={item.key}
          item={item}
          active={pathname === item.route}
          onLayout={(event) => handleLayout(index, event)}
        />
      ))}

      <View className="w-[72px] items-center">
        <Animated.View style={fabStyle}>
          <TouchableOpacity
            className="w-[56px] h-[56px] rounded-full bg-orange items-center justify-center -mt-9"
            style={styles.fab}
            activeOpacity={0.85}
            accessibilityLabel={t('nav.add')}
            onPressIn={() => {
              if (!reducedMotion) animateTo(fabScale, 0.9, 100);
            }}
            onPressOut={() => {
              if (!reducedMotion) springTo(fabScale, 1, 11, 260);
            }}
            onPress={onFabPress ?? (() => router.push('/add-transaction' as any))}
          >
            <Iconify icon="ph:plus-bold" size={28} color="#fff" />
          </TouchableOpacity>
        </Animated.View>
      </View>

      {NAV_ITEMS_RIGHT.map((item, index) => (
        <NavItem
          key={item.key}
          item={item}
          active={pathname === item.route}
          onLayout={(event) => handleLayout(NAV_ITEMS.length + index, event)}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    shadowColor: '#1A2E5A',
    shadowOpacity: 0.12,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: -4 },
    elevation: 12,
  },
  indicator: {
    position: 'absolute',
    top: 6,
    height: 54,
    borderRadius: 18,
  },
  fab: {
    shadowColor: '#FF961D',
    shadowOpacity: 0.55,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
    elevation: 10,
  },
});
