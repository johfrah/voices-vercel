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
 *  REAL MAILBOX INSIGHTS API (2026)
 * 
 * Doel: Genereert trends, SWOT en sentiment analyses op basis van echte mailbox data.
 * Inclusief bron-verwijzingen en actiepunten.
 */
export async function GET(request: Request) {
  const auth = await requireAdmin();
  if (auth instanceof NextResponse) return auth;

  try {
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const compare = searchParams.get('compare') === 'true';

    let whereClause = sql`${mailContent.textBody} IS NOT NULL`;
    
    if (startDate && endDate) {
      whereClause = sql`${whereClause} AND ${mailContent.date} >= ${new Date(startDate)} AND ${mailContent.date} <= ${new Date(endDate)}`;
    }

    // 1. Haal de mails op voor de geselecteerde periode
    const currentPeriodMails = await db.query.mailContent.findMany({
      where: whereClause,
      orderBy: [desc(mailContent.date)],
      limit: 100
    });

    // 2. Als vergelijking aan staat, haal ook de vorige periode op
    let previousPeriodContext = "";
    if (compare && startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      const duration = end.getTime() - start.getTime();
      
      const prevStart = new Date(start.getTime() - duration);
      const prevEnd = new Date(end.getTime() - duration);

      const previousMails = await db.query.mailContent.findMany({
        where: sql`${mailContent.textBody} IS NOT NULL AND ${mailContent.date} >= ${prevStart} AND ${mailContent.date} <= ${prevEnd}`,
        orderBy: [desc(mailContent.date)],
        limit: 100
      });

      previousPeriodContext = `HIERONDER DE DATA VAN DE VORIGE PERIODE (${prevStart.toLocaleDateString()} tot ${prevEnd.toLocaleDateString()}) TER VERGELIJKING:\n${JSON.stringify(previousMails.map(m => ({ subject: m.subject, body: m.textBody?.substring(0, 200) })))}`;
    }

    if (currentPeriodMails.length === 0) {
      return NextResponse.json({
        trends: [],
        swot: { strengths: [], weaknesses: [], opportunities: [], threats: [] },
        sentiment: { score: 0, label: "Geen data", topPositive: "N/A", topNegative: "N/A" }
      });
    }

    // 3. Prepareer de context voor de AI
    const mailContext = currentPeriodMails.map(m => ({
      id: m.id,
      subject: m.subject,
      body: m.textBody?.substring(0, 300),
      date: m.date,
      sender: m.sender
    }));

    // 4. AI Analyse met GPT-4o-mini
    const response = await (openai.chat.completions as any).create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `Je bent een business analist voor Voices.be. 
          Analyseer de e-mail data en genereer inzichten in JSON formaat.
          
          BELANGRIJK: 
          1. Voor elke trend of SWOT punt, geef aan welke e-mails (IDs) dit onderbouwen.
          2. Koppel aan elk inzicht concrete "vooruitdenkende acties" (recommendations).
          
          Structuur:
          {
            "trends": [
              { 
                "label": "Naam", 
                "change": "+X%", 
                "status": "up", 
                "explanation": "Uitleg",
                "sourceMailIds": [123, 456],
                "actions": ["Actie 1", "Actie 2"]
              }
            ],
            "swot": {
              "strengths": [{ "text": "...", "sourceMailIds": [], "actions": [] }],
              "weaknesses": [{ "text": "...", "sourceMailIds": [], "actions": [] }],
              "opportunities": [{ "text": "...", "sourceMailIds": [], "actions": [] }],
              "threats": [{ "text": "...", "sourceMailIds": [], "actions": [] }]
            },
            "sentiment": {
              "score": 8.4,
              "label": "...",
              "topPositive": { "text": "...", "sourceMailIds": [] },
              "topNegative": { "text": "...", "sourceMailIds": [] }
            },
            "comparisonSummary": "...",
            "sourceMails": ${JSON.stringify(mailContext.slice(0, 10))} // De AI mag hier refereren naar de mails
          }`
        },
        {
          role: "user",
          content: `Huidige periode data:\n${JSON.stringify(mailContext)}\n\n${previousPeriodContext}`
        }
      ],
      response_format: { type: "json_object" }
    });

    const content = response.choices[0].message.content;
    if (!content) throw new Error("No content from OpenAI");
    
    const insights = JSON.parse(content);
    
    // Voeg de volledige mail objecten toe voor de frontend drill-down
    insights.allSourceMails = mailContext;

    return NextResponse.json(insights);
  } catch (error) {
    console.error(' Mailbox Insights API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
