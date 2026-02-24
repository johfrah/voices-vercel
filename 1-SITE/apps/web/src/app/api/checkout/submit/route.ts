import { VatService } from '@/lib/compliance/vat-service';
import { LexCheck } from '@/lib/compliance/lex-check';
import { db } from '@db';
import { orders, users, centralLeads, actors, notifications, orderItems, systemEvents } from '@db/schema';
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
import { YukiService } from '@/lib/services/yuki-service';
import { VumeEngine } from '@/lib/mail/VumeEngine';

export const dynamic = 'force-dynamic';

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
  let rawBody: any = null;
  try {
    console.log('[Checkout] 🚀 NUCLEAR ZERO-POINT: API Call started');
    const headersList = headers();
    const host = headersList.get('host') || 'www.voices.be';
    const marketConfig = MarketManager.getCurrentMarket(host);
    const baseUrl = MarketManager.getMarketDomains()[marketConfig.market_code] || `https://${host}`;
    const ip = headersList.get('x-forwarded-for') || 'unknown';

    // 🛡️ CHRIS-PROTOCOL: Force ISO-First locale for Mollie (v2.14.437)
    // Mollie expects locales like 'nl_BE', 'fr_FR', etc.
    const mollieLocale = marketConfig.primary_language.replace('-', '_');
    console.log('[Checkout] 🌍 Market Locale:', { 
      market: marketConfig.market_code, 
      primary: marketConfig.primary_language,
      mollie: mollieLocale 
    });

    // 1. Validatie van de payload
    try {
      rawBody = await request.json();
    } catch (e: any) {
      console.error('[Checkout] JSON Parse Error:', e.message);
      await sdkClient.from('system_events').insert({
        level: 'critical',
        source: 'CheckoutAPI',
        message: 'JSON Parse Error',
        details: { error: e.message, ip }
      });
      return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
    }
    
    // Deep Trace Logging: Log types before validation
    console.log('[Checkout] 🔍 TRACE (Pre-Validation):', {
      totalType: typeof rawBody.pricing?.total,
      actorIdType: typeof rawBody.selectedActor?.id,
      itemsCount: rawBody.items?.length
    });

    const validation = CheckoutPayloadSchema.safeParse(rawBody);

    if (!validation.success) {
      console.error('[Checkout] Validation failed:', validation.error.format());
      
      // 🛡️ CHRIS-PROTOCOL: Log validation failure to DB for forensic analysis (v2.14.293)
      await sdkClient.from('system_events').insert({
        level: 'error',
        source: 'CheckoutAPI',
        message: 'Validation Failed',
        details: { 
          errors: validation.error.format(),
          rawBody: rawBody ? JSON.stringify(rawBody).substring(0, 1000) : 'N/A'
        }
      });

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
      ...(items || []).map((i: any) => i.id).filter((id: any) => !isNaN(Number(id)) && Number(id) > 0)
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
    // 🛡️ CHRIS-PROTOCOL: Dynamic VAT exemption check (v2.14.324)
    // Non-Belgian EU companies with a valid VAT number are exempt (Reverse Charge).
    const isVatExempt = !!vat_number && vat_number.length > 2 && !vat_number.startsWith('BE'); 
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
    let authenticatedUserId = metadata?.userId;
    let userId = authenticatedUserId;
    let isNewUser = false;
    let isExistingUnauthenticatedUser = false;

    if (email) {
      try {
        // 🛡️ CHRIS-PROTOCOL: Check if user already exists BEFORE upserting (v2.14.313)
        const { data: existingUser } = await sdkClient
          .from('users')
          .select('id')
          .eq('email', email)
          .single();

        if (existingUser) {
          // Gebruiker bestaat al. 
          // 🛡️ CHRIS-PROTOCOL: Als we al ingelogd zijn, behouden we de ingelogde gebruiker als eigenaar (v2.14.316)
          // Dit voorkomt dat orders "verdwijnen" naar een ander account.
          if (authenticatedUserId) {
            userId = authenticatedUserId;
          } else {
            // Niet ingelogd, maar e-mail bestaat al -> Verificatie nodig
            isExistingUnauthenticatedUser = true;
            userId = existingUser.id;
          }
        } else {
          isNewUser = true;
        }

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
          role: 'customer'
          // 🛡️ CHRIS-PROTOCOL: updatedAt has defaultNow(), don't set manually (v2.14.296)
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
            addressCountry: country || 'BE'
            // 🛡️ CHRIS-PROTOCOL: lastActive has defaultNow(), don't set manually (v2.14.296)
          }
        }).returning();
        
        if (!userId) userId = user.id;
      } catch (e: any) {
        console.error('[Checkout] User upsert failed:', e.message);
      }
    }

    // 6. Bestelling aanmaken
    const market = MarketManager.getCurrentMarket(host).market_code;
    const isInvoiceActual = payment_method === 'banktransfer';
    console.log('[Checkout] 🚀 STEP 6: Creating order...', { amount, isInvoiceActual, market, isNewUser, isExistingUnauthenticatedUser });

    // 🛡️ CHRIS-PROTOCOL: Heartbeat Logging (v2.14.291)
    await sdkClient.from('system_events').insert({
      level: 'info',
      source: 'CheckoutAPI',
      message: 'Processing Order Creation',
      details: { amount, market, email, itemsCount: validatedItems.length }
    });

    // 🛡️ CHRIS-PROTOCOL: Minimum amount check (v2.14.271)
    if (amount <= 0 && !isQuoteOnly && !isInvoiceActual) {
      console.warn('[Checkout] Amount is 0 or negative for a paid order. Forcing quote mode.');
      isQuoteOnly = true;
    }

    const isQuote = isQuoteOnly || (rawBody as any).isQuote;
    
    console.log('[Checkout] 🚀 STEP 6.1: DB Insert payload prepared');
    
    // 🛡️ CHRIS-PROTOCOL: Unieke WP Order ID op basis van timestamp om collisions te voorkomen (v2.14.290)
    const uniqueWpId = Math.floor(Date.now() / 1000) + Math.floor(Math.random() * 1000);

    console.log('[Checkout] 🚀 STEP 6.0: Preparing order insert payload...');
    
    const orderPayload: any = {
      wp_order_id: uniqueWpId,
      total: amount.toString(),
      total_tax: (amount - serverCalculatedSubtotal).toString(),
      status: isQuote ? 'quote-pending' : 'pending',
      user_id: userId || null,
      journey: isSubscription ? 'johfrai-subscription' : (validatedItems[0]?.journey || 'agency'),
      billing_vat_number: vat_number || null,
      is_quote: !!isQuote,
      quote_message: quoteMessage || null,
      market: marketConfig.market_code,
      raw_meta: {
        usage,
        plan,
        isSubscription,
        music,
        itemsCount: validatedItems.length,
        serverCalculated: true,
        customer: {
          firstName: first_name,
          lastName: last_name,
          email,
          phone,
          company,
          address: address_street,
          city,
          zip: postal_code,
          country
        }
      },
      ip_address: ip
    };

    // 🛡️ CHRIS-PROTOCOL: Only add quote_sent_at if it's a quote (v2.14.307)
    if (isQuote) {
      orderPayload.quote_sent_at = new Date();
    }
    
    console.log('[Checkout] 🚀 STEP 6.1: Inserting order into database...');
    // 🛡️ CHRIS-PROTOCOL: Use SDK-Direct with snake_case for PostgREST (v2.14.307)
    const { data: sdkOrder, error: sdkErr } = await sdkClient
      .from('orders')
      .insert({
        ...orderPayload,
        raw_meta: { status: 'base_created' } // Minimal metadata for stage 1
      })
      .select()
      .single();

    if (sdkErr) {
      console.error('[Checkout] ❌ STEP 6.1 SDK ERROR:', sdkErr.message);
      throw new Error(`Failed to create order via SDK: ${sdkErr.message}`);
    }

    const newOrder = sdkOrder;
    console.log('[Checkout] ✅ STEP 6.2: Order created in DB via SDK:', { id: newOrder?.id });

    // 🛡️ CHRIS-PROTOCOL: Stage 2 - Update with full metadata (v2.14.307)
    const { error: updateErr } = await sdkClient
      .from('orders')
      .update({ raw_meta: orderPayload.raw_meta })
      .eq('id', newOrder.id);

    if (updateErr) {
      console.warn('[Checkout] ⚠️ STEP 6.3 Metadata update failed:', updateErr.message);
      // We don't throw here, the order is already created!
    }

    if (!newOrder) {
      throw new Error('Failed to create order in database (returned empty)');
    }

    // 7. Order Items opslaan
    console.log('[Checkout] 🚀 STEP 7: Saving order items...', { count: validatedItems.length });
    if (validatedItems.length > 0) {
      try {
        // 🛡️ CHRIS-PROTOCOL: Use SDK-Direct for order items to bypass Drizzle's internal date/json handling (v2.14.309)
        const itemsToInsert = validatedItems.map((item: any) => {
          const dbActor = actorMap.get(Number(item.actor?.id));
          const dbWorkshop = workshopMap.get(Number(item.id));
          return {
            order_id: newOrder.id,
            actor_id: dbActor?.id || null,
            name: dbActor ? (dbActor.display_name ? `Stemopname: ${dbActor.display_name}` : `Stemopname: ${dbActor.firstName}`) : (dbWorkshop?.title || item.name || 'Product'),
            quantity: 1,
            price: (item.pricing?.subtotal || item.pricing?.total || 0).toString(),
            tax: (item.pricing?.tax || 0).toString(),
            meta_data: {
              ...(item.pricing || {}),
              briefing: item.briefing || '',
              usage: item.usage,
              media: item.media,
              workshopId: dbWorkshop?.id
            },
            delivery_status: 'waiting'
          };
        });

        const { error: itemsErr } = await sdkClient
          .from('order_items')
          .insert(itemsToInsert);

        if (itemsErr) {
          console.error('[Checkout] ❌ STEP 7 SDK ERROR:', itemsErr.message);
          throw new Error(`Failed to save order items via SDK: ${itemsErr.message}`);
        }
        
        console.log('[Checkout] ✅ STEP 7.1: Order items saved via SDK');
      } catch (e: any) {
        console.error('[Checkout] ❌ STEP 7 ERROR:', e.message);
        throw new Error(`Failed to save order items: ${e.message}`);
      }
    }

    // 8. Afhandeling (Mollie vs Factuur)
    console.log('[Checkout] 🚀 STEP 8: Handling payment method...', { method: payment_method });
    const secureToken = sign(
      { userId, orderId: newOrder.id, journey: newOrder.journey, email },
      process.env.JWT_SECRET || 'voices-secret-2026',
      { expiresIn: '24h' }
    );

    if (isQuote || isInvoiceActual) {
      console.log('[Checkout] ✅ STEP 8.1: Quote/Invoice flow triggered');
      
      // 🛡️ CHRIS-PROTOCOL: Immediate status update for Bank Transfer (v2.14.350)
      if (isInvoiceActual) {
        await sdkClient.from('orders').update({ status: 'pending' }).eq('id', newOrder.id);
      }

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
                company,
                customer: { firstName: first_name, lastName: last_name, phone },
                items: validatedItems.map((i: any) => ({
                  actor: i.actor,
                  name: i.name,
                  usage: i.usage,
                  pricing: i.pricing,
                  briefing: i.briefing
                }))
              }
            })
          });
          console.log('[Checkout] 📡 Background: Admin notification sent, status:', notifyRes.status);

          // 🛡️ CHRIS-PROTOCOL: AUTOMATED CUSTOMER CONFIRMATION FOR QUOTES/INVOICES (v2.14.328)
          try {
            await VumeEngine.send({
              to: email,
              subject: isQuote ? `Offerte-aanvraag ontvangen: #${newOrder.id}` : `Bestelling ontvangen: #${newOrder.id}`,
              template: 'order-confirmation',
              context: {
                userName: first_name || 'Klant',
                orderId: newOrder.id.toString(),
                total: amount,
                items: validatedItems.map((i: any) => ({
                  name: i.actor?.display_name ? `Stemopname: ${i.actor.display_name}` : (i.name || 'Product'),
                  price: i.pricing?.total || 0,
                  deliveryTime: i.actor?.delivery_time
                })),
                paymentMethod: isQuote ? 'Offerte' : 'Factuur',
                language: 'nl'
              },
              host: host
            });
            console.log(`[Automation] Customer confirmation sent for ${isQuote ? 'quote' : 'invoice'}`);
          } catch (customerConfErr) {
            console.warn(`[Automation] Failed to send customer confirmation:`, customerConfErr);
          }

          // 🛡️ CHRIS-PROTOCOL: AUTOMATED YUKI INVOICE FOR BANK TRANSFERS (v2.14.328)
          if (isInvoiceActual) {
            try {
              await YukiService.createInvoice({
                orderId: newOrder.id,
                customer: {
                  firstName: first_name || 'Klant',
                  lastName: last_name || '',
                  email: email,
                  companyName: company || undefined,
                  vatNumber: vat_number || undefined,
                  address: address_street || undefined,
                  city: city || undefined,
                  zipCode: postal_code || undefined,
                  countryCode: country || 'BE'
                },
                lines: validatedItems.map((i: any) => ({
                  description: i.actor?.display_name ? `Stemopname: ${i.actor.display_name}` : (i.name || 'Product'),
                  quantity: 1,
                  price: i.pricing?.subtotal || 0,
                  vatType: isVatExempt ? 2 : 1 // 1 = 21%, 2 = 0%
                })),
                paymentMethod: 'BankTransfer'
              });
              console.log(`[Automation] Yuki invoice triggered for Invoice Order #${newOrder.id}`);
            } catch (yukiErr) {
              console.warn(`[Automation] Yuki sync failed for Invoice Order #${newOrder.id}:`, yukiErr);
            }
          }

          // 🛡️ CHRIS-PROTOCOL: Invalidate Customer 360 Cache (v2.14.347)
          // This ensures the new order is immediately visible in the dashboard
          try {
            const cacheKey = `customer_360_${email}`;
            await sdkClient.from('app_configs').delete().eq('key', cacheKey);
            console.log(`[Automation] UCI Cache invalidated for ${email}`);
          } catch (cacheErr) {
            console.warn('[Automation] Failed to invalidate UCI cache:', cacheErr);
          }

        } catch (e: any) {
          console.warn('[Checkout] ⚠️ Background notification failed:', e.message);
        }
      })();

      return NextResponse.json({
        success: true,
        orderId: newOrder.id,
        token: isExistingUnauthenticatedUser ? null : secureToken, // 🛡️ Veiligheid: Geen auto-login voor bestaande accounts (v2.14.313)
        requiresVerification: isExistingUnauthenticatedUser,
        isBankTransfer: isInvoiceActual,
        isQuote,
        deliveryTime: validatedItems[0]?.actor?.delivery_time || null, // 🛡️ Pass delivery time to success page (v2.14.315)
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
        vatRate: isVatExempt ? '0' : '21',
        vatAmount: { currency: 'EUR', value: (item.pricing?.vat || item.pricing?.tax || 0).toFixed(2) }
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
      webhookUrl: `${baseUrl}/api/checkout/webhook`,
      locale: mollieLocale as any,
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
    
    // 🛡️ CHRIS-PROTOCOL: Dual-Path Reporting for Fatal Errors (v2.14.291)
    // We try Drizzle first, then fallback to SDK Client for maximum reliability.
    const errorPayload = {
      level: 'critical' as const,
      source: 'CheckoutAPI',
      message: error.message || 'Unknown Checkout Error',
      details: {
        stack: error.stack,
        name: error.name,
        rawBody: rawBody ? JSON.stringify(rawBody).substring(0, 1000) : 'N/A',
        stage: 'FATAL_CATCH'
      }
      // 🛡️ CHRIS-PROTOCOL: createdAt has defaultNow(), don't set manually (v2.14.296)
    };

    try {
      // 🛡️ CHRIS-PROTOCOL: Use SDK directly for the catch block to avoid Drizzle driver issues
      const { error: sdkErr } = await sdkClient.from('system_events').insert(errorPayload);
      if (sdkErr) console.error('[Checkout] SDK logging failed:', sdkErr.message);
      else console.log('[Checkout] Fatal error logged via SDK Client.');
    } catch (finalErr: any) {
      console.error('[Checkout] All logging failed:', finalErr.message);
    }

    return NextResponse.json({ error: 'Checkout failed', message: error.message }, { status: 500 });
  }
}
