import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

/**
 * ID-BASED AUDIO STREAMER (2026)
 * 
 * Doel: Audio afspelen op basis van Demo ID wanneer de audio_url ontbreekt of corrupt is.
 * Volgt de 1 Truth Mandate: We halen de media_id of url direct uit de database.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const demoId = parseInt(params.id);
  
  if (isNaN(demoId)) {
    return new NextResponse('Invalid Demo ID', { status: 400 });
  }

  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    // 1. Haal demo details op
    const { data: demo, error: demoError } = await supabase
      .from('actor_demos')
      .select('url, media_id')
      .eq('id', demoId)
      .single();

    if (demoError || !demo) {
      console.error(`[AudioStream] Demo not found: ${demoId}`, demoError);
      return new NextResponse('Demo not found', { status: 404 });
    }

    let audioUrl = demo.url;

    // 2. Als er een media_id is, haal het pad op uit de media tabel
    if (demo.media_id) {
      const { data: media, error: mediaError } = await supabase
        .from('media')
        .select('file_path')
        .eq('id', demo.media_id)
        .single();

      if (!mediaError && media?.file_path) {
        const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
        audioUrl = `${SUPABASE_URL.replace(/\/$/, '')}/storage/v1/object/public/voices/${media.file_path}`;
      }
    }

    if (!audioUrl) {
      return new NextResponse('No audio source found for this demo', { status: 404 });
    }

    // 3. Redirect naar de proxy om CORS en auth te handelen
    const proxyUrl = new URL('/api/proxy', request.url);
    proxyUrl.searchParams.set('path', audioUrl);
    
    return NextResponse.redirect(proxyUrl);

  } catch (error: any) {
    console.error('[AudioStream Critical Error]:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
