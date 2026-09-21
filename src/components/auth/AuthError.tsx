import React from 'react';
import { View, Text } from 'react-native';
import { Iconify } from 'react-native-iconify';

interface AuthErrorProps {
  message: string;
}

export default function AuthError({ message }: AuthErrorProps) {
  return (
    <View className="flex-row items-start gap-2.5 mt-4 rounded-xl bg-[rgba(239,68,68,0.14)] border border-[rgba(239,68,68,0.4)] px-4 py-3">
      <Iconify
        icon="ph:warning-circle-bold"
        size={20}
        color="#F87171"
        style={{ marginTop: 1 }}
      />
      <Text className="text-[#FCA5A5] text-lg leading-5 flex-1">{message}</Text>
    </View>
  );
}