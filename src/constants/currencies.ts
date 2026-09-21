export interface Currency {
  code: string;
  symbol: string;
  country: string;
  flag: string;
}

export const CURRENCIES: Currency[] = [
  { code: 'IDR', symbol: 'Rp', country: 'Indonesia', flag: '🇮🇩' },
  { code: 'USD', symbol: '$', country: 'United States', flag: '🇺🇸' },
  { code: 'EUR', symbol: '€', country: 'European Union', flag: '🇪🇺' },
  { code: 'JPY', symbol: '¥', country: 'Japan', flag: '🇯🇵' },
  { code: 'SGD', symbol: 'S$', country: 'Singapore', flag: '🇸🇬' },
  { code: 'MYR', symbol: 'RM', country: 'Malaysia', flag: '🇲🇾' },
  { code: 'THB', symbol: '฿', country: 'Thailand', flag: '🇹🇭' },
  { code: 'KRW', symbol: '₩', country: 'South Korea', flag: '🇰🇷' },
  { code: 'CNY', symbol: '¥', country: 'China', flag: '🇨🇳' },
  { code: 'AUD', symbol: 'A$', country: 'Australia', flag: '🇦🇺' },
];

export function getCurrencyByCode(code?: string): Currency | undefined {
  if (!code) return undefined;
  return CURRENCIES.find((c) => c.code.toUpperCase() === code.toUpperCase());
}