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
import { COLORS } from '@/constants/colors';
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
      Alert.alert('Nominal kosong', 'Isi nominal transaksi dulu.');
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
        date: initialDateLabel || 'Hari ini',
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
      Alert.alert('Gagal menyimpan', 'Transaksi tidak tersimpan. Coba lagi.');
    } finally {
      setSaving(false);
    }
  }, [amount, merchant, note, category, addTransaction, router, initialDateLabel]);

  return (
    <View style={styles.root}>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          <View style={styles.previewWrap}>
            <Image source={{ uri: imageUri }} style={styles.preview} contentFit="cover" />
            <TouchableOpacity style={styles.retake} onPress={onRetake} activeOpacity={0.7}>
              <Iconify icon="ph:arrow-left-bold" size={14} color="#FFFFFF" />
              <Text style={styles.retakeLabel}>Scan ulang</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.hint}>Periksa hasil scan, koreksi bila perlu, lalu simpan.</Text>

          <Text style={styles.label}>Nominal</Text>
          <View style={styles.amountBox}>
            <Text style={styles.currency}>Rp</Text>
            <TextInput
              style={styles.amountInput}
              value={amountText}
              onChangeText={setAmountText}
              placeholder="0"
              placeholderTextColor={COLORS.textMuted}
              keyboardType="numeric"
              returnKeyType="next"
            />
          </View>

          <Text style={styles.label}>Merchant / Toko</Text>
          <TextInput
            style={styles.textInput}
            value={merchant}
            onChangeText={setMerchant}
            placeholder="Contoh: Indomaret"
            placeholderTextColor={COLORS.textMuted}
            returnKeyType="next"
          />

          <Text style={styles.label}>Kategori</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
            {EXPENSE_CATEGORIES.map((c) => {
              const active = c.id === category.id;
              return (
                <TouchableOpacity
                  key={c.id}
                  style={[styles.chip, active && styles.chipActive]}
                  activeOpacity={0.75}
                  onPress={() => setCategory(c)}
                >
                  <Text style={[styles.chipLabel, active && styles.chipLabelActive]}>{c.label}</Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          <Text style={styles.label}>Catatan</Text>
          <TextInput
            style={styles.textInput}
            value={note}
            onChangeText={setNote}
            placeholder="Contoh: makan siang"
            placeholderTextColor={COLORS.textMuted}
            maxLength={200}
            multiline
          />
          <View style={{ height: 100 }} />
        </ScrollView>
      </KeyboardAvoidingView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + 20 }]}>
        <SaveButton onPress={handleSave} disabled={!canSave} loading={saving} title="Simpan Transaksi" variant="primary" fullWidth />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  flex: { flex: 1 },
  scroll: { paddingBottom: 8 },
  previewWrap: { borderRadius: 16, overflow: 'hidden', backgroundColor: '#E2E8F0', marginBottom: 4 },
  preview: { width: '100%', height: 280 },
  retake: { position: 'absolute', left: 12, bottom: 12, flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: 'rgba(0,0,0,0.55)', borderRadius: 20, paddingHorizontal: 12, paddingVertical: 8 },
  retakeLabel: { color: '#FFFFFF', fontSize: 18, fontWeight: '700' },
  hint: { fontSize: 17, color: COLORS.textMuted, marginTop: 12, marginBottom: 16 },
  label: { fontSize: 18, fontWeight: '700', color: COLORS.textDark, marginBottom: 8 },
  amountBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', borderWidth: 1.5, borderColor: '#E2E8F0', borderRadius: 14, paddingHorizontal: 14, marginBottom: 16 },
  currency: { fontSize: 18, fontWeight: '800', color: COLORS.textDark, marginRight: 8 },
  amountInput: { flex: 1, fontSize: 20, fontWeight: '800', color: COLORS.textDark, paddingVertical: 12 },
  textInput: { backgroundColor: '#FFFFFF', borderWidth: 1.5, borderColor: '#E2E8F0', borderRadius: 14, paddingHorizontal: 14, paddingVertical: 12, fontSize: 18, color: COLORS.textDark, marginBottom: 16 },
  chips: { gap: 8, paddingBottom: 4, marginBottom: 16 },
  chip: { borderWidth: 1, borderColor: '#E2E8F0', backgroundColor: '#FFFFFF', borderRadius: 20, paddingHorizontal: 14, paddingVertical: 9 },
  chipActive: { borderColor: COLORS.primary, backgroundColor: COLORS.chipBlue },
  chipLabel: { fontSize: 18, fontWeight: '600', color: COLORS.textMuted },
  chipLabelActive: { color: COLORS.primary, fontWeight: '700' },
  footer: { position: 'absolute', bottom: 0, left: 0, right: 0, paddingTop: 10, backgroundColor: '#F8F9FA' },
});
