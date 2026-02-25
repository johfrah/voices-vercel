/**
 * MARKET DATABASE SERVICE - 2026
 * 
 * Bevat de database-afhankelijke logica voor markten.
 * Dit bestand mag NOOIT in de client bundle terechtkomen.
 */

import { MarketManagerServer as MarketManager, MarketConfig } from './market-manager-server';
import { VOICES_CONFIG } from '@/lib/system/voices-config';

export class MarketDatabaseService {
  private static CACHE_TTL = 1000 * 60 * 60 * 24; // 24 hours (CHRIS-PROTOCOL: Nuclear Caching for SSR Performance)

  private static get globalCache() {
    const g = global as any;
    if (!g.marketManagerDbCache) {
      g.marketManagerDbCache = {
        marketCache: {},
        localesCache: null
      };
    }
    return g.marketManagerDbCache;
  }

  /**
   * Async versie voor Server Components die DIRECT uit de DB leest.
   */
  static async getCurrentMarketAsync(host?: string): Promise<MarketConfig> {
    // 🛡️ CHRIS-PROTOCOL: If host contains a path (from middleware), use it for sub-journey detection
    let lookupHost = host || '';
    if (lookupHost.includes('voices.be')) {
      if (lookupHost.includes('/studio')) lookupHost = 'voices.be/studio';
      if (lookupHost.includes('/academy')) lookupHost = 'voices.be/academy';
    }

    const staticConfig = MarketManager.getCurrentMarket(lookupHost);
    const cacheKey = staticConfig.market_code;

    // 1. Check Cache (CHRIS-PROTOCOL: Immediate return on cache hit)
    const cached = this.globalCache.marketCache[cacheKey];
    if (cached && (Date.now() - cached.timestamp) < this.CACHE_TTL) {
      return cached.data;
    }
    
    try {
      // 🛡️ CHRIS-PROTOCOL: Race against a 2-second timeout to prevent 504 Gateway Timeout
      const fetchPromise = (async () => {
        console.log(` [MarketDatabaseService] Cache miss for ${cacheKey}, querying DB via SDK...`);
        const { createClient } = await import('@supabase/supabase-js');
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
        const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
        const supabase = createClient(supabaseUrl, supabaseKey);

        const { data: dbConfig, error } = await supabase
          .from('market_configs')
          .select('*')
          .eq('market', staticConfig.market_code)
          .single();

        if (error) {
          console.warn(` [MarketDatabaseService] SDK Fetch failed for ${cacheKey}:`, error.message);
          return staticConfig;
        }

        if (dbConfig) {
          const loc = dbConfig.localization as any;
          const social = dbConfig.social_links as any; // SDK returns snake_case
          
          const finalConfig: MarketConfig = {
            ...staticConfig,
            name: dbConfig.name || staticConfig.name,
            email: dbConfig.email || staticConfig.email,
            phone: dbConfig.phone || staticConfig.phone,
            language: loc?.default_lang || staticConfig.language,
            supported_languages: (loc?.supported_languages || staticConfig.supported_languages || []).map((l: string) => MarketManager.getLanguageCode(l)),
            popular_languages: (loc?.popular_languages || staticConfig.popular_languages || []).map((l: string) => MarketManager.getLanguageCode(l)),
            currency: loc?.currency || staticConfig.currency,
            theme: (dbConfig.theme as any) || staticConfig.theme,
            address: dbConfig.address || staticConfig.address,
            vat_number: dbConfig.vat_number || staticConfig.vat_number,
            social_links: social || staticConfig.social_links,
            seo_data: {
              title: dbConfig.title || undefined,
              description: dbConfig.description || undefined,
              og_image: dbConfig.og_image || undefined,
              schema_type: (dbConfig as any).schema_type || (
                staticConfig.market_code === 'ADEMING' ? 'Organization' : 
                (staticConfig.market_code === 'PORTFOLIO' || staticConfig.market_code === 'ARTIST') ? 'Person' : 'Organization'
              ),
              locale_code: loc?.locale || MarketManager.getLanguageCode(staticConfig.primary_language),
              canonical_domain: (dbConfig as any).canonical_domain || staticConfig.logo_url // Fallback logic
            }
          };

          // Update Cache
          this.globalCache.marketCache[cacheKey] = { data: finalConfig, timestamp: Date.now() };
          return finalConfig;
        }
        return staticConfig;
      })();

      const timeoutPromise = new Promise<MarketConfig>((resolve) => 
        setTimeout(() => {
          console.warn(` [MarketDatabaseService] DB Timeout for ${cacheKey}, using fallback.`);
          resolve(cached?.data || staticConfig);
        }, 5000)
      );

      return await Promise.race([fetchPromise, timeoutPromise]);
    } catch (e) {
      console.error('[MarketDatabaseService] DB Fetch failed, checking for stale cache fallback:', e);
      if (cached) {
        console.log(` [MarketDatabaseService] SUCCESS: Serving stale cache fallback for ${cacheKey}`);
        return cached.data;
      }
    }

    return staticConfig;
  }

  /**
   * Haalt alle actieve locales op voor SEO alternates (Suzy Precision)
   */
  static async getAllLocalesAsync(): Promise<Record<string, string>> {
    // 1. Check Cache
    if (this.globalCache.localesCache && (Date.now() - this.globalCache.localesCache.timestamp) < this.CACHE_TTL) {
      return this.globalCache.localesCache.data;
    }

    const fallbackLocales = {
      'nl-BE': 'https://www.voices.be',
      'nl-NL': 'https://www.voices.nl',
      'fr-FR': 'https://www.voices.fr',
      'en-EU': 'https://www.voices.eu'
    };

    try {
      // 🛡️ CHRIS-PROTOCOL: Race against a 2-second timeout
      const fetchPromise = (async () => {
        console.log(` [MarketDatabaseService] Locales cache miss, querying DB via SDK...`);
        const { createClient } = await import('@supabase/supabase-js');
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
        const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
        const supabase = createClient(supabaseUrl, supabaseKey);

        const { data: allMarkets, error } = await supabase
          .from('market_configs')
          .select('*');

        if (error) {
          console.warn(' [MarketDatabaseService] Locales SDK Fetch failed:', error.message);
          return fallbackLocales;
        }

        const locales: Record<string, string> = {};
        const staticDomains = MarketManager.getMarketDomains();

        (allMarkets || []).forEach(m => {
          const loc = m.localization as any;
          const locale = loc?.locale || MarketManager.getLanguageCode(m.market === 'BE' ? 'nl-BE' : m.market === 'NLNL' ? 'nl-NL' : m.market === 'FR' ? 'fr-FR' : m.market === 'ES' ? 'es-ES' : m.market === 'PT' ? 'pt-PT' : m.market === 'EU' ? 'en-GB' : 'nl-BE');
          const domain = (m as any).canonical_domain || staticDomains[m.market] || `https://www.voices.be`;
          if (locale) {
            locales[locale] = domain;
          }
        });

        const finalLocales = Object.keys(locales).length > 0 ? locales : fallbackLocales;

        // Update Cache
        this.globalCache.localesCache = { data: finalLocales, timestamp: Date.now() };
        return finalLocales;
      })();

      const timeoutPromise = new Promise<Record<string, string>>((resolve) => 
        setTimeout(() => {
          console.warn(` [MarketDatabaseService] Locales DB Timeout, using fallback.`);
          resolve(this.globalCache.localesCache?.data || fallbackLocales);
        }, 5000)
      );

      return await Promise.race([fetchPromise, timeoutPromise]);
    } catch (e) {
      console.error('[MarketDatabaseService] Failed to fetch all locales:', e);
      return fallbackLocales;
    }
  }
}
