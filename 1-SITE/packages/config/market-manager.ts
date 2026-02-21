/**
 * NUCLEAR MARKET MANAGER - 2026 EDITION
 * 
 * Deze service vervangt de PHP MarketManager logica.
 * Het beheert land-specifieke instellingen op basis van het domein
 * en orkestreert de internationale ervaring in de Next.js layer.
 */

import { VOICES_CONFIG } from './config';

export interface MarketConfig {
  market_code: string;
  language: string;
  primary_language: string; // De voorgeselecteerde taal (bijv. 'Vlaams')
  supported_languages: string[]; // Welke talen zichtbaar zijn in de dropdown
  popular_languages: string[]; // Welke talen bovenaan staan in de dropdown (Bob-methode)
  currency: string;
  name: string;
  phone: string;
  email: string;
  logo_url: string;
  company_name: string;
  vat_number: string;
  theme: 'voices' | 'ademing' | 'johfrah' | 'youssef' | 'johfrai';
  has_voicy?: boolean;
}

export class MarketManager {
  private static MARKETS: Record<string, Partial<MarketConfig>> = {
    'voices.be': {
      market_code: 'BE',
      language: 'nl',
      primary_language: 'Vlaams',
      supported_languages: [
        'Vlaams', 'Nederlands', 'Engels', 'Frans', 'Duits', 
        'Spaans', 'Italiaans', 'Pools', 'Portugees', 'Turks', 
        'Deens', 'Zweeds', 'Noors', 'Fins', 'Grieks', 
        'Russisch', 'Arabisch', 'Chinees', 'Japans'
      ],
      popular_languages: ['Vlaams', 'Nederlands', 'Frans', 'Engels', 'Duits'],
      name: 'België',
      logo_url: VOICES_CONFIG.assets.logos.be,
      theme: 'voices'
    },
    'voices.nl': {
      market_code: 'NLNL',
      language: 'nl',
      primary_language: 'Nederlands',
      supported_languages: ['Nederlands', 'Vlaams', 'Engels', 'Duits', 'Frans', 'Spaans', 'Italiaans'],
      popular_languages: ['Nederlands', 'Vlaams', 'Engels', 'Duits', 'Frans'],
      name: 'Nederland',
      phone: '+31 (0)85 016 34 60',
      email: 'johfrah@voices.nl',
      logo_url: VOICES_CONFIG.assets.logos.nl,
      theme: 'voices'
    },
    'voices.fr': {
      market_code: 'FR',
      language: 'fr',
      primary_language: 'Frans',
      supported_languages: ['Frans', 'Engels', 'Nederlands', 'Vlaams', 'Duits', 'Spaans', 'Italiaans'],
      popular_languages: ['Frans', 'Engels', 'Nederlands', 'Vlaams', 'Duits'],
      name: 'France',
      email: 'johfrah@voices.fr',
      logo_url: VOICES_CONFIG.assets.logos.fr,
      theme: 'voices'
    },
    'voices.es': {
      market_code: 'ES',
      language: 'es',
      primary_language: 'Spaans',
      supported_languages: ['Spaans', 'Engels', 'Frans', 'Portugees', 'Italiaans'],
      popular_languages: ['Spaans', 'Engels', 'Portugees'],
      name: 'España',
      email: 'johfrah@voices.es',
      logo_url: VOICES_CONFIG.assets.logos.es,
      theme: 'voices'
    },
    'voices.pt': {
      market_code: 'PT',
      language: 'pt',
      primary_language: 'Portugees',
      supported_languages: ['Portugees', 'Engels', 'Spaans', 'Frans'],
      popular_languages: ['Portugees', 'Engels', 'Spaans'],
      name: 'Portugal',
      email: 'johfrah@voices.pt',
      logo_url: VOICES_CONFIG.assets.logos.pt,
      theme: 'voices'
    },
    'voices.eu': {
      market_code: 'EU',
      language: 'en',
      primary_language: 'Engels',
      supported_languages: ['Engels', 'Vlaams', 'Nederlands', 'Frans', 'Duits', 'Spaans', 'Italiaans'],
      popular_languages: ['Engels', 'Frans', 'Duits', 'Nederlands', 'Vlaams'],
      name: 'Europe',
      email: 'johfrah@voices.eu',
      logo_url: VOICES_CONFIG.assets.logos.eu,
      theme: 'voices'
    },
    'voices.de': {
      market_code: 'DE',
      language: 'de',
      primary_language: 'Duits',
      supported_languages: ['Duits', 'Engels', 'Frans', 'Nederlands', 'Vlaams', 'Italiaans', 'Spaans'],
      popular_languages: ['Duits', 'Engels', 'Frans', 'Nederlands', 'Vlaams'],
      name: 'Deutschland',
      email: 'johfrah@voices.de',
      logo_url: VOICES_CONFIG.assets.logos.eu, // Fallback to EU logo
      theme: 'voices'
    },
    'johfrah.be': {
      market_code: 'JOHFRAH',
      language: 'nl',
      primary_language: 'Vlaams',
      supported_languages: ['Vlaams', 'Nederlands', 'Engels'],
      popular_languages: ['Vlaams', 'Nederlands', 'Engels'],
      name: 'Johfrah',
      email: 'info@johfrah.be',
      logo_url: VOICES_CONFIG.assets.logos.johfrah,
      theme: 'johfrah',
      has_voicy: true
    },
    'youssefzaki.eu': {
      market_code: 'YOUSSEF',
      language: 'en',
      primary_language: 'Engels',
      supported_languages: ['Engels', 'Nederlands', 'Vlaams', 'Frans', 'Duits'],
      popular_languages: ['Engels', 'Nederlands', 'Vlaams', 'Frans', 'Duits'],
      name: 'Youssef Zaki',
      email: 'info@youssefzaki.eu',
      logo_url: VOICES_CONFIG.assets.logos.be,
      theme: 'youssef'
    },
    'ademing.be': {
      market_code: 'ADEMING',
      language: 'nl',
      primary_language: 'Vlaams',
      supported_languages: ['Vlaams', 'Nederlands'],
      popular_languages: ['Vlaams', 'Nederlands'],
      name: 'Ademing',
      email: 'info@ademing.be',
      logo_url: VOICES_CONFIG.assets.logos.ademing,
      theme: 'ademing'
    },
    'johfrai.be': {
      market_code: 'JOHFRAI',
      language: 'nl',
      primary_language: 'Vlaams',
      supported_languages: ['Vlaams', 'Nederlands', 'Engels'],
      popular_languages: ['Vlaams', 'Nederlands', 'Engels'],
      name: 'Johfrai',
      email: 'info@johfrai.be',
      logo_url: VOICES_CONFIG.assets.logos.be,
      theme: 'johfrai'
    }
  };

  /**
   * Haalt de huidige markt op basis van de host
   */
  static getCurrentMarket(host?: string): MarketConfig {
    let activeHost = host;
    
    if (!activeHost && typeof window !== 'undefined') {
      activeHost = window.location.host;
    }
    
    if (!activeHost) activeHost = 'voices.be';

    const cleanHost = activeHost.replace('www.', '');
    const config = this.MARKETS[cleanHost] || this.MARKETS['voices.be'];

    // Merge met defaults uit VOICES_CONFIG
    return {
      market_code: config.market_code || 'BE',
      language: config.language || 'nl',
      primary_language: config.primary_language || 'Vlaams',
      supported_languages: config.supported_languages || ['Vlaams', 'Nederlands', 'Engels', 'Frans', 'Duits'],
      popular_languages: config.popular_languages || ['Vlaams', 'Nederlands', 'Engels', 'Frans', 'Duits'],
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
   * Bepaalt de volgorde van talen op basis van de huidige taal
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
