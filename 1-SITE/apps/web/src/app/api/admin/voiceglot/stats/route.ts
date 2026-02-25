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

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    
    if (!supabaseUrl) {
      throw new Error('NEXT_PUBLIC_SUPABASE_URL is missing');
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // 1. Check Cache
    const { data: cachedConfig, error: cacheFetchErr } = await supabase
      .from('app_configs')
      .select('*')
      .eq('key', CACHE_KEY)
      .limit(1);
    
    const now = new Date().getTime();
    
    if (cachedConfig && cachedConfig.length > 0) {
      const cacheData = cachedConfig[0].value as any;
      const cacheAge = now - new Date(cachedConfig[0].updated_at || 0).getTime();
      if (cacheAge < CACHE_TTL) {
        return NextResponse.json({ ...cacheData, isCached: true });
      }
    }

    // 2. Fetch Fresh Data (Ultra-Light)
    let totalStrings = 0;
    let statsByLang: any[] = [];

    try {
      console.log('[Voiceglot Stats] Fetching total count from registry...');
      // CHRIS-PROTOCOL: Use Supabase SDK for stats to bypass driver mapping issues
      const { count: totalCount, error: totalErr } = await supabase
        .from('translation_registry')
        .select('*', { count: 'exact', head: true });

      if (totalErr) throw totalErr;
      totalStrings = totalCount || 0;
      console.log(`[Voiceglot Stats] Total strings found: ${totalStrings}`);
      
      if (totalStrings > 0) {
        console.log('[Voiceglot Stats] Fetching counts per language...');
        // Direct grouping via SDK is not supported, so we use a raw query fallback or RPC
        const { data: langData, error: langErr } = await supabase
          .from('translations')
          .select('lang');
        
        if (langErr) throw langErr;

        const counts: Record<string, number> = {};
        (langData || []).forEach((t: any) => {
          counts[t.lang] = (counts[t.lang] || 0) + 1;
        });
        statsByLang = Object.entries(counts).map(([lang, count]) => ({ lang, count }));
        console.log(`[Voiceglot Stats] Stats by lang result:`, statsByLang);
      }
    } catch (dbErr: any) {
      console.error('[Voiceglot Stats] Supabase SDK query failed, trying Drizzle backup:', dbErr.message);
      try {
        const totalResult = await db.execute(sql`SELECT count(*) as count FROM translation_registry`);
        totalStrings = parseInt(String((totalResult as any)[0]?.count || '0'), 10);
        
        if (totalStrings > 0) {
          const langResult = await db.execute(sql`
            SELECT lang, count(*) as count 
            FROM translations 
            GROUP BY lang
          `);
          statsByLang = (langResult as any) || [];
        }
      } catch (drizzleErr: any) {
        console.error('[Voiceglot Stats] Drizzle backup also failed:', drizzleErr.message);
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
      await supabase.from('app_configs').upsert({
        key: CACHE_KEY,
        value: freshData,
        updated_at: new Date().toISOString()
      });
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
