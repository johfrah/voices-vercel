import { db } from '@db';
import { actors, contentArticles } from '@db/schema';
import { eq } from 'drizzle-orm';
import { MetadataRoute } from 'next';

/**
 *  NUCLEAR SITEMAP (2026)
 * 
 * Doel: Een dynamische, meertalige sitemap die zoekmachines en LLM's 
 * direct naar de Gouden Bron leidt.
 */

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  //  CHRIS-PROTOCOL: Build Safety
  if (process.env.NEXT_PHASE === 'phase-production-build' || (process.env.NODE_ENV === 'production' && !process.env.VERCEL_URL)) {
    return [];
  }

  const { MarketManagerServer: MarketManager } = await import('@/lib/system/market-manager-server');
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || process.env.NEXT_PUBLIC_SITE_URL || MarketManager.getMarketDomains()['BE'] || 'https://www.voices.be';
  const languages = ['', '/en', '/fr', '/de']; // Ondersteunde talen

  // 1. Core Pages (Statisch) - Nuclear Deployment Trigger 2026.1
  const coreRoutes = [
    '',
    '/agency',
    '/studio',
    '/academy',
    '/artist',
    '/about',
    '/blog',
    '/faq',
    '/contact',
    '/terms',
    '/privacy',
    '/cookies',
    '/tarieven',
    '/over-ons',
    '/zo-werkt-het',
  ];

  // 2. Dynamische Routes: Actors, Articles, Academy & Studio
  let allActors: { slug: string | null }[] = [];
  let allArticles: { slug: string }[] = [];
  const academyLessons = Array.from({ length: 20 }, (_, i) => ({ id: (i + 1).toString() })); // 20 lessen

  try {
    allActors = await db.select({ slug: actors.slug }).from(actors).where(eq(actors.status, 'live')).catch(() => []);
    allArticles = await db.select({ slug: contentArticles.slug }).from(contentArticles).catch(() => []);
  } catch (error) {
    console.error('Sitemap generation error (database unreachable):', error);
    // We gaan door met alleen de core routes als de database niet bereikbaar is
  }

  const sitemapEntries: MetadataRoute.Sitemap = [];

  // Genereer entries voor alle talen
  for (const lang of languages) {
    // Core routes
    coreRoutes.forEach(route => {
      sitemapEntries.push({
        url: `${baseUrl}${lang}${route}/`,
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: route === '' ? 1.0 : 0.8,
      });
    });

    // Actor routes
    allActors.forEach(actor => {
      if (actor.slug) {
        sitemapEntries.push({
          url: `${baseUrl}${lang}/voice/${actor.slug}/`,
          lastModified: new Date(),
          changeFrequency: 'weekly',
          priority: 0.7,
        });
      }
    });

    // Article routes
    allArticles.forEach(article => {
      sitemapEntries.push({
        url: `${baseUrl}${lang}/article/${article.slug}/`,
        lastModified: new Date(),
        changeFrequency: 'monthly',
        priority: 0.6,
      });
    });

    //  Academy routes
    academyLessons.forEach(lesson => {
      sitemapEntries.push({
        url: `${baseUrl}${lang}/academy/lesson/${lesson.id}/`,
        lastModified: new Date(),
        changeFrequency: 'weekly',
        priority: 0.7,
      });
    });

  }

  return sitemapEntries;
}
