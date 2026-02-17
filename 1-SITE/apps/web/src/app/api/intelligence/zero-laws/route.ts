import { NextRequest, NextResponse } from 'next/server';
import { db } from '@db';
import { orders, orderItems, actors } from '@db/schema';
import { eq, desc } from 'drizzle-orm';
import { VoicyPatternEngine } from '@/lib/intelligence/pattern-engine';

/**
 *  ZERO LAWS INTELLIGENCE API
 * 
 * Doel: Voorspellende inzichten en AI-aanbevelingen ontsluiten.
 * "Zero Laws" = Geen handmatige input nodig, data vertelt het verhaal.
 */

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');
  const type = searchParams.get('type') || 'patterns'; // patterns, recommendations, churn

  if (!userId) return NextResponse.json({ error: 'userId required' }, { status: 400 });

  try {
    const uid = parseInt(userId);

    if (type === 'patterns') {
      // 1. Haal orderhistorie op met items en categorien
      const userOrders = await db.query.orders.findMany({
        where: eq(orders.userId, uid),
        with: {
          items: true
        },
        orderBy: [desc(orders.createdAt)]
      });

      const analysis = await VoicyPatternEngine.analyzeCustomerPatterns(uid);
      return NextResponse.json(analysis);
    }

    if (type === 'recommendations') {
      //  Simpele AI Recommendation: Stemmen die lijken op eerder bestelde stemmen
      const previousActors = await db
        .select({ actorId: orderItems.actorId })
        .from(orderItems)
        .innerJoin(orders, eq(orderItems.orderId, orders.id))
        .where(eq(orders.userId, uid))
        .limit(5);

      // Hier zouden we de 'voice_affinity' tabel kunnen gebruiken voor 'Godmode' matching
      return NextResponse.json({
        userId: uid,
        recommendedActors: [], // To be populated by affinity engine
        reason: "Based on your recent orders"
      });
    }

    return NextResponse.json({ error: 'Invalid type' }, { status: 400 });
  } catch (error) {
    console.error('[Zero Laws API Error]:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
