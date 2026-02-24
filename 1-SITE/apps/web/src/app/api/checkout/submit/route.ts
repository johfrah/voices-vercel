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

    // 1. Validatie van de payload
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

    // Deep Trace Logging: Log types after validation
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

    // 🛡️ CHRIS-PROTOCOL: Extract actor & workshop IDs for validation (v2.14.269)
    const actorIds = Array.from(new Set([
      ...(items || []).map((i: any) => i.actor?.id).filter(Boolean),
      ...(selectedActor?.id ? [selectedActor.id] : [])
    ])).map(id => Number(id));

    const workshopIds = Array.from(new Set([
      ...(items || []).map((i: any) => i.id).filter((id: any) => !isNaN(Number(id)) && String(id).length > 5)
    ])).map(id => Number(id));

    console.log('[Checkout] Validated IDs:', { actorIds, workshopIds });

    // 3. Fetch Data voor prijsvalidatie (Masterclass SDK-Direct)
    let dbActors: any[] = [];
    let dbWorkshops: any[] = [];

    try {
      if (actorIds.length > 0) {
        // 🛡️ CHRIS-PROTOCOL: Query by BOTH id and wp_product_id for legacy support (v2.14.278)
        const { data } = await sdkClient
          .from('actors')
          .select('*')
          .or(`id.in.(${actorIds.join(',')}),wp_product_id.in.(${actorIds.join(',')})`);
          
        dbActors = (data || []).map(a => ({
          ...a,
          wpProductId: a.wp_product_id,
          firstName: a.first_name,
          lastName: a.last_name,
          nativeLang: a.native_lang,
          rates_raw: a.rates || {}
        }));
      }

      if (workshopIds.length > 0) {
        const { data } = await sdkClient.from('workshops').select('*').in('id', workshopIds);
        dbWorkshops = data || [];
      }
    } catch (dbErr: any) {
      console.error('[Checkout] DB Fetch fatal:', dbErr.message);
      throw new Error(`Database connection error: ${dbErr.message}`);
    }

    // 🛡️ CHRIS-PROTOCOL: Map both serial ID and WP ID to the actor object
    const actorMap = new Map();
    dbActors.forEach(a => {
      actorMap.set(Number(a.id), a);
      if (a.wpProductId) actorMap.set(Number(a.wpProductId), a);
    });
    
    const workshopMap = new Map(dbWorkshops.map(w => [Number(w.id), w]));

    const isSubscription = usage === 'subscription';
    const isVatExempt = false; 
    const taxRate = isVatExempt ? 0 : 0.21;

    // 4. Prijs Validatie (Server-Side)
    let serverCalculatedSubtotal = 0;
    let isQuoteOnly = false;

    const validatedItems = (items || []).map((item: any) => {
      // Scenario A: Voice Over
      if (item.type === 'voice_over') {
        const dbActor = actorMap.get(Number(item.actor?.id));
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
      }

      // Scenario B: Workshop
      if (item.type === 'workshop_edition') {
        const dbWorkshop = workshopMap.get(Number(item.id));
        const price = dbWorkshop ? Number(dbWorkshop.price) : 0;
        serverCalculatedSubtotal += price;
        return { ...item, pricing: { total: price, subtotal: price, tax: price * taxRate } };
      }

      return item;
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
    const isInvoiceActual = payment_method === 'banktransfer';
    console.log('[Checkout] 🚀 STEP 6: Creating order...', { amount, isInvoiceActual });

    // 🛡️ CHRIS-PROTOCOL: Minimum amount check (v2.14.271)
    if (amount <= 0 && !isQuoteOnly && !isInvoiceActual) {
      console.warn('[Checkout] Amount is 0 or negative for a paid order. Forcing quote mode.');
      isQuoteOnly = true;
    }

    const isQuote = isQuoteOnly || (rawBody as any).isQuote;
    
    console.log('[Checkout] 🚀 STEP 6.1: DB Insert payload prepared');
    
    const [newOrder] = await db.insert(orders).values({
      wpOrderId: Math.floor(Math.random() * 1000000), // Verhoogde range om collisions te voorkomen
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

    console.log('[Checkout] ✅ STEP 6.2: Order created in DB:', { id: newOrder?.id });

    if (!newOrder) {
      throw new Error('Failed to create order in database (returned empty)');
    }

    // 7. Order Items opslaan
    console.log('[Checkout] 🚀 STEP 7: Saving order items...', { count: validatedItems.length });
    if (validatedItems.length > 0) {
      try {
        await db.insert(orderItems).values(validatedItems.map((item: any) => {
          const dbActor = actorMap.get(Number(item.actor?.id));
          return {
            orderId: newOrder.id,
            actorId: dbActor?.id || null, // 🛡️ Gebruik ALTIJD de serial ID uit de DB
            name: item.actor?.display_name ? `Stemopname: ${item.actor.display_name}` : (item.name || 'Product'),
            quantity: 1,
            price: (item.pricing?.subtotal || item.pricing?.total || 0).toString(),
            tax: (item.pricing?.tax || 0).toString(),
            metaData: item.pricing || {},
            deliveryStatus: 'waiting'
          };
        }));
        console.log('[Checkout] ✅ STEP 7.1: Order items saved');
      } catch (e: any) {
        console.error('[Checkout] ❌ STEP 7 ERROR:', e.message);
        throw new Error(`Failed to save order items: ${e.message}`);
      }
    }

    // 8. Afhandeling (Mollie vs Factuur)
    console.log('[Checkout] 🚀 STEP 8: Handling payment method...', { method: payment_method });
    const secureToken = sign(
      { orderId: newOrder.id, userId, journey: newOrder.journey, email },
      process.env.JWT_SECRET || 'voices-secret-2026',
      { expiresIn: '24h' }
    );

    if (isQuote || isInvoiceActual) {
      console.log('[Checkout] ✅ STEP 8.1: Quote/Invoice flow triggered');
      // Offerte/Factuur flow (Background)
      (async () => {
        try {
          console.log('[Checkout] 📡 Background: Sending admin notification...');
          const notifyRes = await fetch(`${baseUrl}/api/admin/notify`, {
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
          console.log('[Checkout] 📡 Background: Admin notification sent, status:', notifyRes.status);
        } catch (e: any) {
          console.warn('[Checkout] ⚠️ Background notification failed:', e.message);
        }
      })();

      return NextResponse.json({
        success: true,
        orderId: newOrder.id,
        token: secureToken,
        isBankTransfer: isInvoiceActual,
        isQuote,
        message: isInvoiceActual ? 'Bestelling ontvangen.' : 'Offerte aangemaakt.'
      });
    }

    // Mollie Flow
    console.log('[Checkout] 🚀 STEP 8.2: Mollie flow triggered');
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
    
    // 🛡️ CHRIS-PROTOCOL: Report fatal error to Watchdog (v2.14.270)
    try {
      const headersList = headers();
      const host = headersList.get('host') || 'www.voices.be';
      const protocol = host.includes('localhost') ? 'http' : 'https';
      const baseUrl = `${protocol}://${host}`;
      
      await fetch(`${baseUrl}/api/admin/system/watchdog`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          level: 'critical',
          source: 'CheckoutAPI',
          error: error.message || 'Unknown Checkout Error',
          stack: error.stack,
          details: {
            message: error.message,
            name: error.name
          }
        })
      });
    } catch (watchdogErr) {
      console.error('[Checkout] Failed to report to Watchdog:', watchdogErr);
    }

    return NextResponse.json({ error: 'Checkout failed', message: error.message }, { status: 500 });
  }
}
