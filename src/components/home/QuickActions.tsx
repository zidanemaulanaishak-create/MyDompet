import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import AnimatedPressable from '@/components/ui/AnimatedPressable';
import { Iconify } from 'react-native-iconify';
import { getThemeColors } from '@/constants/colors';
import { useTheme } from '@/context/theme-context';
import { QuickActionItem } from '@/data/dummyData';

interface Props {
  items: QuickActionItem[];
  onPress?: (item: QuickActionItem) => void;
}

function ActionIcon({ item, palette }: { item: QuickActionItem; palette: ReturnType<typeof getThemeColors> }) {
  if (item.variant === 'dark') {
    return (
      <LinearGradient
        colors={[palette.primaryDark, palette.primary]}
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
      colors={[palette.sky, palette.sky + '55']}
      locations={[0.09, 1]}
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
      style={styles.chip}
    >
      <Iconify icon={item.icon} size={22} color={palette.primary} />
    </LinearGradient>
  );
}

export default function QuickActions({ items, onPress }: Props) {
  const { isDark, accent } = useTheme();
  const palette = getThemeColors(isDark ? 'dark' : 'light', accent);
  return (
    <View
      className="mb-4 mx-4 -mt-12 rounded-2xl px-2 pt-4 pb-3"
      style={[styles.card, { backgroundColor: palette.card }]}
    >
      <View className="flex-row justify-between items-start gap-2">
        {items.map((item) => (
          <AnimatedPressable
            key={item.id}
            className="flex-1 items-center"
            activeOpacity={0.7}
            onPress={() => onPress?.(item)}
          >
            <ActionIcon item={item} palette={palette} />
            <Text className="text-xs text-center leading-[16px] font-medium" style={{ color: palette.textDark }} numberOfLines={2}>
              {item.label}
            </Text>
          </AnimatedPressable>
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