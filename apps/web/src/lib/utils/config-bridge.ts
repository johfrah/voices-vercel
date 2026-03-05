import { db, getTable } from '@/lib/system/voices-config';

const navMenus = getTable('navMenus');
import { eq, sql } from "drizzle-orm";
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
    submenu?: Array<{
      name: string;
      href?: string;
      key?: string;
    }>;
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
  private static navCache = new Map<string, { data: NavConfig | null, timestamp: number }>();
  private static worldConfigCache = new Map<string, { data: any, timestamp: number }>();
  private static navMenusTableState: 'unknown' | 'available' | 'missing' = 'unknown';
  private static CACHE_TTL = 1000 * 60 * 5; // 5 minuten cache
  private static logThrottle = new Map<string, number>();
  private static LOG_COOLDOWN_MS = 1000 * 60;

  private static shouldLog(key: string): boolean {
    const now = Date.now();
    const previous = this.logThrottle.get(key) || 0;
    if (now - previous < this.LOG_COOLDOWN_MS) return false;
    this.logThrottle.set(key, now);
    return true;
  }

  /**
   * 🌍 WORLD CONFIG RESOLVER
   * Haalt de configuratie op uit de nieuwe world_configs tabel
   */
  static async getWorldConfig(worldId: number, languageId: number): Promise<any | null> {
    const cacheKey = `${worldId}_${languageId}`;
    const cached = this.worldConfigCache.get(cacheKey);
    const now = Date.now();

    if (cached && (now - cached.timestamp < this.CACHE_TTL)) {
      return cached.data;
    }

    try {
      const { data, error } = await sdkClient
        .from('world_configs')
        .select('*')
        .eq('world_id', worldId)
        .eq('language_id', languageId)
        .maybeSingle();

      if (error) throw error;
      if (data) {
        this.worldConfigCache.set(cacheKey, { data, timestamp: now });
        return data;
      }
      return null;
    } catch (err) {
      console.error(`[ConfigBridge] Error fetching world config for ${worldId}/${languageId}:`, err);
      return cached?.data || null;
    }
  }

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
      if (!rawData) {
        this.navCache.set(cacheKey, { data: null, timestamp: now });
        return null;
      }

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
      const resolved = link.entityId && link.routingType
        ? { ...link, href: (await this.resolveSlug(link.entityId, link.routingType, language)) || link.href || '#' }
        : { ...link };
      if (resolved.submenu) {
        resolved.submenu = [...resolved.submenu];
      }
      return resolved;
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
    this.navCache.set(key, { data, timestamp: Date.now() });
  }

  private static isMissingNavMenusError(error: unknown): boolean {
    const message = String((error as any)?.message || error || '').toLowerCase();
    const code = String((error as any)?.code || '').toUpperCase();

    return (
      code === '42P01' ||
      message.includes('relation "nav_menus" does not exist') ||
      message.includes("could not find the table 'public.nav_menus'") ||
      message.includes('nav_menus')
    );
  }

  private static async hasNavMenusTable(): Promise<boolean> {
    if (!db) return false;
    if (this.navMenusTableState === 'available') return true;
    if (this.navMenusTableState === 'missing') return false;

    try {
      const rows: any = await db.execute(sql`select to_regclass('public.nav_menus') as table_name`);
      const tableName = rows?.[0]?.table_name;
      const exists = Boolean(tableName);
      this.navMenusTableState = exists ? 'available' : 'missing';
      return exists;
    } catch {
      // Fail-closed: bij introspectiefout geen query-spam op ontbrekende tabel.
      return false;
    }
  }

  private static async fetchFromSource(key: string): Promise<NavConfig | null> {
    const hasNavMenusTable = await this.hasNavMenusTable();
    if (!hasNavMenusTable) {
      if (this.shouldLog(`nav_menus:missing:${key}`)) {
        console.warn(`[ConfigBridge] nav_menus ontbreekt; nav_${key} overgeslagen.`);
      }
      return null;
    }

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
      if (this.isMissingNavMenusError(dbError)) {
        this.navMenusTableState = 'missing';
        if (this.shouldLog(`nav_menus:missing:db:${key}`)) {
          console.warn(`[ConfigBridge] nav_menus ontbreekt in DB; SDK fallback overgeslagen voor ${key}.`);
        }
        return null;
      }

      if (this.shouldLog(`drizzle:${key}`)) {
        console.warn(` ConfigBridge Drizzle failed for ${key}, falling back to SDK`);
      }
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
        if (this.isMissingNavMenusError(sdkErr)) {
          this.navMenusTableState = 'missing';
          if (this.shouldLog(`nav_menus:missing:sdk:${key}`)) {
            console.warn(`[ConfigBridge] nav_menus ontbreekt via SDK fallback voor ${key}.`);
          }
          return null;
        }

        if (this.shouldLog(`sdk:${key}:${sdkErr?.message || 'unknown'}`)) {
          console.warn(`[ConfigBridge] SDK fallback failed for ${key}:`, sdkErr?.message || sdkErr);
        }
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
      const hasNavMenusTable = await this.hasNavMenusTable();
      if (!hasNavMenusTable) {
        if (this.shouldLog(`nav_menus:missing:save:${key}`)) {
          console.warn(`[ConfigBridge] saveNavConfig overgeslagen: nav_menus ontbreekt voor ${key}.`);
        }
        return { success: false, error: new Error('nav_menus table missing') };
      }

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
