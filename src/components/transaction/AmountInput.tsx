import React, { useRef, useImperativeHandle, forwardRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { Iconify } from 'react-native-iconify';
import { getThemeColors } from '@/constants/colors';
import { useTheme } from '@/context/theme-context';
import { useI18n } from '@/i18n';

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
      label,
    },
    ref
  ) => {
    const { isDark } = useTheme();
    const { t } = useI18n();
    const palette = getThemeColors(isDark ? 'dark' : 'light');
    const inputRef = useRef<TextInput>(null);
    const labelText = label ?? t('common.amount');

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
    const signColor = type === 'expense' ? palette.red : palette.green;

    useImperativeHandle(ref, () => ({
      focus: () => inputRef.current?.focus(),
      blur: () => inputRef.current?.blur(),
      getValue: () => numericValue,
      clear: () => onChangeText('', 0),
    }));

    return (
      <View
        className={`rounded-2xl p-4 shadow-sm ${className || ''}`}
        style={{ backgroundColor: palette.card }}
      >
        <Text className="text-lg mb-3 font-semibold" style={{ color: palette.textMuted }}>
          {labelText}
        </Text>
        <View style={styles.amountRow}>
          <View style={styles.prefix}>
            <Text style={[styles.sign, { color: signColor }]}>
              {type === 'expense' ? '-' : '+'}
            </Text>
            <Text style={[styles.symbol, { color: palette.textDark }]}>{currencySymbol}</Text>
          </View>
          <View style={styles.inputContainer}>
            <TextInput
              ref={inputRef}
              style={[styles.input, { color: palette.textDark }]}
              keyboardType="number-pad"
              placeholder="0"
              placeholderTextColor={palette.textMuted}
              value={displayValue}
              onChangeText={handleChangeText}
              editable={!disabled}
              selectionColor={palette.primary}
            />
            {numericValue > 0 && (
              <TouchableOpacity
                style={[styles.clearButton, { backgroundColor: palette.divider }]}
                onPress={() => onChangeText('', 0)}
                activeOpacity={0.7}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Iconify icon="ph:x-bold" size={16} color={palette.textMuted} />
              </TouchableOpacity>
            )}
          </View>
        </View>
        {error ? (
          <Text style={[styles.error, { color: palette.red }]}>{error}</Text>
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
  },
  inputContainer: {
    flex: 1,
    position: 'relative',
  },
  input: {
    fontSize: 40,
    fontWeight: '700',
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
  },
  error: {
    fontSize: 18,
    marginTop: 8,
  },
});

export default AmountInput;