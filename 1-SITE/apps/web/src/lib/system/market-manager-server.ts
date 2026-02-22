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

import { VOICES_CONFIG } from '../../../../../packages/config/config';

export interface MarketConfig {
  market_code: string;
  language: string;
  primary_language: string;
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

  public static MARKETS_STATIC: Record<string, Partial<MarketConfig>> = {
    'voices.be': {
      market_code: 'BE',
      language: 'nl',
      primary_language: 'nl-BE',
      supported_languages: ['nl-BE', 'nl-NL', 'en-GB', 'fr-FR', 'de-DE'],
      popular_languages: ['nl-BE', 'nl-NL', 'fr-FR', 'en-GB', 'de-DE'],
      name: 'België',
      logo_url: VOICES_CONFIG.assets.logos.be,
      theme: 'voices'
    },
    'voices.nl': {
      market_code: 'NLNL',
      language: 'nl',
      primary_language: 'nl-NL',
      supported_languages: ['nl-NL', 'nl-BE', 'en-GB', 'de-DE', 'fr-FR'],
      popular_languages: ['nl-NL', 'nl-BE', 'en-GB', 'de-DE', 'fr-FR'],
      name: 'Nederland',
      logo_url: VOICES_CONFIG.assets.logos.nl,
      theme: 'voices'
    },
    'voices.fr': {
      market_code: 'FR',
      language: 'fr',
      primary_language: 'fr-FR',
      supported_languages: ['fr-FR', 'en-GB', 'nl-NL', 'nl-BE', 'de-DE'],
      popular_languages: ['fr-FR', 'en-GB', 'nl-NL', 'nl-BE', 'de-DE'],
      name: 'France',
      logo_url: VOICES_CONFIG.assets.logos.fr,
      theme: 'voices'
    },
    'voices.es': {
      market_code: 'ES',
      language: 'es',
      primary_language: 'es-ES',
      supported_languages: ['es-ES', 'en-GB', 'fr-FR', 'pt-PT', 'it-IT'],
      popular_languages: ['es-ES', 'en-GB', 'pt-PT'],
      name: 'España',
      logo_url: VOICES_CONFIG.assets.logos.es,
      theme: 'voices'
    },
    'voices.pt': {
      market_code: 'PT',
      language: 'pt',
      primary_language: 'pt-PT',
      supported_languages: ['pt-PT', 'en-GB', 'es-ES', 'fr-FR'],
      popular_languages: ['pt-PT', 'en-GB', 'es-ES'],
      name: 'Portugal',
      logo_url: VOICES_CONFIG.assets.logos.pt,
      theme: 'voices'
    },
    'voices.eu': {
      market_code: 'EU',
      language: 'en',
      primary_language: 'en-GB',
      supported_languages: ['en-GB', 'de-DE', 'nl-BE', 'nl-NL', 'fr-FR'],
      popular_languages: ['en-GB', 'de-DE', 'fr-FR', 'nl-NL', 'nl-BE'],
      name: 'Europe',
      logo_url: VOICES_CONFIG.assets.logos.eu,
      theme: 'voices'
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

    const config = this.MARKETS_STATIC[cleanHost] || this.MARKETS_STATIC['voices.be'];

    // 🛡️ CHRIS-PROTOCOL: Force ISO-First for all static fallbacks
    const isoSupported = (config.supported_languages || []).map(l => this.getLanguageCode(l));
    const isoPopular = (config.popular_languages || []).map(l => this.getLanguageCode(l));

    const finalConfig: MarketConfig = {
      market_code: config.market_code || 'BE',
      language: config.language || 'nl',
      primary_language: this.getLanguageCode(config.primary_language || 'nl-BE'),
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
      has_voicy: config.has_voicy ?? false
    };

    this.cache[cleanHost] = finalConfig;
    return finalConfig;
  }

  /**
   * Haalt de ISO taalcode op basis van een UI label
   */
  static getLanguageCode(label: string): string {
    const lowLabel = label.toLowerCase().trim();
    const map: Record<string, string> = {
      'vlaams': 'nl-be',
      'nederlands': 'nl-nl',
      'frans': 'fr-fr',
      'frans (be)': 'fr-be',
      'frans (fr)': 'fr-fr',
      'engels': 'en-gb',
      'engels (uk)': 'en-gb',
      'engels (us)': 'en-us',
      'duits': 'de-de',
      'spaans': 'es-es',
      'italiaans': 'it-it',
      'pools': 'pl-pl',
      'deens': 'da-dk',
      'portugees': 'pt-pt',
      'zweeds': 'sv-se',
      'noors': 'nb-no',
      'fins': 'fi-fi',
      'grieks': 'el-gr',
      'turks': 'tr-tr',
      'russisch': 'ru-ru',
      'arabisch': 'ar-sa',
      'chinees': 'zh-cn',
      'japans': 'ja-jp',
      'nl-be': 'nl-be',
      'nl-nl': 'nl-nl',
      'fr-fr': 'fr-fr',
      'fr-be': 'fr-be',
      'en-gb': 'en-gb',
      'en-us': 'en-us',
      'de-de': 'de-de',
      'es-es': 'es-es',
      'it-it': 'it-it',
      'pl-pl': 'pl-pl',
      'da-dk': 'da-dk',
      'pt-pt': 'pt-pt',
      'sv-se': 'sv-se'
    };
    return map[lowLabel] || lowLabel;
  }

  /**
   * Haalt de UI label op basis van een ISO code of naam
   */
  static getLanguageLabel(input: string): string {
    if (!input) return '';
    const lowInput = input.toLowerCase().trim();
    
    // 🛡️ CHRIS-PROTOCOL: Map ISO codes and common variations to standard UI labels.
    // Note: 'Vlaams' is strictly nl-BE. Non-natives can only offer 'Nederlands'.
    const map: Record<string, string> = {
      'nl-be': 'Vlaams',
      'nl-nl': 'Nederlands',
      'fr-fr': 'Frans',
      'fr-be': 'Frans',
      'en-gb': 'Engels',
      'en-us': 'Engels',
      'de-de': 'Duits',
      'es-es': 'Spaans',
      'it-it': 'Italiaans',
      'pl-pl': 'Pools',
      'da-dk': 'Deens',
      'pt-pt': 'Portugees',
      'sv-se': 'Zweeds',
      'vlaams': 'Vlaams',
      'nederlands': 'Nederlands',
      'frans': 'Frans',
      'engels': 'Engels',
      'duits': 'Duits',
      'spaans': 'Spaans',
      'italiaans': 'Italiaans',
      'pools': 'Pools',
      'deens': 'Deens',
      'portugees': 'Portugees',
      'zweeds': 'Zweeds'
    };
    
    if (map[lowInput]) return map[lowInput];
    
    // Fallback: Capitalize first letter
    return lowInput.charAt(0).toUpperCase() + lowInput.slice(1);
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
      'nl': ['vlaams', 'nederlands', 'engels', 'frans', 'duits'],
      'fr': ['frans', 'engels', 'nederlands', 'vlaams', 'duits'],
      'es': ['spaans', 'engels', 'frans', 'nederlands'],
      'pt': ['portugees', 'engels', 'frans', 'spaans'],
      'de': ['duits', 'engels', 'frans', 'nederlands']
    };
    return orders[lang] || orders['nl'];
  }
}

// CHRIS-PROTOCOL: Alias for backward compatibility
export const MarketManager = MarketManagerServer;
