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
import { COLORS } from '@/constants/colors';
import { Category, getCategoriesForType } from '@/constants/categories';

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
  title = 'Pilih Kategori',
}: Props) {
  const [searchQuery, setSearchQuery] = useState('');
  // eslint-disable-next-line react-hooks/refs
  const translateY = useRef(new Animated.Value(500)).current;

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
              transform: [{ translateY }],
            },
          ]}
        >
          <View style={styles.handleContainer}>
            <View style={styles.handle} />
          </View>

          <View style={styles.header}>
            <Text style={styles.title}>{title}</Text>
            <TouchableOpacity
              onPress={handleBackdropPress}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Iconify icon="ph:x-bold" size={24} color={COLORS.textMuted} />
            </TouchableOpacity>
          </View>

          <View style={styles.searchContainer}>
            <Iconify
              icon="ph:magnifying-glass-bold"
              size={20}
              color={COLORS.textMuted}
              style={styles.searchIcon}
            />
            <TextInput
              style={styles.searchInput}
              placeholder="Cari kategori..."
              placeholderTextColor={COLORS.textMuted}
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
                <Iconify icon="ph:folder-bold" size={48} color={COLORS.textMuted} />
                <Text style={styles.emptyText}>Tidak ada kategori ditemukan</Text>
              </View>
            ) : (
              filteredCategories.map((category) => (
                <TouchableOpacity
                  key={category.id}
                  style={[
                    styles.categoryItem,
                    selectedCategoryId === category.id && styles.categoryItemSelected,
                  ]}
                  onPress={() => handleSelect(category)}
                  activeOpacity={0.8}
                >
                  <View
                    style={[
                      styles.iconWrapper,
                      selectedCategoryId === category.id
                        ? { backgroundColor: COLORS.chipBlue }
                        : { backgroundColor: '#F8F9FA' },
                    ]}
                  >
                    <Iconify
                      icon={category.icon}
                      size={22}
                      color={selectedCategoryId === category.id ? COLORS.primary : COLORS.textDark}
                    />
                  </View>
                  <Text
                    style={[
                      styles.categoryLabel,
                      selectedCategoryId === category.id && styles.categoryLabelSelected,
                    ]}
                  >
                    {category.label}
                  </Text>
                  {selectedCategoryId === category.id && (
                    <Iconify icon="ph:check-bold" size={20} color={COLORS.primary} />
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
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  bottomSheet: {
    backgroundColor: '#fff',
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
    backgroundColor: '#D9D9D9',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textDark,
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
    color: COLORS.textDark,
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
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
    backgroundColor: '#F8F9FA',
  },
  categoryItemSelected: {
    backgroundColor: COLORS.chipBlue,
    borderWidth: 2,
    borderColor: COLORS.primary,
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
    color: COLORS.textDark,
    marginLeft: 14,
  },
  categoryLabelSelected: {
    color: COLORS.primary,
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 48,
  },
  emptyText: {
    marginTop: 12,
    fontSize: 18,
    color: COLORS.textMuted,
  },
});