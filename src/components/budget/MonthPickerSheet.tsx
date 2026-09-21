import React, { useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, Animated, Easing } from 'react-native';
import { Iconify } from 'react-native-iconify';
import { COLORS } from '@/constants/colors';
import { getRecentMonthKeys } from '@/data/budgetData';
import { monthLabel } from '@/utils/dates';

interface Props {
  visible: boolean;
  selectedMonthKey: string;
  onClose: () => void;
  onSelect: (monthKey: string) => void;
}

export default function MonthPickerSheet({ visible, selectedMonthKey, onClose, onSelect }: Props) {
  // eslint-disable-next-line react-hooks/refs
  const translateY = useRef(new Animated.Value(500)).current;

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

  if (!visible) {
    return null;
  }

  const handleSelect = (key: string) => {
    onSelect(key);
    Animated.timing(translateY, {
      toValue: 500,
      duration: 200,
      easing: Easing.in(Easing.cubic),
      useNativeDriver: true,
    }).start(({ finished }) => {
      if (finished) onClose();
    });
  };

  const keys = getRecentMonthKeys(6);

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={onClose}>
      <TouchableOpacity
        style={styles.overlay}
        onPress={onClose}
        activeOpacity={1}
      >
        <Animated.View style={[styles.sheet, { transform: [{ translateY }] }]}>
          <View style={styles.handle} />
          <View style={styles.header}>
            <Text style={styles.title}>Pilih Bulan</Text>
            <TouchableOpacity onPress={onClose} hitSlop={8}>
              <Iconify icon="ph:x-bold" size={22} color={COLORS.textMuted} />
            </TouchableOpacity>
          </View>

          {keys.map((key) => {
            const active = key === selectedMonthKey;
            return (
              <TouchableOpacity
                key={key}
                style={[styles.row, active && styles.rowActive]}
                activeOpacity={0.8}
                onPress={() => handleSelect(key)}
              >
                <Text style={[styles.rowText, active && styles.rowTextActive]}>
                  {monthLabel(key)}
                </Text>
                {active ? (
                  <Iconify icon="ph:check-bold" size={18} color={COLORS.primary} />
                ) : null}
              </TouchableOpacity>
            );
          })}
        </Animated.View>
      </TouchableOpacity>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.45)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: '#FFFFFF',
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
    backgroundColor: '#D9D9D9',
    marginTop: 10,
    marginBottom: 14,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  title: {
    fontSize: 17,
    fontWeight: '700',
    color: '#0F172A',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: 12,
  },
  rowActive: {
    backgroundColor: COLORS.chipBlue,
  },
  rowText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#172031',
  },
  rowTextActive: {
    color: COLORS.primary,
  },
});