import { db, getTable } from '@/lib/system/voices-config';

const navMenus = getTable('navMenus');
import { eq } from "drizzle-orm";
import { createClient } from "@supabase/supabase-js";

//  CHRIS-PROTOCOL: SDK fallback voor als direct-connect faalt
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const sdkClient = createClient(supabaseUrl, supabaseKey);

/**
 *  CONFIG DATA BRIDGE (NUCLEAR 2026)
 * 
 * Beheert alle dynamische site-configuraties zoals navigatie, 
 * logo's en icon-visibility per journey.
 */

export interface NavConfig {
  logo?: {
    src: string;
    width: number;
    height: number;
    alt?: string;
  };
  links: Array<{
    name: string;
    href?: string;
    entityId?: number;
    routingType?: string;
    key?: string;
  }>;
  sections?: Array<{
    title: string;
    links: Array<{
      name: string;
      href?: string;
      entityId?: number;
      routingType?: string;
      key?: string;
    }>;
  }>;
  icons: {
    favorites: boolean;
    cart: boolean;
    notifications: boolean;
    language: boolean;
    account: boolean;
    menu: boolean;
  };
}

export class ConfigBridge {
  //  CHRIS-PROTOCOL: In-memory cache for 0ms navigation loading (2026)
  private static navCache = new Map<string, { data: NavConfig, timestamp: number }>();
  private static CACHE_TTL = 1000 * 60 * 5; // 5 minuten cache

  /**
   * Haalt de navigatie-configuratie op voor een specifieke journey
   * 🛡️ DNA-ROUTING: Resolves entityIds to slugs automatically
   */
  static async getNavConfig(key: string, language: string = 'nl'): Promise<NavConfig | null> {
    // 1. Check Cache (0ms response)
    const cacheKey = `${key}_${language}`;
    const cached = this.navCache.get(cacheKey);
    const now = Date.now();
    
    if (cached && (now - cached.timestamp < this.CACHE_TTL)) {
      return cached.data;
    }

    try {
      // 2. Fetch from DB
      const rawData = await this.fetchFromSource(key);
      if (!rawData) return null;

      // 3. DNA-ROUTING: Resolve all entityIds to slugs
      const resolvedData = await this.resolveDNA(rawData, language);
      
      this.navCache.set(cacheKey, { data: resolvedData, timestamp: now });
      return resolvedData;
    } catch (error) {
      console.error(`[ConfigBridge] Error fetching nav config for ${key}:`, error);
      return cached?.data || null;
    }
  }

  /**
   * 🧠 DNA-RESOLVER
   * Vertaalt entityIds naar actuele slugs via de slug_registry
   */
  private static async resolveDNA(config: NavConfig, language: string): Promise<NavConfig> {
    const resolvedLinks = await Promise.all(config.links.map(async (link) => {
      if (link.entityId && link.routingType) {
        const slug = await this.resolveSlug(link.entityId, link.routingType, language);
        return { ...link, href: slug || link.href || '#' };
      }
      return link;
    }));

    const resolvedSections = config.sections ? await Promise.all(config.sections.map(async (section) => {
      const links = await Promise.all(section.links.map(async (link) => {
        if (link.entityId && link.routingType) {
          const slug = await this.resolveSlug(link.entityId, link.routingType, language);
          return { ...link, href: slug || link.href || '#' };
        }
        return link;
      }));
      return { ...section, links };
    })) : undefined;

    return { ...config, links: resolvedLinks, sections: resolvedSections };
  }

  private static async resolveSlug(entityId: number, routingType: string, language: string): Promise<string | null> {
    try {
      const { data, error } = await sdkClient
        .from('slug_registry')
        .select('slug')
        .eq('entity_id', entityId)
        .eq('routing_type', routingType)
        .eq('is_active', true)
        .maybeSingle();

      if (error || !data) return null;
      return data.slug;
    } catch (err) {
      console.error(`[ConfigBridge] DNA Resolve failed for ${routingType}:${entityId}`, err);
      return null;
    }
  }

  private static async revalidateCache(key: string) {
    const data = await this.fetchFromSource(key);
    if (data) {
      this.navCache.set(key, { data, timestamp: Date.now() });
    }
  }

  private static async fetchFromSource(key: string): Promise<NavConfig | null> {
    let menu: any = null;
    try {
      if (process.env.NEXT_RUNTIME !== 'edge') {
        menu = await db.query.navMenus.findFirst({
          where: eq(navMenus.key, `nav_${key}`)
        });
      } else {
        throw new Error('Drizzle not available on Edge');
      }
    } catch (dbError) {
      console.warn(` ConfigBridge Drizzle failed for ${key}, falling back to SDK`);
      try {
        const { data, error } = await sdkClient
          .from('nav_menus')
          .select('*')
          .eq('key', `nav_${key}`)
          .maybeSingle();
        
        if (error) throw error;
        if (data) {
          menu = {
            ...data,
            updatedAt: data.updated_at
          };
        }
      } catch (sdkErr: any) {
        console.error(`[ConfigBridge] SDK fallback failed for ${key}:`, sdkErr.message);
      }
    }

    if (!menu) return null;
    return menu.items as unknown as NavConfig;
  }

  /**
   * Slaat een navigatie-configuratie op
   */
  static async saveNavConfig(key: string, config: NavConfig) {
    try {
      const existing = await db.query.navMenus.findFirst({
        where: eq(navMenus.key, `nav_${key}`)
      });

      if (existing) {
        await db.update(navMenus)
          .set({ 
            items: config as any,
            updatedAt: new Date()
          })
          .where(eq(navMenus.key, `nav_${key}`));
      } else {
        await db.insert(navMenus)
          .values({
            key: `nav_${key}`,
            items: config as any,
            market: 'ALL'
          });
      }
      
      // Clear cache on save
      this.navCache.delete(key);
      
      return { success: true };
    } catch (error) {
      console.error(`[ConfigBridge] Error saving nav config for ${key}:`, error);
      return { success: false, error };
    }
  }
}
