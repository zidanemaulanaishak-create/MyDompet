import React, { useMemo } from 'react';
import { ScrollView, TouchableOpacity, StyleSheet, Text, View } from 'react-native';
import { Iconify } from 'react-native-iconify';
import { useI18n } from '@/i18n';

export interface InputShortcut {
  id: string;
  label: string;
  icon: string;
}

const SHORTCUTS: InputShortcut[] = [
  { id: 's1', label: 'ai.shortcut.record', icon: 'ph:pencil-line-bold' },
  { id: 's2', label: 'ai.shortcut.recordHistory', icon: 'ph:file-text-bold' },
  { id: 's3', label: 'ai.shortcut.compare', icon: 'ph:trend-up-bold' },
  { id: 's4', label: 'ai.shortcut.financialPlan', icon: 'ph:calculator-bold' },
  { id: 's5', label: 'ai.shortcut.budget', icon: 'ph:chart-bar-bold' },
  { id: 's6', label: 'ai.shortcut.recommend', icon: 'ph:sparkle-bold' },
];

interface Props {
  onPress: (label: string) => void;
}

export default function InputShortcuts({ onPress }: Props) {
  const { t } = useI18n();
  const columns = useMemo(() => {
    const cols: InputShortcut[][] = [];
    for (let i = 0; i < SHORTCUTS.length; i += 2) {
      cols.push(SHORTCUTS.slice(i, i + 2));
    }
    return cols;
  }, []);

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.row}
      style={styles.scroll}
    >
      {columns.map((column, columnIndex) => (
        <View key={`col-${columnIndex}`} style={styles.column}>
          {column.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.chip}
              activeOpacity={0.6}
              onPress={() => onPress(t(item.label))}
            >
              <Iconify icon={item.icon} size={14} color="#7DD3FC" />
              <Text style={styles.label} numberOfLines={1}>
                {t(item.label)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { marginHorizontal: -16, marginBottom: 8 },
  row: { flexDirection: 'row', gap: 8, paddingHorizontal: 16, alignItems: 'flex-start' },
  column: { gap: 8 },
  chip: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: 'rgba(30,41,59,0.7)', borderWidth: 1, borderColor: '#334155', borderRadius: 20, paddingHorizontal: 12, paddingVertical: 8 },
  label: { fontSize: 18, fontWeight: '600', color: '#E2E8F0' },
});
