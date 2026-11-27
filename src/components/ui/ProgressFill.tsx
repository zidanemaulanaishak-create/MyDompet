import React, { useEffect } from 'react';
import type { StyleProp, ViewStyle } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

interface Props {
  progress: number;
  color: string;
  className?: string;
  style?: StyleProp<ViewStyle>;
}

export default function ProgressFill({
  progress,
  color,
  className,
  style,
}: Props) {
  const reducedMotion = useReducedMotion();
  const target = Math.max(0, Math.min(1, progress)) * 100;
  const width = useSharedValue(reducedMotion ? target : 0);

  useEffect(() => {
    width.value = reducedMotion
      ? target
      : withTiming(target, {
          duration: 550,
          easing: Easing.out(Easing.cubic),
        });
  }, [target, reducedMotion, width]);

  const animatedStyle = useAnimatedStyle(() => ({
    width: `${width.value}%`,
  }));

  return (
    <Animated.View
      className={className}
      style={[style, { backgroundColor: color }, animatedStyle]}
    />
  );
}
