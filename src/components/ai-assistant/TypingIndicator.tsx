import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Easing } from 'react-native';
import { COLORS, getThemeColors } from '@/constants/colors';
import { useTheme } from '@/context/theme-context';

export default function TypingIndicator() {
  const { isDark } = useTheme();
  const palette = getThemeColors(isDark ? 'dark' : 'light');
  const animation = useRef(new Animated.Value(0));

  useEffect(() => {
    animation.current.setValue(0);
    Animated.loop(
      Animated.timing(animation.current, {
        toValue: 1,
        duration: 1100,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();
  }, []);

  const dotStyle = () => {
    const scale = animation.current.interpolate({
      inputRange: [0, 0.3, 0.6, 1],
      outputRange: [0.4, 1, 0.4, 0.4],
    });
    return { transform: [{ scale }] };
  };

  return (
    <View style={styles.container}>
      <View style={[styles.card, { backgroundColor: palette.card, borderColor: isDark ? '#263550' : '#E5EAF1' }]}>
        <View style={styles.dots}>
          {/* eslint-disable-next-line react-hooks/refs */}
          <Animated.View style={[styles.dot, dotStyle()]} />
          {/* eslint-disable-next-line react-hooks/refs */}
          <Animated.View style={[styles.dot, dotStyle()]} />
          {/* eslint-disable-next-line react-hooks/refs */}
          <Animated.View style={[styles.dot, dotStyle()]} />
        </View>
        <Text style={[styles.label, { color: palette.textMuted }]}>AI sedang mengetik...</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'flex-start', marginBottom: 14 },
  card: { flexDirection: 'row', alignItems: 'center', gap: 8, borderWidth: 1, borderRadius: 18, borderBottomLeftRadius: 6, paddingHorizontal: 14, paddingVertical: 11 },
  dots: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  dot: { width: 7, height: 7, borderRadius: 4, backgroundColor: COLORS.primary },
  label: { fontSize: 18, fontWeight: '600' },
});
