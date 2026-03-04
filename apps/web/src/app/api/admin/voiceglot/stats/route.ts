import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth/api-auth';
import { createClient } from "@supabase/supabase-js";
import { VOICEGLOT_TARGET_LANGUAGES } from '@/lib/services/voiceglot-heal-service';

/**
 *  API: VOICEGLOT STATS (GODMODE CACHING 2026)
 * 
 * Gebruikt app_configs als een persistente cache-laag om database timeouts te voorkomen.
 * NU VOLLEDIG OP BASIS VAN LANG_ID (CHRIS-PROTOCOL)
 */

export const dynamic = 'force-dynamic';

const CACHE_KEY = 'voiceglot_stats_cache';
const CACHE_TTL = 30 * 1000; // 30 seconden cache voor stats tijdens healing
const PAGE_SIZE = 1000;

async function fetchRegistryKeySet(supabase: any): Promise<Set<string>> {
  const registryKeys = new Set<string>();
  let offset = 0;

  while (true) {
    const { data, error } = await supabase
      .from('translation_registry')
      .select('id, string_hash')
      .order('id', { ascending: true })
      .range(offset, offset + PAGE_SIZE - 1);

    if (error) throw error;
    if (!data || data.length === 0) break;

    for (const row of (data || []) as any[]) {
      const key = String(row?.string_hash || '');
      if (!key) continue;
      registryKeys.add(key);
    }

    if (data.length < PAGE_SIZE) break;
    offset += PAGE_SIZE;
  }

  return registryKeys;
}

async function fetchActiveKeysByLang(
  supabase: any,
  targetLanguages: readonly string[],
  registryKeys: Set<string>,
): Promise<Map<string, Set<string>>> {
  const activeKeysByLang = new Map<string, Set<string>>();
  let offset = 0;

  while (true) {
    const { data, error } = await supabase
      .from('translations')
      .select('id, translation_key, lang, status, translated_text')
      .in('lang', [...targetLanguages])
      .order('id', { ascending: true })
      .range(offset, offset + PAGE_SIZE - 1);

    if (error) throw error;
    if (!data || data.length === 0) break;

    for (const row of (data || []) as any[]) {
      const lang = String(row?.lang || '').toLowerCase();
      const key = String(row?.translation_key || '');
      const text = String(row?.translated_text || '').trim();
      const isActive = (row?.status || 'active') === 'active';

      if (!lang || !key || !registryKeys.has(key) || !isActive || !text || text === '...') continue;

      const bucket = activeKeysByLang.get(lang) || new Set<string>();
      bucket.add(key);
      activeKeysByLang.set(lang, bucket);
    }

    if (data.length < PAGE_SIZE) break;
    offset += PAGE_SIZE;
  }

  return activeKeysByLang;
}

export async function GET(request: NextRequest) {
  try {
    if (process.env.NEXT_PHASE === 'phase-production-build' || (process.env.NODE_ENV === 'production' && !process.env.VERCEL_URL)) {
      return NextResponse.json({ totalStrings: 0, coverage: [] });
    }

    const auth = await requireAdmin();
    if (auth instanceof NextResponse) return auth;

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // 1. Check Cache
    const { data: cachedConfig } = await supabase
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

    // 2. Fetch Fresh Data (ID-Centric, paginated to avoid Supabase row caps)
    const registryKeys = await fetchRegistryKeySet(supabase);
    const totalStrings = registryKeys.size;
    const activeKeysByLang = await fetchActiveKeysByLang(supabase, VOICEGLOT_TARGET_LANGUAGES, registryKeys);

    const coverage = VOICEGLOT_TARGET_LANGUAGES.map((code) => {
      const count = activeKeysByLang.get(code)?.size || 0;
      return {
        lang: code,
        count,
        percentage: totalStrings > 0 ? Math.min(100, Math.round((count / totalStrings) * 100)) : 0
      };
    });

    const freshData = {
      totalStrings,
      coverage,
      status: totalStrings > 0 ? 'ACTIVE' : 'INITIALIZING',
      updatedAt: new Date()
    };

    // 3. Update Cache
    await supabase.from('app_configs').upsert({
      key: CACHE_KEY,
      value: freshData,
      updated_at: new Date()
    });

    return NextResponse.json({ ...freshData, isCached: false });
  } catch (error: any) {
    console.error('[Voiceglot Stats Error]:', error);
    return NextResponse.json({ 
      totalStrings: 0, 
      coverage: [], 
      error: error.message || 'Failed to fetch stats' 
    }, { status: 200 });
  }
}
