import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS } from '@/constants/colors';
import { formatRupiah } from '@/utils/goals';

interface Props {
  totalSaved: number;
  totalTarget: number;
  percent: number;
  active: number;
  done: number;
}

export default function GoalsOverview({ totalSaved, totalTarget, percent, active, done }: Props) {
  return (
    <View style={styles.wrap}>
      <LinearGradient
        colors={['#FFFFFF', '#EFF4FF']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.card}
      >
        <Text style={styles.label}>Total Terkumpul</Text>
        <Text style={styles.nominal}>
          {formatRupiah(totalSaved)} <Text style={styles.nominalDim}>/ {formatRupiah(totalTarget)}</Text>
        </Text>
        <View style={styles.track}>
          <View style={[styles.fill, { width: `${Math.min(100, percent)}%` }]} />
        </View>
        <Text style={styles.percent}>{percent}% Tercapai</Text>
        <View style={styles.divider} />
        <View style={styles.stats}>
          <View style={styles.stat}>
            <Text style={styles.statValue}>{active}</Text>
            <Text style={styles.statLabel}>Target Aktif</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.stat}>
            <Text style={styles.statValue}>{done}</Text>
            <Text style={styles.statLabel}>Target Selesai</Text>
          </View>
        </View>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginTop: -48, paddingHorizontal: 16 },
  card: {
    borderRadius: 20,
    padding: 18,
    shadowColor: '#0A1128',
    shadowOpacity: 0.15,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  label: { fontSize: 14, fontWeight: '600', color: COLORS.textMuted },
  nominal: { fontSize: 22, fontWeight: '800', color: COLORS.textDark, marginTop: 4 },
  nominalDim: { fontSize: 15, fontWeight: '600', color: COLORS.textMuted },
  track: { height: 10, borderRadius: 5, backgroundColor: '#E8EEF7', overflow: 'hidden', marginTop: 14 },
  fill: { height: 10, borderRadius: 5, backgroundColor: COLORS.primary },
  percent: { fontSize: 14, fontWeight: '700', color: COLORS.primary, marginTop: 8 },
  divider: { height: 1, backgroundColor: '#E2E8F0', marginVertical: 14 },
  stats: { flexDirection: 'row' },
  stat: { flex: 1, alignItems: 'center', gap: 2 },
  statDivider: { width: 1, backgroundColor: '#E2E8F0' },
  statValue: { fontSize: 20, fontWeight: '800', color: COLORS.textDark },
  statLabel: { fontSize: 13, fontWeight: '600', color: COLORS.textMuted },
});
