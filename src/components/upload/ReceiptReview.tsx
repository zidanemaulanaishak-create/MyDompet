import React from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Image } from 'expo-image';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Iconify } from 'react-native-iconify';
import { getThemeColors } from '@/constants/colors';
import { useTheme } from '@/context/theme-context';
import { monthName, numberForLocale, useI18n } from '@/i18n';
import { getCategoryById } from '@/constants/categories';

interface Props {
  imageUri: string;
  isPdf?: boolean;
  amount: number;
  merchant: string;
  date: string;
  categoryId: string;
  confidence: number;
  saving?: boolean;
  onConfirm: () => void;
  onEdit: () => void;
  onRetake: () => void;
}

function formatDate(iso: string, locale: 'id' | 'en'): string {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  if (!match) return iso;
  const year = Number(match[1]);
  const month = Number(match[2]) - 1;
  const day = Number(match[3]);
  return `${day} ${monthName(locale, month)} ${year}`;
}

export default function ReceiptReview({
  imageUri,
  isPdf = false,
  amount,
  merchant,
  date,
  categoryId,
  confidence,
  saving = false,
  onConfirm,
  onEdit,
  onRetake,
}: Props) {
  const insets = useSafeAreaInsets();
  const { isDark, accent } = useTheme();
  const palette = getThemeColors(isDark ? 'dark' : 'light', accent);
  const { t, locale } = useI18n();

  const lowConfidence = confidence < 0.7;
  const category = getCategoryById(categoryId, 'expense');
  const categoryLabel = category?.label ?? t('upload.otherCategory');
  const merchantLabel = merchant.trim() || t('upload.unknownMerchant');
  const confidencePercent = Math.round(Math.min(1, Math.max(0, confidence)) * 100);

  const primaryAction = lowConfidence ? onEdit : onConfirm;
  const secondaryAction = lowConfidence ? onConfirm : onEdit;

  return (
    <View style={styles.root}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
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

        <View style={styles.badgeRow}>
          <View style={[styles.badge, { backgroundColor: palette.chipBlue }]}>
            <Iconify icon="ph:sparkle-bold" size={14} color={palette.primary} />
            <Text style={[styles.badgeLabel, { color: palette.primary }]}>{t('upload.aiBadge')}</Text>
          </View>
          <Text style={[styles.confidence, { color: palette.textMuted }]}>
            {t('upload.confidenceLabel', { percent: confidencePercent })}
          </Text>
        </View>

        {lowConfidence ? (
          <View style={styles.warning}>
            <Iconify icon="ph:warning-circle-bold" size={18} color={palette.orange} />
            <Text style={[styles.warningText, { color: palette.textDark }]}>{t('upload.lowConfidence')}</Text>
          </View>
        ) : null}

        <View style={[styles.card, { backgroundColor: palette.card, borderColor: palette.border }]}>
          <Text style={[styles.amountCaption, { color: palette.textMuted }]}>{t('upload.amountLabel')}</Text>
          <Text style={[styles.amount, { color: palette.textDark }]}>
            Rp {numberForLocale(locale, amount)}
          </Text>

          <View style={[styles.divider, { backgroundColor: palette.divider }]} />

          <View style={styles.row}>
            <Text style={[styles.rowLabel, { color: palette.textMuted }]}>{t('upload.merchantLabel')}</Text>
            <Text style={[styles.rowValue, { color: palette.textDark }]} numberOfLines={1}>
              {merchantLabel}
            </Text>
          </View>
          <View style={styles.row}>
            <Text style={[styles.rowLabel, { color: palette.textMuted }]}>{t('upload.dateLabel')}</Text>
            <Text style={[styles.rowValue, { color: palette.textDark }]}>{formatDate(date, locale)}</Text>
          </View>
          <View style={styles.row}>
            <Text style={[styles.rowLabel, { color: palette.textMuted }]}>{t('common.category')}</Text>
            <Text style={[styles.rowValue, { color: palette.textDark }]} numberOfLines={1}>
              {categoryLabel}
            </Text>
          </View>
        </View>

        <Text style={[styles.hint, { color: palette.textMuted }]}>{t('upload.reviewHint')}</Text>
      </ScrollView>

      <View
        style={[
          styles.footer,
          { backgroundColor: palette.bg, borderColor: palette.border, paddingBottom: insets.bottom + 8 },
        ]}
      >
        <TouchableOpacity
          style={[styles.primaryButton, { backgroundColor: palette.primary }, saving && styles.disabled]}
          onPress={primaryAction}
          disabled={saving}
          activeOpacity={0.85}
        >
          {saving ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <>
              <Iconify
                icon={lowConfidence ? 'ph:pencil-simple-bold' : 'ph:check-bold'}
                size={18}
                color="#FFFFFF"
              />
              <Text style={styles.primaryLabel}>
                {lowConfidence ? t('upload.editData') : t('upload.confirmAndSave')}
              </Text>
            </>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.secondaryButton, { borderColor: palette.border, backgroundColor: palette.card }, saving && styles.disabled]}
          onPress={secondaryAction}
          disabled={saving}
          activeOpacity={0.85}
        >
          <Iconify
            icon={lowConfidence ? 'ph:check-bold' : 'ph:pencil-simple-bold'}
            size={18}
            color={palette.textDark}
          />
          <Text style={[styles.secondaryLabel, { color: palette.textDark }]}>
            {lowConfidence ? t('upload.confirmAndSave') : t('upload.editData')}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  scroll: { paddingBottom: 16 },
  previewWrap: { borderRadius: 16, overflow: 'hidden', marginBottom: 12 },
  preview: { width: '100%', height: 240 },
  pdfPreview: { width: '100%', height: 200, alignItems: 'center', justifyContent: 'center', gap: 10 },
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
  badgeRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  badge: { flexDirection: 'row', alignItems: 'center', gap: 6, borderRadius: 20, paddingHorizontal: 10, paddingVertical: 5 },
  badgeLabel: { fontSize: 13, fontWeight: '700' },
  confidence: { fontSize: 13, fontWeight: '600' },
  warning: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(255,150,29,0.12)',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  warningText: { flex: 1, fontSize: 14, fontWeight: '600', lineHeight: 20 },
  card: { borderWidth: 1, borderRadius: 16, padding: 16 },
  amountCaption: { fontSize: 14, fontWeight: '600', marginBottom: 4 },
  amount: { fontSize: 28, fontWeight: '800' },
  divider: { height: 1, marginVertical: 14 },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 7, gap: 12 },
  rowLabel: { fontSize: 15, fontWeight: '600' },
  rowValue: { flex: 1, textAlign: 'right', fontSize: 15, fontWeight: '700' },
  hint: { fontSize: 14, lineHeight: 20, marginTop: 14 },
  footer: { paddingTop: 12, gap: 10, borderTopWidth: 0 },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRadius: 16,
    paddingVertical: 16,
  },
  primaryLabel: { color: '#FFFFFF', fontSize: 16, fontWeight: '800' },
  secondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1.5,
    borderRadius: 16,
    paddingVertical: 14,
  },
  secondaryLabel: { fontSize: 16, fontWeight: '700' },
  disabled: { opacity: 0.5 },
});
