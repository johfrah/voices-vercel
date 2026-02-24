import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/sync/bridge';
import { actors } from '@db/schema';
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
        orderBy: (actors, { asc }) => [asc(actors.menuOrder), asc(actors.firstName)],
        with: {
          demos: true,
          actorVideos: true,
          actorLanguages: true,
          statusRel: true,
          experienceLevelRel: true
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
          actorVideos:actor_videos(*),
          actorLanguages:actor_languages(*)
        `)
        .order('menu_order', { ascending: true })
        .order('first_name', { ascending: true });
        
      if (error) {
        console.error(' [Admin Actors API] SDK query failed:', error);
        throw error;
      }
      
      allActors = (data || []).map(a => ({
        ...a,
        firstName: a.first_name,
        lastName: a.last_name,
        menuOrder: a.menu_order,
        wpProductId: a.wp_product_id,
        photoId: a.photo_id,
        voiceScore: a.voice_score || 10,
        priceUnpaid: a.price_unpaid || 0,
        nativeLang: a.native_lang,
        photo_url: a.dropbox_url,
        demos: a.demos || [],
        actorVideos: a.actorVideos || [],
        actorLanguages: a.actorLanguages || []
      }));
    }

    //  CHRIS-PROTOCOL: Map relational languages to flat ID fields for frontend compatibility
    const mappedActors = (allActors || []).map(actor => {
      const actorLangs = (actor as any).actorLanguages || (actor as any).actor_languages || [];
      
      const nativeLink = actorLangs.find((al: any) => al.isNative || al.is_native);
      const extraLinks = actorLangs.filter((al: any) => !al.isNative && !al.is_native);
      
      //  CHRIS-PROTOCOL: Ensure frontend fields are correctly mapped from DB fields
      const firstName = actor.firstName || actor.first_name;
      const lastName = actor.lastName || actor.last_name;
      const menuOrder = actor.menuOrder ?? actor.menu_order ?? 0;
      const wpProductId = actor.wpProductId || actor.wp_product_id;
      const photoId = actor.photoId || actor.photo_id;
      const voiceScore = actor.voiceScore ?? actor.voice_score ?? 10;
      const priceUnpaid = actor.priceUnpaid ?? actor.price_unpaid ?? 0;
      const nativeLang = actor.nativeLang || actor.native_lang;
      const nativeLangId = actor.nativeLangId || actor.native_lang_id || nativeLink?.languageId || nativeLink?.language_id || null;
      let photo_url = actor.photo_url || actor.dropbox_url;

      //  CHRIS-PROTOCOL: Apply proxy prefix for local paths to ensure photos load in admin
      if (photo_url && !photo_url.startsWith('http') && !photo_url.startsWith('/api/proxy') && !photo_url.startsWith('/assets')) {
        photo_url = `/api/proxy/?path=${encodeURIComponent(photo_url)}`;
      }

      return {
        ...actor,
        firstName,
        lastName,
        menuOrder,
        wpProductId,
        photoId,
        voiceScore,
        priceUnpaid,
        nativeLang,
        photo_url,
        native_lang_id: nativeLangId,
        extra_lang_ids: extraLinks.map((al: any) => al.languageId || al.language_id).filter(Boolean),
        status_rel: actor.statusRel,
        experience_level_rel: actor.experienceLevelRel,
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
