import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Iconify } from 'react-native-iconify';
import { useRouter, usePathname } from 'expo-router';
import { COLORS, getThemeColors } from '@/constants/colors';
import { useTheme } from '@/context/theme-context';

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
    label: 'Home',
    iconActive: 'ph:house-fill',
    iconInactive: 'ph:house',
  },
  {
    key: 'transactions',
    route: '/transactions',
    label: 'Transactions',
    iconActive: 'ph:receipt-fill',
    iconInactive: 'ph:receipt',
  },
];

const NAV_ITEMS_RIGHT: NavItemConfig[] = [
  {
    key: 'budget',
    route: '/budget',
    label: 'Budget',
    iconActive: 'ph:chart-bar-fill',
    iconInactive: 'ph:chart-bar',
  },
  {
    key: 'profile',
    route: '/profile',
    label: 'Profile',
    iconActive: 'ph:user-fill',
    iconInactive: 'ph:user',
  },
];

function NavItem({ item, active }: { item: NavItemConfig; active: boolean }) {
  const router = useRouter();
  const { isDark } = useTheme();
  const palette = getThemeColors(isDark ? 'dark' : 'light');

  return (
    <TouchableOpacity
      className="flex-1 items-center gap-0.5"
      onPress={() => router.push(item.route as any)}
    >
      <Iconify
        icon={active ? item.iconActive : item.iconInactive}
        size={22}
        color={active ? palette.primary : palette.textMuted}
      />
      <Text
        className="text-xs font-semibold"
        style={{ color: active ? palette.primary : palette.textMuted }}
      >
        {item.label}
      </Text>
    </TouchableOpacity>
  );
}

interface Props {
  onFabPress?: () => void;
}

export default function BottomNav({ onFabPress }: Props) {
  const pathname = usePathname();
  const router = useRouter();
  const { isDark } = useTheme();
  const palette = getThemeColors(isDark ? 'dark' : 'light');
  const bg = isDark ? palette.card : palette.bg;

  return (
    <View
      className="absolute bottom-0 left-0 right-0 h-[78px] flex-row items-center
                 rounded-t-[20px] shadow-lg pb-2.5"
      style={[styles.bar, { backgroundColor: bg }]}
    >
      {NAV_ITEMS.map((item) => (
        <NavItem key={item.key} item={item} active={pathname === item.route} />
      ))}

      <View className="w-[72px] items-center">
        <TouchableOpacity
          className="w-[56px] h-[56px] rounded-full bg-orange items-center justify-center -mt-9"
          style={styles.fab}
          activeOpacity={0.85}
          onPress={onFabPress ?? (() => router.push('/add-transaction' as any))}
        >
          <Iconify icon="ph:plus-bold" size={28} color="#fff" />
        </TouchableOpacity>
      </View>

      {NAV_ITEMS_RIGHT.map((item) => (
        <NavItem key={item.key} item={item} active={pathname === item.route} />
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
  fab: {
    shadowColor: COLORS.orange,
    shadowOpacity: 0.55,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
    elevation: 10,
  },
});