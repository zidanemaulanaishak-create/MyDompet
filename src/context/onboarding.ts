export type Occupation = 'pekerja' | 'pelajar' | 'mahasiswa';

export interface OnboardingData {
  occupation: Occupation | null;
  mainIncome: number;
  sideIncome: number;
  completed: boolean;
}

export const EMPTY_ONBOARDING: OnboardingData = {
  occupation: null,
  mainIncome: 0,
  sideIncome: 0,
  completed: false,
};

export function parseOnboarding(raw: string | null): OnboardingData {
  if (!raw) return EMPTY_ONBOARDING;
  try {
    const parsed = JSON.parse(raw) as Partial<OnboardingData>;
    return {
      occupation:
        parsed.occupation === 'pekerja' ||
        parsed.occupation === 'pelajar' ||
        parsed.occupation === 'mahasiswa'
          ? parsed.occupation
          : null,
      mainIncome: typeof parsed.mainIncome === 'number' ? parsed.mainIncome : 0,
      sideIncome: typeof parsed.sideIncome === 'number' ? parsed.sideIncome : 0,
      completed: parsed.completed === true,
    };
  } catch {
    return EMPTY_ONBOARDING;
  }
}

export function parseRupiah(raw: string): number {
  const digits = raw.replace(/[^0-9]/g, '');
  return digits ? parseInt(digits, 10) : 0;
}

export function formatRupiahInput(value: number): string {
  if (!value) return '';
  return `Rp ${value.toLocaleString('id-ID')}`;
}
