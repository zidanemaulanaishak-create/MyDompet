import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Iconify } from 'react-native-iconify';
import { QuickSuggestion } from '@/types/chat';
import { useI18n } from '@/i18n';

export interface PopularTopic {
  id: string;
  label: string;
  icon: string;
}

export const POPULAR_TOPICS: PopularTopic[] = [
  { id: 't1', label: 'ai.topic.dailySavings', icon: 'ph:target-bold' },
  { id: 't2', label: 'ai.topic.emergencyFund', icon: 'ph:shield-check-bold' },
  { id: 't3', label: 'ai.topic.savingTips', icon: 'ph:piggy-bank-bold' },
  { id: 't4', label: 'ai.topic.wastefulCategory', icon: 'ph:chart-pie-slice-bold' },
  { id: 't5', label: 'ai.topic.weeklyPlan', icon: 'ph:calendar-check-bold' },
  { id: 't6', label: 'ai.topic.investment', icon: 'ph:bank-bold' },
];

const HERO_CHIPS: QuickSuggestion[] = [
  { id: 'h1', label: 'ai.chipAutoRecord' },
  { id: 'h2', label: 'ai.chipBudgetTips' },
  { id: 'h3', label: 'ai.chipCompareFinance' },
  { id: 'h4', label: 'ai.chipSavingsGoal' },
];

interface Props {
  userName: string;
  onChipPress: (suggestion: QuickSuggestion) => void;
  onTopicPress: (topic: PopularTopic) => void;
  onSeeAllPress: () => void;
}

export default function AiHero({ userName, onChipPress, onTopicPress, onSeeAllPress }: Props) {
  const { t } = useI18n();
  return (
    <View style={styles.hero}>
      <Text style={styles.greeting}>{t('ai.greeting', { name: userName })}</Text>
      <Text style={styles.sub}>{t('ai.helpToday')}</Text>

      <View style={styles.chips}>
        {HERO_CHIPS.map((chip) => (
          <TouchableOpacity key={chip.id} style={styles.chip} activeOpacity={0.7} onPress={() => onChipPress(chip)}>
            <Text style={styles.chipLabel} numberOfLines={1}>{t(chip.label)}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.sectionHead}>
        <Text style={styles.sectionTitle}>{t('ai.popularTopics')}</Text>
        <TouchableOpacity onPress={onSeeAllPress} activeOpacity={0.7} hitSlop={8}>
          <Text style={styles.seeAll}>{t('ai.seeAll')}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.grid}>
        {POPULAR_TOPICS.slice(0, 2).map((topic) => (
          <TouchableOpacity key={topic.id} style={styles.card} activeOpacity={0.8} onPress={() => onTopicPress(topic)}>
            <View style={styles.cardIcon}>
              <Iconify icon={topic.icon} size={18} color="#FFFFFF" />
            </View>
            <Text style={styles.cardLabel} numberOfLines={3}>{t(topic.label)}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  hero: { width: '100%', paddingTop: 8 },
  greeting: { color: '#FFFFFF', fontSize: 28, fontWeight: '800', letterSpacing: -0.6 },
  sub: { color: '#94A3B8', fontSize: 18, marginTop: 6 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, justifyContent: 'center', marginTop: 20 },
  chip: { backgroundColor: 'rgba(30,41,59,0.7)', borderWidth: 1, borderColor: '#334155', borderRadius: 20, paddingHorizontal: 14, paddingVertical: 9 },
  chipLabel: { color: '#E2E8F0', fontSize: 18, fontWeight: '600' },
  sectionHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 28, marginBottom: 12 },
  sectionTitle: { color: '#FFFFFF', fontSize: 17, fontWeight: '800' },
  seeAll: { color: '#7DD3FC', fontSize: 18, fontWeight: '700' },
  grid: { flexDirection: 'row', gap: 12 },
  card: { flex: 1, backgroundColor: 'rgba(255,255,255,0.06)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', borderRadius: 20, padding: 16, minHeight: 148, justifyContent: 'flex-start' },
  cardIcon: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', backgroundColor: '#2563EB', marginBottom: 12 },
  cardLabel: { color: '#F1F5F9', fontSize: 17, fontWeight: '700', lineHeight: 19 },
});
