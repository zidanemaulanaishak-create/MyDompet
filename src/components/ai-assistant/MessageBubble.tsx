import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Animated, Easing } from 'react-native';
import { Iconify } from 'react-native-iconify';
import { COLORS, getThemeColors } from '@/constants/colors';
import { useTheme } from '@/context/theme-context';
import { ChatMessage } from '@/types/chat';
import AIActionBar from './AIActionBar';
import { parseMessageContent } from '@/utils/messageFormatter';

interface Props {
  message: ChatMessage;
  onLike: (messageId: string, value: 'up' | 'down') => void;
  onCopy: (messageId: string) => void;
  onShare: (messageId: string) => void;
  onMore: (messageId: string) => void;
  showActionBar?: boolean;
}

const timeFormat = (date: Date) => date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });

function MessageContent({ parts, color, accent }: { parts: ReturnType<typeof parseMessageContent>; color: string; accent: string }) {
  return (
    <View style={styles.contentWrap}>
      {parts.map((part, index) => {
        if (part.type === 'bullet') {
          return (
            <View key={index} style={styles.bulletRow}>
              <View style={[styles.bulletDot, { backgroundColor: accent }]} />
              <Text style={[styles.text, { color, flex: 1 }]}>{part.content}</Text>
            </View>
          );
        }
        if (part.type === 'currency') {
          return (
            <Text key={index} style={[styles.text, styles.bold, { color: accent }]}>
              {part.content.replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1.')}
            </Text>
          );
        }
        if (part.type === 'bold') {
          return <Text key={index} style={[styles.text, styles.bold, { color }]}>{part.content}</Text>;
        }
        return <Text key={index} style={[styles.text, { color }]}>{part.content}</Text>;
      })}
    </View>
  );
}

export default function MessageBubble({ message, onLike, onCopy, onShare, onMore, showActionBar = true }: Props) {
  const { isDark } = useTheme();
  const palette = getThemeColors(isDark ? 'dark' : 'light');
  const [fade] = useState(() => new Animated.Value(0));
  const [slide] = useState(() => new Animated.Value(10));

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fade, { toValue: 1, duration: 220, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      Animated.timing(slide, { toValue: 0, duration: 260, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
    ]).start();
  }, [fade, slide]);

  const isUser = message.role === 'user';
  const parts = parseMessageContent(message.content);

  if (isUser) {
    return (
      <Animated.View style={[styles.container, { opacity: fade, transform: [{ translateY: slide }] }]}>
        <View style={styles.userRow}>
          <View style={styles.userBubble}>
            <MessageContent parts={parts} color="#FFFFFF" accent="#FDE68A" />
          </View>
        </View>
        <Text style={[styles.userTimestamp, { color: palette.textMuted }]}>{timeFormat(message.timestamp)}</Text>
      </Animated.View>
    );
  }

  return (
    <Animated.View style={[styles.container, { opacity: fade, transform: [{ translateY: slide }] }]}>
      <View style={styles.aiRow}>
        <View style={[styles.aiAvatar, { backgroundColor: COLORS.primary }]}>
          <Iconify icon="ph:sparkle-fill" size={12} color="#FFFFFF" />
        </View>
        <View style={styles.aiBody}>
          <View
            style={[
              styles.aiBubble,
              { backgroundColor: palette.card, borderColor: isDark ? '#263550' : '#E5EAF1' },
            ]}
          >
            <MessageContent parts={parts} color={palette.textDark} accent={COLORS.primary} />
          </View>
          {showActionBar ? (
            <AIActionBar
              messageId={message.id}
              likeStatus={message.likeStatus || 'none'}
              onLike={onLike}
              onCopy={onCopy}
              onShare={onShare}
              onMore={onMore}
            />
          ) : null}
        </View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: { width: '100%', marginBottom: 14 },
  contentWrap: { alignSelf: 'flex-start', maxWidth: '100%' },
  text: { fontSize: 18, lineHeight: 22 },
  bold: { fontWeight: '700' },
  userRow: { alignItems: 'flex-end' },
  userBubble: { alignSelf: 'flex-end', maxWidth: '80%', backgroundColor: COLORS.primary, borderRadius: 20, borderBottomRightRadius: 6, paddingHorizontal: 15, paddingVertical: 11, shadowColor: COLORS.primary, shadowOpacity: 0.22, shadowOffset: { width: 0, height: 4 }, shadowRadius: 10, elevation: 4 },
  userTimestamp: { fontSize: 18, fontWeight: '500', marginTop: 5, marginRight: 4, textAlign: 'right' },
  aiRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 8 },
  aiAvatar: { width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginTop: 2, flexShrink: 0 },
  aiBody: { flexShrink: 1, maxWidth: '86%' },
  aiBubble: { alignSelf: 'flex-start', borderWidth: 1, borderRadius: 20, borderBottomLeftRadius: 6, paddingHorizontal: 15, paddingVertical: 11, shadowColor: '#1A2E5A', shadowOpacity: 0.06, shadowOffset: { width: 0, height: 2 }, shadowRadius: 8, elevation: 2 },
  bulletRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 8 },
  bulletDot: { width: 5, height: 5, borderRadius: 3, marginTop: 8 },
});
