import { db, mailContent } from '@/lib/system/voices-config';
import { eq, sql, desc, and } from 'drizzle-orm';
import { NextResponse } from 'next/server';

/**
 *  TIME-TRAVEL API (2026)
 * 
 * Doel: Haalt de emotionele geschiedenis en 'Vibe Check' op van een klant.
 */
export async function GET(request: Request, { params }: { params: { userId: string } }) {
  const userId = parseInt(params.userId);
  if (isNaN(userId)) return NextResponse.json({ error: 'Invalid userId' }, { status: 400 });

  try {
    // 1. Haal de oudste en nieuwste mail op
    const history = await db.query.mailContent.findMany({
      where: sql`iap_context->>'userId' = ${userId.toString()}`,
      orderBy: [desc(mailContent.date)],
      limit: 50
    });

    if (history.length === 0) return NextResponse.json({ vibe: 'New Client', summary: 'Geen eerdere geschiedenis gevonden.' });

    // 2. Analyseer patronen (Simulatie van AI-logica)
    const totalMails = history.length;
    const lastMailDate = new Date(history[0].date!);
    const yearsActive = new Date().getFullYear() - new Date(history[history.length - 1].date!).getFullYear();
    
    const vibe = yearsActive > 2 ? 'Loyal Partner' : 'Rising Star';
    const summary = `Klant is al ${yearsActive} jaar actief. Totaal ${totalMails} interacties.`;
    
    // 3. Vibe Check (Detecteer sentiment in laatste mails)
    let sentiment = 'Neutral';
    const textSample = history.slice(0, 5).map(m => m.textBody).join(' ').toLowerCase();
    if (textSample.includes('bedankt') || textSample.includes('top') || textSample.includes('super')) sentiment = 'Positive';
    if (textSample.includes('klacht') || textSample.includes('fout') || textSample.includes('jammer')) sentiment = 'Attention Required';

    return NextResponse.json({
      vibe,
      summary,
      sentiment,
      firstContact: history[history.length - 1].date,
      totalInteractions: totalMails
    });
  } catch (error) {
    console.error(' Time-Travel API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
