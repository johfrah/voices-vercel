import { db } from '@db';
import { appConfigs } from '@db/schema';
import { eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';
import { DEFAULT_KASSA_CONFIG } from '@/lib/pricing-engine';
import { voicesConfig } from '@/lib/edge-config';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET() {
  try {
    // CHRIS-PROTOCOL: Edge Config First (0ms latency fallback)
    const edgeBsf = await voicesConfig.getBaseTariffBSF();
    
    const [config] = await db.select().from(appConfigs).where(eq(appConfigs.key, 'pricing_config')).limit(1);
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
