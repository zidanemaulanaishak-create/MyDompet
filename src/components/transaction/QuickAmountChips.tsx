import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { COLORS } from '@/constants/colors';

interface Props {
  type: 'expense' | 'income';
  onSelect: (value: number) => void;
  currentValue?: number;
}

const PRESETS = [10000, 50000, 100000, 500000];

export default function QuickAmountChips({ type, onSelect, currentValue }: Props) {
  const accent = type === 'expense' ? COLORS.red : COLORS.green;
  const bgTint = type === 'expense' ? '#FEF2F2' : '#ECFDF5';

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