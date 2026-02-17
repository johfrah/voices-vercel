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
    if (payment.isPaid()) newStatus = 'paid';
    if (payment.isCanceled()) newStatus = 'cancelled';
    if (payment.isExpired()) newStatus = 'expired';
    if (payment.isFailed()) newStatus = 'failed';

    //  NUCLEAR CONFIG: Haal admin e-mail uit MarketManager of ENV
    const host = request.headers.get('host') || 'voices.be';
    const market = MarketManager.getCurrentMarket(host);
    const adminEmail = process.env.ADMIN_EMAIL || market.email;

    await db.transaction(async (tx) => {
      // Haal de order op om te zien wat erin zit
      const [order] = await tx.select().from(orders).where(eq(orders.id, orderId)).limit(1);
      
      // Update Order status
      let finalStatus = newStatus;
      
      //  Als betaald: Check of het een "Music Only" order is
      if (newStatus === 'paid' && order) {
        const hasVoice = (order.rawMeta as any)?.actorId || (order.rawMeta as any)?.voiceId;
        const hasMusic = (order.rawMeta as any)?.music?.trackId;
        
        // Als er ENKEL muziek is (geen stem), zetten we de order direct op 'completed'
        if (hasMusic && !hasVoice) {
          finalStatus = 'completed';
          console.log(` Order #${orderId} is Music Only. Setting status to 'completed'.`);
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
          const { DirectMailService } = await import('@/services/DirectMailService');
          const mailService = DirectMailService.getInstance();
          await mailService.sendMail({
            to: adminEmail,
            subject: ` Nieuwe Betaling Ontvangen: Order #${orderId}`,
            html: `
              <div style="font-family: sans-serif; padding: 40px; background: #f9f9f9; border-radius: 24px;">
                <h2 style="color: #ff4f00;"> Nieuwe Betaling</h2>
                <p>Er is een nieuwe betaling succesvol verwerkt via Mollie.</p>
                <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
                <p><strong>Order ID:</strong> #${orderId}</p>
                <p><strong>Bedrag:</strong> ${payment.amount.value}</p>
                <p><strong>Klant ID:</strong> ${payment.metadata.userId || 'Gast'}</p>
                <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
                <p>Bekijk de details in de <a href="${process.env.NEXT_PUBLIC_SITE_URL}/admin/dashboard">Voices Cockpit</a>.</p>
              </div>
            `
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
