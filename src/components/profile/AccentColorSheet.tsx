import React from 'react';
import { Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Iconify } from 'react-native-iconify';
import AnimatedSheetBackdrop from '@/components/ui/AnimatedSheetBackdrop';
import { ACCENT_PRESETS, getThemeColors, type AccentId } from '@/constants/colors';
import { useTheme } from '@/context/theme-context';
import { useI18n } from '@/i18n';

interface Props {
  visible: boolean;
  onClose: () => void;
}

export default function AccentColorSheet({ visible, onClose }: Props) {
  const { isDark, accent, setAccent } = useTheme();
  const palette = getThemeColors(isDark ? 'dark' : 'light', accent);
  const { t } = useI18n();

  const handleSelect = (id: AccentId) => {
    void setAccent(id);
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <AnimatedSheetBackdrop style={styles.overlay} onPress={onClose}>
        <View style={[styles.sheet, { backgroundColor: palette.card }]}>
          <View style={[styles.handle, { backgroundColor: isDark ? palette.divider : '#E2E8F0' }]} />
          <View style={styles.header}>
            <Text style={[styles.title, { color: palette.textDark }]}>
              {t('profile.accentSheetTitle')}
            </Text>
            <TouchableOpacity onPress={onClose} hitSlop={8}>
              <Iconify icon="ph:x-bold" size={22} color={palette.textMuted} />
            </TouchableOpacity>
          </View>

          <View style={styles.grid}>
            {ACCENT_PRESETS.map((preset) => {
              const active = preset.id === accent;
              const swatch = isDark ? preset.dark.primary : preset.light.primary;
              return (
                <TouchableOpacity
                  key={preset.id}
                  activeOpacity={0.8}
                  onPress={() => handleSelect(preset.id)}
                  style={[
                    styles.option,
                    {
                      borderColor: active ? swatch : isDark ? palette.divider : '#E2E8F0',
                      backgroundColor: isDark ? palette.bg : '#F8FAFC',
                    },
                  ]}
                >
                  <View style={[styles.swatch, { backgroundColor: swatch }]}>
                    {active ? <Iconify icon="ph:check-bold" size={16} color="#FFFFFF" /> : null}
                  </View>
                  <Text style={[styles.label, { color: active ? swatch : palette.textDark }]}>
                    {t(preset.labelKey)}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      </AnimatedSheetBackdrop>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(2,8,23,0.5)',
  },
  sheet: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 32,
  },
  handle: {
    width: 40,
    height: 5,
    borderRadius: 3,
    alignSelf: 'center',
    marginBottom: 14,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  option: {
    width: '30%',
    flexGrow: 1,
    alignItems: 'center',
    paddingVertical: 14,
    borderRadius: 16,
    borderWidth: 1.5,
    gap: 8,
  },
  swatch: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontSize: 14,
    fontWeight: '700',
  },
});
