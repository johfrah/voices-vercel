import { VatService } from '@/lib/compliance/vat-service';
import { LexCheck } from '@/lib/compliance/lex-check';
import { db } from '@db';
import { orders, users, centralLeads, actors, notifications } from '@db/schema';
import { eq, inArray } from 'drizzle-orm';
import { sign } from 'jsonwebtoken';
import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import { MollieService } from '@/lib/payments/mollie';
import { SlimmeKassa } from '@/lib/engines/pricing-engine';
import { generateCartHash } from '@/lib/utils/utils/cart-utils';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';

/**
 * MOLLIE V3 HEADLESS CHECKOUT (CORE LOGIC 2026)
 * 
 * Directe integratie met Mollie API. Bypasses WordPress volledig.
 * Nu inclusief Offerte-modus en volledige User Mapping.
 * 
 * CHRIS-PROTOCOL: Server-Side Prijs Validatie & Cart Hashing.
 * 
 * @lock-file
 */

//  CHRIS-PROTOCOL: SDK fallback voor als direct-connect faalt
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

    const body = await request.json();
    const { 
      pricing, 
      items = [],
      selectedActor,
      step,
      first_name, 
      last_name, 
      email, 
      vat_number, 
      postal_code, 
      city, 
      metadata,
      isQuote: submittedIsQuote,
      quoteMessage,
      phone,
      company,
      address_street,
      usage,
      plan,
      music,
      country,
      gateway,
      isSubscription,
      billing_po,
      financial_email,
      payment_method,
      isVatExempt: submittedIsVatExempt
    } = body;

    // 1. Cart Hash Validatie (Race-condition check)
    const serverCartHash = generateCartHash(items, selectedActor, step);
    if (pricing?.cartHash && pricing.cartHash !== serverCartHash) {
      console.warn(`[Checkout] Cart hash mismatch! Client: ${pricing.cartHash}, Server: ${serverCartHash}`);
      // We blokkeren niet direct, maar we dwingen een herberekening af.
    }

    // 2. Server-Side Prijs Validatie (Lex Check)
    let isQuote = submittedIsQuote || false;
    let serverCalculatedSubtotal = 0;
    
    // Fetch actor data from DB for all items
    const actorIds = Array.from(new Set([
      ...items.map((i: any) => i.actor?.id).filter(Boolean),
      ...(selectedActor?.id ? [selectedActor.id] : [])
    ]));

    let dbActors: any[] = [];
    if (actorIds.length > 0) {
      try {
        dbActors = await db.select().from(actors).where(inArray(actors.id, actorIds as number[])).catch(async (err: any) => {
          console.warn(' [Checkout] Drizzle actor fetch failed, falling back to SDK:', err.message);
          const { data } = await sdkClient.from('actors').select('*').in('id', actorIds as number[]);
          return (data || []).map(a => ({
            ...a,
            wpProductId: a.wp_product_id,
            firstName: a.first_name,
            lastName: a.last_name,
            nativeLang: a.native_lang,
            countryId: a.country_id,
            deliveryTime: a.delivery_time,
            extraLangs: a.extra_langs,
            whyVoices: a.why_voices,
            toneOfVoice: a.tone_of_voice,
            birthYear: a.birth_year,
            photoId: a.photo_id,
            logoId: a.logo_id,
            voiceScore: a.voice_score,
            totalSales: a.total_sales,
            priceUnpaid: a.price_unpaid,
            priceOnline: a.price_online,
            priceIvr: a.price_ivr,
            priceLiveRegie: a.price_live_regie,
            dropboxUrl: a.dropbox_url,
            isAi: a.is_ai,
            elevenlabsId: a.elevenlabs_id,
            youtubeUrl: a.youtube_url,
            menuOrder: a.menu_order,
            deliveryDaysMin: a.delivery_days_min,
            deliveryDaysMax: a.delivery_days_max,
            cutoffTime: a.cutoff_time,
            samedayDelivery: a.sameday_delivery,
            pendingBio: a.pending_bio,
            pendingTagline: a.pending_tagline,
            experienceLevel: a.experience_level,
            studioSpecs: a.studio_specs,
            isManuallyEdited: a.is_manually_edited,
            aiTags: a.ai_tags,
            deliveryDateMin: a.delivery_date_min,
            deliveryDateMinPriority: a.delivery_date_min_priority,
            allowFreeTrial: a.allow_free_trial
          }));
        });
      } catch (e) {
        console.error(' [Checkout] Fatal actor fetch error:', e);
      }
    }
    
    const actorMap = new Map(dbActors.map(a => [a.id, a]));

    // Re-calculate each item
    const validatedItems = items.map((item: any) => {
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
        isVatExempt: !!submittedIsVatExempt
      });

      if (result.isQuoteOnly) isQuote = true;
      serverCalculatedSubtotal += result.subtotal;
      
      return { ...item, pricing: { ...result } };
    });

    // Handle current selection if in briefing step
    if (selectedActor && step === 'briefing') {
      const dbActor = actorMap.get(selectedActor.id);
      if (dbActor) {
        const wordCount = body.briefing?.trim().split(/\s+/).filter(Boolean).length || 0;
        const result = SlimmeKassa.calculate({
          usage: usage,
          words: wordCount,
          mediaTypes: body.media,
          country: body.country,
          spots: body.spotsDetail || { [body.media?.[0]]: body.spots },
          years: body.yearsDetail || { [body.media?.[0]]: body.years },
          liveSession: body.liveSession,
          actorRates: dbActor as any,
          music: music,
          isVatExempt: !!submittedIsVatExempt
        });
        if (result.isQuoteOnly) isQuote = true;
        serverCalculatedSubtotal += result.subtotal;
      }
    }

    // 3. Vergelijk met ingediende prijs
    const submittedSubtotal = pricing?.total || 0;
    const priceDiff = Math.abs(serverCalculatedSubtotal - submittedSubtotal);
    
    if (priceDiff > 0.01) {
      console.warn(`[Checkout] Price discrepancy detected! Submitted: ${submittedSubtotal}, Server: ${serverCalculatedSubtotal}`);
      // Bij grote verschillen (> 1 euro) dwingen we offerte-modus af voor de veiligheid
      if (priceDiff > 1.00) {
        isQuote = true;
      }
    }

    const subtotal = serverCalculatedSubtotal;
    const isVatExempt = !!submittedIsVatExempt;
    const taxRate = isVatExempt ? 0 : 0.21;
    
    // Calculate INCL VAT total for Mollie
    const totalInclVat = Math.round(subtotal * (1 + taxRate) * 100) / 100;
    const amount = totalInclVat;

    console.log(`[Checkout] Final validation for ${email}: Subtotal=${subtotal}, TotalInclVat=${totalInclVat}, isQuote=${isQuote}`);

    //  LEX: AUDIT & NOTIFY (Non-blocking)
    LexCheck.auditOrder({
      ...body,
      isVatExempt,
      serverValidated: true,
      serverSubtotal: subtotal
    }).catch(e => console.warn('[LEX] Audit failed (background):', e));

    //  CHRIS-PROTOCOL: Execute DB operations
    const dbResult = await db.transaction(async (tx) => {
      let userId = metadata?.userId;

      // Lead Tracking
      if (email) {
        db.insert(centralLeads).values({
          email,
          firstName: first_name,
          lastName: last_name,
          phone: phone,
          sourceType: 'checkout_attempt',
          leadVibe: 'hot',
          iapContext: {
            journey: isSubscription ? 'johfrai-subscription' : 'agency',
            usage,
            plan,
            amount: amount.toString(),
            metadata
          }
        }).onConflictDoNothing().catch(e => console.warn('[MAT] Lead tracking failed:', e));
      }

      // Upsert User
      let isNewUser = false;
      if (email) {
        try {
          const [existingUser] = await tx.select().from(users).where(eq(users.email, email)).limit(1);
          isNewUser = !existingUser;

          const [user] = await tx.insert(users).values({
            email,
            firstName: first_name,
            lastName: last_name,
            phone: phone,
            companyName: company,
            vatNumber: vat_number,
            addressStreet: address_street,
            addressZip: postal_code,
            addressCity: city,
            addressCountry: country || 'BE',
            role: 'customer',
            updatedAt: new Date()
          }).onConflictDoUpdate({
            target: users.email,
            set: {
              firstName: first_name,
              lastName: last_name,
              phone: phone,
              companyName: company,
              vatNumber: vat_number,
              addressStreet: address_street,
              addressZip: postal_code,
              addressCity: city,
              addressCountry: country || 'BE',
              lastActive: new Date()
            }
          }).returning();
          userId = user.id;

          if (isNewUser) {
            (async () => {
              try {
                const { VumeEngine } = await import('@/lib/mail/VumeEngine');
                const { MarketManagerServer: MarketManager } = await import('@/lib/system/market-manager-server');
                const market = MarketManager.getCurrentMarket(host);
                await VumeEngine.send({
                  to: email,
                  subject: `Welkom bij ${market.name}`,
                  template: 'new-account',
                  context: { name: first_name || 'Klant', language: 'nl' },
                  host: host
                });
              } catch (welcomeErr) {
                console.warn('[Checkout] Welcome email failed:', welcomeErr);
              }
            })();
          }
        } catch (userErr) {
          console.error('[Checkout] User upsert failed:', userErr);
          if (!userId) throw userErr;
        }
      }

      // Create Order/Quote
      const [newOrder] = await tx.insert(orders).values({
        wpOrderId: Math.floor(Math.random() * 100000),
        total: amount.toString(),
        status: isQuote ? 'quote-pending' : 'pending',
        userId: userId || null,
        journey: isSubscription ? 'johfrai-subscription' : 'agency',
        billingVatNumber: vat_number || null,
        isQuote: isQuote || false,
        quoteMessage: quoteMessage || null,
        quoteSentAt: isQuote ? new Date() : null,
        rawMeta: {
          usage,
          plan,
          isSubscription,
          music: body.music,
          billing_po: billing_po || null,
          financial_email: financial_email || null,
          items: validatedItems, // Use server-validated items
          serverCalculated: true
        },
        ipAddress: ip,
        createdAt: new Date()
      }).returning();

      // CHRIS-PROTOCOL: Order Items opslaan inclusief volledige metadata (SlimmeKassaResult)
      if (validatedItems.length > 0) {
        await tx.insert(orderItems).values(validatedItems.map((item: any) => ({
          orderId: newOrder.id,
          actorId: item.actor?.id || null,
          artistId: item.artist?.id || null,
          name: item.actor?.display_name ? `Stemopname: ${item.actor.display_name}` : (item.name || 'Product'),
          quantity: 1,
          price: (item.pricing?.subtotal || item.pricing?.total || 0).toString(),
          tax: (item.pricing?.tax || 0).toString(),
          metaData: item.pricing || {}, // Bevat full breakdown: base, wordSurcharge, mediaSurcharge, etc.
          deliveryStatus: 'waiting'
        })));
      }

      return { newOrder, userId, isNewUser };
    });

    const { newOrder, userId, isNewUser } = dbResult;

    // 3. Generate Secure Token
    const secureToken = sign(
      { orderId: newOrder.id, userId, journey: newOrder.journey, email },
      process.env.JWT_SECRET || 'voices-secret-2026',
      { expiresIn: '24h' }
    );

    // 4. Handle Response (Mollie vs Banktransfer vs Quote)
    const selectedGateway = payment_method || gateway;
    if (isQuote || selectedGateway === 'banktransfer') {
      if (selectedGateway === 'banktransfer') {
        (async () => {
          try {
            const { YukiService } = await import('@/lib/services/YukiService');
            await YukiService.createInvoice({
              orderId: newOrder.id,
              customer: {
                firstName: first_name,
                lastName: last_name,
                email: email,
                companyName: company,
                vatNumber: vat_number,
                address: address_street,
                city: city,
                zipCode: postal_code,
                countryCode: country || 'BE',
                billing_po: billing_po,
                financial_email: financial_email
              },
              lines: [{
                description: `Stemopname: ${usage || 'Project'}`,
                quantity: 1,
                price: amount,
                vatType: isVatExempt ? 4 : 1 
              }],
              paymentMethod: 'banktransfer'
            });
          } catch (e) {
            console.error('Yuki Sync failed:', e);
          }
        })();
      }

      (async () => {
        try {
          const fetchUrl = `${process.env.NEXT_PUBLIC_BASE_URL || `https://${host}`}/api/admin/notify`;
          await fetch(fetchUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              type: isQuote ? 'quote_request' : 'banktransfer_order',
              data: {
                orderId: newOrder.id,
                email: email,
                amount: isQuote ? subtotal : amount,
                company: company,
                items: validatedItems,
                isNewUser: isNewUser,
                customer: { firstName: first_name, lastName: last_name, phone: phone }
              }
            })
          });
        } catch (notifyErr) {
          console.warn('[Admin Notify] Failed:', notifyErr);
        }
      })();

      return NextResponse.json({
        success: true,
        orderId: newOrder.id,
        token: secureToken,
        isBankTransfer: payment_method === 'banktransfer',
        isQuote: isQuote,
        message: selectedGateway === 'banktransfer' 
          ? 'Bestelling ontvangen. We sturen je de factuur voor de overschrijving.'
          : 'Offerte succesvol aangemaakt en verzonden.'
      });
    }

    // 5. Initialize Mollie Order
    const mollieLines = validatedItems.map((item: any) => {
      const itemSubtotal = item.pricing?.total || item.pricing?.subtotal || 0;
      const vatAmount = Math.round(itemSubtotal * taxRate * 100) / 100;
      const totalAmount = Math.round((itemSubtotal + vatAmount) * 100) / 100;

      return {
        name: item.actor?.display_name ? `Stemopname: ${item.actor.display_name}` : (item.type || 'Product'),
        quantity: 1,
        unitPrice: { currency: 'EUR', value: totalAmount.toFixed(2) },
        totalAmount: { currency: 'EUR', value: totalAmount.toFixed(2) },
        vatRate: (taxRate * 100).toFixed(0),
        vatAmount: { currency: 'EUR', value: vatAmount.toFixed(2) },
        metadata: { actorId: item.actor?.id, type: item.type }
      };
    });

    // Add current selection if present and not already in items
    if (selectedActor && step === 'briefing') {
      const isAlreadyInItems = validatedItems.some((item: any) => item.actor?.id === selectedActor.id);
      if (!isAlreadyInItems) {
        // Find the current selection total from the validated items or re-calculate
        const currentSubtotal = subtotal - validatedItems.reduce((sum: number, i: any) => sum + (i.pricing?.total || i.pricing?.subtotal || 0), 0);
        if (currentSubtotal > 0.01) {
          const vatAmount = Math.round(currentSubtotal * taxRate * 100) / 100;
          const totalAmount = Math.round((currentSubtotal + vatAmount) * 100) / 100;
          mollieLines.push({
            name: `Stemopname: ${selectedActor.display_name || selectedActor.firstName}`,
            quantity: 1,
            unitPrice: { currency: 'EUR', value: totalAmount.toFixed(2) },
            totalAmount: { currency: 'EUR', value: totalAmount.toFixed(2) },
            vatRate: (taxRate * 100).toFixed(0),
            vatAmount: { currency: 'EUR', value: vatAmount.toFixed(2) },
            metadata: { actorId: selectedActor.id, type: 'current_selection' }
          });
        }
      }
    }

    if (mollieLines.length === 0 && amount > 0) {
      const { MarketManagerServer: MarketManager } = await import('@/lib/system/market-manager-server');
      const market = MarketManager.getCurrentMarket(host);
      mollieLines.push({
        name: `${market.name} ${newOrder.journey.charAt(0).toUpperCase() + newOrder.journey.slice(1)}`,
        quantity: 1,
        unitPrice: { currency: 'EUR', value: amount.toFixed(2) },
        totalAmount: { currency: 'EUR', value: amount.toFixed(2) },
        vatRate: (taxRate * 100).toFixed(0),
        vatAmount: { currency: 'EUR', value: (amount - subtotal).toFixed(2) }
      });
    }

    const finalAmountInclVat = mollieLines.reduce((sum, line) => sum + parseFloat(line.totalAmount.value), 0);
    
    if (finalAmountInclVat <= 0) {
      return NextResponse.json({
        success: true,
        orderId: newOrder.id,
        token: secureToken,
        message: 'Order created (Free/Zero-amount).'
      });
    }

    const mollieOrder = await MollieService.createOrder({
      amount: { currency: 'EUR', value: finalAmountInclVat.toFixed(2) },
      orderNumber: newOrder.id.toString(),
      lines: mollieLines,
      billingAddress: {
        streetAndNumber: address_street || 'N/A',
        postalCode: postal_code || 'N/A',
        city: city || 'N/A',
        country: country || 'BE',
        givenName: first_name || 'Klant',
        familyName: last_name || '',
        email: email
      },
      redirectUrl: `${baseUrl}/api/auth/magic-login?token=${secureToken}&redirect=/account/orders?orderId=${newOrder.id}`,
      webhookUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/api/checkout/webhook`,
      locale: country === 'BE' ? 'nl_BE' : (country === 'NL' ? 'nl_NL' : (country === 'FR' ? 'fr_FR' : 'en_US')),
      method: selectedGateway || undefined,
      metadata: {
        orderId: newOrder.id,
        userId: userId,
        billing_po: billing_po || null,
        financial_email: financial_email || null,
        journey: newOrder.journey,
        company: company || null,
        vatNumber: vat_number || null
      }
    });

    return NextResponse.json({
      success: true,
      orderId: newOrder.id,
      checkoutUrl: `${mollieOrder._links.checkout.href}`,
      token: secureToken,
      message: 'Mollie order session initialized.'
    });

  } catch (error) {
    console.error(' Mollie V3 Error:', error);
    return NextResponse.json({ error: 'Checkout initialization failed' }, { status: 500 });
  }
}

/**
 * MOLLIE WEBHOOK HANDLER
 */
export async function PATCH(request: Request) {
  try {
    const { id, status } = await request.json();

    return await db.transaction(async (tx) => {
      // Update order status based on Mollie webhook
      const [updatedOrder] = await tx.update(orders)
        .set({ status: status === 'paid' ? 'completed' : 'failed' })
        .where(eq(orders.id, id))
        .returning();

      // 🔔 NOTIFICATION ENGINE (2026)
      if (status === 'paid' && updatedOrder?.userId) {
        try {
          await tx.insert(notifications).values({
            userId: updatedOrder.userId,
            type: 'order_update',
            title: 'Betaling ontvangen',
            message: `Je betaling voor bestelling #${updatedOrder.displayOrderId || updatedOrder.id} is succesvol verwerkt.`,
            metadata: { orderId: updatedOrder.id, status: 'completed' }
          });
        } catch (notifyError) {
          console.error('[Mollie Webhook Notification Error]:', notifyError);
        }
      }

      return NextResponse.json({ success: true });
    });
  } catch (error) {
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}
