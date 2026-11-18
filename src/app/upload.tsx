import React, { useCallback, useEffect, useRef, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import { Iconify } from 'react-native-iconify';
import { getThemeColors } from '@/constants/colors';
import { useTheme } from '@/context/theme-context';
import { useI18n } from '@/i18n';
import UploadOptionCard from '@/components/upload/UploadOptionCard';
import ScanPreview from '@/components/upload/ScanPreview';
import {
  ReceiptOcrError,
  ReceiptOcrErrorCode,
  ReceiptOcrResult,
  recognizeReceipt,
} from '@/services/receiptOcr';

type Stage = 'idle' | 'analyzing' | 'ready' | 'error' | 'manual';

function isPdfUri(uri: string | null, mimeType?: string): boolean {
  if (mimeType === 'application/pdf') return true;
  return !!uri && /\.pdf(?:[?#]|$)/i.test(uri);
}

function errorMessageKey(code: ReceiptOcrErrorCode | null): string {
  switch (code) {
    case 'RATE_LIMIT':
      return 'upload.ocrRateLimit';
    case 'NO_KEY':
      return 'upload.ocrNoKey';
    case 'NOT_RECEIPT':
      return 'upload.ocrNotReceipt';
    case 'FILE_TOO_LARGE':
      return 'upload.ocrFileTooLarge';
    case 'BAD_INPUT':
    case 'UNSUPPORTED':
      return 'upload.ocrUnsupported';
    default:
      return 'upload.ocrFailedMessage';
  }
}

export default function UploadScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ scanUri?: string }>();
  const { isDark, accent } = useTheme();
  const palette = getThemeColors(isDark ? 'dark' : 'light', accent);
  const { t } = useI18n();
  const [previewUri, setPreviewUri] = useState<string | null>(null);
  const [previewMime, setPreviewMime] = useState<string | undefined>(undefined);
  const [ocr, setOcr] = useState<ReceiptOcrResult | null>(null);
  const [stage, setStage] = useState<Stage>('idle');
  const [errorCode, setErrorCode] = useState<ReceiptOcrErrorCode | null>(null);
  const [busy, setBusy] = useState(false);
  const handledUri = useRef<string | null>(null);
  const requestRef = useRef(0);

  const resetPreview = useCallback(() => {
    requestRef.current += 1;
    setPreviewUri(null);
    setPreviewMime(undefined);
    setOcr(null);
    setErrorCode(null);
    setStage('idle');
  }, []);

  const applyPreview = useCallback(async (uri: string, mimeType?: string) => {
    const requestId = requestRef.current + 1;
    requestRef.current = requestId;

    setPreviewUri(uri);
    setPreviewMime(mimeType);
    setOcr(null);
    setErrorCode(null);
    setStage('analyzing');

    try {
      const result = await recognizeReceipt(uri, mimeType);
      if (requestRef.current !== requestId) return;
      setOcr(result);
      setStage('ready');
    } catch (error) {
      if (requestRef.current !== requestId) return;
      setErrorCode(error instanceof ReceiptOcrError ? error.code : 'API');
      setStage('error');
    }
  }, []);

  useEffect(() => {
    if (params.scanUri && typeof params.scanUri === 'string' && handledUri.current !== params.scanUri) {
      handledUri.current = params.scanUri;
      void applyPreview(params.scanUri);
      router.setParams({ scanUri: '' });
    }
  }, [params.scanUri, applyPreview, router]);

  const handleBack = useCallback(() => {
    if (previewUri) {
      resetPreview();
      return;
    }
    if (router.canGoBack()) router.back();
    else router.replace('/home');
  }, [router, previewUri, resetPreview]);

  const pickDocument = useCallback(async () => {
    try {
      setBusy(true);
      const result = await DocumentPicker.getDocumentAsync({ type: ['application/pdf', 'image/*'], copyToCacheDirectory: true });
      if (result.canceled || !result.assets?.length) return;
      await applyPreview(result.assets[0].uri, result.assets[0].mimeType);
    } catch {
      Alert.alert(t('upload.errorDefaultTitle'), t('upload.errorOpenDoc'));
    } finally {
      setBusy(false);
    }
  }, [applyPreview, t]);

  const scanReceipt = useCallback(() => {
    router.push('/scan');
  }, [router]);

  const pickGallery = useCallback(async () => {
    try {
      setBusy(true);
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        Alert.alert(t('upload.permissionTitle'), t('upload.permissionMessage'));
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({ quality: 0.8 });
      if (result.canceled || !result.assets?.length) return;
      await applyPreview(result.assets[0].uri, result.assets[0].mimeType);
    } catch {
      Alert.alert(t('upload.errorDefaultTitle'), t('upload.errorOpenGallery'));
    } finally {
      setBusy(false);
    }
  }, [applyPreview, t]);

  const isPdf = isPdfUri(previewUri, previewMime);

  return (
    <View style={[styles.root, { backgroundColor: palette.primary }]}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack} activeOpacity={0.7} accessibilityLabel={t('common.back')}>
          <Iconify icon="ph:arrow-left-bold" size={22} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.title}>{previewUri ? t('upload.scanResult') : t('upload.uploadTitle')}</Text>
        <View style={styles.headerSpacer} />
      </View>

      <View style={[styles.sheet, { backgroundColor: palette.bg }]}>
        {previewUri ? (
          stage === 'analyzing' ? (
            <View style={styles.analyzing}>
              <ActivityIndicator color={palette.primary} size="large" />
              <Text style={[styles.analyzingText, { color: palette.textMuted }]}>{t('upload.analyzing')}</Text>
            </View>
          ) : stage === 'error' ? (
            <View style={styles.errorState}>
              <View style={[styles.errorIcon, { backgroundColor: palette.chipBlue }]}>
                <Iconify icon="ph:warning-circle-bold" size={34} color={palette.orange} />
              </View>
              <Text style={[styles.errorTitle, { color: palette.textDark }]}>{t('upload.ocrFailedTitle')}</Text>
              <Text style={[styles.errorMessage, { color: palette.textMuted }]}>{t(errorMessageKey(errorCode))}</Text>

              <TouchableOpacity
                style={[styles.primaryButton, { backgroundColor: palette.primary }]}
                activeOpacity={0.85}
                onPress={() => void applyPreview(previewUri, previewMime)}
              >
                <Text style={styles.primaryLabel}>{t('upload.ocrRetry')}</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.secondaryButton, { borderColor: palette.border, backgroundColor: palette.card }]}
                activeOpacity={0.85}
                onPress={() => {
                  setOcr(null);
                  setErrorCode(null);
                  setStage('manual');
                }}
              >
                <Text style={[styles.secondaryLabel, { color: palette.textDark }]}>{t('upload.ocrFillManual')}</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.ghostButton} activeOpacity={0.7} onPress={resetPreview}>
                <Text style={[styles.ghostLabel, { color: palette.textMuted }]}>{t('upload.retake')}</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <ScanPreview
              imageUri={previewUri}
              isPdf={isPdf}
              initial={stage === 'ready' ? ocr : null}
              onRetake={resetPreview}
            />
          )
        ) : (
          <ScrollView contentContainerStyle={styles.list} showsVerticalScrollIndicator={false}>
            <UploadOptionCard icon="ph:file-text-bold" title={t('upload.docOption')} subtitle={t('upload.docOptionSub')} onPress={pickDocument} />
            <UploadOptionCard icon="ph:scan-bold" title={t('scan.title')} subtitle={t('upload.scanOptionSub')} onPress={scanReceipt} />
            <UploadOptionCard icon="ph:image-bold" title={t('upload.gallery')} subtitle={t('upload.galleryOptionSub')} onPress={pickGallery} />
            {busy ? (
              <View style={styles.loading}>
                <ActivityIndicator color={palette.primary} />
              </View>
            ) : null}
          </ScrollView>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingTop: 16, paddingBottom: 28 },
  backButton: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  title: { flex: 1, textAlign: 'center', color: '#FFFFFF', fontSize: 17, fontWeight: '800', marginRight: 40 },
  headerSpacer: { width: 0 },
  sheet: { flex: 1, borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingTop: 20, paddingHorizontal: 20 },
  list: { gap: 14, paddingBottom: 32 },
  loading: { alignItems: 'center', paddingTop: 12 },
  analyzing: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12, paddingBottom: 80 },
  analyzingText: { fontSize: 18, fontWeight: '600' },
  errorState: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingBottom: 60, paddingHorizontal: 8 },
  errorIcon: { width: 72, height: 72, borderRadius: 36, alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  errorTitle: { fontSize: 18, fontWeight: '800', textAlign: 'center' },
  errorMessage: { fontSize: 15, lineHeight: 21, textAlign: 'center', marginTop: 8, marginBottom: 20 },
  primaryButton: { width: '100%', borderRadius: 14, paddingVertical: 15, alignItems: 'center' },
  primaryLabel: { color: '#FFFFFF', fontSize: 16, fontWeight: '800' },
  secondaryButton: { width: '100%', borderWidth: 1.5, borderRadius: 14, paddingVertical: 14, alignItems: 'center', marginTop: 10 },
  secondaryLabel: { fontSize: 16, fontWeight: '700' },
  ghostButton: { marginTop: 12, padding: 10 },
  ghostLabel: { fontSize: 15, fontWeight: '700' },
});
