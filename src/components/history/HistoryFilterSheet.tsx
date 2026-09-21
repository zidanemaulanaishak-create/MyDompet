import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ScrollView,
  Platform,
  Animated,
  Easing,
} from 'react-native';
import { Iconify } from 'react-native-iconify';
import { COLORS } from '@/constants/colors';
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES, Category } from '@/constants/categories';
import { getPastelBg } from '@/constants/categoryVisuals';

import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';

export type FilterMode = 'date' | 'category';

interface Props {
  visible: boolean;
  mode: FilterMode;
  onClose: () => void;
  selectedCategoryIds: string[];
  onApplyCategories: (ids: string[]) => void;
  dateFrom: Date | null;
  dateTo: Date | null;
  onApplyDates: (from: Date | null, to: Date | null) => void;
}

const IDFormat = new Intl.DateTimeFormat('id-ID', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
});

const MONTH_FORMAT = new Intl.DateTimeFormat('id-ID', { month: 'long', year: 'numeric' });

function formatDate(d: Date | null): string {
  return d ? IDFormat.format(d) : 'Semua';
}

function startOfDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

function endOfDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59, 999);
}

type PresetKey = 'all' | 'today' | '7d' | 'month';

const PRESETS: { key: PresetKey; label: string }[] = [
  { key: 'all', label: 'Semua' },
  { key: 'today', label: 'Hari Ini' },
  { key: '7d', label: '7 Hari' },
  { key: 'month', label: 'Bulan Ini' },
];

function getPresetRange(key: PresetKey): [Date | null, Date | null] {
  const now = new Date();
  switch (key) {
    case 'all':
      return [null, null];
    case 'today':
      return [startOfDay(now), endOfDay(now)];
    case '7d': {
      const from = new Date(now);
      from.setDate(from.getDate() - 6);
      return [startOfDay(from), endOfDay(now)];
    }
    case 'month': {
      const from = new Date(now.getFullYear(), now.getMonth(), 1);
      return [startOfDay(from), endOfDay(now)];
    }
  }
}

function sameRange(a: [Date | null, Date | null], b: [Date | null, Date | null]): boolean {
  const a0 = a[0]?.getTime();
  const a1 = a[1]?.getTime();
  const b0 = b[0]?.getTime();
  const b1 = b[1]?.getTime();
  return a0 === b0 && a1 === b1;
}

export default function HistoryFilterSheet({
  visible,
  mode,
  onClose,
  selectedCategoryIds,
  onApplyCategories,
  dateFrom,
  dateTo,
  onApplyDates,
}: Props) {
  // eslint-disable-next-line react-hooks/refs
  const translateY = useRef(new Animated.Value(500)).current;
  const [internalMode, setInternalMode] = useState<FilterMode>(mode);
  const [localSelected, setLocalSelected] = useState<string[]>(selectedCategoryIds);
  const [localFrom, setLocalFrom] = useState<Date | null>(dateFrom);
  const [localTo, setLocalTo] = useState<Date | null>(dateTo);
  const [showPicker, setShowPicker] = useState<'from' | 'to' | null>(null);

  useEffect(() => {
    if (visible) {
      Animated.timing(translateY, {
        toValue: 0,
        duration: 300,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(translateY, {
        toValue: 500,
        duration: 200,
        easing: Easing.in(Easing.cubic),
        useNativeDriver: true,
      }).start(({ finished }) => {
        if (finished) onClose();
      });
    }
  }, [visible, translateY, onClose]);

  if (!visible) {
    return null;
  }

  const handleBackdropPress = () => {
    setShowPicker(null);
    Animated.timing(translateY, {
      toValue: 500,
      duration: 200,
      easing: Easing.in(Easing.cubic),
      useNativeDriver: true,
    }).start(({ finished }) => {
      if (finished) onClose();
    });
  };

  const handleApply = () => {
    if (internalMode === 'category') {
      onApplyCategories(localSelected);
    } else {
      let from = localFrom;
      let to = localTo;
      if (from && to && from.getTime() > to.getTime()) {
        const tmp = from;
        from = to;
        to = tmp;
      }
      onApplyDates(from, to);
    }
    handleBackdropPress();
  };

  const activePreset = (): PresetKey | undefined => {
    return PRESETS.find((p) => sameRange(getPresetRange(p.key), [localFrom, localTo]))?.key;
  };

  const pickerValue = showPicker
    ? showPicker === 'from'
      ? localFrom ?? new Date()
      : localTo ?? localFrom ?? new Date()
    : new Date();

  const onPickerChange = (event: DateTimePickerEvent, date?: Date) => {
    if (Platform.OS === 'android') {
      setShowPicker(null);
      if (event.type === 'set' && date) {
        if (showPicker === 'from') setLocalFrom(startOfDay(date));
        else if (showPicker === 'to') setLocalTo(endOfDay(date));
      }
      return;
    }
    if (!date) return;
    if (showPicker === 'from') setLocalFrom(startOfDay(date));
    else if (showPicker === 'to') setLocalTo(endOfDay(date));
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="none"
      onRequestClose={handleBackdropPress}
    >
      <TouchableOpacity
        style={styles.overlay}
        onPress={handleBackdropPress}
        activeOpacity={1}
      >
        <Animated.View style={[styles.bottomSheet, { transform: [{ translateY }] }]}>
          <View style={styles.handleContainer}>
            <View style={styles.handle} />
          </View>

          <View style={styles.header}>
            <Text style={styles.title}>Filter Transaksi</Text>
            <TouchableOpacity onPress={handleBackdropPress} hitSlop={8}>
              <Iconify icon="ph:x-bold" size={22} color={COLORS.textMuted} />
            </TouchableOpacity>
          </View>

          <View style={styles.tabs}>
            {(['date', 'category'] as FilterMode[]).map((m) => (
              <TouchableOpacity
                key={m}
                style={[styles.tab, internalMode === m && styles.tabActive]}
                onPress={() => {
                  setShowPicker(null);
                  setInternalMode(m);
                }}
                activeOpacity={0.8}
              >
                <Text style={[styles.tabText, internalMode === m && styles.tabTextActive]}>
                  {m === 'date' ? 'Tanggal' : 'Kategori'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <ScrollView
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {internalMode === 'date' ? (
              <>
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionText}>Jangka Waktu</Text>
                  <TouchableOpacity onPress={() => handleQuickPreset('all')}>
                    <Text style={styles.resetText}>Reset</Text>
                  </TouchableOpacity>
                </View>
                <View style={styles.chipRow}>
                  {PRESETS.map((preset) => {
                    const active = activePreset() === preset.key;
                    return (
                      <TouchableOpacity
                        key={preset.key}
                        style={[styles.chip, active && styles.chipActive]}
                        onPress={() => handleQuickPreset(preset.key)}
                        activeOpacity={0.8}
                      >
                        <Text style={[styles.chipText, active && styles.chipTextActive]}>
                          {preset.label}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>

                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionText}>Rentang Kustom</Text>
                </View>
                <View style={styles.rangeRow}>
                  {(
                    [
                      { key: 'from', label: 'Dari' },
                      { key: 'to', label: 'Sampai' },
                    ] as const
                  ).map((r) => (
                    <TouchableOpacity
                      key={r.key}
                      style={[styles.rangeButton, showPicker === r.key && styles.rangeButtonActive]}
                      onPress={() =>
                        setShowPicker((prev) => (prev === r.key ? null : r.key))
                      }
                      activeOpacity={0.8}
                    >
                      <Iconify icon="ph:calendar-bold" size={15} color={COLORS.textMuted} />
                      <Text style={styles.rangeLabel}>{r.label}</Text>
                      <Text style={styles.rangeValue}>
                        {r.key === 'from' ? formatDate(localFrom) : formatDate(localTo)}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                {showPicker ? (
                  <View style={styles.pickerWrap}>
                    <DateTimePicker
                      value={pickerValue}
                      mode="date"
                      display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                      minimumDate={showPicker === 'to' && localFrom ? localFrom : undefined}
                      maximumDate={showPicker === 'from' && localTo ? localTo : undefined}
                      onChange={onPickerChange}
                    />
                  </View>
                ) : null}

                <Text style={styles.hintText}>Bulan aktif: {MONTH_FORMAT.format(new Date())}</Text>
              </>
            ) : (
              <>
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionText}>Pengeluaran</Text>
                </View>
                {EXPENSE_CATEGORIES.map((category) => renderCategoryItem(category))}
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionText}>Pemasukan</Text>
                </View>
                {INCOME_CATEGORIES.map((category) => renderCategoryItem(category))}
              </>
            )}
          </ScrollView>

          <View style={styles.footer}>
            <TouchableOpacity
              style={styles.applyButton}
              onPress={handleApply}
              activeOpacity={0.85}
            >
              <Text style={styles.applyButtonText}>Terapkan</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </TouchableOpacity>
    </Modal>
  );

  function renderCategoryItem(category: Category) {
    const selected = localSelected.includes(category.id);
    return (
      <TouchableOpacity
        key={category.id}
        style={[styles.categoryItem, selected && styles.categoryItemSelected]}
        onPress={() => toggleCategory(category.id)}
        activeOpacity={0.8}
      >
        <View style={[styles.iconWrapper, { backgroundColor: getPastelBg(category.id) }]}>
          <Iconify icon={category.icon} size={22} />
        </View>
        <Text style={[styles.categoryLabel, selected && styles.categoryLabelSelected]}>
          {category.label}
        </Text>
        <View style={[styles.checkbox, selected && styles.checkboxChecked]}>
          {selected ? <Iconify icon="ph:check-bold" size={12} color="#fff" /> : null}
        </View>
      </TouchableOpacity>
    );
  }

  function toggleCategory(id: string) {
    setLocalSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }

  function handleQuickPreset(key: PresetKey) {
    const [from, to] = getPresetRange(key);
    setLocalFrom(from);
    setLocalTo(to);
  }
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  bottomSheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '85%',
    shadowColor: '#1A2E5A',
    shadowOpacity: 0.2,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: -8 },
    elevation: 16,
  },
  handleContainer: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#D9D9D9',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textDark,
  },
  tabs: {
    flexDirection: 'row',
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    padding: 3,
    marginHorizontal: 20,
    marginBottom: 8,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
    borderRadius: 10,
  },
  tabActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#0F172A',
    shadowOpacity: 0.08,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 1 },
    elevation: 1,
  },
  tabText: {
    fontSize: 17,
    fontWeight: '600',
    color: COLORS.textMuted,
  },
  tabTextActive: {
    color: COLORS.primary,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 8,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 14,
    marginBottom: 10,
  },
  sectionText: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  resetText: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.primary,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
  },
  chipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  chipText: {
    fontSize: 17,
    fontWeight: '600',
    color: COLORS.textDark,
  },
  chipTextActive: {
    color: '#FFFFFF',
  },
  rangeRow: {
    flexDirection: 'row',
    gap: 10,
  },
  rangeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
  },
  rangeButtonActive: {
    borderColor: COLORS.primary,
    backgroundColor: '#EBF2FF',
  },
  rangeLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.textMuted,
  },
  rangeValue: {
    fontSize: 17,
    fontWeight: '600',
    color: COLORS.textDark,
  },
  pickerWrap: {
    marginTop: 8,
    borderRadius: 12,
    overflow: 'hidden',
  },
  hintText: {
    fontSize: 18,
    color: COLORS.textMuted,
    marginTop: 12,
  },
  categoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 14,
    marginBottom: 8,
    backgroundColor: '#F8F9FA',
  },
  categoryItemSelected: {
    backgroundColor: '#EBF2FF',
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  iconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryLabel: {
    flex: 1,
    fontSize: 18,
    fontWeight: '500',
    color: COLORS.textDark,
    marginLeft: 12,
  },
  categoryLabelSelected: {
    color: COLORS.primary,
    fontWeight: '600',
  },
  checkbox: {
    width: 18,
    height: 18,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
  },
  checkboxChecked: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  footer: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 10,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  applyButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 14,
    alignItems: 'center',
    paddingVertical: 14,
  },
  applyButtonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '700',
  },
});