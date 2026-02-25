import { db, users, workshops, orders, workshopEditions, instructors } from '@/lib/system/voices-config';
import { eq, desc } from 'drizzle-orm';
import { VumeEngine } from '@/lib/mail/VumeEngine';
// MarketManager is used for domain resolution in the mail engine

/**
 *  VUME TEST SCRIPT (2026)
 * 
 * Doel: Versturen van voorbeeldmails naar Johfrah om de VUME-engine te valideren.
 * Gebruikt ECHTE data uit Supabase voor een realistische test.
 */

export async function sendTestMails(recipient: string) {
  console.log(` Starting VUME Test Suite for ${recipient}...`);

  try {
    // 1. Test Magic Link (Auth Journey) - Gebruik echte user data
    const [realUser] = await db.select().from(users).orderBy(desc(users.createdAt)).limit(1);
    // const realUser = { firstName: 'Johfrah' };
    await VumeEngine.send({
      to: recipient,
      subject: ' Test: Inloggen op Voices.be (Real Data)',
      template: 'magic-link',
      context: {
        name: realUser?.firstName || 'Johfrah',
        link: 'https://voices.be/account/callback?token=test-token',
        language: 'nl'
      },
      host: 'voices.be'
    });
    console.log(' Magic Link test mail verzonden.');

    // 2. Test Studio Experience (Studio Journey) - Gebruik echte workshop data
    const [realEdition] = await db
      .select({
        workshopTitle: workshops.title,
        date: workshopEditions.date,
        instructorName: instructors.name,
      })
      .from(workshopEditions)
      .innerJoin(workshops, eq(workshopEditions.workshopId, workshops.id))
      .innerJoin(instructors, eq(workshopEditions.instructorId, instructors.id))
      .where(eq(workshopEditions.status, 'upcoming'))
      .orderBy(desc(workshopEditions.date))
      .limit(1);

    await VumeEngine.send({
      to: recipient,
      subject: ' Test: Je plek in de studio (Real Data)',
      template: 'studio-experience',
      context: {
        name: realUser?.firstName || 'Johfrah',
        workshopName: realEdition?.workshopTitle || 'Masterclass Stemacteren',
        date: realEdition ? new Date(realEdition.date).toLocaleDateString('nl-BE', { day: 'numeric', month: 'long', year: 'numeric' }) : '25 februari 2026',
        time: '14:00',
        location: 'Voices Studio, Gent',
        language: 'nl',
        optOutToken: 'test-token-123'
      },
      host: 'voices.be'
    });
    console.log(' Studio Experience test mail verzonden.');

    // 3. Test Invoice Reply (Agency Journey) - Gebruik echte order data
    const [realOrder] = await db
      .select({
        invoiceNumber: orders.displayOrderId,
        total: orders.total,
      })
      .from(orders)
      .orderBy(desc(orders.createdAt))
      .limit(1);

    await VumeEngine.send({
      to: recipient,
      subject: ' Test: Factuur goed ontvangen (Real Data)',
      template: 'invoice-reply',
      context: {
        userName: realUser?.firstName || 'Johfrah',
        invoiceNumber: realOrder?.invoiceNumber || 'INV-2026-001',
        amount: realOrder ? parseFloat(realOrder.total || '0') : 1250.50,
        language: 'nl'
      },
      host: 'voices.be'
    });
    console.log(' Invoice Reply test mail verzonden.');

    return { success: true };
  } catch (error) {
    console.error(' VUME Test Suite Failed:', error);
    return { success: false, error };
  }
}
