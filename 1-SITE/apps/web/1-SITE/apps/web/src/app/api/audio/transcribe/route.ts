import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * SPEECH-TO-TEXT API (2026)
 * 
 * Doel: Zet audio-opnames of geüploade audio om naar bewerkbare tekst via OpenAI Whisper.
 */
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'Geen audiobestand gevonden' }, { status: 400 });
    }

    // Whisper verwacht een echt bestand met een extensie
    const transcription = await openai.audio.transcriptions.create({
      file: file,
      model: "whisper-1",
      language: "nl", // Standaard op Nederlands, Whisper herkent andere talen ook goed
    });

    return NextResponse.json({ 
      success: true, 
      text: transcription.text 
    });

  } catch (error: any) {
    console.error(' Transcription Error:', error);
    return NextResponse.json({ error: 'Fout bij transcriptie: ' + error.message }, { status: 500 });
  }
}
