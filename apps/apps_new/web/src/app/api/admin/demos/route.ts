import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth/api-auth';
import { createClient } from "@supabase/supabase-js";

export const dynamic = 'force-dynamic';

/**
 * 🛡️ CHRIS-PROTOCOL: NUCLEAR ADMIN DEMOS API (v2.14.535)
 * 
 * 1 TRUTH HANDSHAKE:
 * Haalt alle demo's op met hun gekoppelde media-informatie.
 */
export async function GET() {
  if (process.env.NEXT_PHASE === 'phase-production-build' || (process.env.NODE_ENV === 'production' && !process.env.VERCEL_URL)) {
    return NextResponse.json({ success: true, demos: [] });
  }

  const auth = await requireAdmin();
  if (auth instanceof NextResponse) return auth;

  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
    
    // 1. Fetch all demos with actor info
    const { data: demos, error: demosError } = await supabase
      .from('actor_demos')
      .select(`
        *,
        actor:actors(id, first_name, last_name, display_name)
      `)
      .order('created_at', { ascending: false });
      
    if (demosError) throw demosError;

    // 2. Fetch media info for 1 Truth resolution
    const mediaIds = Array.from(new Set((demos || []).map(d => d.media_id).filter(Boolean)));
    const { data: mediaResults } = mediaIds.length > 0 
      ? await supabase.from('media').select('id, file_path').in('id', mediaIds)
      : { data: [] };

    const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const SUPABASE_STORAGE_URL = `${SUPABASE_URL.replace(/\/$/, '')}/storage/v1/object/public/voices`;

    // 3. Map to Nuclear Format
    const mappedDemos = (demos || []).map(demo => {
      let audio_url = demo.url;
      
      if (demo.media_id) {
        const mediaItem = (mediaResults || []).find((m: any) => m.id === demo.media_id);
        if (mediaItem?.file_path) {
          audio_url = mediaItem.file_path.startsWith('http') 
            ? mediaItem.file_path 
            : `${SUPABASE_STORAGE_URL}/${mediaItem.file_path}`;
        }
      }

      // Proxy fallback for relative URLs
      if (audio_url && !audio_url.startsWith('http') && !audio_url.startsWith('/api/proxy')) {
        audio_url = `/api/proxy/?path=${encodeURIComponent(audio_url)}`;
      }

      return {
        ...demo,
        audio_url,
        actor_name: demo.actor?.display_name || demo.actor?.first_name || 'Onbekend'
      };
    });

    return NextResponse.json({ 
      success: true, 
      demos: mappedDemos,
      _forensic: `Handshake active for ${mappedDemos.length} demos.`
    });

  } catch (error: any) {
    console.error(' [Admin Demos API] FATAL:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to fetch demos', 
      details: error.message 
    }, { status: 500 });
  }
}
