import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Iconify } from 'react-native-iconify';
import { useTheme } from '@/context/theme-context';
import { getThemeColors } from '@/constants/colors';
import { useI18n } from '@/i18n';

interface Props {
  visible: boolean;
  name: string;
  email: string;
  onClose: () => void;
  onSubmit: (name: string) => Promise<string | null>;
}

export default function EditProfileSheet({ visible, name, email, onClose, onSubmit }: Props) {
  const { isDark } = useTheme();
  const palette = getThemeColors(isDark ? 'dark' : 'light');
  const { t } = useI18n();
  const [draft, setDraft] = useState(name);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (visible) setDraft(name);
  }, [visible, name]);

  const handleSave = async () => {
    if (saving) return;
    setSaving(true);
    const error = await onSubmit(draft);
    setSaving(false);
    if (error) {
      Alert.alert(t('common.error'), error);
      return;
    }
    Alert.alert(t('common.success'), t('profile.nameSaved'));
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      {visible ? (
        <TouchableOpacity key="open" style={styles.overlay} onPress={onClose} activeOpacity={1}>
          <View style={[styles.sheet, { backgroundColor: palette.card }]}>
            <View style={[styles.handle, { backgroundColor: palette.track }]} />
            <View style={styles.header}>
              <Text style={[styles.title, { color: palette.textDark }]}>
                {t('profile.editProfileTitle')}
              </Text>
              <TouchableOpacity onPress={onClose} hitSlop={8}>
                <Iconify icon="ph:x-bold" size={22} color={palette.textMuted} />
              </TouchableOpacity>
            </View>

            <Text style={[styles.label, { color: palette.textDark }]}>{t('profile.name')}</Text>
            <TextInput
              style={[
                styles.input,
                {
                  borderColor: palette.border,
                  color: palette.textDark,
                  backgroundColor: palette.inputBg,
                },
              ]}
              placeholder={t('profile.namePlaceholder')}
              placeholderTextColor={palette.textMuted}
              value={draft}
              onChangeText={setDraft}
              autoCapitalize="words"
              returnKeyType="done"
            />

            <Text style={[styles.label, { color: palette.textDark }]}>{t('profile.emailLabel')}</Text>
            <View
              style={[
                styles.input,
                styles.emailBox,
                { borderColor: palette.border, backgroundColor: palette.inputBg },
              ]}
            >
              <Text style={[styles.emailText, { color: palette.textMuted }]}>{email}</Text>
            </View>

            <TouchableOpacity
              style={[styles.save, { backgroundColor: palette.primary }, saving && styles.saveDisabled]}              activeOpacity={0.85}
              onPress={handleSave}
              disabled={saving}
            >
              {saving ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <Text style={styles.saveLabel}>{t('profile.saveChanges')}</Text>
              )}
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      ) : null}
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(15,23,42,0.45)', justifyContent: 'flex-end' },
  sheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingBottom: 32,
  },
  handle: {
    alignSelf: 'center',
    width: 44,
    height: 5,
    borderRadius: 3,
    marginTop: 10,
    marginBottom: 14,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  title: { fontSize: 18, fontWeight: '700' },
  label: { fontSize: 14, fontWeight: '700', marginTop: 12, marginBottom: 8 },
  input: {
    borderWidth: 1.5,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
  },
  emailBox: { justifyContent: 'center' },
  emailText: { fontSize: 15 },
  save: {
    borderRadius: 16,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: 20,
  },
  saveDisabled: { opacity: 0.6 },
  saveLabel: { color: '#FFFFFF', fontSize: 15, fontWeight: '700' },
});