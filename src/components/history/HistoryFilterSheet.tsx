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
import { getThemeColors, ColorPalette } from '@/constants/colors';
import { useTheme } from '@/context/theme-context';
import { translate, useI18n } from '@/i18n';
import { getAppPrefs } from '@/utils/appPrefs';
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
  return d ? IDFormat.format(d) : translate(getAppPrefs().locale, 'common.all');
}

function startOfDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

function endOfDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59, 999);
}

type PresetKey = 'all' | 'today' | '7d' | 'month';

const PRESETS: { key: PresetKey; labelKey: string }[] = [
  { key: 'all', labelKey: 'common.all' },
  { key: 'today', labelKey: 'history.presetToday' },
  { key: '7d', labelKey: 'history.preset7d' },
  { key: 'month', labelKey: 'history.presetMonth' },
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
  const { isDark } = useTheme();
  const palette = getThemeColors(isDark ? 'dark' : 'light');
  const { t } = useI18n();
  const styles = createStyles(palette);
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
            <Text style={styles.title}>{t('history.filterTitle')}</Text>
            <TouchableOpacity onPress={handleBackdropPress} hitSlop={8}>
              <Iconify icon="ph:x-bold" size={22} color={palette.textMuted} />
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
                  {m === 'date' ? t('common.date') : t('common.category')}
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
                  <Text style={styles.sectionText}>{t('history.periodRange')}</Text>
                  <TouchableOpacity onPress={() => handleQuickPreset('all')}>
                    <Text style={styles.resetText}>{t('common.reset')}</Text>
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
                          {t(preset.labelKey)}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>

                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionText}>{t('history.customRange')}</Text>
                </View>
                <View style={styles.rangeRow}>
                  {(
                    [
                      { key: 'from', labelKey: 'history.from' },
                      { key: 'to', labelKey: 'history.to' },
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
                      <Iconify icon="ph:calendar-bold" size={15} color={palette.textMuted} />
                      <Text style={styles.rangeLabel}>{t(r.labelKey)}</Text>
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

                <Text style={styles.hintText}>{t('history.activeMonth', { month: MONTH_FORMAT.format(new Date()) })}</Text>
              </>
            ) : (
              <>
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionText}>{t('transactions.expense')}</Text>
                </View>
                {EXPENSE_CATEGORIES.map((category) => renderCategoryItem(category))}
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionText}>{t('transactions.income')}</Text>
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

function createStyles(palette: ColorPalette) {
  return StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  bottomSheet: {
    backgroundColor: palette.card,
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
    backgroundColor: palette.border,
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
    color: palette.textDark,
  },
  tabs: {
    flexDirection: 'row',
    backgroundColor: palette.divider,
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
    backgroundColor: palette.card,
    shadowColor: '#0F172A',
    shadowOpacity: 0.08,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 1 },
    elevation: 1,
  },
  tabText: {
    fontSize: 17,
    fontWeight: '600',
    color: palette.textMuted,
  },
  tabTextActive: {
    color: palette.primary,
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
    color: palette.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  resetText: {
    fontSize: 18,
    fontWeight: '600',
    color: palette.primary,
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
    borderColor: palette.border,
    backgroundColor: palette.card,
  },
  chipActive: {
    backgroundColor: palette.primary,
    borderColor: palette.primary,
  },
  chipText: {
    fontSize: 17,
    fontWeight: '600',
    color: palette.textDark,
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
    borderColor: palette.border,
    backgroundColor: palette.card,
  },
  rangeButtonActive: {
    borderColor: palette.primary,
    backgroundColor: palette.chipBlue,
  },
  rangeLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: palette.textMuted,
  },
  rangeValue: {
    fontSize: 17,
    fontWeight: '600',
    color: palette.textDark,
  },
  pickerWrap: {
    marginTop: 8,
    borderRadius: 12,
    overflow: 'hidden',
  },
  hintText: {
    fontSize: 18,
    color: palette.textMuted,
    marginTop: 12,
  },
  categoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 14,
    marginBottom: 8,
    backgroundColor: palette.inputBg,
  },
  categoryItemSelected: {
    backgroundColor: palette.chipBlue,
    borderWidth: 1,
    borderColor: palette.primary,
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
    color: palette.textDark,
    marginLeft: 12,
  },
  categoryLabelSelected: {
    color: palette.primary,
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
    backgroundColor: palette.primary,
    borderColor: palette.primary,
  },
  footer: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 10,
    borderTopWidth: 1,
    borderTopColor: palette.divider,
  },
  applyButton: {
    backgroundColor: palette.primary,
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
}