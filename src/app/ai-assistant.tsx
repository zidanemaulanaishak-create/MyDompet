import React, { useRef, useEffect, useCallback } from 'react';
import {
  View,
  StatusBar,
  Platform,
  BackHandler,
  StyleSheet,
  KeyboardAvoidingView,
  Keyboard,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ChatHeader, ChatList, MessageInput } from '@/components/ai-assistant';
import { useChat } from '@/hooks/useChat';
import { getThemeColors } from '@/constants/colors';
import { useTheme } from '@/context/theme-context';
import { getFirstName, useAuth } from '@/context/auth-context';
import { useTransactions } from '@/context/transaction-context';
import { useBudget } from '@/context/budget-context';
import { monthKey } from '@/utils/dates';
import { buildContextSnapshot } from '@/services/snapshot';
import { QuickSuggestion } from '@/types/chat';

export default function AIAssistantScreen() {
  const { isDark } = useTheme();
  const palette = getThemeColors(isDark ? 'dark' : 'light');
  const { user, onboarding } = useAuth();
  const { transactions } = useTransactions();
  const { getBudgetsForMonth } = useBudget();
  const router = useRouter();
  const params = useLocalSearchParams<{ q?: string }>();
  const scrollViewRef = useRef<any>(null);
  const userName = user ? getFirstName(user.name) : 'Teman';

  const currentMonthKey = monthKey(new Date());

  const context = buildContextSnapshot({
    userName: user?.name ?? 'Teman',
    occupation: onboarding?.occupation ?? null,
    mainIncome: onboarding?.mainIncome ?? 0,
    transactions,
    budgets: getBudgetsForMonth(currentMonthKey).map((b) => ({
      categoryId: b.categoryId,
      limit: b.limit,
    })),
  });

  const {
    messages,
    inputText,
    isTyping,
    showSuggestions,
    suggestions,
    handleInputChange,
    handleSend,
    sendMessage,
    toggleLike,
    copyMessage,
    shareMessage,
    resetChat,
    revealSuggestions,
  } = useChat(params.q, { context, userId: user?.id });

  const handleMenuPress = useCallback(() => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/home');
    }
  }, [router]);

  const handleNewChatPress = useCallback(() => {
    resetChat();
  }, [resetChat]);

  const handleOptionsPress = useCallback(() => {
    revealSuggestions();
  }, [revealSuggestions]);

  const handleSuggestionPress = useCallback((suggestion: QuickSuggestion) => {
    sendMessage(suggestion.label);
  }, [sendMessage]);

  const scrollToBottom = useCallback(() => {
    scrollViewRef.current?.scrollToEnd({ animated: true });
  }, []);

  useEffect(() => {
    if (messages.length > 0) {
      scrollToBottom();
    }
  }, [messages, scrollToBottom]);

  useEffect(() => {
    const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
      if (inputText.trim()) {
        Keyboard.dismiss();
        return true;
      }
      handleMenuPress();
      return true;
    });
    return () => subscription.remove();
  }, [inputText, handleMenuPress]);

  return (
    <View style={[styles.container, { backgroundColor: palette.bg }]}>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={palette.bg}
        translucent={false}
      />

      <ChatHeader
        onMenuPress={handleMenuPress}
        onNewChatPress={handleNewChatPress}
        onOptionsPress={handleOptionsPress}
      />

      <KeyboardAvoidingView
        style={styles.chatArea}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={0}
      >
        <ChatList
          ref={scrollViewRef}
          messages={messages}
          isTyping={isTyping}
          showSuggestions={showSuggestions}
          suggestions={suggestions}
          onSuggestionPress={handleSuggestionPress}
          onLike={toggleLike}
          onCopy={copyMessage}
          onShare={shareMessage}
          onMore={() => {}}
          userName={userName}
        />

        <MessageInput
          value={inputText}
          onChangeText={handleInputChange}
          onSend={handleSend}
          onShortcutPress={(label: string) => sendMessage(label)}
        />
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  chatArea: { flex: 1, backgroundColor: 'transparent' },
});
