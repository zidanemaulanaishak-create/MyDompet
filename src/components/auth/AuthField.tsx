import React, { useState } from 'react';
import { Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Iconify } from 'react-native-iconify';
import { COLORS } from '@/constants/colors';

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
  placeholder = 'Type here...',
  icon,
  secure,
  error,
  keyboardType = 'default',
  autoCapitalize = 'none',
}: AuthFieldProps) {
  const [focused, setFocused] = useState(false);
  const [hidden, setHidden] = useState(true);

  return (
    <View className="mb-4">
      <Text className="ml-1 mb-2 text-lg font-semibold text-[#6B7280]">{label}</Text>
      <View
        className="flex-row items-center bg-[#F8F9FA]"
        style={{
          borderWidth: 1.5,
          borderColor: focused ? COLORS.sky : '#E2E8F0',
          borderRadius: 12,
          padding: 12,
          shadowColor: COLORS.sky,
          shadowOpacity: focused ? 0.25 : 0,
          shadowRadius: focused ? 6 : 0,
          shadowOffset: { width: 0, height: 0 },
        }}
      >
        {icon ? (
          <View className="mr-3">
            <Iconify icon={icon} size={18} color={focused ? COLORS.sky : '#94A3B8'} />
          </View>
        ) : null}
        <TextInput
          className="flex-1 text-lg text-[#172031]"
          style={{
            borderWidth: 0,
            outlineColor: 'transparent',
            outlineWidth: 0,
            backgroundColor: 'transparent',
            paddingVertical: 10,
          }}
          placeholder={placeholder}
          placeholderTextColor="#94A3B8"
          value={value}
          onChangeText={onChangeText}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          secureTextEntry={secure && hidden}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          autoCorrect={false}
          underlineColorAndroid="transparent"
          selectionColor={COLORS.sky}
        />
        {secure ? (
          <TouchableOpacity hitSlop={12} activeOpacity={0.7} onPress={() => setHidden((v) => !v)}>
            <Iconify icon={hidden ? 'ph:eye-slash' : 'ph:eye'} size={19} color="#94A3B8" />
          </TouchableOpacity>
        ) : null}
      </View>
      {error ? <Text className="ml-1 mt-1.5 text-lg text-[#EF4444]">{error}</Text> : null}
    </View>
  );
}