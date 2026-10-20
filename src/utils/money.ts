import { getCurrencyByCode } from '@/constants/currencies';
import { TransactionType } from '@/constants/categoryVisuals';
import { getAppPrefs } from '@/utils/appPrefs';

function formatNumber(value: number): string {
  const locale = getAppPrefs().locale ?? 'id';
  return new Intl.NumberFormat(locale === 'en' ? 'en-US' : 'id-ID', {
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatMoney(
  amountValue: number,
  currencyCode?: string,
  type: TransactionType = 'expense'
): string {
  const currency = getCurrencyByCode(currencyCode);
  const sign = type === 'income' ? '+' : '-';
  return `${sign}${currency?.symbol ?? 'Rp'} ${formatNumber(Math.abs(amountValue))}`;
}

export function formatMoneyPlain(
  amountValue: number,
  currencyCode?: string
): string {
  const currency = getCurrencyByCode(currencyCode);
  return `${currency?.symbol ?? 'Rp'} ${formatNumber(amountValue)}`;
}