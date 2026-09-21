import React, { useState, useRef, useImperativeHandle, forwardRef } from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import { COLORS } from '@/constants/colors';

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
      placeholder = 'Misal: Makan siang di warteg',
      maxLength = 200,
      error,
      className,
      label = 'Catatan',
      autoFocus = false,
    },
    ref
  ) => {
    const inputRef = useRef<TextInput>(null);
    const [isFocused, setIsFocused] = useState(false);

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
      <View className={`bg-card rounded-2xl ${className || ''}`} style={styles.container}>
        <View style={styles.header}>
          <Text className="text-lg text-textMuted">{label}</Text>
          <Text
            style={[
              styles.charCount,
              value.length > maxLength * 0.9 && styles.charCountWarning,
            ]}
          >
            {value.length}/{maxLength}
          </Text>
        </View>
        <TextInput
          ref={inputRef}
          style={[
            styles.input,
            isFocused && styles.inputFocused,
            error && styles.inputError,
          ]}
          multiline
          numberOfLines={4}
          placeholder={placeholder}
          placeholderTextColor={COLORS.textMuted}
          value={value}
          onChangeText={handleChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          autoFocus={autoFocus}
          textAlignVertical="top"
          selectionColor={COLORS.primary}
        />
        {error && <Text style={styles.errorText}>{error}</Text>}
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
    color: COLORS.textMuted,
  },
  charCountWarning: {
    color: COLORS.orange,
  },
  input: {
    fontSize: 17,
    color: COLORS.textDark,
    lineHeight: 22,
    minHeight: 100,
  },
  inputFocused: {
    borderWidth: 1.5,
    borderColor: COLORS.primary,
  },
  inputError: {
    borderWidth: 1.5,
    borderColor: COLORS.red,
  },
  errorText: {
    fontSize: 18,
    color: COLORS.red,
    marginTop: 6,
  },
});

export default NoteInput;