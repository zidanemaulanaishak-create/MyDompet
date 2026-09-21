import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, Platform } from 'react-native';
import { Iconify } from 'react-native-iconify';

interface Props {
  visible: boolean;
  onClose: () => void;
}

const TIPS = [
  { icon: 'ph:lightbulb-bold', text: 'Pastikan pencahayaan cukup dan terang.' },
  { icon: 'ph:receipt', text: 'Ratakan struk di permukaan datar.' },
  { icon: 'ph:eye-slash', text: 'Hindari bayangan tangan di atas struk.' },
  { icon: 'ph:check-circle', text: 'Pastikan angka total terlihat jelas.' },
];

export default function ScanHelpSheet({ visible, onClose }: Props) {
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <TouchableOpacity style={styles.dismiss} activeOpacity={1} onPress={onClose} accessibilityLabel="Tutup" />
        <View style={styles.sheet}>
          <View style={styles.handle} />
          <Text style={styles.title}>Cara scan yang benar</Text>
          {TIPS.map((tip, i) => (
            <View key={i} style={styles.tipRow}>
              <View style={styles.tipIcon}>
                <Iconify icon={tip.icon} size={17} color="#1A42BA" />
              </View>
              <Text style={styles.tipText}>{tip.text}</Text>
            </View>
          ))}
          <TouchableOpacity style={styles.button} activeOpacity={0.85} onPress={onClose}>
            <Text style={styles.buttonLabel}>Mengerti, mulai scan</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(2,6,23,0.6)' },
  dismiss: { flex: 1 },
  sheet: { backgroundColor: '#FFFFFF', borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingHorizontal: 20, paddingTop: 10, paddingBottom: Platform.OS === 'ios' ? 30 : 18 },
  handle: { width: 40, height: 4, borderRadius: 2, backgroundColor: '#E2E8F0', alignSelf: 'center', marginBottom: 14 },
  title: { fontSize: 18, fontWeight: '800', color: '#0F172A', marginBottom: 14 },
  tipRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 },
  tipIcon: { width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center', backgroundColor: '#EEF2F7' },
  tipText: { flex: 1, fontSize: 17, color: '#334155', lineHeight: 19 },
  button: { backgroundColor: '#1A42BA', borderRadius: 14, paddingVertical: 14, alignItems: 'center', marginTop: 6 },
  buttonLabel: { color: '#FFFFFF', fontSize: 18, fontWeight: '800' },
});
