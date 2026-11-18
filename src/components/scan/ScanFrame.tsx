import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Animated, Easing, useWindowDimensions } from 'react-native';
import { getThemeColors } from '@/constants/colors';
import { useTheme } from '@/context/theme-context';

const CORNER = 30;
const THICK = 5;

export default function ScanFrame() {
  const { width } = useWindowDimensions();
  const { isDark, accent } = useTheme();
  const palette = getThemeColors(isDark ? 'dark' : 'light', accent);
  const frameWidth = Math.min(width - 96, 300);
  const frameHeight = Math.round(frameWidth * 1.4);
  const [laser] = useState(() => new Animated.Value(0));

  useEffect(() => {
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(laser, { toValue: 1, duration: 1800, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(laser, { toValue: 0, duration: 1800, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      ])
    );
    anim.start();
    return () => anim.stop();
  }, [laser]);

  const translateY = laser.interpolate({
    inputRange: [0, 1],
    outputRange: [8, frameHeight - 8],
  });

  return (
    <View style={styles.center}>
      <View style={[styles.frame, { width: frameWidth, height: frameHeight }]}>
        <Animated.View
          style={[
            styles.laser,
            {
              width: frameWidth - 24,
              transform: [{ translateY }],
              backgroundColor: palette.sky,
              shadowColor: palette.sky,
            },
          ]}
        />
        <View style={[styles.corner, styles.tl, { borderColor: palette.sky }]} />
        <View style={[styles.corner, styles.tr, { borderColor: palette.sky }]} />
        <View style={[styles.corner, styles.bl, { borderColor: palette.sky }]} />
        <View style={[styles.corner, styles.br, { borderColor: palette.sky }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  frame: { position: 'relative' },
  laser: {
    position: 'absolute',
    left: 12,
    height: 3,
    borderRadius: 2,
    shadowOpacity: 0.9,
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 8,
    elevation: 4,
  },
  corner: { position: 'absolute', width: CORNER, height: CORNER },
  tl: { top: 0, left: 0, borderTopWidth: THICK, borderLeftWidth: THICK, borderTopLeftRadius: 12 },
  tr: { top: 0, right: 0, borderTopWidth: THICK, borderRightWidth: THICK, borderTopRightRadius: 12 },
  bl: { bottom: 0, left: 0, borderBottomWidth: THICK, borderLeftWidth: THICK, borderBottomLeftRadius: 12 },
  br: { bottom: 0, right: 0, borderBottomWidth: THICK, borderRightWidth: THICK, borderBottomRightRadius: 12 },
});
