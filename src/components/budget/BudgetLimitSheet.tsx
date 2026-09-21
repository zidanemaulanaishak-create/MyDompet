import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, TextInput, Alert } from 'react-native';
import { Iconify } from 'react-native-iconify';
import { COLORS } from '@/constants/colors';
import { EXPENSE_CATEGORIES, getCategoryById } from '@/constants/categories';
import { parseRupiah, formatRupiahInput } from '@/context/onboarding';
import { monthLabel } from '@/utils/dates';

interface Props {
  visible: boolean;
  monthKey: string;
  categoryId?: string;
  initialLimit?: number;
  budgetedCategoryIds: string[];
  onClose: () => void;
  onSave: (categoryId: string, limit: number) => Promise<void>;
  onDelete?: (categoryId: string) => Promise<void>;
}

export default function BudgetLimitSheet({
  visible,
  monthKey,
  categoryId,
  initialLimit = 0,
  budgetedCategoryIds = [],
  onClose,
  onSave,
  onDelete,
}: Props) {
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      {visible ? (
        <BudgetSheetBody
          monthKey={monthKey}
          categoryId={categoryId}
          initialLimit={initialLimit}
          budgetedCategoryIds={budgetedCategoryIds}
          onClose={onClose}
          onSave={onSave}
          onDelete={onDelete}
        />
      ) : null}
    </Modal>
  );
}

function BudgetSheetBody({
  monthKey,
  categoryId,
  initialLimit,
  budgetedCategoryIds,
  onClose,
  onSave,
  onDelete,
}: {
  monthKey: string;
  categoryId?: string;
  initialLimit: number;
  budgetedCategoryIds: string[];
  onClose: () => void;
  onSave: (categoryId: string, limit: number) => Promise<void>;
  onDelete?: (categoryId: string) => Promise<void>;
}) {
  const isEdit = !!categoryId;
  const meta = isEdit && categoryId ? getCategoryById(categoryId, 'expense') : undefined;

  const available = EXPENSE_CATEGORIES.filter((c) => !budgetedCategoryIds.includes(c.id));
  const [selectedId, setSelectedId] = useState(
    categoryId ?? available[0]?.id ?? ''
  );
  const [limitText, setLimitText] = useState(
    initialLimit ? formatRupiahInput(initialLimit) : ''
  );

  const handleSave = () => {
    const nominal = parseRupiah(limitText);
    if (!selectedId) {
      Alert.alert('Pilih kategori', 'Pilih kategori terlebih dahulu.');
      return;
    }
    if (nominal <= 0) {
      Alert.alert('Nominal invalid', 'Isi limit budget dengan angka lebih dari 0.');
      return;
    }
    onSave(selectedId, nominal)
      .then(onClose)
      .catch(() => Alert.alert('Gagal menyimpan', 'Coba lagi.'));
  };

  const handleDelete = () => {
    if (!categoryId) return;
    Alert.alert('Hapus budget?', meta?.label ?? categoryId, [
      { text: 'Batal', style: 'cancel' },
      {
        text: 'Hapus',
        style: 'destructive',
        onPress: () =>
          onDelete?.(categoryId)
            .then(onClose)
            .catch(() => Alert.alert('Gagal menghapus', 'Coba lagi.')),
      },
    ]);
  };

  return (
    <TouchableOpacity style={styles.overlay} onPress={onClose} activeOpacity={1}>
      <View style={styles.sheet}>
        <View style={styles.handle} />
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>{isEdit ? 'Edit Budget' : 'Tambah Budget'}</Text>
            <Text style={styles.subtitle}>{monthLabel(monthKey)}</Text>
          </View>
          <TouchableOpacity onPress={onClose} hitSlop={8}>
            <Iconify icon="ph:x-bold" size={22} color={COLORS.textMuted} />
          </TouchableOpacity>
        </View>

        {isEdit && meta ? (
          <View style={styles.selectedRow}>
            <Text style={styles.selectedLabel}>{meta.label}</Text>
            <Text style={styles.selectedHint}>Kategori pengeluaran</Text>
          </View>
        ) : available.length > 0 ? (
          <>
            <Text style={styles.label}>Pilih Kategori</Text>
            {available.map((c) => {
              const active = c.id === selectedId;
              return (
                <TouchableOpacity
                  key={c.id}
                  style={[styles.chip, active && styles.chipActive]}
                  activeOpacity={0.8}
                  onPress={() => setSelectedId(c.id)}
                >
                  <Text style={[styles.chipLabel, active && styles.chipLabelActive]}>
                    {c.label}
                  </Text>
                  {active ? (
                    <Iconify icon="ph:check-bold" size={16} color={COLORS.primary} />
                  ) : null}
                </TouchableOpacity>
              );
            })}
          </>
        ) : (
          <Text style={styles.emptyText}>
            Semua kategori pengeluaran sudah punya budget bulan ini.
          </Text>
        )}

        <Text style={styles.label}>Limit Bulanan</Text>
        <TextInput
          style={styles.input}
          placeholder="cth: 250000"
          placeholderTextColor={COLORS.textMuted}
          keyboardType="numeric"
          value={limitText}
          onChangeText={(t) => setLimitText(formatRupiahInput(parseRupiah(t)))}
        />

        <TouchableOpacity style={styles.save} activeOpacity={0.85} onPress={handleSave}>
          <Text style={styles.saveLabel}>Simpan</Text>
        </TouchableOpacity>

        {isEdit ? (
          <TouchableOpacity style={styles.delete} activeOpacity={0.85} onPress={handleDelete}>
            <Text style={styles.deleteLabel}>Hapus Budget Kategori</Text>
          </TouchableOpacity>
        ) : null}
      </View>
    </TouchableOpacity>
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
    marginBottom: 8,
  },
  title: { fontSize: 18, fontWeight: '700', color: COLORS.textDark },
  subtitle: { fontSize: 14, color: COLORS.textMuted, marginTop: 2 },
  label: { fontSize: 14, fontWeight: '700', color: COLORS.textDark, marginTop: 12, marginBottom: 8 },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F8F9FA',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 8,
  },
  chipActive: { backgroundColor: COLORS.chipBlue, borderColor: COLORS.primary },
  chipLabel: { fontSize: 15, fontWeight: '600', color: COLORS.textDark },
  chipLabelActive: { color: COLORS.primary, fontWeight: '700' },
  selectedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F8F9FA',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginTop: 12,
  },
  selectedLabel: { fontSize: 15, fontWeight: '700', color: COLORS.textDark },
  selectedHint: { fontSize: 13, color: COLORS.textMuted },
  emptyText: { fontSize: 14, color: COLORS.textMuted, marginTop: 12 },
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
  delete: {
    marginTop: 10,
    paddingVertical: 14,
    alignItems: 'center',
  },
  deleteLabel: { color: COLORS.red, fontSize: 15, fontWeight: '700' },
});