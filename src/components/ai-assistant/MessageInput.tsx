import React, { useState, useCallback } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { Iconify } from 'react-native-iconify';
import { COLORS, getThemeColors } from '@/constants/colors';
import { useTheme } from '@/context/theme-context';

interface Props {
  value: string;
  onChangeText: (text: string) => void;
  onSend: () => void;
  onShortcutPress?: (label: string) => void;
  disabled?: boolean;
  placeholder?: string;
}

const SHORTCUTS: { id: string; label: string; icon: string }[] = [
  { id: 's1', label: 'Catat transaksi', icon: 'ph:pencil-line-bold' },
  { id: 's2', label: 'Cek riwayat', icon: 'ph:file-text-bold' },
  { id: 's3', label: 'Bandingkan keuangan', icon: 'ph:trend-up-bold' },
  { id: 's4', label: 'Tips hemat', icon: 'ph:sparkle-bold' },
];

export default function MessageInput({
  value,
  onChangeText,
  onSend,
  onShortcutPress,
  disabled = false,
  placeholder = 'Ketik pesan...',
}: Props) {
  const { isDark } = useTheme();
  const palette = getThemeColors(isDark ? 'dark' : 'light');
  const [focused, setFocused] = useState(false);
  const hasText = value.trim().length > 0;

  const handleFocus = useCallback(() => setFocused(true), []);
  const handleBlur = useCallback(() => setFocused(false), []);

  return (
    <View style={[styles.footer, { backgroundColor: palette.bg }]}>
      {onShortcutPress ? (
        <View style={styles.shortcuts}>
          {SHORTCUTS.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={[
                styles.chip,
                { backgroundColor: palette.card, borderColor: isDark ? '#263550' : '#E2E8F0' },
              ]}
              activeOpacity={0.7}
              onPress={() => onShortcutPress(item.label)}
            >
              <Iconify icon={item.icon} size={13} color={palette.primary} />
              <Text style={[styles.chipLabel, { color: palette.textDark }]} numberOfLines={1}>
                {item.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      ) : null}

      <View style={styles.content}>
        <View
          style={[
            styles.inputWrap,
            {
              backgroundColor: palette.card,
              borderColor: focused ? COLORS.primary : isDark ? '#263550' : '#E2E8F0',
              shadowOpacity: focused ? 0.16 : 0.07,
            },
          ]}
        >
          <TextInput
            style={[styles.input, { color: palette.textDark }]}
            placeholderTextColor={palette.textMuted}
            value={value}
            onChangeText={onChangeText}
            placeholder={placeholder}
            multiline
            maxLength={2000}
            editable={!disabled}
            returnKeyType="send"
            onSubmitEditing={onSend}
            blurOnSubmit={false}
            onFocus={handleFocus}
            onBlur={handleBlur}
            accessibilityLabel="Pesan untuk MyDompet AI"
          />
          <TouchableOpacity
            style={[styles.sendButton, { backgroundColor: hasText ? COLORS.primary : isDark ? '#263550' : '#E2E8F0' }]}
            onPress={onSend}
            disabled={!hasText || disabled}
            activeOpacity={0.8}
            accessibilityLabel="Kirim pesan"
          >
            <Iconify
              icon="ph:paper-plane-right-fill"
              size={18}
              color={hasText ? '#FFFFFF' : palette.textMuted}
            />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  footer: { paddingHorizontal: 16, paddingTop: 8, paddingBottom: Platform.OS === 'ios' ? 30 : 14, borderTopWidth: 1, borderTopColor: 'rgba(0,0,0,0.04)' },
  shortcuts: { width: '100%', maxWidth: 760, alignSelf: 'center', flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 10 },
  chip: { flexDirection: 'row', alignItems: 'center', gap: 6, borderWidth: 1, borderRadius: 20, paddingHorizontal: 12, paddingVertical: 8 },
  chipLabel: { fontSize: 18, fontWeight: '700' },
  content: { width: '100%', maxWidth: 760, alignSelf: 'center' },
  inputWrap: { flexDirection: 'row', alignItems: 'flex-end', gap: 8, minHeight: 54, maxHeight: 130, borderWidth: 1.5, borderRadius: 27, paddingLeft: 18, paddingRight: 7, paddingVertical: 7, shadowColor: '#1A2E5A', shadowOffset: { width: 0, height: 4 }, shadowRadius: 14, elevation: 5 },
  input: { flex: 1, fontSize: 18, lineHeight: 21, paddingVertical: 8, textAlignVertical: 'center', ...(Platform.OS === 'web' ? ({ outlineStyle: 'none' } as object) : null) },
  sendButton: { width: 42, height: 42, borderRadius: 21, alignItems: 'center', justifyContent: 'center' },
});
