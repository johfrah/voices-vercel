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
  private static marketConfigsCache: Record<string, any> = {};

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
   * 🛡️ CHRIS-PROTOCOL: ID-First Market Config Resolver (v3.0.0)
   * Haalt de markt-specifieke configuratie op uit de database (Server-side)
   * of uit de cache (Client-side).
   */
  public static async getMarketConfig(marketCode: string): Promise<MarketConfig | null> {
    if (this.marketConfigsCache[marketCode]) return this.marketConfigsCache[marketCode];

    if (typeof window === 'undefined') {
      try {
        const { db, marketConfigs, media } = require('../voices-config');
        const { eq } = require('drizzle-orm');

        if (!db || !marketConfigs || !media) return null;

        const config = await db.select({
          market_code: marketConfigs.market,
          name: marketConfigs.name,
          email: marketConfigs.email,
          phone: marketConfigs.phone,
          vat_number: marketConfigs.vatNumber,
          address: marketConfigs.address,
          social_links: marketConfigs.socialLinks,
          localization: marketConfigs.localization,
          logo_path: media.filePath
        })
        .from(marketConfigs)
        .leftJoin(media, eq(marketConfigs.logoId, media.id))
        .where(eq(marketConfigs.market, marketCode))
        .limit(1);

        if (config && config[0]) {
          const c = config[0];
          const marketConfig: MarketConfig = {
            market_code: c.market_code,
            name: c.name,
            email: c.email,
            phone: c.phone,
            vat_number: c.vat_number,
            address: c.address,
            social_links: c.social_links,
            primary_language: c.localization?.default_lang || 'nl',
            primary_language_id: c.localization?.default_lang_id || 1,
            language: c.localization?.default_lang || 'nl',
            supported_languages: c.localization?.supported_languages || [],
            popular_languages: c.localization?.popular_languages || [],
            currency: c.localization?.currency || 'EUR',
            logo_url: c.logo_path ? `/assets/${c.logo_path}` : '',
            company_name: VOICES_CONFIG.company.name,
            theme: 'voices'
          };
          this.marketConfigsCache[marketCode] = marketConfig;
          return marketConfig;
        }
      } catch (err) {
        console.error('❌ MarketManager: Error fetching market config:', err);
      }
    }

    return null;
  }

  /**
   * 🛡️ CHRIS-PROTOCOL: ID-First World Resolver (v3.0.0)
   */
  public static async getWorld(worldId: number): Promise<any> {
    if (typeof window === 'undefined') {
      try {
        const { db, worlds, media } = require('../voices-config');
        const { eq } = require('drizzle-orm');

        if (!db || !worlds || !media) return null;

        const result = await db.select({
          id: worlds.id,
          code: worlds.code,
          label: worlds.label,
          logo_path: media.filePath
        })
        .from(worlds)
        .leftJoin(media, eq(worlds.logoId, media.id))
        .where(eq(worlds.id, worldId))
        .limit(1);

        return result[0] || null;
      } catch (err) {
        console.error('❌ MarketManager: Error fetching world:', err);
      }
    }
    return null;
  }

  /**
   * 🛡️ CHRIS-PROTOCOL: ID-First Journey Resolver (v3.0.0)
   */
  public static async getJourney(journeyId: number): Promise<any> {
    if (typeof window === 'undefined') {
      try {
        const { db, journeys, media } = require('../voices-config');
        const { eq } = require('drizzle-orm');

        if (!db || !journeys || !media) return null;

        const result = await db.select({
          id: journeys.id,
          code: journeys.code,
          label: journeys.label,
          icon_path: media.filePath
        })
        .from(journeys)
        .leftJoin(media, eq(journeys.iconId, media.id))
        .where(eq(journeys.id, journeyId))
        .limit(1);

        return result[0] || null;
      } catch (err) {
        console.error('❌ MarketManager: Error fetching journey:', err);
      }
    }
    return null;
  }

  /**
   * 🛡️ CHRIS-PROTOCOL: ID-First Site Setting Resolver (v3.0.0)
   */
  public static async getSiteSetting(key: string): Promise<string | null> {
    if (typeof window === 'undefined') {
      try {
        const { db, siteSettings, media } = require('../voices-config');
        const { eq } = require('drizzle-orm');

        if (!db || !siteSettings || !media) return null;

        const result = await db.select({
          value: siteSettings.value,
          media_path: media.filePath
        })
        .from(siteSettings)
        .leftJoin(media, eq(siteSettings.mediaId, media.id))
        .where(eq(siteSettings.key, key))
        .limit(1);

        if (result[0]) {
          return result[0].media_path ? `/assets/${result[0].media_path}` : result[0].value;
        }
      } catch (err) {
        console.error('❌ MarketManager: Error fetching site setting:', err);
      }
    }
    return null;
  }

  /**
   * 🛡️ CHRIS-PROTOCOL: ID-First Ademing Maker Resolver (v3.0.0)
   */
  public static async getAdemingMaker(makerId: number): Promise<any> {
    if (typeof window === 'undefined') {
      try {
        const { db, ademingMakers, media } = require('../voices-config');
        const { eq } = require('drizzle-orm');

        if (!db || !ademingMakers || !media) return null;

        const result = await db.select({
          id: ademingMakers.id,
          full_name: ademingMakers.full_name,
          avatar_path: media.filePath
        })
        .from(ademingMakers)
        .leftJoin(media, eq(ademingMakers.avatarId, media.id))
        .where(eq(ademingMakers.id, makerId))
        .limit(1);

        return result[0] || null;
      } catch (err) {
        console.error('❌ MarketManager: Error fetching ademing maker:', err);
      }
    }
    return null;
  }

  /**
   * 🛡️ CHRIS-PROTOCOL: ID-First Ademing Track Resolver (v3.0.0)
   */
  public static async getAdemingTrack(trackId: number): Promise<any> {
    if (typeof window === 'undefined') {
      try {
        const { db, ademingTracks, media } = require('../voices-config');
        const { eq, alias } = require('drizzle-orm');

        if (!db || !ademingTracks || !media) return null;

        const audioMedia = alias(media, 'audio_media');
        const coverMedia = alias(media, 'cover_media');

        const result = await db.select({
          id: ademingTracks.id,
          title: ademingTracks.title,
          audio_path: audioMedia.filePath,
          cover_path: coverMedia.filePath
        })
        .from(ademingTracks)
        .leftJoin(audioMedia, eq(ademingTracks.mediaId, audioMedia.id))
        .leftJoin(coverMedia, eq(ademingTracks.coverImageId, coverMedia.id))
        .where(eq(ademingTracks.id, trackId))
        .limit(1);

        return result[0] || null;
      } catch (err) {
        console.error('❌ MarketManager: Error fetching ademing track:', err);
      }
    }
    return null;
  }

  /**
   * 🛡️ CHRIS-PROTOCOL: ID-First Ademing Series Resolver (v3.0.0)
   */
  public static async getAdemingSeries(seriesId: number): Promise<any> {
    if (typeof window === 'undefined') {
      try {
        const { db, ademingSeries, media } = require('../voices-config');
        const { eq } = require('drizzle-orm');

        if (!db || !ademingSeries || !media) return null;

        const result = await db.select({
          id: ademingSeries.id,
          title: ademingSeries.title,
          cover_path: media.filePath
        })
        .from(ademingSeries)
        .leftJoin(media, eq(ademingSeries.coverImageId, media.id))
        .where(eq(ademingSeries.id, seriesId))
        .limit(1);

        return result[0] || null;
      } catch (err) {
        console.error('❌ MarketManager: Error fetching ademing series:', err);
      }
    }
    return null;
  }

  /**
   * 🛡️ CHRIS-PROTOCOL: ID-First Content Block Resolver (v3.0.0)
   */
  public static async getContentBlock(blockId: number): Promise<any> {
    if (typeof window === 'undefined') {
      try {
        const { db, contentBlocks, media } = require('../voices-config');
        const { eq } = require('drizzle-orm');

        if (!db || !contentBlocks || !media) return null;

        const result = await db.select({
          id: contentBlocks.id,
          type: contentBlocks.type,
          content: contentBlocks.content,
          media_path: media.filePath
        })
        .from(contentBlocks)
        .leftJoin(media, eq(contentBlocks.mediaId, media.id))
        .where(eq(contentBlocks.id, blockId))
        .limit(1);

        return result[0] || null;
      } catch (err) {
        console.error('❌ MarketManager: Error fetching content block:', err);
      }
    }
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

    let worldId = 1;
    if (cleanHost === 'voices.be' || cleanHost === 'localhost:3000' || cleanHost === 'voices-headless.vercel.app') {
      if (cleanPath.startsWith('/studio')) worldId = 2;
      else if (cleanPath.startsWith('/academy')) worldId = 3;
      else if (cleanPath.startsWith('/ademing')) worldId = 6;
      else if (cleanPath.startsWith('/johfrai')) worldId = 10;
    } else {
      if (cleanHost === 'ademing.be') worldId = 6;
      else if (cleanHost === 'johfrah.be') worldId = 7;
      else if (cleanHost === 'christina.be') worldId = 5;
      else if (cleanHost === 'youssefzaki.eu') worldId = 25;
      else if (cleanHost === 'johfrai.be') worldId = 10;
      else if (cleanHost === 'voices.academy') worldId = 3;
    }

    let languageId = 1;
    if (cleanHost.endsWith('.nl')) languageId = 2;
    else if (cleanHost.endsWith('.fr')) languageId = 4;
    else if (cleanHost.endsWith('.es')) languageId = 8;
    else if (cleanHost.endsWith('.pt')) languageId = 12;
    else if (cleanHost.endsWith('.eu') || cleanHost.endsWith('.com')) languageId = 5;

    if (cleanPath.startsWith('/en/')) languageId = 5;
    else if (cleanPath.startsWith('/fr/')) languageId = 3;
    else if (cleanPath.startsWith('/de/')) languageId = 7;
    else if (cleanPath.startsWith('/es/')) languageId = 8;
    else if (cleanPath.startsWith('/pt/')) languageId = 12;
    else if (cleanPath.startsWith('/it/')) languageId = 9;
    else if (cleanPath.startsWith('/nl/')) languageId = 1;

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
      name: 'Voices', email: 'johfrah@voices.be', logo_url: '',
      theme: 'voices', has_voicy: true
    },
    'voices.nl': {
      market_code: 'NLNL', language: 'nl', primary_language: 'nl-be', primary_language_id: 1,
      supported_languages: ['nl-nl', 'nl-be', 'en-gb', 'de-de', 'fr-fr'],
      popular_languages: ['nl-nl', 'nl-be', 'en-gb', 'de-de', 'fr-fr'],
      name: 'Nederland', logo_url: '', theme: 'voices', has_voicy: true
    },
    'voices.fr': {
      market_code: 'FR', language: 'fr', primary_language: 'fr-fr', primary_language_id: 4,
      supported_languages: ['fr-fr', 'fr-be', 'en-gb', 'nl-nl', 'nl-be', 'de-de'],
      popular_languages: ['fr-fr', 'fr-be', 'en-gb', 'nl-nl', 'nl-be', 'de-de'],
      name: 'France', logo_url: '', theme: 'voices', has_voicy: true
    },
    'voices.es': {
      market_code: 'ES', language: 'es', primary_language: 'es-es', primary_language_id: 8,
      supported_languages: ['es-es', 'en-gb', 'fr-fr', 'pt-pt', 'it-it'],
      popular_languages: ['es-es', 'en-gb', 'pt-pt'],
      name: 'España', logo_url: '', theme: 'voices', has_voicy: true
    },
    'voices.pt': {
      market_code: 'PT', language: 'pt', primary_language: 'pt-pt', primary_language_id: 12,
      supported_languages: ['pt-pt', 'en-gb', 'es-es', 'fr-fr'],
      popular_languages: ['pt-pt', 'en-gb', 'es-es'],
      name: 'Portugal', logo_url: '', theme: 'voices', has_voicy: true
    },
    'voices.eu': {
      market_code: 'EU', language: 'en', primary_language: 'en-gb', primary_language_id: 5,
      supported_languages: ['en-gb', 'de-de', 'nl-be', 'nl-nl', 'fr-be', 'fr-fr'],
      popular_languages: ['en-gb', 'de-de', 'fr-be', 'fr-fr', 'nl-nl', 'nl-be'],
      name: 'Europe', logo_url: '', theme: 'voices', has_voicy: true
    },
    'voices.academy': {
      market_code: 'ACADEMY', language: 'nl', primary_language: 'nl-BE',
      supported_languages: ['nl-BE', 'en-GB'], popular_languages: ['nl-BE', 'en-GB'],
      name: 'Voices Academy', logo_url: '', theme: 'voices'
    },
    'voices.be/academy': {
      market_code: 'ACADEMY', language: 'nl', primary_language: 'nl-be', primary_language_id: 1,
      supported_languages: ['nl-be', 'en-gb'], popular_languages: ['nl-be', 'en-gb'],
      name: 'Voices Academy', logo_url: '', theme: 'voices'
    },
    'voices.be/studio': {
      market_code: 'STUDIO', language: 'nl', primary_language: 'nl-be', primary_language_id: 1,
      supported_languages: ['nl-be', 'en-gb'], popular_languages: ['nl-be', 'en-gb'],
      name: 'Voices Studio', logo_url: '',
      theme: 'voices'
    },
    'johfrah.be': {
      market_code: 'FREELANCE', language: 'nl', primary_language: 'nl-be', primary_language_id: 1,
      supported_languages: ['nl-be', 'en-gb'], popular_languages: ['nl-be', 'en-gb'],
      name: 'Johfrah Lefebvre', logo_url: '', theme: 'johfrah', has_voicy: true
    },
    'christina.be': {
      market_code: 'PORTFOLIO', language: 'nl', primary_language: 'nl-be', primary_language_id: 1,
      supported_languages: ['nl-be', 'en-gb'], popular_languages: ['nl-be', 'en-gb'],
      name: 'Christina Portfolio', logo_url: '', theme: 'voices'
    },
    'youssefzaki.eu': {
      market_code: 'ARTIST', language: 'en', primary_language: 'en-gb', primary_language_id: 5,
      supported_languages: ['en-gb', 'nl-be', 'fr-fr', 'de-de'],
      popular_languages: ['en-gb', 'nl-be', 'fr-fr', 'de-de'],
      name: 'Youssef Zaki', logo_url: '', theme: 'youssef'
    },
    'ademing.be': {
      market_code: 'ADEMING', language: 'nl', primary_language: 'nl-be', primary_language_id: 1,
      supported_languages: ['nl-be'], popular_languages: ['nl-be'],
      name: 'Ademing', logo_url: '', theme: 'ademing'
    },
    'johfrai.be': {
      market_code: 'JOHFRAI', language: 'nl', primary_language: 'nl-be', primary_language_id: 1,
      supported_languages: ['nl-be', 'en-gb'], popular_languages: ['nl-be', 'en-gb'],
      name: 'Johfrai', logo_url: '', theme: 'johfrai'
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
      supported_languages: isoSupported.length > 0 ? isoSupported : ['nl-BE', 'nl-NL', 'en-GB', 'fr-FR', 'de-DE'],
      popular_languages: isoPopular.length > 0 ? isoPopular : ['nl-BE', 'nl-NL', 'en-GB', 'fr-FR', 'de-DE'],
      currency: config.currency || 'EUR',
      name: config.name || 'Voices',
      phone: config.phone || VOICES_CONFIG.company.phone,
      email: config.email || VOICES_CONFIG.company.email,
      logo_url: config.logo_url || '',
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
    if (!label) return 'nl';
    const lowLabel = label.toLowerCase().trim();
    if (lowLabel.includes('-')) return lowLabel.split('-')[0];
    
    if (this.languagesRegistry.length > 0) {
      const match = this.languagesRegistry.find(l => 
        l.label.toLowerCase() === lowLabel || l.code.toLowerCase() === lowLabel
      );
      if (match) return match.code.includes('-') ? match.code.split('-')[0] : match.code;
    }

    const emergencyMap: Record<string, string> = {
      'vlaams': 'nl', 'nederlands': 'nl', 'frans': 'fr', 'engels': 'en', 'duits': 'de'
    };
    return emergencyMap[lowLabel] || lowLabel;
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

  static getLanguageId(input: string): number | null {
    if (!input) return null;
    const lowInput = input.toLowerCase().trim();
    const registry = this.languagesRegistry.length > 0 ? this.languagesRegistry : 
                    (typeof global !== 'undefined' && (global as any).handshakeLanguages ? (global as any).handshakeLanguages : 
                    (typeof window !== 'undefined' && (window as any).handshakeLanguages ? (window as any).handshakeLanguages : []));

    if (registry.length > 0) {
      const match = registry.find((l: any) => l.code.toLowerCase() === lowInput || l.label.toLowerCase() === lowInput);
      if (match) return match.id;
    }

    const emergencyMap: Record<string, number> = {
      'nl-be': 1, 'vlaams': 1, 'nl-nl': 2, 'nederlands': 2, 'fr-be': 3, 'fr-fr': 4, 'frans': 4,
      'en-gb': 5, 'engels': 5, 'en-us': 6, 'de-de': 7, 'duits': 7, 'es-es': 8, 'spaans': 8,
      'it-it': 10, 'italiaans': 10, 'pt-pt': 12, 'portugees': 12
    };
    return emergencyMap[lowInput] || null;
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
