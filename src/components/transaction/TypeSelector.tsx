import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, LayoutChangeEvent } from 'react-native';
import { Iconify } from 'react-native-iconify';
import { getThemeColors } from '@/constants/colors';
import { useTheme } from '@/context/theme-context';
import { useI18n } from '@/i18n';

type TxType = 'expense' | 'income';

interface TypeOption {
  type: TxType;
  labelKey: string;
  icon: string;
}

const OPTIONS: TypeOption[] = [
  {
    type: 'expense',
    labelKey: 'addTx.tabExpense',
    icon: 'ph:arrow-up-right-bold',
  },
  {
    type: 'income',
    labelKey: 'addTx.tabIncome',
    icon: 'ph:arrow-down-left-bold',
  },
];

interface Props {
  value: TxType;
  onChange: (value: TxType) => void;
  className?: string;
}

export default function TypeSelector({ value, onChange, className }: Props) {
  const { isDark } = useTheme();
  const { t } = useI18n();
  const palette = getThemeColors(isDark ? 'dark' : 'light');
  const [optionWidth, setOptionWidth] = React.useState(0);

  const handleLayout = (e: LayoutChangeEvent) => {
    const w = (e.nativeEvent.layout.width - 8 - 8) / 2; // 8 = padding (4+4), 8 = gap
    setOptionWidth(Math.floor(w));
  };

  const accent = (type: TxType) => (type === 'expense' ? palette.red : palette.green);

  return (
    <View
      className={`rounded-xl ${className || ''}`}
      style={[styles.container, { backgroundColor: palette.chipBlue }]}
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
                active && { backgroundColor: accent(option.type) },
              ]}
              activeOpacity={0.85}
              onPress={() => onChange(option.type)}
            >
              <Iconify
                icon={option.icon}
                size={18}
                color={active ? '#fff' : accent(option.type)}
              />
              <Text
                style={[
                  styles.label,
                  { color: active ? '#fff' : palette.textMuted },
                ]}
              >
                {t(option.labelKey)}
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