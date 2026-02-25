import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/sync/bridge';
import { actors } from '@/lib/system/voices-config';
import { asc, eq } from 'drizzle-orm';
import { requireAdmin } from '@/lib/auth/api-auth';
import { createClient } from "@supabase/supabase-js";

export const dynamic = 'force-dynamic';

/**
 *  ADMIN ACTORS FETCH API (GOD MODE 2026)
 * 
 * Haalt alle acteurs op voor het beheer-dashboard, gesorteerd op menu_order.
 */
export async function GET() {
  //  CHRIS-PROTOCOL: Build Safety
  if (process.env.NEXT_PHASE === 'phase-production-build' || (process.env.NODE_ENV === 'production' && !process.env.VERCEL_URL)) {
    return NextResponse.json({ success: true, actors: [] });
  }

  const auth = await requireAdmin();
  if (auth instanceof NextResponse) return auth;

  try {
    let allActors: any[] = [];
    
    try {
      allActors = await db.query.actors.findMany({
        orderBy: (actors, { asc }) => [asc(actors.menu_order), asc(actors.first_name)],
        with: {
          demos: true,
          actor_videos: true,
          actor_languages: true,
          status_rel: true,
          experience_level_rel: true
        }
      });
    } catch (dbErr) {
      console.warn(' [Admin Actors API] Drizzle failed, falling back to simplified SDK query');
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
      const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
      const supabase = createClient(supabaseUrl, supabaseKey);
      
      // 🛡️ CHRIS-PROTOCOL: Simplified SDK query to avoid join errors
      const { data, error } = await supabase
        .from('actors')
        .select(`
          *,
          demos:actor_demos(*),
          actor_videos:actor_videos(*),
          actor_languages:actor_languages(*)
        `)
        .order('menu_order', { ascending: true })
        .order('first_name', { ascending: true });
        
      if (error) {
        console.error(' [Admin Actors API] SDK query failed:', error);
        throw error;
      }
      
      allActors = (data || []).map(a => ({
        ...a,
        first_name: a.first_name,
        last_name: a.last_name,
        menu_order: a.menu_order,
        wp_product_id: a.wp_product_id,
        photo_id: a.photo_id,
        voice_score: a.voice_score || 10,
        price_unpaid: a.price_unpaid || 0,
        native_lang: a.native_lang,
        photo_url: a.dropbox_url,
        demos: a.demos || [],
        actor_videos: a.actor_videos || [],
        actor_languages: a.actor_languages || []
      }));
    }

    //  CHRIS-PROTOCOL: Map relational languages to flat ID fields for frontend compatibility
    const mappedActors = (allActors || []).map(actor => {
      const actorLangs = (actor as any).actor_languages || [];
      
      const nativeLink = actorLangs.find((al: any) => al.is_native);
      const extraLinks = actorLangs.filter((al: any) => !al.is_native);
      
      //  CHRIS-PROTOCOL: 1-to-1 Mapping (Atomic)
      let photo_url = actor.dropbox_url;

      //  CHRIS-PROTOCOL: Apply proxy prefix for local paths to ensure photos load in admin
      if (photo_url && !photo_url.startsWith('http') && !photo_url.startsWith('/api/proxy') && !photo_url.startsWith('/assets')) {
        photo_url = `/api/proxy/?path=${encodeURIComponent(photo_url)}`;
      }

      return {
        ...actor,
        photo_url,
        native_lang_id: actor.native_lang_id || nativeLink?.language_id || null,
        extra_lang_ids: extraLinks.map((al: any) => al.language_id).filter(Boolean),
        status_rel: actor.status_rel,
        experience_level_rel: actor.experience_level_rel,
        attributes: (actor.attributes || []).map((a: any) => a.attribute)
      };
    });

    return NextResponse.json({ 
      success: true, 
      actors: mappedActors 
    });

  } catch (error: any) {
    console.error(' ADMIN ACTORS FETCH FAILURE:', error);
    return NextResponse.json({ error: 'Failed to fetch actors', details: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  // Placeholder for bulk actions if needed
  return NextResponse.json({ success: true });
}
