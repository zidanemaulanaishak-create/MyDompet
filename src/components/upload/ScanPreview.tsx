import React, { useCallback, useMemo, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Iconify } from 'react-native-iconify';
import { getThemeColors } from '@/constants/colors';
import { useTheme } from '@/context/theme-context';
import { useI18n } from '@/i18n';
import { useTransactions } from '@/context/transaction-context';
import { TransactionItem } from '@/data/dummyData';
import { parseItemDate } from '@/utils/dates';
import { Category, EXPENSE_CATEGORIES, getDefaultCategory } from '@/constants/categories';
import SaveButton from '@/components/transaction/SaveButton';

interface Props {
  imageUri: string;
  onRetake: () => void;
  initialAmount?: string;
  initialMerchant?: string;
  initialDateLabel?: string;
}

function parseAmount(text: string): number {
  const digits = text.replace(/[^0-9]/g, '');
  return digits ? parseInt(digits, 10) : 0;
}

export default function ScanPreview({ imageUri, onRetake, initialAmount = '', initialMerchant = '', initialDateLabel }: Props) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { isDark } = useTheme();
  const palette = getThemeColors(isDark ? 'dark' : 'light');
  const { t } = useI18n();
  const { addTransaction } = useTransactions();

  const [amountText, setAmountText] = useState(initialAmount);
  const [merchant, setMerchant] = useState(initialMerchant);
  const [category, setCategory] = useState<Category>(getDefaultCategory('expense'));
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);

  const amount = useMemo(() => parseAmount(amountText), [amountText]);
  const canSave = amount > 0 && !saving;

  const handleSave = useCallback(async () => {
    if (amount <= 0) {
      Alert.alert(t('upload.emptyAmountTitle'), t('upload.emptyAmountMessage'));
      return;
    }
    setSaving(true);
    try {
      const parsedDate = initialDateLabel
        ? parseItemDate({ date: initialDateLabel } as TransactionItem)
        : null;
      const tx: TransactionItem = {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        name: merchant.trim() || note.trim() || category.label,
        category: category.label,
        date: initialDateLabel || t('common.today'),
        amount: `-Rp ${amount.toLocaleString('id-ID')}`,
        icon: category.icon,
        type: 'expense',
        amountValue: amount,
        currency: 'IDR',
        categoryId: category.id,
        note: note.trim() || undefined,
        timestamp: parsedDate?.getTime() ?? Date.now(),
      };
      await addTransaction(tx);
      router.replace('/home');
    } catch {
      Alert.alert(t('upload.saveFailedTitle'), t('upload.saveFailedMessage'));
    } finally {
      setSaving(false);
    }
  }, [amount, merchant, note, category, addTransaction, router, initialDateLabel, t]);

  return (
    <View style={styles.root}>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          <View style={[styles.previewWrap, { backgroundColor: palette.border }]}>
            <Image source={{ uri: imageUri }} style={styles.preview} contentFit="cover" />
            <TouchableOpacity style={styles.retake} onPress={onRetake} activeOpacity={0.7}>
              <Iconify icon="ph:arrow-left-bold" size={14} color="#FFFFFF" />
              <Text style={styles.retakeLabel}>{t('scan.retry')}</Text>
            </TouchableOpacity>
          </View>

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

          <Text style={[styles.label, { color: palette.textDark }]}>Catatan</Text>
          <TextInput
            style={[styles.textInput, { backgroundColor: palette.card, borderColor: palette.border, color: palette.textDark }]}
            value={note}
            onChangeText={setNote}
            placeholder="Contoh: makan siang"
            placeholderTextColor={palette.textMuted}
            maxLength={200}
            multiline
          />
          <View style={{ height: 100 }} />
        </ScrollView>
      </KeyboardAvoidingView>

      <View style={[styles.footer, { backgroundColor: palette.bg, paddingBottom: insets.bottom + 20 }]}>
        <SaveButton onPress={handleSave} disabled={!canSave} loading={saving} title="Simpan Transaksi" variant="primary" fullWidth />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  flex: { flex: 1 },
  scroll: { paddingBottom: 8 },
  previewWrap: { borderRadius: 16, overflow: 'hidden', marginBottom: 4 },
  preview: { width: '100%', height: 280 },
  retake: { position: 'absolute', left: 12, bottom: 12, flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: 'rgba(0,0,0,0.55)', borderRadius: 20, paddingHorizontal: 12, paddingVertical: 8 },
  retakeLabel: { color: '#FFFFFF', fontSize: 18, fontWeight: '700' },
  hint: { fontSize: 17, marginTop: 12, marginBottom: 16 },
  label: { fontSize: 18, fontWeight: '700', marginBottom: 8 },
  amountBox: { flexDirection: 'row', alignItems: 'center', borderWidth: 1.5, borderRadius: 14, paddingHorizontal: 14, marginBottom: 16 },
  currency: { fontSize: 18, fontWeight: '800', marginRight: 8 },
  amountInput: { flex: 1, fontSize: 20, fontWeight: '800', paddingVertical: 12 },
  textInput: { borderWidth: 1.5, borderRadius: 14, paddingHorizontal: 14, paddingVertical: 12, fontSize: 18, marginBottom: 16 },
  chips: { gap: 8, paddingBottom: 4, marginBottom: 16 },
  chip: { borderWidth: 1, borderRadius: 20, paddingHorizontal: 14, paddingVertical: 9 },
  chipLabel: { fontSize: 18, fontWeight: '600' },
  footer: { position: 'absolute', bottom: 0, left: 0, right: 0, paddingTop: 10 },
});
