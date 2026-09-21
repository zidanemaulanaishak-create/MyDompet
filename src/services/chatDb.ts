import { supabase } from '@/lib/supabase';

export interface ChatMessageRow {
  id: string;
  sessionId: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt: string;
}

export interface ChatSessionRow {
  id: string;
  userId: string;
  title: string;
  createdAt: string;
  updatedAt: string;
}

interface RawSession {
  id: string;
  user_id: string;
  title: string;
  created_at: string;
  updated_at: string;
}

interface RawMessage {
  id: string;
  session_id: string;
  role: 'user' | 'assistant';
  content: string;
  created_at: string;
}

function mapSession(row: RawSession): ChatSessionRow {
  return {
    id: row.id,
    userId: row.user_id,
    title: row.title,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapMessage(row: RawMessage): ChatMessageRow {
  return {
    id: row.id,
    sessionId: row.session_id,
    role: row.role,
    content: row.content,
    createdAt: row.created_at,
  };
}

export async function loadLatestSession(
  userId: string
): Promise<{ session: ChatSessionRow; messages: ChatMessageRow[] } | null> {
  const { data: session, error: sessionError } = await supabase
    .from('chat_sessions')
    .select('*')
    .eq('user_id', userId)
    .order('updated_at', { ascending: false })
    .limit(1)
    .single();

  if (sessionError || !session) return null;

  const { data: messages, error: messagesError } = await supabase
    .from('chat_messages')
    .select('*')
    .eq('session_id', session.id)
    .order('created_at', { ascending: true })
    .limit(200);

  if (messagesError) return null;

  return {
    session: mapSession(session as RawSession),
    messages: (messages ?? []).map((m) => mapMessage(m as RawMessage)),
  };
}

export async function createSession(userId: string, title: string): Promise<string | null> {
  const { data, error } = await supabase
    .from('chat_sessions')
    .insert({ user_id: userId, title })
    .select()
    .single();

  return error || !data ? null : (data.id as string);
}

export async function appendMessage(
  sessionId: string,
  role: 'user' | 'assistant',
  content: string
): Promise<void> {
  await supabase.from('chat_messages').insert({ session_id: sessionId, role, content });
}