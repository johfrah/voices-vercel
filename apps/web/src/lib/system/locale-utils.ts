const SHORT_TO_ISO: Record<string, string> = {
  nl: 'nl-be',
  en: 'en-gb',
  fr: 'fr-fr',
  de: 'de-de',
  es: 'es-es',
  pt: 'pt-pt',
  it: 'it-it',
};

const ISO_ALIASES: Record<string, string> = {
  'nl-be': 'nl-be',
  'nl-nl': 'nl-nl',
  'fr-be': 'fr-be',
  'fr-fr': 'fr-fr',
  'en-eu': 'en-gb',
  'en-gb': 'en-gb',
  'en-us': 'en-gb',
  'de-de': 'de-de',
  'es-es': 'es-es',
  'pt-pt': 'pt-pt',
  'it-it': 'it-it',
};

const LOCALE_FALLBACKS: Record<string, string[]> = {
  'fr-fr': ['fr-be', 'en-gb'],
  'fr-be': ['fr-fr', 'en-gb'],
  'nl-be': ['nl-nl', 'en-gb'],
  'nl-nl': ['nl-be', 'en-gb'],
  'en-gb': ['en-eu', 'en-us'],
  'en-us': ['en-gb'],
  'de-de': ['en-gb'],
  'es-es': ['en-gb'],
  'pt-pt': ['en-gb'],
  'it-it': ['en-gb'],
};

const MARKET_DEFAULT_LOCALE: Record<string, string> = {
  BE: 'nl-be',
  NLNL: 'nl-nl',
  FR: 'fr-fr',
  ES: 'es-es',
  PT: 'pt-pt',
  EU: 'en-gb',
  ACADEMY: 'nl-be',
  STUDIO: 'nl-be',
  ADEMING: 'nl-be',
  PORTFOLIO: 'nl-be',
  FREELANCE: 'nl-be',
  JOHFRAI: 'nl-be',
  ARTIST: 'en-gb',
};

export const SUPPORTED_LOCALE_PREFIXES = ['nl', 'fr', 'en', 'de', 'es', 'it', 'pt'] as const;

export function normalizeLocale(input?: string | null, fallback: string = 'nl-be'): string {
  const fallbackNormalized = (() => {
    const rawFallback = String(fallback || 'nl-be').trim().toLowerCase().replace('_', '-');
    if (!rawFallback) return 'nl-be';
    if (rawFallback in ISO_ALIASES) return ISO_ALIASES[rawFallback];
    const [lang] = rawFallback.split('-');
    if (lang && lang in SHORT_TO_ISO) return SHORT_TO_ISO[lang];
    return rawFallback;
  })();
  if (!input) return fallbackNormalized;
  const raw = String(input).trim().toLowerCase().replace('_', '-');
  if (!raw) return fallbackNormalized;

  if (raw in SHORT_TO_ISO) {
    const [fallbackLang, fallbackRegion] = fallbackNormalized.split('-');

    // Market-aware short-code resolution:
    // /fr on voices.be resolves to fr-be, while /fr on voices.fr resolves to fr-fr.
    if (fallbackRegion) {
      const marketVariant = `${raw}-${fallbackRegion}`;
      if (marketVariant in ISO_ALIASES) {
        return ISO_ALIASES[marketVariant];
      }
    }
    if (fallbackLang === raw) {
      return fallbackNormalized;
    }
    return SHORT_TO_ISO[raw];
  }

  if (raw in ISO_ALIASES) {
    return ISO_ALIASES[raw];
  }

  const [first, second] = raw.split('-');
  if (!second && first in SHORT_TO_ISO) {
    return SHORT_TO_ISO[first];
  }

  if (first && second) {
    const key = `${first}-${second}`;
    return ISO_ALIASES[key] || key;
  }

  return fallbackNormalized;
}

export function getMarketDefaultLocale(marketCode?: string | null, fallback: string = 'nl-be'): string {
  const normalizedCode = String(marketCode || '').trim().toUpperCase();
  return MARKET_DEFAULT_LOCALE[normalizedCode] || normalizeLocale(fallback, 'nl-be');
}

export function localeToShort(input?: string | null, fallback = 'nl'): string {
  const normalized = normalizeLocale(input);
  return normalized.split('-')[0] || fallback;
}

export function getLocaleFallbacks(input?: string | null): string[] {
  const normalized = normalizeLocale(input);
  const fallbackCandidates = LOCALE_FALLBACKS[normalized] || [];
  const expanded = [normalized, ...fallbackCandidates.map((candidate) => candidate.toLowerCase().replace('_', '-'))];
  const shorts = expanded
    .map((candidate) => candidate.split('-')[0])
    .filter(Boolean);
  return [...expanded, ...shorts].filter((value, index, array) => array.indexOf(value) === index);
}

export function localeToBcp47(input?: string | null, fallback = 'nl-BE'): string {
  const normalized = normalizeLocale(input, fallback.toLowerCase());
  const [lang, region] = normalized.split('-');
  if (!lang || !region) return fallback;
  return `${lang.toLowerCase()}-${region.toUpperCase()}`;
}

export function localeToMollie(input?: string | null, fallback = 'nl_BE'): string {
  const normalized = normalizeLocale(input, fallback.replace('_', '-').toLowerCase());
  const [lang, region] = normalized.split('-');
  if (!lang || !region) return fallback;
  return `${lang.toLowerCase()}_${region.toUpperCase()}`;
}

export function stripLocalePrefix(pathname: string): string {
  const path = pathname || '/';
  const regex = new RegExp(`^/(${SUPPORTED_LOCALE_PREFIXES.join('|')})(/|$)`, 'i');
  return path.replace(regex, '/').replace(/\/{2,}/g, '/') || '/';
}

export function hasLocalePrefix(pathname: string): boolean {
  const regex = new RegExp(`^/(${SUPPORTED_LOCALE_PREFIXES.join('|')})(/|$)`, 'i');
  return regex.test(pathname || '');
}

export function withLocalePrefix(pathname: string, locale: string, defaultLocale: string = 'nl-be'): string {
  const cleanPath = stripLocalePrefix(pathname || '/');
  const short = localeToShort(locale);
  const defaultShort = localeToShort(defaultLocale);
  if (short === defaultShort) {
    return cleanPath;
  }
  return `/${short}${cleanPath === '/' ? '' : cleanPath}`;
}
