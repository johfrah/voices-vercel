import { NextResponse } from 'next/server';
import { GeminiService } from '@/lib/services/gemini-service';
import { requireAdmin } from '@/lib/auth/api-auth';
import { createClient } from "@supabase/supabase-js";

//  CHRIS-PROTOCOL: SDK fallback for production stability (v2.14.416)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export const dynamic = 'force-dynamic';

/**
 *  REAL FAQ PROPOSAL API (NUCLEAR SDK 2026)
 * 
 * Doel: Scant de mailbox op patronen van vragen en antwoorden via SDK.
 * 🛡️ CHRIS-PROTOCOL: Volledig gemigreerd naar Gemini (v2.16.104)
 */
export async function GET(request: Request) {
  const auth = await requireAdmin();
  if (auth instanceof NextResponse) return auth;

  try {
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    let query = supabase
      .from('mail_content')
      .select('id, subject, text_body, sender, date')
      .not('text_body', 'is', null)
      .like('text_body', '%?%');
    
    if (startDate && endDate) {
      query = query.gte('date', startDate).lte('date', endDate);
    }

    const { data: recentMails, error } = await query
      .order('date', { ascending: false })
      .limit(50);

    if (error) throw error;

    if (!recentMails || recentMails.length === 0) {
      return NextResponse.json([]);
    }

    // 2. Prepareer de mails voor de AI
    const mailContext = recentMails.map(m => ({
      id: m.id,
      subject: m.subject,
      body: m.text_body?.substring(0, 500),
      sender: m.sender
    }));

    // 3. AI Analyse met Gemini
    let proposals = [];
    try {
      const gemini = GeminiService.getInstance();
      const prompt = `
        Je bent een AI die e-mails analyseert voor een voice-over bureau (Voices). 
        Je taak is om veelvoorkomende vragen van klanten te identificeren en daarvoor FAQ-voorstellen te doen.
        
        Geef je antwoord in een JSON array van objecten met deze structuur:
        {
          "proposals": [
            {
              "question": "De veelgestelde vraag",
              "suggestedAnswer": "Een beknopt, professioneel antwoord gebaseerd op de context",
              "frequency": aantal keer dat dit ongeveer voorkomt (schatting op basis van context),
              "confidence": 0.0 tot 1.0 (hoe zeker ben je van dit voorstel),
              "sourceThreadId": "id van een relevante mail"
            }
          ]
        }

        RECENTE E-MAILS OM TE ANALYSEREN:
        ${JSON.stringify(mailContext)}
      `;

      const response = await gemini.generateText(prompt, { jsonMode: true });
      const result = JSON.parse(response);
      proposals = result.proposals || result;
    } catch (aiError: any) {
      console.error(' AI FAQ Proposal Generation Failed:', aiError.message);
      return NextResponse.json([]);
    }

    return NextResponse.json(Array.isArray(proposals) ? proposals : []);
  } catch (error) {
    console.error(' FAQ Proposal API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
