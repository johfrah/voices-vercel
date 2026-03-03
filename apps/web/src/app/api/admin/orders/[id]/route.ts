import { db, ordersV2, users, ordersLegacyBloat, orderStatuses, paymentMethods, journeys } from '@/lib/system/voices-config';
import { eq, sql } from 'drizzle-orm';
import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth/api-auth';

export const dynamic = 'force-dynamic';

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

    // 🚀 NUCLEAR DETAIL FETCH: Orders V2 + lookup tables + legacy bloat
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
      rawMeta: ordersLegacyBloat.rawMeta,
      statusCode: orderStatuses.code,
      statusLabel: orderStatuses.label,
      paymentCode: paymentMethods.code,
      paymentLabel: paymentMethods.label,
      journeyCode: journeys.code,
      journeyLabel: journeys.label,
    })
    .from(ordersV2)
    .leftJoin(ordersLegacyBloat, eq(ordersV2.id, ordersLegacyBloat.wpOrderId))
    .leftJoin(orderStatuses, eq(ordersV2.statusId, orderStatuses.id))
    .leftJoin(paymentMethods, eq(ordersV2.paymentMethodId, paymentMethods.id))
    .leftJoin(journeys, eq(ordersV2.journeyId, journeys.id))
    .where(eq(ordersV2.id, id))
    .limit(1);

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // 🛡️ CHRIS-PROTOCOL: Robust Type Casting
    const orderPk = Number(order.id);
    const userId = order.userId ? Number(order.userId) : null;
    const legacyInternalId = order.legacyInternalId ? Number(order.legacyInternalId) : null;
    const sourceOrderId = legacyInternalId || orderPk;

    // 🛡️ SCHEMA-DRIFT SAFE ITEM FETCH:
    // Raw SQL avoids selecting non-existing drifted columns from the Drizzle table object.
    const itemRowsRaw = await db.execute(sql`
      select
        oi.id,
        oi.order_id,
        oi.actor_id,
        oi.name,
        oi.quantity,
        oi.price,
        oi.cost,
        oi.tax,
        oi.delivery_status,
        oi.delivery_file_url,
        oi.invoice_file_url,
        oi.payout_status,
        oi.meta_data,
        oi.created_at,
        a.first_name as actor_first_name,
        a.last_name as actor_last_name,
        a.email as actor_email
      from order_items oi
      left join actors a on a.id = oi.actor_id
      where oi.order_id = ${sourceOrderId}
      order by oi.id desc
    `).catch((itemError: any) => {
      console.error('[Admin Order Detail] Item query failed:', itemError);
      return [];
    });
    const itemRows: any[] = Array.isArray(itemRowsRaw) ? itemRowsRaw : ((itemRowsRaw as any)?.rows || []);

    const recordingRowsRaw = await db.execute(sql`
      select
        id,
        order_id,
        order_item_id,
        status,
        created_at
      from recording_sessions
      where order_id = ${sourceOrderId}
      order by created_at desc
      limit 20
    `).catch(() => []);
    const recordingRows: any[] = Array.isArray(recordingRowsRaw) ? recordingRowsRaw : ((recordingRowsRaw as any)?.rows || []);

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
    const parseJson = (value: any) => {
      if (!value) return {};
      if (typeof value === 'string') {
        try {
          return JSON.parse(value);
        } catch {
          return {};
        }
      }
      return value;
    };
    let parsedRawMeta: any = {};
    if (typeof rawMeta === 'string') {
      try {
        parsedRawMeta = JSON.parse(rawMeta || '{}');
      } catch {
        parsedRawMeta = {};
      }
    } else {
      parsedRawMeta = rawMeta;
    }
    const statusCode = (order.statusCode || '').toLowerCase();

    // 🔍 FINANCIAL INTELLIGENCE: COG & Margin (Punt 2 Scope)
    const totalRevenue = Number(order.amountTotal || 0);
    const totalNet = Number(order.amountNet || 0);

    // Zoek naar COG in items en val terug op order-level legacy meta.
    let totalCost = 0;
    const formattedItems = itemRows.map((item: any) => {
      const itemMeta = parseJson(item.meta_data);
      const directCost = Number(item.cost || 0);
      const fallbackCost = Number(itemMeta?._alg_wc_cog_item_cost || itemMeta?._COG || 0);
      const itemCost = directCost > 0 ? directCost : fallbackCost;
      totalCost += itemCost;

      const actorName = `${item.actor_first_name || ''} ${item.actor_last_name || ''}`.trim();
      const quantity = Number(item.quantity || 1);
      const unitPrice = Number(item.price || 0);

      return {
        id: Number(item.id),
        actorId: item.actor_id ? Number(item.actor_id) : null,
        actorName: actorName || null,
        actorEmail: item.actor_email || null,
        name: item.name || 'Onbekend item',
        quantity: quantity,
        price: unitPrice.toFixed(2),
        cost: itemCost.toFixed(2),
        tax: Number(item.tax || 0).toFixed(2),
        subtotal: (unitPrice * quantity).toFixed(2),
        deliveryStatus: item.delivery_status || 'waiting',
        payoutStatus: item.payout_status || 'pending',
        deliveryFileUrl: item.delivery_file_url || null,
        invoiceFileUrl: item.invoice_file_url || null,
        meta: itemMeta,
        createdAt: item.created_at || null,
      };
    });
    const orderLevelCost = Number(parsedRawMeta?._alg_wc_cog_order_cost || 0);
    if (totalCost <= 0 && orderLevelCost > 0) {
      totalCost = orderLevelCost;
    }

    const margin = totalNet - totalCost;
    const marginPercentage = totalNet > 0 ? Math.round((margin / totalNet) * 100) : 0;

    // 🎭 PRODUCTIE: Script & Regie (Punt 4 Scope)
    const itemBriefingParts = formattedItems
      .flatMap((item: any) => [
        typeof item.meta?.script === 'string' ? item.meta.script.trim() : '',
        typeof item.meta?.briefing === 'string' ? item.meta.briefing.trim() : '',
        typeof item.meta?.instructions === 'string' ? item.meta.instructions.trim() : '',
      ])
      .filter(Boolean);
    const rawBriefingParts = [
      parsedRawMeta.briefing,
      parsedRawMeta._billing_wo_briefing,
      parsedRawMeta._billing_order_comments,
    ]
      .map((value: any) => (typeof value === 'string' ? value.trim() : ''))
      .filter(Boolean);
    const briefingText = [...itemBriefingParts, ...rawBriefingParts].join('\n\n');
    const hasRegieInstructions =
      itemBriefingParts.length > 1 ||
      (briefingText.includes('(') && briefingText.includes(')'));
    const audioBriefingLink = parsedRawMeta.audiobriefing || parsedRawMeta._billing_wo_audio_url || null;

    // 🎓 BERNY-FLOW: Participant Info (Punt 5 Scope)
    const participants =
      parsedRawMeta.participant_info ||
      parsedRawMeta._participants ||
      formattedItems.map((item: any) => item.meta?.workshop_details).find(Boolean) ||
      null;

    const fallbackCustomer = {
      id: null,
      first_name: parsedRawMeta._billing_first_name || parsedRawMeta?.billing?.first_name || 'Guest',
      last_name: parsedRawMeta._billing_last_name || parsedRawMeta?.billing?.last_name || '',
      email: parsedRawMeta._billing_email || null,
      companyName: parsedRawMeta._billing_company || parsedRawMeta?.billing?.company || null,
    };
    const resolvedCustomer = customerInfo || fallbackCustomer;

    const purchaseOrder = order.purchaseOrder || parsedRawMeta._billing_po || null;
    const billingEmail =
      order.billingEmailAlt ||
      parsedRawMeta._billing_department_email ||
      resolvedCustomer.email ||
      null;
    const vatNumber = parsedRawMeta._billing_vat_number || parsedRawMeta._billing_yweu_vat || null;

    return NextResponse.json({
      id: orderPk,
      orderNumber: orderPk.toString(),
      date: order.createdAt,
      status: order.statusLabel || 'In behandeling',
      statusCode: order.statusCode || null,
      unit: order.journeyLabel || 'Voices',
      journeyCode: order.journeyCode || null,
      
      // 🚦 ACTION-DRIVEN LOGIC (Punt 3 Scope)
      actions: {
        needsPO: statusCode === 'waiting_po' || (!purchaseOrder && ['agency_vo', 'agency_ivr', 'agency_commercial'].includes(order.journeyCode || '')),
        canGeneratePaymentLink: ['pending', 'unpaid', 'awaiting_payment', 'waiting_po', 'failed'].includes(statusCode),
        isYukiReady: !!order.amountTotal && ['completed', 'completed_paid', 'paid'].includes(statusCode),
        hasDropboxAssets: !!parsedRawMeta['order-download'] || !!parsedRawMeta._dropbox_order_folder_path,
        hasRecordingSessions: recordingRows.length > 0,
      },

      customer: {
        id: resolvedCustomer.id,
        name: `${resolvedCustomer.first_name || ''} ${resolvedCustomer.last_name || ''}`.trim() || 'Guest',
        email: resolvedCustomer.email,
        company: resolvedCustomer.companyName,
        vat: vatNumber,
      },

      billing: {
        email: billingEmail,
        purchaseOrder,
        invoiceNumber: parsedRawMeta._invoice_number || null,
        transactionId: parsedRawMeta._transaction_id || parsedRawMeta._mollie_payment_id || null,
      },

      finance: {
        net: totalNet.toFixed(2),
        vat: (totalRevenue - totalNet).toFixed(2),
        total: totalRevenue.toFixed(2),
        cost: totalCost.toFixed(2),
        margin: margin.toFixed(2),
        marginPercentage: `${marginPercentage}%`,
        method: order.paymentLabel || 'Online betaling'
      },

      production: {
        items: formattedItems,
        briefing: {
          text: briefingText,
          hasInstructions: hasRegieInstructions,
          audioLink: audioBriefingLink,
        },
        participants,
        recordingSessions: recordingRows.map((row: any) => ({
          id: Number(row.id),
          orderItemId: row.order_item_id ? Number(row.order_item_id) : null,
          status: row.status || 'active',
          createdAt: row.created_at || null,
        })),
      },

      technical: {
        sourceId: legacyInternalId,
        sourceOrderId,
        userId: userId,
        metaKeyCount: Object.keys(parsedRawMeta || {}).length,
        meta: parsedRawMeta,
      },
      integration: {
        dropboxFolderPath: parsedRawMeta._dropbox_order_folder_path || null,
        orderDownloadUrl: parsedRawMeta['order-download'] || null,
      },
    });

  } catch (error: any) {
    console.error('[Admin Order Detail GET] Critical Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
