import { VatService } from '@/lib/compliance/vat-service';
import { LexCheck } from '@/lib/compliance/lex-check';
import { db } from '@db';
import { orders, users, centralLeads } from '@db/schema';
import { eq } from 'drizzle-orm';
import { sign } from 'jsonwebtoken';
import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import { MollieService } from '@/lib/payments/mollie';

/**
 * MOLLIE V3 HEADLESS CHECKOUT (CORE LOGIC 2026)
 * 
 * Directe integratie met Mollie API. Bypasses WordPress volledig.
 * Nu inclusief Offerte-modus en volledige User Mapping.
 */

import { PricingEngine } from '@/lib/pricing-engine';

export async function POST(request: Request) {
  try {
    const headersList = headers();
    const ip = headersList.get('x-forwarded-for') || 'unknown';

    const body = await request.json();
    const { 
      pricing, 
      first_name, 
      last_name, 
      email, 
      vat_number, 
      postal_code, 
      city, 
      metadata,
      isQuote,
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
    
    //  CHRIS-PROTOCOL: Trust the Frontend ("Mandje is Truth")
    // We skip server-side re-calculation and VAT re-verification as requested.
    const amount = pricing?.total || 0;
    const isVatExempt = !!submittedIsVatExempt;

    //  LEX: AUDIT & NOTIFY (Non-blocking)
    // We still log the attempt for security and transparency
    await LexCheck.auditOrder({
      ...body,
      isVatExempt
    });

    return await db.transaction(async (tx) => {
      let userId = metadata?.userId;

      // 0. Lead Tracking (MAT-MANDAAT: Leg de drempel vast zodra de e-mail bekend is)
      // CHRIS-PROTOCOL: Non-blocking. De verkoop is heilig.
      if (email) {
        try {
          await db.insert(centralLeads).values({
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
          }).onConflictDoNothing();
        } catch (e) {
          console.warn('[MAT] Lead tracking failed (non-blocking):', e);
        }
      }

      // 1. Upsert User (Systeem-kern: Altijd up-to-date adresgegevens)
      if (email) {
        try {
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
        } catch (userErr) {
          console.error('[Checkout] User upsert failed:', userErr);
          // We gaan door als we al een userId hadden uit metadata, anders is dit fataal
          if (!userId) throw userErr;
        }
      }

      // 2. Create Order/Quote in Supabase
      const [newOrder] = await tx.insert(orders).values({
        wpOrderId: Math.floor(Math.random() * 100000), // Temporary ID
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
          items: body.items // Store the full cart items for truth
        },
        ipAddress: ip,
        createdAt: new Date()
      }).returning();

      // 3. Handle Response (Mollie vs Banktransfer vs Quote)
      if (isQuote || payment_method === 'banktransfer') {
        //  YUKI SYNC: Bij overschrijving maken we direct een factuur in Yuki aan
        if (payment_method === 'banktransfer') {
          try {
            const { YukiService } = await import('@/services/YukiService');
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
            console.error('Yuki Sync failed during banktransfer:', e);
          }
        }

        return NextResponse.json({
          success: true,
          orderId: newOrder.id,
          isBankTransfer: payment_method === 'banktransfer',
          message: payment_method === 'banktransfer' 
            ? 'Bestelling ontvangen. We sturen je de factuur voor de overschrijving.'
            : 'Offerte succesvol aangemaakt en verzonden.'
        });
      }

      // 4. Generate Secure One-Time Token for Post-Purchase Euphoria (Magic Access)
      const secureToken = sign(
        { orderId: newOrder.id, userId, journey: newOrder.journey, email },
        process.env.JWT_SECRET || 'voices-secret-2026',
        { expiresIn: '24h' }
      );

      // 5. Initialize Mollie Order (REAL API 2026)
      // CHRIS-PROTOCOL: Orders API is superior for reporting and Klarna support
      if (amount <= 0) {
        console.warn('[Checkout] Amount is 0 or negative, skipping Mollie and marking as completed/pending.');
        return NextResponse.json({
          success: true,
          orderId: newOrder.id,
          token: secureToken,
          message: 'Order created (Free/Zero-amount).'
        });
      }

      const taxRate = isVatExempt ? 0 : 0.21;
      
      // Map cart items to Mollie lines
      const mollieLines = body.items.map((item: any) => {
        const itemTotal = item.pricing?.total || 0;
        const vatAmount = itemTotal * (taxRate / (1 + taxRate));
        const unitPrice = itemTotal; // Mollie unitPrice is including VAT

        return {
          name: item.actor?.display_name ? `Stemopname: ${item.actor.display_name}` : (item.type || 'Product'),
          quantity: 1,
          unitPrice: {
            currency: 'EUR',
            value: unitPrice.toFixed(2)
          },
          totalAmount: {
            currency: 'EUR',
            value: itemTotal.toFixed(2)
          },
          vatRate: (taxRate * 100).toFixed(0),
          vatAmount: {
            currency: 'EUR',
            value: vatAmount.toFixed(2)
          },
          metadata: {
            actorId: item.actor?.id,
            type: item.type
          }
        };
      });

      // Add Academy/Studio if present but not in items (legacy fallback)
      if (mollieLines.length === 0 && amount > 0) {
        const vatAmount = amount * (taxRate / (1 + taxRate));
        mollieLines.push({
          name: `Voices.be ${newOrder.journey.charAt(0).toUpperCase() + newOrder.journey.slice(1)}`,
          quantity: 1,
          unitPrice: { currency: 'EUR', value: amount.toFixed(2) },
          totalAmount: { currency: 'EUR', value: amount.toFixed(2) },
          vatRate: (taxRate * 100).toFixed(0),
          vatAmount: { currency: 'EUR', value: vatAmount.toFixed(2) }
        });
      }

      const mollieOrder = await MollieService.createOrder({
        amount: {
          currency: 'EUR',
          value: amount.toFixed(2)
        },
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
        redirectUrl: `${process.env.NEXT_PUBLIC_SITE_URL}/checkout/success?orderId=${newOrder.id}&token=${secureToken}`,
        webhookUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/api/checkout/webhook`,
        locale: country === 'BE' ? 'nl_BE' : (country === 'NL' ? 'nl_NL' : (country === 'FR' ? 'fr_FR' : 'en_US')),
        method: payment_method || undefined,
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
      await tx.update(orders)
        .set({ status: status === 'paid' ? 'completed' : 'failed' })
        .where(eq(orders.id, id));

      return NextResponse.json({ success: true });
    });
  } catch (error) {
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}
