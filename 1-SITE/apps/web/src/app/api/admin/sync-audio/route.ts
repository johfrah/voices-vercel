import { NextRequest, NextResponse } from 'next/server';
import { runAudioMapping } from '@/lib/audio-mapper';
import { requireAdmin } from '@/lib/auth/api-auth';

/**
 * ⚡ NUCLEAR SYNC API
 * Trigger voor de audio mapping fase.
 */

export async function POST(request: NextRequest) {
  const auth = await requireAdmin();
  if (auth instanceof NextResponse) return auth;

  const result = await runAudioMapping();
  
  if (result.success) {
    return NextResponse.json(result);
  } else {
    return NextResponse.json(result, { status: 500 });
  }
}
