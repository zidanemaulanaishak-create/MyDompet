import { createClient } from 'jsr:@supabase/supabase-js@2';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

type NotificationType = 'budget' | 'goal';

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
  });
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return json({ ok: true });
  if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405);

  let payload: {
    userId?: unknown;
    type?: unknown;
    title?: unknown;
    body?: unknown;
    dedupeKey?: unknown;
    url?: unknown;
    data?: unknown;
  };
  try {
    payload = await req.json();
  } catch {
    return json({ error: 'Invalid JSON body' }, 400);
  }

  const userId = typeof payload.userId === 'string' ? payload.userId : '';
  const type: NotificationType = payload.type === 'goal' ? 'goal' : 'budget';
  const title = typeof payload.title === 'string' ? payload.title.trim() : '';
  const body = typeof payload.body === 'string' ? payload.body.trim() : '';
  const dedupeKey = typeof payload.dedupeKey === 'string' ? payload.dedupeKey.trim() : '';
  const url = typeof payload.url === 'string' && payload.url.startsWith('/') ? payload.url : null;
  const data =
    payload.data && typeof payload.data === 'object' && !Array.isArray(payload.data)
      ? (payload.data as Record<string, unknown>)
      : {};

  if (!userId || !title || !body || !dedupeKey) {
    return json({ error: 'userId, title, body and dedupeKey are required' }, 400);
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  const anonKey = Deno.env.get('SUPABASE_ANON_KEY');
  if (!supabaseUrl || !serviceRoleKey || !anonKey) {
    return json({ error: 'Supabase environment is not configured' }, 500);
  }

  const authHeader = req.headers.get('Authorization') ?? '';
  const caller = createClient(supabaseUrl, anonKey, {
    global: { headers: { Authorization: authHeader } },
  });
  const {
    data: { user },
    error: authError,
  } = await caller.auth.getUser();
  if (authError || !user || user.id !== userId) {
    return json({ error: 'Unauthorized' }, 403);
  }

  const admin = createClient(supabaseUrl, serviceRoleKey);

  const { data: profile, error: profileError } = await admin
    .from('profiles')
    .select('budget_reminder, goal_reminder')
    .eq('id', userId)
    .maybeSingle();
  if (profileError) return json({ error: profileError.message }, 500);
  if (!profile) return json({ error: 'Profile not found' }, 404);

  const enabled = type === 'budget' ? profile.budget_reminder : profile.goal_reminder;
  if (!enabled) return json({ skipped: 'disabled' });

  const { data: inserted, error: insertError } = await admin
    .from('notifications')
    .upsert(
      {
        user_id: userId,
        type,
        title,
        body,
        data: { ...data, ...(url ? { url } : {}) },
        dedupe_key: dedupeKey,
      },
      { onConflict: 'user_id,dedupe_key', ignoreDuplicates: true }
    )
    .select('id')
    .maybeSingle();
  if (insertError) return json({ error: insertError.message }, 500);
  if (!inserted) return json({ skipped: 'duplicate' });

  const { data: tokens, error: tokenError } = await admin
    .from('push_tokens')
    .select('token')
    .eq('user_id', userId);
  if (tokenError) return json({ error: tokenError.message }, 500);

  const recipients = (tokens ?? []).map((row) => row.token as string).filter(Boolean);
  if (recipients.length === 0) {
    return json({ ok: true, id: inserted.id, sent: 0 });
  }

  const expoToken = Deno.env.get('EXPO_ACCESS_TOKEN')?.trim();
  if (!expoToken) {
    return json({ error: 'EXPO_ACCESS_TOKEN is not configured', id: inserted.id }, 500);
  }

  const messages = recipients.map((to) => ({
    to,
    title,
    body,
    sound: 'default',
    channelId: 'mydompet-default',
    data: { ...data, id: inserted.id, type, ...(url ? { url } : {}) },
  }));

  const response = await fetch('https://api.expo.dev/v2/push/send', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${expoToken}`,
    },
    body: JSON.stringify(messages),
  });
  if (!response.ok) {
    return json({ error: `Expo push failed (${response.status})`, id: inserted.id }, 502);
  }

  return json({ ok: true, id: inserted.id, sent: messages.length });
});
