import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, TextInput, Alert, Image, Platform, ActivityIndicator } from 'react-native';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import * as ImagePicker from 'expo-image-picker';
import { Iconify } from 'react-native-iconify';
import { COLORS, getThemeColors } from '@/constants/colors';
import { useTheme } from '@/context/theme-context';
import { useI18n } from '@/i18n';
import type { FinancialGoal } from '@/data/goalsData';
import { formatDeadlineLabel, formatRupiah } from '@/utils/goals';

export interface GoalFormData {
  name: string;
  target: number;
  deadlineTs: number;
  imageUri?: string;
}

interface Props {
  visible: boolean;
  initial?: FinancialGoal | null;
  saving?: boolean;
  onClose: () => void;
  onSubmit: (data: GoalFormData) => void;
}

function parseNominal(raw: string): number {
  const digits = raw.replace(/[^0-9]/g, '');
  return digits ? parseInt(digits, 10) : 0;
}

function formatNominalInput(n: number): string {
  if (!n) return '';
  return n.toLocaleString('id-ID');
}

function defaultDeadline(): number {
  const d = new Date();
  d.setMonth(d.getMonth() + 6);
  return d.getTime();
}

export default function AddGoalSheet({ visible, initial, saving, onClose, onSubmit }: Props) {
  const { t } = useI18n();
  const { isDark } = useTheme();
  const palette = getThemeColors(isDark ? 'dark' : 'light');
  const [name, setName] = useState('');
  const [target, setTarget] = useState('');
  const [deadlineTs, setDeadlineTs] = useState<number>(() => defaultDeadline());
  const [showPicker, setShowPicker] = useState(false);
  const [imageUri, setImageUri] = useState<string | null>(null);

  // Reset form setiap sheet dibuka / target edit berganti (pola "adjust state
  // during render" dari React docs — bukan setState di dalam effect).
  const [formKey, setFormKey] = useState<string | null>(null);
  const nextKey = visible ? (initial?.id ?? 'new') : null;
  if (nextKey !== formKey) {
    setFormKey(nextKey);
    if (visible) {
      setName(initial?.name ?? '');
      setTarget(initial && initial.target ? formatNominalInput(initial.target) : '');
      setDeadlineTs(initial?.deadlineTs && initial.deadlineTs > 0 ? initial.deadlineTs : defaultDeadline());
      setImageUri(initial?.imageUri ?? null);
      setShowPicker(false);
    }
  }

  if (!visible) return null;

  const close = () => {
    if (saving) return;
    onClose();
  };

  const pickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert(t('goals.galleryPermission'), t('goals.galleryPermissionMsg'));
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

  const onPickerChange = (_event: DateTimePickerEvent, selected?: Date) => {
    if (Platform.OS === 'android') setShowPicker(false);
    if (selected) setDeadlineTs(selected.getTime());
  };

  const handleSave = () => {
    const nominal = parseNominal(target);
    if (name.trim().length < 3) {
      Alert.alert(t('goals.nameTooShort'), t('goals.nameTooShortMsg'));
      return;
    }
    if (nominal <= 0) {
      Alert.alert(t('goals.nominalInvalid'), t('goals.nominalInvalidMsg'));
      return;
    }
    if (deadlineTs < Date.now() - 86400000) {
      Alert.alert(t('goals.deadlineInvalid'), t('goals.deadlineInvalidMsg'));
      return;
    }
    onSubmit({
      name: name.trim(),
      target: nominal,
      deadlineTs,
      imageUri: imageUri ?? undefined,
    });
  };

  return (
    <Modal visible transparent animationType="slide" onRequestClose={close}>
      <TouchableOpacity style={styles.overlay} onPress={close} activeOpacity={1}>
        <View style={[styles.sheet, { backgroundColor: palette.card }]}>
          <View style={[styles.handle, { backgroundColor: palette.track }]} />
          <View style={styles.header}>
            <Text style={[styles.title, { color: palette.textDark }]}>
              {initial ? t('goals.editGoal') : t('goals.createNew')}
            </Text>
            <TouchableOpacity onPress={close} hitSlop={8}>
              <Iconify icon="ph:x-bold" size={22} color={palette.textMuted} />
            </TouchableOpacity>
          </View>

          <Text style={[styles.label, { color: palette.textDark }]}>{t('goals.nameLabel')}</Text>
          <TextInput
            style={[styles.input, { borderColor: palette.border, backgroundColor: palette.inputBg, color: palette.textDark }]}
            placeholder={t('goals.namePlaceholder')}
            placeholderTextColor={palette.textMuted}
            value={name}
            onChangeText={setName}
          />

          <Text style={[styles.label, { color: palette.textDark }]}>{t('goals.totalTargetLabel')}</Text>
          <TextInput
            style={[styles.input, { borderColor: palette.border, backgroundColor: palette.inputBg, color: palette.textDark }]}
            placeholder={t('goals.targetPlaceholder')}
            placeholderTextColor={palette.textMuted}
            value={target}
            onChangeText={(v) => {
              const n = parseNominal(v);
              setTarget(n ? formatNominalInput(n) : '');
            }}
            keyboardType="numeric"
          />
          {parseNominal(target) > 0 ? (
            <Text style={[styles.hint, { color: palette.textMuted }]}>{formatRupiah(parseNominal(target))}</Text>
          ) : null}

          <Text style={[styles.label, { color: palette.textDark }]}>{t('goals.deadline')}</Text>
          <TouchableOpacity
            style={[styles.input, styles.dateRow, { borderColor: palette.border, backgroundColor: palette.inputBg }]}
            activeOpacity={0.8}
            onPress={() => setShowPicker(true)}
          >
            <Iconify icon="ph:calendar-bold" size={20} color={palette.primary} />
            <Text style={[styles.dateLabel, { color: palette.textDark }]}>{formatDeadlineLabel(deadlineTs)}</Text>
            <Iconify icon="ph:caret-down-bold" size={16} color={palette.textMuted} />
          </TouchableOpacity>
          {showPicker || Platform.OS === 'ios' ? (
            <DateTimePicker
              value={new Date(deadlineTs)}
              mode="date"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              minimumDate={new Date()}
              onChange={onPickerChange}
            />
          ) : null}

          <Text style={[styles.label, { color: palette.textDark }]}>{t('goals.imageLabel')} ({t('common.optional')})</Text>
          <TouchableOpacity style={[styles.imagePicker, { borderColor: palette.border, backgroundColor: palette.inputBg }]} activeOpacity={0.85} onPress={pickImage}>
            {imageUri ? (
              <Image source={{ uri: imageUri }} style={styles.preview} />
            ) : (
              <View style={styles.previewPlaceholder}>
                <Iconify icon="ph:image-bold" size={28} color={palette.textMuted} />
                <Text style={[styles.previewHint, { color: palette.textMuted }]}>{t('goals.tapToPickImage')}</Text>
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
              <Text style={[styles.removeLabel, { color: palette.red }]}>{t('goals.removeImage')}</Text>
            </TouchableOpacity>
          ) : null}

          <TouchableOpacity style={styles.save} activeOpacity={0.85} onPress={handleSave} disabled={!!saving}>
            {saving ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.saveLabel}>{initial ? t('goals.saveChanges') : t('goals.saveGoal')}</Text>
            )}
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(15,23,42,0.45)', justifyContent: 'flex-end' },
  sheet: {
    borderTopLeftRadius: 24, borderTopRightRadius: 24,
    paddingHorizontal: 20, paddingBottom: 32, maxHeight: '92%',
  },
  handle: {
    alignSelf: 'center', width: 44, height: 5, borderRadius: 3,
    marginTop: 10, marginBottom: 14,
  },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  title: { fontSize: 18, fontWeight: '700' },
  label: { fontSize: 14, fontWeight: '700', marginTop: 12, marginBottom: 6 },
  input: {
    borderWidth: 1.5, borderRadius: 12,
    paddingHorizontal: 14, paddingVertical: 12, fontSize: 16,
  },
  hint: { fontSize: 13, fontWeight: '600', marginTop: 6 },
  dateRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  dateLabel: { flex: 1, fontSize: 16, fontWeight: '600' },
  imagePicker: {
    borderWidth: 1.5, borderRadius: 16,
    alignItems: 'center', justifyContent: 'center',
    height: 140,
  },
  preview: { width: '100%', height: 140, borderRadius: 16 },
  previewPlaceholder: { alignItems: 'center', gap: 6 },
  previewHint: { fontSize: 13, fontWeight: '600' },
  removeBtn: { alignSelf: 'flex-start', paddingTop: 8 },
  removeLabel: { fontSize: 13, fontWeight: '700' },
  save: {
    backgroundColor: COLORS.primary, borderRadius: 16,
    paddingVertical: 15, alignItems: 'center', marginTop: 20,
  },
  saveLabel: { color: '#FFFFFF', fontSize: 15, fontWeight: '700' },
});
