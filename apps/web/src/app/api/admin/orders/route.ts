import {
  db,
  orderItems,
  orderStatuses,
  orders,
  ordersLegacyBloat,
  ordersV2,
  journeys,
  users,
  worlds
} from '@/lib/system/voices-config';
import { and, count, eq, inArray, sql } from 'drizzle-orm';
import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth/api-auth';
import { MarketManagerServer as MarketManager } from "@/lib/system/core/market-manager";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const STATUS_FILTER_MAP: Record<string, string[]> = {
  Betaald: ['completed', 'completed_paid', 'paid', 'wc-completed'],
  'In behandeling': ['processing', 'in_progress', 'in_productie', 'active'],
  'Wacht op betaling': ['unpaid', 'pending', 'awaiting_payment', 'waiting_po', 'wc-pending'],
  Offerte: ['quote_sent', 'quote_pending', 'quote-pending'],
  Mislukt: ['failed', 'cancelled', 'refunded', 'wc-refunded'],
};

function mapStatusForAdmin(statusCode: string | null, fallbackLabel?: string | null): string {
  const code = (statusCode || '').toLowerCase();

  if (['completed', 'completed_paid', 'paid', 'wc-completed'].includes(code)) return 'Betaald';
  if (['processing', 'in_progress', 'in_productie', 'active'].includes(code)) return 'In behandeling';
  if (['unpaid', 'pending', 'awaiting_payment', 'waiting_po', 'wc-pending'].includes(code)) return 'Wacht op betaling';
  if (['quote_sent', 'quote_pending', 'quote-pending'].includes(code)) return 'Offerte';
  if (['failed', 'cancelled', 'refunded', 'wc-refunded'].includes(code)) return 'Mislukt';

  return fallbackLabel || 'In behandeling';
}

function mapStatusToLegacyStatus(code: string): string {
  const normalized = code.toLowerCase();
  if (['completed', 'completed_paid', 'paid', 'wc-completed'].includes(normalized)) return 'completed';
  if (['quote_sent', 'quote_pending', 'quote-pending'].includes(normalized)) return 'quote-pending';
  if (['failed'].includes(normalized)) return 'failed';
  if (['cancelled'].includes(normalized)) return 'cancelled';
  if (['refunded', 'wc-refunded'].includes(normalized)) return 'refunded';
  if (['waiting_po', 'awaiting_payment', 'unpaid', 'pending', 'wc-pending'].includes(normalized)) return 'pending';
  return 'processing';
}

export async function GET(request: NextRequest) {
  try {
    const auth = await requireAdmin();
    if (auth instanceof NextResponse) return auth;

    const { searchParams } = new URL(request.url);
    const page = Math.max(parseInt(searchParams.get('page') || '1', 10), 1);
    const limit = Math.min(Math.max(parseInt(searchParams.get('limit') || '20', 10), 1), 100);
    const search = (searchParams.get('search') || '').trim();
    const worldCode = (searchParams.get('world') || '').trim();
    const statusFilter = (searchParams.get('status') || '').trim();
    const offset = (page - 1) * limit;

    const conditions: any[] = [];

    if (search) {
      const q = `%${search}%`;
      conditions.push(sql`(
        cast(${ordersV2.id} as text) ilike ${q}
        or ${ordersV2.billingEmailAlt} ilike ${q}
        or ${users.email} ilike ${q}
        or coalesce(${users.first_name}, '') ilike ${q}
        or coalesce(${users.last_name}, '') ilike ${q}
        or coalesce(${users.companyName}, '') ilike ${q}
      )`);
    }

    if (worldCode) {
      conditions.push(eq(worlds.code, worldCode));
    }

    if (statusFilter) {
      const mapped = STATUS_FILTER_MAP[statusFilter];
      const normalized = statusFilter.toLowerCase().replace(/\s+/g, '_').replace(/-/g, '_');
      const statusCodes = mapped && mapped.length > 0 ? mapped : [normalized, statusFilter];
      conditions.push(inArray(orderStatuses.code, statusCodes));
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const countQuery = db
      .select({ value: count() })
      .from(ordersV2)
      .leftJoin(users, eq(ordersV2.userId, users.id))
      .leftJoin(orderStatuses, eq(ordersV2.statusId, orderStatuses.id))
      .leftJoin(worlds, eq(ordersV2.worldId, worlds.id));

    const rowQuery = db
      .select({
        id: ordersV2.id,
        legacyInternalId: ordersV2.legacyInternalId,
        worldId: ordersV2.worldId,
        journeyId: ordersV2.journeyId,
        statusId: ordersV2.statusId,
        paymentMethodId: ordersV2.paymentMethodId,
        amountTotal: ordersV2.amountTotal,
        amountNet: ordersV2.amountNet,
        purchaseOrder: ordersV2.purchaseOrder,
        billingEmailAlt: ordersV2.billingEmailAlt,
        createdAt: ordersV2.createdAt,
        userEmail: users.email,
        userFirstName: users.first_name,
        userLastName: users.last_name,
        userCompany: users.companyName,
        statusCode: orderStatuses.code,
        statusLabel: orderStatuses.label,
        journeyLabel: journeys.label,
        worldLabel: worlds.label,
      })
      .from(ordersV2)
      .leftJoin(users, eq(ordersV2.userId, users.id))
      .leftJoin(orderStatuses, eq(ordersV2.statusId, orderStatuses.id))
      .leftJoin(journeys, eq(ordersV2.journeyId, journeys.id))
      .leftJoin(worlds, eq(ordersV2.worldId, worlds.id));

    const countRows = whereClause ? await countQuery.where(whereClause) : await countQuery;
    const rows = whereClause
      ? await rowQuery.where(whereClause).orderBy(sql`${ordersV2.createdAt} desc`).limit(limit).offset(offset)
      : await rowQuery.orderBy(sql`${ordersV2.createdAt} desc`).limit(limit).offset(offset);

    const totalInDb = Number(countRows[0]?.value || 0);
    const wpOrderIds = rows.map((row: any) => Number(row.id)).filter((id: number) => Number.isFinite(id));
    const legacyIds = rows
      .map((row: any) => (row.legacyInternalId ? Number(row.legacyInternalId) : null))
      .filter((id: number | null): id is number => id !== null);

    const bloatRows = wpOrderIds.length > 0
      ? await db
          .select({
            wpOrderId: ordersLegacyBloat.wpOrderId,
            rawMeta: ordersLegacyBloat.rawMeta,
          })
          .from(ordersLegacyBloat)
          .where(inArray(ordersLegacyBloat.wpOrderId, wpOrderIds))
      : [];

    const itemCountRows = legacyIds.length > 0
      ? await db
          .select({
            orderId: orderItems.orderId,
            value: count(),
          })
          .from(orderItems)
          .where(inArray(orderItems.orderId, legacyIds))
          .groupBy(orderItems.orderId)
      : [];

    const bloatByOrderId = new Map<number, any>();
    for (const row of bloatRows) {
      bloatByOrderId.set(Number(row.wpOrderId), row.rawMeta);
    }

    const itemCountByLegacyOrderId = new Map<number, number>();
    for (const row of itemCountRows) {
      if (row.orderId !== null) {
        itemCountByLegacyOrderId.set(Number(row.orderId), Number(row.value || 0));
      }
    }

    const defaultDomain = MarketManager.getMarketDomains()['BE']?.replace('https://www.', '') || 'voices.be';
    const sanitizedOrders = rows.map((row: any) => {
      const rawMeta = bloatByOrderId.get(Number(row.id));
      let parsedMeta: any = {};
      if (typeof rawMeta === 'string') {
        try {
          parsedMeta = JSON.parse(rawMeta || '{}');
        } catch {
          parsedMeta = {};
        }
      } else {
        parsedMeta = rawMeta || {};
      }

      const fallbackFirst = parsedMeta?.billing?.first_name || parsedMeta?._billing_first_name || 'Guest';
      const fallbackLast = parsedMeta?.billing?.last_name || parsedMeta?._billing_last_name || '';
      const fallbackEmail = parsedMeta?.billing?.email || parsedMeta?._billing_email || `guest@${defaultDomain}`;
      const fallbackCompany = parsedMeta?.billing?.company || parsedMeta?._billing_company || '';

      const firstName = row.userFirstName || fallbackFirst;
      const lastName = row.userLastName || fallbackLast;
      const email = row.userEmail || fallbackEmail;
      const company = row.userCompany || fallbackCompany;
      const customerName = `${firstName || ''} ${lastName || ''}`.trim() || 'Guest';

      const itemCount = row.legacyInternalId
        ? itemCountByLegacyOrderId.get(Number(row.legacyInternalId)) || 0
        : 0;

      return {
        id: Number(row.id),
        wpOrderId: Number(row.id),
        orderNumber: String(row.id),
        displayOrderId: String(row.id),
        date: row.createdAt,
        createdAt: row.createdAt,
        status: mapStatusForAdmin(row.statusCode, row.statusLabel),
        statusCode: row.statusCode,
        unit: row.journeyLabel || row.worldLabel || 'Voices',
        journeyId: row.journeyId,
        worldId: row.worldId,
        statusId: row.statusId,
        paymentMethodId: row.paymentMethodId,
        total: Number(row.amountTotal || 0),
        amountNet: Number(row.amountNet || 0),
        currency: 'EUR',
        itemsCount: itemCount,
        purchaseOrder: row.purchaseOrder || null,
        billingEmailAlt: row.billingEmailAlt || null,
        isQuote: (row.statusCode || '').includes('quote'),
        customer: {
          name: customerName,
          email,
          company: company || null,
        },
      };
    });

    return NextResponse.json({
      orders: sanitizedOrders,
      pagination: {
        page,
        limit,
        totalInDb,
        totalPages: Math.ceil(totalInDb / limit)
      }
    });
  } catch (error: any) {
    console.error('[Admin Orders GET Critical Error]:', error);
    return NextResponse.json({
      orders: [],
      _error: error.message
    }, { status: 500 });
  }
}

/**
 *  API: CREATE MANUAL ORDER (2026)
 */
export async function POST(request: NextRequest) {
  const auth = await requireAdmin();
  if (auth instanceof NextResponse) return auth;

  try {
    const body = await request.json();
    const userId = body.userId ?? body.user_id;
    const journey = body.journey || 'agency';
    const items = Array.isArray(body.items) ? body.items : [];
    const internalNotes = body.internalNotes ?? body.internal_notes ?? null;
    const status = body.status || 'pending';

    if (!userId || !items || items.length === 0) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const total = items.reduce((acc: number, item: any) => acc + (parseFloat(item.price) * item.quantity), 0);
    const totalTax = total * 0.21;
    
    const [newOrder] = await db.insert(orders).values({
      user_id: Number(userId),
      journey,
      total: total.toString(),
      tax: totalTax.toString(),
      status: status || 'pending',
      internal_notes: internalNotes,
      is_manually_edited: true,
      market: 'BE',
      createdAt: new Date(),
    }).returning();

    const orderItemsToInsert = items.map((item: any) => ({
      orderId: newOrder.id,
      name: item.name,
      quantity: item.quantity,
      price: item.price.toString(),
      createdAt: new Date(),
      is_manually_edited: true,
    }));

    await db.insert(orderItems).values(orderItemsToInsert);

    return NextResponse.json({
      ...newOrder,
      displayOrderId: newOrder.wpOrderId || newOrder.id,
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create order' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  const auth = await requireAdmin();
  if (auth instanceof NextResponse) return auth;

  try {
    const body = await request.json();
    const id = Number(body.id);
    const statusInput = String(body.status || '').trim();

    if (!id || !statusInput) {
      return NextResponse.json({ error: 'Missing id or status' }, { status: 400 });
    }

    const normalizedStatus = statusInput.toLowerCase().replace(/\s+/g, '_').replace(/-/g, '_');
    const mappedCodes = STATUS_FILTER_MAP[statusInput] || [normalizedStatus, statusInput];

    const statusRows = await db
      .select({
        id: orderStatuses.id,
        code: orderStatuses.code,
      })
      .from(orderStatuses)
      .where(inArray(orderStatuses.code, mappedCodes))
      .limit(1);

    const statusRow = statusRows[0];
    if (!statusRow) {
      return NextResponse.json({ error: `Unknown status: ${statusInput}` }, { status: 400 });
    }

    const orderRows = await db
      .select({
        id: ordersV2.id,
        legacyInternalId: ordersV2.legacyInternalId,
      })
      .from(ordersV2)
      .where(eq(ordersV2.id, id))
      .limit(1);

    const foundOrder = orderRows[0];
    if (!foundOrder) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    await db
      .update(ordersV2)
      .set({ statusId: statusRow.id })
      .where(eq(ordersV2.id, id));

    if (foundOrder.legacyInternalId) {
      await db
        .update(orders)
        .set({ status: mapStatusToLegacyStatus(statusRow.code) })
        .where(eq(orders.id, Number(foundOrder.legacyInternalId)));
    }

    return NextResponse.json({ success: true, id, status: statusRow.code });
  } catch (error) {
    console.error('[Admin Orders PATCH Error]:', error);
    return NextResponse.json({ error: 'Failed to update status' }, { status: 500 });
  }
}
