import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { Iconify } from 'react-native-iconify';
import { COLORS, getThemeColors } from '@/constants/colors';
import { useTheme } from '@/context/theme-context';
import { FinancialGoal } from '@/data/goalsData';
import { formatCompact, formatRupiah, goalPercent, isGoalDone, monthlySuggestion } from '@/utils/goals';
import { useI18n } from '@/i18n';

interface Props {
  goal: FinancialGoal;
  onPress?: (g: FinancialGoal) => void;
  onDeposit?: (g: FinancialGoal) => void;
}

export default function GoalItemCard({ goal, onPress, onDeposit }: Props) {
  const { t } = useI18n();
  const { isDark } = useTheme();
  const palette = getThemeColors(isDark ? 'dark' : 'light');
  const done = isGoalDone(goal);
  const pct = goalPercent(goal);
  const barColor = done || pct >= 80 ? palette.green : palette.primary;

  return (
    <TouchableOpacity style={[styles.card, { backgroundColor: palette.card, borderColor: palette.border }]} activeOpacity={0.85} onPress={() => onPress?.(goal)}>
      <View style={styles.head}>
        {goal.imageUri ? (
          <Image source={{ uri: goal.imageUri }} style={[styles.goalImage, { backgroundColor: palette.border }]} />
        ) : (
          <View style={[styles.iconWrap, { backgroundColor: goal.iconBg }]}>
            <Iconify icon={goal.icon || 'ph:piggy-bank-bold'} size={24} color={goal.iconColor} />
          </View>
        )}
        <View style={styles.headText}>
          <Text style={[styles.name, { color: palette.textDark }]} numberOfLines={1}>{goal.name}</Text>
          <View style={styles.deadlineBadge}>
            <Iconify icon="ph:calendar-bold" size={13} color={palette.textMuted} />
            <Text style={[styles.deadlineText, { color: palette.textMuted }]}>{t('goals.deadlineLabel', { deadline: goal.deadline })}</Text>
          </View>
        </View>
        <View style={[styles.pctBadge, { backgroundColor: done ? (isDark ? 'rgba(16,185,129,0.18)' : '#E6F7EE') : palette.chipBlue }]}>
          <Text style={[styles.pctText, { color: done ? (isDark ? '#34D399' : '#0E9F6E') : palette.primary }]}>{pct}%</Text>
        </View>
      </View>

      {done ? (
        <View style={[styles.doneBanner, { backgroundColor: isDark ? 'rgba(16,185,129,0.18)' : '#E6F7EE' }]}>
          <Iconify icon="ph:check-circle-fill" size={16} color={isDark ? '#34D399' : '#0E9F6E'} />
          <Text style={[styles.doneText, { color: isDark ? '#34D399' : '#0E9F6E' }]}>{t('goals.doneBanner')}</Text>
        </View>
      ) : null}

      <View style={[styles.track, { backgroundColor: palette.track }]}>
        <View style={[styles.fill, { width: `${Math.min(100, pct)}%`, backgroundColor: barColor }]} />
      </View>

      <View style={styles.amounts}>
        <Text style={[styles.saved, { color: palette.textDark }]}>{formatRupiah(goal.saved)}</Text>
        <Text style={[styles.target, { color: palette.textMuted }]}>{formatCompact(goal.target)}</Text>
      </View>
      <Text style={[styles.amountCaption, { color: palette.textMuted }]}>
        {t('goals.saved')} · {t('goals.totalTarget')}
      </Text>

      <View style={[styles.footer, { borderTopColor: palette.divider }]}>
        <Text style={[styles.suggest, { color: palette.textMuted }]} numberOfLines={1}>
          {done
            ? t('goals.noSavingNeeded')
            : t('goals.suggestion', { amount: formatCompact(monthlySuggestion(goal)) })}
        </Text>
        {!done ? (
          <TouchableOpacity
            style={styles.depositBtn}
            activeOpacity={0.8}
            onPress={() => onDeposit?.(goal)}
          >
            <Iconify icon="ph:plus-bold" size={14} color={palette.primary} />
            <Text style={styles.depositLabel}>{t('goals.deposit')}</Text>
          </TouchableOpacity>
        ) : null}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    shadowColor: '#0A1128',
    shadowOpacity: 0.06,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  head: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  iconWrap: { width: 50, height: 50, borderRadius: 25, alignItems: 'center', justifyContent: 'center' },
  goalImage: { width: 50, height: 50, borderRadius: 25 },
  headText: { flex: 1 },
  name: { fontSize: 16, fontWeight: '700' },
  deadlineBadge: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 4 },
  deadlineText: { fontSize: 12, fontWeight: '600' },
  pctBadge: { borderRadius: 12, paddingHorizontal: 10, paddingVertical: 5 },
  pctText: { fontSize: 13, fontWeight: '800' },
  doneBanner: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    borderRadius: 10, paddingHorizontal: 10, paddingVertical: 8, marginTop: 12,
  },
  doneText: { fontSize: 13, fontWeight: '700' },
  track: { height: 8, borderRadius: 4, overflow: 'hidden', marginTop: 14 },
  fill: { height: 8, borderRadius: 4 },
  amounts: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between', marginTop: 10 },
  saved: { fontSize: 16, fontWeight: '800' },
  target: { fontSize: 14, fontWeight: '700' },
  amountCaption: { fontSize: 12, marginTop: 2 },
  footer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10, marginTop: 14, paddingTop: 12, borderTopWidth: 1 },
  suggest: { flex: 1, fontSize: 12, fontWeight: '600' },
  depositBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: COLORS.chipBlue,
    borderRadius: 10, paddingHorizontal: 12, paddingVertical: 7,
  },
  depositLabel: { fontSize: 13, fontWeight: '700', color: COLORS.primary },
});
