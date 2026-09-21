import React, { useEffect, useRef } from 'react';
import { ActivityIndicator, Alert, StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { supabase } from '@/lib/supabase';

function errorMessage(message: string): string {
  if (/not enabled|provider disabled/i.test(message)) {
    return 'Login sosial belum diaktifkan di pengaturan Supabase.';
  }
  if (/verifier missing|code verifier not found/i.test(message)) {
    return 'Sesi login kedaluwarsa. Silakan coba lagi.';
  }
  return message.slice(0, 160);
}

export default function AuthCallbackScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    code?: string;
    error?: string;
    error_description?: string;
  }>();
  const handledRef = useRef(false);

  useEffect(() => {
    if (handledRef.current) return;
    handledRef.current = true;

    (async () => {
      if (params.error || params.error_description) {
        Alert.alert(
          'Login Gagal',
          String(params.error_description ?? params.error).slice(0, 160)
        );
        router.replace('/login');
        return;
      }

      if (!params.code) {
        router.replace('/login');
        return;
      }

      const { error } = await supabase.auth.exchangeCodeForSession(params.code);
      const { data: sessionData } = await supabase.auth.getSession();
      if (sessionData.session) return; // sudah login; guard di _layout yang mengarahkan
      if (error) {
        Alert.alert('Login Gagal', errorMessage(error.message));
      }
      router.replace('/login');
    })();
  }, [router, params.code, params.error, params.error_description]);

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#1A42BA" />
      <Text style={styles.text}>Menghubungkan akun...</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    gap: 12,
  },
  text: {
    color: '#64748B',
    fontSize: 16,
    fontWeight: '600',
  },
});