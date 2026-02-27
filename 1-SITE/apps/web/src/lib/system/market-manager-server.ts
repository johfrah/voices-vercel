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
  private static mediaTypesRegistry: Array<{ id: number, code: string, label: string }> = [];

  /**
   * 🛡️ CHRIS-PROTOCOL: Handshake Truth Registry (v2.14.667)
   * Primes the manager with real data from Supabase.
   */
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

  public static get languages() { return this.languagesRegistry; }
  public static get countries() { return this.countriesRegistry; }
  public static get journeys() { return this.journeysRegistry; }
  public static get mediaTypes() { return this.mediaTypesRegistry; }

  public static MARKETS_STATIC: Record<string, Partial<MarketConfig>> = {
    'voices.be': {
      market_code: 'BE',
      language: 'nl',
      primary_language: 'nl-BE',
      primary_language_id: 1, // 🛡️ Handshake Truth: Vlaams
      supported_languages: ['nl-BE', 'nl-NL', 'fr-BE', 'en-GB', 'fr-FR', 'de-DE'],
      popular_languages: ['nl-BE', 'nl-NL', 'fr-BE', 'en-GB', 'fr-FR', 'de-DE'],
      name: 'Voices',
      email: 'johfrah@voices.be',
      logo_url: VOICES_CONFIG.assets.logos.be,
      theme: 'voices',
      has_voicy: true
    },
    'voices.nl': {
      market_code: 'NLNL',
      language: 'nl',
      primary_language: 'nl-NL',
      primary_language_id: 2, // 🛡️ Handshake Truth: Nederlands
      supported_languages: ['nl-NL', 'nl-BE', 'en-GB', 'de-DE', 'fr-FR'],
      popular_languages: ['nl-NL', 'nl-BE', 'en-GB', 'de-DE', 'fr-FR'],
      name: 'Nederland',
      logo_url: VOICES_CONFIG.assets.logos.nl,
      theme: 'voices',
      has_voicy: true
    },
    'voices.fr': {
      market_code: 'FR',
      language: 'fr',
      primary_language: 'fr-FR',
      primary_language_id: 4, // 🛡️ Handshake Truth: Frans
      supported_languages: ['fr-FR', 'fr-BE', 'en-GB', 'nl-NL', 'nl-BE', 'de-DE'],
      popular_languages: ['fr-FR', 'fr-BE', 'en-GB', 'nl-NL', 'nl-BE', 'de-DE'],
      name: 'France',
      logo_url: VOICES_CONFIG.assets.logos.fr,
      theme: 'voices',
      has_voicy: true
    },
    'voices.es': {
      market_code: 'ES',
      language: 'es',
      primary_language: 'es-ES',
      primary_language_id: 8, // 🛡️ Handshake Truth: Spaans
      supported_languages: ['es-ES', 'en-GB', 'fr-FR', 'pt-PT', 'it-IT'],
      popular_languages: ['es-ES', 'en-GB', 'pt-PT'],
      name: 'España',
      logo_url: VOICES_CONFIG.assets.logos.es,
      theme: 'voices',
      has_voicy: true
    },
    'voices.pt': {
      market_code: 'PT',
      language: 'pt',
      primary_language: 'pt-PT',
      primary_language_id: 12, // 🛡️ Handshake Truth: Portugees
      supported_languages: ['pt-PT', 'en-GB', 'es-ES', 'fr-FR'],
      popular_languages: ['pt-PT', 'en-GB', 'es-ES'],
      name: 'Portugal',
      logo_url: VOICES_CONFIG.assets.logos.pt,
      theme: 'voices',
      has_voicy: true
    },
    'voices.eu': {
      market_code: 'EU',
      language: 'en',
      primary_language: 'en-GB',
      primary_language_id: 5, // 🛡️ Handshake Truth: Engels
      supported_languages: ['en-GB', 'de-DE', 'nl-BE', 'nl-NL', 'fr-BE', 'fr-FR'],
      popular_languages: ['en-GB', 'de-DE', 'fr-BE', 'fr-FR', 'nl-NL', 'nl-BE'],
      name: 'Europe',
      logo_url: VOICES_CONFIG.assets.logos.eu,
      theme: 'voices',
      has_voicy: true
    },
    'voices.academy': {
      market_code: 'ACADEMY',
      language: 'nl',
      primary_language: 'nl-BE',
      supported_languages: ['nl-BE', 'nl-NL', 'en-GB'],
      popular_languages: ['nl-BE', 'nl-NL', 'en-GB'],
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
      primary_language: 'nl-BE',
      supported_languages: ['nl-BE', 'nl-NL', 'en-GB'],
      popular_languages: ['nl-BE', 'nl-NL', 'en-GB'],
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
      primary_language: 'nl-BE',
      supported_languages: ['nl-BE', 'nl-NL', 'en-GB'],
      popular_languages: ['nl-BE', 'nl-NL', 'en-GB'],
      name: 'Voices Studio',
      logo_url: VOICES_CONFIG.assets.logos.be,
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
      market_code: 'PORTFOLIO',
      language: 'nl',
      primary_language: 'nl-BE',
      supported_languages: ['nl-BE', 'nl-NL', 'en-GB'],
      popular_languages: ['nl-BE', 'nl-NL', 'en-GB'],
      name: 'Johfrah',
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
    'youssefzaki.eu': {
      market_code: 'ARTIST',
      language: 'en',
      primary_language: 'en-US',
      supported_languages: ['en-GB', 'nl-NL', 'nl-BE', 'fr-FR', 'de-DE'],
      popular_languages: ['en-GB', 'nl-NL', 'nl-BE', 'fr-FR', 'de-DE'],
      name: 'Youssef Zaki',
      logo_url: VOICES_CONFIG.assets.logos.be,
      theme: 'youssef',
      social_links: {
        instagram: 'https://www.instagram.com/youssefzaki.eu',
        youtube: 'https://www.youtube.com/@youssefzaki'
      },
      seo_data: {
        description: 'The voice of a new generation. Discover the music and story of Youssef Zaki.',
        schema_type: 'Person'
      }
    },
    'ademing.be': {
      market_code: 'ADEMING',
      language: 'nl',
      primary_language: 'nl-BE',
      supported_languages: ['nl-BE', 'nl-NL'],
      popular_languages: ['nl-BE', 'nl-NL'],
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
      primary_language: 'nl-BE',
      supported_languages: ['nl-BE', 'nl-NL', 'en-GB'],
      popular_languages: ['nl-BE', 'nl-NL', 'en-GB'],
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
      'PORTFOLIO': 'https://www.johfrah.be',
      'ADEMING': 'https://www.ademing.be',
      'ARTIST': 'https://www.youssefzaki.eu',
      'JOHFRAI': 'https://www.johfrai.be'
    };
  }

  /**
   * Haalt de huidige markt op basis van de host (Server-Side of Client-Side)
   */
  static getCurrentMarket(host?: string): MarketConfig {
    let activeHost = host;
    
    if (!activeHost && typeof window !== 'undefined') {
      activeHost = window.location.host;
    }
    
    if (!activeHost) activeHost = 'voices.be';

    let cleanHost = activeHost.replace('www.', '').replace('https://', '').replace('http://', '').split('/')[0];
    
    // 🛡️ CHRIS-PROTOCOL: Sub-journey detection for static resolution (e.g. voices.be/studio)
    if (cleanHost === 'voices.be' && typeof window !== 'undefined') {
      if (window.location.pathname.startsWith('/studio')) cleanHost = 'voices.be/studio';
      if (window.location.pathname.startsWith('/academy')) cleanHost = 'voices.be/academy';
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

    // Emergency fallbacks for early boot/SSR only
    const emergencyMap: Record<string, string> = {
      '1': 'Vlaams',
      '2': 'Nederlands',
      '4': 'Frans',
      '5': 'Engels',
      'nl-be': 'Vlaams',
      'nl-nl': 'Nederlands',
      'fr-fr': 'Frans',
      'en-gb': 'Engels',
      'de-de': 'Duits'
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
   * 🛡️ CHRIS-PROTOCOL: Handshake Usage Lookup (v2.15.040)
   * Haalt het UI label op voor een usage code of ID.
   */
  static getUsageLabel(input: string | number): string {
    if (!input || input === 'null') return '';
    const lowInput = String(input).toLowerCase().trim();
    const inputId = typeof input === 'number' ? input : (!isNaN(Number(input)) ? Number(input) : null);

    if (typeof window !== 'undefined' && (window as any).handshakeJourneys) {
      const registry = (window as any).handshakeJourneys;
      const match = registry.find((j: any) => 
        (inputId !== null && j.id === inputId) ||
        j.code.toLowerCase() === lowInput || 
        j.label.toLowerCase() === lowInput
      );
      if (match) return match.label.replace('Agency: ', '');
    }

    // Emergency fallbacks
    const emergencyMap: Record<string, string> = {
      'telephony': 'Telefoon / IVR', 'telefonie': 'Telefoon / IVR', 'agency_ivr': 'Telefoon / IVR',
      'video': 'Online Video / Corporate', 'unpaid': 'Online Video / Corporate', 'agency_vo': 'Online Video / Corporate',
      'commercial': 'Commercial / Advertentie', 'agency_commercial': 'Commercial / Advertentie'
    };

    return emergencyMap[lowInput] || lowInput;
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
  static getJourneyFromSegment(segment: string): 'commercial' | 'telephony' | 'video' | 'video' {
    const s = segment?.toLowerCase();
    if (['commercial', 'advertentie', 'reclame', 'publicité', 'werbung', 'ads'].includes(s)) return 'commercial';
    if (['telephony', 'telefonie', 'telefoon', 'téléphonie', 'telefonie'].includes(s)) return 'telephony';
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
}

// CHRIS-PROTOCOL: Alias for backward compatibility
export const MarketManager = MarketManagerServer;
