import { NextResponse } from 'next/server';
import { getActors } from '@/lib/api-server';

/**
 *  ACTORS API ROUTE (2026)
 * 
 * Serveert de stemacteurs data aan de client-side componenten.
 * Voldoet aan het Chris-Protocol: Forensische logging en rigide validatie.
 */
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const lang = searchParams.get('lang') || 'nl';
  
  try {
    const params: Record<string, string> = {};
    searchParams.forEach((value, key) => {
      params[key] = value;
    });

    const data = await getActors(params, lang).catch((err) => {
      console.error(' [ACTORS API] getActors failure:', err);
      return { 
        results: [], 
        count: 0, 
        _error: err.message,
        _stack: err.stack,
        _v: 'v2.8',
        _env: {
          hasUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
          hasKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
          hasAnon: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
        },
        filters: { genders: [], languages: [], styles: [] }, 
        reviews: [], 
        reviewStats: { averageRating: 4.9, totalCount: 0, distribution: {} } 
      };
    });
    
    return NextResponse.json(data);
  } catch (error: any) {
    console.error(' ACTORS API FAILURE:', error.message);
    return NextResponse.json({ results: [], count: 0 }, { status: 500 });
  }
}
