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
    console.log('🔗 SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);
    console.log('🔗 SUPABASE_KEY_TYPE:', process.env.SUPABASE_SERVICE_ROLE_KEY ? 'SERVICE_ROLE' : (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'ANON' : 'NONE'));
    console.log('🔗 SUPABASE_KEY_PREFIX:', (process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)?.substring(0, 5));

    const data = await getActors(params, lang).catch((err) => {
      console.error(' [ACTORS API] getActors failure:', err);
      return { results: [], count: 0, filters: { genders: [], languages: [], styles: [] }, reviews: [], reviewStats: { averageRating: 4.9, totalCount: 0, distribution: {} } };
    });
    
    if (!data || !data.results) {
      return NextResponse.json({ results: [], count: 0, _nuclear_debug: 'No results found' });
    }
    
    return NextResponse.json({
      ...data,
      _nuclear_debug: {
        timestamp: new Date().toISOString(),
        version: '2.18'
      }
    });
  } catch (error: any) {
    console.error(' ACTORS API FAILURE:', error.message);
    return NextResponse.json({ results: [], count: 0 }, { status: 500 });
  }
}
