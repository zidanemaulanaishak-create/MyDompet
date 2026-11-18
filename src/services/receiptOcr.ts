import { Image as RNImage, Platform } from 'react-native';
import { ImageManipulator, SaveFormat } from 'expo-image-manipulator';
import { supabase } from '@/lib/supabase';
import { EXPENSE_CATEGORIES } from '@/constants/categories';
import { getAppPrefs } from '@/utils/appPrefs';
import { mockOcrFromUri } from '@/utils/mockOcr';

export interface ReceiptOcrResult {
  isReceipt: boolean;
  amount: number;
  merchant: string;
  date: string;
  categoryId: string;
  confidence: number;
}

export type ReceiptOcrErrorCode =
  | 'FILE_TOO_LARGE'
  | 'NOT_RECEIPT'
  | 'RATE_LIMIT'
  | 'NO_KEY'
  | 'BAD_INPUT'
  | 'UNSUPPORTED'
  | 'API';

export class ReceiptOcrError extends Error {
  readonly code: ReceiptOcrErrorCode;

  constructor(code: ReceiptOcrErrorCode, message: string) {
    super(message);
    this.name = 'ReceiptOcrError';
    this.code = code;
  }
}

const MAX_IMAGE_WIDTH = 1600;
const MAX_PDF_BYTES = 5 * 1024 * 1024;
const CATEGORY_IDS = EXPENSE_CATEGORIES.map((c) => c.id);

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

function guessMimeType(uri: string, provided?: string): string {
  if (provided && provided.trim()) return provided.trim().toLowerCase();
  const ext = uri.split('?')[0].split('#')[0].split('.').pop()?.toLowerCase() ?? '';
  switch (ext) {
    case 'png':
      return 'image/png';
    case 'webp':
      return 'image/webp';
    case 'heic':
      return 'image/heic';
    case 'heif':
      return 'image/heif';
    case 'pdf':
      return 'application/pdf';
    default:
      return 'image/jpeg';
  }
}

function getImageSize(uri: string): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    RNImage.getSize(uri, (width, height) => resolve({ width, height }), reject);
  });
}

async function readWebBase64(uri: string): Promise<{ base64: string; size: number }> {
  const response = await fetch(uri);
  if (!response.ok) throw new ReceiptOcrError('API', 'Gagal membaca file.');
  const blob = await response.blob();
  const base64 = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = String(reader.result ?? '');
      resolve(result.includes(',') ? result.slice(result.indexOf(',') + 1) : result);
    };
    reader.onerror = () => reject(new ReceiptOcrError('API', 'Gagal membaca file.'));
    reader.readAsDataURL(blob);
  });
  return { base64, size: blob.size };
}

async function readNativeFile(uri: string): Promise<{ base64: string; size: number }> {
  const { File } = await import('expo-file-system');
  const file = new File(uri);
  const base64 = await file.base64();
  return { base64, size: file.size ?? 0 };
}

async function prepareImage(uri: string): Promise<{ base64: string; mimeType: string }> {
  let width: number | null = null;
  try {
    const size = await getImageSize(uri);
    if (size.width > MAX_IMAGE_WIDTH) width = MAX_IMAGE_WIDTH;
  } catch {
    width = null;
  }

  const context = ImageManipulator.manipulate(uri);
  if (width) context.resize({ width, height: null });
  const rendered = await context.renderAsync();
  const saved = await rendered.saveAsync({
    format: SaveFormat.JPEG,
    compress: 0.7,
    base64: true,
  });

  if (!saved.base64) {
    throw new ReceiptOcrError('API', 'Gagal mengolah gambar.');
  }

  return { base64: saved.base64, mimeType: 'image/jpeg' };
}

async function preparePdf(uri: string): Promise<{ base64: string; mimeType: string }> {
  const file = Platform.OS === 'web' ? await readWebBase64(uri) : await readNativeFile(uri);
  if (file.size > MAX_PDF_BYTES) {
    throw new ReceiptOcrError('FILE_TOO_LARGE', 'Ukuran PDF terlalu besar. Maksimal 5 MB.');
  }
  return { base64: file.base64, mimeType: 'application/pdf' };
}

function normalizeResult(raw: unknown): ReceiptOcrResult | null {
  if (!raw || typeof raw !== 'object') return null;
  const value = raw as Record<string, unknown>;
  if (value.isReceipt !== true) return null;

  const rawAmount = typeof value.amount === 'number' ? value.amount : Number(value.amount);
  const amount = Number.isFinite(rawAmount) ? Math.max(0, Math.round(rawAmount)) : 0;
  const merchant =
    typeof value.merchant === 'string' ? value.merchant.trim().slice(0, 120) : '';
  const date =
    typeof value.date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value.date.trim())
      ? value.date.trim()
      : todayIso();
  const categoryId =
    typeof value.categoryId === 'string' && CATEGORY_IDS.includes(value.categoryId)
      ? value.categoryId
      : 'other';
  const rawConfidence =
    typeof value.confidence === 'number' ? value.confidence : Number(value.confidence);
  const confidence = Number.isFinite(rawConfidence)
    ? Math.min(1, Math.max(0, rawConfidence))
    : 0.5;

  return { isReceipt: true, amount, merchant, date, categoryId, confidence };
}

function mapErrorCode(code: unknown): ReceiptOcrErrorCode {
  switch (code) {
    case 'FILE_TOO_LARGE':
    case 'NOT_RECEIPT':
    case 'RATE_LIMIT':
    case 'NO_KEY':
    case 'BAD_INPUT':
    case 'UNSUPPORTED':
    case 'API':
      return code;
    default:
      return 'API';
  }
}

async function readInvokeError(error: unknown): Promise<ReceiptOcrError> {
  const context = (error as { context?: Response })?.context;
  if (context && typeof context.json === 'function') {
    try {
      const body = (await context.json()) as { error?: unknown; message?: unknown };
      return new ReceiptOcrError(
        mapErrorCode(body?.error),
        typeof body?.message === 'string' ? body.message : 'Layanan OCR gagal.'
      );
    } catch {
      // fall through
    }
  }
  return new ReceiptOcrError('API', 'Layanan OCR gagal.');
}

export async function recognizeReceipt(uri: string, mimeTypeHint?: string): Promise<ReceiptOcrResult> {
  if (process.env.EXPO_PUBLIC_OCR_MOCK === '1') {
    const mock = mockOcrFromUri();
    return {
      isReceipt: true,
      amount: mock.amount,
      merchant: mock.merchant,
      date: todayIso(),
      categoryId: 'other',
      confidence: 0.9,
    };
  }

  const mimeType = guessMimeType(uri, mimeTypeHint);
  const prepared = mimeType === 'application/pdf' ? await preparePdf(uri) : await prepareImage(uri);
  const locale = getAppPrefs().locale ?? 'id';

  const { data, error } = await supabase.functions.invoke('ocr-receipt', {
    body: {
      imageBase64: prepared.base64,
      mimeType: prepared.mimeType,
      locale,
    },
  });

  if (error) throw await readInvokeError(error);

  if (data && typeof data === 'object' && (data as { ok?: unknown }).ok === false) {
    const failure = data as { error?: unknown; message?: unknown };
    throw new ReceiptOcrError(
      mapErrorCode(failure.error),
      typeof failure.message === 'string' ? failure.message : 'Layanan OCR gagal.'
    );
  }

  const result = normalizeResult((data as { result?: unknown })?.result);
  if (!result) {
    throw new ReceiptOcrError('NOT_RECEIPT', 'Gambar tidak terdeteksi sebagai struk.');
  }

  return result;
}
