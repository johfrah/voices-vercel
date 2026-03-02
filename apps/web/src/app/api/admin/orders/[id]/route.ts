import { db, ordersV2, users, orderItems, ordersLegacyBloat, orderStatuses } from '@/lib/system/voices-config';
import { eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth/api-auth';

export const dynamic = 'force-dynamic';

function mapStatusToUiLabel(statusCode?: string | null, statusLabel?: string | null): string {
  switch (statusCode) {
    case 'completed_paid':
      return 'Betaald';
    case 'completed':
    case 'completed_unpaid':
      return 'In behandeling';
    case 'awaiting_payment':
    case 'unpaid':
    case 'waiting_po':
      return 'Wacht op betaling';
    case 'quote_sent':
      return 'Offerte';
    case 'failed':
    case 'refunded':
      return 'Mislukt';
    default:
      return statusLabel || 'In behandeling';
  }
}

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const idStr = params.id ? String(params.id).replace(/\/$/, '') : '';
  const id = parseInt(idStr);
  
  try {
    if (isNaN(id)) return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });

    // 🛡️ CHRIS-PROTOCOL: Auth Check
    const auth = await requireAdmin();
    if (auth instanceof NextResponse) {
      return auth;
    }

    // 🚀 NUCLEAR DETAIL FETCH: Gebruik standaard Drizzle select voor stabiliteit
    const [order] = await db.select({
      id: ordersV2.id,
      userId: ordersV2.userId,
      journeyId: ordersV2.journeyId,
      statusId: ordersV2.statusId,
      paymentMethodId: ordersV2.paymentMethodId,
      amountNet: ordersV2.amountNet,
      amountTotal: ordersV2.amountTotal,
      purchaseOrder: ordersV2.purchaseOrder,
      billingEmailAlt: ordersV2.billingEmailAlt,
      createdAt: ordersV2.createdAt,
      legacyInternalId: ordersV2.legacyInternalId,
      rawMeta: ordersLegacyBloat.rawMeta
    })
    .from(ordersV2)
    .leftJoin(ordersLegacyBloat, eq(ordersV2.id, ordersLegacyBloat.wpOrderId))
    .where(eq(ordersV2.id, id))
    .limit(1);

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // 🛡️ CHRIS-PROTOCOL: Robust Type Casting
    const orderPk = Number(order.id);
    const userId = order.userId ? Number(order.userId) : null;
    const legacyInternalId = order.legacyInternalId ? Number(order.legacyInternalId) : null;

    // Resolve Items
    const items = await db.select().from(orderItems).where(
      eq(orderItems.orderId, legacyInternalId || orderPk)
    ).catch(() => []);

    // Resolve User
    let customerInfo = null;
    if (userId) {
      const dbUser = await db.select().from(users).where(eq(users.id, userId)).limit(1).then((res: any[]) => res[0]).catch(() => null);
      if (dbUser) {
        customerInfo = {
          id: dbUser.id,
          first_name: dbUser.first_name,
          last_name: dbUser.last_name,
          email: dbUser.email,
          companyName: dbUser.companyName
        };
      }
    }

    // 🤝 DE HANDDRUK (Human-Centric Mapping)
    const rawMeta = order.rawMeta || {};
    
    // 🔍 FINANCIAL INTELLIGENCE: COG & Margin (Punt 2 Scope)
    const totalRevenue = Number(order.amountTotal || 0);
    const totalNet = Number(order.amountNet || 0);
    
    // Zoek naar COG in items of meta
    let totalCost = 0;
    const formattedItems = items.map((item: any) => {
      const itemMeta = item.meta_data || {};
      const itemCost = Number(itemMeta._alg_wc_cog_item_cost || itemMeta._COG || 0);
      totalCost += itemCost;
      
      return {
        id: item.id,
        name: item.name || 'Onbekend item',
        quantity: item.quantity || 1,
        price: item.price?.toString() || "0.00",
        cost: itemCost.toFixed(2),
        subtotal: (Number(item.price || 0) * Number(item.quantity || 1)).toFixed(2)
      };
    });

    const margin = totalNet - totalCost;
    const marginPercentage = totalNet > 0 ? Math.round((margin / totalNet) * 100) : 0;

    // 🎭 PRODUCTIE: Script & Regie (Punt 4 Scope)
    const rawBriefing = rawMeta.briefing || rawMeta._billing_wo_briefing || "";
    const hasRegieInstructions = rawBriefing.includes('(') && rawBriefing.includes(')');
    
    // 🎓 BERNY-FLOW: Participant Info (Punt 5 Scope)
    const participants = rawMeta.participant_info || rawMeta._participants || null;

    const journeyMap: Record<number, string> = {
      1: 'Voices Agency',
      2: 'Voices Studio',
      3: 'Voices Academy',
      4: 'Voices Artist'
    };

    const [statusMeta] = await db
      .select({
        code: orderStatuses.code,
        label: orderStatuses.label
      })
      .from(orderStatuses)
      .where(eq(orderStatuses.id, Number(order.statusId)))
      .limit(1);

    const statusCode = statusMeta?.code || null;
    const statusLabel = statusMeta?.label || null;
    const statusForUi = mapStatusToUiLabel(statusCode, statusLabel);

    const paymentMap: Record<number, string> = {
      1: 'Bancontact',
      2: 'Creditcard',
      3: 'iDEAL',
      4: 'Factuur (PO)',
      5: 'Handmatige overboeking'
    };

    return NextResponse.json({
      id: orderPk,
      orderNumber: orderPk.toString(),
      date: order.createdAt,
      status: statusForUi,
      statusCode,
      statusLabel,
      unit: journeyMap[Number(order.journeyId)] || 'Voices',
      
      // 🚦 ACTION-DRIVEN LOGIC (Punt 3 Scope)
      actions: {
        needsPO: statusCode === 'waiting_po' || (!order.purchaseOrder && Number(order.journeyId) === 1),
        canGeneratePaymentLink: ['awaiting_payment', 'unpaid', 'failed', 'waiting_po'].includes(statusCode || ''),
        isYukiReady: !!order.amountTotal && ['completed', 'completed_paid'].includes(statusCode || '')
      },

      customer: customerInfo ? {
        name: `${customerInfo.first_name || ''} ${customerInfo.last_name || ''}`.trim(),
        email: customerInfo.email,
        company: customerInfo.companyName,
        vat: rawMeta._billing_vat_number || null
      } : null,

      billing: {
        email: order.billingEmailAlt || customerInfo?.email,
        purchaseOrder: order.purchaseOrder
      },

      finance: {
        net: totalNet.toFixed(2),
        vat: (totalRevenue - totalNet).toFixed(2),
        total: totalRevenue.toFixed(2),
        cost: totalCost.toFixed(2),
        margin: margin.toFixed(2),
        marginPercentage: `${marginPercentage}%`,
        method: paymentMap[Number(order.paymentMethodId)] || 'Online betaling'
      },

      production: {
        items: formattedItems,
        briefing: {
          text: rawBriefing,
          hasInstructions: hasRegieInstructions,
          audioLink: rawMeta.audiobriefing || null
        },
        participants: participants
      },

      technical: {
        sourceId: legacyInternalId,
        meta: rawMeta
      }
    });

  } catch (error: any) {
    console.error('[Admin Order Detail GET] Critical Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
