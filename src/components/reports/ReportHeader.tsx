import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { Iconify } from 'react-native-iconify';
import { COLORS, getThemeColors } from '@/constants/colors';
import { useTheme } from '@/context/theme-context';
import { useI18n } from '@/i18n';

interface Props {
  title: string;
  onBack: () => void;
}

export default function ReportHeader({ title, onBack }: Props) {
  const { isDark } = useTheme();
  const palette = getThemeColors(isDark ? 'dark' : 'light');
  const { t } = useI18n();

  return (
    <View style={[styles.header, { backgroundColor: palette.bg }]}>
      <TouchableOpacity
        style={[styles.backButton, { backgroundColor: palette.card }]}
        onPress={onBack}
        activeOpacity={0.7}
        accessibilityLabel={t('common.back')}
      >
        <Iconify icon="ph:arrow-left-bold" size={20} color={palette.textDark} />
      </TouchableOpacity>
      <Text style={[styles.title, { color: palette.textDark }]} numberOfLines={1}>
        {title}
      </Text>
      <TouchableOpacity
        style={[styles.backButton, { backgroundColor: palette.card }]}
        onPress={() => Alert.alert(t('reports.download'), t('reports.downloadSoon'))}
        activeOpacity={0.7}
        accessibilityLabel={t('reports.downloadReport')}
      >
        <Iconify icon="ph:download-simple-bold" size={20} color={COLORS.primary} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12 },
  backButton: {
    width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center',
    shadowColor: '#1A2E5A', shadowOpacity: 0.08, shadowOffset: { width: 0, height: 2 }, shadowRadius: 8, elevation: 2,
  },
  title: { flex: 1, textAlign: 'center', fontSize: 17, fontWeight: '700' },
});
