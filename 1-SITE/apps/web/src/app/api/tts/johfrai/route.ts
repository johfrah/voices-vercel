import { NextRequest, NextResponse } from 'next/server';
import { AudioEngine } from '@/lib/audio/audio-engine';
import ffmpeg from 'fluent-ffmpeg';
import { Readable, PassThrough } from 'stream';
import { db } from '@db';
import { freePreviews } from '@db/schema';
import { eq, and, or, sql } from 'drizzle-orm';
import md5 from 'md5';

/**
 * 🎙️ JOHFRAI PREVIEW API
 * Focus: Snelheid & Frictieloze ervaring.
 */

const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;
const JOHFRAI_VOICE_ID = 'XHVUCXxmiDEMHi2BYxyx';

export async function POST(request: NextRequest) {
  try {
    const { text, watermark, email, firstName, lastName, companyName, phone, agreedToTerms, visitorHash, audioMode } = await request.json();
    const ip = request.headers.get('x-forwarded-for') || '127.0.0.1';

    if (!text || text.length < 3) {
      return NextResponse.json({ error: 'Tekst is te kort' }, { status: 400 });
    }

    if (!ELEVENLABS_API_KEY) {
      console.error('Missing ELEVENLABS_API_KEY');
      return NextResponse.json({ error: 'Configuratiefout' }, { status: 500 });
    }

    // 🛡️ ABUSE PREVENTION CHECK
    const wordCount = text.split(/\s+/).filter(Boolean).length;
    const isFreeTier = wordCount <= 25;
    const isSubscribed = request.headers.get('X-Johfrai-Subscription') === 'true';
    
    let shouldApplyWatermark = watermark;
    let forceTelephony = false;

    if (isFreeTier && !isSubscribed) {
      // Check if this IP or Email has already used their free preview
      const existing = await db.select()
        .from(freePreviews)
        .where(
          or(
            eq(freePreviews.ipAddress, ip),
            email ? eq(freePreviews.email, email) : undefined,
            visitorHash ? eq(freePreviews.visitorHash, visitorHash) : undefined
          )
        )
        .limit(1);

      if (existing.length > 0) {
        // Already used free preview, force watermark
        shouldApplyWatermark = true;
      } else {
        // First time, log it and allow clean (but force 8kHz for download/delivery)
        await db.insert(freePreviews).values({
          email,
          firstName,
          lastName,
          companyName,
          phone,
          agreedToTerms,
          ipAddress: ip,
          visitorHash,
          textHash: md5(text)
        });
        shouldApplyWatermark = false;
        forceTelephony = true; // Free preview is always 8kHz
      }
    }

    // 🚀 ELEVENLABS DIRECT STREAM
    const response = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${JOHFRAI_VOICE_ID}?optimize_streaming_latency=3`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'xi-api-key': ELEVENLABS_API_KEY,
        },
        body: JSON.stringify({
          text,
          model_id: 'eleven_multilingual_v2',
          voice_settings: {
            stability: 0.45,
            similarity_boost: 0.8,
            style: 0.15,
            use_speaker_boost: true
          },
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json({ error: `Stemgeneratie mislukt: ${response.status}` }, { status: response.status });
    }

    const audioArrayBuffer = await response.arrayBuffer();
    const audioBuffer = Buffer.from(audioArrayBuffer);

    // 🛡️ WATERMARK & FORMAT LOGIC
    const finalWatermark = shouldApplyWatermark && !isSubscribed;
    const finalTelephony = forceTelephony || audioMode === 'telephony';

    if (finalWatermark || finalTelephony) {
      const inputStream = new PassThrough();
      inputStream.end(audioBuffer);

      const outputStream = new PassThrough();
      const chunks: Buffer[] = [];

      outputStream.on('data', (chunk) => chunks.push(chunk));

      await new Promise((resolve, reject) => {
        let command = ffmpeg(inputStream);
        
        if (finalWatermark) {
          command = command.audioFilters(AudioEngine.getAudibleWatermarkFilter());
        }
        
        if (finalTelephony) {
          command = command.audioFrequency(8000).audioChannels(1);
        }

        command
          .format('mp3')
          .on('error', (err) => {
            console.error('FFMPEG Error:', err);
            reject(err);
          })
          .on('end', resolve)
          .pipe(outputStream);
      });

      const processedBuffer = Buffer.concat(chunks);
      
      return new NextResponse(processedBuffer, {
        headers: { 
          'Content-Type': 'audio/mpeg',
          'X-Johfrai-Status': finalWatermark ? 'watermarked' : 'free-preview-8khz',
          'X-Johfrai-Format': finalTelephony ? '8khz' : '48khz',
          'X-Johfrai-Words': wordCount.toString()
        },
      });
    }
    
    return new NextResponse(audioBuffer, {
      headers: { 
        'Content-Type': 'audio/mpeg',
        'X-Johfrai-Status': isFreeTier ? 'free-preview' : 'clean',
        'X-Johfrai-Format': '48khz',
        'X-Johfrai-Words': wordCount.toString()
      },
    });
  } catch (error) {
    console.error('Johfrai API Error:', error);
    return NextResponse.json({ error: 'Interne serverfout' }, { status: 500 });
  }
}
