import { NextRequest, NextResponse } from 'next/server';
import { db, orders, orderNotes, users, orderItems, actors } from '@/lib/system/voices-config';
import { eq, sql, inArray } from 'drizzle-orm';
import { MollieService } from '@/lib/payments/mollie';
import { UCIService } from '@/lib/intelligence/uci-service';
import { MarketManagerServer as MarketManager } from "@/lib/system/core/market-manager";
import { MusicDeliveryService } from '@/lib/services/music-delivery-service';
import { YukiService } from '@/lib/services/yuki-service';
import { VumeEngine } from '@/lib/mail/VumeEngine';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';

/**
 *  MOLLIE WEBHOOK (NUCLEAR)
 * 
 * Doel: Real-time status updates van Mollie verwerken.
 * Bij succes: Order op 'paid' zetten en Customer DNA updaten.
 */

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const sdkClient = createSupabaseClient(supabaseUrl, supabaseKey);

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const paymentId = formData.get('id') as string;

    if (!paymentId) {
      // CHRIS-PROTOCOL: Log to Watchdog instead of crashing or sending error mails
      console.warn('[Mollie Webhook] Missing ID in request');
      return new NextResponse('Missing ID', { status: 400 });
    }

    // 1. Haal de status op bij Mollie
    let payment;
    try {
      payment = await MollieService.getPayment(paymentId);
    } catch (mollieErr: any) {
      console.error('[Mollie Webhook] Failed to fetch payment:', mollieErr.message);
      return new NextResponse('Payment Not Found', { status: 404 });
    }

    const orderId = parseInt(payment.metadata?.orderId);

    if (!orderId) {
      console.warn('[Mollie Webhook] Invalid or missing Order ID in metadata:', payment.metadata);
      return new NextResponse('Invalid Metadata', { status: 400 });
    }

    // 2. Update de order status op basis van Mollie
    let newStatus = 'pending';
    if (payment.status === 'paid') newStatus = 'paid';
    if (payment.status === 'canceled') newStatus = 'cancelled';
    if (payment.status === 'expired') newStatus = 'expired';
    if (payment.status === 'failed') newStatus = 'failed';

    //  NUCLEAR CONFIG: Haal admin e-mail uit MarketManager of ENV
    const host = request.headers.get('host') || (process.env.NEXT_PUBLIC_SITE_URL?.replace('https://', '') || MarketManager.getMarketDomains()['BE']?.replace('https://', ''));
    const market = MarketManager.getCurrentMarket(host);
    const adminEmail = process.env.ADMIN_EMAIL || market.email;

    await db.transaction(async (tx) => {
      // Haal de order op om te zien wat erin zit
      const [order] = await tx.select().from(orders).where(eq(orders.id, orderId)).limit(1);
      
      // Update Order status
      let finalStatus = newStatus;
      
      //  Als betaald: Check of het een "Music Only" of "Donation" order is
      if (newStatus === 'paid' && order) {
        const hasVoice = (order.rawMeta as any)?.actorId || (order.rawMeta as any)?.voiceId || (order.rawMeta as any)?.itemsCount > 0;
        const hasMusic = (order.rawMeta as any)?.music?.trackId;
        const isDonation = order.journey === 'artist_donation';
        
        // Als er ENKEL muziek is (geen stem), zetten we de order direct op 'completed'
        if (hasMusic && !hasVoice) {
          finalStatus = 'completed';
          console.log(` Order #${orderId} is Music Only. Setting status to 'completed'.`);
        }

        //  ARTIST DONATION FLOW: Trigger bedankmail
        if (isDonation) {
          const donationContext = order.iapContext as any;
          if (donationContext?.donorEmail) {
            try {
              await VumeEngine.send({
                to: donationContext.donorEmail,
                subject: `Bedankt voor je support aan Youssef Zaki!`,
                template: 'donation-thank-you',
                context: {
                  name: donationContext.donorName || 'Supporter',
                  amount: order.total,
                  artistName: 'Youssef Zaki',
                  message: donationContext.message,
                  language: 'nl-be'
                },
                host: host
              });
              console.log(` Donation: Thank you email sent to ${donationContext.donorEmail}`);

              //  Notificatie naar Admin (Donatie specifiek)
              const siteUrl = MarketManager.getMarketDomains()[market.market_code] || `https://${MarketManager.getMarketDomains()['BE']?.replace('https://', '') || 'www.voices.be'}`;
              const fetchUrl = `${siteUrl}/api/admin/notify`;
              await fetch(fetchUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  type: 'donation_received',
                  data: {
                    orderId: orderId,
                    email: donationContext.donorEmail,
                    amount: order.total,
                    artistName: 'Youssef Zaki',
                    message: donationContext.message,
                    customer: { first_name: donationContext.donorName }
                  }
                })
              });
            } catch (err) {
              console.error(' Failed to process donation post-payment:', err);
            }
          }
        }
      }

      await tx.update(orders)
        .set({ status: finalStatus, updatedAt: new Date() })
        .where(eq(orders.id, orderId));

      // Log Note
      await tx.insert(orderNotes).values({
        orderId: orderId,
        note: `Mollie Status Update: ${newStatus}${finalStatus === 'in_productie' ? ' (Auto-status: In Productie)' : finalStatus === 'completed' ? ' (Auto-completed: Music Only)' : ''} (Payment ID: ${paymentId})`,
        isCustomerNote: false
      });

      //  Als betaald: Lever muziek en update DNA + Sales
      if (newStatus === 'paid') {
        // 1. Verhoog total_sales voor de betrokken acteurs
        try {
          const items = await tx.select({ actorId: orderItems.actorId, name: orderItems.name, price: orderItems.price, metaData: orderItems.metaData })
            .from(orderItems)
            .where(eq(orderItems.orderId, orderId));
          
          const actorIds = items.map(i => i.actorId).filter((id): id is number => id !== null);
          
          if (actorIds.length > 0) {
            await tx.update(actors)
              .set({ totalSales: sql`${actors.totalSales} + 1` })
              .where(inArray(actors.id, actorIds));
            console.log(` Sales: total_sales incremented for actors: ${actorIds.join(', ')}`);
          }

          // 🛡️ CHRIS-PROTOCOL: HITL MANDATE (v2.14.332)
          // We sturen GEEN automatische opdrachtbevestiging meer naar acteurs.
          // De admin (Johfrah) moet de briefing valideren in het dashboard.

          // 🛡️ CHRIS-PROTOCOL: AUTOMATED CUSTOMER CONFIRMATION (v2.14.328)
          if (order) {
            const [user] = await tx.select().from(users).where(eq(users.id, order.user_id as number)).limit(1);
            if (user) {
              (async () => {
                try {
                  await VumeEngine.send({
                    to: user.email,
                    subject: `Bestelling Bevestigd: #${orderId} - Voices`,
                    template: 'order-confirmation',
                    context: {
                      userName: user.first_name || 'Klant',
                      orderId: orderId.toString(),
                      total: parseFloat(order.total || '0'),
                      items: items.map(i => ({
                        name: i.name,
                        price: parseFloat(i.price || '0'),
                        deliveryTime: (i.metaData as any)?.deliveryTime
                      })),
                      paymentMethod: payment.method || 'Online',
                      language: 'nl'
                    },
                    host: host
                  });
                  console.log(`[Automation] Customer confirmation sent to ${user.email}`);
                } catch (customerConfErr) {
                  console.warn(`[Automation] Failed to send customer confirmation:`, customerConfErr);
                }
              })();
            }
          }

        } catch (salesErr) {
          console.error(' Failed to update actor sales:', salesErr);
        }

        // 2. Lever muziek uit indien aanwezig in de order
        try {
          await MusicDeliveryService.deliverMusic(orderId);
        } catch (musicErr) {
          console.error(' Failed to deliver music after payment:', musicErr);
          // We gaan door, want de betaling is wel gelukt
        }

        // 🛡️ CHRIS-PROTOCOL: HITL MANDATE (v2.14.332)
        // We maken GEEN automatische Yuki factuur meer aan.
        // De admin triggert dit handmatig na controle.

        if (payment.metadata.user_id) {
          const userId = parseInt(payment.metadata.user_id);
          
          // Verhoog order count en spent in user DNA
          await tx.update(users)
            .set({ 
              lastActive: new Date(),
              updatedAt: new Date()
            })
            .where(eq(users.id, userId));
            
          console.log(` Intelligence: DNA updated for user ${userId} after successful payment.`);
        }

        // 🛡️ CHRIS-PROTOCOL: Invalidate Customer 360 Cache (v2.14.347)
        try {
          const cacheKey = `customer_360_${payment.metadata.email || order.users?.email}`;
          if (cacheKey) {
            await sdkClient.from('app_configs').delete().eq('key', cacheKey);
            console.log(`[Automation] UCI Cache invalidated for ${payment.metadata.email || order.users?.email}`);
          }
        } catch (cacheErr) {
          console.warn('[Automation] Failed to invalidate UCI cache in webhook:', cacheErr);
        }

        //  Notificatie naar Admin (HITL)
        try {
          const isSameDay = (order.rawMeta as any)?.items?.some((i: any) => i.actor?.delivery_config?.type === 'sameday');
          const siteUrl = MarketManager.getMarketDomains()[market.market_code] || `https://${MarketManager.getMarketDomains()['BE']?.replace('https://', '') || 'www.voices.be'}`;
          const fetchUrl = `${siteUrl}/api/admin/notify`;
          
          await fetch(fetchUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              type: isSameDay ? 'sameday_alert' : 'payment_received',
              data: {
                orderId: orderId,
                email: payment.metadata.email || 'Gast',
                amount: payment.amount.value,
                company: payment.metadata.company,
                items: (order.rawMeta as any)?.items || [],
                customer: { first_name: payment.metadata.givenName, last_name: payment.metadata.familyName }
              }
            })
          });
        } catch (mailErr) {
          console.error(' Failed to send payment notification:', mailErr);
        }
      }
    });

    return new NextResponse('OK');

  } catch (error) {
    console.error(' MOLLIE WEBHOOK ERROR:', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}
