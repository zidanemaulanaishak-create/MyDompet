import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, TextInput, Alert } from 'react-native';
import { Iconify } from 'react-native-iconify';
import { COLORS } from '@/constants/colors';
import { Occupation, parseRupiah, formatRupiahInput } from '@/context/onboarding';

interface Props {
  visible: boolean;
  occupation: Occupation | null;
  mainIncome: number;
  onClose: () => void;
  onSubmit: (data: { occupation: Occupation; mainIncome: number }) => void;
}

const OCCUPATIONS: { key: Occupation; label: string; icon: string }[] = [
  { key: 'pekerja', label: 'Pekerja', icon: 'ph:briefcase-bold' },
  { key: 'pelajar', label: 'Pelajar', icon: 'ph:graduation-cap-bold' },
  { key: 'mahasiswa', label: 'Mahasiswa', icon: 'ph:student-bold' },
];

export default function FinanceProfileSheet({
  visible,
  occupation,
  mainIncome,
  onClose,
  onSubmit,
}: Props) {
  const [selected, setSelected] = useState<Occupation | null>(occupation);
  const [incomeText, setIncomeText] = useState(
    mainIncome ? formatRupiahInput(mainIncome) : ''
  );

  const handleSave = () => {
    const nominal = parseRupiah(incomeText);
    if (!selected) {
      Alert.alert('Pilih profesi', 'Pilih salah satu profesi kamu terlebih dahulu.');
      return;
    }
    if (nominal <= 0) {
      Alert.alert('Nominal invalid', 'Isi pendapatan bulanan dengan angka lebih dari 0.');
      return;
    }
    onSubmit({ occupation: selected, mainIncome: nominal });
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      {visible ? (
        <TouchableOpacity key="open" style={styles.overlay} onPress={onClose} activeOpacity={1}>
          <View style={styles.sheet}>
            <View style={styles.handle} />
            <View style={styles.header}>
              <Text style={styles.title}>Pendapatan & Profesi</Text>
              <TouchableOpacity onPress={onClose} hitSlop={8}>
                <Iconify icon="ph:x-bold" size={22} color={COLORS.textMuted} />
              </TouchableOpacity>
            </View>

            <Text style={styles.label}>Profesi</Text>
            <View style={styles.chips}>
              {OCCUPATIONS.map((o) => {
                const active = o.key === selected;
                return (
                  <TouchableOpacity
                    key={o.key}
                    style={[styles.chip, active ? styles.chipActive : styles.chipIdle]}
                    activeOpacity={0.8}
                    onPress={() => setSelected(o.key)}
                  >
                    <Iconify
                      icon={o.icon}
                      size={18}
                      color={active ? '#FFFFFF' : COLORS.primary}
                    />
                    <Text style={[styles.chipLabel, active && styles.chipLabelActive]}>
                      {o.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <Text style={styles.label}>Pendapatan Bulanan</Text>
            <TextInput
              style={styles.input}
              placeholder="cth: 5000000"
              placeholderTextColor={COLORS.textMuted}
              keyboardType="numeric"
              value={incomeText}
              onChangeText={(t) => setIncomeText(formatRupiahInput(parseRupiah(t)))}
            />

            <TouchableOpacity style={styles.save} activeOpacity={0.85} onPress={handleSave}>
              <Text style={styles.saveLabel}>Simpan</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      ) : null}
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(15,23,42,0.45)', justifyContent: 'flex-end' },
  sheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingBottom: 32,
  },
  handle: {
    alignSelf: 'center',
    width: 44,
    height: 5,
    borderRadius: 3,
    backgroundColor: '#D9D9D9',
    marginTop: 10,
    marginBottom: 14,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  title: { fontSize: 18, fontWeight: '700', color: COLORS.textDark },
  label: { fontSize: 14, fontWeight: '700', color: COLORS.textDark, marginTop: 12, marginBottom: 8 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 14,
    borderWidth: 1.5,
  },
  chipActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  chipIdle: { backgroundColor: '#F8F9FA', borderColor: '#E2E8F0' },
  chipLabel: { fontSize: 14, fontWeight: '700', color: COLORS.primary },
  chipLabelActive: { color: '#FFFFFF' },
  input: {
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 17,
    fontWeight: '700',
    color: COLORS.textDark,
    backgroundColor: '#F8F9FA',
  },
  save: {
    backgroundColor: COLORS.primary,
    borderRadius: 16,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: 20,
  },
  saveLabel: { color: '#FFFFFF', fontSize: 15, fontWeight: '700' },
});