import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/system/voices-config';
import { partnerWidgets, actors, orders, orderItems } from '@/lib/system/voices-config';
import { eq, inArray, sql } from 'drizzle-orm';

/**
 *  System (INTEGRATED AGENCY PORTAL) PARTNER API
 * 
 * Doel: Partners (resellers, studio's) toegang geven tot hun eigen ecosysteem.
 * Core CRUD voor partner-specifieke entiteiten.
 */

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const partnerId = searchParams.get('partnerId');
  const action = searchParams.get('action') || 'config';

  if (!partnerId) return NextResponse.json({ error: 'partnerId required' }, { status: 400 });

  try {
    // 1. Haal partner configuratie op
    const [partner] = await db
      .select()
      .from(partnerWidgets)
      .where(eq(partnerWidgets.partnerId, partnerId))
      .limit(1);

    if (!partner) return NextResponse.json({ error: 'Partner not found' }, { status: 404 });

    if (action === 'config') {
      return NextResponse.json(partner);
    }

    if (action === 'voices') {
      // Haal toegestane stemmen op voor deze partner
      const allowedIds = JSON.parse(partner.allowedVoices || '[]');
      if (allowedIds.length === 0) return NextResponse.json([]);

      const partnerVoices = await db
        .select()
        .from(actors)
        .where(inArray(actors.id, allowedIds));

      return NextResponse.json(partnerVoices);
    }

    if (action === 'orders') {
      // Haal orders op voor deze partner (gefilterd op partnerId in metadata)
      const partnerOrders = await db
        .select()
        .from(orders)
        .where(sql`${orders.rawMeta}->>'partner_id' = ${partnerId}`)
        .limit(50);

      return NextResponse.json(partnerOrders);
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('[System Partner API Error]:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
