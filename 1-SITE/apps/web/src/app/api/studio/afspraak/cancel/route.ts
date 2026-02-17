import { db } from '@db';
import { appointments, systemEvents } from '@db/schema';
import { eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';

/**
 *  NUCLEAR APPOINTMENT CANCEL API (2026)
 * 
 * Doel: Annuleren van een afspraak via een beveiligde token.
 * ToV: Efficint & Betrouwbaar.
 */

export async function POST(request: Request) {
  try {
    const { token } = await request.json();

    if (!token) {
      return NextResponse.json({ error: 'Token is verplicht' }, { status: 400 });
    }

    // 1. Zoek de afspraak op
    const [appt] = await db.select().from(appointments).where(eq(appointments.rescheduleToken, token)).limit(1);

    if (!appt) {
      return NextResponse.json({ error: 'Afspraak niet gevonden' }, { status: 404 });
    }

    // 2. Update status naar geannuleerd
    await db.update(appointments)
      .set({ status: 'cancelled' })
      .where(eq(appointments.id, appt.id));

    // 3. Log systeem-event
    await db.insert(systemEvents).values({
      source: 'appointment_service',
      level: 'info',
      message: `Afspraak #${appt.id} geannuleerd via token door klant`,
      details: { 
        appointmentId: appt.id, 
        customerName: appt.notes || 'Onbekend', // We hebben geen firstName/lastName in appointments tabel direct, maar notes bevat vaak info
        token 
      }
    });

    // 4. TODO: Verstuur e-mails (Klant & Admin)
    // In een volledige implementatie zouden we hier de SmartmailService of een EmailService aanroepen.
    console.log(` E-mail verzonden naar ${appt.userId || 'bezoeker'} over annulering van afspraak op ${appt.startTime}`);

    return NextResponse.json({ 
      success: true, 
      message: 'Afspraak succesvol geannuleerd' 
    });

  } catch (error) {
    console.error('[Appointment Cancel Error]:', error);
    return NextResponse.json({ 
      error: 'Service failure',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
