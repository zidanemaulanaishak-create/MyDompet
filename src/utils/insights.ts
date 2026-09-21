import type { ChatContextSnapshot, InsightResult } from '@/services/ai';
import { formatRupiah } from '@/utils/reports';

export function parseInsightJson(text: string): InsightResult | null {
  const start = text.indexOf('{');
  const end = text.lastIndexOf('}');
  if (start === -1 || end === -1 || end < start) return null;
  try {
    const raw = JSON.parse(text.slice(start, end + 1));
    if (typeof raw?.insight !== 'string' || !Array.isArray(raw?.suggestions)) {
      return null;
    }
    const insight = raw.insight.trim();
    const suggestions = (raw.suggestions as unknown[])
      .filter((s: unknown): s is string => typeof s === 'string' && s.trim().length > 0)
      .map((s) => s.trim())
      .slice(0, 3);
    if (!insight) return null;
    return { insight, suggestions };
  } catch {
    return null;
  }
}

function withCount(count: number): string {
  return count === 1 ? 'satu transaksi' : `${count} transaksi`;
}

export function buildRuleInsight(ctx: ChatContextSnapshot): InsightResult {
  if (ctx.transactionCount === 0) {
    return {
      insight:
        'Belum ada transaksi tercatat. Mulai catat pemasukan dan pengeluaran agar budget serta saran MyGpt bisa bekerja untukmu.',
      suggestions: [
        'Bagaimana cara mencatat transaksi?',
        'Contoh budget bulanan untuk pemula',
        'Berapa persen gaji sebaiknya disimpan?',
      ],
    };
  }

  if (ctx.monthIncome === 0 && ctx.monthExpense === 0) {
    return {
      insight:
        'Belum ada transaksi bulan ini. Catat aktivitas keuanganmu supaya kamu mendapatkan insight dan saran yang relevan.',
      suggestions: [
        `Rekap transaksi bulan lalu (${withCount(ctx.transactionCount)})`,
        'Cara membuat budget bulan ini',
        'Tips mencatat keuangan yang rutin',
      ],
    };
  }

  const realRisk = ctx.budgetHits.filter((h) => h.percent >= 90);
  const worst = realRisk[0] ?? null;

  if (worst) {
    const sisa = Math.max(0, 100 - worst.percent);
    return {
      insight:
        sisa <= 0
          ? `Budget ${worst.label} sudah habis terpakai (${formatRupiah(worst.spent)} dari limit ${formatRupiah(worst.limit)}).`
          : `Perhatian: budget ${worst.label} sudah ${worst.percent}% terpakai (${formatRupiah(worst.spent)} dari ${formatRupiah(worst.limit)}), sisa hanya ${sisa}%.`,
      suggestions: [
        `Tips kurangi pengeluaran ${worst.label}`,
        'Rincian pengeluaran budget terbesar bulan ini',
        'Rekomendasi ulang alokasi budget bulan ini',
      ],
    };
  }

  const top = ctx.topExpenseCategory;

  if (top && ctx.monthExpense > 0) {
    const share = Math.round((top.total / ctx.monthExpense) * 100);
    return {
      insight: `Kategori pengeluaran terbesar bulan ini adalah ${top.label} (${formatRupiah(top.total)}, ${share}% dari total pengeluaran).`,
      suggestions: [
        `Tips hemat untuk ${top.label}`,
        'Cara memangkas pengeluaran rutin',
        'Ringkasan keuangan bulan ini',
      ],
    };
  }

  if (ctx.prevMonthExpense > 0 && ctx.monthExpense > 0) {
    const pct = Math.round(
      ((ctx.monthExpense - ctx.prevMonthExpense) / ctx.prevMonthExpense) * 100
    );
    const direction = pct > 0 ? 'lebih tinggi' : 'lebih hemat';
    return {
      insight: `Pengeluaran bulan ini ${direction} ${Math.abs(pct)}% dibanding bulan lalu (${formatRupiah(ctx.monthExpense)} vs ${formatRupiah(ctx.prevMonthExpense)}).`,
      suggestions: [
        pct > 0 ? 'Cara menurunkan pengeluaran bulan depan' : 'Ide menambah pemasukan agar saldo makin sehat',
        'Ringkasan keuangan bulan ini',
        'Strategi alokasi gaji bulanan',
      ],
    };
  }

  const balance = ctx.mainIncome + ctx.monthIncome - ctx.monthExpense;

  if (balance < 0) {
    return {
      insight:
        'Pengeluaran bulan ini melebihi jumlah pemasukanmu. Pertimbangkan menyusun ulang budget agar sisa keuangan tetap sehat.',
      suggestions: [
        'Strategi menekan pengeluaran bulan ini',
        'Cara menyusun budget yang tidak melebihi pemasukan',
        'Ringkasan keuangan bulan ini',
      ],
    };
  }

  return {
    insight:
      'Keuanganmu terlihat terkendali. Terus catat transaksi secara rutin agar saran MyGpt makin akurat.',
    suggestions: [
      'Cara menaikkan jumlah tabungan',
      'Strategi alokasi gaji bulanan',
      'Ringkasan keuangan bulan ini',
    ],
  };
}