import { db, translations } from '@/lib/system/voices-config';
import { like, or } from 'drizzle-orm';
import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth/api-auth';

/**
 *  API: VOICEGLOT CLEAN SLOP (NUCLEAR 2026)
 * 
 * Doel: Verwijdert AI-foutmeldingen die per ongeluk als vertaling zijn opgeslagen.
 */

export const dynamic = 'force-dynamic';

export async function GET() {
  //  CHRIS-PROTOCOL: Build Safety
  if (process.env.NEXT_PHASE === 'phase-production-build' || (process.env.NODE_ENV === 'production' && !process.env.VERCEL_URL)) {
    return NextResponse.json({ success: true, count: 0, deletedItems: [] });
  }

  const auth = await requireAdmin();
  if (auth instanceof NextResponse) return auth;

  console.log('🧹 Cleaning translation slop...');
  
  const slopPatterns = [
    '%Het lijkt erop dat de tekst%',
    '%Zou je de tekst%',
    '%niet compleet is%',
    '%context biedt%',
    '%meer informatie%',
    '%langere tekst%',
    '%Initial Load%'
  ];

  try {
    const conditions = slopPatterns.map(pattern => like(translations.translatedText, pattern));
    
    const deleted = await db.delete(translations)
      .where(or(...conditions))
      .returning({ id: translations.id, key: translations.translationKey, text: translations.translatedText });

    return NextResponse.json({ 
      success: true, 
      count: deleted.length,
      deletedItems: deleted.map(d => ({ key: d.key, text: d.text?.substring(0, 50) }))
    });

  } catch (error: any) {
    console.error('❌ Failed to clean slop:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
