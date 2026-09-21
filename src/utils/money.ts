import { getCurrencyByCode } from '@/constants/currencies';
import { TransactionType } from '@/constants/categoryVisuals';

function formatNumber(value: number): string {
  return new Intl.NumberFormat('id-ID', {
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