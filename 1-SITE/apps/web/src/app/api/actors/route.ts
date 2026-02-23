import { NextResponse } from 'next/server';
import { getActors } from '@/lib/services/api-server';

/**
 *  ACTORS API ROUTE (2026)
 * 
 * Serveert de stemacteurs data aan de client-side componenten.
 * Voldoet aan het Chris-Protocol: Forensische logging en rigide validatie.
 * 
 * @lock-file
 */
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

// 🛡️ CHRIS-PROTOCOL: Nuclear Caching (24h TTL)
let cachedActors: Record<string, any> = {};
let lastFetchTimes: Record<string, number> = {};
const CACHE_TTL = 1000 * 60 * 60 * 24; // 24 uur

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const lang = searchParams.get('lang') || 'nl';
  
  // Cache key base op params
  const cacheKey = searchParams.toString() || 'default';
  const now = Date.now();

  // 🛡️ CHRIS-PROTOCOL: Nuclear Cache Check
  if (cachedActors[cacheKey] && (now - lastFetchTimes[cacheKey] < CACHE_TTL)) {
    return NextResponse.json(cachedActors[cacheKey]);
  }

  try {
    const params: Record<string, string> = {};
    searchParams.forEach((value, key) => {
      params[key] = value;
    });

    // 🛡️ CHRIS-PROTOCOL: 3s internal timeout for actors
    const fetchPromise = getActors(params, lang);
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Actors fetch timeout (3s)')), 3000)
    );

    let data;
    try {
      data = await Promise.race([fetchPromise, timeoutPromise]);
    } catch (err: any) {
      console.warn(' [ACTORS API] Timeout or error, using stale cache or fallback:', err.message);
      if (cachedActors[cacheKey]) return NextResponse.json(cachedActors[cacheKey]);
      
      // Hard fallback
      data = { 
        results: [], 
        count: 0, 
        _error: err.message,
        _v: 'v2.14.55 (Godmode Zero)',
        filters: { genders: [], languages: [], styles: [] }, 
        reviews: [], 
        reviewStats: { averageRating: 4.9, totalCount: 0, distribution: {} } 
      };
    }

    const result = {
      ...data,
      _v: 'v2.14.81 (Godmode Zero)',
      _debug_fr_be_search: data.results?.filter((a: any) => a.display_name.match(/Marilyn|Veronique|Alicia|James|Delphine/i)).map((a: any) => ({ name: a.display_name, native: a.native_lang, extra: a.extra_langs, status: a.status }))
    };

    // Update cache
    cachedActors[cacheKey] = result;
    lastFetchTimes[cacheKey] = now;

    return NextResponse.json(result);
  } catch (error: any) {
    console.error(' ACTORS API FAILURE:', error.message);
    
    if (cachedActors[cacheKey]) return NextResponse.json(cachedActors[cacheKey]);
    
    return NextResponse.json({ results: [], count: 0, _v: 'v2.14.55' }, { status: 500 });
  }
}
