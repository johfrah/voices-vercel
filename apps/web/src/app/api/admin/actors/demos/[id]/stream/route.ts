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
  // #region agent log
  try { require('fs').appendFileSync('/opt/cursor/logs/debug.log', JSON.stringify({ hypothesisId: 'C', location: 'api/admin/actors/demos/[id]/stream/route.ts:entry', message: 'stream route entry', data: { demo_id: params.id, parsed_demo_id: demoId }, timestamp: Date.now() }) + '\n'); } catch {}
  // #endregion
  
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
        // We detecteren of het pad al begint met een bucket-naam (agency, voices).
        // Als dat zo is, gebruiken we dat als bucket. Zo niet, vallen we terug op 'voices'.
        const pathSegments = filePath.split('/');
        const firstSegment = pathSegments[0];
        const knownBuckets = ['agency', 'voices'];
        
        let bucket = 'voices';
        let finalPath = filePath;

        // Legacy assets paths should stay relative so /api/proxy can resolve them.
        if (firstSegment === 'assets') {
          audioUrl = filePath.startsWith('/') ? filePath : `/${filePath}`;
        } else if (knownBuckets.includes(firstSegment)) {
          bucket = firstSegment;
          finalPath = pathSegments.slice(1).join('/');
          audioUrl = `${SUPABASE_URL.replace(/\/$/, '')}/storage/v1/object/public/${bucket}/${finalPath}`;
        } else {
          audioUrl = `${SUPABASE_URL.replace(/\/$/, '')}/storage/v1/object/public/${bucket}/${finalPath}`;
        }
      }
    }
    // #region agent log
    try { require('fs').appendFileSync('/opt/cursor/logs/debug.log', JSON.stringify({ hypothesisId: 'C', location: 'api/admin/actors/demos/[id]/stream/route.ts:resolved', message: 'stream route source resolution', data: { demo_id: demoId, demo_url: demo?.url || '', demo_media_id: demo?.media_id ?? null, resolved_audio_url: audioUrl || '', resolved_audio_url_is_empty: !audioUrl }, timestamp: Date.now() }) + '\n'); } catch {}
    // #endregion

    if (!audioUrl) {
      return new NextResponse('No audio source found for this demo', { status: 404 });
    }

    const isAbsoluteUrl = audioUrl.startsWith('http://') || audioUrl.startsWith('https://');
    // #region agent log
    try { require('fs').appendFileSync('/opt/cursor/logs/debug.log', JSON.stringify({ hypothesisId: 'C', location: 'api/admin/actors/demos/[id]/stream/route.ts:redirect', message: 'stream route redirect target', data: { demo_id: demoId, is_absolute_url: isAbsoluteUrl, target: audioUrl }, timestamp: Date.now() }) + '\n'); } catch {}
    // #endregion

    // 3. Redirect direct for absolute public storage URLs, proxy only for relative paths.
    if (isAbsoluteUrl) {
      return NextResponse.redirect(audioUrl);
    }

    const proxyUrl = new URL('/api/proxy', request.url);
    proxyUrl.searchParams.set('path', audioUrl);
    return NextResponse.redirect(proxyUrl);

  } catch (error: any) {
    console.error('[AudioStream Critical Error]:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
