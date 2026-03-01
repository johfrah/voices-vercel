/**
 * NUCLEAR STUDIO WORKSHOPS API (2026)
 *
 * Fetches all public workshops with full enrichment via StudioService.
 *
 * @protocol CHRIS-PROTOCOL: StudioService for Nuclear Integrity
 */

import { NextResponse } from 'next/server';
import { getStudioWorkshopsData } from '@/lib/services/studio-service';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    const data = await getStudioWorkshopsData();
    return NextResponse.json(data);
  } catch (error) {
    console.error('[Studio Workshops API]:', error);
    return NextResponse.json({ 
      error: 'Studio workshops fetch failed', 
      message: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
}
