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
      name: 'België',
      logo_url: VOICES_CONFIG.assets.logos.be,
      theme: 'voices'
    },
    'voices.nl': {
      market_code: 'NLNL',
      language: 'nl',
      name: 'Nederland',
      phone: '+31 (0)85 016 34 60',
      email: 'johfrah@voices.nl',
      logo_url: VOICES_CONFIG.assets.logos.nl,
      theme: 'voices'
    },
    'voices.fr': {
      market_code: 'FR',
      language: 'fr',
      name: 'France',
      email: 'johfrah@voices.fr',
      logo_url: VOICES_CONFIG.assets.logos.fr,
      theme: 'voices'
    },
    'voices.es': {
      market_code: 'ES',
      language: 'es',
      name: 'España',
      email: 'johfrah@voices.es',
      logo_url: VOICES_CONFIG.assets.logos.es,
      theme: 'voices'
    },
    'voices.pt': {
      market_code: 'PT',
      language: 'pt',
      name: 'Portugal',
      email: 'johfrah@voices.pt',
      logo_url: VOICES_CONFIG.assets.logos.pt,
      theme: 'voices'
    },
    'voices.eu': {
      market_code: 'EU',
      language: 'en',
      name: 'Europe',
      email: 'johfrah@voices.eu',
      logo_url: VOICES_CONFIG.assets.logos.eu,
      theme: 'voices'
    },
    'voices.de': {
      market_code: 'DE',
      language: 'de',
      name: 'Deutschland',
      email: 'johfrah@voices.de',
      logo_url: VOICES_CONFIG.assets.logos.eu, // Fallback to EU logo
      theme: 'voices'
    },
    'johfrah.be': {
      market_code: 'JOHFRAH',
      language: 'nl',
      name: 'Johfrah',
      email: 'johfrah@johfrah.be',
      logo_url: VOICES_CONFIG.assets.logos.johfrah,
      theme: 'johfrah',
      has_voicy: true
    },
    'youssefzaki.eu': {
      market_code: 'YOUSSEF',
      language: 'en',
      name: 'Youssef Zaki',
      email: 'info@youssefzaki.eu',
      logo_url: VOICES_CONFIG.assets.logos.be,
      theme: 'youssef'
    },
    'ademing.be': {
      market_code: 'ADEMING',
      language: 'nl',
      name: 'Ademing',
      email: 'info@ademing.be',
      logo_url: VOICES_CONFIG.assets.logos.ademing,
      theme: 'ademing'
    },
    'johfrai.be': {
      market_code: 'JOHFRAI',
      language: 'nl',
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
      currency: config.currency || 'EUR',
      name: config.name || 'Voices',
      phone: config.phone || VOICES_CONFIG.company.phone,
      email: config.email || VOICES_CONFIG.company.email,
      logo_url: config.logo_url || VOICES_CONFIG.assets.logos.be,
      company_name: config.company_name || VOICES_CONFIG.company.name,
      vat_number: config.vat_number || VOICES_CONFIG.company.vat,
      theme: config.theme || 'voices',
      has_voicy: config.has_voicy ?? false
    };
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
