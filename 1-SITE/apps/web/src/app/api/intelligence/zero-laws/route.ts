import { NextRequest, NextResponse } from 'next/server';
import { db } from '@db';
import { orders, orderItems, actors } from '@db/schema';
import { eq, desc } from 'drizzle-orm';
import { VoicyPatternEngine } from '@/lib/intelligence/pattern-engine';
import { createClient } from '@/utils/supabase/server';

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

  //  LEX-MANDATE: Ensure user can only access their own patterns
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const uid = parseInt(userId);

    // Check if user is admin or requesting their own data
    const { requireAdmin } = await import('@/lib/auth/api-auth');
    const auth = await requireAdmin();
    const isAdmin = !(auth instanceof NextResponse);

    // If not admin, check if the email matches the requested userId
    if (!isAdmin) {
      const { users } = await import('@db/schema');
      const [dbUser] = await db.select({ email: users.email }).from(users).where(eq(users.id, uid)).limit(1);
      
      if (!dbUser || dbUser.email !== user.email) {
        return NextResponse.json({ error: 'Forbidden: You can only access your own patterns' }, { status: 403 });
      }
    }

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
