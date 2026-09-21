import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Iconify } from 'react-native-iconify';
import { COLORS } from '@/constants/colors';

interface Props {
  icon: string;
  title: string;
  subtitle: string;
  onPress: () => void;
}

export default function UploadOptionCard({ icon, title, subtitle, onPress }: Props) {
  return (
    <TouchableOpacity style={styles.card} activeOpacity={0.7} onPress={onPress}>
      <View style={styles.iconWrap}>
        <Iconify icon={icon} size={22} color={COLORS.primary} />
      </View>
      <View style={styles.textWrap}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}>{subtitle}</Text>
      </View>
      <Iconify icon="ph:caret-right-bold" size={16} color={COLORS.textMuted} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#1A2E5A',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    elevation: 2,
  },
  iconWrap: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EEF2F7',
  },
  textWrap: { flex: 1 },
  title: { fontSize: 17, fontWeight: '700', color: '#0F172A' },
  subtitle: { fontSize: 17, color: '#64748B', marginTop: 3 },
});
