import { db } from '@db';
import { appConfigs, languages } from '@db/schema';
import { eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

export async function GET() {
  try {
    // 1. Fetch Homepage Journey Content
    const [homeConfig] = await db.select().from(appConfigs).where(eq(appConfigs.key, 'home_journey_content')).limit(1);
    
    // 2. Fetch Dynamic Languages for Filters
    const dbLanguages = await db.select({
      id: languages.id,
      code: languages.code,
      label: languages.label,
      isPopular: languages.isPopular
    }).from(languages).orderBy(languages.label);

    return NextResponse.json({
      journeyContent: homeConfig?.value || null,
      languages: dbLanguages
    });
  } catch (e) {
    console.error("Failed to fetch home config", e);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
