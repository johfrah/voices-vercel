import { db, ordersV2, users, ordersLegacyBloat, orderStatuses, paymentMethods, journeys, orders } from '@/lib/system/voices-config';
import { eq, sql } from 'drizzle-orm';
import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth/api-auth';

export const dynamic = 'force-dynamic';

const STATUS_WORKFLOW_MAP: Record<
  string,
  {
    title: string;
    adminAction: string;
    customerImpact: string;
  }
> = {
  quote_sent: {
    title: 'Offerte klaar voor klantbevestiging',
    adminAction: 'Wacht op akkoord, update pas naar betaal- of leverstatus na bevestiging.',
    customerImpact: 'Klant ontvangt/raadpleegt offerte, nog geen productie.',
  },
  waiting_po: {
    title: 'Wacht op PO-nummer',
    adminAction: 'Vraag PO op en houd productie on hold tot PO intern bevestigd is.',
    customerImpact: 'Klant moet PO bezorgen voor verdere afhandeling.',
  },
  awaiting_payment: {
    title: 'Wacht op betaling',
    adminAction: 'Volg betaling op en stuur indien nodig een betaallink.',
    customerImpact: 'Bestelling staat klaar, levering wacht op financiële vrijgave.',
  },
  unpaid: {
    title: 'Onbetaald',
    adminAction: 'Escalatie op openstaand bedrag, controleer betaalmethode en dunningflow.',
    customerImpact: 'Order blijft geblokkeerd tot betaling verwerkt is.',
  },
  completed_unpaid: {
    title: 'Geleverd maar nog onbetaald',
    adminAction: 'Levering is gebeurd; volg openstaande factuur strikt op.',
    customerImpact: 'Klant ontving levering, maar betaling staat nog open.',
  },
  completed: {
    title: 'Voltooid',
    adminAction: 'Order administratief afgerond, controleer uitbetaling en archivering.',
    customerImpact: 'Bestelling is volledig afgewerkt.',
  },
  completed_paid: {
    title: 'Voltooid en betaald',
    adminAction: 'Flow volledig rond: levering, betaling, boekhouding en payout kunnen sluiten.',
    customerImpact: 'Alles is afgerond zonder open acties.',
  },
  refunded: {
    title: 'Terugbetaald',
    adminAction: 'Controleer refund-bewijs, noteer reden en sluit order met audit trail.',
    customerImpact: 'Klant kreeg terugbetaling volgens afgesproken scope.',
  },
};

const PAYMENT_METHOD_MAP: Record<string, string> = {
  mollie_bancontact: 'Online Bancontact-flow (directe PSP-statussync).',
  mollie_ideal: 'Online iDEAL-flow (directe PSP-statussync).',
  mollie_banktransfer: 'Mollie overschrijving (trager, eerst betaling detecteren).',
  manual_invoice: 'Factuurflow via PO/boekhouding (manuele opvolging vereist).',
};

const STATUS_SORT_ORDER = [
  'quote_sent',
  'waiting_po',
  'awaiting_payment',
  'unpaid',
  'completed_unpaid',
  'completed',
  'completed_paid',
  'refunded',
];

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
      worldId: ordersV2.worldId,
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
      legacyRawMeta: orders.rawMeta,
      statusCode: orderStatuses.code,
      statusLabel: orderStatuses.label,
      paymentCode: paymentMethods.code,
      paymentLabel: paymentMethods.label,
      journeyCode: journeys.code,
      journeyLabel: journeys.label,
    })
    .from(ordersV2)
    .leftJoin(ordersLegacyBloat, eq(ordersV2.id, ordersLegacyBloat.wpOrderId))
    .leftJoin(orders, eq(orders.id, ordersV2.legacyInternalId))
    .leftJoin(orderStatuses, eq(ordersV2.statusId, orderStatuses.id))
    .leftJoin(paymentMethods, eq(ordersV2.paymentMethodId, paymentMethods.id))
    .leftJoin(journeys, eq(ordersV2.journeyId, journeys.id))
    .where(eq(ordersV2.id, id))
    .limit(1);

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    const [statusCatalogRows, paymentCatalogRows] = await Promise.all([
      db
        .select({
          id: orderStatuses.id,
          code: orderStatuses.code,
          label: orderStatuses.label,
        })
        .from(orderStatuses),
      db
        .select({
          id: paymentMethods.id,
          code: paymentMethods.code,
          label: paymentMethods.label,
        })
        .from(paymentMethods),
    ]);

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
        rs.id,
        rs.order_id,
        rs.order_item_id,
        rs.status,
        rs.conversation_id,
        rs.settings,
        rs.created_at,
        (
          select count(*)
          from recording_scripts scr
          where scr.session_id = rs.id
        ) as scripts_count,
        (
          select count(*)
          from recording_feedback fb
          where fb.session_id = rs.id
        ) as feedback_count
      from recording_sessions rs
      where rs.order_id = ${sourceOrderId}
      order by rs.created_at desc
      limit 20
    `).catch(() => []);
    const recordingRows: any[] = Array.isArray(recordingRowsRaw) ? recordingRowsRaw : ((recordingRowsRaw as any)?.rows || []);

    const notesRowsRaw = await db.execute(sql`
      select id, note, is_customer_note, created_at
      from order_notes
      where order_id = ${sourceOrderId}
      order by created_at desc
      limit 50
    `).catch(() => []);
    const notesRows: any[] = Array.isArray(notesRowsRaw) ? notesRowsRaw : ((notesRowsRaw as any)?.rows || []);

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
    const rawMeta = order.rawMeta || order.legacyRawMeta || {};
    const tryParseJson = (value: string) => {
      try {
        return JSON.parse(value);
      } catch {
        return null;
      }
    };
    const decodeCharMap = (value: any): string | null => {
      if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
      const keys = Object.keys(value);
      if (keys.length < 20) return null;
      const numericKeys = keys.filter((key) => /^\d+$/.test(key));
      if (numericKeys.length < Math.ceil(keys.length * 0.9)) return null;
      const joined = numericKeys
        .map((key) => Number(key))
        .sort((a, b) => a - b)
        .map((index) => {
          const chunk = value[String(index)];
          return typeof chunk === 'string' ? chunk : '';
        })
        .join('');
      return joined.trim() ? joined : null;
    };
    const parseJson = (value: any): any => {
      if (value === null || value === undefined) return {};
      if (typeof value === 'string') {
        const parsed = tryParseJson(value.trim());
        if (parsed === null) return {};
        if (typeof parsed === 'string') {
          const nested = tryParseJson(parsed);
          return nested === null ? {} : parseJson(nested);
        }
        return parseJson(parsed);
      }
      if (Array.isArray(value)) return value;
      if (typeof value === 'object') {
        const decoded = decodeCharMap(value);
        if (decoded) {
          const parsedDecoded = tryParseJson(decoded);
          if (parsedDecoded !== null) {
            return parseJson(parsedDecoded);
          }
        }
        return value;
      }
      return {};
    };
    const firstString = (...values: any[]): string => {
      for (const value of values) {
        if (typeof value === 'string' && value.trim()) return value.trim();
      }
      return '';
    };
    const toNumberOrNull = (value: any): number | null => {
      const parsed = Number(value);
      return Number.isFinite(parsed) ? parsed : null;
    };
    const toBooleanOrNull = (value: any): boolean | null => {
      if (typeof value === 'boolean') return value;
      if (typeof value === 'number') return value > 0;
      if (typeof value === 'string') {
        const normalized = value.trim().toLowerCase();
        if (!normalized) return null;
        if (['1', 'true', 'yes', 'ja', 'y'].includes(normalized)) return true;
        if (['0', 'false', 'no', 'nee', 'n'].includes(normalized)) return false;
      }
      return null;
    };
    const toStringArray = (value: any): string[] => {
      if (Array.isArray(value)) return value.map((entry) => String(entry || '').trim()).filter(Boolean);
      if (typeof value === 'string') {
        const trimmed = value.trim();
        if (!trimmed) return [];
        const parsed = tryParseJson(trimmed);
        if (Array.isArray(parsed)) return parsed.map((entry) => String(entry || '').trim()).filter(Boolean);
        if (trimmed.includes(',')) return trimmed.split(',').map((entry) => entry.trim()).filter(Boolean);
        return [trimmed];
      }
      return [];
    };
    const normalizeLink = (value: any): string | null => {
      if (typeof value !== 'string') return null;
      const trimmed = value.trim();
      if (!trimmed) return null;
      if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) return trimmed;
      return null;
    };
    const collectLinks = (...values: any[]): string[] => {
      const links = new Set<string>();
      const pushValue = (candidate: any) => {
        if (Array.isArray(candidate)) {
          candidate.forEach(pushValue);
          return;
        }
        if (candidate && typeof candidate === 'object') {
          Object.values(candidate).forEach(pushValue);
          return;
        }
        const normalized = normalizeLink(candidate);
        if (normalized) links.add(normalized);
      };
      values.forEach(pushValue);
      return Array.from(links);
    };
    const parsedRawMeta: any = parseJson(rawMeta);
    const statusCode = (order.statusCode || '').toLowerCase();
    const statusCatalog = [...statusCatalogRows]
      .sort((a: any, b: any) => {
        const aIndex = STATUS_SORT_ORDER.indexOf(String(a.code || '').toLowerCase());
        const bIndex = STATUS_SORT_ORDER.indexOf(String(b.code || '').toLowerCase());
        const normalizedA = aIndex === -1 ? 999 : aIndex;
        const normalizedB = bIndex === -1 ? 999 : bIndex;
        if (normalizedA !== normalizedB) return normalizedA - normalizedB;
        return String(a.label || '').localeCompare(String(b.label || ''));
      })
      .map((row: any) => {
        const code = String(row.code || '').toLowerCase();
        const workflow = STATUS_WORKFLOW_MAP[code] || {
          title: row.label || code || 'Onbekende status',
          adminAction: 'Geen specifieke workflow geconfigureerd.',
          customerImpact: 'Geen specifieke klantimpact geconfigureerd.',
        };
        return {
          id: Number(row.id),
          code,
          label: row.label || code,
          title: workflow.title,
          adminAction: workflow.adminAction,
          customerImpact: workflow.customerImpact,
        };
      });
    const paymentMethodCatalog = paymentCatalogRows
      .map((row: any) => {
        const code = String(row.code || '').toLowerCase();
        return {
          id: Number(row.id),
          code,
          label: row.label || code,
          behavior: PAYMENT_METHOD_MAP[code] || 'Geen specifieke betaalflow geconfigureerd.',
        };
      })
      .sort((a: any, b: any) => a.label.localeCompare(b.label));
    const currentStatus =
      statusCatalog.find((entry: any) => entry.code === statusCode) ||
      statusCatalog.find((entry: any) => entry.id === Number(order.statusId || 0)) ||
      null;
    const currentPaymentMethod =
      paymentMethodCatalog.find((entry: any) => entry.id === Number(order.paymentMethodId || 0)) || null;
    const orderBriefingFallback = firstString(
      parsedRawMeta.briefing,
      parsedRawMeta._billing_wo_briefing,
      parsedRawMeta._billing_order_comments,
      parsedRawMeta.script,
      parsedRawMeta._billing_wo_script
    );
    const orderNotesFallback = firstString(
      parsedRawMeta.instructions,
      parsedRawMeta.notes,
      parsedRawMeta.regie,
      parsedRawMeta._billing_wo_notes
    );
    const orderAudioFallback = firstString(
      parsedRawMeta.audiobriefing,
      parsedRawMeta._billing_wo_audio_url,
      parsedRawMeta.audio_briefing,
      parsedRawMeta.audioBriefing
    );
    const orderAttachmentFallback = collectLinks(
      parsedRawMeta.attachments,
      parsedRawMeta.attachment,
      parsedRawMeta.attachment_url,
      parsedRawMeta.files,
      parsedRawMeta.file,
      parsedRawMeta._billing_wo_attachment_url
    );

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
      const isVoiceItem = !!item.actor_id;
      const itemScript = firstString(
        itemMeta?.script,
        itemMeta?.briefing,
        itemMeta?.copy,
        itemMeta?.text,
        isVoiceItem ? orderBriefingFallback : ''
      );
      const itemNotes = firstString(
        itemMeta?.instructions,
        itemMeta?.notes,
        itemMeta?.regie,
        itemMeta?.comment,
        isVoiceItem ? orderNotesFallback : ''
      );
      const audioBriefingUrl = firstString(
        itemMeta?.audiobriefing,
        itemMeta?.audio_briefing,
        itemMeta?.audio_briefing_url,
        itemMeta?.audio_url,
        isVoiceItem ? orderAudioFallback : ''
      );
      const attachments = collectLinks(
        itemMeta?.attachments,
        itemMeta?.attachment,
        itemMeta?.attachment_url,
        itemMeta?.files,
        itemMeta?.file,
        isVoiceItem ? orderAttachmentFallback : []
      );
      const mediaValues = toStringArray(itemMeta?.media || itemMeta?.media_types || itemMeta?.mediaTypes);
      const usageValue = firstString(itemMeta?.usage, itemMeta?.usage_type, itemMeta?.usageType, parsedRawMeta?.usage);
      const journeyValue = firstString(itemMeta?.journey, order.journeyCode);
      const liveSessionValue =
        toBooleanOrNull(itemMeta?.live_session ?? itemMeta?.liveSession ?? itemMeta?.live_regie ?? itemMeta?.liveRegie);
      const scriptWordCount = itemScript
        ? itemScript
            .replace(/\s+/g, ' ')
            .trim()
            .split(' ')
            .filter(Boolean).length
        : 0;
      const hasItemContext =
        !!itemScript ||
        !!itemNotes ||
        !!audioBriefingUrl ||
        attachments.length > 0 ||
        mediaValues.length > 0 ||
        !!usageValue ||
        liveSessionValue !== null;

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
        briefing: {
          script: itemScript || null,
          notes: itemNotes || null,
          audioBriefingUrl: audioBriefingUrl || null,
          attachments,
        },
        pricingContext: {
          words: scriptWordCount || null,
          usage: usageValue || null,
          media: mediaValues,
          spots: toNumberOrNull(itemMeta?.spots ?? itemMeta?.spot_count),
          years: toNumberOrNull(itemMeta?.years ?? itemMeta?.usage_years),
          journey: journeyValue || null,
          liveSession: liveSessionValue,
          countryId: toNumberOrNull(itemMeta?.country_id ?? itemMeta?.countryId),
          languageId: toNumberOrNull(itemMeta?.language_id ?? itemMeta?.languageId),
        },
        hasItemContext,
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
        typeof item.briefing?.script === 'string' ? item.briefing.script.trim() : '',
        typeof item.briefing?.notes === 'string' ? item.briefing.notes.trim() : '',
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
    const audioBriefingLink =
      formattedItems.map((item: any) => item.briefing?.audioBriefingUrl).find(Boolean) ||
      orderAudioFallback ||
      null;

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
      statusManager: {
        current: currentStatus,
        available: statusCatalog,
      },
      
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
        method: order.paymentLabel || 'Online betaling',
        paymentMethod: currentPaymentMethod,
        paymentMethodId: order.paymentMethodId ? Number(order.paymentMethodId) : null,
        paymentCatalog: paymentMethodCatalog,
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
          conversationId: row.conversation_id ? Number(row.conversation_id) : null,
          scriptsCount: Number(row.scripts_count || 0),
          feedbackCount: Number(row.feedback_count || 0),
          hasSettings: !!parseJson(row.settings) && Object.keys(parseJson(row.settings) || {}).length > 0,
          createdAt: row.created_at || null,
        })),
        recordingSummary: {
          total: recordingRows.length,
          withScripts: recordingRows.filter((row: any) => Number(row.scripts_count || 0) > 0).length,
          withFeedback: recordingRows.filter((row: any) => Number(row.feedback_count || 0) > 0).length,
        },
      },

      timeline: {
        notes: notesRows.map((row: any) => ({
          id: Number(row.id),
          note: row.note || '',
          isCustomerNote: !!row.is_customer_note,
          createdAt: row.created_at || null,
        })),
      },

      technical: {
        sourceId: legacyInternalId,
        sourceOrderId,
        userId: userId,
        worldId: order.worldId ? Number(order.worldId) : null,
        journeyId: order.journeyId ? Number(order.journeyId) : null,
        statusId: order.statusId ? Number(order.statusId) : null,
        paymentMethodId: order.paymentMethodId ? Number(order.paymentMethodId) : null,
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
