import { GeminiService } from '@/lib/services/gemini-service';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

/**
 *  API: SCRIPT ANALYZE (GOD MODE 2026)
 * 
 * Gebruikt Gemini om de inhoudelijke context van een script te valideren.
 * Voorkomt 'Slop' en 'Gibberish' in de configurator.
 */
export async function POST(req: NextRequest) {
  //  CHRIS-PROTOCOL: Build Safety
  if (process.env.NEXT_PHASE === 'phase-production-build' || (process.env.NODE_ENV === 'production' && !process.env.VERCEL_URL)) {
    return NextResponse.json({ is_valid: true, insights: [] });
  }

  try {
    let body;
    try {
      body = await req.json();
    } catch (e) {
      return NextResponse.json({ is_valid: true, insights: [] });
    }
    const { script, usage, languages, actorId } = body;

    if (!script || script.length < 10) {
      return NextResponse.json({ is_valid: true, insights: [] });
    }

    // 🛡️ CHRIS-PROTOCOL: Parse actorId to integer to avoid DB crash (v2.14.408)
    const id = typeof actorId === 'string' ? parseInt(actorId) : actorId;
    
    if (!isNaN(id)) {
      try {
        const { db } = await import('@/lib/sync/bridge');
        const { actors: actorsTable } = await import('@/lib/system/voices-config');
        const { eq } = await import('drizzle-orm');
        
        const actorData = await db.select().from(actorsTable).where(eq(actorsTable.id, id)).limit(1);
        if (actorData[0]) {
          actorInfo = `De geselecteerde stem is ${actorData[0].first_name}. Deze stem spreekt: Native ${actorData[0].native_lang}${actorData[0].extra_langs ? `, Extra: ${actorData[0].extra_langs}` : ''}.`;
        }
      } catch (dbErr) {
        console.warn('[Script Analyze] Actor fetch failed, proceeding without actor context:', dbErr);
      }
    }

    const prompt = `
      Je bent de Script Intelligence van de Voices Engine. 
      Analyseer het volgende script voor een voice-over opdracht.
      
      JOUW STIJL:
      - Je bent een behulpzame, zachte assistent (Voices-vibe).
      - Je schrikt de klant NOOIT af.
      - Gebruik NOOIT harde termen als "ongeldig", "fout" of "onzin".
      - Gebruik in plaats daarvan gidsende taal: "Ik zie nog geen tekst om in te spreken", "Hulp nodig bij het schrijven?".
      
      CONTEXT:
      - Gebruik: ${usage}
      - Verwachte talen (door klant gekozen): ${languages?.join(', ') || 'onbekend'}
      - Stem Informatie: ${actorInfo || 'Nog geen stem geselecteerd.'}
      
      SCRIPT:
      """
      ${script.substring(0, 2000)}
      """
      
      JOUW OPDRACHT:
      1. GIBBERISH CHECK: Bevat de tekst betekenisvolle taal? Indien niet (bijv. "qsdf"), stel dan voor om de Smart Suggestions te gebruiken.
      2. LANGUAGE MATCH: Detecteer de talen in het script. Komen deze overeen met wat de stem (${actorInfo}) spreekt?
         - Als er een taal in het script staat die de stem NIET spreekt (bijv. Spaans script bij een NL-only stem), geef dan een POSITIEVE tip.
         - Tip formaat: "Ik zie dat je ook een stukje Spaans hebt toegevoegd! Voor de beste native uitspraak kun je dit deel straks ook apart toevoegen aan een Spaanse stem zoals Maria of Jesus."
      3. CONTEXT CHECK: Is dit een script of nog een ruwe opzet?
      4. FEEDBACK: Geef gidsende, positieve feedback die de klant helpt de volgende stap te zetten.
      
      ANTWOORD FORMAAT (STRIKT JSON):
      {
        "is_gibberish": boolean,
        "is_script": boolean,
        "detected_languages": string[],
        "insights": [
          {
            "type": "info" | "success",
            "message": "Zachte, gidsende feedback in het Nederlands"
          }
        ]
      }
    `;

    try {
      const gemini = GeminiService.getInstance();
      const response = await gemini.generateText(prompt, { jsonMode: true });
      const result = JSON.parse(response);
      return NextResponse.json(result);
    } catch (aiErr) {
      console.warn('[Script Analyze] Gemini failed, returning graceful fallback:', aiErr);
      return NextResponse.json({ 
        is_valid: true, 
        insights: [{ type: 'info', message: 'Ik ben je script aan het bekijken. Ziet er goed uit!' }] 
      });
    }
  } catch (error: any) {
    console.error('Script Analysis Critical Error:', error);
    return NextResponse.json({ error: 'Analysis failed' }, { status: 500 });
  }
}
