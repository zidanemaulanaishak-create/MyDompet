import React, { useRef, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Iconify } from 'react-native-iconify';
import PrimaryButton from '@/components/auth/PrimaryButton';
import { COLORS } from '@/constants/colors';
import { useAuth } from '@/context/auth-context';
import { getPendingAuth, setPendingAuth } from '@/context/auth-flow';

const CODE_LENGTH = 4;

export default function VerifyCodeScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  

  const pending = getPendingAuth();
  const [code, setCode] = useState(() => Array(CODE_LENGTH).fill('0'));
  const [focusedIndex, setFocusedIndex] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputsRef = useRef<(TextInput | null)[]>([]);

  const email = pending?.email ?? 'example@gmail.com';
  const codeFilled = code.every((d) => d !== '');

  const focusNext = (index: number) => {
    if (index + 1 < CODE_LENGTH) inputsRef.current[index + 1]?.focus();
  };

  const focusPrev = (index: number) => {
    if (index - 1 >= 0) inputsRef.current[index - 1]?.focus();
  };

  const handleChange = (index: number, text: string) => {
    const digit = text.replace(/[^0-9]/g, '').slice(-1);
    setCode((prev) => {
      const next = [...prev];
      next[index] = digit;
      return next;
    });
    setError(null);
    if (digit) focusNext(index);
  };

  const handleKey = (index: number, key: string) => {
    if (key === 'Backspace' && !code[index]) focusPrev(index);
  };

  const goBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/welcome');
    }
  };

  const handleVerify = async () => {
    if (!codeFilled) {
      setError('Masukkan kode verifikasi 4 digit.');
      return;
    }

    setError(null);
    setLoading(true);
    try {
      const email = pending?.email ?? 'demo@mydompet.id';
      
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-white"
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View className="flex-1 px-6" style={{ paddingTop: insets.top + 10, paddingBottom: 32 }}>
        <View className="flex-row">
          <TouchableOpacity
            onPress={goBack}
            activeOpacity={0.85}
            hitSlop={10}
            className="w-11 h-11 rounded-full bg-[#F1F2F4] items-center justify-center"
          >
            <Iconify icon="ph:arrow-left" size={22} color="#172031" />
          </TouchableOpacity>
        </View>

        <View className="mt-4">
          <Text className="text-center text-[#172031] text-[26px] font-extrabold tracking-tight">
            Verify Code
          </Text>
          <Text className="px-4 mt-2 text-center text-[#8A8D9F] text-lg leading-5">
            Enter the verification code we sent to {email}
          </Text>
        </View>

        <View className="flex-row items-center justify-center gap-3 mt-9">
          {code.map((digit, i) => (
            <TextInput
              key={i}
              ref={(ref) => {
                inputsRef.current[i] = ref;
              }}
              className="w-16 h-16 rounded-2xl bg-[#F8F9FA] text-center text-[#172031] text-[24px] font-bold"
              style={{ borderWidth: 1, borderColor: focusedIndex === i ? COLORS.sky : '#E7E9EF' }}
              maxLength={1}
              keyboardType="number-pad"
              value={digit}
              onChangeText={(t) => handleChange(i, t)}
              onKeyPress={(e) => handleKey(i, e.nativeEvent.key)}
              onFocus={() => setFocusedIndex(i)}
              onBlur={() => setFocusedIndex(null)}
              autoFocus={i === 0}
              selectTextOnFocus
            />
          ))}
        </View>

        <View className="flex-row justify-center items-center mt-7">
          <Text className="text-[#8A8D9F] text-lg">Didn&apos;t receive OTP? </Text>
          <TouchableOpacity activeOpacity={0.7}>
            <Text className="text-orange text-lg font-bold">Resend code</Text>
          </TouchableOpacity>
        </View>

        {error ? <Text className="mt-5 text-center text-lg text-[#EF4444]">{error}</Text> : null}

        <View className="flex-1 justify-end mt-8">
          <PrimaryButton label="Verify" onPress={handleVerify} loading={loading} />
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}