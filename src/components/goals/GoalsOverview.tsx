import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, getThemeColors } from '@/constants/colors';
import { useTheme } from '@/context/theme-context';
import { formatRupiah } from '@/utils/goals';
import { useI18n } from '@/i18n';

interface Props {
  totalSaved: number;
  totalTarget: number;
  percent: number;
  active: number;
  done: number;
}

export default function GoalsOverview({ totalSaved, totalTarget, percent, active, done }: Props) {
  const { t } = useI18n();
  const { isDark } = useTheme();
  const palette = getThemeColors(isDark ? 'dark' : 'light');
  return (
    <View style={styles.wrap}>
      <LinearGradient
        colors={isDark ? ['#151E2E', '#16233D'] : ['#FFFFFF', '#EFF4FF']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.card, { borderColor: palette.border }]}
      >
        <Text style={[styles.label, { color: palette.textMuted }]}>{t('goals.totalSaved')}</Text>
        <Text style={[styles.nominal, { color: palette.textDark }]}>
          {formatRupiah(totalSaved)} <Text style={[styles.nominalDim, { color: palette.textMuted }]}>/ {formatRupiah(totalTarget)}</Text>
        </Text>
        <View style={[styles.track, { backgroundColor: palette.track }]}>
          <View style={[styles.fill, { width: `${Math.min(100, percent)}%` }]} />
        </View>
        <Text style={[styles.percent, { color: palette.primary }]}>{t('goals.reached', { percent })}</Text>
        <View style={[styles.divider, { backgroundColor: palette.border }]} />
        <View style={styles.stats}>
          <View style={styles.stat}>
            <Text style={[styles.statValue, { color: palette.textDark }]}>{active}</Text>
            <Text style={[styles.statLabel, { color: palette.textMuted }]}>{t('goals.activeTargets')}</Text>
          </View>
          <View style={[styles.statDivider, { backgroundColor: palette.border }]} />
          <View style={styles.stat}>
            <Text style={[styles.statValue, { color: palette.textDark }]}>{done}</Text>
            <Text style={[styles.statLabel, { color: palette.textMuted }]}>{t('goals.doneTargets')}</Text>
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
  },
  label: { fontSize: 14, fontWeight: '600' },
  nominal: { fontSize: 22, fontWeight: '800', marginTop: 4 },
  nominalDim: { fontSize: 15, fontWeight: '600' },
  track: { height: 10, borderRadius: 5, overflow: 'hidden', marginTop: 14 },
  fill: { height: 10, borderRadius: 5, backgroundColor: COLORS.primary },
  percent: { fontSize: 14, fontWeight: '700', marginTop: 8 },
  divider: { height: 1, marginVertical: 14 },
  stats: { flexDirection: 'row' },
  stat: { flex: 1, alignItems: 'center', gap: 2 },
  statDivider: { width: 1 },
  statValue: { fontSize: 20, fontWeight: '800' },
  statLabel: { fontSize: 13, fontWeight: '600' },
});
