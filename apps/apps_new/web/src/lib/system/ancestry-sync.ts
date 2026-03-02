import { db } from '@/lib/database';
import { worlds } from '@/schema';
import { MarketManagerServer } from "./core/market-manager";

/**
 * 🌳 ANCESTRY SYNC (2026)
 * 
 * Doel: De MarketManagerServer primen met de actuele Worlds uit de database.
 * Dit verankert de 'Stamboom' in de runtime van de applicatie.
 */

export async function syncMarketManagerWithWorlds() {
  console.log('🌳 Syncing MarketManager with Database Worlds...');
  
  try {
    const allWorlds = await db.select().from(worlds);
    
    // We voegen een methode toe aan MarketManagerServer (of gebruiken een bestaande registry als die er is)
    // In dit geval breiden we de MarketManagerServer uit om Worlds te begrijpen.
    
    if (allWorlds.length > 0) {
      console.log(`✅ Found ${allWorlds.length} Worlds in DB.`);
      // @ts-ignore - We gaan de static property 'worldsRegistry' toevoegen/gebruiken
      MarketManagerServer.setWorlds?.(allWorlds);
    }
  } catch (error) {
    console.error('❌ Failed to sync MarketManager with Worlds:', error);
  }
}
