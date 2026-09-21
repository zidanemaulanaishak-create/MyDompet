import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Iconify } from 'react-native-iconify';
import { COLORS, getThemeColors } from '@/constants/colors';
import { useTheme } from '@/context/theme-context';

interface Props {
  onMenuPress: () => void;
  onNewChatPress: () => void;
  onOptionsPress: () => void;
}

export default function ChatHeader({ onMenuPress, onOptionsPress }: Props) {
  const { isDark } = useTheme();
  const palette = getThemeColors(isDark ? 'dark' : 'light');

  return (
    <View style={[styles.header, { backgroundColor: palette.card, borderBottomColor: isDark ? '#263550' : '#E8ECF3' }]}>
      <View style={styles.content}>
        <TouchableOpacity
          style={[styles.backButton, { backgroundColor: isDark ? '#1E293B' : '#F1F5F9' }]}
          onPress={onMenuPress}
          activeOpacity={0.7}
          accessibilityLabel="Kembali"
        >
          <Iconify icon="ph:arrow-left-bold" size={20} color={palette.textDark} />
        </TouchableOpacity>

        <View style={styles.brand}>
          <View style={styles.titles}>
            <Text style={[styles.title, { color: palette.textDark }]}>MyGpt</Text>
            <View style={styles.statusRow}>
              <View style={[styles.dot, { backgroundColor: COLORS.green }]} />
              <Text style={[styles.status, { color: palette.textMuted }]}>Online • Siap membantu</Text>
            </View>
          </View>
        </View>

        <TouchableOpacity
          style={[styles.optionsButton, { backgroundColor: isDark ? '#1E293B' : '#F1F5F9' }]}
          onPress={onOptionsPress}
          activeOpacity={0.7}
          accessibilityLabel="Opsi chat"
        >
          <Iconify icon="ph:dots-three-vertical-bold" size={19} color={palette.textDark} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { borderBottomWidth: 1, shadowColor: '#1A2E5A', shadowOpacity: 0.05, shadowOffset: { width: 0, height: 2 }, shadowRadius: 8, elevation: 2 },
  content: { width: '100%', maxWidth: 760, alignSelf: 'center', flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12 },
  backButton: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  brand: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 10, marginHorizontal: 10 },
  avatar: { width: 42, height: 42, borderRadius: 21, alignItems: 'center', justifyContent: 'center', shadowColor: COLORS.primary, shadowOpacity: 0.3, shadowOffset: { width: 0, height: 4 }, shadowRadius: 8, elevation: 4 },
  titles: { flex: 1 },
  title: { fontSize: 18, fontWeight: '800', letterSpacing: -0.2 },
  statusRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 2 },
  dot: { width: 7, height: 7, borderRadius: 4 },
  status: { fontSize: 18, fontWeight: '600' },
  optionsButton: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
});
