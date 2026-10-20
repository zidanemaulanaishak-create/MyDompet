import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, Image } from 'react-native';
import { Iconify } from 'react-native-iconify';
import { getThemeColors } from '@/constants/colors';
import { useTheme } from '@/context/theme-context';
import { FinancialGoal } from '@/data/goalsData';
import { formatCompact, formatRupiah, goalPercent, isGoalDone, monthlySuggestion, daysLeftLabel } from '@/utils/goals';
import { useI18n } from '@/i18n';

interface Props {
  goal: FinancialGoal | null;
  onClose: () => void;
  onDeposit: (g: FinancialGoal) => void;
  onWithdraw: (g: FinancialGoal) => void;
  onEdit: (g: FinancialGoal) => void;
  onDelete: (g: FinancialGoal) => void;
}

export default function GoalDetailSheet({ goal, onClose, onDeposit, onWithdraw, onEdit, onDelete }: Props) {
  const { t, locale } = useI18n();
  const { isDark } = useTheme();
  const palette = getThemeColors(isDark ? 'dark' : 'light');

  if (!goal) return null;

  const done = isGoalDone(goal);
  const pct = goalPercent(goal);
  const remaining = Math.max(0, goal.target - goal.saved);

  return (
    <Modal visible transparent animationType="slide" onRequestClose={onClose}>
      <TouchableOpacity style={styles.overlay} onPress={onClose} activeOpacity={1}>
        <View style={[styles.sheet, { backgroundColor: palette.card }]}>
          <View style={[styles.handle, { backgroundColor: palette.track }]} />
          <View style={styles.header}>
            <View style={styles.headLeft}>
              {goal.imageUri ? (
                <Image source={{ uri: goal.imageUri }} style={styles.avatar} />
              ) : (
                <View style={[styles.avatar, { backgroundColor: goal.iconBg, alignItems: 'center', justifyContent: 'center' }]}>
                  <Iconify icon={goal.icon || 'ph:piggy-bank-bold'} size={26} color={goal.iconColor} />
                </View>
              )}
              <View style={styles.headText}>
                <Text style={[styles.name, { color: palette.textDark }]}>{goal.name}</Text>
                <Text style={[styles.meta, { color: palette.textMuted }]}>
                  {goal.deadline} · {daysLeftLabel(goal.deadlineTs, locale)}
                </Text>
              </View>
            </View>
            <TouchableOpacity onPress={onClose} hitSlop={8}>
              <Iconify icon="ph:x-bold" size={22} color={palette.textMuted} />
            </TouchableOpacity>
          </View>

          <Text style={[styles.bigSaved, { color: palette.textDark }]}>{formatRupiah(goal.saved)}</Text>
          <Text style={[styles.bigTarget, { color: palette.textMuted }]}>
            {t('goals.savedOf', { saved: '', target: formatRupiah(goal.target) }).trim()} · {pct}%
          </Text>
          <View style={[styles.track, { backgroundColor: palette.track }]}>
            <View style={[styles.fill, { width: `${Math.min(100, pct)}%`, backgroundColor: done ? palette.green : palette.primary }]} />
          </View>

          <View style={styles.rows}>
            <View style={[styles.row, { borderColor: palette.divider }]}>
              <Text style={[styles.rowLabel, { color: palette.textMuted }]}>{t('goals.remaining')}</Text>
              <Text style={[styles.rowValue, { color: palette.textDark }]}>{formatCompact(remaining)}</Text>
            </View>
            <View style={[styles.row, { borderColor: palette.divider }]}>
              <Text style={[styles.rowLabel, { color: palette.textMuted }]}>{t('goals.monthlyNeed')}</Text>
              <Text style={[styles.rowValue, { color: palette.textDark }]}>
                {done ? t('goals.noSavingNeeded') : formatCompact(monthlySuggestion(goal))}
              </Text>
            </View>
          </View>

          <View style={styles.actions}>
            {!done ? (
              <TouchableOpacity style={styles.primaryBtn} activeOpacity={0.85} onPress={() => onDeposit(goal)}>
                <Iconify icon="ph:arrow-down-bold" size={16} color="#FFFFFF" />
                <Text style={styles.primaryLabel}>{t('goals.deposit')}</Text>
              </TouchableOpacity>
            ) : null}
            {goal.saved > 0 ? (
              <TouchableOpacity
                style={[styles.secondaryBtn, { borderColor: palette.border, backgroundColor: palette.inputBg }]}
                activeOpacity={0.85}
                onPress={() => onWithdraw(goal)}
              >
                <Iconify icon="ph:arrow-up-bold" size={16} color={palette.textDark} />
                <Text style={[styles.secondaryLabel, { color: palette.textDark }]}>{t('goals.withdraw')}</Text>
              </TouchableOpacity>
            ) : null}
          </View>

          <View style={styles.dangerRow}>
            <TouchableOpacity style={styles.ghostBtn} activeOpacity={0.8} onPress={() => onEdit(goal)}>
              <Iconify icon="ph:pencil-simple-bold" size={16} color={palette.primary} />
              <Text style={[styles.ghostLabel, { color: palette.primary }]}>{t('common.edit')}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.ghostBtn} activeOpacity={0.8} onPress={() => onDelete(goal)}>
              <Iconify icon="ph:trash-bold" size={16} color={palette.red} />
              <Text style={[styles.ghostLabel, { color: palette.red }]}>{t('common.delete')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(15,23,42,0.45)', justifyContent: 'flex-end' },
  sheet: { borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingHorizontal: 20, paddingBottom: 32 },
  handle: { alignSelf: 'center', width: 44, height: 5, borderRadius: 3, marginTop: 10, marginBottom: 14 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  headLeft: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  avatar: { width: 52, height: 52, borderRadius: 26 },
  headText: { flex: 1 },
  name: { fontSize: 17, fontWeight: '800' },
  meta: { fontSize: 13, fontWeight: '600', marginTop: 2 },
  bigSaved: { fontSize: 28, fontWeight: '800', marginTop: 16 },
  bigTarget: { fontSize: 14, fontWeight: '600', marginTop: 2 },
  track: { height: 10, borderRadius: 5, overflow: 'hidden', marginTop: 12 },
  fill: { height: 10, borderRadius: 5 },
  rows: { marginTop: 14, gap: 10 },
  row: { flexDirection: 'row', justifyContent: 'space-between', borderBottomWidth: 1, paddingBottom: 10 },
  rowLabel: { fontSize: 14, fontWeight: '600' },
  rowValue: { fontSize: 14, fontWeight: '800' },
  actions: { flexDirection: 'row', gap: 10, marginTop: 18 },
  primaryBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
    backgroundColor: '#1A42BA', borderRadius: 14, paddingVertical: 13,
  },
  primaryLabel: { color: '#FFFFFF', fontSize: 15, fontWeight: '700' },
  secondaryBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
    borderWidth: 1.5, borderRadius: 14, paddingVertical: 13,
  },
  secondaryLabel: { fontSize: 15, fontWeight: '700' },
  dangerRow: { flexDirection: 'row', justifyContent: 'space-around', marginTop: 8 },
  ghostBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, padding: 10 },
  ghostLabel: { fontSize: 14, fontWeight: '700' },
});
