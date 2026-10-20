import { FinancialGoal, GoalFilter } from '@/data/goalsData';

export function goalProgress(g: FinancialGoal): number {
  if (g.target <= 0) return 0;
  return Math.min(1, g.saved / g.target);
}

export function goalPercent(g: FinancialGoal): number {
  return Math.round(goalProgress(g) * 100);
}

export function isGoalDone(g: FinancialGoal): boolean {
  return g.saved >= g.target;
}

export function filterGoals(goals: FinancialGoal[], filter: GoalFilter): FinancialGoal[] {
  if (filter === 'active') return goals.filter((g) => !isGoalDone(g));
  if (filter === 'done') return goals.filter((g) => isGoalDone(g));
  return goals;
}

export function summarizeGoals(goals: FinancialGoal[]): {
  totalSaved: number;
  totalTarget: number;
  percent: number;
  active: number;
  done: number;
} {
  const totalSaved = goals.reduce((s, g) => s + g.saved, 0);
  const totalTarget = goals.reduce((s, g) => s + g.target, 0);
  const done = goals.filter(isGoalDone).length;
  return {
    totalSaved,
    totalTarget,
    percent: totalTarget > 0 ? Math.round((totalSaved / totalTarget) * 100) : 0,
    active: goals.length - done,
    done,
  };
}

export function monthlySuggestion(g: FinancialGoal): number {
  const remaining = Math.max(0, g.target - g.saved);
  if (remaining <= 0) return 0;
  const msLeft = g.deadlineTs - Date.now();
  const monthsLeft = Math.max(1, Math.ceil(msLeft / (30 * 86400000)));
  return Math.ceil(remaining / monthsLeft);
}

export function formatRupiah(n: number): string {
  return `Rp ${Math.round(n).toLocaleString('id-ID')}`;
}

const SHORT_MONTHS_ID = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'Mei',
  'Jun',
  'Jul',
  'Agu',
  'Sep',
  'Okt',
  'Nov',
  'Des',
];

export function formatDeadlineLabel(ts: number): string {
  if (!Number.isFinite(ts) || ts <= 0) return '';
  const d = new Date(ts);
  return `${SHORT_MONTHS_ID[d.getMonth()]} ${d.getFullYear()}`;
}

export function daysLeftLabel(deadlineTs: number, locale: string): string {
  if (!Number.isFinite(deadlineTs) || deadlineTs <= 0) return '';
  const diff = Math.ceil((deadlineTs - Date.now()) / 86400000);
  if (diff < 0) {
    return locale === 'en' ? 'Overdue' : 'Terlewat';
  }
  if (diff === 0) {
    return locale === 'en' ? 'Due today' : 'Jatuh tempo hari ini';
  }
  return locale === 'en' ? `${diff} days left` : `${diff} hari lagi`;
}

export function formatCompact(n: number): string {
  const abs = Math.abs(n);
  if (abs >= 1_000_000) {
    const v = n / 1_000_000;
    return `Rp ${Number.isInteger(v) ? v : v.toLocaleString('id-ID', { maximumFractionDigits: 1 })}jt`;
  }
  if (abs >= 1_000) {
    const v = n / 1_000;
    return `Rp ${Number.isInteger(v) ? v : v.toLocaleString('id-ID', { maximumFractionDigits: 1 })}rb`;
  }
  return formatRupiah(n);
}
