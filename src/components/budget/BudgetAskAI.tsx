import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Iconify } from 'react-native-iconify';
import { getThemeColors } from '@/constants/colors';
import { useTheme } from '@/context/theme-context';
import { useI18n } from '@/i18n';

export const BUDGET_SUGGESTIONS: string[] = [
  'budget.ask.suggest1',
  'budget.ask.suggest2',
  'budget.ask.suggest3',
];

export default function BudgetAskAI() {
  const router = useRouter();
  const { t } = useI18n();
  const { isDark } = useTheme();
  const palette = getThemeColors(isDark ? 'dark' : 'light');

  const handlePress = (q: string) => {
    router.push({ pathname: '/ai-assistant', params: { q } });
  };

  return (
    <LinearGradient
      colors={isDark ? ['#172B4D', '#16233D'] : ['#E8F0FE', '#F6FAFF']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.card}
    >
      <View className="flex-row items-center gap-2">
        <View
          className="w-8 h-8 rounded-full items-center justify-center"
          style={{ backgroundColor: palette.primary }}
        >
          <Iconify icon="ph:sparkle-bold" size={15} color="#FFFFFF" />
        </View>
        <Text className="font-bold text-lg flex-1" style={{ color: palette.textDark }}>
          {t('budget.askTitle')}
        </Text>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mt-3">
        {BUDGET_SUGGESTIONS.map((s, i) => (
          <TouchableOpacity
            key={i}
            className="rounded-[10px] px-3 py-2.5 mr-2 max-w-[150px]"
            style={{ backgroundColor: isDark ? '#1C2942' : '#D4E4FF' }}
            activeOpacity={0.85}
            onPress={() => handlePress(t(s))}
          >
            <Text
              className="text-lg leading-[18px] font-medium"
              style={{ color: palette.primary }}
              numberOfLines={2}
            >
              {t(s)}
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
    marginHorizontal: 20,
    marginTop: 20,
    marginBottom: 24,
    shadowColor: '#1A2E5A',
    shadowOpacity: 0.1,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },
});