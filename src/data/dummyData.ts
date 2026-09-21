export interface QuickActionItem {
  id: string;
  label: string;
  icon: string; // Iconify icon name (e.g. "ph:sparkle-fill")
  variant: 'dark' | 'light';
}

export interface TransactionItem {
  id: string;
  name: string;
  category: string;
  date: string;
  amount: string;
  icon: string; // Iconify icon name (e.g. "twemoji:pot-of-food")
  type?: 'expense' | 'income';
  amountValue?: number;
  currency?: string;
  categoryId?: string;
  note?: string;
  timestamp?: number;
}

export interface GoalItem {
  id: string;
  name: string;
  days: string;
  saved: string;
  target: string;
  icon: string; // Iconify icon name (e.g. "twemoji:laptop")
  progress: number; // 0..1
}

export const quickActions: QuickActionItem[] = [
  {
    id: '1',
    label: 'AI Assitant',
    icon: 'ph:sparkle-fill',
    variant: 'dark',
  },
  {
    id: '2',
    label: 'Weekly Rekap',
    icon: 'ph:rewind-bold',
    variant: 'dark',
  },
  {
    id: '3',
    label: 'Laporan Keuangan',
    icon: 'ph:file-text-bold',
    variant: 'light',
  },
  {
    id: '4',
    label: 'Upload',
    icon: 'ph:file-arrow-up-bold',
    variant: 'light',
  },
  {
    id: '5',
    label: 'Financial Goals',
    icon: 'ph:target-bold',
    variant: 'light',
  },
];

export const transactions: TransactionItem[] = [
  {
    id: '1',
    name: 'Makroni',
    category: 'Food',
    date: '14 Agustus',
    amount: '-Rp 5.000',
    icon: 'twemoji:pot-of-food',
  },
  {
    id: '2',
    name: 'Soto Ayam',
    category: 'Food',
    date: '14 Agustus',
    amount: '-Rp 15.000',
    icon: 'twemoji:pot-of-food',
  },
];

export const goals: GoalItem[] = [
  {
    id: '1',
    name: 'Laptop Gaming',
    days: '300 Hari Lagi',
    saved: 'Rp 50.000',
    target: '1% dari Rp 5.000.000',
    icon: 'ph:laptop-bold',
    progress: 0.01,
  },
  {
    id: '2',
    name: 'Ulang Tahun',
    days: '100 Hari Lagi',
    saved: 'Rp 20.000',
    target: '1% dari Rp 500.000',
    icon: 'ph:cake-bold',
    progress: 0.01,
  },
];

export const suggestions: string[] = [
  'Gimana cara naikin jumlah tabungan tiap bulan?',
  'Gimana cara hemat pengeluaran harian tanpa puasa?',
  'Kategori mana yang paling boros bulan ini?',
];

export interface WeeklySpending {
  day: string;
  amount: number;
}

export const weeklySpending: WeeklySpending[] = [
  { day: 'Sen', amount: 15000 },
  { day: 'Sel', amount: 22000 },
  { day: 'Rab', amount: 18000 },
  { day: 'Kam', amount: 35000 },
  { day: 'Jum', amount: 28000 },
  { day: 'Sab', amount: 45000 },
  { day: 'Min', amount: 12000 },
];

export const monthlyBudget = {
  allowance: 1000000,
  spent: 60000,
};