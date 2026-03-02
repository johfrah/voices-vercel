import { db, orders, orderItems, actors, vaultFiles } from '@/lib/system/voices-config';
import { eq, desc } from 'drizzle-orm';
import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth/api-auth';

/**
 *  PROJECT DNA API (2026)
 * 
 * Haalt alle relevante projectdata op voor de Mailbox sidebar.
 * Inclusief: Status, Geboekte Stemmen, en Project-specifieke Vault files.
 */
export async function GET(
  request: Request,
  { params }: { params: { projectId: string } }
) {
  const auth = await requireAdmin();
  if (auth instanceof NextResponse) return auth;

  const wpOrderId = parseInt(params.projectId);

  if (isNaN(wpOrderId)) {
    return NextResponse.json({ error: 'Invalid Project ID' }, { status: 400 });
  }

  try {
    // 1. Haal Order op
    const order = await db.query.orders.findFirst({
      where: eq(orders.wpOrderId, wpOrderId),
      with: {
        items: {
          with: {
            actor: true
          }
        }
      }
    });

    if (!order) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    // 2. Haal Project-specifieke Vault Files op
    const files = await db.query.vaultFiles.findMany({
      where: eq(vaultFiles.projectId, order.id),
      orderBy: [desc(vaultFiles.createdAt)]
    });

    return NextResponse.json({
      order,
      files
    });
  } catch (error) {
    console.error(' Project DNA API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
