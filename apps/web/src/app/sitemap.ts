import { db } from '@/lib/system/voices-config';
import { actors, contentArticles } from '@/lib/system/voices-config';
import { eq } from 'drizzle-orm';
import { MetadataRoute } from 'next';

/**
 *  NUCLEAR SITEMAP (2026)
 * 
 * Doel: Een dynamische, meertalige sitemap die zoekmachines en LLM's 
 * direct naar de Gouden Bron leidt.
 */

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://www.voices.be';

  // 1. Core Pages
  const coreRoutes = [
    { path: '', priority: 1.0, freq: 'daily' as const },
    { path: '/agency', priority: 0.9, freq: 'daily' as const },
    { path: '/studio', priority: 0.8, freq: 'weekly' as const },
    { path: '/academy', priority: 0.7, freq: 'weekly' as const },
    { path: '/johfrai', priority: 0.7, freq: 'weekly' as const },
    { path: '/ademing', priority: 0.7, freq: 'weekly' as const },
    { path: '/partners', priority: 0.6, freq: 'monthly' as const },
    { path: '/contact', priority: 0.7, freq: 'monthly' as const },
    { path: '/over-ons', priority: 0.6, freq: 'monthly' as const },
    { path: '/hoe-het-werkt', priority: 0.7, freq: 'monthly' as const },
    { path: '/veelgestelde-vragen', priority: 0.6, freq: 'monthly' as const },
    { path: '/terms', priority: 0.3, freq: 'yearly' as const },
    { path: '/privacy', priority: 0.3, freq: 'yearly' as const },
    { path: '/studio/quiz', priority: 0.5, freq: 'monthly' as const },
    { path: '/studio/doe-je-mee', priority: 0.5, freq: 'monthly' as const },
    { path: '/account/login', priority: 0.4, freq: 'monthly' as const },
  ];

  // 2. Dynamic routes from database
  let actorSlugs: string[] = [];
  let articleSlugs: string[] = [];

  try {
    const liveActors = await db.select({ slug: actors.slug }).from(actors).where(eq(actors.status, 'live'));
    actorSlugs = liveActors.map(a => a.slug).filter(Boolean) as string[];
  } catch (e) {
    console.error('[Sitemap] Actor query failed:', e);
  }

  try {
    const publishedArticles = await db.select({ slug: contentArticles.slug }).from(contentArticles).where(eq(contentArticles.status, 'publish'));
    articleSlugs = publishedArticles.map(a => a.slug).filter(Boolean);
  } catch (e) {
    console.error('[Sitemap] Article query failed:', e);
  }

  const entries: MetadataRoute.Sitemap = [];

  // Core pages
  coreRoutes.forEach(r => {
    entries.push({
      url: `${baseUrl}${r.path}`,
      lastModified: new Date(),
      changeFrequency: r.freq,
      priority: r.priority,
    });
  });

  // Actor pages — URL is /{slug} (SmartRouter resolves via slug_registry)
  actorSlugs.forEach(slug => {
    entries.push({
      url: `${baseUrl}/${slug}`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.7,
    });
  });

  // CMS article pages — URL is /{slug} (SmartRouter resolves via slug_registry)
  const excludeSlugs = ['agency', 'contact', 'terms', 'privacy', 'account', 'checkout', 'cart', 'demos'];
  articleSlugs.filter(s => !excludeSlugs.includes(s) && !s.startsWith('admin')).forEach(slug => {
    entries.push({
      url: `${baseUrl}/${slug}`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    });
  });

  return entries;
}
