import React from 'react';
import { View, StyleSheet } from 'react-native';
import { getThemeColors } from '@/constants/colors';
import { useTheme } from '@/context/theme-context';
import { QuickSuggestion } from '@/types/chat';
import SuggestionRail from './SuggestionRail';

interface Props {
  suggestions: QuickSuggestion[];
  onPress: (suggestion: QuickSuggestion) => void;
}

export default function QuickSuggestions({ suggestions, onPress }: Props) {
  const { isDark } = useTheme();
  const palette = getThemeColors(isDark ? 'dark' : 'light');

  if (!suggestions.length) return null;

  return (
    <View style={[styles.container, { backgroundColor: palette.card, borderColor: isDark ? '#263550' : '#E5EAF1' }]}>
      <SuggestionRail suggestions={suggestions} onPress={onPress} compact />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { borderWidth: 1, borderRadius: 18, paddingVertical: 6, paddingHorizontal: 4, marginTop: 4, marginBottom: 6, shadowColor: '#1A2E5A', shadowOpacity: 0.05, shadowOffset: { width: 0, height: 2 }, shadowRadius: 8, elevation: 2 },
});
