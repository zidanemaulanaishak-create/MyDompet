import React from 'react';
import { ActivityIndicator, TouchableOpacity, View } from 'react-native';
import { Iconify } from 'react-native-iconify';
import type { SocialProvider } from '@/services/socialAuth';

const SOCIALS: { key: SocialProvider; icon: string }[] = [
  { key: 'apple', icon: 'logos:apple' },
  { key: 'google', icon: 'devicon:google' },
  { key: 'facebook', icon: 'logos:facebook' },
];

interface SocialButtonsProps {
  onPress: (provider: SocialProvider) => void;
  loadingProvider?: SocialProvider | null;
  disabled?: boolean;
}

export default function SocialButtons({
  onPress,
  loadingProvider = null,
  disabled = false,
}: SocialButtonsProps) {
  return (
    <View className="flex-row gap-3">
      {SOCIALS.map((s) => {
        const loading = loadingProvider === s.key;
        return (
          <TouchableOpacity
            key={s.key}
            activeOpacity={0.8}
            disabled={disabled || loadingProvider !== null}
            onPress={() => onPress(s.key)}
            className="flex-1 h-12 rounded-2xl bg-[#F8F9FA] items-center justify-center"
            style={{ borderWidth: 1, borderColor: '#ECEEF2' }}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#1A42BA" />
            ) : (
              <View>
                <Iconify icon={s.icon} size={22} />
              </View>
            )}
          </TouchableOpacity>
        );
      })}
    </View>
  );
}