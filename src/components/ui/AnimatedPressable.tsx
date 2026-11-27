import React from 'react';
import {
  Pressable,
  type PressableProps,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
} from 'react-native-reanimated';

const AnimatedPressableBase = Animated.createAnimatedComponent(Pressable);

interface Props extends PressableProps {
  children: React.ReactNode;
  scaleTo?: number;
  activeOpacity?: number;
  style?: StyleProp<ViewStyle>;
}

export default function AnimatedPressable({
  children,
  scaleTo = 0.96,
  activeOpacity = 1,
  style,
  onPressIn,
  onPressOut,
  ...rest
}: Props) {
  const pressed = useSharedValue(false);
  const reducedMotion = useReducedMotion();

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pressed.value ? scaleTo : 1 }],
    opacity: pressed.value ? activeOpacity : 1,
  }));

  return (
    <AnimatedPressableBase
      {...rest}
      onPressIn={(event) => {
        pressed.value = true;
        onPressIn?.(event);
      }}
      onPressOut={(event) => {
        pressed.value = false;
        onPressOut?.(event);
      }}
      style={[reducedMotion ? null : animatedStyle, style]}
    >
      {children}
    </AnimatedPressableBase>
  );
}
