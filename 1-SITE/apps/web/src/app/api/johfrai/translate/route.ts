import { NextRequest, NextResponse } from 'next/server';
import { GeminiService } from '@/lib/services/gemini-service';

/**
 *  JOHFRAI SMART TRANSLATION API (2026)
 * 
 * Doel: Vertaalt scripts naar andere talen met behoud van de juiste telefonie-terminologie.
 * 🛡️ CHRIS-PROTOCOL: Volledig gemigreerd naar Gemini (v2.16.104)
 */
export async function POST(request: NextRequest) {
  try {
    const { text, targetLangs, sourceLang = 'nl' } = await request.json();

    if (!text || !targetLangs || targetLangs.length === 0) {
      return NextResponse.json({ error: 'Ontbrekende gegevens' }, { status: 400 });
    }

    const gemini = GeminiService.getInstance();
    const prompt = `
      Je bent een professionele vertaler voor Voices, gespecialiseerd in telefonie en IVR systemen.
      Vertaal de gegeven tekst vanuit het ${sourceLang} naar de gevraagde talen: ${targetLangs.join(', ')}.
      
      STRICTE TELEFONIE GLOSSARY:
      - Welkomstbegroeting -> FR: prdcroch, EN: welcome greeting, DE: Begrungsansage
      - Wachtmuziek -> FR: musique d'attente, EN: hold music, DE: Wartemusik
      - Keuzemenu -> FR: menu vocal, EN: IVR menu, DE: Auswahlmen
      - Buiten kantooruren -> FR: hors heures de bureau, EN: after hours, DE: auerhalb der Geschftszeiten
      
      REGELS:
      1. Behoud de titels tussen haakjes, bijv. (Welkomstbegroeting) wordt (Prdcroch) in het Frans.
      2. Zorg voor een natuurlijke, warme toon die past bij de stem van Johfrah.
      3. Return de vertalingen in een JSON object waarbij de key de taalcode is.
      
      Output formaat:
      {
        "translations": {
          "fr": "...",
          "en": "...",
          "de": "..."
        }
      }

      TEKST OM TE VERTALEN:
      ${text}
    `;

    const response = await gemini.generateText(prompt, { jsonMode: true });
    return NextResponse.json(JSON.parse(response));
  } catch (error) {
    console.error(' Translation API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
