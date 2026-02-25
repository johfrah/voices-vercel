import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || '',
});

/**
 *  JOHFRAI PREDICTIVE AUTOFILL API (2026)
 * 
 * Doel: Genereert 'ghost text' suggesties terwijl de gebruiker typt.
 * Houdt rekening met context zoals de bedrijfsnaam, openingsuren, etc.
 */

export async function POST(request: NextRequest) {
  try {
    const { text, companyName, context = 'telefooncentrale', extraContext = {} } = await request.json();

    if (!text || text.length < 3) {
      return NextResponse.json({ suggestion: "" });
    }

    const { openingHours, supportEmail, holidayFrom, holidayTo, holidayBack } = extraContext;

    const response = await (openai.chat.completions as any).create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `Je bent een AI-schrijfassistent voor Voices. 
          Jouw taak is om de zin van de gebruiker af te maken met een korte, logische suggestie (max 5-7 woorden).
          
          CONTEXT:
          - Bedrijfsnaam: ${companyName || 'onbekend'}
          - Type: ${context}
          - Openingsuren: ${openingHours || 'onbekend'}
          - Support E-mail: ${supportEmail || 'onbekend'}
          - Vakantie: van ${holidayFrom || '?'} tot ${holidayTo || '?'}, terug op ${holidayBack || '?'}
          
          REGELS:
          1. Return ALLEEN de aanvulling op de tekst, niet de volledige tekst.
          2. Als de zin al af lijkt, return een lege string.
          3. Gebruik de contextuele data (bedrijfsnaam, openingsuren, e-mail) als dat logisch is in de zin.
          4. Houd het zakelijk, warm en professioneel (Johfrah-stijl).
          5. Return in JSON formaat.`
        },
        {
          role: "user",
          content: `Maak deze zin af: "${text}"`
        }
      ],
      response_format: { type: "json_object" },
      max_tokens: 20
    });

    const content = response.choices[0].message.content;
    if (!content) throw new Error("No content from OpenAI");
    
    const result = JSON.parse(content);

    return NextResponse.json({ suggestion: result.suggestion || "" });
  } catch (error) {
    console.error(' Predictive API Error:', error);
    return NextResponse.json({ suggestion: "" });
  }
}
