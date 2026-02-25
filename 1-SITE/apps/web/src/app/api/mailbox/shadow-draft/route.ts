import { db, mailContent } from '@/lib/system/voices-config';
import { eq, sql, desc } from 'drizzle-orm';
import { ShadowPersonaService } from '@/lib/services/shadow-persona-service';
import { VectorService } from '@/lib/services/vector-service';
import { NextResponse } from 'next/server';

/**
 *  NUCLEAR SHADOW DRAFT API (v2 - 2026)
 * 
 * Doel: Genereert een AI-concept antwoord d.m.v. Semantic Style Matching.
 * In plaats van de laatste 50 mails, zoekt Voicy naar de meest relevante 
 * historische antwoorden van Johfrah voor DIT specifieke onderwerp.
 */
export async function POST(request: Request) {
  try {
    const { mailId } = await request.json();
    if (!mailId) return NextResponse.json({ error: 'Missing mailId' }, { status: 400 });

    // 1. Haal de inkomende mail op
    const incomingMail = await db.query.mailContent.findFirst({
      where: eq(mailContent.id, mailId)
    });
    if (!incomingMail) return NextResponse.json({ error: 'Mail not found' }, { status: 404 });

    // 2. SEMANTIC STYLE MATCHING (RAG)
    // We zoeken in de database naar mails die Johfrah heeft VERZONDEN
    // en die semantisch lijken op de inkomende vraag.
    const vectorService = VectorService.getInstance();
    const queryVector = await vectorService.generateEmbedding((incomingMail.textBody || incomingMail.subject) || '');
    const formattedVector = `[${queryVector.join(',')}]`;

    // Zoek naar de top 5 meest relevante verzonden mails van de admin
    const relevantSentMails = await db.execute(sql`
      SELECT text_body as "textBody", subject
      FROM mail_content
      WHERE sender ILIKE ${'%' + (process.env.ADMIN_EMAIL || VOICES_CONFIG.company.email) + '%'}
      OR sender ILIKE '%voices.%'
      AND embedding IS NOT NULL
      AND text_body IS NOT NULL
      ORDER BY embedding <=> ${formattedVector}::vector
      LIMIT 5
    `);

    // 3. Bouw de Style Context
    // Als we geen relevante mails vinden, vallen we terug op de laatste verzonden mails
    let styleSample = "";
    if (relevantSentMails.length > 0) {
      console.log(` Semantic Style Matching: ${relevantSentMails.length} vergelijkbare antwoorden gevonden.`);
      styleSample = relevantSentMails.map((m: any) => `ONDERWERP: ${m.subject}\nANTWOORD: ${m.textBody}`).join('\n---\n');
    } else {
      const fallbackMails = await db.query.mailContent.findMany({
        where: sql`sender ILIKE ${'%' + (process.env.ADMIN_EMAIL || VOICES_CONFIG.company.email) + '%'} OR sender ILIKE '%voices.%'`,
        limit: 3,
        orderBy: [desc(mailContent.date)]
      });
      styleSample = fallbackMails.map(s => s.textBody).join('\n---\n');
    }

    // 4. Genereer het concept met de specifieke context
    const personaService = ShadowPersonaService.getInstance();
    const conversationHistory = `KLANT: ${incomingMail.textBody}`;
    const draft = await personaService.generateDraft(conversationHistory, styleSample);

    return NextResponse.json({ 
      draft,
      matchCount: relevantSentMails.length,
      method: relevantSentMails.length > 0 ? 'semantic_matching' : 'fallback_recent'
    });
  } catch (error) {
    console.error(' Nuclear Shadow Draft Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
