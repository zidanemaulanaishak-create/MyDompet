import React, { useCallback, useState } from 'react';
import { Alert, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useI18n, monthName, numberForLocale } from '@/i18n';
import { useTransactions } from '@/context/transaction-context';
import { TransactionItem } from '@/data/dummyData';
import { getCategoryById, getDefaultCategory } from '@/constants/categories';
import type { ReceiptOcrResult } from '@/services/receiptOcr';
import ReceiptReview from '@/components/upload/ReceiptReview';
import ReceiptForm, { ReceiptDraft } from '@/components/upload/ReceiptForm';

interface Props {
  imageUri: string;
  isPdf?: boolean;
  initial?: ReceiptOcrResult | null;
  onRetake: () => void;
}

function isoToTimestamp(iso?: string): number {
  if (!iso) return Date.now();
  const parsed = Date.parse(`${iso}T00:00:00`);
  return Number.isFinite(parsed) ? parsed : Date.now();
}

export default function ScanPreview({ imageUri, isPdf = false, initial = null, onRetake }: Props) {
  const router = useRouter();
  const { t, locale } = useI18n();
  const { addTransaction } = useTransactions();
  const [saving, setSaving] = useState(false);

  const hasReviewData = !!initial && initial.amount > 0;
  const [mode, setMode] = useState<'review' | 'edit'>(hasReviewData ? 'review' : 'edit');

  const save = useCallback(
    async (draft: ReceiptDraft) => {
      if (saving || draft.amount <= 0) return;
      setSaving(true);
      try {
        const date = new Date(draft.dateTs);
        const note = draft.note.trim();
        const tx: TransactionItem = {
          id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
          name: draft.merchant.trim() || note || draft.category.label,
          category: draft.category.label,
          date: `${date.getDate()} ${monthName(locale, date.getMonth())}`,
          amount: `-Rp ${numberForLocale(locale, draft.amount)}`,
          icon: draft.category.icon,
          type: 'expense',
          amountValue: draft.amount,
          currency: 'IDR',
          categoryId: draft.category.id,
          note: note || undefined,
          timestamp: draft.dateTs,
        };
        await addTransaction(tx);
        router.replace('/home');
      } catch {
        Alert.alert(t('upload.saveFailedTitle'), t('upload.saveFailedMessage'));
      } finally {
        setSaving(false);
      }
    },
    [addTransaction, router, saving, t, locale]
  );

  const handleConfirm = useCallback(() => {
    if (!initial || initial.amount <= 0) return;
    const category = getCategoryById(initial.categoryId, 'expense') ?? getDefaultCategory('expense');
    save({
      amount: initial.amount,
      merchant: initial.merchant,
      category,
      note: '',
      dateTs: isoToTimestamp(initial.date),
    });
  }, [initial, save]);

  if (mode === 'review' && initial && hasReviewData) {
    return (
      <View style={styles.root}>
        <ReceiptReview
          imageUri={imageUri}
          isPdf={isPdf}
          amount={initial.amount}
          merchant={initial.merchant}
          date={initial.date}
          categoryId={initial.categoryId}
          confidence={initial.confidence}
          saving={saving}
          onConfirm={handleConfirm}
          onEdit={() => setMode('edit')}
          onRetake={onRetake}
        />
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <ReceiptForm
        imageUri={imageUri}
        isPdf={isPdf}
        initialAmount={initial && initial.amount > 0 ? String(initial.amount) : ''}
        initialMerchant={initial?.merchant ?? ''}
        initialCategoryId={initial?.categoryId}
        initialDateIso={initial?.date}
        lowConfidence={!!initial && initial.confidence < 0.7}
        saving={saving}
        onSave={save}
        onRetake={onRetake}
        onBackToReview={hasReviewData ? () => setMode('review') : undefined}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
});
