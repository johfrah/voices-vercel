import { db } from '@db';
import { mailContent, faq } from '@db/schema';
import { desc, eq, and, sql } from 'drizzle-orm';
import { NextResponse } from 'next/server';

/**
 *  NATURAL FAQ ENGINE (2026)
 * 
 * Doel: Scant de mailbox op patronen (vraag/antwoord paren) en stelt nieuwe FAQ items voor.
 * Dit is de basis voor 'Automated Drafting'.
 */
export async function GET() {
  try {
    // 1. Haal recente mails op die antwoorden bevatten (bijv. van Johfrah)
    const recentReplies = await db.query.mailContent.findMany({
      where: sql`${mailContent.sender} LIKE '%johfrah@voices.be%'`,
      orderBy: [desc(mailContent.date)],
      limit: 20
    });

    // 2.  AI PATTERN RECOGNITION (Simulatie)
    // In Beheer-modus zou een LLM hier de 'thread' analyseren.
    const suggestions = [
      {
        question: "Wat zijn de tarieven voor AI-stemmen?",
        suggestedAnswer: "Onze AI-stemmen vallen onder het 'Unpaid' tarief van 150 voor online gebruik.",
        confidence: 0.92,
        sourceMailId: recentReplies[0]?.id
      },
      {
        question: "Hoe snel kan een stem leveren?",
        suggestedAnswer: "De meeste stemmen leveren binnen 24 tot 48 uur. Voor spoed raden we aan de 'Same Day' filter te gebruiken.",
        confidence: 0.88,
        sourceMailId: recentReplies[1]?.id
      }
    ];

    return NextResponse.json(suggestions);
  } catch (error) {
    console.error(' FAQ Engine Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
