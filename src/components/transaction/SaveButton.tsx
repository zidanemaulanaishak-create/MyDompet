import React from 'react';
import { TouchableOpacity, Text, StyleSheet, Animated, ActivityIndicator, ViewStyle } from 'react-native';
import { COLORS } from '@/constants/colors';

interface Props {
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  title?: string;
  className?: string;
  variant?: 'primary' | 'secondary' | 'outline';
  fullWidth?: boolean;
}

export default function SaveButton({
  onPress,
  disabled = false,
  loading = false,
  title = 'Simpan Transaksi',
  className,
  variant = 'primary',
  fullWidth = true,
}: Props) {
  const [scale] = React.useState(() => new Animated.Value(1));

  const handlePressIn = () => {
    Animated.spring(scale, {
      toValue: 0.97,
      friction: 8,
      tension: 100,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scale, {
      toValue: 1,
      friction: 6,
      tension: 80,
      useNativeDriver: true,
    }).start();
  };

  const isDisabled = disabled || loading;

  const getVariantStyle = (): ViewStyle => {
    switch (variant) {
      case 'secondary':
        return styles.secondary;
      case 'outline':
        return styles.outline;
      default:
        return styles.primary;
    }
  };

  const getTextColor = (): string => {
    if (variant === 'outline') return COLORS.primary;
    return '#fff';
  };

  const buttonStyles: ViewStyle[] = [
    styles.container,
    fullWidth && styles.fullWidth,
    getVariantStyle(),
    isDisabled && styles.disabled,
    className as ViewStyle,
  ].filter(Boolean) as ViewStyle[];

  return (
    <TouchableOpacity
      style={buttonStyles}
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={isDisabled}
      activeOpacity={0.9}
    >
      <Animated.View style={{ transform: [{ scale }] }}>
        {loading ? (
          <ActivityIndicator size="small" color={variant === 'outline' ? COLORS.primary : '#fff'} style={styles.spinner} />
        ) : (
          <Text style={[styles.text, { color: getTextColor() }]}>{title}</Text>
        )}
      </Animated.View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
    shadowColor: COLORS.primary,
    shadowOpacity: 0.3,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },
  fullWidth: {
    width: '100%',
  },
  disabled: {
    opacity: 0.5,
    shadowOpacity: 0,
    elevation: 0,
  },
  primary: {
    backgroundColor: COLORS.primary,
  },
  secondary: {
    backgroundColor: COLORS.orange,
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: COLORS.primary,
    shadowOpacity: 0,
    elevation: 0,
  },
  text: {
    fontSize: 17,
    fontWeight: '700',
  },
  spinner: {
    marginVertical: 2,
  },
});