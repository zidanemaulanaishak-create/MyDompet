import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Iconify } from 'react-native-iconify';
import { COLORS, getThemeColors } from '@/constants/colors';
import { useTheme } from '@/context/theme-context';
import { QuickActionItem } from '@/data/dummyData';

interface Props {
  items: QuickActionItem[];
  onPress?: (item: QuickActionItem) => void;
}

function ActionIcon({ item }: { item: QuickActionItem }) {
  if (item.variant === 'dark') {
    return (
      <LinearGradient
        colors={['#122E85', '#1A42BA']}
        locations={[0.41, 1]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={styles.chip}
      >
        <Iconify icon={item.icon} size={22} color="#FFFFFF" />
      </LinearGradient>
    );
  }
  return (
    <LinearGradient
      colors={['#38BDF8', '#B3E5FB']}
      locations={[0.09, 1]}
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
      style={styles.chip}
    >
      <Iconify icon={item.icon} size={22} color={COLORS.primary} />
    </LinearGradient>
  );
}

export default function QuickActions({ items, onPress }: Props) {
  const { isDark } = useTheme();
  const palette = getThemeColors(isDark ? 'dark' : 'light');
  return (
    <View
      className="mb-4 mx-4 -mt-12 rounded-2xl px-2 pt-4 pb-3"
      style={[styles.card, { backgroundColor: palette.card }]}
    >
      <View className="flex-row justify-between items-start gap-2">
        {items.map((item) => (
          <TouchableOpacity
            key={item.id}
            className="flex-1 items-center"
            activeOpacity={0.7}
            onPress={() => onPress?.(item)}
          >
            <ActionIcon item={item} />
            <Text className="text-xs text-center leading-[16px] font-medium" style={{ color: palette.textDark }} numberOfLines={2}>
              {item.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    shadowColor: '#1A2E5A',
    shadowOpacity: 0.12,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 8 },
    elevation: 6,
  },
  chip: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
});