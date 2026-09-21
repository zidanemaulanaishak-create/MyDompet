import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ScrollView,
  TextInput,
  ViewStyle,
  Keyboard,
} from 'react-native';
import { Iconify } from 'react-native-iconify';
import { COLORS } from '@/constants/colors';
import { Currency, CURRENCIES } from '@/constants/currencies';

interface Props {
  selectedCurrency: Currency;
  onSelect: (currency: Currency) => void;
  style?: ViewStyle;
  className?: string;
}

export default function CurrencySelector({ selectedCurrency, onSelect, style, className }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredCurrencies = useMemo(() => {
    return CURRENCIES.filter(
      (c) =>
        c.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.country.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.symbol.includes(searchQuery)
    );
  }, [searchQuery]);

  const closeDropdown = () => {
    Keyboard.dismiss();
    setIsOpen(false);
    setTimeout(() => setSearchQuery(''), 200);
  };

  useEffect(() => {
    if (typeof document === 'undefined' || !isOpen) return;
    const handleClickOutside = () => setSearchQuery('');
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const handleSelect = (currency: Currency) => {
    onSelect(currency);
    closeDropdown();
  };

  return (
    <View style={style} className={className}>
      <TouchableOpacity
        style={styles.dropdownButton}
        onPress={() => setIsOpen((v) => !v)}
        activeOpacity={0.9}
      >
        <View style={styles.selectedContent}>
          <Text style={styles.flag}>{selectedCurrency.flag}</Text>
          <View style={styles.codeContainer}>
            <Text style={styles.codeText}>{selectedCurrency.code}</Text>
            <Text style={styles.symbolText}>
              {selectedCurrency.symbol} - {selectedCurrency.country}
            </Text>
          </View>
        </View>
        <Iconify icon="ph:caret-down-bold" size={20} color={COLORS.textMuted} />
      </TouchableOpacity>

      <Modal
        visible={isOpen}
        transparent={true}
        animationType="none"
        onRequestClose={closeDropdown}
      >
        <TouchableOpacity
          style={styles.overlay}
          onPress={closeDropdown}
          activeOpacity={1}
        >
          <View style={styles.bottomSheet}>
            <View style={styles.handleContainer}>
              <View style={styles.handle} />
            </View>

            <View style={styles.header}>
              <Text style={styles.title}>Pilih Mata Uang</Text>
              <TouchableOpacity
                onPress={closeDropdown}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Iconify icon="ph:x-bold" size={22} color={COLORS.textMuted} />
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
                placeholder="Cari mata uang..."
                placeholderTextColor={COLORS.textMuted}
                value={searchQuery}
                onChangeText={setSearchQuery}
                autoFocus={true}
              />
            </View>

            <ScrollView
              contentContainerStyle={styles.scrollContent}
              showsVerticalScrollIndicator={false}
            >
              {filteredCurrencies.length === 0 ? (
                <View style={styles.emptyState}>
                  <Text style={styles.emptyText}>Mata uang tidak ditemukan</Text>
                </View>
              ) : (
                filteredCurrencies.map((currency) => (
                  <TouchableOpacity
                    key={currency.code}
                    style={[
                      styles.option,
                      currency.code === selectedCurrency.code && styles.optionSelected,
                    ]}
                    onPress={() => handleSelect(currency)}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.optionFlag}>{currency.flag}</Text>
                    <View style={styles.optionInfo}>
                      <Text style={styles.optionCode}>{currency.code}</Text>
                      <Text style={styles.optionDetail}>
                        {currency.symbol} - {currency.country}
                      </Text>
                    </View>
                    {currency.code === selectedCurrency.code && (
                      <Iconify icon="ph:check-bold" size={18} color={COLORS.primary} />
                    )}
                  </TouchableOpacity>
                ))
              )}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  dropdownButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 12,
  },
  selectedContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  flag: {
    fontSize: 24,
  },
  codeContainer: {
    flexDirection: 'column',
  },
  codeText: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.textDark,
  },
  symbolText: {
    fontSize: 18,
    color: COLORS.textMuted,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  bottomSheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '85%',
    paddingBottom: 28,
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
    fontSize: 17,
    color: COLORS.textDark,
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  scrollContent: {
    paddingVertical: 8,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  optionSelected: {
    backgroundColor: '#E8F0FE',
  },
  optionFlag: {
    fontSize: 26,
    marginRight: 12,
  },
  optionInfo: {
    flex: 1,
  },
  optionCode: {
    fontSize: 17,
    fontWeight: '600',
    color: COLORS.textDark,
  },
  optionDetail: {
    fontSize: 18,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  emptyText: {
    fontSize: 18,
    color: COLORS.textMuted,
  },
});