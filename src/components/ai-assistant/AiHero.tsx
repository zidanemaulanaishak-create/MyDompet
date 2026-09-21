import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Iconify } from 'react-native-iconify';
import { QuickSuggestion } from '@/types/chat';

export interface PopularTopic {
  id: string;
  label: string;
  icon: string;
}

export const POPULAR_TOPICS: PopularTopic[] = [
  { id: 't1', label: 'Berapa target tabungan harian saya?', icon: 'ph:target-bold' },
  { id: 't2', label: 'Alokasi dana darurat yang ideal', icon: 'ph:shield-check-bold' },
  { id: 't3', label: 'Tips hemat bulan ini', icon: 'ph:piggy-bank-bold' },
  { id: 't4', label: 'Kategori mana yang paling boros?', icon: 'ph:chart-pie-slice-bold' },
  { id: 't5', label: 'Buatkan rencana mingguan', icon: 'ph:calendar-check-bold' },
  { id: 't6', label: 'Instrumen investasi yang cocok?', icon: 'ph:bank-bold' },
];

const HERO_CHIPS: QuickSuggestion[] = [
  { id: 'h1', label: 'Catat transaksi otomatis' },
  { id: 'h2', label: 'Tips hemat bulan ini' },
  { id: 'h3', label: 'Bandingkan keuangan' },
  { id: 'h4', label: 'Target tabungan' },
];

interface Props {
  userName: string;
  onChipPress: (suggestion: QuickSuggestion) => void;
  onTopicPress: (topic: PopularTopic) => void;
  onSeeAllPress: () => void;
}

export default function AiHero({ userName, onChipPress, onTopicPress, onSeeAllPress }: Props) {
  return (
    <View style={styles.hero}>
      <Text style={styles.greeting}>Hai, {userName}!</Text>
      <Text style={styles.sub}>Ada yang bisa MyGpt bantu hari ini?</Text>

      <View style={styles.chips}>
        {HERO_CHIPS.map((chip) => (
          <TouchableOpacity key={chip.id} style={styles.chip} activeOpacity={0.7} onPress={() => onChipPress(chip)}>
            <Text style={styles.chipLabel} numberOfLines={1}>{chip.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.sectionHead}>
        <Text style={styles.sectionTitle}>Topik Populer</Text>
        <TouchableOpacity onPress={onSeeAllPress} activeOpacity={0.7} hitSlop={8}>
          <Text style={styles.seeAll}>Lihat Semua</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.grid}>
        {POPULAR_TOPICS.slice(0, 2).map((topic) => (
          <TouchableOpacity key={topic.id} style={styles.card} activeOpacity={0.8} onPress={() => onTopicPress(topic)}>
            <View style={styles.cardIcon}>
              <Iconify icon={topic.icon} size={18} color="#FFFFFF" />
            </View>
            <Text style={styles.cardLabel} numberOfLines={3}>{topic.label}</Text>
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
