import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { COLORS } from '@/constants/colors';
import { GoalFilter } from '@/data/goalsData';

interface Props {
  value: GoalFilter;
  onChange: (f: GoalFilter) => void;
}

const TABS: { key: GoalFilter; label: string }[] = [
  { key: 'all', label: 'Semua' },
  { key: 'active', label: 'Berjalan' },
  { key: 'done', label: 'Tercapai' },
];

export default function GoalsFilterTabs({ value, onChange }: Props) {
  return (
    <View style={styles.row}>
      {TABS.map((t) => {
        const active = t.key === value;
        return (
          <TouchableOpacity
            key={t.key}
            style={[styles.chip, active ? styles.chipActive : styles.chipIdle]}
            activeOpacity={0.8}
            onPress={() => onChange(t.key)}
          >
            <Text style={[styles.chipLabel, active ? styles.chipLabelActive : styles.chipLabelIdle]}>
              {t.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 10, paddingHorizontal: 16, marginTop: 16 },
  chip: { paddingHorizontal: 18, paddingVertical: 10, borderRadius: 20 },
  chipActive: { backgroundColor: COLORS.primary },
  chipIdle: { backgroundColor: '#F1F5F9' },
  chipLabel: { fontSize: 14, fontWeight: '700' },
  chipLabelActive: { color: '#FFFFFF' },
  chipLabelIdle: { color: '#64748B' },
});
