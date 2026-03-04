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

/**
 * 📝 WORD COUNT ENGINE (2026)
 * Strips director instructions inside brackets and parentheses.
 */
export function countWords(text: string): number {
  if (!text) return 0;
  // 🛡️ CHRIS-PROTOCOL: Strip text inside (...) and [...] as they are instructions
  const cleanText = text
    .replace(/\([^)]*\)/g, ' ')
    .replace(/\[[^\]]*\]/g, ' ');
  
  return cleanText.trim().split(/\s+/).filter(Boolean).length;
}
