import { NextRequest, NextResponse } from 'next/server';
import { db } from '@db';
import { orders, orderNotes, users } from '@db/schema';
import { eq, sql } from 'drizzle-orm';
import { MollieService } from '@/lib/payments/mollie';
import { UCIService } from '@/lib/intelligence/uci-service';
import { MarketManager } from '@config/market-manager';
import { MusicDeliveryService } from '@/services/MusicDeliveryService';

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
      return new NextResponse('Missing ID', { status: 400 });
    }

    // 1. Haal de status op bij Mollie
    const payment = await MollieService.getPayment(paymentId);
    const orderId = parseInt(payment.metadata.orderId);

    if (!orderId) {
      return new NextResponse('Invalid Metadata', { status: 400 });
    }

    // 2. Update de order status op basis van Mollie
    let newStatus = 'pending';
    if (payment.status === 'paid') newStatus = 'paid';
    if (payment.status === 'canceled') newStatus = 'cancelled';
    if (payment.status === 'expired') newStatus = 'expired';
    if (payment.status === 'failed') newStatus = 'failed';

    //  NUCLEAR CONFIG: Haal admin e-mail uit MarketManager of ENV
    const host = request.headers.get('host') || 'voices.be';
    const market = MarketManager.getCurrentMarket(host);
    const adminEmail = process.env.ADMIN_EMAIL || market.email;

    await db.transaction(async (tx) => {
      // Haal de order op om te zien wat erin zit
      const [order] = await tx.select().from(orders).where(eq(orders.id, orderId)).limit(1);
      
      // Update Order status
      let finalStatus = newStatus;
      
      //  Als betaald: Check of het een "Music Only" of "Donation" order is
      if (newStatus === 'paid' && order) {
        const hasVoice = (order.rawMeta as any)?.actorId || (order.rawMeta as any)?.voiceId;
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
              const { VumeEngine } = await import('@/lib/mail/VumeEngine');
              await VumeEngine.send({
                to: donationContext.donorEmail,
                subject: `Bedankt voor je support aan Youssef Zaki!`,
                template: 'donation-thank-you',
                context: {
                  name: donationContext.donorName || 'Supporter',
                  amount: order.total,
                  artistName: 'Youssef Zaki',
                  message: donationContext.message,
                  language: 'nl'
                },
                host: host
              });
              console.log(` Donation: Thank you email sent to ${donationContext.donorEmail}`);

              //  Notificatie naar Admin (Donatie specifiek)
              const fetchUrl = `${process.env.NEXT_PUBLIC_BASE_URL || `https://${host}`}/api/admin/notify`;
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
        note: `Mollie Status Update: ${newStatus}${finalStatus === 'completed' ? ' (Auto-completed: Music Only)' : ''} (Payment ID: ${paymentId})`,
        isCustomerNote: false
      });

      //  Als betaald: Lever muziek en update DNA
      if (newStatus === 'paid') {
        //  Lever muziek uit indien aanwezig in de order
        try {
          await MusicDeliveryService.deliverMusic(orderId);
        } catch (musicErr) {
          console.error(' Failed to deliver music after payment:', musicErr);
          // We gaan door, want de betaling is wel gelukt
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
          const fetchUrl = `${process.env.NEXT_PUBLIC_BASE_URL || `https://${host}`}/api/admin/notify`;
          
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
