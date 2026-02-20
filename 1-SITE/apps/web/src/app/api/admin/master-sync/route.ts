import { NextRequest, NextResponse } from 'next/server';
import { runMasterSync } from '@/lib/master-sync';
import { requireAdmin } from '@/lib/auth/api-auth';

export const runtime = 'nodejs';

/**
 *  NUCLEAR MASTER SYNC API
 * De 'Big Bang' knop voor de transitie naar Next.js.
 */

export async function POST(request: NextRequest) {
  const auth = await requireAdmin();
  if (auth instanceof NextResponse) return auth;

  console.log(' Core Master Sync Triggered via API');
  
  const result = await runMasterSync();
  
  if (result.success) {
    return NextResponse.json({
        message: 'Master Sync voltooid!',
        stats: result.stats
    });
  } else {
    return NextResponse.json(result, { status: 500 });
  }
}
