import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth/api-auth';
import { createClient } from "@supabase/supabase-js";

export const dynamic = 'force-dynamic';

/**
 * 🛡️ CHRIS-PROTOCOL: NUCLEAR ADMIN ACTORS API (v2.14.534)
 * 
 * 1 TRUTH HANDSHAKE:
 * We use the Supabase SDK directly for 100% stability.
 * We strictly prioritize media_id for photos and audio.
 */
export async function GET() {
  if (process.env.NEXT_PHASE === 'phase-production-build' || (process.env.NODE_ENV === 'production' && !process.env.VERCEL_URL)) {
    return NextResponse.json({ success: true, actors: [] });
  }

  const auth = await requireAdmin();
  if (auth instanceof NextResponse) return auth;

  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
    
    // 1. Fetch all actors with their related data via SDK
    const { data: sdkData, error: sdkError } = await supabase
      .from('actors')
      .select(`
        *,
        demos:actor_demos(*),
        actor_videos:actor_videos(*),
        actor_languages:actor_languages(*)
      `)
      .order('menu_order', { ascending: true })
      .order('first_name', { ascending: true });
      
    if (sdkError) throw sdkError;

    // 2. Fetch all media records to resolve photo_id -> URL
    const photoIds = Array.from(new Set((sdkData || []).map(a => a.photo_id).filter(Boolean)));
    const { data: mediaResults } = photoIds.length > 0 
      ? await supabase.from('media').select('id, file_path').in('id', photoIds)
      : { data: [] };

    const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const SUPABASE_STORAGE_URL = `${SUPABASE_URL.replace(/\/$/, '')}/storage/v1/object/public/voices`;

    // 3. Map to Nuclear 1 Truth Format
    const mappedActors = (sdkData || []).map(actor => {
      let photo_url = '';
      
      // 🛡️ CHRIS-PROTOCOL: 1 Truth Asset Resolution
      if (actor.photo_id) {
        const mediaItem = (mediaResults || []).find((m: any) => m.id === actor.photo_id);
        if (mediaItem?.file_path) {
          photo_url = mediaItem.file_path.startsWith('http') 
            ? mediaItem.file_path 
            : `${SUPABASE_STORAGE_URL}/${mediaItem.file_path}`;
        }
      } else if (actor.dropbox_url) {
        // Fallback for non-migrated items
        photo_url = actor.dropbox_url.startsWith('http') 
          ? actor.dropbox_url 
          : `/api/proxy/?path=${encodeURIComponent(actor.dropbox_url)}`;
      }

      const actorLangs = actor.actor_languages || [];
      const nativeLink = actorLangs.find((al: any) => al.is_native);
      const extraLinks = actorLangs.filter((al: any) => !al.is_native);

      return {
        ...actor,
        photo_url,
        native_lang_id: nativeLink?.language_id || null,
        extra_lang_ids: extraLinks.map((al: any) => al.language_id).filter(Boolean),
        // Ensure price fields are numbers for frontend
        price_unpaid: parseFloat(actor.price_unpaid || '0'),
        price_online: parseFloat(actor.price_online || '0'),
        price_ivr: parseFloat(actor.price_ivr || '0'),
        price_live_regie: parseFloat(actor.price_live_regie || '0')
      };
    });

    return NextResponse.json({ 
      success: true, 
      actors: mappedActors,
      _forensic: `Handshake active for ${mappedActors.length} actors.`
    });

  } catch (error: any) {
    console.error(' [Admin Actors API] FATAL:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to fetch actors', 
      details: error.message 
    }, { status: 500 });
  }
}
