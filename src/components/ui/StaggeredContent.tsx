import React from 'react';
import { View, type StyleProp, type ViewStyle } from 'react-native';
import Animated, {
  Easing,
  FadeInDown,
  useReducedMotion,
} from 'react-native-reanimated';

interface Props {
  children: React.ReactNode;
  index?: number;
  delay?: number;
  className?: string;
  style?: StyleProp<ViewStyle>;
}

export default function StaggeredContent({
  children,
  index = 0,
  delay = 50,
  className,
  style,
}: Props) {
  const reducedMotion = useReducedMotion();

  if (reducedMotion) {
    return (
      <View className={className} style={style}>
        {children}
      </View>
    );
  }

  return (
    <Animated.View
      className={className}
      style={style}
      entering={FadeInDown.duration(280)
        .delay(index * delay)
        .easing(Easing.out(Easing.cubic))}
    >
      {children}
    </Animated.View>
  );
}
