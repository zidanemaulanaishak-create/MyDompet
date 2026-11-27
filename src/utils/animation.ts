import {
  withSpring,
  withTiming,
  type SharedValue,
} from 'react-native-reanimated';

export function animateTo(
  value: SharedValue<number>,
  target: number,
  duration = 200
) {
  value.value = withTiming(target, { duration });
}

export function springTo(
  value: SharedValue<number>,
  target: number,
  damping = 12,
  stiffness = 320
) {
  value.value = withSpring(target, { damping, stiffness });
}
