import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { getThemeColors } from '@/constants/colors';
import { useTheme } from '@/context/theme-context';

interface Props {
  type: 'expense' | 'income';
  onSelect: (value: number) => void;
  currentValue?: number;
}

const PRESETS = [10000, 50000, 100000, 500000];

export default function QuickAmountChips({ type, onSelect, currentValue }: Props) {
  const { isDark } = useTheme();
  const palette = getThemeColors(isDark ? 'dark' : 'light');
  const accent = type === 'expense' ? palette.red : palette.green;
  const bgTint =
    type === 'expense'
      ? isDark
        ? 'rgba(239,68,68,0.15)'
        : '#FEF2F2'
      : isDark
        ? 'rgba(16,185,129,0.15)'
        : '#ECFDF5';

  return (
    <View style={styles.container}>
      {PRESETS.map((preset) => {
        const active = currentValue === preset;
        return (
          <TouchableOpacity
            key={preset}
            style={[
              styles.chip,
              {
                backgroundColor: active ? accent : bgTint,
                borderColor: active ? accent : 'transparent',
              },
            ]}
            onPress={() => onSelect(preset)}
            activeOpacity={0.8}
          >
            <Text
              style={[
                styles.chipText,
                { color: active ? '#fff' : accent },
              ]}
            >
              Rp {preset.toLocaleString('id-ID')}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1.5,
  },
  chipText: {
    fontSize: 18,
    fontWeight: '600',
  },
});