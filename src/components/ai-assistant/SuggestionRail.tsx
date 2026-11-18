import React from 'react';
import { ScrollView, TouchableOpacity, StyleSheet, Text, View } from 'react-native';
import { Iconify } from 'react-native-iconify';
import { getThemeColors } from '@/constants/colors';
import { useTheme } from '@/context/theme-context';
import { QuickSuggestion } from '@/types/chat';
import { useI18n } from '@/i18n';

interface Props {
  suggestions: QuickSuggestion[];
  onPress: (suggestion: QuickSuggestion) => void;
  compact?: boolean;
}

export default function SuggestionRail({ suggestions, onPress, compact = false }: Props) {
  const { isDark, accent } = useTheme();
  const palette = getThemeColors(isDark ? 'dark' : 'light', accent);
  const { t } = useI18n();

  if (!suggestions.length) return null;

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.row}
      style={styles.scroll}
    >
      {suggestions.map((item) => (
        <TouchableOpacity
          key={item.id}
          style={[
            compact ? styles.compactChip : styles.card,
            { backgroundColor: palette.chipBlue, borderColor: palette.border },
          ]}
          activeOpacity={0.7}
          onPress={() => onPress(item)}
        >
          {!compact ? (
            <View style={[styles.tile, { backgroundColor: palette.card }]}>
              <Iconify icon={item.icon ?? 'ph:sparkle-bold'} size={15} color={palette.primary} />
            </View>
          ) : null}
          <Text
            style={[compact ? styles.compactLabel : styles.label, { color: palette.textDark }]}
            numberOfLines={compact ? 1 : 2}
          >
            {t(item.label)}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { marginHorizontal: -4 },
  row: { flexDirection: 'row', gap: 10, paddingHorizontal: 4, paddingVertical: 6, alignItems: 'stretch' },
  card: { width: 168, borderWidth: 1, borderRadius: 18, padding: 12, shadowColor: '#1A2E5A', shadowOpacity: 0.06, shadowOffset: { width: 0, height: 3 }, shadowRadius: 8, elevation: 2 },
  tile: { width: 34, height: 34, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  label: { fontSize: 18, fontWeight: '700', lineHeight: 17 },
  compactChip: { flexDirection: 'row', alignItems: 'center', gap: 6, borderWidth: 1, borderRadius: 20, paddingHorizontal: 12, paddingVertical: 9 },
  compactLabel: { fontSize: 18, fontWeight: '700' },
});
