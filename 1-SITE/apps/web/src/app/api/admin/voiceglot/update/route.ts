import { NextResponse } from 'next/server';
import { db } from '@db';
import { translations } from '@db/schema';
import { eq, and } from 'drizzle-orm';
import { requireAdmin } from '@/lib/auth/api-auth';

/**
 * 🚀 VOICEGLOT ADMIN API
 * Slaat handmatige wijzigingen direct op in de database.
 */
export async function POST(req: Request) {
  const auth = await requireAdmin();
  if (auth instanceof NextResponse) return auth;

  try {
    const { key, text, lang, isManual } = await req.json();

    if (!key || !text || !lang) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Check if translation exists
    const existing = await db.select()
      .from(translations)
      .where(and(
        eq(translations.translationKey, key),
        eq(translations.lang, lang)
      ))
      .limit(1);

    await db.transaction(async (tx) => {
      if (existing.length > 0) {
        // Update existing
        await tx.update(translations)
          .set({
            translatedText: text,
            status: 'active',
            isManuallyEdited: true,
            updatedAt: new Date(),
          })
          .where(eq(translations.id, existing[0].id));
      } else {
        // Insert new
        await tx.insert(translations).values({
          translationKey: key,
          lang: lang,
          translatedText: text,
          status: 'active',
          isManuallyEdited: true,
          updatedAt: new Date(),
        });
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Voiceglot Update Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
