import { requireAdmin } from '@/lib/auth/api-auth';
import { getActor, getActors, getMusicLibrary } from '@/lib/services/api-server';
import { appConfigs, db } from '@/lib/system/voices-config';
import { ConfigBridge } from '@/lib/utils/config-bridge';
import { createClient } from '@supabase/supabase-js';
import { eq } from 'drizzle-orm';
import { NextRequest, NextResponse } from 'next/server';

//  NUCLEAR CACHE BUSTER (v2.14.447)
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

// 🛡️ CHRIS-PROTOCOL: SDK fallback for stability (v2.14.750)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

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

  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type');

  // appConfigs en overige types: admin only
  const publicTypes = ['actor', 'actors', 'music', 'navigation', 'telephony', 'general', 'languages', 'genders', 'journeys', 'media_types', 'countries', 'sectors', 'blueprints', 'demos_enriched', 'telephony_subtypes'];
  if (!type || !publicTypes.includes(type)) {
    const auth = await requireAdmin();
    if (auth instanceof NextResponse) return auth;
  }

  try {
    // 🛡️ CHRIS-PROTOCOL: SDK-First for Public Config (v2.14.750)
    // Drizzle can be unstable in some serverless environments. We use SDK for critical public data.
    if (type === 'languages') {
      const { data: results } = await supabase.from('languages').select('*').order('id', { ascending: true });
      return NextResponse.json({ results: results || [] });
    }

    if (type === 'sectors') {
      const { data: results } = await supabase.from('sectors').select('*').order('name', { ascending: true });
      return NextResponse.json({ results: results || [] });
    }

    if (type === 'telephony_subtypes') {
      const { data: results } = await supabase.from('telephony_subtypes').select('*').order('id', { ascending: true });
      return NextResponse.json({ results: results || [] });
    }

    if (type === 'blueprints') {
      const { data: results } = await supabase.from('script_blueprints').select('*').order('title', { ascending: true });
      return NextResponse.json({ results: results || [] });
    }

    if (type === 'demos_enriched') {
      const { data: results } = await supabase
        .from('actor_demos')
        .select(`
          id, 
          name, 
          actor_id,
          actors (first_name, last_name),
          media_intelligence (transcript, detected_language_id),
          demo_sectors (sector_id, sectors (name)),
          media_types (label),
          languages (label),
          telephony_subtypes (name)
        `)
        .limit(100);

      // Flatten the results for the frontend
      const flattened = results?.map((d: any) => ({
        id: d.id,
        name: d.name,
        actor_name: `${d.actors?.first_name || ''} ${d.actors?.last_name || ''}`.trim(),
        transcript: d.media_intelligence?.transcript,
        detected_tones: d.media_intelligence?.ai_metadata?.detected_tones,
        sonic_dna: d.media_intelligence?.ai_metadata?.sonic_dna,
        sector_id: d.demo_sectors?.[0]?.sector_id,
        sector_name: d.demo_sectors?.[0]?.sectors?.name,
        media_type_label: d.media_types?.label,
        language_label: d.languages?.label,
        subtype_name: d.telephony_subtypes?.name
      }));

      return NextResponse.json({ results: flattened || [] });
    }

    if (type === 'genders') {
      const { data: results } = await supabase.from('genders').select('*').order('id', { ascending: true });
      return NextResponse.json({ results: results || [] });
    }

    if (type === 'countries') {
      const { data: results } = await supabase.from('countries').select('*').order('id', { ascending: true });
      return NextResponse.json({ results: results || [] });
    }

    if (type === 'journeys') {
      const { data: results } = await supabase.from('journeys').select('*').order('id', { ascending: true });
      return NextResponse.json({ results: results || [] });
    }

    if (type === 'media_types') {
      const { data: results } = await supabase.from('media_types').select('*').order('id', { ascending: true });
      return NextResponse.json({ results: results || [] });
    }

    //  CHRIS-PROTOCOL: Database Timeout Protection (2026)
    const dbWithTimeout = async <T>(promise: Promise<T>): Promise<T> => {
      const timeout = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Database Timeout')), 5000)
      );
      return Promise.race([promise, timeout]) as Promise<T>;
    };

    //  BRIDGE LOGIC: Handle client-side requests for server-only data
    if (type === 'telephony') {
      try {
        const config = await dbWithTimeout(db.select().from(appConfigs).where(eq(appConfigs.key, 'telephony_config')).limit(1)) as any[];
        return NextResponse.json({ telephony_config: config[0]?.value || {} });
      } catch (err: any) {
        console.warn(`[Admin Config] Telephony fetch failed, returning empty: ${err.message}`);
        return NextResponse.json({ telephony_config: {} });
      }
    }

    if (type === 'general') {
      try {
        const config = await dbWithTimeout(db.select().from(appConfigs).where(eq(appConfigs.key, 'general_settings')).limit(1)) as any[];
        return NextResponse.json({
          general_settings: config[0]?.value || {},
          _version: '2.15.028'
        });
      } catch (err: any) {
        console.warn(`[Admin Config] General settings fetch failed, returning empty: ${err.message}`);
        return NextResponse.json({
          general_settings: {},
          _version: '2.15.028'
        });
      }
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
    const configs = await db.select().from(appConfigs).catch(() => []) as any[];
    const configMap = configs.reduce((acc: any, curr: any) => {
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
    // 🛡️ CHRIS-PROTOCOL: Nuclear JSON Guard (v2.14.197)
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

    return NextResponse.json({ success: true, _version: '2.15.009' });
  } catch (error) {
    console.error('[Admin Config POST Error]:', error);
    return NextResponse.json({ error: 'Failed to update config' }, { status: 500 });
  }
}
