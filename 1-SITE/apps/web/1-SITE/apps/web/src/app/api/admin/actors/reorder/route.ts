import { db } from '@db';
import { actors } from '@db/schema';
import { eq, or } from 'drizzle-orm';
import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth/api-auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 *  API: ADMIN ACTORS REORDER (GOD MODE 2026)
 * 
 * Verwerkt bulk updates van menu_order voor stemacteurs.
 */
export async function POST(request: Request) {
  const auth = await requireAdmin();
  if (auth instanceof NextResponse) return auth;

  try {
    const { orders } = await request.json(); // Array of { id: number, menuOrder: number }

    if (!orders || !Array.isArray(orders)) {
      return NextResponse.json({ error: 'Invalid orders data' }, { status: 400 });
    }

    console.log(` ADMIN: Reordering ${orders.length} actors`);

    // CHRIS-PROTOCOL: Bulk update via transaction for integrity
    await db.transaction(async (tx) => {
      for (const item of orders) {
        await tx.update(actors)
          .set({ menuOrder: item.menuOrder, updatedAt: new Date() })
          .where(or(eq(actors.id, item.id), eq(actors.wpProductId, item.id)));
      }
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('[Admin Actors Reorder Error]:', error);
    return NextResponse.json({ error: 'Failed to reorder actors', details: error.message }, { status: 500 });
  }
}
