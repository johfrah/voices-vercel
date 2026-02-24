import { db } from '@db';
import { translations, translationRegistry, appConfigs } from '@db/schema';
import { sql, desc, eq } from 'drizzle-orm';
import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth/api-auth';

/**
 *  API: VOICEGLOT STATS (GODMODE CACHING 2026)
 * 
 * Gebruikt app_configs als een persistente cache-laag om database timeouts te voorkomen.
 */

export const dynamic = 'force-dynamic';

const CACHE_KEY = 'voiceglot_stats_cache';
const CACHE_TTL = 60 * 1000; // 1 minuut cache voor stats

export async function GET(request: NextRequest) {
  //  CHRIS-PROTOCOL: Build Safety
  if (process.env.NEXT_PHASE === 'phase-production-build' || (process.env.NODE_ENV === 'production' && !process.env.VERCEL_URL)) {
    return NextResponse.json({ totalStrings: 0, coverage: [] });
  }

  const auth = await requireAdmin();
  if (auth instanceof NextResponse) return auth;

  try {
    // 1. Check Cache in app_configs
    const cachedConfig = await db.select().from(appConfigs).where(eq(appConfigs.key, CACHE_KEY)).limit(1).catch(() => []);
    const now = new Date().getTime();
    
    if (cachedConfig.length > 0) {
      const cacheData = cachedConfig[0].value as any;
      const cacheAge = now - new Date(cachedConfig[0].updatedAt || 0).getTime();
      
      if (cacheAge < CACHE_TTL) {
        console.log('🚀 [Voiceglot Stats] Serving from Cache (Age:', Math.round(cacheAge/1000), 's)');
        return NextResponse.json({ ...cacheData, isCached: true });
      }
    }

    console.log('⚡ [Voiceglot Stats] Cache expired or missing, fetching fresh data...');

    // 2. Fetch Fresh Data (Ultra-Light)
    // Totaal aantal unieke strings in de registry
    const totalStringsResult = await db.select({ count: sql<number>`count(*)` }).from(translationRegistry).catch((err) => {
      console.error('Registry Query Error:', err);
      return [{ count: 0 }];
    });
    const totalStrings = Number(totalStringsResult[0]?.count || 0);

    // Aantal vertalingen per taal
    const statsByLang = await db.select({
      lang: translations.lang,
      count: sql<number>`count(*)`
    })
    .from(translations)
    .groupBy(translations.lang)
    .catch((err) => {
      console.error('Translations Query Error:', err);
      return [];
    });

    // Bereken percentages
    const targetLanguages = ['en', 'fr', 'de', 'es', 'pt', 'it'];
    const coverage = targetLanguages.map(lang => {
      const found = statsByLang.find(s => s.lang === lang);
      const count = found ? Number(found.count) : 0;
      return {
        lang,
        count,
        percentage: totalStrings > 0 ? Math.min(100, Math.round((count / totalStrings) * 100)) : 0
      };
    });

    const recentStrings = await db.select().from(translationRegistry).orderBy(desc(translationRegistry.lastSeen)).limit(5).catch(() => []);

    const freshData = {
      totalStrings,
      coverage,
      recentStrings,
      status: totalStrings > 0 ? 'ACTIVE' : 'INITIALIZING',
      updatedAt: new Date().toISOString()
    };

    // 3. Update Cache (Fire & Forget in background if possible, but here we await for safety)
    await db.insert(appConfigs)
      .values({
        key: CACHE_KEY,
        value: freshData,
        updatedAt: new Date()
      })
      .onConflictDoUpdate({
        target: appConfigs.key,
        set: {
          value: freshData,
          updatedAt: new Date()
        }
      }).catch(err => console.error('Failed to update stats cache:', err));

    return NextResponse.json({ ...freshData, isCached: false });
  } catch (error) {
    console.error('[Voiceglot Stats Error]:', error);
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 });
  }
}
