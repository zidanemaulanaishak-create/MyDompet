import React from 'react';
import {
  Pressable,
  StyleSheet,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import Animated, {
  Easing,
  FadeIn,
  useReducedMotion,
} from 'react-native-reanimated';

interface Props {
  children: React.ReactNode;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
}

export default function AnimatedSheetBackdrop({
  children,
  onPress,
  style,
}: Props) {
  const reducedMotion = useReducedMotion();

  return (
    <Animated.View
      style={[styles.overlay, style]}
      entering={
        reducedMotion
          ? undefined
          : FadeIn.duration(180).easing(Easing.out(Easing.cubic))
      }
    >
      <Pressable style={StyleSheet.absoluteFill} onPress={onPress} />
      {children}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(15, 23, 42, 0.45)',
  },
});
