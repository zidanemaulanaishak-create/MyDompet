import React, { useState } from 'react';
import { Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Iconify } from 'react-native-iconify';
import { getThemeColors } from '@/constants/colors';
import { useTheme } from '@/context/theme-context';
import { useI18n } from '@/i18n';

interface AuthFieldProps {
  label: string;
  value: string;
  onChangeText: (v: string) => void;
  placeholder?: string;
  icon?: string;
  secure?: boolean;
  error?: string;
  keyboardType?: 'default' | 'email-address';
  autoCapitalize?: 'none' | 'words';
}

export default function AuthField({
  label,
  value,
  onChangeText,
  placeholder,
  icon,
  secure,
  error,
  keyboardType = 'default',
  autoCapitalize = 'none',
}: AuthFieldProps) {
  const [focused, setFocused] = useState(false);
  const [hidden, setHidden] = useState(true);
  const { isDark } = useTheme();
  const { t } = useI18n();
  const palette = getThemeColors(isDark ? 'dark' : 'light');

  return (
    <View className="mb-4">
      <Text className="ml-1 mb-2 text-lg font-semibold" style={{ color: palette.textMuted }}>{label}</Text>
      <View
        className="flex-row items-center"
        style={{
          backgroundColor: palette.inputBg,
          borderWidth: 1.5,
          borderColor: focused ? palette.sky : palette.border,
          borderRadius: 12,
          padding: 12,
          shadowColor: palette.sky,
          shadowOpacity: focused ? 0.25 : 0,
          shadowRadius: focused ? 6 : 0,
          shadowOffset: { width: 0, height: 0 },
        }}
      >
        {icon ? (
          <View className="mr-3">
            <Iconify icon={icon} size={18} color={focused ? palette.sky : palette.textMuted} />
          </View>
        ) : null}
        <TextInput
          className="flex-1 text-lg"
          style={{
            color: palette.textDark,
            borderWidth: 0,
            outlineColor: 'transparent',
            outlineWidth: 0,
            backgroundColor: 'transparent',
            paddingVertical: 10,
          }}
          placeholder={placeholder ?? t('auth.typeHere')}
          placeholderTextColor={palette.textMuted}
          value={value}
          onChangeText={onChangeText}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          secureTextEntry={secure && hidden}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          autoCorrect={false}
          underlineColorAndroid="transparent"
          selectionColor={palette.sky}
        />
        {secure ? (
          <TouchableOpacity hitSlop={12} activeOpacity={0.7} onPress={() => setHidden((v) => !v)}>
            <Iconify icon={hidden ? 'ph:eye-slash' : 'ph:eye'} size={19} color={palette.textMuted} />
          </TouchableOpacity>
        ) : null}
      </View>
      {error ? <Text className="ml-1 mt-1.5 text-lg" style={{ color: palette.red }}>{error}</Text> : null}
    </View>
  );
}