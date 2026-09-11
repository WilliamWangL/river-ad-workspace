/**
 * 货币代码 → 符号映射
 * 可根据需要自行扩展；未命中时回退到货币代码本身（如 "CHF"）
 */
const CURRENCY_SYMBOL_MAP: Record<string, string> = {
  USD: '$',
  EUR: '€',
  GBP: '£',
  CNY: '¥',
  JPY: '¥',
  KRW: '₩',
  RUB: '₽',
  INR: '₹',
  BRL: 'R$',
  CAD: 'C$',
  AUD: 'A$',
  HKD: 'HK$',
  TWD: 'NT$',
  SGD: 'S$',
  MXN: 'MX$',
  CHF: 'CHF',
  SEK: 'kr',
  NOK: 'kr',
  DKK: 'kr',
  PLN: 'zł',
  THB: '฿',
  TRY: '₺',
  AED: 'د.إ',
  SAR: '﷼',
  ILS: '₪',
  ZAR: 'R',
  PHP: '₱',
  MYR: 'RM',
  IDR: 'Rp',
  VND: '₫',
  CZK: 'Kč',
  HUF: 'Ft',
};

/**
 * 获取货币符号，未知代码直接返回代码本身
 * @example getCurrencySymbol('USD') // '$'
 * @example getCurrencySymbol('EUR') // '€'
 * @example getCurrencySymbol('CHF') // 'CHF'
 */
export function getCurrencySymbol(code?: string | null): string {
  if (!code) return '$';
  return CURRENCY_SYMBOL_MAP[code.toUpperCase()] ?? code;
}
