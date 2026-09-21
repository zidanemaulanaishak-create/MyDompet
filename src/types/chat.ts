export type MessageRole = 'user' | 'assistant';

export interface ChatMessage {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: Date;
  isStreaming?: boolean;
  likeStatus?: 'none' | 'up' | 'down';
}

export interface QuickSuggestion {
  id: string;
  label: string;
  icon?: string;
}

export interface AIActionBarAction {
  icon: string;
  label: string;
  onPress: () => void;
  variant?: 'default' | 'destructive';
}

export interface ChatState {
  messages: ChatMessage[];
  inputText: string;
  isTyping: boolean;
  showSuggestions: boolean;
  suggestions: QuickSuggestion[];
}