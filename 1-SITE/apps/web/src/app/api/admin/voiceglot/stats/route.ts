import { db } from '@db';
import { translations, translationRegistry } from '@db/schema';
import { sql, desc } from 'drizzle-orm';
import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth/api-auth';

/**
 * 🌍 API: VOICEGLOT STATS (2026)
 */

export async function GET(request: NextRequest) {
  const auth = await requireAdmin();
  if (auth instanceof NextResponse) return auth;

  try {
    // 1. Totaal aantal unieke strings in de registry
    const totalStringsResult = await db.select({ count: sql<number>`count(*)` }).from(translationRegistry);
    const totalStrings = Number(totalStringsResult[0].count);

    // 2. Aantal vertalingen per taal
    const statsByLang = await db.select({
      lang: translations.lang,
      count: sql<number>`count(*)`
    })
    .from(translations)
    .groupBy(translations.lang);

    // 3. Bereken percentages (we gaan uit van NL, EN, FR, DE als doeltalen)
    const targetLanguages = ['en', 'fr', 'de', 'es', 'pt'];
    const coverage = targetLanguages.map(lang => {
      const found = statsByLang.find(s => s.lang === lang);
      const count = found ? Number(found.count) : 0;
      return {
        lang,
        count,
        percentage: totalStrings > 0 ? Math.round((count / totalStrings) * 100) : 0
      };
    });

    // 4. Onlangs toegevoegde strings (laatste 5)
    // translationRegistry heeft geen createdAt, we gebruiken lastSeen
    const recentStrings = await db.select().from(translationRegistry).orderBy(desc(translationRegistry.lastSeen)).limit(5);

    return NextResponse.json({
      totalStrings,
      coverage,
      recentStrings,
      status: totalStrings > 0 ? 'ACTIVE' : 'INITIALIZING'
    });
  } catch (error) {
    console.error('[Voiceglot Stats Error]:', error);
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 });
  }
}
