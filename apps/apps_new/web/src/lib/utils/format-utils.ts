/**
 * ⚡ FORMAT UTILS (2026)
 * Centralized formatting logic to break circular dependencies.
 */

export function formatCurrency(amount: number, locale: string = 'nl-BE', currency: string = 'EUR'): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2
  }).format(amount);
}
