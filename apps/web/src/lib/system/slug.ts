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
 * Controleert of een slug een taalprefix bevat (bijv. 'nl', 'fr', 'nl-be').
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

/**
 * Bouwt de canonieke actor-segment slug uit eender welke legacy-vorm.
 * Voorbeelden:
 * - "johfrah" -> "johfrah"
 * - "/voice/johfrah/" -> "johfrah"
 * - "agency/johfrah/video" -> "johfrah"
 */
export function resolveActorSlugSegment(rawSlug?: string | null, fallbackName?: string | null): string {
  const normalized = stripLanguagePrefix(normalizeSlug(rawSlug || ''));
  const segments = normalized.split('/').filter(Boolean);

  let candidate = '';
  if (segments.length === 1) {
    candidate = segments[0];
  } else if (segments.length > 1) {
    const knownPrefixes = new Set(['voice', 'stem', 'voix', 'stimme', 'agency', 'voices']);
    candidate = knownPrefixes.has(segments[0]) ? segments[1] : segments[0];
  }

  const cleanedCandidate = generateSlug(candidate);
  if (cleanedCandidate) return cleanedCandidate;

  const generatedFallback = generateSlug(fallbackName || '');
  return generatedFallback || 'voice';
}

/**
 * Bouwt het canonieke actorpad: /{actor-slug}
 */
export function buildCanonicalActorPath(rawSlug?: string | null, fallbackName?: string | null): string {
  return `/${resolveActorSlugSegment(rawSlug, fallbackName)}`;
}
