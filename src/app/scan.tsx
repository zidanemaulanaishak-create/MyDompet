import React, { useCallback, useRef, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import * as Haptics from 'expo-haptics';
import { Iconify } from 'react-native-iconify';
import ScanFrame from '@/components/scan/ScanFrame';
import ScanHelpSheet from '@/components/scan/ScanHelpSheet';

export default function ScanScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const cameraRef = useRef<CameraView>(null);
  const [permission, requestPermission] = useCameraPermissions();
  const [flash, setFlash] = useState(false);
  const [taking, setTaking] = useState(false);
  const [helpVisible, setHelpVisible] = useState(false);
  const [galleryBusy, setGalleryBusy] = useState(false);

  const handleBack = useCallback(() => {
    if (router.canGoBack()) router.back();
    else router.replace('/upload');
  }, [router]);

  const openGallery = useCallback(async () => {
    try {
      setGalleryBusy(true);
      const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!perm.granted) {
        Alert.alert('Izin galeri', 'Aktifkan izin galeri untuk memilih foto.');
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({ quality: 0.8 });
      if (result.canceled || !result.assets?.length) return;
      router.push({ pathname: '/upload', params: { scanUri: result.assets[0].uri } });
    } catch {
      Alert.alert('Gagal', 'Tidak bisa membuka galeri.');
    } finally {
      setGalleryBusy(false);
    }
  }, [router]);

  const takePhoto = useCallback(async () => {
    if (taking) return;
    try {
      setTaking(true);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
      const photo = await cameraRef.current?.takePictureAsync({ quality: 0.8 });
      if (!photo?.uri) return;
      router.push({ pathname: '/upload', params: { scanUri: photo.uri } });
    } catch {
      Alert.alert('Gagal', 'Tidak bisa mengambil foto.');
    } finally {
      setTaking(false);
    }
  }, [router, taking]);

  if (Platform.OS === 'web') {
    return (
      <View style={styles.webRoot}>
        <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
          <TouchableOpacity style={styles.circleBtn} onPress={handleBack} activeOpacity={0.7} accessibilityLabel="Kembali">
            <Iconify icon="ph:arrow-left-bold" size={20} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Scan Struk</Text>
          <View style={styles.circleBtn} />
        </View>
        <View style={styles.webBody}>
          <View style={styles.webIcon}>
            <Iconify icon="ph:image-bold" size={30} color="#38BDF8" />
          </View>
          <Text style={styles.webTitle}>Kamera tidak tersedia di browser</Text>
          <Text style={styles.webSub}>Pilih foto struk dari perangkat untuk melanjutkan.</Text>
          <TouchableOpacity style={styles.webButton} activeOpacity={0.85} onPress={openGallery} disabled={galleryBusy}>
            <Text style={styles.webButtonLabel}>Pilih dari Galeri / Upload Foto</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  if (!permission) {
    return <View style={styles.dark} />;
  }

  if (!permission.granted) {
    return (
      <View style={styles.darkCenter}>
        <Text style={styles.webTitle}>Izin kamera dibutuhkan</Text>
        <Text style={styles.webSub}>Aktifkan akses kamera untuk scan struk belanja.</Text>
        <TouchableOpacity style={styles.webButton} activeOpacity={0.85} onPress={requestPermission}>
          <Text style={styles.webButtonLabel}>Aktifkan Kamera</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.ghostButton} activeOpacity={0.7} onPress={handleBack}>
          <Text style={styles.ghostLabel}>Kembali</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <CameraView ref={cameraRef} style={styles.camera} facing="back" flash={flash ? 'on' : 'off'}>
        <View style={styles.dimTop} />
        <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
          <TouchableOpacity style={styles.circleBtn} onPress={handleBack} activeOpacity={0.7} accessibilityLabel="Kembali">
            <Iconify icon="ph:arrow-left-bold" size={20} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Scan Struk</Text>
          <TouchableOpacity style={styles.circleBtn} onPress={() => setHelpVisible(true)} activeOpacity={0.7} accessibilityLabel="Bantuan scan">
            <Iconify icon="ph:question-bold" size={18} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        <View style={styles.pillWrap}>
          <Text style={styles.pill}>Foto struk dan biarkan AI menganalisis transaksimu secara otomatis.</Text>
        </View>

        <ScanFrame />

        <View style={[styles.bottomBar, { paddingBottom: insets.bottom + 20 }]}>
          <View style={styles.sideAction}>
            <TouchableOpacity style={styles.roundBtn} onPress={openGallery} activeOpacity={0.7} disabled={galleryBusy} accessibilityLabel="Buka galeri">
              <Iconify icon="ph:image-bold" size={22} color="#FFFFFF" />
            </TouchableOpacity>
            <Text style={styles.sideLabel}>Galeri</Text>
          </View>

          <TouchableOpacity style={styles.shutterOuter} onPress={takePhoto} activeOpacity={0.8} disabled={taking} accessibilityLabel="Ambil foto">
            <View style={styles.shutterInner} />
          </TouchableOpacity>

          <View style={styles.sideAction}>
            <TouchableOpacity
              style={[styles.roundBtn, flash && styles.roundBtnActive]}
              onPress={() => setFlash((v) => !v)}
              activeOpacity={0.7}
              accessibilityLabel="Toggle flash"
            >
              <Iconify icon="ph:lightning-bold" size={22} color={flash ? '#38BDF8' : '#FFFFFF'} />
            </TouchableOpacity>
            <Text style={styles.sideLabel}>Flash</Text>
          </View>
        </View>
      </CameraView>

      <ScanHelpSheet visible={helpVisible} onClose={() => setHelpVisible(false)} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#000' },
  dark: { flex: 1, backgroundColor: '#000' },
  camera: { flex: 1 },
  dimTop: { position: 'absolute', top: 0, left: 0, right: 0, height: 220, backgroundColor: 'rgba(0,0,0,0.35)' },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingBottom: 8 },
  circleBtn: { width: 42, height: 42, borderRadius: 21, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.45)' },
  headerTitle: { flex: 1, textAlign: 'center', color: '#FFFFFF', fontSize: 17, fontWeight: '800' },
  pillWrap: { alignItems: 'center', paddingHorizontal: 32, marginTop: 8 },
  pill: { color: '#E2E8F0', fontSize: 18, lineHeight: 18, textAlign: 'center', backgroundColor: 'rgba(15,23,42,0.85)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)', borderRadius: 20, paddingHorizontal: 16, paddingVertical: 10, overflow: 'hidden' },
  bottomBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around', backgroundColor: '#0B0F19', paddingTop: 18, marginTop: 'auto' },
  sideAction: { alignItems: 'center', gap: 6, width: 80 },
  roundBtn: { width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,255,255,0.12)' },
  roundBtnActive: { backgroundColor: 'rgba(56,189,248,0.2)', borderWidth: 1, borderColor: '#38BDF8' },
  sideLabel: { color: '#CBD5E1', fontSize: 18, fontWeight: '600' },
  shutterOuter: { width: 78, height: 78, borderRadius: 39, borderWidth: 3, borderColor: '#38BDF8', alignItems: 'center', justifyContent: 'center' },
  shutterInner: { width: 60, height: 60, borderRadius: 30, backgroundColor: '#FFFFFF' },
  darkCenter: { flex: 1, backgroundColor: '#0B0F19', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32 },
  webRoot: { flex: 1, backgroundColor: '#0B0F19' },
  webBody: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32 },
  webIcon: { width: 76, height: 76, borderRadius: 38, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(56,189,248,0.15)', marginBottom: 18 },
  webTitle: { color: '#FFFFFF', fontSize: 17, fontWeight: '800', textAlign: 'center' },
  webSub: { color: '#94A3B8', fontSize: 17, textAlign: 'center', marginTop: 8, marginBottom: 20 },
  webButton: { backgroundColor: '#1A42BA', borderRadius: 14, paddingHorizontal: 20, paddingVertical: 14 },
  webButtonLabel: { color: '#FFFFFF', fontSize: 18, fontWeight: '800' },
  ghostButton: { marginTop: 12, padding: 10 },
  ghostLabel: { color: '#94A3B8', fontSize: 17, fontWeight: '700' },
});
