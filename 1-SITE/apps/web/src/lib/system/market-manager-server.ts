/**
 * NUCLEAR MARKET MANAGER SERVER - 2026 EDITION
 * 
 * DIT BESTAND IS DE ENIGE SOURCE OF TRUTH VOOR MARKET LOGIC.
 * Het bevat zowel de statische configuratie als de database-koppeling.
 * 
 * CHRIS-PROTOCOL: 
 * - Zelf-gecontaineriseerd om Temporal Dead Zone (TDZ) fouten te voorkomen.
 * - Geen overerving van andere pakketten tijdens module-initialisatie.
 */

import { VOICES_CONFIG } from './voices-config';

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

export class MarketManagerServer {
  private static cache: Record<string, MarketConfig> = {};
  private static languagesRegistry: Array<{ id: number, code: string, label: string, icon?: string }> = [];
  private static countriesRegistry: Array<{ id: number, code: string, label: string }> = [];
  private static journeysRegistry: Array<{ id: number, code: string, label: string }> = [];
  private static worldsRegistry: Array<{ id: number, code: string, label: string, description?: string }> = [];
  private static mediaTypesRegistry: Array<{ id: number, code: string, label: string }> = [];
  private static servicesRegistry: Array<{ id: number, code: string, label: string, category?: string }> = [];

  /**
   * 🛡️ CHRIS-PROTOCOL: Handshake Truth Registry (v2.14.667)
   * Primes the manager with real data from Supabase.
   */
  public static setWorlds(worlds: any[]) {
    this.worldsRegistry = worlds;
    if (typeof global !== 'undefined') (global as any).handshakeWorlds = worlds;
    if (typeof window !== 'undefined') (window as any).handshakeWorlds = worlds;
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

  /**
   * 🛡️ CHRIS-PROTOCOL: Service ID Resolver (v2.16.137)
   * Haalt het database ID op voor een service code.
   */
  static getServiceId(code: string): number | null {
    if (!code) return null;
    const lowCode = code.toLowerCase().trim();
    
    // 🛡️ CHRIS-PROTOCOL: Handshake Truth (Zero-Slop)
    const registry = this.servicesRegistry.length > 0 ? this.servicesRegistry : 
                    (typeof window !== 'undefined' && (window as any).handshakeServices ? (window as any).handshakeServices : []);

    if (registry.length > 0) {
      const match = registry.find((s: any) => s.code.toLowerCase() === lowCode);
      if (match) return match.id;
    }

    // Emergency fallbacks (v2.16.137: Hard Service IDs)
    const staticMap: Record<string, number> = {
      'live_regie': 1,
      'ivr': 2,
      'unpaid': 3,
      'bsf': 4,
      'online': 5,
      'radio_national': 6,
      'radio_regional': 7,
      'radio_local': 8,
      'tv_national': 9,
      'tv_regional': 10,
      'tv_local': 11,
      'podcast': 12,
      'social_media': 13,
      'cinema': 14,
      'pos': 15
    };

    return staticMap[lowCode] || null;
  }

  /**
   * 🛡️ CHRIS-PROTOCOL: Service Type Handshake (v2.16.140)
   * Bepaalt of een service ID een 'buyout' (BSF + Buyout) of 'all-in' type is.
   */
  static getServiceType(serviceId: number): 'buyout' | 'all-in' {
    const buyoutIds = [5, 6, 9, 13, 14]; // Online, Radio Nat, TV Nat, Social, Cinema
    return buyoutIds.includes(serviceId) ? 'buyout' : 'all-in';
  }

  /**
   * 🛡️ CHRIS-PROTOCOL: Market Hierarchy Resolver (v2.18.4)
   * Volgt de wet: Market Exception -> GLOBAL Truth -> Legacy Fallback.
   * Supports both ID-First and Code-based lookups.
   */
  static resolveServicePrice(actor: any, serviceCodeOrId: string | number, marketCode: string = 'BE'): { price: number, source: 'market' | 'global' | 'legacy' | 'none' } {
    const rates = actor.rates?.rates || actor.rates || {};
    const marketRates = rates[marketCode.toUpperCase()] || {};
    const globalRates = rates['GLOBAL'] || rates['global'] || {};
    
    // Resolve code if ID is provided
    let serviceCode = String(serviceCodeOrId);
    if (typeof serviceCodeOrId === 'number') {
      const registry = this.servicesRegistry.length > 0 ? this.servicesRegistry : 
                      (typeof window !== 'undefined' && (window as any).handshakeServices ? (window as any).handshakeServices : []);
      const match = registry.find((s: any) => s.id === serviceCodeOrId);
      if (match) serviceCode = match.code;
    }

    // 1. Check Market Exception
    if (marketRates[serviceCode] !== undefined && marketRates[serviceCode] !== null && marketRates[serviceCode] !== '') {
      return { price: Number(marketRates[serviceCode]), source: 'market' };
    }
    
    // 2. Check Global Truth
    if (globalRates[serviceCode] !== undefined && globalRates[serviceCode] !== null && globalRates[serviceCode] !== '') {
      return { price: Number(globalRates[serviceCode]), source: 'global' };
    }
    
    // 3. Legacy Column Fallbacks
    const legacyMap: Record<string, string> = {
      'ivr': 'price_ivr',
      'unpaid': 'price_unpaid',
      'online': 'price_online',
      'live_regie': 'price_live_regie',
      'bsf': 'price_bsf'
    };
    
    const col = legacyMap[serviceCode];
    if (col && actor[col]) {
      return { price: Number(actor[col]), source: 'legacy' };
    }
    
    return { price: 0, source: 'none' };
  }

  /**
   * 🌳 ANCESTRY RESOLVER (v2.16.132)
   * Haalt de World ID op basis van de market code of host.
   */
  public static getWorldId(marketCode?: string): number | null {
    const code = marketCode?.toLowerCase() || this.getCurrentMarket().market_code.toLowerCase();
    
    // 🛡️ CHRIS-PROTOCOL: Handshake Truth (v2.16.132)
    // We prioritize the registry which is populated from the database.
    const registry = this.worldsRegistry.length > 0 ? this.worldsRegistry : 
                    (typeof global !== 'undefined' && (global as any).handshakeWorlds ? (global as any).handshakeWorlds : []);

    if (registry.length > 0) {
      const world = registry.find((w: any) => w.code.toLowerCase() === code);
      if (world) return world.id;

      // Special case: Agency markets map to 'agency' world (ID 1)
      if (['be', 'nlnl', 'fr', 'es', 'pt', 'eu'].includes(code)) {
        const agency = registry.find((w: any) => w.code === 'agency');
        if (agency) return agency.id;
      }
    }

    // 🛡️ CHRIS-PROTOCOL: Static ID-First Fallback (v2.16.132)
    const staticMap: Record<string, number> = {
      'foyer': 0, 'contact': 0, 'terms': 0, 'privacy': 0, 'cookies': 0,
      'agency': 1, 'be': 1, 'nlnl': 1, 'fr': 1, 'es': 1, 'pt': 1, 'eu': 1,
      'telephony': 1, 'video': 1, 'commercial': 1,
      'studio': 2,
      'academy': 3,
      'ademing': 6,
      'portfolio': 5,
      'freelance': 7,
      'partner': 8,
      'johfrai': 10,
      'artist': 25
    };

    return staticMap[code] || null;
  }

  public static MARKETS_STATIC: Record<string, Partial<MarketConfig>> = {
    'voices.be': {
      market_code: 'BE',
      language: 'nl',
      primary_language: 'nl-be',
      primary_language_id: 1, // 🛡️ Handshake Truth: Vlaams
      supported_languages: ['nl-be', 'nl-nl', 'fr-be', 'en-gb', 'fr-fr', 'de-de'],
      popular_languages: ['nl-be', 'nl-nl', 'fr-be', 'en-gb', 'fr-fr', 'de-de'],
      name: 'Voices',
      email: 'johfrah@voices.be',
      logo_url: VOICES_CONFIG.assets.logos.be,
      theme: 'voices',
      has_voicy: true
    },
    'voices.nl': {
      market_code: 'NLNL',
      language: 'nl',
      primary_language: 'nl-be',
      primary_language_id: 1, // 🛡️ Unificatie: Vlaams is de bron
      supported_languages: ['nl-nl', 'nl-be', 'en-gb', 'de-de', 'fr-fr'],
      popular_languages: ['nl-nl', 'nl-be', 'en-gb', 'de-de', 'fr-fr'],
      name: 'Nederland',
      logo_url: VOICES_CONFIG.assets.logos.nl,
      theme: 'voices',
      has_voicy: true
    },
    'voices.fr': {
      market_code: 'FR',
      language: 'fr',
      primary_language: 'fr-fr',
      primary_language_id: 4, // 🛡️ Handshake Truth: Frans
      supported_languages: ['fr-fr', 'fr-be', 'en-gb', 'nl-nl', 'nl-be', 'de-de'],
      popular_languages: ['fr-fr', 'fr-be', 'en-gb', 'nl-nl', 'nl-be', 'de-de'],
      name: 'France',
      logo_url: VOICES_CONFIG.assets.logos.fr,
      theme: 'voices',
      has_voicy: true
    },
    'voices.es': {
      market_code: 'ES',
      language: 'es',
      primary_language: 'es-es',
      primary_language_id: 8, // 🛡️ Handshake Truth: Spaans
      supported_languages: ['es-es', 'en-gb', 'fr-fr', 'pt-pt', 'it-it'],
      popular_languages: ['es-es', 'en-gb', 'pt-pt'],
      name: 'España',
      logo_url: VOICES_CONFIG.assets.logos.es,
      theme: 'voices',
      has_voicy: true
    },
    'voices.pt': {
      market_code: 'PT',
      language: 'pt',
      primary_language: 'pt-pt',
      primary_language_id: 12, // 🛡️ Handshake Truth: Portugees
      supported_languages: ['pt-pt', 'en-gb', 'es-es', 'fr-fr'],
      popular_languages: ['pt-pt', 'en-gb', 'es-es'],
      name: 'Portugal',
      logo_url: VOICES_CONFIG.assets.logos.pt,
      theme: 'voices',
      has_voicy: true
    },
    'voices.eu': {
      market_code: 'EU',
      language: 'en',
      primary_language: 'en-gb',
      primary_language_id: 5, // 🛡️ Handshake Truth: Engels
      supported_languages: ['en-gb', 'de-de', 'nl-be', 'nl-nl', 'fr-be', 'fr-fr'],
      popular_languages: ['en-gb', 'de-de', 'fr-be', 'fr-fr', 'nl-nl', 'nl-be'],
      name: 'Europe',
      logo_url: VOICES_CONFIG.assets.logos.eu,
      theme: 'voices',
      has_voicy: true
    },
    'voices.academy': {
      market_code: 'ACADEMY',
      language: 'nl',
      primary_language: 'nl-BE',
      supported_languages: ['nl-BE', 'en-GB'],
      popular_languages: ['nl-BE', 'en-GB'],
      name: 'Voices Academy',
      logo_url: VOICES_CONFIG.assets.logos.be,
      theme: 'voices',
      social_links: {
        instagram: 'https://www.instagram.com/voices.be',
        linkedin: 'https://www.linkedin.com/company/voices-be'
      },
      seo_data: {
        description: 'Leer de kunst van voice-over bij de Voices Academy.',
        schema_type: 'Organization'
      }
    },
    'voices.be/academy': {
      market_code: 'ACADEMY',
      language: 'nl',
      primary_language: 'nl-be',
      primary_language_id: 1,
      supported_languages: ['nl-be', 'en-gb'],
      popular_languages: ['nl-be', 'en-gb'],
      name: 'Voices Academy',
      logo_url: VOICES_CONFIG.assets.logos.be,
      theme: 'voices',
      social_links: {
        instagram: 'https://www.instagram.com/voices.be',
        linkedin: 'https://www.linkedin.com/company/voices-be'
      },
      seo_data: {
        description: 'Leer de kunst van voice-over bij de Voices Academy.',
        schema_type: 'Organization'
      }
    },
    'voices.be/studio': {
      market_code: 'STUDIO',
      language: 'nl',
      primary_language: 'nl-be',
      primary_language_id: 1,
      supported_languages: ['nl-be', 'en-gb'],
      popular_languages: ['nl-be', 'en-gb'],
      name: 'Voices Studio',
      logo_url: VOICES_CONFIG.assets.logos.studio || VOICES_CONFIG.assets.logos.be,
      theme: 'voices',
      social_links: {
        instagram: 'https://www.instagram.com/voices.be_studio/',
        facebook: 'https://www.facebook.com/voices.studio.be'
      },
      seo_data: {
        description: 'Professionele voice-over workshops en studio-opnames in het hart van België.',
        schema_type: 'Organization'
      }
    },
    'johfrah.be': {
      market_code: 'FREELANCE',
      language: 'nl',
      primary_language: 'nl-be',
      primary_language_id: 1,
      supported_languages: ['nl-be', 'en-gb'],
      popular_languages: ['nl-be', 'en-gb'],
      name: 'Johfrah Lefebvre',
      logo_url: VOICES_CONFIG.assets.logos.johfrah,
      theme: 'johfrah',
      has_voicy: true,
      social_links: {
        instagram: 'https://www.instagram.com/johfrah',
        linkedin: 'https://www.linkedin.com/in/johfrah'
      },
      seo_data: {
        description: 'De stem achter het verhaal. Warme, natuurlijke Vlaamse voice-over & host voor nationale TV-spots en corporate video\'s.',
        schema_type: 'Person'
      }
    },
    'christina.be': {
      market_code: 'PORTFOLIO',
      language: 'nl',
      primary_language: 'nl-be',
      primary_language_id: 1,
      supported_languages: ['nl-be', 'en-gb'],
      popular_languages: ['nl-be', 'en-gb'],
      name: 'Christina Portfolio',
      logo_url: VOICES_CONFIG.assets.logos.be,
      theme: 'voices',
      social_links: {
        instagram: 'https://www.instagram.com/voices.be'
      },
      seo_data: {
        description: 'Commissies en platform-leverage via het Voices ecosysteem.',
        schema_type: 'Person'
      }
    },
    'youssefzaki.eu': {
      market_code: 'ARTIST',
      language: 'en',
      primary_language: 'en-gb',
      primary_language_id: 5,
      supported_languages: ['en-gb', 'nl-be', 'fr-fr', 'de-de'],
      popular_languages: ['en-gb', 'nl-be', 'fr-fr', 'de-de'],
      name: 'Youssef Zaki',
      logo_url: VOICES_CONFIG.assets.logos.be,
      theme: 'youssef',
      social_links: {
        instagram: 'https://www.instagram.com/youssefzaki.eu',
        youtube: 'https://www.youtube.com/@youssefzaki'
      },
      seo_data: {
        description: 'Muzieklabel & Artist World. Ontdek de releases en steun de kunst van Youssef Zaki.',
        schema_type: 'Person'
      }
    },
    'ademing.be': {
      market_code: 'ADEMING',
      language: 'nl',
      primary_language: 'nl-be',
      primary_language_id: 1,
      supported_languages: ['nl-be'],
      popular_languages: ['nl-be'],
      name: 'Ademing',
      logo_url: VOICES_CONFIG.assets.logos.ademing,
      theme: 'ademing',
      seo_data: {
        description: 'Adem in. Kom tot rust. Luister en verbind met de stilte in jezelf.',
        schema_type: 'WebApplication'
      }
    },
    'johfrai.be': {
      market_code: 'JOHFRAI',
      language: 'nl',
      primary_language: 'nl-be',
      primary_language_id: 1,
      supported_languages: ['nl-be', 'en-gb'],
      popular_languages: ['nl-be', 'en-gb'],
      name: 'Johfrai',
      logo_url: VOICES_CONFIG.assets.logos.be,
      theme: 'johfrai'
    }
  };

  private static get globalCache() {
    if (typeof window !== 'undefined') return { marketCache: {}, localesCache: null };
    
    const g = global as any;
    if (!g.marketManagerCache) {
      g.marketManagerCache = {
        marketCache: {},
        localesCache: null
      };
    }
    return g.marketManagerCache;
  }

  /**
   * Haalt alle actieve markt-domeinen op voor SEO alternates
   */
  static getMarketDomains(): Record<string, string> {
    return {
      'BE': 'https://www.voices.be',
      'NLNL': 'https://www.voices.nl',
      'FR': 'https://www.voices.fr',
      'ES': 'https://www.voices.es',
      'PT': 'https://www.voices.pt',
      'EU': 'https://www.voices.eu',
      'ACADEMY': 'https://www.voices.academy',
      'PORTFOLIO': 'https://www.christina.be',
      'ADEMING': 'https://www.ademing.be',
      'FREELANCE': 'https://www.johfrah.be',
      'JOHFRAI': 'https://www.johfrai.be',
      'ARTIST': 'https://www.youssefzaki.eu'
    };
  }

  /**
   * Haalt de huidige markt op basis van de host (Server-Side of Client-Side)
   */
  static getCurrentMarket(host?: string, path?: string): MarketConfig {
    let activeHost = host;
    let activePath = path;
    
    if (!activeHost && typeof window !== 'undefined') {
      activeHost = window.location.host;
    }
    
    if (!activePath && typeof window !== 'undefined') {
      activePath = window.location.pathname;
    }
    
    if (!activeHost) activeHost = 'voices.be';

    let cleanHost = activeHost.replace('www.', '').replace('https://', '').replace('http://', '').split('/')[0];
    
    // 🛡️ CHRIS-PROTOCOL: Sub-journey detection for static resolution (e.g. voices.be/studio)
    if (cleanHost === 'voices.be' || cleanHost === 'localhost:3000') {
      const checkPath = activePath || '';
      // 🛡️ CHRIS-PROTOCOL: World-First Detection (v2.16.095)
      // We still need these for initial static config lookup, but they are now
      // secondary to the dynamic world_id handshake.
      if (checkPath.startsWith('/studio')) cleanHost = 'voices.be/studio';
      else if (checkPath.startsWith('/academy')) cleanHost = 'voices.be/academy';
      else if (checkPath.startsWith('/ademing')) cleanHost = 'ademing.be';
      else if (checkPath.startsWith('/johfrai')) cleanHost = 'johfrai.be';
    }

    // Check cache first
    if (this.cache[cleanHost]) return this.cache[cleanHost];

    // 🛡️ CHRIS-PROTOCOL: Database-First lookup is mandatory. 
    // Static fallbacks only exist for the very first boot or extreme DB failure.
    const config = this.MARKETS_STATIC[cleanHost] || this.MARKETS_STATIC['voices.be'];

    // 🛡️ CHRIS-PROTOCOL: Force ISO-First for all static fallbacks
    const isoSupported = (config.supported_languages || []).map(l => this.getLanguageCode(l));
    const isoPopular = (config.popular_languages || []).map(l => this.getLanguageCode(l));

    const finalConfig: MarketConfig = {
      market_code: config.market_code || 'BE',
      language: config.language || 'nl',
      primary_language: this.getLanguageCode(config.primary_language || 'nl-BE'),
      primary_language_id: (config as any).primary_language_id || 1,
      supported_languages: isoSupported.length > 0 ? isoSupported : ['nl-BE', 'nl-NL', 'en-GB', 'fr-FR', 'de-DE'],
      popular_languages: isoPopular.length > 0 ? isoPopular : ['nl-BE', 'nl-NL', 'en-GB', 'fr-FR', 'de-DE'],
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

  /**
   * Haalt de ISO taalcode op basis van een UI label of volledige ISO code
   * 🛡️ CHRIS-PROTOCOL: Ondersteunt nu de 'Split' (v2.16.001)
   * Retourneert altijd de korte code (ISO-2) voor database-matching.
   */
  static getLanguageCode(label: string): string {
    if (!label) return 'nl';
    const lowLabel = label.toLowerCase().trim();
    
    // Als het al een volledige ISO-5 code is (nl-be), pak het eerste deel
    if (lowLabel.includes('-')) {
      return lowLabel.split('-')[0];
    }
    
    // 🛡️ CHRIS-PROTOCOL: Handshake Truth (Zero-Slop)
    if (this.languagesRegistry.length > 0) {
      const match = this.languagesRegistry.find(l => 
        l.label.toLowerCase() === lowLabel || 
        l.code.toLowerCase() === lowLabel
      );
      if (match) return match.code.includes('-') ? match.code.split('-')[0] : match.code;
    }

    // Emergency fallbacks for early boot/SSR only
    const emergencyMap: Record<string, string> = {
      'vlaams': 'nl',
      'nederlands': 'nl',
      'frans': 'fr',
      'engels': 'en',
      'duits': 'de'
    };
    
    return emergencyMap[lowLabel] || lowLabel;
  }

  /**
   * Haalt de UI label op basis van een ISO code of naam
   */
  static getLanguageLabel(input: string | number): string {
    if (!input || input === 'null') return '';
    const lowInput = String(input).toLowerCase().trim();
    const inputId = typeof input === 'number' ? input : (!isNaN(Number(input)) ? Number(input) : null);
    
    // 🛡️ CHRIS-PROTOCOL: Handshake Truth (Zero-Slop)
    // We look up the label in our live registry from Supabase.
    if (this.languagesRegistry.length > 0) {
      const match = this.languagesRegistry.find(l => 
        (inputId !== null && l.id === inputId) ||
        l.code.toLowerCase() === lowInput || 
        l.label.toLowerCase() === lowInput
      );
      if (match) {
        // 🛡️ USER-MANDATE: Remove "(Algemeen)" or similar slop from labels
        return match.label.replace(/\s*\(algemeen\)\s*/i, '').trim();
      }
    }

    // Emergency fallbacks for early boot/SSR only (v2.16.132: ISO-5 codes only)
    const emergencyMap: Record<string, string> = {
      '1': 'Vlaams',
      '2': 'Nederlands',
      '4': 'Frans',
      '5': 'Engels',
      '7': 'Duits',
      '8': 'Spaans',
      '12': 'Portugees',
      'nl-be': 'Vlaams',
      'nl-nl': 'Nederlands',
      'fr-fr': 'Frans',
      'en-gb': 'Engels',
      'de-de': 'Duits',
      'es-es': 'Spaans',
      'pt-pt': 'Portugees'
    };
    
    if (emergencyMap[lowInput]) return emergencyMap[lowInput];
    
    // Fallback: Capitalize first letter and remove slop
    return lowInput.replace(/\s*\(algemeen\)\s*/i, '').trim().charAt(0).toUpperCase() + lowInput.replace(/\s*\(algemeen\)\s*/i, '').trim().slice(1);
  }

  /**
   * 🛡️ CHRIS-PROTOCOL: Handshake Icon Lookup (v2.15.038)
   * Haalt de icon instrument naam op uit de registry.
   */
  static getLanguageIcon(input: string | number): string | null {
    if (!input || input === 'null') return null;
    const lowInput = String(input).toLowerCase().trim();
    const inputId = typeof input === 'number' ? input : (!isNaN(Number(input)) ? Number(input) : null);

    if (this.languagesRegistry.length > 0) {
      const match = this.languagesRegistry.find(l => 
        (inputId !== null && l.id === inputId) ||
        l.code.toLowerCase() === lowInput || 
        l.label.toLowerCase() === lowInput
      );
      if (match && match.icon) return match.icon;
    }

    // Emergency fallbacks
    const emergencyMap: Record<string, string> = {
      '1': 'FlagBE', 'nl-be': 'FlagBE', 'vlaams': 'FlagBE',
      '2': 'FlagNL', 'nl-nl': 'FlagNL', 'nederlands': 'FlagNL',
      '4': 'FlagFR', 'fr-fr': 'FlagFR', 'frans': 'FlagFR',
      '5': 'FlagUK', 'en-gb': 'FlagUK', 'engels': 'FlagUK',
      '8': 'FlagES', 'es-es': 'FlagES', 'spaans': 'FlagES',
      '12': 'FlagPT', 'pt-pt': 'FlagPT', 'portugees': 'FlagPT'
    };

    return emergencyMap[lowInput] || null;
  }

  /**
   * 🛡️ CHRIS-PROTOCOL: Handshake Language ID Resolver (v2.18.4)
   * Haalt het database ID op voor een taalcode of label.
   */
  static getLanguageId(input: string): number | null {
    if (!input) return null;
    const lowInput = input.toLowerCase().trim();

    // 🛡️ CHRIS-PROTOCOL: Handshake Truth (Zero-Slop)
    const registry = this.languagesRegistry.length > 0 ? this.languagesRegistry : 
                    (typeof global !== 'undefined' && (global as any).handshakeLanguages ? (global as any).handshakeLanguages : 
                    (typeof window !== 'undefined' && (window as any).handshakeLanguages ? (window as any).handshakeLanguages : []));

    if (registry.length > 0) {
      const match = registry.find((l: any) => 
        l.code.toLowerCase() === lowInput || 
        l.label.toLowerCase() === lowInput
      );
      if (match) return match.id;
    }

    // Emergency fallbacks
    const emergencyMap: Record<string, number> = {
      'nl-be': 1, 'vlaams': 1, 'be': 1,
      'nl-nl': 2, 'nederlands': 2, 'nl': 2,
      'fr-be': 3,
      'fr-fr': 4, 'frans': 4, 'fr': 4,
      'en-gb': 5, 'engels': 5, 'en': 5,
      'en-us': 6,
      'de-de': 7, 'duits': 7, 'de': 7,
      'es-es': 8, 'spaans': 8, 'es': 8,
      'it-it': 10, 'italiaans': 10, 'it': 10,
      'pt-pt': 12, 'portugees': 12, 'pt': 12
    };

    return emergencyMap[lowInput] || null;
  }

  /**
   * 🛡️ CHRIS-PROTOCOL: Handshake Country ID Resolver (v2.18.4)
   * Haalt het database ID op voor een landcode of label.
   */
  static getCountryId(input: string): number | null {
    if (!input) return null;
    const lowInput = input.toLowerCase().trim();

    const registry = (typeof window !== 'undefined' && (window as any).handshakeCountries) ? (window as any).handshakeCountries : [];

    if (registry.length > 0) {
      const match = registry.find((c: any) => 
        c.code.toLowerCase() === lowInput || 
        c.label.toLowerCase() === lowInput
      );
      if (match) return match.id;
    }

    // Emergency fallbacks
    const emergencyMap: Record<string, number> = {
      'be': 1, 'belgië': 1,
      'nl': 2, 'nederland': 2,
      'fr': 4, 'frankrijk': 4,
      'de': 5, 'duitsland': 5,
      'es': 6, 'spanje': 6,
      'it': 7, 'italië': 7,
      'gb': 8, 'uk': 8, 'verenigd koninkrijk': 8,
      'us': 9, 'verenigde staten': 9
    };

    return emergencyMap[lowInput] || null;
  }

  /**
   * 🛡️ CHRIS-PROTOCOL: Handshake Country Lookup (v2.15.039)
   * Haalt de UI label op basis van een ISO code of ID.
   */
  static getCountryLabel(input: string | number): string {
    if (!input || input === 'null') return '';
    const lowInput = String(input).toLowerCase().trim();
    const inputId = typeof input === 'number' ? input : (!isNaN(Number(input)) ? Number(input) : null);

    if (typeof window !== 'undefined' && (window as any).handshakeCountries) {
      const registry = (window as any).handshakeCountries;
      const match = registry.find((c: any) => 
        (inputId !== null && c.id === inputId) ||
        c.code.toLowerCase() === lowInput || 
        c.label.toLowerCase() === lowInput
      );
      if (match) return match.label;
    }

    // Emergency fallbacks
    const emergencyMap: Record<string, string> = {
      'be': 'België', '1': 'België',
      'nl': 'Nederland', '2': 'Nederland',
      'fr': 'Frankrijk', '4': 'Frankrijk',
      'de': 'Duitsland',
      'es': 'Spanje',
      'it': 'Italië',
      'gb': 'Verenigd Koninkrijk', 'uk': 'Verenigd Koninkrijk',
      'us': 'Verenigde Staten'
    };

    return emergencyMap[lowInput] || lowInput.toUpperCase();
  }

  /**
   * 🛡️ CHRIS-PROTOCOL: Handshake Usage Lookup (v2.16.134)
   * Haalt het UI label op voor een usage code of ID.
   */
  static getUsageLabel(input: string | number): string {
    if (!input || input === 'null') return '';
    const lowInput = String(input).toLowerCase().trim();
    const inputId = typeof input === 'number' ? input : (!isNaN(Number(input)) ? Number(input) : null);

    // 🛡️ CHRIS-PROTOCOL: Handshake Truth (Zero-Slop)
    const registry = this.journeysRegistry.length > 0 ? this.journeysRegistry : 
                    (typeof window !== 'undefined' && (window as any).handshakeJourneys ? (window as any).handshakeJourneys : []);

    if (registry.length > 0) {
      const match = registry.find((j: any) => 
        (inputId !== null && j.id === inputId) ||
        j.code.toLowerCase() === lowInput || 
        j.label.toLowerCase() === lowInput
      );
      if (match) return match.label.replace('Agency: ', '');
    }

    // Emergency fallbacks (v2.16.134: ID-First Handshake)
    const emergencyMap: Record<string, string> = {
      '26': 'Telefoon / IVR',
      '27': 'Voice-over',
      '28': 'Commercial',
      '1': 'Voices Studio',
      '30': 'Voices Academy',
      'telephony': 'Telefoon / IVR', 'telefonie': 'Telefoon / IVR', 'agency_ivr': 'Telefoon / IVR',
      'video': 'Voice-over', 'unpaid': 'Voice-over', 'agency_vo': 'Voice-over',
      'commercial': 'Commercial', 'agency_commercial': 'Commercial'
    };

    return emergencyMap[lowInput] || lowInput;
  }

  /**
   * 🛡️ CHRIS-PROTOCOL: Journey ID Resolver (v2.16.134)
   * Haalt het database ID op voor een journey code.
   */
  static getJourneyId(code: string): number | null {
    if (!code) return null;
    const lowCode = code.toLowerCase().trim();
    
    // 🛡️ CHRIS-PROTOCOL: Handshake Truth (Zero-Slop)
    const registry = this.journeysRegistry.length > 0 ? this.journeysRegistry : 
                    (typeof window !== 'undefined' && (window as any).handshakeJourneys ? (window as any).handshakeJourneys : []);

    if (registry.length > 0) {
      const match = registry.find((j: any) => j.code.toLowerCase() === lowCode);
      if (match) return match.id;
      
      // Map legacy slugs to database codes
      const legacyMap: Record<string, string> = {
        'telephony': 'telephony',
        'video': 'video',
        'commercial': 'commercial'
      };
      if (legacyMap[lowCode]) {
        const legacyMatch = registry.find((j: any) => j.code.toLowerCase() === legacyMap[lowCode]);
        if (legacyMatch) return legacyMatch.id;
      }
    }

    // Emergency fallbacks
    const staticMap: Record<string, number> = {
      'telephony': 26,
      'video': 27,
      'commercial': 28,
      'studio': 1,
      'academy': 30
    };

    return staticMap[lowCode] || null;
  }

  /**
   * 🛡️ CHRIS-PROTOCOL: Handshake Media Lookup (v2.15.040)
   * Haalt het UI label op voor een media type code of ID.
   */
  static getMediaLabel(input: string | number): string {
    if (!input || input === 'null') return '';
    const lowInput = String(input).toLowerCase().trim();
    const inputId = typeof input === 'number' ? input : (!isNaN(Number(input)) ? Number(input) : null);

    if (typeof window !== 'undefined' && (window as any).handshakeMediaTypes) {
      const registry = (window as any).handshakeMediaTypes;
      const match = registry.find((m: any) => 
        (inputId !== null && m.id === inputId) ||
        m.code.toLowerCase() === lowInput || 
        m.label.toLowerCase() === lowInput
      );
      if (match) return match.label;
    }

    // Emergency fallbacks
    const emergencyMap: Record<string, string> = {
      'online': 'Online / Social Media',
      'radio_national': 'Landelijke Radio',
      'radio_regional': 'Regionale Radio',
      'radio_local': 'Lokale Radio',
      'tv_national': 'Landelijke TV',
      'tv_regional': 'Regionale TV',
      'tv_local': 'Lokale TV',
      'podcast': 'Podcast Ads'
    };

    return emergencyMap[lowInput] || lowInput;
  }

  /**
   * Haalt alle ondersteunde talen voor de huidige markt
   */
  static getNativeLanguages(lang: string = 'nl'): Record<string, string> {
    const labels: Record<string, Record<string, string>> = {
      'nl': {
        'vlaams': 'Vlaams', 'nederlands': 'Nederlands', 'engels': 'Engels', 'frans': 'Frans', 'duits': 'Duits'
      },
      'fr': {
        'vlaams': 'Flamand', 'nederlands': 'Néerlandais', 'engels': 'Anglais', 'frans': 'Français', 'duits': 'Allemand'
      },
      'de': {
        'vlaams': 'Flämisch', 'nederlands': 'Niederländisch', 'engels': 'Englisch', 'frans': 'Französisch', 'duits': 'Deutsch'
      }
    };
    return labels[lang] || labels['nl'];
  }

  /**
   * Bepaalt de volgorde van talen op basis van the huidige taal
   */
  static getLanguageOrder(lang: string = 'nl'): string[] {
    const orders: Record<string, string[]> = {
      'nl': ['nl-be', 'nl-nl', 'en-gb', 'fr-fr', 'de-de'],
      'fr': ['fr-fr', 'en-gb', 'nl-nl', 'nl-be', 'de-de'],
      'es': ['es-es', 'en-gb', 'fr-fr', 'nl-nl'],
      'pt': ['pt-pt', 'en-gb', 'fr-fr', 'es-es'],
      'de': ['de-de', 'en-gb', 'fr-fr', 'nl-nl']
    };
    return orders[lang] || orders['nl'];
  }

  /**
   * 🛡️ CHRIS-PROTOCOL: Centralized Journey Segment Mapping
   * Voorkomt hardcoded slop in de Smart Router.
   */
  static getJourneyFromSegment(segment: string): 'commercial' | 'telephony' | 'video' {
    const s = segment?.toLowerCase();
    if (['commercial', 'advertentie', 'reclame', 'publicité', 'werbung', 'ads'].includes(s)) return 'commercial';
    if (['telephony', 'telefonie', 'telefoon', 'téléphonie'].includes(s)) return 'telephony';
    if (['video', 'corporate', 'vidéo', 'film', 'bedrijfsfilm'].includes(s)) return 'video';
    return 'video';
  }

  /**
   * 🛡️ CHRIS-PROTOCOL: Centralized Agency Segment Check
   * Used by the SmartRouter to decide between Grid and Profile.
   */
  static isAgencySegment(segment: string): boolean {
    const s = segment?.toLowerCase();
    return ['agency', 'stemmen', 'voix', 'stimmen', 'voices'].includes(s);
  }

  /**
   * 🛡️ CHRIS-PROTOCOL: Centralized Agency Entry Point Check
   * Includes portfolio names that are valid entry points for the Agency journey.
   * Used by client-side logic to prevent unwanted SPA redirects.
   */
  static isAgencyEntryPoint(segment: string): boolean {
    if (this.isAgencySegment(segment)) return true;
    const s = segment?.toLowerCase();
    return ['johfrah', 'youssef', 'ademing'].includes(s);
  }

  /**
   * 🛡️ CHRIS-PROTOCOL: Nuclear Test Safety (v2.15.094)
   * Centralized allowed domains for test mail redirects.
   */
  static getAllowedTestRecipients(): string[] {
    return ['johfrah@voices.be', 'bernadette@voices.be', 'voices.be', 'ademing.be'];
  }

  /**
   * 🛡️ CHRIS-PROTOCOL: Nuclear Test Safety (v2.15.094)
   * Centralized fallback email for test mail redirects.
   */
  static getFallbackTestEmail(): string {
    return 'johfrah@voices.be';
  }
}

// CHRIS-PROTOCOL: Alias for backward compatibility
export const MarketManager = MarketManagerServer;
