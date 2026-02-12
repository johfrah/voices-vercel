import { MetadataRoute } from 'next';
import { db } from '@db';
import { actors, contentArticles } from '@db/schema';
import { eq } from 'drizzle-orm';

/**
 * 🗺️ NUCLEAR SITEMAP (2026)
 * 
 * Doel: Een dynamische, meertalige sitemap die zoekmachines en LLM's 
 * direct naar de Gouden Bron leidt.
 */

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://voices.be';
  const languages = ['', '/en', '/fr', '/de']; // Ondersteunde talen

  // 1. Core Pages (Statisch)
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
  ];

  // 2. Dynamische Routes: Actors (Voice-overs)
  const allActors = await db.select({ slug: actors.slug }).from(actors).where(eq(actors.status, 'live'));
  
  // 3. Dynamische Routes: Articles (Blog/Stories)
  const allArticles = await db.select({ slug: contentArticles.slug }).from(contentArticles);

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
      sitemapEntries.push({
        url: `${baseUrl}${lang}/voice/${actor.slug}/`,
        lastModified: new Date(),
        changeFrequency: 'weekly',
        priority: 0.7,
      });
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
  }

  return sitemapEntries;
}
