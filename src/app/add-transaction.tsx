import React, { useState, useRef, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Keyboard,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Iconify } from 'react-native-iconify';
import { COLORS } from '@/constants/colors';
import { useTransactions } from '@/context/transaction-context';
import { TransactionItem } from '@/data/dummyData';
import CurrencySelector from '@/components/CurrencySelector';
import { Currency, CURRENCIES, getCurrencyByCode } from '@/constants/currencies';
import TypeSelector from '@/components/transaction/TypeSelector';
import AmountInput, { AmountInputRef } from '@/components/transaction/AmountInput';
import QuickAmountChips from '@/components/transaction/QuickAmountChips';
import CategoryPicker from '@/components/transaction/CategoryPicker';
import NoteInput from '@/components/transaction/NoteInput';
import SaveButton from '@/components/transaction/SaveButton';
import { Category, getDefaultCategory } from '@/constants/categories';
import { itemType, resolveCategory } from '@/constants/categoryVisuals';

type TxType = 'expense' | 'income';

function makeId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export default function AddTransactionScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ id?: string }>();
  const { transactions, addTransaction, updateTransaction } = useTransactions();

  const existing = useMemo<TransactionItem | undefined>(
    () => (params.id ? transactions.find((t) => t.id === params.id) : undefined),
    [params.id, transactions]
  );

  const [type, setType] = useState<TxType>(() => (existing ? itemType(existing) : 'expense'));
  const [amount, setAmount] = useState(() =>
    existing?.amountValue != null ? existing.amountValue.toLocaleString('id-ID') : ''
  );
  const [numericAmount, setNumericAmount] = useState(() => existing?.amountValue ?? 0);
  const [category, setCategory] = useState<Category>(() =>
    existing ? (resolveCategory(existing) ?? getDefaultCategory(itemType(existing))) : getDefaultCategory('expense')
  );
  const [note, setNote] = useState(() => existing?.note ?? '');
  const [selectedCurrency, setSelectedCurrency] = useState<Currency>(() =>
    getCurrencyByCode(existing?.currency) ?? CURRENCIES[0]
  );
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);

  const amountInputRef = useRef<AmountInputRef>(null);

  const isEditing = !!existing;

  const validateForm = useCallback((): boolean => {
    const newErrors: Record<string, string> = {};

    if (numericAmount <= 0) {
      newErrors.amount = 'Nominal harus lebih dari 0';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [numericAmount]);

  const handleAmountChange = useCallback(
    (text: string, value: number) => {
      setAmount(text);
      setNumericAmount(value);
      if (errors.amount) {
        setErrors((prev) => ({ ...prev, amount: '' }));
      }
    },
    [errors.amount]
  );

  const handleQuickAmount = useCallback(
    (value: number) => {
      handleAmountChange(value.toLocaleString('id-ID'), value);
    },
    [handleAmountChange]
  );

  const handleCategorySelect = useCallback((selectedCategory: Category) => {
    setCategory(selectedCategory);
  }, []);

  const handleTypeChange = useCallback(
    (newType: TxType) => {
      setType(newType);
      const newCategory = getDefaultCategory(newType);
      setCategory(newCategory);
      if (errors.amount) {
        setErrors((prev) => ({ ...prev, amount: '' }));
      }
    },
    [errors.amount]
  );

  const handleSave = useCallback(async () => {
    if (!validateForm()) {
      amountInputRef.current?.focus();
      return;
    }

    setIsSubmitting(true);

    try {
      const base = {
        name: note.trim() || category.label,
        category: category.label,
        icon: category.icon,
        type,
        amountValue: numericAmount,
        currency: selectedCurrency.code,
        categoryId: category.id,
        note: note.trim() || undefined,
        amount: `${type === 'expense' ? '-' : '+'}${selectedCurrency.symbol} ${numericAmount.toLocaleString('id-ID')}`,
      };

      if (existing) {
        await updateTransaction({
          ...existing,
          ...base,
        });
      } else {
        await addTransaction({
          ...base,
          id: makeId(),
          date: 'Hari ini',
          timestamp: Date.now(),
        });
      }

      router.back();
    } catch {
      Alert.alert('Gagal menyimpan', 'Transaksi tidak tersimpan. Coba lagi.');
    } finally {
      setIsSubmitting(false);
    }
  }, [validateForm, note, category, type, selectedCurrency, numericAmount, existing, addTransaction, updateTransaction, router]);

  const handleBack = useCallback(() => {
    Keyboard.dismiss();
    router.back();
  }, [router]);

  const handleCategoryPress = useCallback(() => {
    Keyboard.dismiss();
    setShowCategoryPicker(true);
  }, []);

  return (
    <View style={styles.root}>
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          className="flex-1"
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={handleBack}
              activeOpacity={0.7}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Iconify icon="ph:arrow-left" size={22} color={COLORS.textDark} />
            </TouchableOpacity>
            <Text style={styles.title}>{isEditing ? 'Edit Transaksi' : 'Tambah Transaksi'}</Text>
            <View style={styles.headerSpacer} />
          </View>

          {/* Type Selector */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Tipe Transaksi</Text>
            <TypeSelector value={type} onChange={handleTypeChange} />
          </View>

          {/* Amount Input */}
          <View style={styles.section}>
            <AmountInput
              ref={amountInputRef}
              type={type}
              currencySymbol={selectedCurrency.symbol}
              value={amount}
              onChangeText={handleAmountChange}
              error={errors.amount || null}
              label="Nominal"
            />
            <View style={styles.quickSection}>
              <QuickAmountChips
                type={type}
                currentValue={numericAmount}
                onSelect={handleQuickAmount}
              />
            </View>
          </View>

          {/* Currency Selector */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Mata Uang</Text>
            <CurrencySelector
              selectedCurrency={selectedCurrency}
              onSelect={setSelectedCurrency}
              style={styles.currencySelector}
            />
          </View>

          {/* Category Picker */}
          <View style={styles.section}>
            <View style={styles.categoryRow}>
              <Text style={styles.sectionLabel}>Kategori</Text>
              <TouchableOpacity
                style={styles.categoryButton}
                onPress={handleCategoryPress}
                activeOpacity={0.8}
              >
                <View style={styles.categoryButtonContent}>
                  <View style={styles.categoryIcon}>
                    <Iconify
                      icon={category.icon}
                      size={20}
                      color={type === 'expense' ? COLORS.red : COLORS.green}
                    />
                  </View>
                  <Text style={styles.categoryButtonLabel}>{category.label}</Text>
                  <Iconify icon="ph:caret-right-bold" size={16} color={COLORS.textMuted} />
                </View>
              </TouchableOpacity>
            </View>

            <CategoryPicker
              visible={showCategoryPicker}
              onClose={() => setShowCategoryPicker(false)}
              onSelect={handleCategorySelect}
              selectedCategoryId={category.id}
              type={type}
              title={`Pilih Kategori ${type === 'expense' ? 'Pengeluaran' : 'Pemasukan'}`}
            />
          </View>

          {/* Note Input */}
          <View style={styles.section}>
            <NoteInput
              value={note}
              onChangeText={setNote}
              placeholder="Tambahkan catatan (opsional)"
              maxLength={200}
              label="Catatan"
            />
          </View>

          {/* Bottom spacing for button */}
          <View style={styles.bottomSpacer} />
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Save Button - Fixed at bottom */}
      <View style={[styles.buttonContainer, { paddingBottom: insets.bottom + 24 }]}>
        <SaveButton
          onPress={handleSave}
          disabled={!numericAmount || numericAmount <= 0}
          loading={isSubmitting}
          title={isEditing ? 'Simpan Perubahan' : 'Simpan Transaksi'}
          variant="primary"
          fullWidth={true}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 0,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 0,
    marginBottom: 8,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    shadowColor: '#1A2E5A',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textDark,
    flex: 1,
    textAlign: 'center',
    marginRight: 40,
  },
  headerSpacer: {
    width: 40,
  },
  section: {
    marginBottom: 20,
  },
  sectionLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.textDark,
    marginBottom: 10,
    marginLeft: 2,
  },
  quickSection: {
    marginTop: 12,
  },
  currencySelector: {
    width: '100%',
  },
  categoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  categoryButton: {
    flex: 1,
    marginLeft: 12,
  },
  categoryButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  categoryIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F8F9FA',
  },
  categoryButtonLabel: {
    fontSize: 17,
    fontWeight: '500',
    color: COLORS.textDark,
    marginLeft: 12,
    flex: 1,
  },
  bottomSpacer: {
    height: 100,
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    paddingBottom: 24,
    paddingTop: 12,
    backgroundColor: COLORS.bg,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: -4 },
    elevation: 8,
  },
});