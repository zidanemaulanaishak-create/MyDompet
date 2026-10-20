import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ScrollView,
  TextInput,
  Keyboard,
  Animated,
  Easing,
} from 'react-native';
import { Iconify } from 'react-native-iconify';
import { getThemeColors } from '@/constants/colors';
import { useTheme } from '@/context/theme-context';
import { Category, getCategoriesForType } from '@/constants/categories';
import { useI18n } from '@/i18n';

interface Props {
  visible: boolean;
  onClose: () => void;
  onSelect: (category: Category) => void;
  selectedCategoryId: string;
  type: 'expense' | 'income';
  title?: string;
}

export default function CategoryPicker({
  visible,
  onClose,
  onSelect,
  selectedCategoryId,
  type,
  title,
}: Props) {
  const { isDark } = useTheme();
  const { t } = useI18n();
  const palette = getThemeColors(isDark ? 'dark' : 'light');
  const [searchQuery, setSearchQuery] = useState('');
  // eslint-disable-next-line react-hooks/refs
  const translateY = useRef(new Animated.Value(500)).current;
  const titleText = title ?? t('addTx.selectCategory');

  const categories = getCategoriesForType(type);

  const filteredCategories = useMemo(() => {
    return categories.filter(
      (c) =>
        c.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.id.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery, categories]);

  useEffect(() => {
    if (visible) {
      Animated.timing(translateY, {
        toValue: 0,
        duration: 300,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(translateY, {
        toValue: 500,
        duration: 200,
        easing: Easing.in(Easing.cubic),
        useNativeDriver: true,
      }).start(({ finished }) => {
        if (finished) onClose();
      });
    }
  }, [visible, translateY, onClose]);

  const handleSelect = (category: Category) => {
    onSelect(category);
    Keyboard.dismiss();
    setSearchQuery('');
    Animated.timing(translateY, {
      toValue: 500,
      duration: 200,
      easing: Easing.in(Easing.cubic),
      useNativeDriver: true,
    }).start(({ finished }) => {
      if (finished) onClose();
    });
  };

  const handleBackdropPress = () => {
    Keyboard.dismiss();
    setSearchQuery('');
    Animated.timing(translateY, {
      toValue: 500,
      duration: 200,
      easing: Easing.in(Easing.cubic),
      useNativeDriver: true,
    }).start(({ finished }) => {
      if (finished) onClose();
    });
  };

  if (!visible) {
    return null;
  }

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="none"
      onRequestClose={handleBackdropPress}
    >
      <TouchableOpacity
        style={styles.overlay}
        onPress={handleBackdropPress}
        activeOpacity={1}
      >
        <Animated.View
          style={[
            styles.bottomSheet,
            {
              backgroundColor: palette.card,
              transform: [{ translateY }],
            },
          ]}
        >
          <View style={styles.handleContainer}>
            <View style={[styles.handle, { backgroundColor: palette.track }]} />
          </View>

          <View style={[styles.header, { borderBottomColor: palette.border }]}>
            <Text style={[styles.title, { color: palette.textDark }]}>{titleText}</Text>
            <TouchableOpacity
              onPress={handleBackdropPress}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Iconify icon="ph:x-bold" size={24} color={palette.textMuted} />
            </TouchableOpacity>
          </View>

          <View style={styles.searchContainer}>
            <Iconify
              icon="ph:magnifying-glass-bold"
              size={20}
              color={palette.textMuted}
              style={styles.searchIcon}
            />
            <TextInput
              style={[
                styles.searchInput,
                { backgroundColor: palette.inputBg, color: palette.textDark, borderColor: palette.border },
              ]}
              placeholder={t('addTx.searchCategory')}
              placeholderTextColor={palette.textMuted}
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoFocus={true}
            />
          </View>

          <ScrollView
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
          >
            {filteredCategories.length === 0 ? (
              <View style={styles.emptyState}>
                <Iconify icon="ph:folder-bold" size={48} color={palette.textMuted} />
                <Text style={[styles.emptyText, { color: palette.textMuted }]}>{t('addTx.noCategoryFound')}</Text>
              </View>
            ) : (
              filteredCategories.map((category) => (
                <TouchableOpacity
                  key={category.id}
                  style={[
                    styles.categoryItem,
                    { backgroundColor: palette.inputBg },
                    selectedCategoryId === category.id && [
                      styles.categoryItemSelected,
                      { backgroundColor: palette.chipBlue, borderColor: palette.primary },
                    ],
                  ]}
                  onPress={() => handleSelect(category)}
                  activeOpacity={0.8}
                >
                  <View
                    style={[
                      styles.iconWrapper,
                      selectedCategoryId === category.id
                        ? { backgroundColor: palette.chipBlue }
                        : { backgroundColor: palette.inputBg },
                    ]}
                  >
                    <Iconify
                      icon={category.icon}
                      size={22}
                      color={selectedCategoryId === category.id ? palette.primary : palette.textDark}
                    />
                  </View>
                  <Text
                    style={[
                      styles.categoryLabel,
                      { color: palette.textDark },
                      selectedCategoryId === category.id && [styles.categoryLabelSelected, { color: palette.primary }],
                    ]}
                  >
                    {category.label}
                  </Text>
                  {selectedCategoryId === category.id && (
                    <Iconify icon="ph:check-bold" size={20} color={palette.primary} />
                  )}
                </TouchableOpacity>
              ))
            )}
          </ScrollView>
        </Animated.View>
      </TouchableOpacity>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15,23,42,0.6)',
    justifyContent: 'flex-end',
  },
  bottomSheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '85%',
    shadowColor: '#1A2E5A',
    shadowOpacity: 0.2,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: -8 },
    elevation: 16,
  },
  handleContainer: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 12,
  },
  searchIcon: {
    marginLeft: 4,
  },
  searchInput: {
    flex: 1,
    fontSize: 18,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 32,
  },
  categoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 16,
    marginBottom: 8,
  },
  categoryItemSelected: {
    borderWidth: 2,
  },
  iconWrapper: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryLabel: {
    flex: 1,
    fontSize: 17,
    fontWeight: '500',
    marginLeft: 14,
  },
  categoryLabelSelected: {
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 48,
  },
  emptyText: {
    marginTop: 12,
    fontSize: 18,
  },
});