import { NextResponse } from 'next/server';
import { db } from '@/lib/sync/bridge';
import { actors } from '@db/schema';
import { eq } from 'drizzle-orm';
import { requireAdmin } from '@/lib/auth/api-auth';

/**
 *  ADMIN ACTORS REORDER API (GOD MODE 2026)
 * 
 * Verwerkt bulk updates voor de menu_order van stemacteurs.
 */
export async function POST(request: Request) {
  const auth = await requireAdmin();
  if (auth instanceof NextResponse) return auth;

  try {
    const { orders } = await request.json(); // Array van { id: number, menuOrder: number }

    if (!orders || !Array.isArray(orders)) {
      return NextResponse.json({ error: 'Invalid orders data' }, { status: 400 });
    }

    console.log(` ADMIN: Reordering ${orders.length} actors`);

    // We voeren de updates uit in een transactie voor integriteit
    await db.transaction(async (tx) => {
      for (const item of orders) {
        await tx.update(actors)
          .set({ menuOrder: item.menuOrder })
          .where(eq(actors.id, item.id));
      }
    });

    return NextResponse.json({ 
      success: true, 
      message: `Successfully reordered ${orders.length} actors` 
    });

  } catch (error: any) {
    console.error(' ADMIN REORDER FAILURE:', error);
    return NextResponse.json({ error: 'Failed to reorder actors', details: error.message }, { status: 500 });
  }
}
