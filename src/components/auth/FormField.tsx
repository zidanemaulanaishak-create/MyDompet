import React, { useState } from 'react';
import { Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Iconify } from 'react-native-iconify';
import { getThemeColors } from '@/constants/colors';
import { useTheme } from '@/context/theme-context';
import { useI18n } from '@/i18n';

interface FormFieldProps {
  label: string;
  value: string;
  onChangeText: (v: string) => void;
  placeholder?: string;
  secure?: boolean;
  error?: string;
  keyboardType?: 'default' | 'email-address';
  autoCapitalize?: 'none' | 'words';
}

export default function FormField({
  label,
  value,
  onChangeText,
  placeholder,
  secure,
  error,
  keyboardType = 'default',
  autoCapitalize = 'none',
}: FormFieldProps) {
  const [focused, setFocused] = useState(false);
  const [hidden, setHidden] = useState(true);
  const { isDark } = useTheme();
  const { t } = useI18n();
  const palette = getThemeColors(isDark ? 'dark' : 'light');

  return (
    <View className="mt-5">
      <Text className="text-[#8FA6CE] text-lg font-semibold">{label}</Text>
      <View
        className="mt-2 flex-row items-center rounded-xl px-4"
        style={{
          backgroundColor: 'rgba(255,255,255,0.08)',
          borderWidth: 1,
          borderColor: focused ? palette.primary : 'transparent',
        }}
      >
        <TextInput
          className="flex-1 py-3.5 text-white text-lg"
          placeholder={placeholder ?? t('auth.typeHere')}
          placeholderTextColor="#64748B"
          value={value}
          onChangeText={onChangeText}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          secureTextEntry={secure && hidden}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          autoCorrect={false}
        />
        {secure ? (
          <TouchableOpacity hitSlop={12} onPress={() => setHidden((v) => !v)}>
            <Iconify icon={hidden ? 'ph:eye' : 'ph:eye-slash'} size={18} color="#64748B" />
          </TouchableOpacity>
        ) : null}
      </View>
      {error ? <Text className="text-[#F87171] text-lg mt-1.5 ml-1">{error}</Text> : null}
    </View>
  );
}