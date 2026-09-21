import { useState, useCallback, useRef, useEffect } from 'react';
import * as Clipboard from 'expo-clipboard';
import { Share } from 'react-native';
import * as Haptics from 'expo-haptics';
import { ChatMessage, QuickSuggestion } from '@/types/chat';
import {
  askGemini,
  buildSystemPrompt,
  GeminiError,
  type ChatContextSnapshot,
  type ChatTurn,
} from '@/services/ai';
import { appendMessage, createSession, loadLatestSession } from '@/services/chatDb';

const DEFAULT_SUGGESTIONS: QuickSuggestion[] = [
  { id: '1', label: 'Berapa target tabungan harian saya?' },
  { id: '2', label: 'Tips hemat bulan ini' },
  { id: '3', label: 'Alokasi dana darurat' },
  { id: '4', label: 'Catat pengeluaran makan hari ini' },
  { id: '5', label: 'Cek ringkasan minggu ini' },
  { id: '6', label: 'Buatkan budget 50/30/20' },
];

const FOLLOW_UP_SUGGESTIONS: QuickSuggestion[][] = [
  [
    { id: 'f1a', label: 'Bagaimana cara mempercepatnya?' },
    { id: 'f1b', label: 'Ide tambahan penghasilan' },
    { id: 'f1c', label: 'Simulasikan target 6 bulan' },
    { id: 'f1d', label: 'Ingatkan saya tiap minggu' },
  ],
  [
    { id: 'f2a', label: 'Kategori mana yang paling boros?' },
    { id: 'f2b', label: 'Buatkan rencana mingguan' },
    { id: 'f2c', label: 'Bandingkan dengan bulan lalu' },
    { id: 'f2d', label: 'Tips hemat makan di luar' },
  ],
  [
    { id: 'f3a', label: 'Instrumen apa yang cocok?' },
    { id: 'f3b', label: 'Berapa lama waktu tercapainya?' },
    { id: 'f3c', label: 'Risiko tiap instrumen?' },
    { id: 'f3d', label: 'Mulai dari nominal kecil' },
  ],
];

const HISTORY_LIMIT = 16;

export interface UseChatOptions {
  context?: ChatContextSnapshot;
  userId?: string;
}

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

function pickFollowUps(text: string): QuickSuggestion[] {
  const lower = text.toLowerCase();
  if (/target|tabungan|darurat/.test(lower)) return FOLLOW_UP_SUGGESTIONS[0];
  if (/hemat|boros|efisien|penghemat/.test(lower)) return FOLLOW_UP_SUGGESTIONS[1];
  if (/investasi|risiko|instrumen|saham|reksadana/.test(lower)) return FOLLOW_UP_SUGGESTIONS[2];
  return DEFAULT_SUGGESTIONS;
}

function errorMessage(error: unknown): string {
  if (error instanceof GeminiError) {
    switch (error.code) {
      case 'NO_KEY':
        return 'AI belum dikonfigurasi. Tambahkan EXPO_PUBLIC_GEMINI_API_KEY di file .env lalu restart aplikasi.';
      case 'RATE_LIMIT':
        return 'Kuota gratis Gemini sedang habis. Coba lagi beberapa saat lagi.';
      default:
        return 'Maaf, layanan AI sedang bermasalah. Cek koneksimu dan coba lagi.';
    }
  }
  return 'Maaf, terjadi kesalahan. Coba lagi ya.';
}

export function useChat(initialQuery?: string, options?: UseChatOptions) {
  const { context, userId } = options ?? {};
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const [suggestions, setSuggestions] = useState<QuickSuggestion[]>(DEFAULT_SUGGESTIONS);
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
    setSuggestions(DEFAULT_SUGGESTIONS);
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