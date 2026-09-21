import React, { useCallback } from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { getThemeColors } from '@/constants/colors';
import { useTheme } from '@/context/theme-context';
import WeeklyRecapScreen from '@/components/reports/WeeklyRecapScreen';

export default function WeeklyRoute() {
  const router = useRouter();
  const { isDark } = useTheme();
  const palette = getThemeColors(isDark ? 'dark' : 'light');

  const handleBack = useCallback(() => {
    if (router.canGoBack()) router.back();
    else router.replace('/reports');
  }, [router]);

  const handleAI = useCallback(() => router.push('/ai-assistant' as never), [router]);

  return (
    <ScrollView style={[styles.root, { backgroundColor: palette.bg }]} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <WeeklyRecapScreen onBack={handleBack} onOpenAI={handleAI} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  content: { paddingBottom: 24 },
});
