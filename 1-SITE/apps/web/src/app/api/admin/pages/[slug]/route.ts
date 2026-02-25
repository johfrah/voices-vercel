import { db } from '@/lib/system/db';
import { contentArticles, contentBlocks } from '@/lib/system/db';
import { eq, asc } from 'drizzle-orm';
import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth/api-auth';

/**
 *  API: ADMIN PAGE DETAIL (NUCLEAR CMS)
 * 
 * Doel: Haal een specifieke pagina en haar blokken op.
 *  Admin only.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  const auth = await requireAdmin();
  if (auth instanceof NextResponse) return auth;

  const slug = params.slug;

  try {
    const [page] = await db.select()
      .from(contentArticles)
      .where(eq(contentArticles.slug, slug))
      .limit(1);

    if (!page) {
      return NextResponse.json({ error: 'Page not found' }, { status: 404 });
    }

    const blocks = await db.select()
      .from(contentBlocks)
      .where(eq(contentBlocks.articleId, page.id))
      .orderBy(asc(contentBlocks.displayOrder));

    return NextResponse.json({ success: true, page, blocks });
  } catch (error) {
    console.error(' Admin Page Detail API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

/**
 *  API: UPDATE PAGE (NUCLEAR CMS)
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  const auth = await requireAdmin();
  if (auth instanceof NextResponse) return auth;

  const slug = params.slug;
  const { title, blocks } = await request.json();

  try {
    const [page] = await db.select()
      .from(contentArticles)
      .where(eq(contentArticles.slug, slug))
      .limit(1);

    if (!page) {
      return NextResponse.json({ error: 'Page not found' }, { status: 404 });
    }

    // Update page title
    await db.update(contentArticles)
      .set({ title, updatedAt: new Date() })
      .where(eq(contentArticles.id, page.id));

    // Update blocks
    for (const block of blocks) {
      await db.update(contentBlocks)
        .set({ content: block.content, updatedAt: new Date() })
        .where(eq(contentBlocks.id, block.id));
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(' Admin Page Update API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
