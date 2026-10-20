import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, Platform } from 'react-native';
import { Iconify } from 'react-native-iconify';
import { getThemeColors } from '@/constants/colors';
import { useTheme } from '@/context/theme-context';
import { useI18n } from '@/i18n';

interface Props {
  visible: boolean;
  onClose: () => void;
}

const TIPS = [
  { icon: 'ph:lightbulb-bold', text: 'scan.tip1' },
  { icon: 'ph:receipt', text: 'scan.tip2' },
  { icon: 'ph:eye-slash', text: 'scan.tip3' },
  { icon: 'ph:check-circle', text: 'scan.tip4' },
];

export default function ScanHelpSheet({ visible, onClose }: Props) {
  const { isDark } = useTheme();
  const { t } = useI18n();
  const palette = getThemeColors(isDark ? 'dark' : 'light');

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <TouchableOpacity style={styles.dismiss} activeOpacity={1} onPress={onClose} accessibilityLabel={t('common.close')} />
        <View style={[styles.sheet, { backgroundColor: palette.card }]}>
          <View style={[styles.handle, { backgroundColor: palette.border }]} />
          <Text style={[styles.title, { color: palette.textDark }]}>{t('scan.helpTitle')}</Text>
          {TIPS.map((tip, i) => (
            <View key={i} style={styles.tipRow}>
              <View style={[styles.tipIcon, { backgroundColor: isDark ? '#1C2942' : '#EEF2F7' }]}>
                <Iconify icon={tip.icon} size={17} color={palette.primary} />
              </View>
              <Text style={[styles.tipText, { color: palette.textMuted }]}>{t(tip.text)}</Text>
            </View>
          ))}
          <TouchableOpacity style={[styles.button, { backgroundColor: palette.primary }]} activeOpacity={0.85} onPress={onClose}>
            <Text style={styles.buttonLabel}>{t('scan.helpCta')}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(2,6,23,0.6)' },
  dismiss: { flex: 1 },
  sheet: { borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingHorizontal: 20, paddingTop: 10, paddingBottom: Platform.OS === 'ios' ? 30 : 18 },
  handle: { width: 40, height: 4, borderRadius: 2, alignSelf: 'center', marginBottom: 14 },
  title: { fontSize: 18, fontWeight: '800', marginBottom: 14 },
  tipRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 },
  tipIcon: { width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center' },
  tipText: { flex: 1, fontSize: 17, lineHeight: 19 },
  button: { borderRadius: 14, paddingVertical: 14, alignItems: 'center', marginTop: 6 },
  buttonLabel: { color: '#FFFFFF', fontSize: 18, fontWeight: '800' },
});
