import { db } from "@db";
import { pageLayouts } from "@db/schema";
import { eq } from "drizzle-orm";

/**
 *  PURE GOD MODE: Haalt de Bento Blueprint op voor een dynamische pagina
 */
export async function getPageLayout(slug: string): Promise<any> {
  const [layout] = await db.select().from(pageLayouts).where(eq(pageLayouts.slug, slug)).limit(1);
  return layout;
}

export async function savePageLayout(slug: string, layoutJson: any, title?: string): Promise<any> {
  const existing = await getPageLayout(slug);

  if (existing) {
    return await db.update(pageLayouts)
      .set({ 
        layoutJson, 
        title: title || existing.title,
        updatedAt: new Date() 
      })
      .where(eq(pageLayouts.slug, slug));
  } else {
    return await db.insert(pageLayouts).values({
      slug,
      title: title || slug,
      layoutJson,
      isPublished: true
    });
  }
}
