import { NextRequest, NextResponse } from 'next/server';
import { GeminiService } from '@/lib/services/gemini-service';

/**
 * SPEECH-TO-TEXT API (2026)
 * 
 * Doel: Zet audio-opnames of geüploade audio om naar bewerkbare tekst via Gemini 1.5 Flash.
 * 🛡️ CHRIS-PROTOCOL: Volledig gemigreerd naar Gemini (v2.16.104)
 */
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'Geen audiobestand gevonden' }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const gemini = GeminiService.getInstance();
    
    const transcription = await gemini.transcribeAudio(buffer, file.type, 'nl');

    return NextResponse.json({ 
      success: true, 
      text: transcription 
    });

  } catch (error: any) {
    console.error(' Transcription Error:', error);
    return NextResponse.json({ error: 'Fout bij transcriptie: ' + error.message }, { status: 500 });
  }
}
