import { useCallback } from 'react';
import type { Locale, Dict } from './types';
import { commonDict } from './dicts/common';
import { navDict } from './dicts/nav';
import { homeDict } from './dicts/home';
import { transactionsDict } from './dicts/transactions';
import { budgetDict } from './dicts/budget';
import { goalsDict } from './dicts/goals';
import { profileDict } from './dicts/profile';
import { authDict } from './dicts/auth';
import { onboardingDict } from './dicts/onboarding';
import { uploadDict } from './dicts/upload';
import { reportsDict } from './dicts/reports';
import { aiDict } from './dicts/ai';
import { addTransactionDict } from './dicts/addTransaction';
import { useSettings } from '@/context/settings-context';

const domains: Dict[] = [
  commonDict,
  navDict,
  homeDict,
  transactionsDict,
  budgetDict,
  goalsDict,
  profileDict,
  authDict,
  onboardingDict,
  uploadDict,
  reportsDict,
  aiDict,
  addTransactionDict,
];

const idDict: Record<string, string> = {};
const enDict: Record<string, string> = {};
for (const d of domains) {
  Object.assign(idDict, d.id);
  Object.assign(enDict, d.en);
}

export const dictionaries: Dict = { id: idDict, en: enDict };

export type Vars = Record<string, string | number>;

export function translate(locale: Locale, key: string, vars?: Vars): string {
  const primary = locale === 'en' ? enDict : idDict;
  const fallback = locale === 'en' ? idDict : enDict;
  let s: string = primary[key] ?? fallback[key] ?? key;
  if (vars) {
    for (const [k, v] of Object.entries(vars)) {
      s = s.split(`{${k}}`).join(String(v));
    }
  }
  return s;
}

export function useI18n() {
  const { language } = useSettings();
  const t = useCallback(
    (key: string, vars?: Vars) => translate(language, key, vars),
    [language],
  );
  return { t, locale: language };
}

export function numberForLocale(locale: Locale, value: number): string {
  try {
    return new Intl.NumberFormat(locale === 'en' ? 'en-US' : 'id-ID').format(value);
  } catch {
    return String(value);
  }
}

export const monthNames: Record<Locale, string[]> = {
  id: [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
  ],
  en: [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ],
};

export const shortDayNames: Record<Locale, string[]> = {
  id: ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'],
  en: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
};

export function monthName(locale: Locale, monthIndex: number): string {
  return monthNames[locale][monthIndex] ?? monthNames.id[monthIndex] ?? '';
}

export type { Locale, Dict } from './types';