import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const ALLOWED_AUDIO_EXT = ['mp3', 'wav', 'ogg', 'm4a'];

/**
 * HITL SIGNUP UPLOAD (CHRIS-PROTOCOL)
 *
 * Zonder admin: foto's en optioneel demo's uploaden tijdens aanmelding.
 * Zelfde handshake als admin: Supabase Storage (voices bucket) + media record.
 * - Foto's: active/voicecards/signup-{ts}-{name}.webp
 * - Audio:  active/demos/signup-{ts}-{name}.{ext}
 * Geen conversie naar MP3; bestand wordt as-is opgeslagen (MP3 aanbevolen voor demos).
 */
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'Geen bestand ontvangen.' }, { status: 400 });
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: 'Bestand is te groot. Max 5 MB.' },
        { status: 400 }
      );
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const timestamp = Date.now();
    const ext = (file.name.split('.').pop() || '').toLowerCase();
    const isAudio = ALLOWED_AUDIO_EXT.includes(ext);
    const isImage = ALLOWED_IMAGE_TYPES.includes(file.type) || /^image\//.test(file.type);

    if (!isImage && !isAudio) {
      return NextResponse.json(
        { error: 'Alleen afbeeldingen (jpg, png, webp) of audio (mp3, wav, ogg, m4a) zijn toegestaan.' },
        { status: 400 }
      );
    }

    const safeName = file.name.replace(/\s+/g, '-').replace(/[^a-zA-Z0-9.-]/g, '');
    const fileName = `signup-${timestamp}-${safeName}`;
    const filePath = isAudio
      ? `active/demos/${fileName}`
      : `active/voicecards/${fileName}`;
    const contentType = file.type || (isAudio ? 'audio/mpeg' : 'image/webp');

    const { error: uploadError } = await supabase.storage
      .from('voices')
      .upload(filePath, file, { contentType, upsert: true });

    if (uploadError) {
      console.error('[SignupUpload] Storage error:', uploadError);
      return NextResponse.json(
        { error: 'Upload naar opslag mislukt.' },
        { status: 500 }
      );
    }

    const { data: mediaResult, error: mediaError } = await supabase
      .from('media')
      .insert({
        file_name: fileName,
        file_path: filePath,
        file_type: contentType,
        file_size: file.size,
        journey: 'agency',
        category: 'voices',
        is_public: true,
        labels: ['signup-upload'],
      })
      .select()
      .single();

    if (mediaError) {
      console.error('[SignupUpload] Media insert error:', mediaError);
      return NextResponse.json(
        { error: 'Registreren van bestand mislukt.' },
        { status: 500 }
      );
    }

    const url = `/api/proxy/?path=${encodeURIComponent(filePath)}`;

    return NextResponse.json({
      success: true,
      url,
      path: filePath,
      mediaId: mediaResult.id,
      kind: isAudio ? 'demo' : 'photo',
    });
  } catch (error: unknown) {
    console.error('[SignupUpload] Error:', error);
    return NextResponse.json(
      { error: 'Er ging iets mis bij het uploaden.' },
      { status: 500 }
    );
  }
}
