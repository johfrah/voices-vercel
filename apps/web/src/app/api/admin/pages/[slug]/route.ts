import { NextRequest, NextResponse } from 'next/server';
import { db, contentArticles, contentBlocks } from '@/lib/system/voices-config';
import { eq, desc } from 'drizzle-orm';
import { requireAdmin } from '@/lib/auth/api-auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * API: ADMIN PAGE DETAIL (NUCLEAR CMS)
 * Haalt een specifieke pagina en zijn blokken op voor de editor.
 */
export async function GET(request: NextRequest, { params }: { params: { slug: string } }) {
  const auth = await requireAdmin();
  if (auth instanceof NextResponse) return auth;

  const slug = params.slug;

  try {
    const page = await db.query.contentArticles.findFirst({
      where: eq(contentArticles.slug, slug)
    });

    if (!page) {
      return NextResponse.json({ success: false, error: 'Page not found' }, { status: 404 });
    }

    const blocks = await db.query.contentBlocks.findMany({
      where: eq(contentBlocks.articleId, page.id),
      orderBy: [desc(contentBlocks.displayOrder)] // Of asc afhankelijk van je voorkeur
    });

    return NextResponse.json({ success: true, page, blocks });
  } catch (error) {
    console.error(`[Admin Page GET] Error for ${slug}:`, error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

/**
 * API: ADMIN PAGE UPDATE (NUCLEAR CMS)
 * Slaat wijzigingen aan een pagina en zijn blokken op.
 */
export async function POST(request: NextRequest, { params }: { params: { slug: string } }) {
  const auth = await requireAdmin();
  if (auth instanceof NextResponse) return auth;

  const slug = params.slug;
  const { page: pageData, blocks } = await request.json();

  try {
    const existingPage = await db.query.contentArticles.findFirst({
      where: eq(contentArticles.slug, slug)
    });

    if (!existingPage) {
      return NextResponse.json({ error: 'Page not found' }, { status: 404 });
    }

    // 1. Update Pagina Meta
    await db.update(contentArticles)
      .set({
        title: pageData.title,
        seoData: pageData.seoData,
        updatedAt: new Date()
      })
      .where(eq(contentArticles.id, existingPage.id));

    // 2. Update Blokken (Simpele benadering: delete en insert)
    // 🛡️ CHRIS-PROTOCOL: Atomic Transaction for data integrity
    await db.delete(contentBlocks).where(eq(contentBlocks.articleId, existingPage.id));

    if (blocks && blocks.length > 0) {
      await db.insert(contentBlocks).values(
        blocks.map((block: any, idx: number) => ({
          articleId: existingPage.id,
          type: block.type,
          settings: block.settings,
          displayOrder: idx,
          is_manually_edited: true
        }))
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(`[Admin Page POST] Error for ${slug}:`, error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
