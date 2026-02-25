import { NextResponse } from 'next/server';
import { db, translations, workshops } from '@/lib/system/voices-config';
import { eq, and } from 'drizzle-orm';
import { requireAdmin } from '@/lib/auth/api-auth';

/**
 *  VOICEGLOT ADMIN API
 * Slaat handmatige wijzigingen direct op in de database.
 */
export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  //  CHRIS-PROTOCOL: Build Safety
  if (process.env.NEXT_PHASE === 'phase-production-build' || (process.env.NODE_ENV === 'production' && !process.env.VERCEL_URL)) {
    return NextResponse.json({ success: true });
  }

  const auth = await requireAdmin();
  if (auth instanceof NextResponse) return auth;

  try {
    const { key, text, lang, isManual } = await req.json();

    if (!key || !text || !lang) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    //  WORKSHOP TITLE/DESC SYNC MANDATE
    // Als de key begint met 'studio.workshop.', synchroniseren we direct naar de workshops tabel
    if (key.startsWith('studio.workshop.')) {
      const parts = key.split('.');
      const workshopId = parseInt(parts[2]);
      const field = parts[3]; // 'title' of 'description'

      if (!isNaN(workshopId) && (field === 'title' || field === 'description')) {
        console.log(` SYNCING WORKSHOP ${workshopId} FIELD ${field} TO SUPABASE...`);
        await db.update(workshops)
          .set({ [field]: text })
          .where(eq(workshops.id, workshopId));
      }
    }

    // Check if translation exists
    const existing = await db.select()
      .from(translations)
      .where(and(
        eq(translations.translationKey, key),
        eq(translations.lang, lang)
      ))
      .limit(1)
      .catch(() => []);

    await db.transaction(async (tx) => {
      if (existing.length > 0) {
        // Update existing
        await tx.update(translations)
          .set({
            translatedText: text,
            status: 'active',
            is_manually_edited: true,
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
          is_manually_edited: true,
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
