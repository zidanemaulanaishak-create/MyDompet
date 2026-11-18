const ALLOWED_MIME = new Set([
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'image/heic',
  'image/heif',
  'application/pdf',
]);

const ALLOWED_CATEGORIES = [
  'food',
  'shopping',
  'transport',
  'bills',
  'health',
  'entertainment',
  'education',
  'personal',
  'gift',
  'other',
];

const MAX_BASE64_LENGTH = 7_000_000;

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

type ErrorCode = 'BAD_INPUT' | 'NO_KEY' | 'RATE_LIMIT' | 'API' | 'NOT_RECEIPT';

interface OcrResult {
  isReceipt: true;
  amount: number;
  merchant: string;
  date: string;
  categoryId: string;
  confidence: number;
}

const RESPONSE_SCHEMA = {
  type: 'OBJECT',
  properties: {
    isReceipt: {
      type: 'BOOLEAN',
      description: 'True only when the image is a purchase receipt or invoice.',
    },
    amount: {
      type: 'INTEGER',
      description: 'Final total amount actually paid, in whole rupiah. Never subtotal, cash tendered, or change.',
    },
    merchant: {
      type: 'STRING',
      description: 'Store or merchant name from the receipt header. Empty string when unreadable.',
    },
    date: {
      type: 'STRING',
      description: 'Transaction date formatted as YYYY-MM-DD. Empty string when unreadable.',
    },
    categoryId: {
      type: 'STRING',
      enum: ALLOWED_CATEGORIES,
      description: 'Best matching expense category id.',
    },
    confidence: {
      type: 'NUMBER',
      description: 'Confidence from 0 to 1 that the extracted fields are correct.',
    },
  },
  required: ['isReceipt', 'amount', 'merchant', 'date', 'categoryId', 'confidence'],
  propertyOrdering: ['isReceipt', 'amount', 'merchant', 'date', 'categoryId', 'confidence'],
};

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
  });
}

function fail(error: ErrorCode, message: string, status: number): Response {
  return json({ ok: false, error, message }, status);
}

function buildPrompt(locale: string, todayIso: string): string {
  if (locale === 'en') {
    return `You extract structured data from a purchase receipt photo.
Read the receipt carefully. Return the FINAL total actually paid by the customer.
Never return the subtotal, tax line, cash tendered, or change amount as the total.
Use the transaction date printed on the receipt. Today is ${todayIso}; if the date is unreadable use today's date.
Pick the single best category id from the allowed list.
If the image is not a receipt or invoice, set isReceipt to false and use 0 for amount.
Do not invent values. Leave merchant as an empty string when unreadable.`;
  }
  return `Kamu mengekstrak data terstruktur dari foto struk belanja.
Baca struk dengan teliti. Kembalikan TOTAL akhir yang benar-benar dibayar pelanggan.
Jangan pernah memakai subtotal, baris pajak, uang tunai, atau kembalian sebagai total.
Gunakan tanggal transaksi yang tercetak di struk. Hari ini ${todayIso}; jika tanggal tidak terbaca pakai tanggal hari ini.
Pilih satu id kategori yang paling cocok dari daftar yang diizinkan.
Jika gambar bukan struk atau invoice, set isReceipt menjadi false dan amount 0.
Jangan mengarang nilai. Kosongkan merchant jika tidak terbaca.`;
}

function normalize(raw: Record<string, unknown> | null, todayIso: string): OcrResult | null {
  if (!raw || raw.isReceipt !== true) return null;

  const rawAmount = typeof raw.amount === 'number' ? raw.amount : Number(raw.amount);
  const amount = Number.isFinite(rawAmount) ? Math.max(0, Math.round(rawAmount)) : 0;

  const merchant =
    typeof raw.merchant === 'string' ? raw.merchant.trim().slice(0, 120) : '';

  const date =
    typeof raw.date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(raw.date.trim())
      ? raw.date.trim()
      : todayIso;

  const categoryId =
    typeof raw.categoryId === 'string' && ALLOWED_CATEGORIES.includes(raw.categoryId)
      ? raw.categoryId
      : 'other';

  const rawConfidence = typeof raw.confidence === 'number' ? raw.confidence : Number(raw.confidence);
  const confidence = Number.isFinite(rawConfidence)
    ? Math.min(1, Math.max(0, rawConfidence))
    : 0.5;

  return { isReceipt: true, amount, merchant, date, categoryId, confidence };
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: CORS_HEADERS });
  }
  if (req.method !== 'POST') {
    return fail('BAD_INPUT', 'Method not allowed.', 405);
  }

  let payload: { imageBase64?: unknown; mimeType?: unknown; locale?: unknown };
  try {
    payload = await req.json();
  } catch {
    return fail('BAD_INPUT', 'Invalid JSON body.', 400);
  }

  const mimeType = typeof payload.mimeType === 'string' ? payload.mimeType.toLowerCase() : '';
  const rawBase64 = typeof payload.imageBase64 === 'string' ? payload.imageBase64 : '';
  const locale = payload.locale === 'en' ? 'en' : 'id';

  if (!rawBase64) {
    return fail('BAD_INPUT', 'imageBase64 is required.', 400);
  }
  if (!ALLOWED_MIME.has(mimeType)) {
    return fail('BAD_INPUT', `Unsupported mimeType: ${mimeType || '(empty)'}.`, 400);
  }

  const imageBase64 = rawBase64.includes(',')
    ? rawBase64.slice(rawBase64.indexOf(',') + 1)
    : rawBase64;

  if (imageBase64.length > MAX_BASE64_LENGTH) {
    return fail('BAD_INPUT', 'Image is too large after encoding.', 413);
  }

  const apiKey = Deno.env.get('GEMINI_API_KEY')?.trim();
  if (!apiKey) {
    return fail('NO_KEY', 'GEMINI_API_KEY is not configured.', 500);
  }

  const model = Deno.env.get('GEMINI_OCR_MODEL')?.trim() || 'gemini-3.6-flash';
  const todayIso = new Date().toISOString().slice(0, 10);
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;

  const body = {
    systemInstruction: { parts: [{ text: buildPrompt(locale, todayIso) }] },
    contents: [
      {
        role: 'user',
        parts: [
          { inline_data: { mime_type: mimeType, data: imageBase64 } },
          {
            text:
              locale === 'en'
                ? 'Extract the receipt data as JSON.'
                : 'Ekstrak data struk dalam format JSON.',
          },
        ],
      },
    ],
    generationConfig: {
      temperature: 0.1,
      maxOutputTokens: 512,
      responseMimeType: 'application/json',
      responseSchema: RESPONSE_SCHEMA,
      thinkingConfig: { thinkingBudget: 0 },
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
    });
  } catch {
    return fail('API', 'Could not reach the OCR service.', 502);
  }

  if (res.status === 429) {
    return fail('RATE_LIMIT', 'OCR quota is temporarily exhausted.', 429);
  }

  if (!res.ok) {
    let serverMessage = `OCR service failed (HTTP ${res.status}).`;
    try {
      const raw = await res.text();
      const parsed = JSON.parse(raw);
      const message = parsed?.error?.message;
      if (typeof message === 'string' && message) serverMessage = message.slice(0, 240);
    } catch {
      // ignore non-JSON error body
    }
    return fail('API', serverMessage, 502);
  }

  let data: any;
  try {
    data = await res.json();
  } catch {
    return fail('API', 'OCR service returned an invalid response.', 502);
  }

  if (data?.promptFeedback?.blockReason) {
    return fail('API', 'Request was blocked by the content filter.', 502);
  }

  const text = data?.candidates?.[0]?.content?.parts
    ?.map((part: any) => (typeof part?.text === 'string' ? part.text : ''))
    .join('')
    .trim();

  if (!text) {
    return fail('API', 'OCR service returned no text.', 502);
  }

  let parsedRaw: Record<string, unknown> | null;
  try {
    parsedRaw = JSON.parse(text);
  } catch {
    return fail('API', 'OCR service returned invalid JSON.', 502);
  }

  const result = normalize(parsedRaw, todayIso);
  if (!result) {
    return fail('NOT_RECEIPT', 'The image does not look like a receipt.', 422);
  }

  return json({ ok: true, result, model });
});
