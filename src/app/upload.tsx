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
import { mockOcrFromUri, MockOcrResult } from '@/utils/mockOcr';

export default function UploadScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ scanUri?: string }>();
  const { isDark } = useTheme();
  const palette = getThemeColors(isDark ? 'dark' : 'light');
  const { t } = useI18n();
  const [previewUri, setPreviewUri] = useState<string | null>(null);
  const [ocr, setOcr] = useState<MockOcrResult | null>(null);
  const [busy, setBusy] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const handledUri = useRef<string | null>(null);

  const applyPreview = useCallback((uri: string) => {
    setPreviewUri(uri);
    setAnalyzing(true);
    setTimeout(() => {
      setOcr(mockOcrFromUri());
      setAnalyzing(false);
    }, 800);
  }, []);

  useEffect(() => {
    if (params.scanUri && typeof params.scanUri === 'string' && handledUri.current !== params.scanUri) {
      handledUri.current = params.scanUri;
      queueMicrotask(() => {
        applyPreview(params.scanUri as string);
        router.setParams({ scanUri: undefined });
      });
    }
  }, [params.scanUri, applyPreview, router]);

  const handleBack = useCallback(() => {
    if (previewUri) {
      setPreviewUri(null);
      setOcr(null);
      return;
    }
    if (router.canGoBack()) router.back();
    else router.replace('/home');
  }, [router, previewUri]);

  const pickDocument = useCallback(async () => {
    try {
      setBusy(true);
      const result = await DocumentPicker.getDocumentAsync({ type: ['application/pdf', 'image/*'], copyToCacheDirectory: true });
      if (result.canceled || !result.assets?.length) return;
      applyPreview(result.assets[0].uri);
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
      applyPreview(result.assets[0].uri);
    } catch {
      Alert.alert(t('upload.errorDefaultTitle'), t('upload.errorOpenGallery'));
    } finally {
      setBusy(false);
    }
  }, [applyPreview, t]);

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
          analyzing || !ocr ? (
            <View style={styles.analyzing}>
              <ActivityIndicator color={palette.primary} size="large" />
              <Text style={[styles.analyzingText, { color: palette.textMuted }]}>{t('upload.analyzing')}</Text>
            </View>
          ) : (
            <ScanPreview
              imageUri={previewUri}
              onRetake={() => { setPreviewUri(null); setOcr(null); }}
              initialAmount={String(ocr.amount)}
              initialMerchant={ocr.merchant}
              initialDateLabel={ocr.dateLabel}
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
});
