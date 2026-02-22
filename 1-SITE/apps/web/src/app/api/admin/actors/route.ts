import { NextResponse } from 'next/server';
import { db } from '@/lib/sync/bridge';
import { actors } from '@db/schema';
import { asc, eq } from 'drizzle-orm';
import { requireAdmin } from '@/lib/auth/api-auth';

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
    const allActors = await db.query.actors.findMany({
      orderBy: [asc(actors.menuOrder), asc(actors.firstName)],
      with: {
        demos: true,
        actorVideos: true,
        actorLanguages: true
      }
    }).catch(() => []);

    //  CHRIS-PROTOCOL: Map relational languages to flat ID fields for frontend compatibility
    const mappedActors = (allActors || []).map(actor => {
      const nativeLink = actor.actorLanguages?.find(al => al.isNative);
      const extraLinks = actor.actorLanguages?.filter(al => !al.isNative) || [];
      
      return {
        ...actor,
        native_lang_id: nativeLink?.languageId || null,
        extra_lang_ids: extraLinks.map(al => al.languageId)
      };
    });

    return NextResponse.json({ 
      success: true, 
      actors: mappedActors 
    });

  } catch (error: any) {
    console.error(' ADMIN ACTORS FETCH FAILURE:', error);
    return NextResponse.json({ error: 'Failed to fetch actors' }, { status: 500 });
  }
}
