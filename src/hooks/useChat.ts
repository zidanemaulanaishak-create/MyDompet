import { useState, useCallback, useRef, useEffect } from 'react';
import * as Clipboard from 'expo-clipboard';
import { Share } from 'react-native';
import * as Haptics from 'expo-haptics';
import { ChatMessage, QuickSuggestion } from '@/types/chat';
import { translate } from '@/i18n';
import { getAppPrefs } from '@/utils/appPrefs';
import {
  askGemini,
  buildSystemPrompt,
  GeminiError,
  type ChatContextSnapshot,
  type ChatTurn,
} from '@/services/ai';
import { appendMessage, createSession, loadLatestSession } from '@/services/chatDb';

interface SuggestionKey {
  id: string;
  key: string;
  icon?: string;
}

const DEFAULT_SUGGESTION_KEYS: SuggestionKey[] = [
  { id: '1', key: 'ai.sug1' },
  { id: '2', key: 'ai.sug2' },
  { id: '3', key: 'ai.sug3' },
  { id: '4', key: 'ai.sug4' },
  { id: '5', key: 'ai.sug5' },
  { id: '6', key: 'ai.sug6' },
];

const FOLLOW_UP_SUGGESTION_KEYS: SuggestionKey[][] = [
  [
    { id: 'f1a', key: 'ai.follow1a' },
    { id: 'f1b', key: 'ai.follow1b' },
    { id: 'f1c', key: 'ai.follow1c' },
    { id: 'f1d', key: 'ai.follow1d' },
  ],
  [
    { id: 'f2a', key: 'ai.follow2a' },
    { id: 'f2b', key: 'ai.follow2b' },
    { id: 'f2c', key: 'ai.follow2c' },
    { id: 'f2d', key: 'ai.follow2d' },
  ],
  [
    { id: 'f3a', key: 'ai.follow3a' },
    { id: 'f3b', key: 'ai.follow3b' },
    { id: 'f3c', key: 'ai.follow3c' },
    { id: 'f3d', key: 'ai.follow3d' },
  ],
];

const HISTORY_LIMIT = 16;

function buildSuggestionLabels(keys: SuggestionKey[]): QuickSuggestion[] {
  const locale = getAppPrefs().locale ?? 'id';
  return keys.map((k) => ({
    id: k.id,
    label: translate(locale, k.key),
    icon: k.icon,
  }));
}

export interface UseChatOptions {
  context?: ChatContextSnapshot;
  userId?: string;
}

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

function pickFollowUps(text: string): QuickSuggestion[] {
  const lower = text.toLowerCase();
  if (/target|tabungan|darurat|savings|emergency|goal/.test(lower)) return buildSuggestionLabels(FOLLOW_UP_SUGGESTION_KEYS[0]);
  if (/hemat|boros|efisien|penghemat|save|budget|spend|reduce|cut/.test(lower)) return buildSuggestionLabels(FOLLOW_UP_SUGGESTION_KEYS[1]);
  if (/investasi|risiko|instrumen|saham|reksadana|invest|risk|stock|mutual/.test(lower)) return buildSuggestionLabels(FOLLOW_UP_SUGGESTION_KEYS[2]);
  return buildSuggestionLabels(DEFAULT_SUGGESTION_KEYS);
}

function errorMessage(error: unknown): string {
  if (error instanceof GeminiError) {
    switch (error.code) {
      case 'NO_KEY':
        return translate(getAppPrefs().locale ?? 'id', 'ai.errNoKey');
      case 'RATE_LIMIT':
        return translate(getAppPrefs().locale ?? 'id', 'ai.errRateLimit');
      default:
        return translate(getAppPrefs().locale ?? 'id', 'ai.errService');
    }
  }
  return translate(getAppPrefs().locale ?? 'id', 'ai.errGeneric');
}

export function useChat(initialQuery?: string, options?: UseChatOptions) {
  const { context, userId } = options ?? {};
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const [suggestions, setSuggestions] = useState<QuickSuggestion[]>(buildSuggestionLabels(DEFAULT_SUGGESTION_KEYS));
  const scrollViewRef = useRef<any>(null);
  const isMounted = useRef(true);
  const hasSentInitial = useRef(false);
  const restoreDone = useRef(false);
  const sessionIdRef = useRef<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
      abortRef.current?.abort();
    };
  }, []);

  useEffect(() => {
    if (!userId) {
      restoreDone.current = true;
      return;
    }
    let active = true;
    (async () => {
      const result = await loadLatestSession(userId);
      if (!active) return;
      restoreDone.current = true;
      if (result && result.messages.length > 0) {
        sessionIdRef.current = result.session.id;
        setMessages(
          result.messages.map((m) => ({
            id: m.id,
            role: m.role,
            content: m.content,
            timestamp: new Date(m.createdAt),
          }))
        );
        setShowSuggestions(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [userId]);

  const scrollToBottom = useCallback(() => {
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  }, []);

  useEffect(() => {
    if (messages.length > 0) {
      scrollToBottom();
    }
  }, [messages, scrollToBottom]);

  const addMessage = useCallback((role: ChatMessage['role'], content: string) => {
    const newMessage: ChatMessage = {
      id: generateId(),
      role,
      content,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, newMessage]);
    return newMessage.id;
  }, []);

  const persist = useCallback(
    async (sessionId: string, role: 'user' | 'assistant', content: string) => {
      try {
        await appendMessage(sessionId, role, content);
      } catch {
        console.warn('Gagal menyimpan pesan chat.');
      }
    },
    []
  );

  const sendMessage = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || isTyping) return;
      if (!restoreDone.current) return;

      setInputText('');
      setShowSuggestions(false);
      addMessage('user', trimmed);

      let sessionId = sessionIdRef.current;
      if (!sessionId && userId) {
        const created = await createSession(userId, trimmed.slice(0, 60));
        if (created) {
          sessionIdRef.current = created;
          sessionId = created;
        }
      }
      if (sessionId) {
        persist(sessionId, 'user', trimmed);
      }

      const history: ChatTurn[] = messages
        .slice(-HISTORY_LIMIT)
        .map((m) => ({ role: m.role === 'user' ? 'user' : 'model', text: m.content }));
      const last = messages[messages.length - 1];
      const alreadyAppended = last && last.role === 'user' && last.content === trimmed;
      if (!alreadyAppended) {
        history.push({ role: 'user', text: trimmed });
      }

      setIsTyping(true);
      const controller = new AbortController();
      abortRef.current = controller;

      let reply: string;
      try {
        reply = await askGemini({
          systemPrompt: buildSystemPrompt(context),
          history,
          signal: controller.signal,
        });
      } catch (error) {
        if (!isMounted.current) return;
        reply = errorMessage(error);
      } finally {
        abortRef.current = null;
      }

      if (!isMounted.current) return;

      addMessage('assistant', reply);
      if (sessionId) {
        persist(sessionId, 'assistant', reply);
      }
      setIsTyping(false);
      setSuggestions(pickFollowUps(trimmed));
      setShowSuggestions(true);
    },
    [addMessage, isTyping, messages, persist, context, userId]
  );

  useEffect(() => {
    if (initialQuery && !hasSentInitial.current) {
      hasSentInitial.current = true;
      sendMessage(initialQuery);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialQuery]);

  const handleInputChange = useCallback(
    (text: string) => {
      setInputText(text);
      if (text.trim() && showSuggestions) {
        setShowSuggestions(false);
      }
    },
    [showSuggestions]
  );

  const handleSend = useCallback(() => {
    sendMessage(inputText);
  }, [inputText, sendMessage]);

  const toggleLike = useCallback((messageId: string, value: 'up' | 'down') => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    setMessages((prev) =>
      prev.map((msg) => {
        if (msg.id !== messageId) return msg;
        const current = msg.likeStatus || 'none';
        return { ...msg, likeStatus: current === value ? 'none' : value };
      })
    );
  }, []);

  const copyMessage = useCallback(async (messageId: string) => {
    const msg = messages.find((m) => m.id === messageId);
    if (!msg) return;
    try {
      await Clipboard.setStringAsync(msg.content);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    } catch {
      // no-op: clipboard unsupported on this platform
    }
  }, [messages]);

  const shareMessage = useCallback(async (messageId: string) => {
    const msg = messages.find((m) => m.id === messageId);
    if (!msg) return;
    try {
      await Share.share({ message: msg.content });
    } catch {
      // no-op: user dismissed share sheet
    }
  }, [messages]);

  const resetChat = useCallback(() => {
    setMessages([]);
    setInputText('');
    setIsTyping(false);
    setSuggestions(buildSuggestionLabels(DEFAULT_SUGGESTION_KEYS));
    setShowSuggestions(true);
    sessionIdRef.current = null;
    hasSentInitial.current = true;
    restoreDone.current = true;
  }, []);

  const revealSuggestions = useCallback(() => {
    setShowSuggestions(true);
  }, []);

  return {
    messages,
    inputText,
    isTyping,
    showSuggestions,
    suggestions,
    scrollViewRef,
    setInputText,
    handleInputChange,
    handleSend,
    sendMessage,
    toggleLike,
    copyMessage,
    shareMessage,
    addMessage,
    resetChat,
    revealSuggestions,
  };
}