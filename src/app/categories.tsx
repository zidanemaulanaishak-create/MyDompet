import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Iconify } from 'react-native-iconify';
import { getThemeColors } from '@/constants/colors';
import { getPastelBg } from '@/constants/categoryVisuals';
import type { Category } from '@/constants/categories';
import { useCategories } from '@/context/categories-context';
import { useTheme } from '@/context/theme-context';
import { CATEGORY_ERRORS } from '@/services/categories';
import { useI18n } from '@/i18n';

type CategoryType = 'expense' | 'income';

export default function CategoriesScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { t } = useI18n();
  const { isDark, accent } = useTheme();
  const palette = getThemeColors(isDark ? 'dark' : 'light', accent);
  const { getCategoriesForType, isLoading, createCategory, updateCategory, deleteCategory } =
    useCategories();

  const [tab, setTab] = useState<CategoryType>('expense');
  const [formVisible, setFormVisible] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [formLabel, setFormLabel] = useState('');
  const [saving, setSaving] = useState(false);

  const items = getCategoriesForType(tab).filter((category) => category.custom);

  const handleBack = useCallback(() => {
    if (router.canGoBack()) router.back();
    else router.replace('/profile');
  }, [router]);

  const openCreate = useCallback(() => {
    setEditing(null);
    setFormLabel('');
    setFormVisible(true);
  }, []);

  const openEdit = useCallback((category: Category) => {
    setEditing(category);
    setFormLabel(category.label);
    setFormVisible(true);
  }, []);

  const closeForm = useCallback(() => {
    setFormVisible(false);
    setEditing(null);
    setFormLabel('');
  }, []);

  const mapSaveError = useCallback(
    (error: unknown) => {
      const code = error instanceof Error ? error.message : '';
      return code === CATEGORY_ERRORS.EXISTS ? t('categories.exists') : t('categories.failed');
    },
    [t],
  );

  const handleSave = useCallback(async () => {
    const label = formLabel.trim();
    if (!label) {
      Alert.alert(t('categories.title'), t('categories.required'));
      return;
    }

    setSaving(true);
    try {
      if (editing) await updateCategory(editing, label);
      else await createCategory(label, tab);
      closeForm();
    } catch (error) {
      Alert.alert(t('categories.title'), mapSaveError(error));
    } finally {
      setSaving(false);
    }
  }, [closeForm, createCategory, editing, formLabel, mapSaveError, tab, t, updateCategory]);

  const handleDelete = useCallback(
    (category: Category) => {
      Alert.alert(t('categories.deleteTitle'), t('categories.deleteMsg', { name: category.label }), [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('common.delete'),
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteCategory(category.id);
            } catch (error) {
              const code = error instanceof Error ? error.message : '';
              if (code === CATEGORY_ERRORS.IN_USE) {
                Alert.alert(t('categories.inUseTitle'), t('categories.inUseMsg'));
              } else {
                Alert.alert(t('categories.deleteFailed'), String(error));
              }
            }
          },
        },
      ]);
    },
    [deleteCategory, t],
  );

  return (
    <View style={[styles.root, { backgroundColor: palette.bg, paddingTop: insets.top }]}>
      <View style={[styles.header, { borderBottomColor: palette.border }]}>
        <TouchableOpacity
          style={[styles.backButton, { backgroundColor: palette.card }]}
          onPress={handleBack}
          activeOpacity={0.8}
          accessibilityLabel={t('common.cancel')}
        >
          <Iconify icon="ph:arrow-left-bold" size={20} color={palette.textDark} />
        </TouchableOpacity>
        <View style={styles.headerText}>
          <Text style={[styles.title, { color: palette.textDark }]}>{t('categories.title')}</Text>
          <Text style={[styles.subtitle, { color: palette.textMuted }]}>
            {t('categories.subtitle')}
          </Text>
        </View>
      </View>

      <View style={[styles.tabs, { backgroundColor: palette.card, borderColor: palette.border }]}>
        {(['expense', 'income'] as CategoryType[]).map((value) => (
          <TouchableOpacity
            key={value}
            style={[
              styles.tab,
              tab === value && { backgroundColor: palette.primary, borderColor: palette.primary },
            ]}
            onPress={() => setTab(value)}
            activeOpacity={0.8}
          >
            <Text
              style={[
                styles.tabText,
                { color: palette.textMuted },
                tab === value && styles.tabTextActive,
              ]}
            >
              {t(value === 'expense' ? 'categories.expense' : 'categories.income')}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={{ paddingBottom: insets.bottom + 110 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {isLoading ? (
          <View style={styles.loading}>
            <ActivityIndicator size="large" color={palette.primary} />
          </View>
        ) : items.length === 0 ? (
          <View style={[styles.empty, { backgroundColor: palette.card, borderColor: palette.border }]}>
            <Iconify icon="ph:folder-bold" size={44} color={palette.textMuted} />
            <Text style={[styles.emptyTitle, { color: palette.textDark }]}>
              {t('categories.empty')}
            </Text>
            <Text style={[styles.emptyDesc, { color: palette.textMuted }]}>
              {t('categories.emptyDesc')}
            </Text>
          </View>
        ) : (
          items.map((category) => (
            <View
              key={category.id}
              style={[styles.row, { backgroundColor: palette.card, borderColor: palette.border }]}
            >
              <View style={[styles.icon, { backgroundColor: getPastelBg(category.id) }]}>
                <Iconify icon={category.icon} size={22} color={palette.textDark} />
              </View>
              <Text style={[styles.rowLabel, { color: palette.textDark }]}>{category.label}</Text>
              <TouchableOpacity
                style={styles.iconButton}
                onPress={() => openEdit(category)}
                activeOpacity={0.8}
                accessibilityLabel={t('categories.editTitle')}
              >
                <Iconify icon="ph:pencil-simple-bold" size={19} color={palette.primary} />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.iconButton}
                onPress={() => handleDelete(category)}
                activeOpacity={0.8}
                accessibilityLabel={t('categories.deleteTitle')}
              >
                <Iconify icon="ph:trash-bold" size={19} color={palette.red} />
              </TouchableOpacity>
            </View>
          ))
        )}
      </ScrollView>

      <TouchableOpacity
        style={[styles.fab, { bottom: insets.bottom + 24, backgroundColor: palette.primary }]}
        onPress={openCreate}
        activeOpacity={0.85}
        accessibilityLabel={t('categories.add')}
      >
        <Iconify icon="ph:plus-bold" size={28} color="#fff" />
      </TouchableOpacity>

      <Modal
        visible={formVisible}
        transparent
        animationType="fade"
        onRequestClose={closeForm}
      >
        <View style={styles.overlay}>
          <View style={[styles.formCard, { backgroundColor: palette.card, borderColor: palette.border }]}>
            <Text style={[styles.formTitle, { color: palette.textDark }]}>
              {t(editing ? 'categories.editTitle' : 'categories.addTitle')}
            </Text>
            <Text style={[styles.formLabel, { color: palette.textMuted }]}>
              {t('categories.nameLabel')}
            </Text>
            <TextInput
              style={[
                styles.formInput,
                { backgroundColor: palette.inputBg, color: palette.textDark, borderColor: palette.border },
              ]}
              placeholder={t('categories.namePlaceholder')}
              placeholderTextColor={palette.textMuted}
              value={formLabel}
              onChangeText={setFormLabel}
              maxLength={40}
              autoFocus
            />
            <View style={styles.formActions}>
              <TouchableOpacity
                style={[styles.formButton, { borderColor: palette.border }]}
                onPress={closeForm}
                activeOpacity={0.8}
              >
                <Text style={[styles.formButtonText, { color: palette.textMuted }]}>
                  {t('common.cancel')}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.formButton, { backgroundColor: palette.primary }]}
                onPress={() => void handleSave()}
                disabled={saving}
                activeOpacity={0.8}
              >
                {saving ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={[styles.formButtonText, styles.formButtonTextPrimary]}>
                    {t('common.save')}
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerText: {
    flex: 1,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
  },
  subtitle: {
    fontSize: 14,
    marginTop: 2,
  },
  tabs: {
    flexDirection: 'row',
    gap: 8,
    marginHorizontal: 20,
    marginTop: 16,
    padding: 6,
    borderRadius: 14,
    borderWidth: 1,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  tabText: {
    fontSize: 15,
    fontWeight: '600',
  },
  tabTextActive: {
    color: '#fff',
  },
  scroll: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  loading: {
    paddingVertical: 64,
    alignItems: 'center',
  },
  empty: {
    alignItems: 'center',
    padding: 32,
    borderRadius: 18,
    borderWidth: 1,
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: '700',
    marginTop: 14,
  },
  emptyDesc: {
    fontSize: 14,
    marginTop: 6,
    textAlign: 'center',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 10,
  },
  icon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowLabel: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 12,
  },
  iconButton: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fab: {
    position: 'absolute',
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15,23,42,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  formCard: {
    width: '100%',
    borderRadius: 20,
    borderWidth: 1,
    padding: 20,
  },
  formTitle: {
    fontSize: 19,
    fontWeight: '700',
  },
  formLabel: {
    fontSize: 14,
    marginTop: 14,
    marginBottom: 8,
  },
  formInput: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
  },
  formActions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 20,
  },
  formButton: {
    flex: 1,
    minHeight: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  formButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  formButtonTextPrimary: {
    color: '#fff',
  },
});
