import React from 'react';
import { Text, View } from 'react-native';

export default function OrDivider({ text }: { text: string }) {
  return (
    <View className="flex-row items-center my-6">
      <View className="flex-1 h-px bg-[#E8EAF0]" />
      <Text className="mx-4 text-lg font-medium text-[#8A8D9F]">{text}</Text>
      <View className="flex-1 h-px bg-[#E8EAF0]" />
    </View>
  );
}