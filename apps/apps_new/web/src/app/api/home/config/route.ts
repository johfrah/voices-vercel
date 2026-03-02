import { db, appConfigs, languages } from '@/lib/system/voices-config';
import { eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';
import { voicesConfig } from '@/lib/utils/edge-config';
import { createClient } from "@supabase/supabase-js";

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * @lock-file
 */

// 🛡️ CHRIS-PROTOCOL: Nuclear Caching (24h TTL)
let cachedHomeConfig: any = null;
let lastFetchTime = 0;
const CACHE_TTL = 1000 * 60 * 60 * 24; // 24 uur

export async function GET() {
  //  CHRIS-PROTOCOL: Build Safety
  if (process.env.NEXT_PHASE === 'phase-production-build' || (process.env.NODE_ENV === 'production' && !process.env.VERCEL_URL)) {
    return NextResponse.json({ success: true, message: 'Skipping home config during build' });
  }

  // 🛡️ CHRIS-PROTOCOL: Nuclear Cache Check
  const now = Date.now();
  if (cachedHomeConfig && (now - lastFetchTime < CACHE_TTL)) {
    return NextResponse.json(cachedHomeConfig);
  }

  try {
    const campaignMessage = await voicesConfig.getCampaignMessage().catch(() => null);
    
    // CHRIS-PROTOCOL: Use SDK fallback for stability
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    let homeConfigValue = null;
    let dbLanguages: any[] = [];

    // 🛡️ CHRIS-PROTOCOL: 2s internal timeout for DB calls
    const dbPromise = (async () => {
      try {
        const [homeConfig] = await db.select().from(appConfigs).where(eq(appConfigs.key, 'home_journey_content')).limit(1);
        homeConfigValue = homeConfig?.value;
        
        dbLanguages = await db.select({
          id: languages.id,
          code: languages.code,
          label: languages.label,
          isPopular: languages.isPopular
        }).from(languages).orderBy(languages.label);
      } catch (dbErr) {
        console.warn(' [Home Config API] Drizzle failed, falling back to SDK:', (dbErr as any).message);
        
        const { data: sdkConfig } = await supabase.from('app_configs').select('value').eq('key', 'home_journey_content').single();
        homeConfigValue = sdkConfig?.value;

        const { data: sdkLangs } = await supabase.from('languages').select('id, code, label, is_popular').order('label');
        dbLanguages = (sdkLangs || []).map(l => ({
          id: l.id,
          code: l.code,
          label: l.label,
          isPopular: l.is_popular
        }));
      }
    })();

    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Database timeout (2s)')), 2000)
    );

    try {
      await Promise.race([dbPromise, timeoutPromise]);
    } catch (err) {
      console.warn(' [Home Config API] DB Timeout reached, using stale cache or empty state');
      if (cachedHomeConfig) return NextResponse.json(cachedHomeConfig);
    }

    const result = {
      journeyContent: homeConfigValue || null,
      languages: dbLanguages,
      campaignMessage: campaignMessage || null
    };

    // Update cache
    cachedHomeConfig = result;
    lastFetchTime = now;

    return NextResponse.json(result);
  } catch (e: any) {
    console.error('Failed to fetch home config', e);
    
    // Fallback to cache if error
    if (cachedHomeConfig) return NextResponse.json(cachedHomeConfig);

    return NextResponse.json({ 
      error: 'Internal Server Error', 
      message: e.message,
      _forensic: 'Check server logs for home config failure' 
    }, { status: 500 });
  }
}
