import { VatService } from '@/lib/compliance/vat-service';
import { LexCheck } from '@/lib/compliance/lex-check';
import { db } from '@db';
import { orders, users, centralLeads, actors, notifications, orderItems } from '@db/schema';
import { eq, inArray } from 'drizzle-orm';
import { sign } from 'jsonwebtoken';
import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import { MarketManagerServer as MarketManager } from '@/lib/system/market-manager-server';
import { MollieService } from '@/lib/payments/mollie';
import { SlimmeKassa } from '@/lib/engines/pricing-engine';
import { generateCartHash } from '@/lib/utils/cart-utils';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { CheckoutPayloadSchema } from '@/lib/validation/checkout-schema';

/**
 * HEADLESS CHECKOUT SUBMIT HANDLER (2026)
 * 
 * Beheert zowel Mollie betalingen als Factuur/Offerte aanvragen.
 * 
 * CHRIS-PROTOCOL: Structural Integrity & Type Safety.
 */

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const sdkClient = createSupabaseClient(supabaseUrl, supabaseKey);

export async function POST(request: Request) {
  try {
    const headersList = headers();
    const host = headersList.get('host') || 'www.voices.be';
    const protocol = host.includes('localhost') ? 'http' : 'https';
    const baseUrl = `${protocol}://${host}`;
    const ip = headersList.get('x-forwarded-for') || 'unknown';

    // 🛡️ CHRIS-PROTOCOL: Structural Validation with Coercion (v2.14.256)
    const rawBody = await request.json();
    
    // Deep Trace Logging: Log types before validation
    console.log('[Checkout] 🔍 TRACE (Pre-Validation):', {
      totalType: typeof rawBody.pricing?.total,
      actorIdType: typeof rawBody.selectedActor?.id,
      itemsCount: rawBody.items?.length
    });

    const validation = CheckoutPayloadSchema.safeParse(rawBody);

    if (!validation.success) {
      console.error('[Checkout] Validation failed:', validation.error.format());
      return NextResponse.json({ 
        error: 'Ongeldige bestelgegevens', 
        details: validation.error.format() 
      }, { status: 400 });
    }

    const data = validation.data;

    // Deep Trace Logging: Log types after validation (should be coerced to numbers)
    console.log('[Checkout] ✅ TRACE (Post-Validation):', {
      totalType: typeof data.pricing.total,
      actorIdType: typeof data.selectedActor?.id,
      totalValue: data.pricing.total
    });

    const { 
      pricing, 
      items,
      selectedActor,
      step,
      first_name, 
      last_name, 
      email, 
      vat_number, 
      postal_code, 
      city, 
      metadata,
      quoteMessage,
      phone,
      company,
      address_street,
      usage,
      plan,
      music,
      country,
      payment_method,
    } = data;

    // 2. Voorbereiding van data
    const actorIds = Array.from(new Set([
      ...(items || []).map((i: any) => i.actor?.id).filter(Boolean),
      ...(selectedActor?.id ? [selectedActor.id] : [])
    ]));

    const isSubscription = usage === 'subscription';
    const isVatExempt = false; // TODO: Implement real VAT check
    const taxRate = isVatExempt ? 0 : 0.21;

    // 3. Fetch Actor Data voor prijsvalidatie
    let dbActors: any[] = [];
    if (actorIds.length > 0) {
      try {
        console.log('[Checkout] 🔍 DB Fetch Actors:', actorIds);
        dbActors = await db.select().from(actors).where(inArray(actors.id, actorIds)).catch(async (err: any) => {
          console.warn('[Checkout] ⚠️ Drizzle fetch failed, using SDK:', err.message);
          const { data, error: sdkErr } = await sdkClient.from('actors').select('*').in('id', actorIds);
          if (sdkErr) throw sdkErr;
          return data || [];
        });
        console.log('[Checkout] ✅ DB Fetch Success, count:', dbActors.length);
      } catch (dbErr: any) {
        console.error('[Checkout] ❌ Actor fetch fatal:', dbErr.message);
        // We gooien de error door om de 500 te debuggen
        throw new Error(`Database fetch failed for actors: ${dbErr.message}`);
      }
    }
    const actorMap = new Map(dbActors.map(a => [a.id, a]));

    // 4. Prijs Validatie (Server-Side)
    let serverCalculatedSubtotal = 0;
    let isQuoteOnly = false;

    const validatedItems = (items || []).map((item: any) => {
      const dbActor = actorMap.get(item.actor?.id);
      if (!dbActor) return item;

      const result = SlimmeKassa.calculate({
        usage: item.usage,
        words: item.briefing?.trim().split(/\s+/).filter(Boolean).length || 0,
        mediaTypes: item.media,
        country: item.country,
        spots: item.spots,
        years: item.years,
        liveSession: item.liveSession,
        actorRates: dbActor as any,
        music: item.music,
        isVatExempt
      });

      if (result.isQuoteOnly) isQuoteOnly = true;
      serverCalculatedSubtotal += result.subtotal;
      return { ...item, pricing: result };
    });

    if (selectedActor && step === 'briefing') {
      const dbActor = actorMap.get(selectedActor.id);
      if (dbActor) {
        const result = SlimmeKassa.calculate({
          usage,
          words: metadata?.words || 0,
          mediaTypes: (rawBody as any).media || [],
          country: (rawBody as any).country || 'BE',
          spots: (rawBody as any).spotsDetail || { [(rawBody as any).media?.[0]]: (rawBody as any).spots || 1 },
          years: (rawBody as any).yearsDetail || { [(rawBody as any).media?.[0]]: (rawBody as any).years || 1 },
          liveSession: (rawBody as any).liveSession || false,
          actorRates: dbActor as any,
          music,
          isVatExempt
        });
        if (result.isQuoteOnly) isQuoteOnly = true;
        serverCalculatedSubtotal += result.subtotal;
      }
    }

    const amount = Math.round(serverCalculatedSubtotal * (1 + taxRate) * 100) / 100;

    // 5. User Management (Lookup/Upsert)
    let userId = metadata?.userId;
    if (email) {
      try {
        const [user] = await db.insert(users).values({
          email,
          firstName: first_name,
          lastName: last_name,
          phone,
          companyName: company,
          vatNumber: vat_number,
          addressStreet: address_street,
          addressZip: postal_code,
          addressCity: city,
          addressCountry: country || 'BE',
          role: 'customer',
          updatedAt: new Date().toISOString()
        }).onConflictDoUpdate({
          target: users.email,
          set: {
            firstName: first_name,
            lastName: last_name,
            phone,
            companyName: company,
            vatNumber: vat_number,
            addressStreet: address_street,
            addressZip: postal_code,
            addressCity: city,
            addressCountry: country || 'BE',
            lastActive: new Date().toISOString()
          }
        }).returning();
        userId = user.id;
      } catch (e) {
        console.error('[Checkout] User upsert failed:', e);
      }
    }

    // 6. Bestelling aanmaken
    const isQuote = isQuoteOnly || (rawBody as any).isQuote;
    const [newOrder] = await db.insert(orders).values({
      wpOrderId: Math.floor(Math.random() * 100000),
      total: amount.toString(),
      status: isQuote ? 'quote-pending' : 'pending',
      userId: userId || null,
      journey: isSubscription ? 'johfrai-subscription' : 'agency',
      billingVatNumber: vat_number || null,
      isQuote: !!isQuote,
      quoteMessage: quoteMessage || null,
      quoteSentAt: isQuote ? new Date().toISOString() : null,
      rawMeta: {
        usage,
        plan,
        isSubscription,
        music,
        items: validatedItems,
        serverCalculated: true
      },
      ipAddress: ip,
      createdAt: new Date().toISOString()
    }).returning();

    // 7. Order Items opslaan
    if (validatedItems.length > 0) {
      try {
        await db.insert(orderItems).values(validatedItems.map((item: any) => ({
          orderId: newOrder.id,
          actorId: item.actor?.id || null,
          name: item.actor?.display_name ? `Stemopname: ${item.actor.display_name}` : (item.name || 'Product'),
          quantity: 1,
          price: (item.pricing?.subtotal || item.pricing?.total || 0).toString(),
          tax: (item.pricing?.tax || 0).toString(),
          metaData: item.pricing || {},
          deliveryStatus: 'waiting'
        })));
      } catch (e) {
        console.error('[Checkout] Failed to save order items:', e);
      }
    }

    // 8. Afhandeling (Mollie vs Factuur)
    const secureToken = sign(
      { orderId: newOrder.id, userId, journey: newOrder.journey, email },
      process.env.JWT_SECRET || 'voices-secret-2026',
      { expiresIn: '24h' }
    );

    const isInvoice = payment_method === 'banktransfer';

    if (isQuote || isInvoice) {
      // Offerte/Factuur flow (Background)
      (async () => {
        try {
          // Admin Notificatie
          await fetch(`${baseUrl}/api/admin/notify`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              type: isQuote ? 'quote_request' : 'banktransfer_order',
              data: {
                orderId: newOrder.id,
                email,
                amount: serverCalculatedSubtotal,
                customer: { firstName: first_name, lastName: last_name }
              }
            })
          });
        } catch (e) {
          console.warn('[Checkout] Background notification failed:', e);
        }
      })();

      return NextResponse.json({
        success: true,
        orderId: newOrder.id,
        token: secureToken,
        isBankTransfer: isInvoice,
        isQuote,
        message: isInvoice ? 'Bestelling ontvangen.' : 'Offerte aangemaakt.'
      });
    }

    // Mollie Flow
    const mollieOrder = await MollieService.createOrder({
      amount: { currency: 'EUR', value: amount.toFixed(2) },
      orderNumber: newOrder.id.toString(),
      lines: validatedItems.map((item: any) => ({
        name: item.actor?.display_name ? `Stemopname: ${item.actor.display_name}` : 'Product',
        quantity: 1,
        unitPrice: { currency: 'EUR', value: (item.pricing?.total || 0).toFixed(2) },
        totalAmount: { currency: 'EUR', value: (item.pricing?.total || 0).toFixed(2) },
        vatRate: '21',
        vatAmount: { currency: 'EUR', value: (item.pricing?.tax || 0).toFixed(2) }
      })),
      billingAddress: {
        streetAndNumber: address_street || 'N/A',
        postalCode: postal_code || 'N/A',
        city: city || 'N/A',
        country: country || 'BE',
        givenName: first_name,
        familyName: last_name,
        email
      },
      redirectUrl: `${baseUrl}/api/auth/magic-login?token=${secureToken}&redirect=/account/orders?orderId=${newOrder.id}`,
      webhookUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/api/checkout/webhook`,
      metadata: { orderId: newOrder.id }
    });

    return NextResponse.json({
      success: true,
      orderId: newOrder.id,
      checkoutUrl: mollieOrder._links.checkout.href,
      token: secureToken
    });

  } catch (error: any) {
    console.error('[Checkout FATAL]:', error);
    return NextResponse.json({ error: 'Checkout failed', message: error.message }, { status: 500 });
  }
}
