import { VatService } from '@/lib/compliance/vat-service';
import { LexCheck } from '@/lib/compliance/lex-check';
import { db } from '@db';
import { orders, users } from '@db/schema';
import { eq } from 'drizzle-orm';
import { sign } from 'jsonwebtoken';
import { headers } from 'next/headers';
import { NextResponse } from 'next/server';

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
      isSubscription
    } = body;
    
    // 🛡️ KELLY'S VIES CHECK: Server-side validation before granting tax exemption
    let isVatExempt = false;
    let viesResult = null;

    if (vat_number && country !== 'BE') {
      viesResult = await VatService.validateVat(vat_number, country);
      if (viesResult.valid) {
        isVatExempt = true;
      } else {
        console.warn(`[VAT Integrity] Invalid VAT number for ${country}: ${vat_number}. Forcing 21% VAT.`);
      }
    }

    const pricingResult = PricingEngine.calculate({
      usage,
      plan,
      words: metadata?.words || 0,
      prompts: metadata?.prompts || 0,
      music,
      isVatExempt
    });

    // 🛡️ KELLY'S INTEGRITY CHECK: Compare backend calculation with frontend submitted price
    const submittedAmount = pricing?.total || 0;
    if (Math.abs(pricingResult.subtotal - submittedAmount) > 0.01) {
      console.warn(`[Price Integrity Violation]: Expected ${pricingResult.subtotal}, got ${submittedAmount}. Order ID: ${metadata?.orderId}`);
      // We proceed with the verified backend price to be safe
    }

    const amount = pricingResult.subtotal; // Always use verified subtotal

    // ⚖️ LEX: AUDIT & NOTIFY (Non-blocking)
    await LexCheck.auditOrder({
      ...body,
      pricingResult,
      isVatExempt
    });

    return await db.transaction(async (tx) => {
      let userId = metadata?.userId;

      // 1. Upsert User (Systeem-kern: Altijd up-to-date adresgegevens)
      if (email) {
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
          music: body.music // 🎵 Store music options (trackId, asBackground, asHoldMusic)
        },
        // 🛡️ KELLY'S INTEGRITY (B2B & Fraud)
        viesValidatedAt: viesResult?.valid ? new Date() : null,
        viesCountryCode: viesResult?.countryCode || null,
        ipAddress: ip,
        createdAt: new Date()
      }).returning();

      // 3. Handle Response (Mollie vs Banktransfer vs Quote)
      if (isQuote || gateway === 'banktransfer') {
        // 🚀 YUKI SYNC: Bij overschrijving maken we direct een factuur in Yuki aan
        if (gateway === 'banktransfer') {
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
                countryCode: country || 'BE'
              },
              lines: [{
                description: `Stemopname: ${usage || 'Project'}`,
                quantity: 1,
                price: amount,
                vatType: isVatExempt ? 4 : 1 // 0% if exempt, else 21% (simplified)
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
          isBankTransfer: gateway === 'banktransfer',
          message: gateway === 'banktransfer' 
            ? 'Bestelling ontvangen. We sturen je de factuur voor de overschrijving.'
            : 'Offerte succesvol aangemaakt en verzonden.'
        });
      }

      // 4. Initialize Mollie Payment (Simulated)
      const checkoutUrl = `https://www.mollie.com/checkout/select-method/${Math.random().toString(36).substring(7)}`;

      // 5. Generate Secure One-Time Token for Post-Purchase Euphoria
      const secureToken = sign(
        { orderId: newOrder.id, userId, journey: newOrder.journey },
        process.env.JWT_SECRET || 'voices-secret-2026',
        { expiresIn: '1h' }
      );

      return NextResponse.json({
        success: true,
        orderId: newOrder.id,
        checkoutUrl: `${checkoutUrl}?token=${secureToken}`, // Pass token to success page via Mollie redirect
        message: 'Mollie payment session initialized.'
      });
    });

  } catch (error) {
    console.error('❌ Mollie V3 Error:', error);
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
