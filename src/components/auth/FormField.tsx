import React, { useState } from 'react';
import { Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Iconify } from 'react-native-iconify';

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
  placeholder = 'Type here...',
  secure,
  error,
  keyboardType = 'default',
  autoCapitalize = 'none',
}: FormFieldProps) {
  const [focused, setFocused] = useState(false);
  const [hidden, setHidden] = useState(true);

  return (
    <View className="mt-5">
      <Text className="text-[#8FA6CE] text-lg font-semibold">{label}</Text>
      <View
        className={`mt-2 flex-row items-center rounded-xl px-4 ${
          focused ? 'border border-[#3B82F6]' : 'border border-transparent'
        }`}
        style={{ backgroundColor: 'rgba(255,255,255,0.08)' }}
      >
        <TextInput
          className="flex-1 py-3.5 text-white text-lg"
          placeholder={placeholder}
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