import { View, type ViewProps } from 'react-native';

import { Colors, ThemeColor } from '@/constants/theme';
import { useTheme } from '@/context/theme-context';

export type ThemedViewProps = ViewProps & {
  lightColor?: string;
  darkColor?: string;
  type?: ThemeColor;
};

export function ThemedView({ style, lightColor, darkColor, type, ...otherProps }: ThemedViewProps) {
  const { isDark } = useTheme();
  const theme = isDark ? Colors.dark : Colors.light;

  return (
    <View
      style={[
        {
          backgroundColor:
            lightColor || darkColor
              ? isDark
                ? darkColor ?? lightColor
                : lightColor ?? darkColor
              : theme[type ?? 'background'],
        },
        style,
      ]}
      {...otherProps}
    />
  );
}
