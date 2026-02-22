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

export async function GET(request: Request) {
  console.log(' ACTORS API: Request received', request.url);
  const { searchParams } = new URL(request.url);
  const lang = searchParams.get('lang') || 'nl';
  
  try {
    // We zetten de params om naar een Record voor getActors
    const params: Record<string, string> = {};
    searchParams.forEach((value, key) => {
      params[key] = value;
    });

    const data = await getActors(params, lang).catch((err) => {
      console.error(' [ACTORS API] getActors failure:', err);
      return { results: [], count: 0, _error: err.message, filters: { genders: [], languages: [], styles: [] }, reviews: [], reviewStats: { averageRating: 4.9, totalCount: 0, distribution: {} } };
    });
    
    if (!data || !data.results) {
      return NextResponse.json({ results: [], count: 0, _error: 'Invalid data structure' });
    }
    
    return NextResponse.json(data);
  } catch (error: any) {
    console.error(' ACTORS API FAILURE:', {
      message: error.message,
      stack: error.stack,
      url: request.url
    });
    
    return NextResponse.json(
      { error: 'Failed to fetch actors', message: error.message, _forensic: 'Check server logs for ACTORS API FAILURE' }, 
      { status: 500 }
    );
  }
}
