import { db } from '@db';
import { translations, translationRegistry, appConfigs } from '@db/schema';
import { sql, desc, eq } from 'drizzle-orm';
import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth/api-auth';
import { createClient } from "@supabase/supabase-js";

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

    // Supabase Client voor fallback/reliability
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    const supabase = createClient(supabaseUrl, supabaseKey);

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
      // CHRIS-PROTOCOL: Use Supabase SDK for absolute reliability in counting
      const { count, error: countErr } = await supabase
        .from('translation_registry')
        .select('*', { count: 'exact', head: true });
      
      if (countErr) throw countErr;
      totalStrings = count || 0;

      if (totalStrings > 0) {
        // Get counts per language
        const { data: langData, error: langErr } = await supabase
          .rpc('get_translation_stats'); // We use a small RPC or just a raw query if RPC doesn't exist
        
        if (langErr) {
          // Fallback to manual count if RPC fails
          const { data: manualData } = await supabase
            .from('translations')
            .select('lang');
          
          const counts: Record<string, number> = {};
          (manualData || []).forEach(t => {
            counts[t.lang] = (counts[t.lang] || 0) + 1;
          });
          statsByLang = Object.entries(counts).map(([lang, count]) => ({ lang, count }));
        } else {
          statsByLang = langData;
        }
      }
    } catch (dbErr: any) {
      console.error('[Voiceglot Stats] Supabase query failed, trying Drizzle:', dbErr.message);
      try {
        const [totalResult] = await db.select({ count: sql`count(*)` }).from(translationRegistry);
        totalStrings = parseInt(String(totalResult?.count || '0'), 10);
        
        if (totalStrings > 0) {
          statsByLang = await db.select({
            lang: translations.lang,
            count: sql`count(*)`
          })
          .from(translations)
          .groupBy(translations.lang);
        }
      } catch (drizzleErr: any) {
        console.error('[Voiceglot Stats] Drizzle also failed:', drizzleErr.message);
      }
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
