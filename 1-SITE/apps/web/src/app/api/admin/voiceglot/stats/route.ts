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
  try {
    //  CHRIS-PROTOCOL: Build Safety
    if (process.env.NEXT_PHASE === 'phase-production-build' || (process.env.NODE_ENV === 'production' && !process.env.VERCEL_URL)) {
      return NextResponse.json({ totalStrings: 0, coverage: [] });
    }

    const auth = await requireAdmin();
    if (auth instanceof NextResponse) return auth;

    // 1. Check Cache
    const cachedConfig = await db.select().from(appConfigs).where(eq(appConfigs.key, CACHE_KEY)).limit(1).catch(() => []);
    const now = new Date().getTime();
    
    if (cachedConfig.length > 0) {
      const cacheData = cachedConfig[0].value as any;
      const cacheAge = now - new Date(cachedConfig[0].updatedAt || 0).getTime();
      if (cacheAge < CACHE_TTL) {
        return NextResponse.json({ ...cacheData, isCached: true });
      }
    }

    // 2. Fetch Fresh Data (Ultra-Light)
    let totalStrings = 0;
    let statsByLang: any[] = [];

    try {
      // Gebruik Drizzle's select met sql count aggregate voor maximale robuustheid
      const totalResult = await db.select({ count: sql`count(*)` }).from(translationRegistry);
      totalStrings = parseInt(String(totalResult[0]?.count || '0'), 10);
      console.log(`[Voiceglot Stats] Total strings: ${totalStrings}`);

      if (totalStrings > 0) {
        statsByLang = await db.select({
          lang: translations.lang,
          count: sql`count(*)`
        })
        .from(translations)
        .groupBy(translations.lang);
        console.log(`[Voiceglot Stats] Stats by lang:`, statsByLang);
      }
    } catch (dbErr: any) {
      console.error('[Voiceglot Stats] Database query failed, using fallback:', dbErr.message);
      // Fallback naar 0 maar laat de API niet crashen
    }

    // Bereken percentages
    const targetLanguages = ['en', 'fr', 'de', 'es', 'pt', 'it'];
    const coverage = targetLanguages.map(lang => {
      const found = statsByLang.find((s: any) => s.lang === lang);
      const count = parseInt(String(found?.count || '0'), 10);
      return {
        lang,
        count,
        percentage: totalStrings > 0 ? Math.min(100, Math.round((count / totalStrings) * 100)) : 0
      };
    });

    const freshData = {
      totalStrings,
      coverage,
      status: totalStrings > 0 ? 'ACTIVE' : 'INITIALIZING',
      updatedAt: new Date().toISOString()
    };

    // 3. Update Cache
    try {
      await db.insert(appConfigs)
        .values({ key: CACHE_KEY, value: freshData, updatedAt: new Date() })
        .onConflictDoUpdate({ target: appConfigs.key, set: { value: freshData, updatedAt: new Date() }});
    } catch (cacheErr) {
      console.error('Cache update failed:', cacheErr);
    }

    return NextResponse.json({ ...freshData, isCached: false });
  } catch (error: any) {
    console.error('[Voiceglot Stats Error]:', error);
    // CHRIS-PROTOCOL: Altijd een geldig object teruggeven, zelfs bij error
    return NextResponse.json({ 
      totalStrings: 0, 
      coverage: [], 
      error: error.message || 'Failed to fetch stats' 
    }, { status: 200 }); // We geven 200 terug om frontend crash te voorkomen
  }
}
