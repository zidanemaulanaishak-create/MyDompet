import * as Linking from 'expo-linking';
import * as WebBrowser from 'expo-web-browser';
import { supabase } from '@/lib/supabase';

export type SocialProvider = 'google' | 'facebook' | 'apple';

const PROVIDER_LABEL: Record<SocialProvider, string> = {
  google: 'Google',
  facebook: 'Facebook',
  apple: 'Apple',
};

function friendlyError(message: string, provider: SocialProvider): string {
  if (/not enabled|provider disabled/i.test(message)) {
    return `Login ${PROVIDER_LABEL[provider]} belum diaktifkan di pengaturan Supabase.`;
  }
  if (/verifier missing|code verifier not found/i.test(message)) {
    return 'Sesi login kedaluwarsa. Silakan coba lagi.';
  }
  return message.slice(0, 160);
}

export async function signInWithProvider(provider: SocialProvider): Promise<string | null> {
  try {
    const redirectTo = Linking.createURL('auth-callback');

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo, skipBrowserRedirect: true },
    });

    if (error) return friendlyError(error.message, provider);
    if (!data?.url) return 'Gagal memulai login sosial.';

    const result = await WebBrowser.openAuthSessionAsync(data.url, redirectTo);

    if (result.type !== 'success' || !result.url) {
      const { data: sessionData } = await supabase.auth.getSession();
      if (sessionData.session) return null; // login selesai via deep-link / route callback
      if (result.type === 'cancel' || result.type === 'dismiss' || result.type === 'locked') {
        return 'Login sosial dibatalkan.';
      }
      return 'Login gagal: tidak ada respons dari penyedia.';
    }

    const callbackUrl = result.url;
    const parsed = Linking.parse(callbackUrl);
    const errorParam = singleValue(parsed.queryParams?.error);
    const errorDescription = singleValue(parsed.queryParams?.error_description);
    const errorMessage = errorParam || errorDescription;
    if (errorMessage) {
      return `Login gagal: ${String(errorMessage).slice(0, 120)}`;
    }
    const code = singleValue(parsed.queryParams?.code);
    if (!code) return 'Login gagal: kode otorisasi tidak ditemukan.';

    const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(
      code,
      data.flowId ? { flowId: data.flowId } : undefined
    );
    if (exchangeError) return friendlyError(exchangeError.message, provider);
    return null;
  } catch {
    return 'Terjadi kesalahan saat login sosial.';
  }
}

function singleValue(value: string | string[] | undefined): string | undefined {
  if (Array.isArray(value)) return value[0];
  return value;
}