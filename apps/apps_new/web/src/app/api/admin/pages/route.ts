import { NextRequest, NextResponse } from 'next/server';
import { db, contentArticles } from '@/lib/system/voices-config';
import { desc } from 'drizzle-orm';
import { requireAdmin } from '@/lib/auth/api-auth';

/**
 *  API: ADMIN PAGES (NUCLEAR CMS)
 * 
 * Doel: Lijst van alle pagina's in de database.
 *  Admin only.
 */
export async function GET(request: NextRequest) {
  const auth = await requireAdmin();
  if (auth instanceof NextResponse) return auth;

  try {
    const pages = await db.select({
      id: contentArticles.id,
      title: contentArticles.title,
      slug: contentArticles.slug,
      iapContext: contentArticles.iapContext,
      updatedAt: contentArticles.updatedAt
    })
    .from(contentArticles)
    .orderBy(desc(contentArticles.updatedAt));

    return NextResponse.json({ success: true, pages });
  } catch (error) {
    console.error(' Admin Pages API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
