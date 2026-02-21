import { NextResponse } from 'next/server';
import { getMusicLibrary } from '@/lib/api-server';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const music = await getMusicLibrary();
    return NextResponse.json(music);
  } catch (error) {
    console.error('[API Music] Error:', error);
    return NextResponse.json({ error: 'Failed to fetch music' }, { status: 500 });
  }
}
