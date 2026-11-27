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
import AnimatedSheetBackdrop from '@/components/ui/AnimatedSheetBackdrop';
import { getThemeColors } from '@/constants/colors';
import { Currency, CURRENCIES } from '@/constants/currencies';
import { useTheme } from '@/context/theme-context';
import { useI18n } from '@/i18n';

interface Props {
  selectedCurrency: Currency;
  onSelect: (currency: Currency) => void;
  style?: ViewStyle;
  className?: string;
}

export default function CurrencySelector({ selectedCurrency, onSelect, style, className }: Props) {
  const { isDark, accent } = useTheme();
  const palette = getThemeColors(isDark ? 'dark' : 'light', accent);
  const { t } = useI18n();
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
        style={[styles.dropdownButton, { backgroundColor: palette.inputBg, borderColor: palette.border }]}
        onPress={() => setIsOpen((v) => !v)}
        activeOpacity={0.9}
      >
        <View style={styles.selectedContent}>
          <Text style={styles.flag}>{selectedCurrency.flag}</Text>
          <View style={styles.codeContainer}>
            <Text style={[styles.codeText, { color: palette.textDark }]}>{selectedCurrency.code}</Text>
            <Text style={[styles.symbolText, { color: palette.textMuted }]}>
              {selectedCurrency.symbol} - {selectedCurrency.country}
            </Text>
          </View>
        </View>
        <Iconify icon="ph:caret-down-bold" size={20} color={palette.textMuted} />
      </TouchableOpacity>

      <Modal
        visible={isOpen}
        transparent={true}
        animationType="none"
        onRequestClose={closeDropdown}
      >
        <AnimatedSheetBackdrop style={styles.overlay} onPress={closeDropdown}>
          <View style={[styles.bottomSheet, { backgroundColor: palette.card }]}>
            <View style={styles.handleContainer}>
              <View style={[styles.handle, { backgroundColor: isDark ? palette.divider : '#CBD5E1' }]} />
            </View>

            <View style={styles.header}>
              <Text style={[styles.title, { color: palette.textDark }]}>{t('profile.currency')}</Text>
              <TouchableOpacity
                onPress={closeDropdown}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Iconify icon="ph:x-bold" size={22} color={palette.textMuted} />
              </TouchableOpacity>
            </View>

            <View style={[styles.searchContainer, { backgroundColor: palette.inputBg }]}>
              <Iconify
                icon="ph:magnifying-glass-bold"
                size={20}
                color={palette.textMuted}
                style={styles.searchIcon}
              />
              <TextInput
                style={[styles.searchInput, { color: palette.textDark }]}
                placeholder={t('common.search')}
                placeholderTextColor={palette.textMuted}
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
                  <Text style={[styles.emptyText, { color: palette.textMuted }]}>{t('common.noData')}</Text>
                </View>
              ) : (
                filteredCurrencies.map((currency) => (
                  <TouchableOpacity
                    key={currency.code}
                    style={[
                      styles.option,
                      { backgroundColor: palette.inputBg },
                      currency.code === selectedCurrency.code && { backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : palette.chipBlue },
                    ]}
                    onPress={() => handleSelect(currency)}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.optionFlag}>{currency.flag}</Text>
                    <View style={styles.optionInfo}>
                      <Text style={[styles.optionCode, { color: palette.textDark }]}>{currency.code}</Text>
                      <Text style={[styles.optionDetail, { color: palette.textMuted }]}>
                        {currency.symbol} - {currency.country}
                      </Text>
                    </View>
                    {currency.code === selectedCurrency.code && (
                      <Iconify icon="ph:check-bold" size={18} color={palette.primary} />
                    )}
                  </TouchableOpacity>
                ))
              )}
            </ScrollView>
          </View>
        </AnimatedSheetBackdrop>
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
    borderWidth: 1.5,
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
    
  },
  symbolText: {
    fontSize: 18,
    
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  bottomSheet: {
    
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
    borderBottomColor: 'transparent',
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
    fontSize: 17,
    
    
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
    
  },
  optionDetail: {
    fontSize: 18,
    
    marginTop: 2,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  emptyText: {
    fontSize: 18,
    
  },
});