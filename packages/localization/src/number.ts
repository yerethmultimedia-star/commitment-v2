// Cache formatters to avoid the performance penalty of instantiating Intl multiple times
const numberFormatter = new Intl.NumberFormat('es-ES', { style: 'decimal' });
const integerFormatter = new Intl.NumberFormat('es-ES', { style: 'decimal', maximumFractionDigits: 0 });
const percentFormatter = new Intl.NumberFormat('es-ES', { style: 'percent' });
const currencyFormatter = new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' });
const listFormatter = new Intl.ListFormat('es-ES', { style: 'long', type: 'conjunction' });

/**
 * Formats a raw number according to locale rules.
 */
export const formatNumber = (value: number): string => {
  return numberFormatter.format(value);
};

/**
 * Formats a number as an integer (no decimals).
 */
export const formatInteger = (value: number): string => {
  return integerFormatter.format(value);
};

/**
 * Formats a number as a percentage (e.g. 0.15 -> 15%).
 */
export const formatPercentage = (value: number): string => {
  return percentFormatter.format(value);
};

/**
 * Formats a number as currency.
 */
export const formatCurrency = (value: number): string => {
  return currencyFormatter.format(value);
};

/**
 * Formats an array of strings into a localized list (e.g. "a, b y c").
 */
export const formatList = (items: string[]): string => {
  return listFormatter.format(items);
};
