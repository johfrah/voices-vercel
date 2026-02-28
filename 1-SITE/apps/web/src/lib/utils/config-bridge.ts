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
    href: string;
    key?: string;
  }>;
  sections?: Array<{
    title: string;
    links: Array<{
      name: string;
      href: string;
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
   */
  static async getNavConfig(key: string): Promise<NavConfig | null> {
    // 1. Check Cache (0ms response)
    const cached = this.navCache.get(key);
    const now = Date.now();
    
    if (cached && (now - cached.timestamp < this.CACHE_TTL)) {
      // Background revalidation if cache is getting old
      if (now - cached.timestamp > this.CACHE_TTL / 2) {
        this.revalidateCache(key).catch(() => {});
      }
      return cached.data;
    }

    try {
      // 2. Fetch from DB with SDK fallback
      const data = await this.fetchFromSource(key);
      if (data) {
        this.navCache.set(key, { data, timestamp: now });
      }
      return data;
    } catch (error) {
      console.error(`[ConfigBridge] Error fetching nav config for ${key}:`, error);
      // Return stale data if available on error
      return cached?.data || null;
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
