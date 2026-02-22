import { db } from '@db';
import { appConfigs, languages } from '@db/schema';
import { eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';
import { voicesConfig } from '@/lib/edge-config';
import { createClient } from "@supabase/supabase-js";

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  //  CHRIS-PROTOCOL: Build Safety
  if (process.env.NEXT_PHASE === 'phase-production-build' || (process.env.NODE_ENV === 'production' && !process.env.VERCEL_URL)) {
    return NextResponse.json({ success: true, message: 'Skipping home config during build' });
  }

  try {
    const campaignMessage = await voicesConfig.getCampaignMessage().catch(() => null);
    
    // CHRIS-PROTOCOL: Use SDK fallback for stability
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    let homeConfigValue = null;
    let dbLanguages: any[] = [];

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

    return NextResponse.json({
      journeyContent: homeConfigValue || null,
      languages: dbLanguages,
      campaignMessage: campaignMessage || null
    });
  } catch (e: any) {
    console.error('Failed to fetch home config', e);
    return NextResponse.json({ 
      error: 'Internal Server Error', 
      message: e.message,
      _forensic: 'Check server logs for home config failure' 
    }, { status: 500 });
  }
}
