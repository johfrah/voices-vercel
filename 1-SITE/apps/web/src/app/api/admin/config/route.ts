import { db } from '@db';
import { appConfigs, languages } from '@db/schema';
import { eq, asc } from 'drizzle-orm';
import { NextRequest, NextResponse } from 'next/server';
import { getActor, getActors, getMusicLibrary } from '@/lib/services/api-server';
import { requireAdmin } from '@/lib/auth/api-auth';
import { ConfigBridge } from '@/lib/utils/config-bridge';

//  NUCLEAR CACHE BUSTER
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

/**
 *  API: ADMIN CONFIG (2026)
 * 
 * Beheer van globale systeeminstellingen, bedrijfsinformatie en vakantieregelingen.
 * Nu ook als bridge voor client-side data fetching van server-only resources.
 * actor/actors/music = publiek (agency). appConfigs = admin only.
 */

export async function GET(request: NextRequest) {
  //  CHRIS-PROTOCOL: Build Safety
  if (process.env.NEXT_PHASE === 'phase-production-build' || (process.env.NODE_ENV === 'production' && !process.env.VERCEL_URL && !process.env.DATABASE_URL)) {
    return NextResponse.json({});
  }

  // 🛡️ CHRIS-PROTOCOL: Pre-flight database check to avoid 500 crashes
  try {
    if (!db) throw new Error('Database connection unavailable');
  } catch (dbErr) {
    console.error('[Admin Config GET] Database pre-flight failed:', dbErr);
    return NextResponse.json({ error: 'Database service unavailable' }, { status: 503 });
  }

  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type');

  // appConfigs en overige types: admin only
  const publicTypes = ['actor', 'actors', 'music', 'navigation', 'telephony', 'general'];
  if (!type || !publicTypes.includes(type)) {
    const auth = await requireAdmin();
    if (auth instanceof NextResponse) return auth;
  }

  try {
    //  CHRIS-PROTOCOL: Database Timeout Protection (2026)
    const dbWithTimeout = async <T>(promise: Promise<T>): Promise<T> => {
      const timeout = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Database Timeout')), 5000) // Verhoogd naar 5s voor stabiliteit
      );
      return Promise.race([promise, timeout]) as Promise<T>;
    };

    //  BRIDGE LOGIC: Handle client-side requests for server-only data
    if (type === 'telephony') {
      try {
        const config = await dbWithTimeout(db.select().from(appConfigs).where(eq(appConfigs.key, 'telephony_config')).limit(1));
        return NextResponse.json({ telephony_config: config[0]?.value || {} });
      } catch (err: any) {
        console.warn(`[Admin Config] Telephony fetch failed, returning empty: ${err.message}`);
        return NextResponse.json({ telephony_config: {} });
      }
    }

    if (type === 'general') {
      try {
        const config = await dbWithTimeout(db.select().from(appConfigs).where(eq(appConfigs.key, 'general_settings')).limit(1));
        return NextResponse.json({ 
          general_settings: config[0]?.value || {},
          _version: '2.14.242'
        });
      } catch (err: any) {
        console.warn(`[Admin Config] General settings fetch failed, returning empty: ${err.message}`);
        return NextResponse.json({ 
          general_settings: {},
          _version: '2.14.242'
        });
      }
    }

    if (type === 'languages') {
      const results = await dbWithTimeout(db.select().from(languages).orderBy(asc(languages.label))).catch(() => []);
      return NextResponse.json({ results });
    }

    if (type === 'actor') {
      const slug = searchParams.get('slug');
      const lang = searchParams.get('lang') || 'nl';
      if (!slug) return NextResponse.json({ error: 'Slug is required' }, { status: 400 });
      const actor = await getActor(slug, lang);
      return NextResponse.json(actor);
    }

    if (type === 'actors') {
      const lang = searchParams.get('lang') || 'nl';
      const params: Record<string, string> = {};
      searchParams.forEach((value, key) => {
        if (key !== 'type' && key !== 'lang') params[key] = value;
      });
      const results = await getActors(params, lang);
      return NextResponse.json(results);
    }

    if (type === 'music') {
      const category = searchParams.get('category') || 'music';
      const library = await getMusicLibrary(category);
      return NextResponse.json(library);
    }

    if (type === 'navigation') {
      const journey = searchParams.get('journey') || 'agency';
      try {
        const config = await ConfigBridge.getNavConfig(journey);
        return NextResponse.json(config || { links: [], icons: {} });
      } catch (navErr) {
        console.error(`[Admin Config GET] Navigation fetch failed for ${journey}:`, navErr);
        return NextResponse.json({ links: [], icons: {} });
      }
    }

    // Default: Return all app configs
    const configs = await db.select().from(appConfigs).catch(() => []);
    const configMap = configs.reduce((acc: any, curr) => {
      acc[curr.key] = curr.value;
      return acc;
    }, {});

    return NextResponse.json(configMap);
  } catch (error) {
    console.error('[Admin Config GET Error]:', error);
    return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  //  CHRIS-PROTOCOL: Build Safety
  if (process.env.NEXT_PHASE === 'phase-production-build' || (process.env.NODE_ENV === 'production' && !process.env.VERCEL_URL && !process.env.DATABASE_URL)) {
    return NextResponse.json({ success: true });
  }

  const auth = await requireAdmin();
  if (auth instanceof NextResponse) return auth;

  try {
    //  CHRIS-PROTOCOL: Database Timeout Protection (2026)
    const dbWithTimeout = async <T>(promise: Promise<T>): Promise<T> => {
      const timeout = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Database Timeout')), 5000) // Verhoogd naar 5s voor stabiliteit
      );
      return Promise.race([promise, timeout]) as Promise<T>;
    };

    // 🛡️ CHRIS-PROTOCOL: Nuclear JSON Guard (v2.14.197)
    // If we can't parse the body, we return a clear error instead of crashing with 500.
    let body: any = {};
    try {
      body = await request.json();
    } catch (jsonErr) {
      console.warn('[Admin Config POST] Failed to parse JSON body:', jsonErr);
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
    }

    const { key, value } = body;

    if (!key) return NextResponse.json({ error: 'Key is required' }, { status: 400 });

    await db.insert(appConfigs)
      .values({
        key,
        value,
        updatedAt: new Date()
      })
      .onConflictDoUpdate({
        target: appConfigs.key,
        set: {
          value,
          updatedAt: new Date()
        }
      });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[Admin Config POST Error]:', error);
    return NextResponse.json({ error: 'Failed to update config' }, { status: 500 });
  }
}
