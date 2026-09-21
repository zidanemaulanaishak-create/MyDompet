import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Iconify } from 'react-native-iconify';
import { COLORS } from '@/constants/colors';

export const BUDGET_SUGGESTIONS: string[] = [
  'Gimana cara bikin pengeluaran lebih efisien?',
  'Gimana cara mulai bikin dana darurat?',
  'Cara alokasi sisa budget ke tabungan?',
];

export default function BudgetAskAI() {
  const router = useRouter();

  const handlePress = (q: string) => {
    router.push({ pathname: '/ai-assistant', params: { q } });
  };

  return (
    <LinearGradient
      colors={[COLORS.chipBlue, '#F6FAFF']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.card}
    >
      <View className="flex-row items-center gap-2">
        <View className="w-8 h-8 rounded-full items-center justify-center bg-primary">
          <Iconify icon="ph:sparkle-bold" size={15} color="#FFFFFF" />
        </View>
        <Text className="font-bold text-lg text-textDark flex-1">
          Tanya AI Financial Assistant
        </Text>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mt-3">
        {BUDGET_SUGGESTIONS.map((s, i) => (
          <TouchableOpacity
            key={i}
            className="bg-[#D4E4FF] rounded-[10px] px-3 py-2.5 mr-2 max-w-[150px]"
            activeOpacity={0.85}
            onPress={() => handlePress(s)}
          >
            <Text className="text-lg leading-[18px] text-primary font-medium" numberOfLines={2}>
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