import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

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
        const filePath = media.file_path;
        
        // 🛡️ CHRIS-PROTOCOL: Dynamic Bucket Resolution (v2.15.083)
        // We detecteren of het pad al begint met een bucket-naam (agency, assets, voices).
        // Als dat zo is, gebruiken we dat als bucket. Zo niet, vallen we terug op 'voices'.
        const pathSegments = filePath.split('/');
        const firstSegment = pathSegments[0];
        const knownBuckets = ['agency', 'assets', 'voices'];
        
        let bucket = 'voices';
        let finalPath = filePath;
        
        if (knownBuckets.includes(firstSegment)) {
          bucket = firstSegment;
          finalPath = pathSegments.slice(1).join('/');
        }
        
        audioUrl = `${SUPABASE_URL.replace(/\/$/, '')}/storage/v1/object/public/${bucket}/${finalPath}`;
      }
    }

    if (!audioUrl) {
      return new NextResponse('No audio source found for this demo', { status: 404 });
    }

    // 3. Redirect naar de proxy om CORS en auth te handelen
    const proxyUrl = new URL('/api/proxy', request.url);
    
    // 🛡️ CHRIS-PROTOCOL: ID-First Handshake (v3.2.1)
    // We geven de media_id door aan de proxy als we die hebben voor een pure handshake.
    if (demo.media_id) {
      proxyUrl.searchParams.set('media_id', demo.media_id.toString());
    } else {
      proxyUrl.searchParams.set('path', audioUrl);
    }
    
    // 🛡️ CHRIS-PROTOCOL: MIME-Type Hinting (v3.0.1)
    // We voegen een extensie toe aan het pad voor de proxy als hint voor het MIME-type.
    // We checken nu ook op .m4a en .ogg die vaak voorkomen in legacy assets.
    if (audioUrl.toLowerCase().endsWith('.m4a')) {
      proxyUrl.searchParams.set('ext', 'm4a');
    } else if (audioUrl.toLowerCase().endsWith('.ogg')) {
      proxyUrl.searchParams.set('ext', 'ogg');
    } else if (audioUrl.toLowerCase().endsWith('.wav')) {
      proxyUrl.searchParams.set('ext', 'wav');
    } else if (!audioUrl.toLowerCase().endsWith('.mp3')) {
      proxyUrl.searchParams.set('ext', 'mp3');
    }
    
    // 🛡️ CHRIS-PROTOCOL: Cache-Control for Streams (v2.28.102)
    // We gebruiken een 307 Temporary Redirect om te voorkomen dat de browser de redirect permanent cachet.
    return NextResponse.redirect(proxyUrl, {
      status: 307,
      headers: {
        'Cache-Control': 'no-store, max-age=0',
      }
    });

  } catch (error: any) {
    console.error('[AudioStream Critical Error]:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
