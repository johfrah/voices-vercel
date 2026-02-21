import { db } from '@db';
import { appConfigs, languages } from '@db/schema';
import { eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';
import { voicesConfig } from '@/lib/edge-config';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  //  CHRIS-PROTOCOL: Build Safety
  if (process.env.NEXT_PHASE === 'phase-production-build' || (process.env.NODE_ENV === 'production' && !process.env.VERCEL_URL)) {
    return NextResponse.json({ success: true, message: 'Skipping home config during build' });
  }

  try {
    const campaignMessage = await voicesConfig.getCampaignMessage();
    const [homeConfig] = await db.select().from(appConfigs).where(eq(appConfigs.key, 'home_journey_content')).limit(1);
    const dbLanguages = await db.select({
      id: languages.id,
      code: languages.code,
      label: languages.label,
      isPopular: languages.isPopular
    }).from(languages).orderBy(languages.label);

    return NextResponse.json({
      journeyContent: homeConfig?.value || null,
      languages: dbLanguages,
      campaignMessage: campaignMessage || null
    });
  } catch (e) {
    console.error('Failed to fetch home config', e);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
