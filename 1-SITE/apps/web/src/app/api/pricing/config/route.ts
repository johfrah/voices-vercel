import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import { DEFAULT_KASSA_CONFIG } from '@/lib/engines/pricing-engine';
import { voicesConfig } from '@/lib/utils/edge-config';

//  CHRIS-PROTOCOL: SDK fallback for stability (v2.14.273)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
    detectSessionInUrl: false
  }
});

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET() {
  try {
    // CHRIS-PROTOCOL: Edge Config First (0ms latency fallback)
    const edgeBsf = await voicesConfig.getBaseTariffBSF();
    
    // 🛡️ CHRIS-PROTOCOL: Use SDK for stability (v2.14.273)
    const { data: config } = await supabase
      .from('app_configs')
      .select('value')
      .eq('key', 'pricing_config')
      .single();

    const value = (config?.value as Record<string, any>) || DEFAULT_KASSA_CONFIG;
    
    // Injecteer Edge Config waarden indien aanwezig
    if (edgeBsf) {
      value.basePrice = edgeBsf * 100; // Convert to cents for engine
    }

    return NextResponse.json(value);
  } catch (e) {
    console.error("Failed to fetch pricing config", e);
    return NextResponse.json(DEFAULT_KASSA_CONFIG);
  }
}
