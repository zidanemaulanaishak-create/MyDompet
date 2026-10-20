import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';
import { COLORS, getThemeColors } from '@/constants/colors';
import { useTheme } from '@/context/theme-context';
import { useI18n } from '@/i18n';

interface Props {
  onCreate: () => void;
}

export default function GoalsEmptyState({ onCreate }: Props) {
  const { t } = useI18n();
  const { isDark } = useTheme();
  const palette = getThemeColors(isDark ? 'dark' : 'light');
  return (
    <View style={styles.wrap}>
      <Svg width={140} height={120} viewBox="0 0 140 120">
        <Circle cx={70} cy={62} r={44} fill={palette.chipBlue} />
        <Circle cx={70} cy={62} r={32} fill={palette.card} />
        <Path
          d="M70 46v16m0 6v.5"
          stroke={COLORS.primary}
          strokeWidth={5}
          strokeLinecap="round"
        />
        <Path
          d="M52 34l6-6m24 0l6 6"
          stroke={palette.orange}
          strokeWidth={5}
          strokeLinecap="round"
        />
        <Path
          d="M48 92c8-8 36-8 44 0"
          stroke={COLORS.primary}
          strokeWidth={5}
          strokeLinecap="round"
          fill="none"
        />
      </Svg>
      <Text style={[styles.title, { color: palette.textDark }]}>{t('goals.emptyTitle')}</Text>
      <Text style={[styles.sub, { color: palette.textMuted }]}>
        {t('goals.emptySub')}
      </Text>
      <TouchableOpacity style={styles.cta} activeOpacity={0.85} onPress={onCreate}>
        <Text style={styles.ctaLabel}>{t('goals.createFirst')}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', paddingVertical: 36, paddingHorizontal: 24 },
  title: { fontSize: 18, fontWeight: '800', marginTop: 18, textAlign: 'center' },
  sub: { fontSize: 14, textAlign: 'center', marginTop: 8, lineHeight: 21 },
  cta: {
    backgroundColor: COLORS.primary,
    borderRadius: 16,
    paddingVertical: 15,
    paddingHorizontal: 24,
    marginTop: 20,
    alignSelf: 'stretch',
    alignItems: 'center',
  },
  ctaLabel: { color: '#FFFFFF', fontSize: 15, fontWeight: '700' },
});
