import React from 'react';
import { View, Text } from 'react-native';
import { Iconify } from 'react-native-iconify';
import AnimatedPressable from '@/components/ui/AnimatedPressable';
import ProgressFill from '@/components/ui/ProgressFill';
import { getThemeColors } from '@/constants/colors';
import { useTheme } from '@/context/theme-context';
import { useI18n } from '@/i18n';
import { GoalItem } from '@/data/dummyData';

interface CardProps {
  item: GoalItem;
  onPress?: (item: GoalItem) => void;
}

export function GoalCard({ item, onPress }: CardProps) {
  const { isDark, accent } = useTheme();
  const { t } = useI18n();
  const palette = getThemeColors(isDark ? 'dark' : 'light', accent);
  const isCake = item.icon === 'ph:cake-bold';
  return (
    <AnimatedPressable
      className="border-[1.5px] rounded-xl p-3 mb-3"
      style={{ borderColor: palette.border }}
      activeOpacity={0.7}
      onPress={() => onPress?.(item)}
    >
      <View className="flex-row items-center mb-2.5">
        <View
          className="w-10 h-10 rounded-[10px] items-center justify-center mr-2.5"
          style={{ backgroundColor: isCake ? (isDark ? 'rgba(248,113,113,0.18)' : '#FDECEC') : palette.chipBlue }}
        >
          <Iconify
            icon={item.icon}
            size={22}
            color={isCake ? palette.red : palette.primary}
          />
        </View>
        <View className="flex-1">
          <Text className="text-lg font-bold" style={{ color: palette.textDark }}>{item.name}</Text>
          <Text className="text-lg mt-0.5" style={{ color: palette.textMuted }}>{t('home.goalTime', { days: item.days })}</Text>
        </View>
        <Iconify icon="ph:caret-right-bold" size={16} color={palette.textMuted} />
      </View>

      <View className="h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: palette.track }}>
        <ProgressFill
          className="h-1.5 rounded-full"
          progress={item.progress}
          color={palette.orange}
        />
      </View>

      <View className="flex-row justify-between mt-2">
        <Text className="text-lg font-bold" style={{ color: palette.textDark }}>{item.saved}</Text>
        <Text className="text-lg" style={{ color: palette.textMuted }}>{item.target}</Text>
      </View>
    </AnimatedPressable>
  );
}