import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { requireAdmin } from '@/lib/auth/api-auth';
import { createClient } from "@supabase/supabase-js";

//  CHRIS-PROTOCOL: SDK fallback for production stability (v2.14.416)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || '',
});

export const dynamic = 'force-dynamic';

/**
 *  REAL MAILBOX INSIGHTS API (NUCLEAR SDK 2026)
 * 
 * Doel: Genereert trends, SWOT en sentiment analyses via SDK.
 */
export async function GET(request: Request) {
  const auth = await requireAdmin();
  if (auth instanceof NextResponse) return auth;

  try {
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const compare = searchParams.get('compare') === 'true';

    let query = supabase
      .from('mail_content')
      .select('id, subject, text_body, date, sender')
      .not('text_body', 'is', null);
    
    if (startDate && endDate) {
      query = query.gte('date', startDate).lte('date', endDate);
    }

    const { data: currentPeriodMails, error } = await query
      .order('date', { ascending: false })
      .limit(100);

    if (error) throw error;

    // 2. Als vergelijking aan staat, haal ook de vorige periode op
    let previousPeriodContext = "";
    if (compare && startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      const duration = end.getTime() - start.getTime();
      
      const prevStart = new Date(start.getTime() - duration).toISOString();
      const prevEnd = new Date(end.getTime() - duration).toISOString();

      const { data: previousMails } = await supabase
        .from('mail_content')
        .select('subject, text_body')
        .not('text_body', 'is', null)
        .gte('date', prevStart)
        .lte('date', prevEnd)
        .order('date', { ascending: false })
        .limit(100);

      if (previousMails) {
        previousPeriodContext = `HIERONDER DE DATA VAN DE VORIGE PERIODE (${new Date(prevStart).toLocaleDateString()} tot ${new Date(prevEnd).toLocaleDateString()}) TER VERGELIJKING:\n${JSON.stringify(previousMails.map(m => ({ subject: m.subject, body: m.text_body?.substring(0, 200) })))}`;
      }
    }

    if (!currentPeriodMails || currentPeriodMails.length === 0) {
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
      body: m.text_body?.substring(0, 300),
      date: m.date,
      sender: m.sender
    }));

    // 4. AI Analyse met GPT-4o-mini
    let insights;
    try {
      const response = await (openai.chat.completions as any).create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: `Je bent een business analist voor Voices. 
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
        response_format: { type: "json_object" },
        timeout: 15000 // 15s timeout
      });

      const content = response.choices[0].message.content;
      if (!content) throw new Error("No content from OpenAI");
      insights = JSON.parse(content);
    } catch (aiError: any) {
      console.error(' AI Insights Generation Failed:', aiError.message);
      return NextResponse.json({
        trends: [],
        swot: { strengths: [], weaknesses: [], opportunities: [], threats: [] },
        sentiment: { score: 0, label: "AI Analyse tijdelijk niet beschikbaar", topPositive: "N/A", topNegative: "N/A" },
        error: aiError.message
      });
    }
    
    // Voeg de volledige mail objecten toe voor de frontend drill-down
    insights.allSourceMails = mailContext;

    return NextResponse.json(insights);
  } catch (error) {
    console.error(' Mailbox Insights API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
