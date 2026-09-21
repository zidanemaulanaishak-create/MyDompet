export interface FinancialGoal {
  id: string;
  name: string;
  icon: string;
  iconBg: string;
  iconColor: string;
  imageUri?: string;
  deadline: string;
  deadlineTs: number;
  saved: number;
  target: number;
  createdAt: number;
}

export type GoalFilter = 'all' | 'active' | 'done';

const now = Date.now();
const DAY = 86400000;

function inMonths(n: number): number {
  return now + n * 30 * DAY;
}

export const FINANCIAL_GOALS: FinancialGoal[] = [
  {
    id: 'g1',
    name: 'Dana Darurat 6 Bulan',
    icon: 'ph:first-aid-kit-bold',
    iconBg: '#E6F7EE',
    iconColor: '#10B981',
    deadline: 'Des 2026',
    deadlineTs: inMonths(4),
    saved: 5000000,
    target: 10000000,
    createdAt: now - 60 * DAY,
  },
  {
    id: 'g2',
    name: 'Beli Laptop Kerja',
    icon: 'ph:laptop-bold',
    iconBg: '#EEF2FF',
    iconColor: '#1A42BA',
    deadline: 'Mar 2027',
    deadlineTs: inMonths(7),
    saved: 2500000,
    target: 12000000,
    createdAt: now - 30 * DAY,
  },
  {
    id: 'g3',
    name: 'DP Rumah Pertama',
    icon: 'ph:house-bold',
    iconBg: '#FFF4E5',
    iconColor: '#FF961D',
    deadline: 'Des 2027',
    deadlineTs: inMonths(16),
    saved: 15000000,
    target: 50000000,
    createdAt: now - 90 * DAY,
  },
  {
    id: 'g4',
    name: 'Liburan Keluarga',
    icon: 'ph:airplane-tilt-bold',
    iconBg: '#E0F2FE',
    iconColor: '#0284C7',
    deadline: 'Jun 2026',
    deadlineTs: now - 60 * DAY,
    saved: 8000000,
    target: 8000000,
    createdAt: now - 200 * DAY,
  },
];
