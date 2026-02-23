/**
 * ☢️ NUCLEAR SLUG UTILITY - 2026 EDITION
 * 
 * Beheert de normalisatie en generatie van slugs binnen het Voices ecosysteem.
 * Dwingt consistentie af voor SEO (Suzy) en Routing (Bob).
 */

/**
 * Normaliseert een slug of array van slug-segmenten.
 * - Altijd lowercase
 * - Trimt witruimte
 * - Verwijdert trailing slashes
 * - Voegt segmenten samen met slashes
 */
export function normalizeSlug(slug: string | string[]): string {
  if (!slug) return '';
  const s = Array.isArray(slug) ? slug.join('/') : slug;
  return s.toLowerCase().trim().replace(/\/$/, '').replace(/^\//, '');
}

/**
 * Genereert een URL-vriendelijke slug van een tekst.
 * - Verwijdert accenten (Nuclear Cleanse)
 * - Vervangt niet-alfanumerieke tekens door hyphens
 * - Voorkomt dubbele hyphens en hyphens aan begin/eind
 */
export function generateSlug(text: string): string {
  if (!text) return '';
  
  return text
    .toString()
    .toLowerCase()
    .normalize('NFD') // Splits accenten van letters
    .replace(/[\u0300-\u036f]/g, '') // Verwijder de accent-tekens
    .replace(/[^a-z0-9]+/g, '-') // Vervang alles wat geen letter of cijfer is door -
    .replace(/^-+|-+$/g, '') // Verwijder hyphens aan begin en eind
    .replace(/-+/g, '-'); // Vervang dubbele hyphens door een enkele
}

/**
 * Controleert of een slug een taalprefix bevat (bijv. 'nl-be', 'fr-fr').
 */
export function hasLanguagePrefix(slug: string): boolean {
  const normalized = normalizeSlug(slug);
  const firstSegment = normalized.split('/')[0];
  const supportedLangs = ['nl-be', 'fr-fr', 'en-gb', 'de-de', 'es-es', 'pt-pt', 'it-it', 'nl', 'fr', 'en', 'de', 'es', 'pt', 'it'];
  return supportedLangs.includes(firstSegment);
}

/**
 * Verwijdert de taalprefix van een slug indien aanwezig.
 */
export function stripLanguagePrefix(slug: string): string {
  const normalized = normalizeSlug(slug);
  if (!hasLanguagePrefix(normalized)) return normalized;
  
  const segments = normalized.split('/');
  segments.shift(); // Verwijder de eerste (taal) segment
  return segments.join('/');
}
