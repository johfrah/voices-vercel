import { db } from '@db';
import { mailContent } from '@db/schema';
import { sql, desc } from 'drizzle-orm';
import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { requireAdmin } from '@/lib/auth/api-auth';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || '',
});

export const dynamic = 'force-dynamic';

/**
 *  REAL FAQ PROPOSAL API (2026)
 * 
 * Doel: Scant de mailbox op patronen van vragen en antwoorden.
 * Gebruikt AI om uit de echte mail-content FAQ suggesties te extraheren.
 */
export async function GET(request: Request) {
  const auth = await requireAdmin();
  if (auth instanceof NextResponse) return auth;

  try {
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    let whereClause = sql`${mailContent.textBody} IS NOT NULL AND ${mailContent.textBody} LIKE '%\?%'`;
    
    if (startDate && endDate) {
      whereClause = sql`${whereClause} AND ${mailContent.date} >= ${new Date(startDate)} AND ${mailContent.date} <= ${new Date(endDate)}`;
    }

    // 1. Haal de meest recente mails op die mogelijk vragen bevatten
    const recentMails = await db.query.mailContent.findMany({
      where: whereClause,
      orderBy: [desc(mailContent.date)],
      limit: 50
    });

    if (recentMails.length === 0) {
      return NextResponse.json([]);
    }

    // 2. Prepareer de mails voor de AI
    const mailContext = recentMails.map(m => ({
      id: m.id,
      subject: m.subject,
      body: m.textBody?.substring(0, 500), // Limiteer per mail voor context window
      sender: m.sender
    }));

    // 3. AI Analyse met GPT-4o-mini voor efficintie
    const response = await (openai.chat.completions as any).create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `Je bent een AI die e-mails analyseert voor een voice-over bureau (Voices.be). 
          Je taak is om veelvoorkomende vragen van klanten te identificeren en daarvoor FAQ-voorstellen te doen.
          
          Geef je antwoord in een JSON array van objecten met deze structuur:
          {
            "question": "De veelgestelde vraag",
            "suggestedAnswer": "Een beknopt, professioneel antwoord gebaseerd op de context",
            "frequency": aantal keer dat dit ongeveer voorkomt (schatting op basis van context),
            "confidence": 0.0 tot 1.0 (hoe zeker ben je van dit voorstel),
            "sourceThreadId": "id van een relevante mail"
          }`
        },
        {
          role: "user",
          content: `Analyseer de volgende recente e-mails en extraheer de belangrijkste FAQ voorstellen:\n\n${JSON.stringify(mailContext)}`
        }
      ],
      response_format: { type: "json_object" }
    });

    const content = response.choices[0].message.content;
    if (!content) throw new Error("No content from OpenAI");
    
    const result = JSON.parse(content);
    // De AI geeft soms een object met een key 'proposals' of direct de array
    const proposals = Array.isArray(result) ? result : (result.proposals || result.faq_proposals || Object.values(result)[0]);

    return NextResponse.json(Array.isArray(proposals) ? proposals : []);
  } catch (error) {
    console.error(' FAQ Proposal API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
