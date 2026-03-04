import { NextRequest, NextResponse } from 'next/server';
import { db, orders, orderNotes, users, orderItems, actors, ordersV2, orderStatuses } from '@/lib/system/voices-config';
import { eq, sql, inArray } from 'drizzle-orm';
import { MollieService } from '@/lib/payments/mollie';
import { UCIService } from '@/lib/intelligence/uci-service';
import { MarketManagerServer as MarketManager } from "@/lib/system/core/market-manager";
import { MusicDeliveryService } from '@/lib/services/music-delivery-service';
import { YukiService } from '@/lib/services/yuki-service';
import { VumeEngine } from '@/lib/mail/VumeEngine';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { localeToShort, normalizeLocale } from '@/lib/system/locale-utils';
import { mapMollieOrderToPaymentLike, normalizeMollieStatus } from '@/lib/payments/mollie-webhook-utils';

/**
 *  MOLLIE WEBHOOK (NUCLEAR)
 * 
 * Doel: Real-time status updates van Mollie verwerken.
 * Bij succes: Order op 'paid' zetten en Customer DNA updaten.
 */

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const sdkClient = createSupabaseClient(supabaseUrl, supabaseKey);

function v2StatusCandidates(statusCode: string): string[] {
  const normalized = String(statusCode || '').toLowerCase();
  if (normalized === 'completed') return ['completed', 'completed_paid', 'paid'];
  if (normalized === 'paid') return ['paid', 'completed_paid', 'completed'];
  if (normalized === 'pending') return ['pending', 'awaiting_payment', 'unpaid'];
  if (normalized === 'cancelled') return ['cancelled', 'failed'];
  if (normalized === 'expired') return ['failed', 'cancelled'];
  if (normalized === 'failed') return ['failed', 'cancelled'];
  if (normalized === 'in_productie') return ['in_productie', 'in_progress', 'processing', 'active'];
  return [normalized];
}

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
    let payment: any;
    let transactionSource: 'payment' | 'order' = 'payment';
    const looksLikeOrderId = paymentId.startsWith('ord_');
    try {
      if (looksLikeOrderId) {
        const mollieOrder = await MollieService.getOrder(paymentId);
        payment = mapMollieOrderToPaymentLike(mollieOrder, paymentId);
        transactionSource = 'order';
      } else {
        payment = await MollieService.getPayment(paymentId);
      }
    } catch (mollieErr: any) {
      if (!looksLikeOrderId) {
        try {
          const mollieOrder = await MollieService.getOrder(paymentId);
          payment = mapMollieOrderToPaymentLike(mollieOrder, paymentId);
          transactionSource = 'order';
        } catch (orderErr: any) {
          console.error('[Mollie Webhook] Failed to fetch payment/order:', mollieErr.message, orderErr?.message);
          return new NextResponse('Payment Not Found', { status: 404 });
        }
      } else {
        console.error('[Mollie Webhook] Failed to fetch order:', mollieErr.message);
        return new NextResponse('Payment Not Found', { status: 404 });
      }
    }

    const paymentMetadata = (payment?.metadata || {}) as Record<string, any>;
    const orderId = parseInt(String(paymentMetadata.orderId || paymentMetadata.order_id || ''));

    if (!orderId) {
      console.warn('[Mollie Webhook] Invalid or missing Order ID in metadata:', paymentMetadata);
      return new NextResponse('Invalid Metadata', { status: 400 });
    }

    // 2. Update de order status op basis van Mollie
    const newStatus = normalizeMollieStatus(payment.status);

    //  NUCLEAR CONFIG: Haal admin e-mail uit MarketManager of ENV
    const host = request.headers.get('host') || (process.env.NEXT_PUBLIC_SITE_URL?.replace('https://', '') || MarketManager.getMarketDomains()['BE']?.replace('https://', ''));
    const market = MarketManager.getCurrentMarket(host);
    const adminEmail = process.env.ADMIN_EMAIL || market.email;

    await db.transaction(async (tx: any) => {
      // Haal de order op om te zien wat erin zit
      const [order] = await tx.select().from(orders).where(eq(orders.id, orderId)).limit(1);
      const orderLanguage = normalizeLocale(
        (order?.rawMeta as any)?.language ||
        paymentMetadata.language ||
        market.primary_language ||
        'nl-be'
      );
      const orderLanguageShort = localeToShort(orderLanguage);
      
      // Update Order status
      let finalStatus: string = newStatus;
      
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
                subject: orderLanguageShort === 'fr'
                  ? 'Merci pour votre soutien à Youssef Zaki !'
                  : orderLanguageShort === 'en'
                    ? 'Thank you for supporting Youssef Zaki!'
                    : 'Bedankt voor je support aan Youssef Zaki!',
                template: 'donation-thank-you',
                context: {
                  name: donationContext.donorName || 'Supporter',
                  amount: order.total,
                  artistName: 'Youssef Zaki',
                  message: donationContext.message,
                  language: orderLanguage
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

      // 🔁 V2 status sync: keep orders_v2 aligned with webhook transitions.
      if (order?.wpOrderId) {
        const candidateCodes = v2StatusCandidates(finalStatus);
        const statusRows = await tx
          .select({ id: orderStatuses.id, code: orderStatuses.code })
          .from(orderStatuses)
          .where(inArray(orderStatuses.code, candidateCodes))
          .limit(1);
        const matchedStatus = statusRows[0];
        if (matchedStatus) {
          await tx
            .update(ordersV2)
            .set({
              statusId: matchedStatus.id,
              legacyInternalId: order.id,
            })
            .where(eq(ordersV2.id, Number(order.wpOrderId)));
        }
      }

      // Log Note
      await tx.insert(orderNotes).values({
        orderId: orderId,
        note: `Mollie Status Update: ${newStatus}${finalStatus === 'in_productie' ? ' (Auto-status: In Productie)' : finalStatus === 'completed' ? ' (Auto-completed: Music Only)' : ''} (${transactionSource} ID: ${paymentId})`,
        isCustomerNote: false
      });

      //  Als betaald: Lever muziek en update DNA + Sales
      if (newStatus === 'paid') {
        // 1. Verhoog total_sales voor de betrokken acteurs
        try {
          const items = await tx.select({ actorId: orderItems.actorId, name: orderItems.name, price: orderItems.price, metaData: orderItems.metaData })
            .from(orderItems)
            .where(eq(orderItems.orderId, orderId));
          
          const actorIds = items
            .map((i: any) => i.actorId)
            .filter((id: number | null): id is number => id !== null);
          
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
                    subject: orderLanguageShort === 'fr'
                      ? `Commande confirmée : #${orderId} - Voices`
                      : orderLanguageShort === 'en'
                        ? `Order confirmed: #${orderId} - Voices`
                        : `Bestelling Bevestigd: #${orderId} - Voices`,
                    template: 'order-confirmation',
                    context: {
                      userName: user.first_name || 'Klant',
                      orderId: orderId.toString(),
                      total: parseFloat(order.total || '0'),
                      items: items.map((i: any) => ({
                        name: i.name,
                        price: parseFloat(i.price || '0'),
                        deliveryTime: (i.metaData as any)?.deliveryTime
                      })),
                      paymentMethod: payment.method || 'Online',
                      language: orderLanguage
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

        // 2. Creëer Dropbox Exports folder voor deze order
        try {
          const dropboxParams = new URLSearchParams();
          dropboxParams.append('grant_type', 'refresh_token');
          dropboxParams.append('refresh_token', process.env.DROPBOX_REFRESH_TOKEN || '');
          dropboxParams.append('client_id', process.env.DROPBOX_CLIENT_ID || '');
          dropboxParams.append('client_secret', process.env.DROPBOX_CLIENT_SECRET || '');
          const tokenRes = await fetch('https://api.dropboxapi.com/oauth2/token', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: dropboxParams
          });
          const { access_token: dbxToken } = await tokenRes.json();
          
          if (dbxToken) {
            const exportBase = `/Voices.be/Projects/Exports/${orderId}`;
            // 🛡️ CHRIS-PROTOCOL: ID-First Handshake — Telephony = journey_id 26
            const orderJourneyId = (order as any)?.journeyId ?? (order as any)?.journey_id;
            const metaJourneyId = (order?.rawMeta as any)?.journeyId ?? (order?.rawMeta as any)?.journey_id;
            const isTelephony = orderJourneyId === 26 || metaJourneyId === 26;
            const subFolders = isTelephony 
              ? ['48kHz 24bit', '8kHz 16bit', '16kHz 16bit']
              : ['48kHz 24bit'];
            
            for (const sub of subFolders) {
              await fetch('https://api.dropboxapi.com/2/files/create_folder_v2', {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${dbxToken}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({ path: `${exportBase}/${sub}`, autorename: false })
              }).catch(() => {});
            }
            
            // Save Dropbox folder URL on the order
            const dropboxUrl = `https://www.dropbox.com/home/Voices.be/Projects/Exports/${orderId}`;
            await tx.update(orders)
              .set({ dropboxFolderUrl: dropboxUrl })
              .where(eq(orders.id, orderId));
            
            console.log(` [Dropbox] Exports folder created: ${exportBase}`);
          }
        } catch (dropboxErr) {
          console.error(' Failed to create Dropbox folder:', dropboxErr);
        }

        // 3. Lever muziek uit indien aanwezig in de order
        try {
          await MusicDeliveryService.deliverMusic(orderId);
        } catch (musicErr) {
          console.error(' Failed to deliver music after payment:', musicErr);
        }

        // 🛡️ CHRIS-PROTOCOL: HITL MANDATE (v2.14.332)
        // We maken GEEN automatische Yuki factuur meer aan.
        // De admin triggert dit handmatig na controle.

        if (paymentMetadata.user_id) {
          const userId = parseInt(String(paymentMetadata.user_id));
          
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
          const cacheKey = `customer_360_${paymentMetadata.email || order.users?.email}`;
          if (cacheKey) {
            await sdkClient.from('app_configs').delete().eq('key', cacheKey);
            console.log(`[Automation] UCI Cache invalidated for ${paymentMetadata.email || order.users?.email}`);
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
                email: paymentMetadata.email || 'Gast',
                amount: payment?.amount?.value || '0.00',
                company: paymentMetadata.company,
                items: (order.rawMeta as any)?.items || [],
                customer: { first_name: paymentMetadata.givenName, last_name: paymentMetadata.familyName }
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
