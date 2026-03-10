/**
 * NUCLEAR MARKET MANAGER - 2026 EDITION
 * 
 * DIT BESTAND IS DE ENIGE SOURCE OF TRUTH VOOR MARKET LOGIC.
 * Het is ISOMORF: werkt zowel op de Server als op de Client.
 * 
 * CHRIS-PROTOCOL: 
 * - Zero-Drift Integrity (v900)
 * - Zelf-gecontaineriseerd om Temporal Dead Zone (TDZ) fouten te voorkomen.
 */

import { VOICES_CONFIG } from '../voices-config';
import { normalizeLocale } from '../locale-utils';

export interface MarketConfig {
  market_code: string;
  language: string;
  primary_language: string;
  primary_language_id: number;
  supported_languages: string[];
  popular_languages: string[];
  currency: string;
  name: string;
  phone: string;
  email: string;
  logo_url: string;
  company_name: string;
  vat_number: string;
  theme: 'voices' | 'ademing' | 'johfrah' | 'youssef' | 'johfrai';
  has_voicy?: boolean;
  address?: any;
  social_links?: {
    instagram?: string;
    linkedin?: string;
    facebook?: string;
    youtube?: string;
    spotify?: string;
  };
  seo_data?: {
    title?: string;
    description?: string;
    schema_type?: 'Organization' | 'Person' | 'WebApplication';
    locale_code?: string;
    canonical_domain?: string;
    og_image?: string;
  };
}

export class MarketManager {
  private static cache: Record<string, MarketConfig> = {};
  private static languagesRegistry: Array<{ id: number, code: string, label: string, icon?: string }> = [];
  private static countriesRegistry: Array<{ id: number, code: string, label: string }> = [];
  private static journeysRegistry: Array<{ id: number, code: string, label: string }> = [];
  private static worldsRegistry: Array<{ id: number, code: string, label: string, description?: string }> = [];
  private static mediaTypesRegistry: Array<{ id: number, code: string, label: string }> = [];
  private static servicesRegistry: Array<{ id: number, code: string, label: string, category?: string }> = [];
  private static worldLanguagesRegistry: Array<{ world_id: number, language_id: number, is_primary: boolean, is_popular: boolean }> = [];
  private static worldConfigsCache: Record<string, any> = {};

  /**
   * 🛡️ CHRIS-PROTOCOL: Isomorphic World ID Resolver (v2.24.4)
   * Bepaalt de worldId op basis van journey of slug.
   */
  public static getWorldId(journeyOrSlug: string): number {
    const s = journeyOrSlug?.toLowerCase() || '';
    if (s.includes('studio')) return 2;
    if (s.includes('academy')) return 3;
    if (s.includes('portfolio')) return 5;
    if (s.includes('ademing')) return 6;
    if (s.includes('freelance')) return 7;
    if (s.includes('partner')) return 8;
    if (s.includes('johfrai')) return 10;
    if (s.includes('artist')) return 25;
    
    // Journey mapping
    if (s === 'telephony' || s === 'video' || s === 'commercial' || s === 'agency') return 1;
    
    return 1; // Default: Agency
  }

  /**
   * 🛡️ CHRIS-PROTOCOL: ID-First World Config Resolver (v3.0.0)
   */
  public static async getWorldConfig(worldId: number, languageId: number): Promise<any> {
    const cacheKey = `${worldId}-${languageId}`;
    if (this.worldConfigsCache[cacheKey]) return this.worldConfigsCache[cacheKey];
    return null; 
  }

  /**
   * 🛡️ CHRIS-PROTOCOL: Handshake Truth Registry (v2.14.667)
   */
  public static setWorlds(worlds: any[]) {
    this.worldsRegistry = worlds;
    if (typeof global !== 'undefined') (global as any).handshakeWorlds = worlds;
    if (typeof window !== 'undefined') (window as any).handshakeWorlds = worlds;
  }

  public static setWorldLanguages(worldLangs: any[]) {
    this.worldLanguagesRegistry = worldLangs;
    if (typeof global !== 'undefined') (global as any).handshakeWorldLanguages = worldLangs;
    if (typeof window !== 'undefined') (window as any).handshakeWorldLanguages = worldLangs;
  }

  public static setLanguages(langs: any[]) {
    this.languagesRegistry = langs;
    if (typeof global !== 'undefined') (global as any).handshakeLanguages = langs;
    if (typeof window !== 'undefined') (window as any).handshakeLanguages = langs;
  }

  public static setCountries(countries: any[]) {
    this.countriesRegistry = countries;
    if (typeof global !== 'undefined') (global as any).handshakeCountries = countries;
    if (typeof window !== 'undefined') (window as any).handshakeCountries = countries;
  }

  public static setJourneys(journeys: any[]) {
    this.journeysRegistry = journeys;
    if (typeof global !== 'undefined') (global as any).handshakeJourneys = journeys;
    if (typeof window !== 'undefined') (window as any).handshakeJourneys = journeys;
  }

  public static setMediaTypes(mediaTypes: any[]) {
    this.mediaTypesRegistry = mediaTypes;
    if (typeof global !== 'undefined') (global as any).handshakeMediaTypes = mediaTypes;
    if (typeof window !== 'undefined') (window as any).handshakeMediaTypes = mediaTypes;
  }

  public static setServices(services: any[]) {
    this.servicesRegistry = services;
    if (typeof global !== 'undefined') (global as any).handshakeServices = services;
    if (typeof window !== 'undefined') (window as any).handshakeServices = services;
  }

  public static get languages() { return this.languagesRegistry; }
  public static get countries() { return this.countriesRegistry; }
  public static get journeys() { return this.journeysRegistry; }
  public static get worlds() { return this.worldsRegistry; }
  public static get mediaTypes() { return this.mediaTypesRegistry; }
  public static get services() { return this.servicesRegistry; }
  public static get worldLanguages() { return this.worldLanguagesRegistry; }

  static getServiceId(code: string): number | null {
    if (!code) return null;
    const lowCode = code.toLowerCase().trim();
    const registry = this.servicesRegistry.length > 0 ? this.servicesRegistry : 
                    (typeof window !== 'undefined' && (window as any).handshakeServices ? (window as any).handshakeServices : []);

    if (registry.length > 0) {
      const match = registry.find((s: any) => s.code.toLowerCase() === lowCode);
      if (match) return match.id;
    }

    const staticMap: Record<string, number> = {
      'live_regie': 1, 'ivr': 2, 'unpaid': 3, 'bsf': 4, 'online': 5,
      'radio_national': 6, 'radio_regional': 7, 'radio_local': 8,
      'tv_national': 9, 'tv_regional': 10, 'tv_local': 11,
      'podcast': 12, 'social_media': 13, 'cinema': 14, 'pos': 15
    };

    return staticMap[lowCode] || null;
  }

  static getServiceType(serviceId: number): 'buyout' | 'all-in' {
    const buyoutIds = [5, 6, 9, 13, 14];
    return buyoutIds.includes(serviceId) ? 'buyout' : 'all-in';
  }

  static resolveServicePrice(actor: any, serviceCodeOrId: string | number, marketCode: string = 'BE'): { price: number, source: 'market' | 'global' | 'legacy' | 'none' } {
    const rates = actor.rates?.rates || actor.rates || {};
    const marketRates = rates[marketCode.toUpperCase()] || {};
    const globalRates = rates['GLOBAL'] || rates['global'] || {};
    
    let serviceCode = String(serviceCodeOrId);
    if (typeof serviceCodeOrId === 'number') {
      const registry = this.servicesRegistry.length > 0 ? this.servicesRegistry : 
                      (typeof window !== 'undefined' && (window as any).handshakeServices ? (window as any).handshakeServices : []);
      const match = registry.find((s: any) => s.id === serviceCodeOrId);
      if (match) serviceCode = match.code;
    }

    if (marketRates[serviceCode] !== undefined && marketRates[serviceCode] !== null && marketRates[serviceCode] !== '') {
      return { price: Number(marketRates[serviceCode]), source: 'market' };
    }
    if (globalRates[serviceCode] !== undefined && globalRates[serviceCode] !== null && globalRates[serviceCode] !== '') {
      return { price: Number(globalRates[serviceCode]), source: 'global' };
    }
    
    const legacyMap: Record<string, string> = {
      'ivr': 'price_ivr', 'unpaid': 'price_unpaid', 'online': 'price_online',
      'live_regie': 'price_live_regie', 'bsf': 'price_bsf'
    };
    
    const col = legacyMap[serviceCode];
    if (col && actor[col]) return { price: Number(actor[col]), source: 'legacy' };
    
    return { price: 0, source: 'none' };
  }

  public static resolveContext(host: string, path: string): { worldId: number, languageId: number, journeyId: number | null } {
    let cleanHost = host.replace('www.', '').replace('https://', '').replace('http://', '').split('/')[0];
    const cleanPath = path || '';

    const market = this.getCurrentMarket(cleanHost, cleanPath);

    // ID-First: resolve world from market context, then let explicit path prefixes win.
    let worldId = this.getWorldId((market.market_code || 'agency').toLowerCase());
    if (cleanPath.startsWith('/studio')) worldId = 2;
    else if (cleanPath.startsWith('/academy')) worldId = 3;
    else if (cleanPath.startsWith('/ademing')) worldId = 6;
    else if (cleanPath.startsWith('/johfrai')) worldId = 10;

    // ID-First: base language always starts from market primary language.
    let languageId =
      market.primary_language_id ||
      this.getLanguageId(market.primary_language || market.language || 'nl-be') ||
      1;

    const localeMatch = cleanPath.match(/^\/(en|fr|de|es|pt|it|nl)(\/|$)/i);
    if (localeMatch) {
      const localeSlug = localeMatch[1].toLowerCase();
      const marketPrimary = normalizeLocale(market.primary_language || 'nl-be');
      const marketPrimaryShort = marketPrimary.split('-')[0];
      const normalizedLocale = normalizeLocale(localeSlug, marketPrimary);

      // If locale prefix equals the market primary language short code,
      // keep the market primary ID (important for markets like voices.nl -> nl-nl).
      if (localeSlug === marketPrimaryShort) {
        languageId = market.primary_language_id || this.getLanguageId(marketPrimary) || languageId;
      } else {
        languageId =
          this.getLanguageId(normalizedLocale, marketPrimary) ||
          this.getLanguageId(localeSlug, marketPrimary) ||
          languageId;
      }
    }

    let journeyId: number | null = null;
    if (worldId === 1) {
      if (cleanPath.includes('/telephony')) journeyId = 26;
      else if (cleanPath.includes('/commercial')) journeyId = 28;
      else journeyId = 27;
    } else if (worldId === 2) journeyId = 1;
    else if (worldId === 3) journeyId = 30;

    return { worldId, languageId, journeyId };
  }

  public static MARKETS_STATIC: Record<string, Partial<MarketConfig>> = {
    'voices.be': {
      market_code: 'BE', language: 'nl', primary_language: 'nl-be', primary_language_id: 1,
      supported_languages: ['nl-be', 'nl-nl', 'fr-be', 'en-gb', 'fr-fr', 'de-de'],
      popular_languages: ['nl-be', 'nl-nl', 'fr-be', 'en-gb', 'fr-fr', 'de-de'],
      name: 'Voices', email: 'johfrah@voices.be', logo_url: VOICES_CONFIG.assets.logos.be,
      theme: 'voices', has_voicy: true,
      seo_data: { title: 'Voices | Het Vriendelijkste Stemmenbureau', description: 'Vind de perfecte stem voor elke productie.' }
    },
    'voices.nl': {
      market_code: 'NLNL', language: 'nl', primary_language: 'nl-nl', primary_language_id: 2,
      supported_languages: ['nl-nl', 'nl-be', 'en-gb', 'de-de', 'fr-fr'],
      popular_languages: ['nl-nl', 'nl-be', 'en-gb', 'de-de', 'fr-fr'],
      name: 'Nederland', logo_url: VOICES_CONFIG.assets.logos.be, theme: 'voices', has_voicy: true,
      seo_data: { title: 'Voices Nederland | Stemmenbureau', description: 'De beste Nederlandse stemmen voor uw project.' }
    },
    'voices.fr': {
      market_code: 'FR', language: 'fr', primary_language: 'fr-fr', primary_language_id: 4,
      supported_languages: ['fr-fr', 'fr-be', 'en-gb', 'nl-nl', 'nl-be', 'de-de'],
      popular_languages: ['fr-fr', 'fr-be', 'en-gb', 'nl-nl', 'nl-be', 'de-de'],
      name: 'France', logo_url: VOICES_CONFIG.assets.logos.be, theme: 'voices', has_voicy: true,
      seo_data: { title: 'Voices France | Agence de Voix-off', description: 'Trouvez la voix parfaite pour vos productions.' }
    },
    'voices.es': {
      market_code: 'ES', language: 'es', primary_language: 'es-es', primary_language_id: 8,
      supported_languages: ['es-es', 'en-gb', 'fr-fr', 'pt-pt', 'it-it'],
      popular_languages: ['es-es', 'en-gb', 'pt-pt'],
      name: 'España', logo_url: VOICES_CONFIG.assets.logos.be, theme: 'voices', has_voicy: true,
      seo_data: { title: 'Voices España | Agencia de Locutores', description: 'Encuentra la voz perfecta para tus proyectos.' }
    },
    'voices.pt': {
      market_code: 'PT', language: 'pt', primary_language: 'pt-pt', primary_language_id: 12,
      supported_languages: ['pt-pt', 'en-gb', 'es-es', 'fr-fr'],
      popular_languages: ['pt-pt', 'en-gb', 'es-es'],
      name: 'Portugal', logo_url: VOICES_CONFIG.assets.logos.be, theme: 'voices', has_voicy: true,
      seo_data: { title: 'Voices Portugal | Agência de Locutores', description: 'Encontre a voz perfeita para as suas produções.' }
    },
    'voices.eu': {
      market_code: 'EU', language: 'en', primary_language: 'en-gb', primary_language_id: 5,
      supported_languages: ['en-gb', 'de-de', 'nl-be', 'nl-nl', 'fr-be', 'fr-fr'],
      popular_languages: ['en-gb', 'de-de', 'fr-be', 'fr-fr', 'nl-nl', 'nl-be'],
      name: 'Europe', logo_url: VOICES_CONFIG.assets.logos.be, theme: 'voices', has_voicy: true,
      seo_data: { title: 'Voices Europe | Voice-over Agency', description: 'Find the perfect voice for any production across Europe.' }
    },
    'voices.academy': {
      market_code: 'ACADEMY', language: 'nl', primary_language: 'nl-BE',
      supported_languages: ['nl-BE', 'en-GB'], popular_languages: ['nl-BE', 'en-GB'],
      name: 'Voices Academy', logo_url: VOICES_CONFIG.assets.logos.be, theme: 'voices'
    },
    'voices.be/academy': {
      market_code: 'ACADEMY', language: 'nl', primary_language: 'nl-be', primary_language_id: 1,
      supported_languages: ['nl-be', 'en-gb'], popular_languages: ['nl-be', 'en-gb'],
      name: 'Voices Academy', logo_url: VOICES_CONFIG.assets.logos.be, theme: 'voices'
    },
    'voices.be/studio': {
      market_code: 'STUDIO', language: 'nl', primary_language: 'nl-be', primary_language_id: 1,
      supported_languages: ['nl-be', 'en-gb'], popular_languages: ['nl-be', 'en-gb'],
      name: 'Voices Studio',
      email: 'studio@voices.be',
      phone: '+32 (0)2 793 19 91',
      logo_url: VOICES_CONFIG.assets.logos.studio || VOICES_CONFIG.assets.logos.be,
      theme: 'voices'
    },
    'johfrah.be': {
      market_code: 'FREELANCE', language: 'nl', primary_language: 'nl-be', primary_language_id: 1,
      supported_languages: ['nl-be', 'en-gb'], popular_languages: ['nl-be', 'en-gb'],
      name: 'Johfrah Lefebvre', logo_url: VOICES_CONFIG.assets.logos.johfrah, theme: 'johfrah', has_voicy: true
    },
    'christina.be': {
      market_code: 'PORTFOLIO', language: 'nl', primary_language: 'nl-be', primary_language_id: 1,
      supported_languages: ['nl-be', 'en-gb'], popular_languages: ['nl-be', 'en-gb'],
      name: 'Christina Portfolio', logo_url: VOICES_CONFIG.assets.logos.be, theme: 'voices'
    },
    'youssefzaki.eu': {
      market_code: 'ARTIST', language: 'en', primary_language: 'en-gb', primary_language_id: 5,
      supported_languages: ['en-gb', 'nl-be', 'fr-fr', 'de-de'],
      popular_languages: ['en-gb', 'nl-be', 'fr-fr', 'de-de'],
      name: 'Youssef Zaki', logo_url: VOICES_CONFIG.assets.logos.be, theme: 'youssef'
    },
    'ademing.be': {
      market_code: 'ADEMING', language: 'nl', primary_language: 'nl-be', primary_language_id: 1,
      supported_languages: ['nl-be'], popular_languages: ['nl-be'],
      name: 'Ademing', logo_url: VOICES_CONFIG.assets.logos.ademing, theme: 'ademing'
    },
    'johfrai.be': {
      market_code: 'JOHFRAI', language: 'nl', primary_language: 'nl-be', primary_language_id: 1,
      supported_languages: ['nl-be', 'en-gb'], popular_languages: ['nl-be', 'en-gb'],
      name: 'Johfrai', logo_url: VOICES_CONFIG.assets.logos.be, theme: 'johfrai'
    }
  };

  static getMarketDomains(): Record<string, string> {
    return {
      'BE': 'https://www.voices.be', 'NLNL': 'https://www.voices.nl',
      'FR': 'https://www.voices.fr', 'ES': 'https://www.voices.es',
      'PT': 'https://www.voices.pt', 'EU': 'https://www.voices.eu',
      'ACADEMY': 'https://www.voices.academy', 'PORTFOLIO': 'https://www.christina.be',
      'ADEMING': 'https://www.ademing.be', 'FREELANCE': 'https://www.johfrah.be',
      'JOHFRAI': 'https://www.johfrai.be', 'ARTIST': 'https://www.youssefzaki.eu'
    };
  }

  static getCurrentMarket(host?: string, path?: string): MarketConfig {
    let activeHost = host;
    let activePath = path;
    if (!activeHost && typeof window !== 'undefined') activeHost = window.location.host;
    if (!activePath && typeof window !== 'undefined') activePath = window.location.pathname;
    if (!activeHost) activeHost = 'voices.be';

    let cleanHost = activeHost.replace('www.', '').replace('https://', '').replace('http://', '').split('/')[0];
    
    if (cleanHost === 'voices.be' || cleanHost === 'localhost:3000') {
      const checkPath = activePath || '';
      if (checkPath.startsWith('/studio')) cleanHost = 'voices.be/studio';
      else if (checkPath.startsWith('/academy')) cleanHost = 'voices.be/academy';
      else if (checkPath.startsWith('/ademing')) cleanHost = 'ademing.be';
      else if (checkPath.startsWith('/johfrai')) cleanHost = 'johfrai.be';
    }

    if (this.cache[cleanHost]) return this.cache[cleanHost];

    const config = this.MARKETS_STATIC[cleanHost] || this.MARKETS_STATIC['voices.be'];

    const isoSupported = (config.supported_languages || []).map(l => this.getLanguageCode(l));
    const isoPopular = (config.popular_languages || []).map(l => this.getLanguageCode(l));

    const finalConfig: MarketConfig = {
      market_code: config.market_code || 'BE',
      language: config.language || 'nl',
      primary_language: this.getLanguageCode(config.primary_language || 'nl-BE'),
      primary_language_id: (config as any).primary_language_id || 1,
      supported_languages: isoSupported.length > 0 ? isoSupported : ['nl-be', 'nl-nl', 'en-gb', 'fr-fr', 'de-de'],
      popular_languages: isoPopular.length > 0 ? isoPopular : ['nl-be', 'nl-nl', 'en-gb', 'fr-fr', 'de-de'],
      currency: config.currency || 'EUR',
      name: config.name || 'Voices',
      phone: config.phone || VOICES_CONFIG.company.phone,
      email: config.email || VOICES_CONFIG.company.email,
      logo_url: config.logo_url || VOICES_CONFIG.assets.logos.be,
      company_name: config.company_name || VOICES_CONFIG.company.name,
      vat_number: config.vat_number || VOICES_CONFIG.company.vat,
      address: config.address || VOICES_CONFIG.company.address,
      theme: config.theme || 'voices',
      has_voicy: config.has_voicy ?? false,
      social_links: config.social_links || {
        instagram: 'https://www.instagram.com/voices.be',
        linkedin: 'https://www.linkedin.com/company/voices-be'
      },
      seo_data: config.seo_data || {
        title: config.name || 'Voices',
        description: 'De stem van morgen.',
        schema_type: 'Organization'
      }
    };

    this.cache[cleanHost] = finalConfig;
    return finalConfig;
  }

  static getLanguageCode(label: string): string {
    return normalizeLocale(label, 'nl-be');
  }

  static getLanguageLabel(input: string | number): string {
    if (!input || input === 'null') return '';
    const lowInput = String(input).toLowerCase().trim();
    const inputId = typeof input === 'number' ? input : (!isNaN(Number(input)) ? Number(input) : null);
    
    if (this.languagesRegistry.length > 0) {
      const match = this.languagesRegistry.find(l => 
        (inputId !== null && l.id === inputId) ||
        l.code.toLowerCase() === lowInput || l.label.toLowerCase() === lowInput
      );
      if (match) return match.label.replace(/\s*\(algemeen\)\s*/i, '').trim();
    }

    const emergencyMap: Record<string, string> = {
      '1': 'Vlaams', '2': 'Nederlands', '4': 'Frans', '5': 'Engels', '7': 'Duits', '8': 'Spaans', '12': 'Portugees',
      'nl-be': 'Vlaams', 'nl-nl': 'Nederlands', 'fr-fr': 'Frans', 'en-gb': 'Engels', 'de-de': 'Duits', 'es-es': 'Spaans', 'pt-pt': 'Portugees'
    };
    return emergencyMap[lowInput] || lowInput.charAt(0).toUpperCase() + lowInput.slice(1);
  }

  static getLanguageIcon(input: string | number): string | null {
    if (!input || input === 'null') return null;
    const lowInput = String(input).toLowerCase().trim();
    const inputId = typeof input === 'number' ? input : (!isNaN(Number(input)) ? Number(input) : null);

    if (this.languagesRegistry.length > 0) {
      const match = this.languagesRegistry.find(l => 
        (inputId !== null && l.id === inputId) ||
        l.code.toLowerCase() === lowInput || l.label.toLowerCase() === lowInput
      );
      if (match && match.icon) return match.icon;
    }

    const emergencyMap: Record<string, string> = {
      '1': 'FlagBE', 'nl-be': 'FlagBE', '2': 'FlagNL', 'nl-nl': 'FlagNL',
      '4': 'FlagFR', 'fr-fr': 'FlagFR', '5': 'FlagUK', 'en-gb': 'FlagUK',
      '8': 'FlagES', 'es-es': 'FlagES', '12': 'FlagPT', 'pt-pt': 'FlagPT'
    };
    return emergencyMap[lowInput] || null;
  }

  static getLanguageId(input: string, fallbackLocale: string = 'nl-be'): number | null {
    if (!input) return null;
    const lowInput = input.toLowerCase().trim();
    const normalized = normalizeLocale(lowInput, normalizeLocale(fallbackLocale, 'nl-be'));
    const shortInput = lowInput.split('-')[0];
    const shortNormalized = normalized.split('-')[0];
    const candidates = Array.from(
      new Set([lowInput, normalized, shortInput, shortNormalized].filter(Boolean))
    );
    const registry = this.languagesRegistry.length > 0 ? this.languagesRegistry : 
                    (typeof global !== 'undefined' && (global as any).handshakeLanguages ? (global as any).handshakeLanguages : 
                    (typeof window !== 'undefined' && (window as any).handshakeLanguages ? (window as any).handshakeLanguages : []));

    if (registry.length > 0) {
      const match = registry.find((l: any) => {
        const code = String(l.code || '').toLowerCase();
        const label = String(l.label || '').toLowerCase();
        return candidates.includes(code) || candidates.includes(label);
      });
      if (match) return match.id;
    }

    const emergencyMap: Record<string, number> = {
      'nl-be': 1, 'vlaams': 1, 'nl-nl': 2, 'nederlands': 2, 'fr-be': 3, 'fr-fr': 4, 'frans': 4,
      'en-gb': 5, 'engels': 5, 'en-us': 6, 'de-de': 7, 'duits': 7, 'es-es': 8, 'spaans': 8,
      'it-it': 10, 'italiaans': 10, 'pt-pt': 12, 'portugees': 12,
      'nl': 1, 'fr': 4, 'en': 5, 'de': 7, 'es': 8, 'it': 10, 'pt': 12
    };
    for (const candidate of candidates) {
      if (emergencyMap[candidate] != null) return emergencyMap[candidate];
    }
    return null;
  }

  static getCountryId(input: string): number | null {
    if (!input) return null;
    const lowInput = input.toLowerCase().trim();
    const registry = (typeof window !== 'undefined' && (window as any).handshakeCountries) ? (window as any).handshakeCountries : [];

    if (registry.length > 0) {
      const match = registry.find((c: any) => c.code.toLowerCase() === lowInput || c.label.toLowerCase() === lowInput);
      if (match) return match.id;
    }

    const emergencyMap: Record<string, number> = {
      'be': 1, 'nl': 2, 'fr': 4, 'de': 5, 'es': 6, 'it': 7, 'gb': 8, 'us': 9
    };
    return emergencyMap[lowInput] || null;
  }

  static getCountryLabel(input: string | number): string {
    if (!input || input === 'null') return '';
    const lowInput = String(input).toLowerCase().trim();
    const inputId = typeof input === 'number' ? input : (!isNaN(Number(input)) ? Number(input) : null);

    if (typeof window !== 'undefined' && (window as any).handshakeCountries) {
      const registry = (window as any).handshakeCountries;
      const match = registry.find((c: any) => (inputId !== null && c.id === inputId) || c.code.toLowerCase() === lowInput || c.label.toLowerCase() === lowInput);
      if (match) return match.label;
    }

    const emergencyMap: Record<string, string> = {
      'be': 'België', '1': 'België', 'nl': 'Nederland', '2': 'Nederland', 'fr': 'Frankrijk', '4': 'Frankrijk'
    };
    return emergencyMap[lowInput] || lowInput.toUpperCase();
  }

  static getUsageLabel(input: string | number): string {
    if (!input || input === 'null') return '';
    const lowInput = String(input).toLowerCase().trim();
    const inputId = typeof input === 'number' ? input : (!isNaN(Number(input)) ? Number(input) : null);

    const registry = this.journeysRegistry.length > 0 ? this.journeysRegistry : 
                    (typeof window !== 'undefined' && (window as any).handshakeJourneys ? (window as any).handshakeJourneys : []);

    if (registry.length > 0) {
      const match = registry.find((j: any) => (inputId !== null && j.id === inputId) || j.code.toLowerCase() === lowInput || j.label.toLowerCase() === lowInput);
      if (match) return match.label.replace('Agency: ', '');
    }

    const emergencyMap: Record<string, string> = {
      '26': 'Telefoon / IVR', '27': 'Voice-over', '28': 'Commercial', '1': 'Voices Studio', '30': 'Voices Academy'
    };
    return emergencyMap[lowInput] || lowInput;
  }

  static getJourneyId(code: string): number | null {
    if (!code) return null;
    const lowCode = code.toLowerCase().trim();
    const registry = this.journeysRegistry.length > 0 ? this.journeysRegistry : 
                    (typeof window !== 'undefined' && (window as any).handshakeJourneys ? (window as any).handshakeJourneys : []);

    if (registry.length > 0) {
      const match = registry.find((j: any) => j.code.toLowerCase() === lowCode);
      if (match) return match.id;
    }

    const staticMap: Record<string, number> = {
      'telephony': 26, 'video': 27, 'commercial': 28, 'studio': 1, 'academy': 30
    };
    return staticMap[lowCode] || null;
  }

  static getMediaLabel(input: string | number): string {
    if (!input || input === 'null') return '';
    const lowInput = String(input).toLowerCase().trim();
    const inputId = typeof input === 'number' ? input : (!isNaN(Number(input)) ? Number(input) : null);

    if (typeof window !== 'undefined' && (window as any).handshakeMediaTypes) {
      const registry = (window as any).handshakeMediaTypes;
      const match = registry.find((m: any) => (inputId !== null && m.id === inputId) || m.code.toLowerCase() === lowInput || m.label.toLowerCase() === lowInput);
      if (match) return match.label;
    }

    const emergencyMap: Record<string, string> = {
      'online': 'Online / Social Media', 'radio_national': 'Landelijke Radio', 'tv_national': 'Landelijke TV'
    };
    return emergencyMap[lowInput] || lowInput;
  }

  static getJourneyFromSegment(segment: string): 'commercial' | 'telephony' | 'video' {
    const s = segment?.toLowerCase();
    if (['commercial', 'advertentie', 'reclame', 'publicité', 'werbung', 'ads'].includes(s)) return 'commercial';
    if (['telephony', 'telefonie', 'telefoon', 'téléphonie'].includes(s)) return 'telephony';
    return 'video';
  }

  static isAgencySegment(segment: string): boolean {
    const s = segment?.toLowerCase();
    return ['agency', 'stemmen', 'voix', 'stimmen', 'voices'].includes(s);
  }

  static isAgencyEntryPoint(segment: string): boolean {
    if (this.isAgencySegment(segment)) return true;
    const s = segment?.toLowerCase();
    return ['johfrah', 'youssef', 'ademing'].includes(s);
  }

  // 🛡️ CHRIS-PROTOCOL: Isomorphic Alias
  public static get MarketManagerServer() { return MarketManager; }
}

// Alias for backward compatibility
export const MarketManagerServer = MarketManager;
