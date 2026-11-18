import React, { useCallback, useMemo, useState } from 'react';
import {
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Image } from 'expo-image';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Iconify } from 'react-native-iconify';
import { getThemeColors } from '@/constants/colors';
import { useTheme } from '@/context/theme-context';
import { monthName, useI18n } from '@/i18n';
import { Category, EXPENSE_CATEGORIES, getCategoryById, getDefaultCategory } from '@/constants/categories';
import SaveButton from '@/components/transaction/SaveButton';

export interface ReceiptDraft {
  amount: number;
  merchant: string;
  category: Category;
  note: string;
  dateTs: number;
}

interface Props {
  imageUri: string;
  isPdf?: boolean;
  initialAmount?: string;
  initialMerchant?: string;
  initialCategoryId?: string;
  initialDateIso?: string;
  lowConfidence?: boolean;
  saving?: boolean;
  onSave: (draft: ReceiptDraft) => void;
  onRetake: () => void;
  onBackToReview?: () => void;
}

function parseAmount(text: string): number {
  const digits = text.replace(/[^0-9]/g, '');
  return digits ? parseInt(digits, 10) : 0;
}

function isoToTimestamp(iso?: string): number {
  if (!iso) return Date.now();
  const parsed = Date.parse(`${iso}T00:00:00`);
  return Number.isFinite(parsed) ? parsed : Date.now();
}

function formatDateLabel(ts: number, locale: 'id' | 'en'): string {
  const d = new Date(ts);
  return `${d.getDate()} ${monthName(locale, d.getMonth())} ${d.getFullYear()}`;
}

export default function ReceiptForm({
  imageUri,
  isPdf = false,
  initialAmount = '',
  initialMerchant = '',
  initialCategoryId,
  initialDateIso,
  lowConfidence = false,
  saving = false,
  onSave,
  onRetake,
  onBackToReview,
}: Props) {
  const insets = useSafeAreaInsets();
  const { isDark, accent } = useTheme();
  const palette = getThemeColors(isDark ? 'dark' : 'light', accent);
  const { t, locale } = useI18n();

  const [amountText, setAmountText] = useState(initialAmount);
  const [merchant, setMerchant] = useState(initialMerchant);
  const [category, setCategory] = useState<Category>(
    getCategoryById(initialCategoryId ?? '', 'expense') ?? getDefaultCategory('expense')
  );
  const [note, setNote] = useState('');
  const [dateTs, setDateTs] = useState(() => isoToTimestamp(initialDateIso));
  const [showPicker, setShowPicker] = useState(false);

  const amount = useMemo(() => parseAmount(amountText), [amountText]);
  const canSave = amount > 0 && !saving;
  const dateEditable = Platform.OS !== 'web';

  const onPickerChange = useCallback((_event: DateTimePickerEvent, selected?: Date) => {
    if (Platform.OS === 'android') setShowPicker(false);
    if (selected) setDateTs(selected.getTime());
  }, []);

  const handleSave = useCallback(() => {
    if (amount <= 0) return;
    onSave({
      amount,
      merchant: merchant.trim(),
      category,
      note: note.trim(),
      dateTs,
    });
  }, [amount, merchant, category, note, dateTs, onSave]);

  return (
    <View style={styles.root}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {onBackToReview ? (
          <TouchableOpacity style={styles.backRow} onPress={onBackToReview} activeOpacity={0.7}>
            <Iconify icon="ph:arrow-left-bold" size={16} color={palette.primary} />
            <Text style={[styles.backLabel, { color: palette.primary }]}>{t('upload.backToReview')}</Text>
          </TouchableOpacity>
        ) : null}

        <View style={[styles.previewWrap, { backgroundColor: palette.border }]}>
          {isPdf ? (
            <View style={[styles.pdfPreview, { backgroundColor: palette.inputBg }]}>
              <Iconify icon="ph:file-text-bold" size={44} color={palette.primary} />
              <Text style={[styles.pdfLabel, { color: palette.textMuted }]}>{t('upload.pdfPreview')}</Text>
            </View>
          ) : (
            <Image source={{ uri: imageUri }} style={styles.preview} contentFit="cover" />
          )}
          <TouchableOpacity style={styles.retake} onPress={onRetake} activeOpacity={0.7}>
            <Iconify icon="ph:arrow-left-bold" size={14} color="#FFFFFF" />
            <Text style={styles.retakeLabel}>{t('upload.retake')}</Text>
          </TouchableOpacity>
        </View>

        {lowConfidence ? (
          <View style={styles.warning}>
            <Iconify icon="ph:warning-circle-bold" size={18} color={palette.orange} />
            <Text style={[styles.warningText, { color: palette.textDark }]}>{t('upload.lowConfidence')}</Text>
          </View>
        ) : null}

        <Text style={[styles.hint, { color: palette.textMuted }]}>{t('upload.checkHint')}</Text>

        <Text style={[styles.label, { color: palette.textDark }]}>{t('upload.amountLabel')}</Text>
        <View style={[styles.amountBox, { backgroundColor: palette.card, borderColor: palette.border }]}>
          <Text style={[styles.currency, { color: palette.textDark }]}>Rp</Text>
          <TextInput
            style={[styles.amountInput, { color: palette.textDark }]}
            value={amountText}
            onChangeText={setAmountText}
            placeholder="0"
            placeholderTextColor={palette.textMuted}
            keyboardType="numeric"
            returnKeyType="next"
          />
        </View>

        <Text style={[styles.label, { color: palette.textDark }]}>{t('upload.merchantLabel')}</Text>
        <TextInput
          style={[styles.textInput, { backgroundColor: palette.card, borderColor: palette.border, color: palette.textDark }]}
          value={merchant}
          onChangeText={setMerchant}
          placeholder={t('upload.merchantPlaceholder')}
          placeholderTextColor={palette.textMuted}
          returnKeyType="next"
        />

        <Text style={[styles.label, { color: palette.textDark }]}>{t('upload.dateLabel')}</Text>
        <TouchableOpacity
          style={[styles.dateRow, { backgroundColor: palette.card, borderColor: palette.border }]}
          activeOpacity={dateEditable ? 0.8 : 1}
          onPress={() => dateEditable && setShowPicker(true)}
          disabled={!dateEditable}
        >
          <Iconify icon="ph:calendar-bold" size={20} color={palette.primary} />
          <Text style={[styles.dateLabel, { color: palette.textDark }]}>{formatDateLabel(dateTs, locale)}</Text>
          {dateEditable ? <Iconify icon="ph:caret-down-bold" size={16} color={palette.textMuted} /> : null}
        </TouchableOpacity>
        {dateEditable && (showPicker || Platform.OS === 'ios') ? (
          <DateTimePicker
            value={new Date(dateTs)}
            mode="date"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            maximumDate={new Date()}
            onChange={onPickerChange}
          />
        ) : null}

        <Text style={[styles.label, { color: palette.textDark }]}>{t('common.category')}</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
          {EXPENSE_CATEGORIES.map((c) => {
            const active = c.id === category.id;
            return (
              <TouchableOpacity
                key={c.id}
                style={[
                  styles.chip,
                  { backgroundColor: palette.card, borderColor: palette.border },
                  active && { borderColor: palette.primary, backgroundColor: palette.chipBlue },
                ]}
                activeOpacity={0.75}
                onPress={() => setCategory(c)}
              >
                <Text
                  style={[
                    styles.chipLabel,
                    { color: active ? palette.primary : palette.textMuted },
                    active && { fontWeight: '700' },
                  ]}
                >
                  {c.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        <Text style={[styles.label, { color: palette.textDark }]}>{t('upload.noteLabel')}</Text>
        <TextInput
          style={[styles.textInput, { backgroundColor: palette.card, borderColor: palette.border, color: palette.textDark }]}
          value={note}
          onChangeText={setNote}
          placeholder={t('upload.notePlaceholder')}
          placeholderTextColor={palette.textMuted}
          maxLength={200}
          multiline
        />
        <View style={{ height: 100 }} />
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + 8 }]}>
        <SaveButton
          onPress={handleSave}
          disabled={!canSave}
          loading={saving}
          title={t('scan.confirm')}
          variant="primary"
          fullWidth
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  scroll: { paddingBottom: 8 },
  backRow: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 10, marginBottom: 4 },
  backLabel: { fontSize: 15, fontWeight: '700' },
  previewWrap: { borderRadius: 16, overflow: 'hidden', marginBottom: 4 },
  preview: { width: '100%', height: 240 },
  pdfPreview: { width: '100%', height: 180, alignItems: 'center', justifyContent: 'center', gap: 10 },
  pdfLabel: { fontSize: 15, fontWeight: '600' },
  retake: {
    position: 'absolute',
    left: 12,
    bottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(0,0,0,0.55)',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  retakeLabel: { color: '#FFFFFF', fontSize: 15, fontWeight: '700' },
  warning: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(255,150,29,0.12)',
    borderRadius: 12,
    padding: 12,
    marginTop: 12,
  },
  warningText: { flex: 1, fontSize: 14, fontWeight: '600', lineHeight: 20 },
  hint: { fontSize: 15, marginTop: 12, marginBottom: 14 },
  label: { fontSize: 16, fontWeight: '700', marginBottom: 8 },
  amountBox: { flexDirection: 'row', alignItems: 'center', borderWidth: 1.5, borderRadius: 14, paddingHorizontal: 14, marginBottom: 16 },
  currency: { fontSize: 18, fontWeight: '800', marginRight: 8 },
  amountInput: { flex: 1, fontSize: 20, fontWeight: '800', paddingVertical: 12 },
  textInput: { borderWidth: 1.5, borderRadius: 14, paddingHorizontal: 14, paddingVertical: 12, fontSize: 16, marginBottom: 16 },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderWidth: 1.5,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 14,
    marginBottom: 16,
  },
  dateLabel: { flex: 1, fontSize: 16, fontWeight: '700' },
  chips: { gap: 8, paddingBottom: 4, marginBottom: 16 },
  chip: { borderWidth: 1, borderRadius: 20, paddingHorizontal: 14, paddingVertical: 9 },
  chipLabel: { fontSize: 15, fontWeight: '600' },
  footer: { position: 'absolute', bottom: 0, left: 0, right: 0, paddingTop: 10 },
});
