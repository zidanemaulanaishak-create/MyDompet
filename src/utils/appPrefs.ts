export type AppLocale = 'id' | 'en';

export interface AppPrefs {
  locale: AppLocale;
  currencyCode: string;
}

const prefs: AppPrefs = {
  locale: 'id',
  currencyCode: 'IDR',
};

export function getAppPrefs(): AppPrefs {
  return prefs;
}

export function setAppPrefs(next: Partial<AppPrefs>) {
  if (next.locale) prefs.locale = next.locale;
  if (next.currencyCode) prefs.currencyCode = next.currencyCode;
}