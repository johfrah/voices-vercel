import { NextRequest, NextResponse } from 'next/server';
import { db } from '@db';
import { orders, orderNotes, users, orderItems, actors } from '@db/schema';
import { eq, sql, inArray } from 'drizzle-orm';
import { MollieService } from '@/lib/payments/mollie';
import { UCIService } from '@/lib/intelligence/uci-service';
import { MarketManagerServer as MarketManager } from '@/lib/system/market-manager-server';
import { MusicDeliveryService } from '@/lib/services/music-delivery-service';
import { YukiService } from '@/lib/services/yuki-service';
import { VumeEngine } from '@/lib/mail/VumeEngine';

/**
 *  MOLLIE WEBHOOK (NUCLEAR)
 * 
 * Doel: Real-time status updates van Mollie verwerken.
 * Bij succes: Order op 'paid' zetten en Customer DNA updaten.
 */

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
    const host = request.headers.get('host') || (process.env.NEXT_PUBLIC_SITE_URL?.replace('https://', '') || 'voices.be');
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
              const siteUrl = MarketManager.getMarketDomains()[market.market_code] || `https://www.voices.be`;
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
                    customer: { firstName: donationContext.donorName }
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

      //  Als betaald: Lever muziek en update DNA + Sales + Yuki + Actor Notification
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

          // 🛡️ CHRIS-PROTOCOL: AUTOMATED ACTOR NOTIFICATION (v2.14.328)
          // We sturen direct een opdrachtbevestiging naar alle betrokken acteurs
          (async () => {
            const siteUrl = MarketManager.getMarketDomains()[market.market_code] || `https://www.voices.be`;
            for (const item of items) {
              if (item.actorId) {
                try {
                  await fetch(`${siteUrl}/api/admin/notify/actor`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ actorId: item.actorId, orderId, itemData: item.metaData })
                  });
                  console.log(`[Automation] Actor ${item.actorId} notified for Order #${orderId}`);
                } catch (actorNotifyErr) {
                  console.warn(`[Automation] Failed to notify actor ${item.actorId}:`, actorNotifyErr);
                }
              }
            }
          })();

          // 🛡️ CHRIS-PROTOCOL: AUTOMATED CUSTOMER CONFIRMATION (v2.14.328)
          if (order) {
            const [user] = await tx.select().from(users).where(eq(users.id, order.userId as number)).limit(1);
            if (user) {
              (async () => {
                try {
                  await VumeEngine.send({
                    to: user.email,
                    subject: `Bestelling Bevestigd: #${orderId} - Voices.be`,
                    template: 'order-confirmation',
                    context: {
                      userName: user.firstName || 'Klant',
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

        // 3. AUTOMATED YUKI INVOICING (v2.14.328)
        if (order) {
          const [user] = await tx.select().from(users).where(eq(users.id, order.userId as number)).limit(1);
          if (user) {
            (async () => {
              try {
                const items = await tx.select().from(orderItems).where(eq(orderItems.orderId, orderId));
                await YukiService.createInvoice({
                  orderId,
                  paymentId,
                  customer: {
                    firstName: user.firstName || 'Klant',
                    lastName: user.lastName || '',
                    email: user.email,
                    companyName: user.companyName || undefined,
                    vatNumber: user.vatNumber || undefined,
                    address: user.addressStreet || undefined,
                    city: user.addressCity || undefined,
                    zipCode: user.addressZip || undefined,
                    countryCode: user.addressCountry || 'BE'
                  },
                  lines: items.map(i => ({
                    description: i.name,
                    quantity: i.quantity || 1,
                    price: parseFloat(i.price || '0'),
                    vatType: 1 // 21%
                  })),
                  paymentMethod: payment.method || 'Online'
                });
                console.log(`[Automation] Yuki invoice triggered for Order #${orderId}`);
              } catch (yukiErr) {
                console.warn(`[Automation] Yuki sync failed for Order #${orderId}:`, yukiErr);
              }
            })();
          }
        }

        if (payment.metadata.userId) {
          const userId = parseInt(payment.metadata.userId);
          
          // Verhoog order count en spent in user DNA
          await tx.update(users)
            .set({ 
              lastActive: new Date(),
              updatedAt: new Date()
            })
            .where(eq(users.id, userId));
            
          console.log(` Intelligence: DNA updated for user ${userId} after successful payment.`);
        }

        //  Notificatie naar Admin (HITL)
        try {
          const isSameDay = (order.rawMeta as any)?.items?.some((i: any) => i.actor?.delivery_config?.type === 'sameday');
          const siteUrl = MarketManager.getMarketDomains()[market.market_code] || `https://www.voices.be`;
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
                customer: { firstName: payment.metadata.givenName, lastName: payment.metadata.familyName }
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
