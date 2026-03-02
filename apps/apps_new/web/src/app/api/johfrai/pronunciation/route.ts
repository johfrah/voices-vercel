import { NextRequest, NextResponse } from 'next/server';
import { GeminiService } from '@/lib/services/gemini-service';

/**
 *  JOHFRAI PRONUNCIATION & LANGUAGE INTELLIGENCE API (2026)
 * 
 * Doel: Automatiseert uitspraakinstructies en detecteert talen binnen een script.
 * 🛡️ CHRIS-PROTOCOL: Volledig gemigreerd naar Gemini (v2.16.104)
 */
export async function POST(request: NextRequest) {
  try {
    const { text, context } = await request.json();

    if (!text || text.length < 2) {
      return NextResponse.json({ error: 'Tekst te kort' }, { status: 400 });
    }

    const gemini = GeminiService.getInstance();
    const prompt = `
      Je bent een expert in fonetiek en meertalige stemregie voor de stem Johfrah.
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
      }

      TEKST OM TE ANALYSEREN (Context: ${context || 'telefooncentrale'}):
      ${text}
    `;

    const response = await gemini.generateText(prompt, { jsonMode: true });
    return NextResponse.json(JSON.parse(response));
  } catch (error) {
    console.error(' Pronunciation Intelligence API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
