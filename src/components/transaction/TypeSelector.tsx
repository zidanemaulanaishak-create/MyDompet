import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, LayoutChangeEvent } from 'react-native';
import { Iconify } from 'react-native-iconify';
import { COLORS } from '@/constants/colors';

type TxType = 'expense' | 'income';

interface TypeOption {
  type: TxType;
  label: string;
  icon: string;
  color: string;
  bgActive: string;
}

const OPTIONS: TypeOption[] = [
  {
    type: 'expense',
    label: 'Pengeluaran',
    icon: 'ph:arrow-up-right-bold',
    color: COLORS.red,
    bgActive: COLORS.red,
  },
  {
    type: 'income',
    label: 'Pemasukan',
    icon: 'ph:arrow-down-left-bold',
    color: COLORS.green,
    bgActive: COLORS.green,
  },
];

interface Props {
  value: TxType;
  onChange: (value: TxType) => void;
  className?: string;
}

export default function TypeSelector({ value, onChange, className }: Props) {
  const [optionWidth, setOptionWidth] = React.useState(0);

  const handleLayout = (e: LayoutChangeEvent) => {
    const w = (e.nativeEvent.layout.width - 8 - 8) / 2; // 8 = padding (4+4), 8 = gap
    setOptionWidth(Math.floor(w));
  };

  return (
    <View
      className={`bg-chipBlue rounded-xl ${className || ''}`}
      style={styles.container}
      onLayout={handleLayout}
    >
      <View style={styles.row}>
        {OPTIONS.map((option) => {
          const active = value === option.type;
          return (
            <TouchableOpacity
              key={option.type}
              style={[
                styles.option,
                optionWidth > 0 && { width: optionWidth },
                active && { backgroundColor: option.bgActive },
              ]}
              activeOpacity={0.85}
              onPress={() => onChange(option.type)}
            >
              <Iconify
                icon={option.icon}
                size={18}
                color={active ? '#fff' : option.color}
              />
              <Text
                style={[
                  styles.label,
                  { color: active ? '#fff' : COLORS.textMuted },
                ]}
              >
                {option.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignSelf: 'stretch',
    padding: 4,
  },
  row: {
    flexDirection: 'row',
    gap: 8,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    gap: 8,
    borderRadius: 12,
    backgroundColor: 'transparent',
  },
  label: {
    fontSize: 17,
    fontWeight: '600',
  },
});
