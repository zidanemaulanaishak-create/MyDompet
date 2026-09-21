import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Iconify } from 'react-native-iconify';
import { COLORS } from '@/constants/colors';

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
  return (
    <LinearGradient
      colors={[COLORS.chipBlue, '#F6FAFF']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.card}
    >
      <View className="flex-row items-center gap-2">
        <View className="w-8 h-8 rounded-full items-center justify-center" style={{ backgroundColor: COLORS.primary }}>
          <Iconify icon="ph:sparkle-bold" size={15} color="#FFFFFF" />
        </View>
        <Text className="font-bold text-base text-textDark flex-1">AI Financial Insight</Text>
      </View>

      <Text className="text-textMuted text-sm mt-2.5 leading-[20px]">
        {insightText}
      </Text>

      <TouchableOpacity
        className="flex-row items-center justify-center gap-1.5 bg-primary rounded-[10px] py-2.5 px-3 mt-3.5"
        activeOpacity={0.85}
        onPress={() => onSuggestionPress?.(suggestions[0])}
      >
        <Iconify icon="ph:sparkle-bold" size={14} color="#FFFFFF" />
        <Text className="text-sm font-bold text-white">Tanya MyGpt</Text>
      </TouchableOpacity>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mt-2.5">
        {suggestions.map((s, i) => (
          <TouchableOpacity
            key={i}
            className="bg-[#D4E4FF] rounded-[10px] p-2.5 mr-2 max-w-[140px]"
            onPress={() => onSuggestionPress?.(s)}
          >
            <Text className="text-xs leading-[17px] text-primary font-medium" numberOfLines={2}>
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