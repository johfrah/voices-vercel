import { NextRequest, NextResponse } from 'next/server';
import { SelfHealingService } from '@/lib/system/self-healing-service';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  //  CHRIS-PROTOCOL: Build Safety
  if (process.env.NEXT_PHASE === 'phase-production-build' || (process.env.NODE_ENV === 'production' && !process.env.VERCEL_URL)) {
    return NextResponse.json({ success: true, message: 'Skipping 404 watchdog during build' });
  }

  try {
    const { path, referrer } = await request.json();
    const result = await SelfHealingService.handle404(path, referrer);
    return NextResponse.json({ success: true, ...result });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
