import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, TextInput, Alert, ActivityIndicator } from 'react-native';
import { Iconify } from 'react-native-iconify';
import { COLORS, getThemeColors } from '@/constants/colors';
import { useTheme } from '@/context/theme-context';
import { FinancialGoal } from '@/data/goalsData';
import { formatRupiah } from '@/utils/goals';
import { useI18n } from '@/i18n';

export type CashflowMode = 'deposit' | 'withdraw';

interface Props {
  goal: FinancialGoal | null;
  mode?: CashflowMode;
  saving?: boolean;
  onClose: () => void;
  onSubmit: (goal: FinancialGoal, amount: number, mode: CashflowMode) => void;
}

const QUICK = [50000, 100000, 250000, 500000];

function parseNominal(raw: string): number {
  const digits = raw.replace(/[^0-9]/g, '');
  return digits ? parseInt(digits, 10) : 0;
}

function formatNominalInput(n: number): string {
  if (!n) return '';
  return n.toLocaleString('id-ID');
}

export default function DepositSheet({ goal, mode = 'deposit', saving, onClose, onSubmit }: Props) {
  const { t } = useI18n();
  const { isDark } = useTheme();
  const palette = getThemeColors(isDark ? 'dark' : 'light');
  const [tab, setTab] = useState<CashflowMode>(mode);
  const [amount, setAmount] = useState('');

  // Reset tab & nominal setiap sheet dibuka untuk goal/mode berbeda.
  const [formKey, setFormKey] = useState<string | null>(null);
  const nextKey = goal ? `${goal.id}-${mode}` : null;
  if (nextKey !== formKey) {
    setFormKey(nextKey);
    if (goal) {
      setTab(mode);
      setAmount('');
    }
  }

  if (!goal) return null;

  const isWithdraw = tab === 'withdraw';

  const handleSave = () => {
    const nominal = parseNominal(amount);
    if (nominal <= 0) {
      Alert.alert(
        t('goals.nominalInvalid'),
        isWithdraw ? t('goals.withdrawInvalidMsg') : t('goals.depositInvalidMsg')
      );
      return;
    }
    if (isWithdraw && nominal > goal.saved) {
      Alert.alert(t('goals.withdrawInvalid'), t('goals.withdrawExceedsMsg'));
      return;
    }
    onSubmit(goal, nominal, tab);
  };

  const close = () => {
    if (saving) return;
    setAmount('');
    onClose();
  };

  return (
    <Modal visible transparent animationType="slide" onRequestClose={close}>
      <TouchableOpacity style={styles.overlay} onPress={close} activeOpacity={1}>
        <View style={[styles.sheet, { backgroundColor: palette.card }]}>
          <View style={[styles.handle, { backgroundColor: palette.track }]} />
          <View style={styles.header}>
            <Text style={[styles.title, { color: palette.textDark }]} numberOfLines={2}>
              {goal.name}
            </Text>
            <TouchableOpacity onPress={close} hitSlop={8}>
              <Iconify icon="ph:x-bold" size={22} color={palette.textMuted} />
            </TouchableOpacity>
          </View>
          <Text style={[styles.sub, { color: palette.textMuted }]}>
            {t('goals.savedOf', { saved: formatRupiah(goal.saved), target: formatRupiah(goal.target) })}
          </Text>

          <View style={[styles.tabs, { backgroundColor: palette.inputBg }]}>
            <TouchableOpacity
              style={[styles.tab, !isWithdraw && styles.tabActive]}
              activeOpacity={0.8}
              onPress={() => setTab('deposit')}
            >
              <Iconify
                icon="ph:arrow-down-bold"
                size={15}
                color={!isWithdraw ? '#FFFFFF' : palette.textMuted}
              />
              <Text style={[styles.tabLabel, { color: !isWithdraw ? '#FFFFFF' : palette.textMuted }]}>
                {t('goals.deposit')}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tab, isWithdraw && styles.tabActiveWithdraw]}
              activeOpacity={0.8}
              onPress={() => setTab('withdraw')}
            >
              <Iconify
                icon="ph:arrow-up-bold"
                size={15}
                color={isWithdraw ? '#FFFFFF' : palette.textMuted}
              />
              <Text style={[styles.tabLabel, { color: isWithdraw ? '#FFFFFF' : palette.textMuted }]}>
                {t('goals.withdraw')}
              </Text>
            </TouchableOpacity>
          </View>

          <TextInput
            style={[styles.input, { borderColor: palette.border, backgroundColor: palette.inputBg, color: palette.textDark }]}
            placeholder={t('goals.amountPlaceholder')}
            placeholderTextColor={palette.textMuted}
            value={amount}
            onChangeText={(v) => {
              const n = parseNominal(v);
              setAmount(n ? formatNominalInput(n) : '');
            }}
            keyboardType="numeric"
            autoFocus
            editable={!saving}
          />
          {parseNominal(amount) > 0 ? (
            <Text style={[styles.hint, { color: palette.textMuted }]}>
              {formatRupiah(parseNominal(amount))}
              {isWithdraw ? ` · ${t('goals.withdrawMax', { max: formatRupiah(goal.saved) })}` : ''}
            </Text>
          ) : isWithdraw ? (
            <Text style={[styles.hint, { color: palette.textMuted }]}>
              {t('goals.withdrawMax', { max: formatRupiah(goal.saved) })}
            </Text>
          ) : null}

          <View style={styles.chips}>
            {QUICK.map((q) => (
              <TouchableOpacity
                key={q}
                style={[styles.chip, { borderColor: palette.border, backgroundColor: palette.chipBlue }]}
                activeOpacity={0.8}
                onPress={() => setAmount(formatNominalInput(q))}
              >
                <Text style={[styles.chipLabel, { color: palette.primary }]}>{formatRupiah(q)}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity
            style={[styles.save, isWithdraw && styles.saveWithdraw]}
            activeOpacity={0.85}
            onPress={handleSave}
            disabled={!!saving}
          >
            {saving ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.saveLabel}>
                {isWithdraw ? t('goals.withdrawSavings') : t('goals.addSavings')}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(15,23,42,0.45)', justifyContent: 'flex-end' },
  sheet: {
    borderTopLeftRadius: 24, borderTopRightRadius: 24,
    paddingHorizontal: 20, paddingBottom: 32,
  },
  handle: {
    alignSelf: 'center', width: 44, height: 5, borderRadius: 3,
    marginTop: 10, marginBottom: 14,
  },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  title: { fontSize: 18, fontWeight: '700', flex: 1 },
  sub: { fontSize: 14, marginTop: 6 },
  tabs: {
    flexDirection: 'row', borderRadius: 14, padding: 4, marginTop: 14, gap: 4,
  },
  tab: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 6, borderRadius: 10, paddingVertical: 10,
  },
  tabActive: { backgroundColor: COLORS.primary },
  tabActiveWithdraw: { backgroundColor: '#DC2626' },
  tabLabel: { fontSize: 14, fontWeight: '700' },
  input: {
    borderWidth: 1.5, borderRadius: 12,
    paddingHorizontal: 14, paddingVertical: 12, fontSize: 18, fontWeight: '700',
    marginTop: 14,
  },
  hint: { fontSize: 13, fontWeight: '600', marginTop: 6 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 12 },
  chip: {
    borderWidth: 1.5, borderRadius: 12,
    paddingHorizontal: 14, paddingVertical: 9,
  },
  chipLabel: { fontSize: 14, fontWeight: '700' },
  save: {
    backgroundColor: COLORS.primary, borderRadius: 16,
    paddingVertical: 15, alignItems: 'center', marginTop: 18,
  },
  saveWithdraw: { backgroundColor: '#DC2626' },
  saveLabel: { color: '#FFFFFF', fontSize: 15, fontWeight: '700' },
});
