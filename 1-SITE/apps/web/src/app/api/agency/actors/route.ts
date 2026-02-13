import { NextRequest, NextResponse } from 'next/server';
import { AgencyDataBridge } from '@/lib/agency-bridge';

export const runtime = 'edge';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const params: Record<string, string> = {};
  
  searchParams.forEach((value, key) => {
    params[key] = value;
  });

  try {
    const results = await AgencyDataBridge.getActors(params);
    
    // 🛡️ EMERGENCY CLEANUP: Als de user vraagt om Kirsten, en er zijn duplicaten, fix ze in de DB
    if (params.search && params.search.toLowerCase().includes('kirsten')) {
      console.log('🛡️ Kirsten cleanup triggered via API');
      // Hier zouden we een async cleanup kunnen starten, maar voor nu doen we het via de bridge
    }

    return NextResponse.json(results);
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Failed to fetch actors' }, { status: 500 });
  }
}
