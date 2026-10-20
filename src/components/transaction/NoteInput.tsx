import React, { useState, useRef, useImperativeHandle, forwardRef } from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import { getThemeColors } from '@/constants/colors';
import { useTheme } from '@/context/theme-context';
import { useI18n } from '@/i18n';

export interface NoteInputRef {
  focus: () => void;
  blur: () => void;
  getValue: () => string;
  clear: () => void;
}

interface Props {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  maxLength?: number;
  error?: string | null;
  className?: string;
  label?: string;
  autoFocus?: boolean;
}

const NoteInput = forwardRef<NoteInputRef, Props>(
  (
    {
      value,
      onChangeText,
      placeholder,
      maxLength = 200,
      error,
      className,
      label,
      autoFocus = false,
    },
    ref
  ) => {
    const { isDark } = useTheme();
    const { t } = useI18n();
    const palette = getThemeColors(isDark ? 'dark' : 'light');
    const inputRef = useRef<TextInput>(null);
    const [isFocused, setIsFocused] = useState(false);
    const labelText = label ?? t('common.note');
    const placeholderText = placeholder ?? t('addTx.notePlaceholderDefault');

    useImperativeHandle(ref, () => ({
      focus: () => inputRef.current?.focus(),
      blur: () => inputRef.current?.blur(),
      getValue: () => value,
      clear: () => onChangeText(''),
    }));

    const handleChange = (text: string) => {
      if (text.length <= maxLength) {
        onChangeText(text);
      }
    };

    return (
      <View
        className={`rounded-2xl ${className || ''}`}
        style={[styles.container, { backgroundColor: palette.card }]}
      >
        <View style={styles.header}>
          <Text className="text-lg" style={{ color: palette.textMuted }}>
            {labelText}
          </Text>
          <Text
            style={[
              styles.charCount,
              { color: palette.textMuted },
              value.length > maxLength * 0.9 && [styles.charCountWarning, { color: palette.orange }],
            ]}
          >
            {value.length}/{maxLength}
          </Text>
        </View>
        <TextInput
          ref={inputRef}
          style={[
            styles.input,
            { color: palette.textDark },
            isFocused && [styles.inputFocused, { borderColor: palette.primary }],
            error && [styles.inputError, { borderColor: palette.red }],
          ]}
          multiline
          numberOfLines={4}
          placeholder={placeholderText}
          placeholderTextColor={palette.textMuted}
          value={value}
          onChangeText={handleChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          autoFocus={autoFocus}
          textAlignVertical="top"
          selectionColor={palette.primary}
        />
        {error && <Text style={[styles.errorText, { color: palette.red }]}>{error}</Text>}
      </View>
    );
  }
);

NoteInput.displayName = 'NoteInput';

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  charCount: {
    fontSize: 18,
  },
  charCountWarning: {
    fontWeight: '600',
  },
  input: {
    fontSize: 17,
    lineHeight: 22,
    minHeight: 100,
  },
  inputFocused: {
    borderWidth: 1.5,
  },
  inputError: {
    borderWidth: 1.5,
  },
  errorText: {
    fontSize: 18,
    marginTop: 6,
  },
});

export default NoteInput;