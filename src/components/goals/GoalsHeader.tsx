import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Iconify } from 'react-native-iconify';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS } from '@/constants/colors';
import { useI18n } from '@/i18n';

interface Props {
  onBack: () => void;
}

export default function GoalsHeader({ onBack }: Props) {
  const insets = useSafeAreaInsets();
  const { t } = useI18n();
  return (
    <View style={[styles.header, { paddingTop: insets.top + 14 }]}>
      {/* Glow decorative circles */}
      <View style={styles.glowTop} />
      <View style={styles.glowBottom} />

      <View style={styles.bar}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={onBack}
          activeOpacity={0.7}
          accessibilityLabel={t('common.back')}
        >
          <Iconify icon="ph:caret-left-bold" size={22} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.title}>{t('goals.title')}</Text>
        <View style={styles.spacer} />
      </View>

      <Text style={styles.subtitle}>
        {t('goals.subtitle')}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 20,
    paddingBottom: 72,
    position: 'relative',
    overflow: 'hidden',
  },
  glowTop: {
    position: 'absolute',
    top: -40,
    right: -30,
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: 'rgba(56, 189, 248, 0.2)',
  },
  glowBottom: {
    position: 'absolute',
    bottom: -50,
    left: -40,
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.16)',
  },
  title: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  spacer: {
    width: 42,
    height: 42,
  },
  subtitle: {
    color: '#CBD3FF',
    fontSize: 13,
    marginTop: 12,
    lineHeight: 18,
  },
});
