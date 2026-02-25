import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/system/db';
import { orders, systemEvents } from '@/lib/system/db';
import { eq, sql } from 'drizzle-orm';
import { CoreAutomationEngine, CoreEvent } from '@/lib/system/core-automation-engine';

/**
 *  SYSTEM AUTOMATION: WEBHOOK & EVENT BUS
 * 
 * Doel: Real-time triggers voor order-statussen en systeem-events.
 * Verbindt de headless core met backend-services (Email, Yuki, Analytics).
 */

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { event, data, secret } = body;

    //  Basic security (Internal only)
    if (secret !== process.env.NUCLEAR_SECRET && process.env.NODE_ENV === 'production') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log(`[System Webhook]: ${event}`, data);

    // Trigger de centrale Automation Engine
    await CoreAutomationEngine.trigger(event as CoreEvent, data);

    return NextResponse.json({ success: true, event });
  } catch (error) {
    console.error('[System Webhook Error]:', error);
    return NextResponse.json({ error: 'Failed to process event' }, { status: 500 });
  }
}
