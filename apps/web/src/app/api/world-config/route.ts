import { getWorldConfig } from '@/lib/services/world-config-service';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const worldId = parseInt(request.nextUrl.searchParams.get('worldId') || '1');
  const config = await getWorldConfig(worldId);
  
  if (!config) {
    return NextResponse.json({ error: 'World not found' }, { status: 404 });
  }

  return NextResponse.json(config, {
    headers: { 'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600' }
  });
}
