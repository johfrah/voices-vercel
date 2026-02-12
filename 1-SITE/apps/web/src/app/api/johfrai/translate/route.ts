import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || '',
});

/**
 * 🌍 JOHFRAI SMART TRANSLATION API (2026)
 * 
 * Doel: Vertaalt scripts naar andere talen met behoud van de juiste telefonie-terminologie.
 * Gebruikt de Voices.be Glossary voor termen als 'prédécroché'.
 */

const TELEPHONY_GLOSSARY = {
  nl: {
    welcome: 'welkomstbegroeting',
    hold: 'wachtmuziek',
    menu: 'keuzemenu',
    after_hours: 'buiten kantooruren',
    voicemail: 'voicemail'
  },
  fr: {
    welcome: 'prédécroché',
    hold: "musique d'attente",
    menu: 'menu vocal',
    after_hours: 'hors heures de bureau',
    voicemail: 'boîte vocale'
  },
  en: {
    welcome: 'welcome greeting',
    hold: 'hold music',
    menu: 'IVR menu',
    after_hours: 'after hours',
    voicemail: 'voicemail'
  },
  de: {
    welcome: 'Begrüßungsansage',
    hold: 'Wartemusik',
    menu: 'Auswahlmenü',
    after_hours: 'außerhalb der Geschäftszeiten',
    voicemail: 'Voicemail'
  }
};

export async function POST(request: NextRequest) {
  try {
    const { text, targetLangs, sourceLang = 'nl' } = await request.json();

    if (!text || !targetLangs || targetLangs.length === 0) {
      return NextResponse.json({ error: 'Ontbrekende gegevens' }, { status: 400 });
    }

    const response = await (openai.chat.completions as any).create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `Je bent een professionele vertaler voor Voices.be, gespecialiseerd in telefonie en IVR systemen.
          Vertaal de gegeven tekst naar de gevraagde talen: ${targetLangs.join(', ')}.
          
          STRICTE TELEFONIE GLOSSARY:
          - Welkomstbegroeting -> FR: prédécroché, EN: welcome greeting, DE: Begrüßungsansage
          - Wachtmuziek -> FR: musique d'attente, EN: hold music, DE: Wartemusik
          - Keuzemenu -> FR: menu vocal, EN: IVR menu, DE: Auswahlmenü
          - Buiten kantooruren -> FR: hors heures de bureau, EN: after hours, DE: außerhalb der Geschäftszeiten
          
          REGELS:
          1. Behoud de titels tussen haakjes, bijv. (Welkomstbegroeting) wordt (Prédécroché) in het Frans.
          2. Zorg voor een natuurlijke, warme toon die past bij de stem van Johfrah.
          3. Return de vertalingen in een JSON object waarbij de key de taalcode is.
          
          Output formaat:
          {
            "translations": {
              "fr": "...",
              "en": "...",
              "de": "..."
            }
          }`
        },
        {
          role: "user",
          content: `Vertaal deze tekst vanuit het ${sourceLang}:\n\n${text}`
        }
      ],
      response_format: { type: "json_object" }
    });

    const content = response.choices[0].message.content;
    if (!content) throw new Error("No content from OpenAI");
    
    const result = JSON.parse(content);

    return NextResponse.json(result);
  } catch (error) {
    console.error('❌ Translation API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
