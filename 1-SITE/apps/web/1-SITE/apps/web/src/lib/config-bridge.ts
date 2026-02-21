import { db } from "@db";
import { navMenus } from "@db/schema";
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
  /**
   * Haalt de navigatie-configuratie op voor een specifieke journey
   */
  static async getNavConfig(key: string): Promise<NavConfig | null> {
    try {
      //  CHRIS-PROTOCOL: Drizzle with SDK fallback
      let menu: any = null;
      try {
        menu = await db.query.navMenus.findFirst({
          where: eq(navMenus.key, `nav_${key}`)
        });
      } catch (dbError) {
        console.warn(` ConfigBridge Drizzle failed for ${key}, falling back to SDK`);
        const { data, error } = await sdkClient
          .from('nav_menus')
          .select('*')
          .eq('key', `nav_${key}`)
          .single();
        
        if (error) throw error;
        menu = {
          ...data,
          updatedAt: data.updated_at
        };
      }

      if (!menu) return null;
      return menu.items as unknown as NavConfig;
    } catch (error) {
      console.error(`[ConfigBridge] Error fetching nav config for ${key}:`, error);
      return null;
    }
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
      return { success: true };
    } catch (error) {
      console.error(`[ConfigBridge] Error saving nav config for ${key}:`, error);
      return { success: false, error };
    }
  }
}
