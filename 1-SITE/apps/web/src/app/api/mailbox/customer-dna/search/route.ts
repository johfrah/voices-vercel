import { db, users, orders, vaultFiles, actors, yukiOutstanding, orderItems } from '@/lib/system/voices-config';
import { eq, desc } from 'drizzle-orm';
import { NextResponse } from 'next/server';

/**
 *  CUSTOMER DNA SEARCH API (2026)
 * 
 * Zoekt een klant op basis van e-mail en haalt hun DNA op.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const email = searchParams.get('email');

  if (!email) {
    return NextResponse.json({ error: 'Email required' }, { status: 400 });
  }

  try {
    // 1. Zoek User op email
    const user = await db.query.users.findFirst({
      where: eq(users.email, email.toLowerCase().trim())
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const userId = user.id;

    // 2. Order Historie
    const userOrders = await db.select().from(orders)
      .where(eq(orders.userId, userId))
      .orderBy(desc(orders.createdAt))
      .limit(5);

    // 3. Vault Files
    const files = await db.query.vaultFiles.findMany({
      where: eq(vaultFiles.customerId, userId),
      orderBy: [desc(vaultFiles.createdAt)]
    });

    // 4. Signature Assets
    const signatureAssets = files.filter(f => f.category === 'signature_asset');

    // 5. Yuki Financile Context
    const outstanding = await db.query.yukiOutstanding.findMany({
      where: eq(yukiOutstanding.contactId, user.email),
      orderBy: [desc(yukiOutstanding.invoiceDate)]
    });

    // 6. Check of het een Actor is (ook op basis van email als userId link mist)
    let actor = await db.query.actors.findFirst({
      where: eq(actors.userId, userId)
    });

    if (!actor && email) {
      actor = await db.query.actors.findFirst({
        where: eq(actors.email, email.toLowerCase().trim())
      });
    }

    // 7. Als het een Actor is, haal hun Assignments (Projecten) op
    let actorAssignments: any[] = [];
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

      // 8. Haal Vault Files op die specifiek aan deze Actor zijn gekoppeld
      const actorFiles = await db.query.vaultFiles.findMany({
        where: eq(vaultFiles.actorId, actor.id),
        orderBy: [desc(vaultFiles.createdAt)],
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
    console.error(' Customer DNA Search API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
