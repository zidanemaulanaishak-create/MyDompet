import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, TextInput, Alert } from 'react-native';
import { Iconify } from 'react-native-iconify';
import { getThemeColors } from '@/constants/colors';
import { useTheme } from '@/context/theme-context';
import { EXPENSE_CATEGORIES, getCategoryById } from '@/constants/categories';
import { parseRupiah, formatRupiahInput } from '@/context/onboarding';
import { monthLabel } from '@/utils/dates';
import { useI18n } from '@/i18n';

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
  const { t } = useI18n();
  const { isDark } = useTheme();
  const palette = getThemeColors(isDark ? 'dark' : 'light');
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
      Alert.alert(t('budget.pickCategory'), t('budget.pickCategoryFirst'));
      return;
    }
    if (nominal <= 0) {
      Alert.alert(t('budget.amountInvalid'), t('budget.limitInvalidMsg'));
      return;
    }
    onSave(selectedId, nominal)
      .then(onClose)
      .catch(() => Alert.alert(t('budget.saveFailed'), t('common.tryAgain')));
  };

  const handleDelete = () => {
    if (!categoryId) return;
    Alert.alert(t('budget.deleteTitle'), meta?.label ?? categoryId, [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('common.delete'),
        style: 'destructive',
        onPress: () =>
          onDelete?.(categoryId)
            .then(onClose)
            .catch(() => Alert.alert(t('budget.deleteFailed'), t('common.tryAgain'))),
      },
    ]);
  };

  return (
    <TouchableOpacity style={styles.overlay} onPress={onClose} activeOpacity={1}>
      <View style={[styles.sheet, { backgroundColor: palette.card }]}>
        <View style={[styles.handle, { backgroundColor: palette.track }]} />
        <View style={styles.header}>
          <View>
            <Text style={[styles.title, { color: palette.textDark }]}>{isEdit ? t('budget.editSheetTitle') : t('budget.addSheetTitle')}</Text>
            <Text style={[styles.subtitle, { color: palette.textMuted }]}>{monthLabel(monthKey)}</Text>
          </View>
          <TouchableOpacity onPress={onClose} hitSlop={8}>
            <Iconify icon="ph:x-bold" size={22} color={palette.textMuted} />
          </TouchableOpacity>
        </View>

        {isEdit && meta ? (
          <View
            style={[
              styles.selectedRow,
              { backgroundColor: palette.inputBg, borderColor: palette.border },
            ]}
          >
            <Text style={[styles.selectedLabel, { color: palette.textDark }]}>{meta.label}</Text>
            <Text style={[styles.selectedHint, { color: palette.textMuted }]}>{t('budget.expenseCategory')}</Text>
          </View>
        ) : available.length > 0 ? (
          <>
            <Text style={[styles.label, { color: palette.textDark }]}>{t('budget.pickCategory')}</Text>
            {available.map((c) => {
              const active = c.id === selectedId;
              return (
                <TouchableOpacity
                  key={c.id}
                  style={[
                    styles.chip,
                    { backgroundColor: palette.inputBg, borderColor: palette.border },
                    active && {
                      backgroundColor: palette.chipBlue,
                      borderColor: palette.primary,
                    },
                  ]}
                  activeOpacity={0.8}
                  onPress={() => setSelectedId(c.id)}
                >
                  <Text
                    style={[
                      styles.chipLabel,
                      { color: active ? palette.primary : palette.textDark },
                      active && styles.chipLabelActive,
                    ]}
                  >
                    {c.label}
                  </Text>
                  {active ? (
                    <Iconify icon="ph:check-bold" size={16} color={palette.primary} />
                  ) : null}
                </TouchableOpacity>
              );
            })}
          </>
        ) : (
          <Text style={[styles.emptyText, { color: palette.textMuted }]}>
            {t('budget.allBudgeted')}
          </Text>
        )}

        <Text style={[styles.label, { color: palette.textDark }]}>{t('budget.monthlyLimit')}</Text>
        <TextInput
          style={[
            styles.input,
            { backgroundColor: palette.inputBg, borderColor: palette.border, color: palette.textDark },
          ]}
          placeholder={t('budget.limitPlaceholder')}
          placeholderTextColor={palette.textMuted}
          keyboardType="numeric"
          value={limitText}
          onChangeText={(val) => setLimitText(formatRupiahInput(parseRupiah(val)))}
        />

        <TouchableOpacity
          style={[styles.save, { backgroundColor: palette.primary }]}
          activeOpacity={0.85}
          onPress={handleSave}
        >
          <Text style={styles.saveLabel}>{t('common.save')}</Text>
        </TouchableOpacity>

        {isEdit ? (
          <TouchableOpacity style={styles.delete} activeOpacity={0.85} onPress={handleDelete}>
            <Text style={[styles.deleteLabel, { color: palette.red }]}>{t('budget.deleteCategoryBudget')}</Text>
          </TouchableOpacity>
        ) : null}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(15,23,42,0.45)', justifyContent: 'flex-end' },
  sheet: {
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
    marginTop: 10,
    marginBottom: 14,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  title: { fontSize: 18, fontWeight: '700' },
  subtitle: { fontSize: 14, marginTop: 2 },
  label: { fontSize: 14, fontWeight: '700', marginTop: 12, marginBottom: 8 },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1.5,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 8,
  },
  chipLabel: { fontSize: 15, fontWeight: '600' },
  chipLabelActive: { fontWeight: '700' },
  selectedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1.5,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginTop: 12,
  },
  selectedLabel: { fontSize: 15, fontWeight: '700' },
  selectedHint: { fontSize: 13 },
  emptyText: { fontSize: 14, marginTop: 12 },
  input: {
    borderWidth: 1.5,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 17,
    fontWeight: '700',
  },
  save: {
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
  deleteLabel: { fontSize: 15, fontWeight: '700' },
});