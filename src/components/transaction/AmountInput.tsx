import React, { useRef, useImperativeHandle, forwardRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { Iconify } from 'react-native-iconify';
import { COLORS } from '@/constants/colors';

export interface AmountInputRef {
  focus: () => void;
  blur: () => void;
  getValue: () => number;
  clear: () => void;
}

interface Props {
  type: 'expense' | 'income';
  currencySymbol: string;
  value: string;
  onChangeText: (text: string, numericValue: number) => void;
  error?: string | null;
  disabled?: boolean;
  className?: string;
  label?: string;
}

const AmountInput = forwardRef<AmountInputRef, Props>(
  (
    {
      type,
      currencySymbol,
      value,
      onChangeText,
      error,
      disabled = false,
      className,
      label = 'Nominal',
    },
    ref
  ) => {
    const inputRef = useRef<TextInput>(null);

    const formatNumber = (numStr: string): string => {
      const cleaned = numStr.replace(/[^\d]/g, '');
      if (!cleaned) return '';
      return parseInt(cleaned, 10).toLocaleString('id-ID');
    };

    const parseValue = (formatted: string): number => {
      return parseInt(formatted.replace(/[^\d]/g, '') || '0', 10);
    };

    const handleChangeText = (text: string) => {
      const numeric = parseValue(text);
      const formatted = numeric > 0 ? formatNumber(text) : text.replace(/[^\d]/g, '');
      onChangeText(formatted, numeric);
    };

    const numericValue = parseValue(value);
    const displayValue = numericValue > 0 ? numericValue.toLocaleString('id-ID') : value;
    const signColor = type === 'expense' ? COLORS.red : COLORS.green;

    useImperativeHandle(ref, () => ({
      focus: () => inputRef.current?.focus(),
      blur: () => inputRef.current?.blur(),
      getValue: () => numericValue,
      clear: () => onChangeText('', 0),
    }));

    return (
      <View className={`bg-card rounded-2xl p-4 shadow-sm ${className || ''}`}>
        <Text className="text-lg text-textMuted mb-3 font-semibold">{label}</Text>
        <View style={styles.amountRow}>
          <View style={styles.prefix}>
            <Text style={[styles.sign, { color: signColor }]}>
              {type === 'expense' ? '-' : '+'}
            </Text>
            <Text style={styles.symbol}>{currencySymbol}</Text>
          </View>
          <View style={styles.inputContainer}>
            <TextInput
              ref={inputRef}
              style={styles.input}
              keyboardType="number-pad"
              placeholder="0"
              placeholderTextColor="#C1C5D4"
              value={displayValue}
              onChangeText={handleChangeText}
              editable={!disabled}
              selectionColor={COLORS.primary}
            />
            {numericValue > 0 && (
              <TouchableOpacity
                style={styles.clearButton}
                onPress={() => onChangeText('', 0)}
                activeOpacity={0.7}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Iconify icon="ph:x-bold" size={16} color={COLORS.textMuted} />
              </TouchableOpacity>
            )}
          </View>
        </View>
        {error ? (
          <Text style={[styles.error, { color: COLORS.red }]}>{error}</Text>
        ) : null}
      </View>
    );
  }
);

AmountInput.displayName = 'AmountInput';

const styles = StyleSheet.create({
  amountRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  prefix: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginRight: 6,
  },
  sign: {
    fontSize: 28,
    fontWeight: '700',
    marginRight: 2,
  },
  symbol: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.textDark,
  },
  inputContainer: {
    flex: 1,
    position: 'relative',
  },
  input: {
    fontSize: 40,
    fontWeight: '700',
    color: COLORS.textDark,
    textAlign: 'right',
    paddingVertical: 4,
    paddingRight: 40,
  },
  clearButton: {
    position: 'absolute',
    right: 0,
    top: '50%',
    marginTop: -14,
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F1F3F5',
  },
  error: {
    fontSize: 18,
    marginTop: 8,
  },
});

export default AmountInput;
