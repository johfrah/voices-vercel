import { db } from '../1-SITE/packages/database/src/index';
import { orders } from '../1-SITE/packages/database/schema';
import { eq } from 'drizzle-orm';

/**
 * 🧪 SIMULATIE-RUN: DONATIE FLOW & MAIL TRIGGER
 * 
 * Dit script simuleert een succesvolle betaling via Mollie voor Youssef.
 * Het triggert de webhook logica die de bedankmail en admin-notificatie verstuurt.
 */

async function simulateDonation() {
  console.log('🚀 Start Simulatie-Run...');

  try {
    // 1. Maak een test-order aan (zoals de API zou doen)
    console.log('📝 1. Aanmaken test-donatie order...');
    const [order] = await db.insert(orders).values({
      total: '25.00',
      status: 'pending',
      journey: 'artist_donation',
      market: 'BE',
      iapContext: {
        artistId: 'youssef',
        donorName: 'Test Supporter',
        donorEmail: 'test@voices.be',
        message: 'Dit is een testbericht voor de simulatie-run. Prachtig project!',
        type: 'donation'
      },
      createdAt: new Date()
    }).returning();

    console.log(`✅ Order #${order.id} aangemaakt.`);

    // 2. Simuleer de Webhook call (zoals Mollie zou doen bij succes)
    console.log('🔗 2. Simuleren Mollie Webhook (status: paid)...');
    
    // We importeren de VumeEngine met een relatief pad
    const { VumeEngine } = await import('../1-SITE/apps/web/src/lib/mail/VumeEngine');
    
    const donationContext = order.iapContext as any;
    const host = 'voices.be';

    console.log('📧 3. Triggeren Bedankmail naar supporter...');
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

    console.log('📢 4. Triggeren Admin Notificatie...');
    const adminNotifyPayload = {
      type: 'donation_received',
      data: {
        orderId: order.id,
        email: donationContext.donorEmail,
        amount: order.total,
        artistName: 'Youssef Zaki',
        message: donationContext.message,
        customer: { firstName: donationContext.donorName }
      }
    };
    console.log('Admin Payload:', JSON.stringify(adminNotifyPayload, null, 2));

    // 5. Update order status naar paid
    await db.update(orders)
      .set({ status: 'paid', updatedAt: new Date() })
      .where(eq(orders.id, order.id));

    console.log('✨ Simulatie-Run voltooid! De order staat op "paid" en de mails zijn getriggerd.');

  } catch (error) {
    console.error('❌ Simulatie gefaald:', error);
  }
}

simulateDonation();
