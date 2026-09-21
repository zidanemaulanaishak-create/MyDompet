import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';
import { COLORS } from '@/constants/colors';

interface Props {
  onCreate: () => void;
}

export default function GoalsEmptyState({ onCreate }: Props) {
  return (
    <View style={styles.wrap}>
      <Svg width={140} height={120} viewBox="0 0 140 120">
        <Circle cx={70} cy={62} r={44} fill="#E8F0FE" />
        <Circle cx={70} cy={62} r={32} fill="#FFFFFF" />
        <Path
          d="M70 46v16m0 6v.5"
          stroke={COLORS.primary}
          strokeWidth={5}
          strokeLinecap="round"
        />
        <Path
          d="M52 34l6-6m24 0l6 6"
          stroke="#FF961D"
          strokeWidth={5}
          strokeLinecap="round"
        />
        <Path
          d="M48 92c8-8 36-8 44 0"
          stroke={COLORS.primary}
          strokeWidth={5}
          strokeLinecap="round"
          fill="none"
        />
      </Svg>
      <Text style={styles.title}>Belum Ada Target Keuangan</Text>
      <Text style={styles.sub}>
        Mulai buat target impianmu dan pantau perkembangannya secara konsisten bersama MyDompet.
      </Text>
      <TouchableOpacity style={styles.cta} activeOpacity={0.85} onPress={onCreate}>
        <Text style={styles.ctaLabel}>+ Buat Target Pertama</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', paddingVertical: 36, paddingHorizontal: 24 },
  title: { fontSize: 18, fontWeight: '800', color: COLORS.textDark, marginTop: 18, textAlign: 'center' },
  sub: { fontSize: 14, color: COLORS.textMuted, textAlign: 'center', marginTop: 8, lineHeight: 21 },
  cta: {
    backgroundColor: COLORS.primary,
    borderRadius: 16,
    paddingVertical: 15,
    paddingHorizontal: 24,
    marginTop: 20,
    alignSelf: 'stretch',
    alignItems: 'center',
  },
  ctaLabel: { color: '#FFFFFF', fontSize: 15, fontWeight: '700' },
});
