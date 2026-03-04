import { requireAdmin } from '@/lib/auth/api-auth';
import { NextRequest, NextResponse } from 'next/server';
import {
  db,
  journeys,
  orderItems,
  orderNotes,
  orderStatuses,
  orders,
  ordersV2,
  paymentMethods,
  users,
  workshopEditions,
  workshops,
  locations,
} from '@/lib/system/voices-config';
import { desc, eq, inArray, sql } from 'drizzle-orm';
import { MollieService } from '@/lib/payments/mollie';
import { MarketManagerServer as MarketManager } from '@/lib/system/core/market-manager';
import { VoicesMailEngine } from '@/lib/services/voices-mail-engine';
import { localeToShort, normalizeLocale } from '@/lib/system/locale-utils';
import { sign } from 'jsonwebtoken';

export const dynamic = 'force-dynamic';

type InvitePayload = {
  participant_first_name?: string;
  participant_last_name?: string;
  participant_email?: string;
  participant_phone?: string;
  participant_age?: number | string;
  participant_profession?: string;
  participant_experience?: string;
  participant_goal?: string;
  billing_email?: string;
  billing_company?: string;
  billing_vat_number?: string;
  purchase_order?: string;
  internal_note?: string;
  language?: string;
  price_override?: number | string;
};

function sanitizeString(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

function parsePositiveAmount(value: unknown): number | null {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed <= 0) return null;
  return Math.round(parsed * 100) / 100;
}

function toIntOrNull(value: unknown): number | null {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? Math.round(parsed) : null;
}

function currency(value: number): string {
  return new Intl.NumberFormat('nl-BE', { style: 'currency', currency: 'EUR' }).format(value);
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const auth = await requireAdmin();
  if (auth instanceof NextResponse) return auth;

  const editionId = Number(String(params.id || '').replace(/\/$/, ''));
  if (!Number.isFinite(editionId)) {
    return NextResponse.json({ error: 'Invalid workshop edition id.' }, { status: 400 });
  }

  let payload: InvitePayload;
  try {
    payload = (await request.json()) as InvitePayload;
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body.' }, { status: 400 });
  }

  const participantFirstName = sanitizeString(payload.participant_first_name);
  const participantLastName = sanitizeString(payload.participant_last_name);
  const participantEmail = sanitizeString(payload.participant_email).toLowerCase();
  const participantPhone = sanitizeString(payload.participant_phone);
  const participantProfession = sanitizeString(payload.participant_profession);
  const participantExperience = sanitizeString(payload.participant_experience);
  const participantGoal = sanitizeString(payload.participant_goal);
  const billingEmail = sanitizeString(payload.billing_email).toLowerCase();
  const billingCompany = sanitizeString(payload.billing_company);
  const billingVatNumber = sanitizeString(payload.billing_vat_number).toUpperCase();
  const purchaseOrder = sanitizeString(payload.purchase_order);
  const internalNote = sanitizeString(payload.internal_note);
  const normalizedLanguage = normalizeLocale(payload.language || 'nl-BE');
  const languageShort = localeToShort(normalizedLanguage);

  if (!participantFirstName || !participantLastName || !participantEmail) {
    return NextResponse.json(
      { error: 'participant_first_name, participant_last_name en participant_email zijn verplicht.' },
      { status: 400 }
    );
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(participantEmail)) {
    return NextResponse.json({ error: 'participant_email is ongeldig.' }, { status: 400 });
  }

  const [editionRow] = await db
    .select({
      id: workshopEditions.id,
      date: workshopEditions.date,
      status: workshopEditions.status,
      price: workshopEditions.price,
      workshopId: workshopEditions.workshopId,
      workshopTitle: workshops.title,
      workshopPrice: workshops.price,
      locationName: locations.name,
      locationCity: locations.city,
    })
    .from(workshopEditions)
    .leftJoin(workshops, eq(workshops.id, workshopEditions.workshopId))
    .leftJoin(locations, eq(locations.id, workshopEditions.locationId))
    .where(eq(workshopEditions.id, editionId))
    .limit(1);

  if (!editionRow) {
    return NextResponse.json({ error: 'Workshop editie niet gevonden.' }, { status: 404 });
  }

  if (String(editionRow.status || '').toLowerCase() === 'cancelled') {
    return NextResponse.json({ error: 'Deze editie is geannuleerd.' }, { status: 400 });
  }

  const baseNetAmount =
    parsePositiveAmount(payload.price_override) ||
    parsePositiveAmount(editionRow.price) ||
    parsePositiveAmount(editionRow.workshopPrice);

  if (!baseNetAmount) {
    return NextResponse.json({ error: 'Geen geldige workshopprijs gevonden.' }, { status: 400 });
  }

  const isVatExempt = !!billingVatNumber && !billingVatNumber.startsWith('BE');
  const taxRate = isVatExempt ? 0 : 0.21;
  const amountNet = Math.round(baseNetAmount * 100) / 100;
  const amountTax = Math.round(amountNet * taxRate * 100) / 100;
  const amountTotal = Math.round((amountNet + amountTax) * 100) / 100;

  const workshopLabel = sanitizeString(editionRow.workshopTitle) || 'Workshop';
  const editionDateLabel = editionRow.date
    ? new Date(editionRow.date).toLocaleDateString('nl-BE', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
      })
    : 'n.t.b.';
  const locationLabel = [editionRow.locationName, editionRow.locationCity]
    .map((part) => sanitizeString(part))
    .filter(Boolean)
    .join(' • ');

  const [existingUser] = await db
    .select({
      id: users.id,
      email: users.email,
    })
    .from(users)
    .where(sql`lower(${users.email}) = lower(${participantEmail})`)
    .orderBy(desc(users.id))
    .limit(1);

  let userId = existingUser?.id ? Number(existingUser.id) : null;
  if (!userId) {
    const [newUser] = await db
      .insert(users)
      .values({
        email: participantEmail,
        first_name: participantFirstName,
        last_name: participantLastName,
        phone: participantPhone || null,
        companyName: billingCompany || null,
        vatNumber: billingVatNumber || null,
        role: 'customer',
        journeyState: 'prospect',
        createdAt: new Date(),
      })
      .returning({ id: users.id });
    userId = Number(newUser.id);
  }

  const maxWpRows = await db
    .select({ wpOrderId: orders.wpOrderId })
    .from(orders)
    .orderBy(sql`${orders.wpOrderId} desc`)
    .limit(1);
  const maxWpOrderId = Number(maxWpRows[0]?.wpOrderId || 0);
  const uniqueWpId = Math.max(maxWpOrderId + 1, 310001);

  const [statusRow, journeyRow, paymentRow] = await Promise.all([
    db
      .select({ id: orderStatuses.id })
      .from(orderStatuses)
      .where(inArray(orderStatuses.code, ['awaiting_payment', 'pending', 'unpaid']))
      .limit(1)
      .then((rows: any[]) => rows[0] || null),
    db
      .select({ id: journeys.id })
      .from(journeys)
      .where(inArray(journeys.code, ['studio']))
      .limit(1)
      .then((rows: any[]) => rows[0] || null),
    db
      .select({ id: paymentMethods.id })
      .from(paymentMethods)
      .where(inArray(paymentMethods.code, ['mollie_bancontact', 'mollie_ideal', 'mollie_banktransfer']))
      .limit(1)
      .then((rows: any[]) => rows[0] || null),
  ]);

  const [createdOrder] = await db
    .insert(orders)
    .values({
      wpOrderId: uniqueWpId,
      user_id: userId,
      worldId: 2,
      journeyId: journeyRow?.id || null,
      statusId: statusRow?.id || null,
      paymentMethodId: paymentRow?.id || null,
      total: amountTotal.toFixed(2),
      tax: amountTax.toFixed(2),
      amountNet: amountNet.toFixed(2),
      purchaseOrder: purchaseOrder || null,
      billingEmailAlt: billingEmail || null,
      billingVatNumber: billingVatNumber || null,
      status: 'pending',
      journey: 'studio',
      market: 'BE',
      isQuote: false,
      quoteMessage: null,
      is_manually_edited: true,
      rawMeta: {
        source: 'admin_workshop_payment_invite',
        language: normalizedLanguage,
        workshop: {
          edition_id: editionId,
          title: workshopLabel,
          date: editionDateLabel,
          location: locationLabel || null,
        },
        participant: {
          first_name: participantFirstName,
          last_name: participantLastName,
          email: participantEmail,
          phone: participantPhone || null,
          age: toIntOrNull(payload.participant_age),
          profession: participantProfession || null,
          experience: participantExperience || null,
          goal: participantGoal || null,
        },
        billing: {
          email: billingEmail || null,
          company: billingCompany || null,
          vat_number: billingVatNumber || null,
          purchase_order: purchaseOrder || null,
        },
        internal_note: internalNote || null,
      },
      createdAt: new Date(),
    })
    .returning({ id: orders.id });

  await db.insert(orderItems).values({
    orderId: Number(createdOrder.id),
    editionId,
    name: `Workshop • ${workshopLabel}`,
    quantity: 1,
    price: amountNet.toFixed(2),
    tax: amountTax.toFixed(2),
    deliveryStatus: 'waiting',
    metaData: {
      item_type: 'workshop_edition',
      workshop: {
        edition_id: editionId,
        title: workshopLabel,
        date: editionDateLabel,
        location: locationLabel || null,
      },
      participant_info: {
        first_name: participantFirstName,
        last_name: participantLastName,
        email: participantEmail,
        phone: participantPhone || null,
        age: toIntOrNull(payload.participant_age),
        profession: participantProfession || null,
        experience: participantExperience || null,
        goal: participantGoal || null,
      },
      billing_info: {
        billing_email: billingEmail || null,
        billing_company: billingCompany || null,
        billing_vat_number: billingVatNumber || null,
      },
      invited_via: 'admin_mail_link',
    },
    is_manually_edited: true,
    createdAt: new Date(),
  });

  await db.insert(ordersV2).values({
    id: uniqueWpId,
    userId,
    worldId: 2,
    journeyId: journeyRow?.id || null,
    statusId: statusRow?.id || null,
    paymentMethodId: paymentRow?.id || null,
    amountNet: amountNet.toFixed(2),
    amountTotal: amountTotal.toFixed(2),
    purchaseOrder: purchaseOrder || null,
    billingEmailAlt: billingEmail || null,
    createdAt: new Date(),
    legacyInternalId: Number(createdOrder.id),
  });

  await db.insert(orderNotes).values({
    orderId: Number(createdOrder.id),
    note: `Workshop betaaluitnodiging aangemaakt door admin voor ${participantEmail}.`,
    isCustomerNote: false,
  });

  const host = request.headers.get('host') || MarketManager.getMarketDomains()['BE']?.replace('https://', '');
  const market = MarketManager.getCurrentMarket(host || 'www.voices.be');
  const siteUrl =
    MarketManager.getMarketDomains()[market.market_code] ||
    `https://${host || MarketManager.getMarketDomains()['BE']?.replace('https://', '') || 'www.voices.be'}`;

  const token = sign(
    {
      userId,
      orderId: Number(createdOrder.id),
      email: participantEmail,
    },
    process.env.JWT_SECRET || 'voices-secret-2026',
    { expiresIn: '7d' }
  );

  const payment = await MollieService.createPayment({
    amount: {
      currency: 'EUR',
      value: amountTotal.toFixed(2),
    },
    description: `Workshop inschrijving #${uniqueWpId}`,
    redirectUrl: `${siteUrl}/api/auth/magic-login?token=${token}&redirect=/account/orders?orderId=${Number(createdOrder.id)}`,
    webhookUrl: `${siteUrl}/api/checkout/webhook`,
    metadata: {
      orderId: Number(createdOrder.id),
      user_id: userId,
      email: billingEmail || participantEmail,
      company: billingCompany || null,
      givenName: participantFirstName,
      familyName: participantLastName,
      language: normalizedLanguage,
      kind: 'workshop_invite',
    },
  });

  await db.insert(orderNotes).values({
    orderId: Number(createdOrder.id),
    note: `Workshop betaallink gegenereerd (${payment.id}).`,
    isCustomerNote: false,
  });

  const recipientEmail = billingEmail || participantEmail;
  const mailEngine = VoicesMailEngine.getInstance();
  const subject =
    languageShort === 'fr'
      ? `Invitation paiement workshop #${uniqueWpId}`
      : languageShort === 'en'
        ? `Workshop payment invite #${uniqueWpId}`
        : `Workshop betaaluitnodiging #${uniqueWpId}`;

  const title =
    languageShort === 'fr'
      ? 'Votre inscription est prête'
      : languageShort === 'en'
        ? 'Your registration is ready'
        : 'Je workshopinschrijving staat klaar';

  const body =
    languageShort === 'fr'
      ? `
        Bonjour ${participantFirstName},<br/><br/>
        Votre place est réservée provisoirement. Finalisez votre inscription via le lien ci-dessous.<br/><br/>
        <strong>Aperçu:</strong><br/>
        Workshop: ${workshopLabel}<br/>
        Date: ${editionDateLabel}<br/>
        Lieu: ${locationLabel || 'n.t.b.'}<br/>
        Participant: ${participantFirstName} ${participantLastName}<br/>
        Montant HTVA: ${currency(amountNet)}<br/>
        TVA: ${currency(amountTax)}<br/>
        Total: <strong>${currency(amountTotal)}</strong><br/><br/>
        Après paiement, vous recevrez automatiquement la confirmation.
      `
      : languageShort === 'en'
        ? `
          Hi ${participantFirstName},<br/><br/>
          Your seat is provisionally reserved. Complete your registration using the payment link below.<br/><br/>
          <strong>Overview:</strong><br/>
          Workshop: ${workshopLabel}<br/>
          Date: ${editionDateLabel}<br/>
          Location: ${locationLabel || 'TBD'}<br/>
          Participant: ${participantFirstName} ${participantLastName}<br/>
          Net amount: ${currency(amountNet)}<br/>
          VAT: ${currency(amountTax)}<br/>
          Total: <strong>${currency(amountTotal)}</strong><br/><br/>
          After payment, you will automatically receive confirmation.
        `
        : `
          Dag ${participantFirstName},<br/><br/>
          Je plek is voorlopig gereserveerd. Rond je inschrijving af via de betaallink hieronder.<br/><br/>
          <strong>Overzicht:</strong><br/>
          Workshop: ${workshopLabel}<br/>
          Datum: ${editionDateLabel}<br/>
          Locatie: ${locationLabel || 'n.t.b.'}<br/>
          Deelnemer: ${participantFirstName} ${participantLastName}<br/>
          Bedrag excl. btw: ${currency(amountNet)}<br/>
          Btw: ${currency(amountTax)}<br/>
          Totaal: <strong>${currency(amountTotal)}</strong><br/><br/>
          Na betaling ontvang je automatisch de bevestiging.
        `;

  await mailEngine.sendVoicesMail({
    to: recipientEmail,
    subject,
    title,
    body,
    buttonText:
      languageShort === 'fr'
        ? 'Payer maintenant'
        : languageShort === 'en'
          ? 'Pay now'
          : 'Nu betalen',
    buttonUrl: payment._links?.checkout?.href || undefined,
    host: host || undefined,
    lang: normalizedLanguage,
    marketName: market.name || 'Voices',
  });

  await db.insert(orderNotes).values({
    orderId: Number(createdOrder.id),
    note: `Workshop betaalmail verzonden naar ${recipientEmail}.`,
    isCustomerNote: false,
  });

  return NextResponse.json({
    success: true,
    orderId: Number(createdOrder.id),
    wpOrderId: uniqueWpId,
    checkoutUrl: payment._links?.checkout?.href || null,
    emailedTo: recipientEmail,
  });
}
