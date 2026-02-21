import { db } from '@db';
import { actors, actorLanguages, languages } from '@db/schema';
import { eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET() {
  try {
    const liveActors = await db.select().from(actors).where(eq(actors.status, 'live')).limit(10);
    
    const stats = await Promise.all(liveActors.map(async (actor) => {
      const langs = await db.query.actorLanguages.findMany({
        where: eq(actorLanguages.actorId, actor.id),
        with: {
          language: true
        }
      });
      
      return {
        id: actor.id,
        name: actor.firstName,
        nativeLangField: actor.nativeLang,
        relationalLangs: langs.map(l => ({
          label: l.language.label,
          isNative: l.isNative
        }))
      };
    }));

    const allLanguages = await db.select().from(languages);

    return NextResponse.json({ 
      success: true, 
      actorStats: stats,
      totalLanguages: allLanguages.length,
      languages: allLanguages.map(l => ({ id: l.id, label: l.label, code: l.code }))
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
