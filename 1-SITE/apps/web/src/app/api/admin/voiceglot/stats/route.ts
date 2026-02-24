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
  console.log('🔍 [Voiceglot Stats API] Request received');
  
  //  CHRIS-PROTOCOL: Build Safety
  if (process.env.NEXT_PHASE === 'phase-production-build' || (process.env.NODE_ENV === 'production' && !process.env.VERCEL_URL)) {
    console.log('⚠️ [Voiceglot Stats API] Build phase detected, returning empty');
    return NextResponse.json({ totalStrings: 0, coverage: [] });
  }

  const auth = await requireAdmin();
  if (auth instanceof NextResponse) {
    console.log('🚫 [Voiceglot Stats API] Auth failed');
    return auth;
  }

  try {
    console.log('📦 [Voiceglot Stats API] Checking cache...');
    // 1. Check Cache in app_configs
    const cachedConfig = await db.select().from(appConfigs).where(eq(appConfigs.key, CACHE_KEY)).limit(1).catch((err) => {
      console.error('❌ [Voiceglot Stats API] Cache Query Error:', err);
      return [];
    });
    const now = new Date().getTime();
    
    if (cachedConfig.length > 0) {
      const cacheData = cachedConfig[0].value as any;
      const cacheAge = now - new Date(cachedConfig[0].updatedAt || 0).getTime();
      
      if (cacheAge < CACHE_TTL) {
        console.log('🚀 [Voiceglot Stats API] Serving from Cache (Age:', Math.round(cacheAge/1000), 's)');
        return NextResponse.json({ ...cacheData, isCached: true });
      }
      console.log('⏳ [Voiceglot Stats API] Cache expired (Age:', Math.round(cacheAge/1000), 's)');
    } else {
      console.log('🆕 [Voiceglot Stats API] No cache found');
    }

    console.log('⚡ [Voiceglot Stats API] Fetching fresh data from DB...');

    // 2. Fetch Fresh Data (Ultra-Light)
    // Totaal aantal unieke strings in de registry
    const totalStringsResult = await db.execute(sql`SELECT count(*) as count FROM translation_registry`);
    const totalStrings = parseInt(String(totalStringsResult[0]?.count || '0'), 10);
    console.log('📊 [Voiceglot Stats API] Total strings (raw):', totalStrings);

    // Aantal vertalingen per taal
    const statsByLangResult = await db.execute(sql`SELECT lang, count(*) as count FROM translations GROUP BY lang`);
    const statsByLang = Array.isArray(statsByLangResult) ? statsByLangResult : [];
    console.log('📊 [Voiceglot Stats API] Stats by lang (raw):', statsByLang.length, 'languages found');

    // Detect non-NL sources (Godmode Detection)
    // We doen een snelle check op de laatste 100 strings om te zien of er veel non-NL tussen zit
    const sampleStrings = totalStrings > 0 ? await db.select().from(translationRegistry).orderBy(desc(translationRegistry.lastSeen)).limit(100).catch(() => []) : [];
    const nonNlCount = sampleStrings.filter(s => {
      const text = s.originalText.toLowerCase();
      // Simpele heuristiek voor demo: bevat Franse of Engelse lidwoorden maar geen NL
      const isFr = text.includes(' le ') || text.includes(' la ') || text.includes(' les ');
      const isEn = text.includes(' the ') || text.includes(' and ');
      const isNl = text.includes(' de ') || text.includes(' het ') || text.includes(' en ');
      return (isFr || isEn) && !isNl;
    }).length;

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

    const recentStrings = totalStrings > 0 ? await db.select().from(translationRegistry).orderBy(desc(translationRegistry.lastSeen)).limit(5).catch(() => []) : [];

    const freshData = {
      totalStrings,
      coverage,
      recentStrings,
      nonNlSourceWarning: nonNlCount > 5, // Als >5% van de sample non-NL is
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
