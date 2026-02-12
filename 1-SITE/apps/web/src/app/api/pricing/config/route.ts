import { db } from '@db';
import { appConfigs } from '@db/schema';
import { eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';
import { PricingEngine } from '@/lib/pricing-engine';

export async function GET() {
  try {
    const [config] = await db.select().from(appConfigs).where(eq(appConfigs.key, 'pricing_config')).limit(1);
    const value = (config?.value as Record<string, any>) || PricingEngine.getDefaultConfig();
    return NextResponse.json(value);
  } catch (e) {
    console.error("Failed to fetch pricing config", e);
    return NextResponse.json(PricingEngine.getDefaultConfig());
  }
}
