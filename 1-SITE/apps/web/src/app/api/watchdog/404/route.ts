import { NextRequest, NextResponse } from 'next/server';
import { SelfHealingService } from '@/lib/system/self-healing-service';

export async function POST(request: NextRequest) {
  try {
    const { path, referrer } = await request.json();
    const result = await SelfHealingService.handle404(path, referrer);
    return NextResponse.json({ success: true, ...result });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
