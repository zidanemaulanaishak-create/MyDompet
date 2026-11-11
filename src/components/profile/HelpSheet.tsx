import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ScrollView,
  Linking,
  Alert,
} from 'react-native';
import { Iconify } from 'react-native-iconify';
import { useTheme } from '@/context/theme-context';
import { getThemeColors } from '@/constants/colors';
import { useI18n } from '@/i18n';

interface Props {
  visible: boolean;
  onClose: () => void;
}

const SUPPORT_EMAIL = 'support@mydompet.app';

const FAQS: { q: string; a: string }[] = [
  { q: 'profile.faq1Q', a: 'profile.faq1A' },
  { q: 'profile.faq2Q', a: 'profile.faq2A' },
  { q: 'profile.faq3Q', a: 'profile.faq3A' },
  { q: 'profile.faq4Q', a: 'profile.faq4A' },
];

export default function HelpSheet({ visible, onClose }: Props) {
  const { isDark } = useTheme();
  const palette = getThemeColors(isDark ? 'dark' : 'light');
  const { t } = useI18n();
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const handleContact = async () => {
    const url = `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent('MyDompet Support')}`;
    try {
      const supported = await Linking.canOpenURL(url);
      if (!supported) {
        Alert.alert(t('profile.helpContact'), SUPPORT_EMAIL);
        return;
      }
      await Linking.openURL(url);
    } catch {
      Alert.alert(t('profile.helpContact'), SUPPORT_EMAIL);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <TouchableOpacity style={styles.overlay} onPress={onClose} activeOpacity={1}>
        <View style={[styles.sheet, { backgroundColor: palette.card }]}>
          <View style={[styles.handle, { backgroundColor: isDark ? palette.divider : '#E2E8F0' }]} />
          <View style={styles.header}>
            <Text style={[styles.title, { color: palette.textDark }]}>
              {t('profile.helpSheetTitle')}
            </Text>
            <TouchableOpacity onPress={onClose} hitSlop={8}>
              <Iconify icon="ph:x-bold" size={22} color={palette.textMuted} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={handleContact}
              style={[styles.contactCard, { backgroundColor: palette.primary }]}
            >
              <View style={styles.contactIcon}>
                <Iconify icon="ph:envelope-simple-bold" size={22} color="#FFFFFF" />
              </View>
              <View style={styles.contactText}>
                <Text style={styles.contactTitle}>{t('profile.helpContact')}</Text>
                <Text style={styles.contactSubtitle}>{t('profile.helpContactSubtitle')}</Text>
              </View>
              <Iconify icon="ph:paper-plane-tilt-bold" size={20} color="#FFFFFF" />
            </TouchableOpacity>

            <Text style={[styles.label, { color: palette.textMuted }]}>
              {t('profile.faqTitle')}
            </Text>

            {FAQS.map((item, idx) => {
              const open = openIndex === idx;
              return (
                <TouchableOpacity
                  key={item.q}
                  activeOpacity={0.8}
                  onPress={() => setOpenIndex(open ? null : idx)}
                  style={[styles.faq, { borderColor: palette.border }]}
                >
                  <View style={styles.faqHeader}>
                    <Text style={[styles.faqQ, { color: palette.textDark }]}>{t(item.q)}</Text>
                    <Iconify
                      icon={open ? 'ph:caret-up-bold' : 'ph:caret-down-bold'}
                      size={16}
                      color={palette.textMuted}
                    />
                  </View>
                  {open ? (
                    <Text style={[styles.faqA, { color: palette.textMuted }]}>{t(item.a)}</Text>
                  ) : null}
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
      </TouchableOpacity>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(2,8,23,0.5)',
  },
  sheet: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 20,
    maxHeight: '85%',
  },
  handle: {
    width: 40,
    height: 5,
    borderRadius: 3,
    alignSelf: 'center',
    marginBottom: 14,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
  },
  content: {
    paddingBottom: 24,
  },
  contactCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 16,
    marginTop: 12,
  },
  contactIcon: {
    width: 42,
    height: 42,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.18)',
  },
  contactText: {
    flex: 1,
  },
  contactTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  contactSubtitle: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 13,
    marginTop: 2,
  },
  label: {
    fontSize: 13,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: 20,
    marginBottom: 8,
  },
  faq: {
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 8,
  },
  faqHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  faqQ: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
  },
  faqA: {
    fontSize: 13,
    lineHeight: 20,
    marginTop: 8,
  },
});
