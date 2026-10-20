import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Iconify } from 'react-native-iconify';
import { getThemeColors } from '@/constants/colors';
import { useTheme } from '@/context/theme-context';
import { useI18n } from '@/i18n';

interface Props {
  insightText: string;
  suggestions: string[];
  onSuggestionPress?: (text: string) => void;
}

export default function AIInsightCard({
  insightText,
  suggestions,
  onSuggestionPress,
}: Props) {
  const { isDark } = useTheme();
  const { t } = useI18n();
  const palette = getThemeColors(isDark ? 'dark' : 'light');
  return (
    <LinearGradient
      colors={isDark ? ['#172B4D', '#16233D'] : [palette.chipBlue, '#F6FAFF']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.card}
    >
      <View className="flex-row items-center gap-2">
        <View className="w-8 h-8 rounded-full items-center justify-center" style={{ backgroundColor: palette.primary }}>
          <Iconify icon="ph:sparkle-bold" size={15} color="#FFFFFF" />
        </View>
        <Text className="font-bold text-base flex-1" style={{ color: palette.textDark }}>{t('home.aiInsight')}</Text>
      </View>

      <Text className="text-sm mt-2.5 leading-[20px]" style={{ color: palette.textMuted }}>
        {insightText}
      </Text>

      <TouchableOpacity
        className="flex-row items-center justify-center gap-1.5 rounded-[10px] py-2.5 px-3 mt-3.5"
        style={{ backgroundColor: palette.primary }}
        activeOpacity={0.85}
        onPress={() => onSuggestionPress?.(suggestions[0])}
      >
        <Iconify icon="ph:sparkle-bold" size={14} color="#FFFFFF" />
        <Text className="text-sm font-bold text-white">{t('home.askMyGpt')}</Text>
      </TouchableOpacity>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mt-2.5">
        {suggestions.map((s, i) => (
          <TouchableOpacity
            key={i}
            className="rounded-[10px] p-2.5 mr-2 max-w-[140px]"
            style={{ backgroundColor: isDark ? '#1C2942' : '#D4E4FF' }}
            onPress={() => onSuggestionPress?.(s)}
          >
            <Text className="text-xs leading-[17px] font-medium" style={{ color: palette.primary }} numberOfLines={2}>
              {s}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    shadowColor: '#1A2E5A',
    shadowOpacity: 0.1,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },
});