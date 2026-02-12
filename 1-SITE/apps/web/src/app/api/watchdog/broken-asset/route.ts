import { NextRequest, NextResponse } from 'next/server';
import { SelfHealingService } from '@/lib/system/self-healing-service';

/**
 * 🩹 API: BROKEN ASSET WATCHDOG
 * 
 * Doel: Ontvangen van meldingen over kapotte assets (audio/video/images)
 * en de Self-Healing Service triggeren.
 */
export async function POST(request: NextRequest) {
  try {
    const { path, context, host: requestHost } = await request.json();
    
    const host = requestHost || request.headers.get('host') || 'voices.be';
    await SelfHealingService.reportBrokenAsset(path, context, host);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('🚀 WATCHDOG ERROR:', error);
    return NextResponse.json({ error: 'Internal Error' }, { status: 500 });
  }
}
