import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, TextInput, Alert, Image } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Iconify } from 'react-native-iconify';
import { COLORS } from '@/constants/colors';

interface Props {
  visible: boolean;
  onClose: () => void;
  onSubmit: (data: { name: string; target: number; deadline: string; imageUri?: string }) => void;
}

function parseNominal(raw: string): number {
  const digits = raw.replace(/[^0-9]/g, '');
  return digits ? parseInt(digits, 10) : 0;
}

export default function AddGoalSheet({ visible, onClose, onSubmit }: Props) {
  const [name, setName] = useState('');
  const [target, setTarget] = useState('');
  const [deadline, setDeadline] = useState('');
  const [imageUri, setImageUri] = useState<string | null>(null);

  if (!visible) return null;

  const reset = () => {
    setName('');
    setTarget('');
    setDeadline('');
    setImageUri(null);
  };

  const close = () => {
    reset();
    onClose();
  };

  const pickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Izin galeri', 'Aktifkan izin galeri untuk memilih gambar target.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled && result.assets?.length) setImageUri(result.assets[0].uri);
  };

  const handleSave = () => {
    const nominal = parseNominal(target);
    if (name.trim().length < 3) {
      Alert.alert('Nama kurang lengkap', 'Isi nama target minimal 3 karakter.');
      return;
    }
    if (nominal <= 0) {
      Alert.alert('Nominal invalid', 'Isi total target dengan angka lebih dari 0.');
      return;
    }
    onSubmit({
      name: name.trim(),
      target: nominal,
      deadline: deadline.trim() || 'Des 2027',
      imageUri: imageUri ?? undefined,
    });
    reset();
  };

  return (
    <Modal visible transparent animationType="slide" onRequestClose={close}>
      <TouchableOpacity style={styles.overlay} onPress={close} activeOpacity={1}>
        <View style={styles.sheet}>
          <View style={styles.handle} />
          <View style={styles.header}>
            <Text style={styles.title}>Buat Target Baru</Text>
            <TouchableOpacity onPress={close} hitSlop={8}>
              <Iconify icon="ph:x-bold" size={22} color={COLORS.textMuted} />
            </TouchableOpacity>
          </View>

          <Text style={styles.label}>Nama Target</Text>
          <TextInput
            style={styles.input}
            placeholder="cth: Dana Darurat 6 Bulan"
            placeholderTextColor={COLORS.textMuted}
            value={name}
            onChangeText={setName}
          />

          <Text style={styles.label}>Total Target (Rp)</Text>
          <TextInput
            style={styles.input}
            placeholder="cth: 10000000"
            placeholderTextColor={COLORS.textMuted}
            value={target}
            onChangeText={setTarget}
            keyboardType="numeric"
          />

          <Text style={styles.label}>Deadline</Text>
          <TextInput
            style={styles.input}
            placeholder="cth: Des 2027"
            placeholderTextColor={COLORS.textMuted}
            value={deadline}
            onChangeText={setDeadline}
          />

          <Text style={styles.label}>Gambar Target (opsional)</Text>
          <TouchableOpacity style={styles.imagePicker} activeOpacity={0.85} onPress={pickImage}>
            {imageUri ? (
              <Image source={{ uri: imageUri }} style={styles.preview} />
            ) : (
              <View style={styles.previewPlaceholder}>
                <Iconify icon="ph:image-bold" size={28} color={COLORS.textMuted} />
                <Text style={styles.previewHint}>Tap untuk pilih gambar</Text>
              </View>
            )}
          </TouchableOpacity>
          {imageUri ? (
            <TouchableOpacity
              style={styles.removeBtn}
              onPress={() => setImageUri(null)}
              activeOpacity={0.8}
              hitSlop={8}
            >
              <Text style={styles.removeLabel}>Hapus gambar</Text>
            </TouchableOpacity>
          ) : null}

          <TouchableOpacity style={styles.save} activeOpacity={0.85} onPress={handleSave}>
            <Text style={styles.saveLabel}>Simpan Target</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(15,23,42,0.45)', justifyContent: 'flex-end' },
  sheet: {
    backgroundColor: '#FFFFFF', borderTopLeftRadius: 24, borderTopRightRadius: 24,
    paddingHorizontal: 20, paddingBottom: 32,
  },
  handle: {
    alignSelf: 'center', width: 44, height: 5, borderRadius: 3,
    backgroundColor: '#D9D9D9', marginTop: 10, marginBottom: 14,
  },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  title: { fontSize: 18, fontWeight: '700', color: COLORS.textDark },
  label: { fontSize: 14, fontWeight: '700', color: COLORS.textDark, marginTop: 12, marginBottom: 6 },
  input: {
    borderWidth: 1.5, borderColor: '#E2E8F0', borderRadius: 12,
    paddingHorizontal: 14, paddingVertical: 12, fontSize: 16, color: COLORS.textDark,
    backgroundColor: '#F8F9FA',
  },
  imagePicker: {
    borderWidth: 1.5, borderColor: '#E2E8F0', borderRadius: 16,
    backgroundColor: '#F8F9FA', alignItems: 'center', justifyContent: 'center',
    height: 140,
  },
  preview: { width: '100%', height: 140, borderRadius: 16 },
  previewPlaceholder: { alignItems: 'center', gap: 6 },
  previewHint: { fontSize: 13, fontWeight: '600', color: COLORS.textMuted },
  removeBtn: { alignSelf: 'flex-start', paddingTop: 8 },
  removeLabel: { fontSize: 13, fontWeight: '700', color: COLORS.red },
  save: {
    backgroundColor: COLORS.primary, borderRadius: 16,
    paddingVertical: 15, alignItems: 'center', marginTop: 20,
  },
  saveLabel: { color: '#FFFFFF', fontSize: 15, fontWeight: '700' },
});
