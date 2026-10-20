import React, { forwardRef, useImperativeHandle, useRef } from 'react';
import { ScrollView, View, Text, StyleSheet, Keyboard } from 'react-native';
import { Iconify } from 'react-native-iconify';
import { COLORS, getThemeColors } from '@/constants/colors';
import { useTheme } from '@/context/theme-context';
import { ChatMessage, QuickSuggestion } from '@/types/chat';
import { useI18n } from '@/i18n';
import MessageBubble from './MessageBubble';
import QuickSuggestions from './QuickSuggestions';
import TypingIndicator from './TypingIndicator';

interface Props {
  messages: ChatMessage[];
  isTyping: boolean;
  showSuggestions: boolean;
  suggestions: QuickSuggestion[];
  onSuggestionPress: (suggestion: QuickSuggestion) => void;
  onLike: (messageId: string, value: 'up' | 'down') => void;
  onCopy: (messageId: string) => void;
  onShare: (messageId: string) => void;
  onMore: (messageId: string) => void;
  userName: string;
}

interface ChatListRef {
  scrollToEnd: () => void;
  scrollToBottom: () => void;
}

const ChatList = forwardRef<ChatListRef, Props>(
  ({ messages, isTyping, showSuggestions, suggestions, onSuggestionPress, onLike, onCopy, onShare, onMore, userName }, ref) => {
    const { isDark } = useTheme();
    const palette = getThemeColors(isDark ? 'dark' : 'light');
    const { t } = useI18n();
    const scrollViewRef = useRef<ScrollView>(null);

    useImperativeHandle(ref, () => ({
      scrollToEnd: () => scrollViewRef.current?.scrollToEnd({ animated: true }),
      scrollToBottom: () => setTimeout(() => scrollViewRef.current?.scrollToEnd({ animated: true }), 100),
    }));

    if (messages.length === 0 && !isTyping) {
      return (
        <ScrollView
          style={[styles.scrollView, { backgroundColor: palette.bg }]}
          contentContainerStyle={styles.emptyContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.hero}>
            <View style={[styles.heroAvatar, { backgroundColor: COLORS.primary }]}>
              <Iconify icon="ph:sparkle-fill" size={30} color="#FFFFFF" />
            </View>
            <Text style={[styles.greeting, { color: palette.textDark }]}>{t('ai.greeting', { name: userName })}</Text>
            <Text style={[styles.sub, { color: palette.textMuted }]}>
              {t('ai.heroIntro')}
            </Text>
          </View>

          {showSuggestions && suggestions.length > 0 ? (
            <View style={styles.suggestSection}>
              <Text style={[styles.suggestTitle, { color: palette.textDark }]}>{t('ai.tryAsk')}</Text>
              <QuickSuggestions suggestions={suggestions} onPress={onSuggestionPress} />
            </View>
          ) : null}
        </ScrollView>
      );
    }

    return (
      <ScrollView
        ref={scrollViewRef}
        style={[styles.scrollView, { backgroundColor: palette.bg }]}
        contentContainerStyle={styles.chatContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        onScroll={Keyboard.dismiss}
        scrollEventThrottle={16}
      >
        <View style={styles.dateDivider}>
          <Text style={[styles.dateLabel, { color: palette.textMuted, backgroundColor: isDark ? '#1E293B' : '#EDF2F7' }]}>
            {t('common.today')}
          </Text>
        </View>
        {messages.map((message) => (
          <MessageBubble
            key={message.id}
            message={message}
            onLike={onLike}
            onCopy={onCopy}
            onShare={onShare}
            onMore={onMore}
            showActionBar={message.role === 'assistant'}
          />
        ))}
        {isTyping ? <TypingIndicator /> : null}
        {showSuggestions ? <QuickSuggestions suggestions={suggestions} onPress={onSuggestionPress} /> : null}
      </ScrollView>
    );
  }
);

ChatList.displayName = 'ChatList';

export default ChatList;

const styles = StyleSheet.create({
  scrollView: { flex: 1 },
  emptyContent: { width: '100%', maxWidth: 760, alignSelf: 'center', flexGrow: 1, justifyContent: 'center', paddingHorizontal: 24, paddingTop: 32, paddingBottom: 40 },
  hero: { alignItems: 'center', marginBottom: 28 },
  heroAvatar: { width: 76, height: 76, borderRadius: 38, alignItems: 'center', justifyContent: 'center', marginBottom: 18, shadowColor: COLORS.primary, shadowOpacity: 0.3, shadowOffset: { width: 0, height: 8 }, shadowRadius: 16, elevation: 6 },
  greeting: { fontSize: 26, fontWeight: '800', letterSpacing: -0.5, textAlign: 'center' },
  sub: { fontSize: 18, lineHeight: 21, textAlign: 'center', marginTop: 8, maxWidth: 320 },
  suggestSection: { width: '100%' },
  suggestTitle: { fontSize: 18, fontWeight: '800', marginBottom: 4 },
  chatContent: { width: '100%', maxWidth: 760, alignSelf: 'center', paddingHorizontal: 16, paddingTop: 16, paddingBottom: 24, minHeight: '100%', justifyContent: 'flex-end' },
  dateDivider: { alignItems: 'center', marginBottom: 16 },
  dateLabel: { fontSize: 18, fontWeight: '700', overflow: 'hidden', borderRadius: 12, paddingHorizontal: 12, paddingVertical: 5 },
});
