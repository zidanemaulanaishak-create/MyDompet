import { parseInsightJson } from '@/utils/insights';
import { getAppPrefs } from '@/utils/appPrefs';
import type { Locale } from '@/i18n';

export interface ChatContextSnapshot {
  userName: string;
  occupation: string | null;
  mainIncome: number;
  monthIncome: number;
  monthExpense: number;
  totalIncome: number;
  totalExpense: number;
  budgetLimit: number;
  budgetSpent: number;
  prevMonthExpense: number;
  transactionCount: number;
  topExpenseCategory: { label: string; total: number } | null;
  budgetHits: { label: string; spent: number; limit: number; percent: number }[];
  recentTransactions: string[];
  dataVersion: string;
}

export interface InsightResult {
  insight: string;
  suggestions: string[];
}

export interface ChatTurn {
  role: 'user' | 'model';
  text: string;
}

export type AiErrorCode = 'NO_KEY' | 'RATE_LIMIT' | 'API';

export class GeminiError extends Error {
  readonly code: AiErrorCode;

  constructor(code: AiErrorCode, message: string) {
    super(message);
    this.name = 'GeminiError';
    this.code = code;
  }
}

function personaFor(locale: Locale): string {
  if (locale === 'en') {
    return `You are MyGpt, a personal finance assistant in the MyDompet app.
Respond in clear, professional English.
Keep answers short, concise, and easy to understand (max ~200 words).
Base your answers on the user data below. Never invent numbers or data;
if data is insufficient, say so and give advice.
Always write amounts in Rupiah format like "Rp 25,000".`;
  }
  return `Kamu adalah MyGpt, asisten keuangan pribadi dalam aplikasi MyDompet.
Gunakan Bahasa Indonesia yang santai tapi profesional.
Jawablah dengan ringkas, padat, dan mudah dipahami (maksimal sekitar 200 kata).
Utamakan data pengguna berikut. Jangan mengarang angka atau data yang tidak tersedia;
jika datanya kurang, sampaikan keterbatan itu dan beri saran.
Selalu tuliskan nominal dalam format Rupiah seperti "Rp 25.000".`;
}

function line(label: string, value: string): string {
  return value ? `- ${label}: ${value}` : '';
}

function renderDataBlock(ctx: ChatContextSnapshot, locale: Locale): string {
  const en = locale === 'en';
  const occupationLabels: Record<string, string> = en
    ? { pekerja: 'Employee', pelajar: 'Student', mahasiswa: 'College student' }
    : { pekerja: 'Pekerja', pelajar: 'Pelajar', mahasiswa: 'Mahasiswa' };

  const top = ctx.topExpenseCategory;
  const hits = ctx.budgetHits
    .map(
      (h) =>
        `- Budget ${h.label}: ${h.percent}% ${en ? 'used' : 'terpakai'} (${formatIdr(h.spent, en)} ${en ? 'of' : 'dari'} ${formatIdr(h.limit, en)})`
    )
    .join('\n');

  const data = [
    line(en ? 'Name' : 'Nama', ctx.userName),
    line(en ? 'Occupation' : 'Profesi', ctx.occupation ? occupationLabels[ctx.occupation] ?? ctx.occupation : ''),
    line(en ? 'Monthly income (profile setting)' : 'Pendapatan bulanan (setting profil)', formatIdr(ctx.mainIncome, en)),
    '',
    line(en ? 'Income this month (transactions)' : 'Pemasukan bulan ini (transaksi)', formatIdr(ctx.monthIncome, en)),
    line(en ? 'Expense this month (transactions)' : 'Pengeluaran bulan ini (transaksi)', formatIdr(ctx.monthExpense, en)),
    line(en ? 'Last month expense (transactions)' : 'Pengeluaran bulan lalu (transaksi)', formatIdr(ctx.prevMonthExpense, en)),
    line(en ? 'Recorded transactions count' : 'Jumlah transaksi tercatat', String(ctx.transactionCount)),
    '',
    line(en ? 'Total income all periods' : 'Pemasukan total semua periode', formatIdr(ctx.totalIncome, en)),
    line(en ? 'Total expense all periods' : 'Pengeluaran total semua periode', formatIdr(ctx.totalExpense, en)),
    '',
    line(en ? 'Total budget this month' : 'Total budget bulan ini', formatIdr(ctx.budgetLimit, en)),
    line(en ? 'Budget used' : 'Terpakai dari budget', formatIdr(ctx.budgetSpent, en)),
    hits,
    top ? line(en ? 'Top expense category this month' : 'Kategori pengeluaran terbesar bulan ini', `${top.label} (${formatIdr(top.total, en)})`) : '',
  ];

  const recent =
    ctx.recentTransactions && ctx.recentTransactions.length > 0
      ? `<${en ? 'recent_transactions' : 'transaksi_terakhir'}>\n${ctx.recentTransactions.join('\n')}\n</${en ? 'recent_transactions' : 'transaksi_terakhir'}>`
      : en
        ? 'No recorded transactions yet.'
        : 'Belum ada transaksi tercatat.';

  return `<${en ? 'user_financial_data' : 'data_keuangan_pengguna'}>\n${data.filter(Boolean).join('\n')}\n${recent}\n</${en ? 'user_financial_data' : 'data_keuangan_pengguna'}>`;
}

function currentLocale(): Locale {
  return getAppPrefs().locale ?? 'id';
}

export function buildSystemPrompt(ctx?: ChatContextSnapshot): string {
  const locale = currentLocale();
  if (!ctx) {
    return `${personaFor(locale)}

${locale === 'en'
  ? 'Note: user financial data has not been loaded yet. Answer generally and ask the user to provide data when needed.'
  : 'Catatan: data keuangan pengguna belum dimuat. Jawab secara umum dan minta pengguna menyediakan data bila perlu.'}`;
  }

  return `${personaFor(locale)}

${renderDataBlock(ctx, locale)}

${locale === 'en'
  ? 'Use the <user_financial_data> above as the basis for your answers.'
  : 'Gunakan <data_keuangan_pengguna> di atas sebagai dasar jawabanmu.'}`;
}

export function buildInsightPrompt(ctx: ChatContextSnapshot): string {
  const locale = currentLocale();
  if (locale === 'en') {
    return `${personaFor(locale)}

${renderDataBlock(ctx, locale)}

TASK:
Based on <user_financial_data> above, create ONE insight and THREE financial suggestions for the user.
Return ONLY valid JSON with no extra text, no markdown, in this format:
{"insight":"one to two sentence most important insight","suggestions":["short suggestion 1","short suggestion 2","short suggestion 3"]}

Rules:
- The insight must be based on the data above. Do not invent numbers or categories.
- At least one suggestion must relate directly to that insight.
- If data is sparse (e.g. only a profile income with no transactions), honestly state that data is not enough and suggest starting to log transactions.
- Use amounts in "Rp 25,000" format.`;
  }
  return `${personaFor(locale)}

${renderDataBlock(ctx, locale)}

TUGAS:
Berdasarkan <data_keuangan_pengguna> di atas, buat satu wawasan (insight) dan tiga saran keuangan untuk pengguna.
Kembalikan HANYA JSON valid tanpa teks lain, tanpa markdown, dengan format:
{"insight":"satu sampai dua kalimat wawasan terpenting","suggestions":["saran singkat 1","saran singkat 2","saran singkat 3"]}

Aturan:
- Wawasan wajib berdasar data di atas. Jangan mengarang angka atau kategori.
- Minimal satu saran harus berhubungan langsung dengan wawasan tersebut.
- Jika data masih minim (misalnya baru pendapatan profil tanpa transaksi), sampaikan secara jujur bahwa data belum cukup dan beri saran memulai pencatatan.
- Gunakan nominal dalam format "Rp 25.000".`;
}

export async function requestInsight(
  ctx: ChatContextSnapshot,
  fallback: InsightResult
): Promise<InsightResult> {
  try {
    const locale = currentLocale();
    const text = await askGemini({
      systemPrompt: buildInsightPrompt(ctx),
      history: [
        {
          role: 'user',
          text:
            locale === 'en'
              ? 'Analyze the data and produce an insight in JSON format.'
              : 'Analisis data dan hasilkan insight dalam format JSON.',
        },
      ],
    });
    const parsed = parseInsightJson(text);
    return parsed ?? fallback;
  } catch {
    return fallback;
  }
}

function formatIdr(n: number, en = false): string {
  const sign = n < 0 ? '-' : '';
  const grouped = Math.abs(Math.round(n)).toLocaleString(en ? 'en-US' : 'id-ID');
  return `${sign}Rp ${grouped}`;
}

export function geminiModelList(): string[] {
  const primary = process.env.EXPO_PUBLIC_GEMINI_MODEL?.trim() || 'gemini-3.6-flash';
  const fallback = process.env.EXPO_PUBLIC_GEMINI_FALLBACK_MODEL?.trim();
  const list = [primary, fallback, 'gemini-3.5-flash', 'gemini-2.5-flash'].filter(
    (m): m is string => !!m
  );
  return [...new Set(list)];
}

async function serverErrorMessage(res: Response): Promise<string> {
  try {
    const raw = await res.text();
    const parsed = JSON.parse(raw);
    const msg = parsed?.error?.message;
    if (typeof msg === 'string' && msg) return msg.slice(0, 240);
  } catch {
    // respons bukan JSON; abaikan
  }
  return '';
}

export async function askGemini(opts: {
  systemPrompt: string;
  history: ChatTurn[];
  signal?: AbortSignal;
}): Promise<string> {
  const apiKey = process.env.EXPO_PUBLIC_GEMINI_API_KEY?.trim();
  if (!apiKey) {
    throw new GeminiError('NO_KEY', 'GEMINI_API_KEY belum diisi.');
  }

  const body = {
    systemInstruction: { parts: [{ text: opts.systemPrompt }] },
    contents: opts.history.map((t) => ({ role: t.role, parts: [{ text: t.text }] })),
    generationConfig: {
      thinkingConfig: { thinkingBudget: 0 },
      maxOutputTokens: 1024,
      temperature: 0.7,
    },
  };

  let sawRateLimit = false;
  let lastCode: AiErrorCode = 'API';
  let lastMessage = 'Layanan AI gagal.';

  for (const model of geminiModelList()) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;

    let res: Response;
    try {
      res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': apiKey,
        },
        body: JSON.stringify(body),
        signal: opts.signal,
      });
    } catch (e) {
      if (e instanceof Error && e.name === 'AbortError') {
        throw new GeminiError('API', 'Permintaan dibatalkan.');
      }
      lastCode = 'API';
      lastMessage = 'Gagal terhubung ke layanan AI.';
      continue;
    }

    if (res.status === 429) {
      sawRateLimit = true;
      lastCode = 'RATE_LIMIT';
      lastMessage = 'Kuota gratis Gemini habis sementara.';
      continue;
    }

    if (!res.ok) {
      lastCode = 'API';
      const serverMsg = await serverErrorMessage(res);
      lastMessage = serverMsg || `Layanan AI gagal (HTTP ${res.status}).`;
      continue;
    }

    const data: any = await res.json();

    if (data?.promptFeedback?.blockReason) {
      lastCode = 'API';
      lastMessage = 'Permintaan diblokir oleh filter konten.';
      continue;
    }

    const text =
      data?.candidates?.[0]?.content?.parts
        ?.map((part: any) => (typeof part?.text === 'string' ? part.text : ''))
        .join('')
        .trim();

    if (!text) {
      lastCode = 'API';
      lastMessage = 'Layanan AI tidak mengembalikan jawaban.';
      continue;
    }

    return text;
  }

  throw new GeminiError(sawRateLimit ? 'RATE_LIMIT' : lastCode, lastMessage);
}