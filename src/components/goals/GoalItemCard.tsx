import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { Iconify } from 'react-native-iconify';
import { COLORS } from '@/constants/colors';
import { FinancialGoal } from '@/data/goalsData';
import { formatCompact, formatRupiah, goalPercent, isGoalDone, monthlySuggestion } from '@/utils/goals';

interface Props {
  goal: FinancialGoal;
  onPress?: (g: FinancialGoal) => void;
  onDeposit?: (g: FinancialGoal) => void;
}

export default function GoalItemCard({ goal, onPress, onDeposit }: Props) {
  const done = isGoalDone(goal);
  const pct = goalPercent(goal);
  const barColor = done || pct >= 80 ? COLORS.green : COLORS.primary;

  return (
    <TouchableOpacity style={styles.card} activeOpacity={0.85} onPress={() => onPress?.(goal)}>
      <View style={styles.head}>
        {goal.imageUri ? (
          <Image source={{ uri: goal.imageUri }} style={styles.goalImage} />
        ) : (
          <View style={[styles.iconWrap, { backgroundColor: goal.iconBg }]}>
            <Iconify icon={goal.icon || 'ph:piggy-bank-bold'} size={24} color={goal.iconColor} />
          </View>
        )}
        <View style={styles.headText}>
          <Text style={styles.name} numberOfLines={1}>{goal.name}</Text>
          <View style={styles.deadlineBadge}>
            <Iconify icon="ph:calendar-bold" size={13} color={COLORS.textMuted} />
            <Text style={styles.deadlineText}>Target: {goal.deadline}</Text>
          </View>
        </View>
        <View style={[styles.pctBadge, { backgroundColor: done ? '#E6F7EE' : COLORS.chipBlue }]}>
          <Text style={[styles.pctText, { color: done ? '#0E9F6E' : COLORS.primary }]}>{pct}%</Text>
        </View>
      </View>

      {done ? (
        <View style={styles.doneBanner}>
          <Iconify icon="ph:check-circle-fill" size={16} color="#0E9F6E" />
          <Text style={styles.doneText}>Target tercapai! Kerja bagus.</Text>
        </View>
      ) : null}

      <View style={styles.track}>
        <View style={[styles.fill, { width: `${Math.min(100, pct)}%`, backgroundColor: barColor }]} />
      </View>

      <View style={styles.amounts}>
        <Text style={styles.saved}>{formatRupiah(goal.saved)}</Text>
        <Text style={styles.target}>{formatCompact(goal.target)}</Text>
      </View>
      <Text style={styles.amountCaption}>
        <Text>Terkumpul</Text> · <Text>Total Target</Text>
      </Text>

      <View style={styles.footer}>
        <Text style={styles.suggest} numberOfLines={1}>
          {done ? 'Tidak perlu nabung lagi.' : `Saran: ${formatCompact(monthlySuggestion(goal))}/bln`}
        </Text>
        {!done ? (
          <TouchableOpacity
            style={styles.depositBtn}
            activeOpacity={0.8}
            onPress={() => onDeposit?.(goal)}
          >
            <Iconify icon="ph:plus-bold" size={14} color={COLORS.primary} />
            <Text style={styles.depositLabel}>Nabung</Text>
          </TouchableOpacity>
        ) : null}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#0A1128',
    shadowOpacity: 0.06,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  head: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  iconWrap: { width: 50, height: 50, borderRadius: 25, alignItems: 'center', justifyContent: 'center' },
  goalImage: { width: 50, height: 50, borderRadius: 25, backgroundColor: '#E2E8F0' },
  headText: { flex: 1 },
  name: { fontSize: 16, fontWeight: '700', color: COLORS.textDark },
  deadlineBadge: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 4 },
  deadlineText: { fontSize: 12, fontWeight: '600', color: COLORS.textMuted },
  pctBadge: { borderRadius: 12, paddingHorizontal: 10, paddingVertical: 5 },
  pctText: { fontSize: 13, fontWeight: '800' },
  doneBanner: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: '#E6F7EE', borderRadius: 10, paddingHorizontal: 10, paddingVertical: 8, marginTop: 12,
  },
  doneText: { fontSize: 13, fontWeight: '700', color: '#0E9F6E' },
  track: { height: 8, borderRadius: 4, backgroundColor: '#EDF2F7', overflow: 'hidden', marginTop: 14 },
  fill: { height: 8, borderRadius: 4 },
  amounts: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between', marginTop: 10 },
  saved: { fontSize: 16, fontWeight: '800', color: COLORS.textDark },
  target: { fontSize: 14, fontWeight: '700', color: COLORS.textMuted },
  amountCaption: { fontSize: 12, color: COLORS.textMuted, marginTop: 2 },
  footer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10, marginTop: 14, paddingTop: 12, borderTopWidth: 1, borderTopColor: '#F1F5F9' },
  suggest: { flex: 1, fontSize: 12, fontWeight: '600', color: COLORS.textMuted },
  depositBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: COLORS.chipBlue,
    borderRadius: 10, paddingHorizontal: 12, paddingVertical: 7,
  },
  depositLabel: { fontSize: 13, fontWeight: '700', color: COLORS.primary },
});
