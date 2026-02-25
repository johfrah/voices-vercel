import { db, users, orders, vaultFiles, actors, yukiOutstanding, orderItems } from '@/lib/system/db';
import { eq, desc } from 'drizzle-orm';
import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth/api-auth';

/**
 *  CUSTOMER DNA API (2026)
 * 
 * Haalt alle relationele data op van een klant voor de Mailbox cockpit.
 * Inclusief: Orders, Vault Files (Scripts/Demos), en Actor link.
 */
export async function GET(
  request: Request,
  { params }: { params: { userId: string } }
) {
  const auth = await requireAdmin();
  if (auth instanceof NextResponse) return auth;

  const userId = parseInt(params.userId);

  if (isNaN(userId)) {
    return NextResponse.json({ error: 'Invalid User ID' }, { status: 400 });
  }

  try {
    // 1. Klant Basis Data
    const user = await db.query.users.findFirst({
      where: eq(users.id, userId)
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // 2. Order Historie
    // We gebruiken de ruwe database query om de ontbrekende kolom 'market' te vermijden als die nog in de cache zit
    const userOrders = await db.select().from(orders)
      .where(eq(orders.userId, userId))
      .orderBy(desc(orders.createdAt))
      .limit(5);

    // 3. Vault Files (De Kluis)
    const files = await db.query.vaultFiles.findMany({
      where: eq(vaultFiles.customerId, userId),
      orderBy: (vaultFiles, { desc }) => [desc(vaultFiles.createdAt)]
    });

    // 4. Signature Assets (Potential Avatars)
    const signatureAssets = files.filter(f => f.category === 'signature_asset');

    // 5. Yuki Financile Context (Openstaande Facturen)
    // We zoeken op email in de yuki_outstanding tabel (mirror van Yuki)
    const outstanding = await db.query.yukiOutstanding.findMany({
      where: eq(yukiOutstanding.contactId, user.email || ''), // In onze mirror gebruiken we vaak email als contactId link
      orderBy: (yukiOutstanding, { desc }) => [desc(yukiOutstanding.invoiceDate)]
    });

    // 6. Check of het een Actor is (ook op basis van email als userId link mist)
    let actor = await db.query.actors.findFirst({
      where: eq(actors.userId, userId)
    });

    if (!actor && user.email) {
      actor = await db.query.actors.findFirst({
        where: eq(actors.email, user.email)
      });
    }

    // 7. Als het een Actor is, haal hun Assignments (Projecten) op
    let actorAssignments: any[] = [];
    if (actor) {
      actorAssignments = await db.query.orderItems.findMany({
        where: eq(orders.userId, actor.id), // Let op: in order_items is actorId de link naar actors.id
        with: {
          order: true
        },
        orderBy: (orderItems, { desc }) => [desc(orderItems.createdAt)]
      });
    }

    // OEPS, correctie: de link in orderItems is actorId -> actors.id
    if (actor) {
      actorAssignments = await db.select({
        id: orderItems.id,
        name: orderItems.name,
        status: orderItems.deliveryStatus,
        createdAt: orderItems.createdAt,
        orderId: orders.wpOrderId,
        total: orders.total
      })
      .from(orderItems)
      .innerJoin(orders, eq(orderItems.orderId, orders.id))
      .where(eq(orderItems.actorId, actor.id))
      .orderBy(desc(orderItems.createdAt));

      // 8. Haal Vault Files op die specifiek aan deze Actor zijn gekoppeld (bijv. hun demo's of getekende contracten)
      const actorFiles = await db.query.vaultFiles.findMany({
        where: eq(vaultFiles.actorId, actor.id),
        orderBy: (vaultFiles, { desc }) => [desc(vaultFiles.createdAt)],
        limit: 10
      });
      // Voeg deze toe aan de vault lijst
      files.push(...actorFiles);
    }

    return NextResponse.json({
      user,
      orders: userOrders,
      vault: files.filter(f => f.category !== 'signature_asset'),
      signatureAssets,
      outstanding,
      actor: actor || null,
      actorAssignments: actorAssignments || []
    });
  } catch (error) {
    console.error(' Customer DNA API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
