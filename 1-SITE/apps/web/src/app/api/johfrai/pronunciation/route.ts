import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || '',
});

/**
 *  JOHFRAI PRONUNCIATION & LANGUAGE INTELLIGENCE API (2026)
 * 
 * Doel: Automatiseert uitspraakinstructies en detecteert talen binnen een script.
 * Gebruikt GPT-4o-mini om fonetische spelling en meertalige context te genereren.
 */

export async function POST(request: NextRequest) {
  try {
    const { text, context } = await request.json();

    if (!text || text.length < 2) {
      return NextResponse.json({ error: 'Tekst te kort' }, { status: 400 });
    }

    const response = await (openai.chat.completions as any).create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `Je bent een expert in fonetiek en meertalige stemregie voor de stem Johfrah.
          Je doel is om een tekst te analyseren en te optimaliseren voor ElevenLabs.
          
          STRICTE REGELS:
          1. Detecteer alle talen die in de tekst voorkomen.
          2. Identificeer termen die fonetische hulp nodig hebben (bijv. merknamen).
          3. Voeg fonetische spelling tussen haakjes toe voor moeilijke woorden.
          4. Voeg interpunctie toe voor de juiste ademhaling.
          5. Als een zin van taal wisselt, geef dit aan in de analyse.
          
          Output formaat:
          {
            "optimizedText": "...",
            "detectedLanguages": ["nl", "fr", "en"],
            "isMultilingual": true,
            "changes": [
              { "original": "...", "optimized": "...", "reason": "..." }
            ]
          }`
        },
        {
          role: "user",
          content: `Analyseer en optimaliseer deze tekst voor Johfrai. Context: ${context || 'telefooncentrale'}\n\nTekst: ${text}`
        }
      ],
      response_format: { type: "json_object" }
    });

    const content = response.choices[0].message.content;
    if (!content) throw new Error("No content from OpenAI");
    
    const result = JSON.parse(content);

    return NextResponse.json(result);
  } catch (error) {
    console.error(' Pronunciation Intelligence API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
