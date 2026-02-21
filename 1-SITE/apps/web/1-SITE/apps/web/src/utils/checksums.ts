/**
 *  NUCLEAR CHECKSUM UTILS (2026)
 * 
 * Bevat wiskundige validaties voor IBAN (MOD-97) en BTW-nummers.
 */

/**
 * Valideert een IBAN nummer via het MOD-97 algoritme.
 * @param iban De ruwe IBAN string (met of zonder spaties)
 */
export function isValidIBAN(iban: string): boolean {
  const cleanIban = iban.replace(/[\s\t\n.-]/g, '').toUpperCase();
  
  // Basic format check (Landcode + 2 cijfers + 12-30 karakters)
  if (!/^[A-Z]{2}[0-9]{2}[A-Z0-9]{12,30}$/.test(cleanIban)) return false;
  
  // Verplaats eerste 4 tekens naar het einde
  const rearranged = cleanIban.substring(4) + cleanIban.substring(0, 4);
  
  // Vervang letters door getallen (A=10, B=11, ..., Z=35)
  const numeric = rearranged.split('').map(char => {
    const code = char.charCodeAt(0);
    return code >= 65 && code <= 90 ? (code - 55).toString() : char;
  }).join('');
  
  // MOD-97 berekening op het enorme getal (via chunks om overflow te voorkomen)
  let remainder = 0;
  for (let i = 0; i < numeric.length; i += 7) {
    const chunk = remainder.toString() + numeric.substring(i, i + 7);
    remainder = parseInt(chunk, 10) % 97;
  }
  
  return remainder === 1;
}

/**
 * Valideert een Belgisch BTW-nummer via de MOD-97 checksum.
 * @param vat Het BTW-nummer (bijv. BE0662426460)
 */
export function isValidBelgianVAT(vat: string): boolean {
  const cleanVat = vat.replace(/[^0-9]/g, '');
  if (cleanVat.length !== 10) return false;
  
  const base = parseInt(cleanVat.substring(0, 8), 10);
  const checksum = parseInt(cleanVat.substring(8, 10), 10);
  
  return 97 - (base % 97) === checksum;
}

/**
 * Probeert een 'vervuilde' IBAN te redden door rommel aan het einde weg te snijden.
 * Handig voor OCR die 'IBAN: BE123... SWIFT' als één string ziet.
 */
export function rescueIBAN(raw: string): string | null {
  const clean = raw.replace(/[\s\t\n.-]/g, '').toUpperCase();
  // Zoek naar de langst mogelijke geldige IBAN binnen de string
  for (let len = clean.length; len >= 14; len--) {
    const candidate = clean.substring(0, len);
    if (isValidIBAN(candidate)) return candidate;
  }
  return null;
}
