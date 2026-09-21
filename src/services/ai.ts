import { parseInsightJson } from '@/utils/insights';

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

const PERSONA = `Kamu adalah MyGpt, asisten keuangan pribadi dalam aplikasi MyDompet.
Gunakan Bahasa Indonesia yang santai tapi profesional.
Jawablah dengan ringkas, padat, dan mudah dipahami (maksimal sekitar 200 kata).
Utamakan data pengguna berikut. Jangan mengarang angka atau data yang tidak tersedia;
jika datanya kurang, sampaikan keterbatan itu dan beri saran.
Selalu tuliskan nominal dalam format Rupiah seperti "Rp 25.000".`;

function line(label: string, value: string): string {
  return value ? `- ${label}: ${value}` : '';
}

function renderDataBlock(ctx: ChatContextSnapshot): string {
  const occupationLabels: Record<string, string> = {
    pekerja: 'Pekerja',
    pelajar: 'Pelajar',
    mahasiswa: 'Mahasiswa',
  };

  const top = ctx.topExpenseCategory;
  const hits = ctx.budgetHits
    .map(
      (h) =>
        `- Budget ${h.label}: ${h.percent}% terpakai (${formatIdr(h.spent)} dari ${formatIdr(h.limit)})`
    )
    .join('\n');

  const data = [
    line('Nama', ctx.userName),
    line('Profesi', ctx.occupation ? occupationLabels[ctx.occupation] ?? ctx.occupation : ''),
    line('Pendapatan bulanan (setting profil)', formatIdr(ctx.mainIncome)),
    '',
    line('Pemasukan bulan ini (transaksi)', formatIdr(ctx.monthIncome)),
    line('Pengeluaran bulan ini (transaksi)', formatIdr(ctx.monthExpense)),
    line('Pengeluaran bulan lalu (transaksi)', formatIdr(ctx.prevMonthExpense)),
    line('Jumlah transaksi tercatat', String(ctx.transactionCount)),
    '',
    line('Pemasukan total semua periode', formatIdr(ctx.totalIncome)),
    line('Pengeluaran total semua periode', formatIdr(ctx.totalExpense)),
    '',
    line('Total budget bulan ini', formatIdr(ctx.budgetLimit)),
    line('Terpakai dari budget', formatIdr(ctx.budgetSpent)),
    hits,
    top ? line('Kategori pengeluaran terbesar bulan ini', `${top.label} (${formatIdr(top.total)})`) : '',
  ];

  const recent =
    ctx.recentTransactions && ctx.recentTransactions.length > 0
      ? `<transaksi_terakhir>\n${ctx.recentTransactions.join('\n')}\n</transaksi_terakhir>`
      : 'Belum ada transaksi tercatat.';

  return `<data_keuangan_pengguna>\n${data.filter(Boolean).join('\n')}\n${recent}\n</data_keuangan_pengguna>`;
}

export function buildSystemPrompt(ctx?: ChatContextSnapshot): string {
  if (!ctx) {
    return `${PERSONA}

Catatan: data keuangan pengguna belum dimuat. Jawab secara umum dan minta pengguna menyediakan data bila perlu.`;
  }

  return `${PERSONA}

${renderDataBlock(ctx)}

Gunakan <data_keuangan_pengguna> di atas sebagai dasar jawabanmu.`;
}

export function buildInsightPrompt(ctx: ChatContextSnapshot): string {
  return `${PERSONA}

${renderDataBlock(ctx)}

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
    const text = await askGemini({
      systemPrompt: buildInsightPrompt(ctx),
      history: [{ role: 'user', text: 'Analisis data dan hasilkan insight dalam format JSON.' }],
    });
    const parsed = parseInsightJson(text);
    return parsed ?? fallback;
  } catch {
    return fallback;
  }
}

function formatIdr(n: number): string {
  const sign = n < 0 ? '-' : '';
  return `${sign}Rp ${Math.abs(Math.round(n)).toLocaleString('id-ID')}`;
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

  const model = process.env.EXPO_PUBLIC_GEMINI_MODEL?.trim() || 'gemini-3.6-flash';
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;

  const body = {
    systemInstruction: { parts: [{ text: opts.systemPrompt }] },
    contents: opts.history.map((t) => ({ role: t.role, parts: [{ text: t.text }] })),
    generationConfig: {
      thinkingConfig: { thinkingBudget: 0 },
      maxOutputTokens: 1024,
      temperature: 0.7,
    },
  };

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
    throw new GeminiError('API', 'Gagal terhubung ke layanan AI.');
  }

  if (res.status === 429) {
    throw new GeminiError('RATE_LIMIT', 'Kuota gratis Gemini habis sementara.');
  }

  if (!res.ok) {
    throw new GeminiError('API', `Layanan AI gagal (HTTP ${res.status}).`);
  }

  const data: any = await res.json();

  if (data?.promptFeedback?.blockReason) {
    throw new GeminiError('API', 'Permintaan diblokir oleh filter konten.');
  }

  const text =
    data?.candidates?.[0]?.content?.parts
      ?.map((part: any) => (typeof part?.text === 'string' ? part.text : ''))
      .join('')
      .trim();

  if (!text) {
    throw new GeminiError('API', 'Layanan AI tidak mengembalikan jawaban.');
  }

  return text;
}