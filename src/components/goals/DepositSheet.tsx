import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, TextInput, Alert } from 'react-native';
import { Iconify } from 'react-native-iconify';
import { COLORS } from '@/constants/colors';
import { FinancialGoal } from '@/data/goalsData';
import { formatRupiah } from '@/utils/goals';

interface Props {
  goal: FinancialGoal | null;
  onClose: () => void;
  onSubmit: (goal: FinancialGoal, amount: number) => void;
}

const QUICK = [50000, 100000, 250000, 500000];

function parseNominal(raw: string): number {
  const digits = raw.replace(/[^0-9]/g, '');
  return digits ? parseInt(digits, 10) : 0;
}

export default function DepositSheet({ goal, onClose, onSubmit }: Props) {
  const [amount, setAmount] = useState('');

  if (!goal) return null;

  const handleSave = () => {
    const nominal = parseNominal(amount);
    if (nominal <= 0) {
      Alert.alert('Nominal invalid', 'Isi jumlah nabung lebih dari 0.');
      return;
    }
    onSubmit(goal, nominal);
    setAmount('');
  };

  const close = () => {
    setAmount('');
    onClose();
  };

  return (
    <Modal visible transparent animationType="slide" onRequestClose={close}>
      <TouchableOpacity style={styles.overlay} onPress={close} activeOpacity={1}>
        <View style={styles.sheet}>
          <View style={styles.handle} />
          <View style={styles.header}>
            <Text style={styles.title}>Nabung ke {goal.name}</Text>
            <TouchableOpacity onPress={close} hitSlop={8}>
              <Iconify icon="ph:x-bold" size={22} color={COLORS.textMuted} />
            </TouchableOpacity>
          </View>
          <Text style={styles.sub}>
            Terkumpul {formatRupiah(goal.saved)} dari {formatRupiah(goal.target)}
          </Text>

          <TextInput
            style={styles.input}
            placeholder="cth: 200000"
            placeholderTextColor={COLORS.textMuted}
            value={amount}
            onChangeText={setAmount}
            keyboardType="numeric"
            autoFocus
          />

          <View style={styles.chips}>
            {QUICK.map((q) => (
              <TouchableOpacity
                key={q}
                style={styles.chip}
                activeOpacity={0.8}
                onPress={() => setAmount(String(q))}
              >
                <Text style={styles.chipLabel}>{formatRupiah(q)}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity style={styles.save} activeOpacity={0.85} onPress={handleSave}>
            <Text style={styles.saveLabel}>Tambah Tabungan</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(15,23,42,0.45)', justifyContent: 'flex-end' },
  sheet: {
    backgroundColor: '#FFFFFF', borderTopLeftRadius: 24, borderTopRightRadius: 24,
    paddingHorizontal: 20, paddingBottom: 32,
  },
  handle: {
    alignSelf: 'center', width: 44, height: 5, borderRadius: 3,
    backgroundColor: '#D9D9D9', marginTop: 10, marginBottom: 14,
  },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  title: { fontSize: 18, fontWeight: '700', color: COLORS.textDark, flex: 1, marginRight: 8 },
  sub: { fontSize: 14, color: COLORS.textMuted, marginTop: 6 },
  input: {
    borderWidth: 1.5, borderColor: '#E2E8F0', borderRadius: 12,
    paddingHorizontal: 14, paddingVertical: 12, fontSize: 18, fontWeight: '700',
    color: COLORS.textDark, backgroundColor: '#F8F9FA', marginTop: 14,
  },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 12 },
  chip: {
    borderWidth: 1.5, borderColor: '#E2E8F0', borderRadius: 12,
    paddingHorizontal: 14, paddingVertical: 9, backgroundColor: '#F8F9FA',
  },
  chipLabel: { fontSize: 14, fontWeight: '700', color: COLORS.primary },
  save: {
    backgroundColor: COLORS.primary, borderRadius: 16,
    paddingVertical: 15, alignItems: 'center', marginTop: 18,
  },
  saveLabel: { color: '#FFFFFF', fontSize: 15, fontWeight: '700' },
});
