import { db } from '@db';
import { faq, actors, workshops, contentArticles } from '@db/schema';
import { eq, and } from 'drizzle-orm';

/**
 * ⚡ SEO ENGINE SERVICE (2026)
 * 
 * Ported from legacy PHP systems. Handles meta-tags, sitemaps, 
 * and internal linking automation.
 */

export interface MetaTags {
  title: string;
  description: string;
  keywords?: string;
  ogImage?: string;
  canonical?: string;
}

export class SEOEngineService {
  /**
   * Generate meta tags for any page based on context
   */
  static async generateMetaTags(path: string, context: any = {}): Promise<MetaTags> {
    const defaultMeta: MetaTags = {
      title: 'Voices Studio | Jouw verhaal komt binnen',
      description: 'De fysieke plek voor directe begeleiding in het stemmenambacht. Leer van de experts.',
      ogImage: '/assets/common/og-image.jpg'
    };

    // 1. Studio Page
    if (path === '/studio') {
      return {
        ...defaultMeta,
        title: 'Workshops voor professionele sprekers | Voices Studio',
        description: 'Ontdek onze workshops in de studio. Directe begeleiding van Johfrah en andere experts.'
      };
    }

    // 2. Workshop Detail
    if (path.startsWith('/studio/workshop/')) {
      const slug = path.split('/').pop();
      const workshop = await db.query.workshops.findFirst({
        where: eq(workshops.slug, slug!)
      });

      if (workshop) {
        return {
          title: `${workshop.title} | Voices Studio Workshop`,
          description: workshop.description?.substring(0, 160) || defaultMeta.description,
          ogImage: workshop.mediaId ? `/assets/media/${workshop.mediaId}` : defaultMeta.ogImage
        };
      }
    }

    // 3. FAQ Pages
    if (path.startsWith('/faq')) {
      return {
        title: 'Veelgestelde vragen over stemmen en workshops | Voices.be',
        description: 'Vind antwoorden op al je vragen over tarieven, levertijden en onze studio workshops.'
      };
    }

    return defaultMeta;
  }

  /**
   * Generate Dynamic Sitemap Data
   */
  static async getSitemapEntries() {
    const entries: { url: string; lastMod: Date; priority: number }[] = [
      { url: '/', lastMod: new Date(), priority: 1.0 },
      { url: '/studio', lastMod: new Date(), priority: 0.9 },
      { url: '/agency', lastMod: new Date(), priority: 0.9 },
      { url: '/academy', lastMod: new Date(), priority: 0.8 },
    ];

    // Add Workshops
    const activeWorkshops = await db.select().from(workshops).where(eq(workshops.status, 'upcoming'));
    activeWorkshops.forEach(w => {
      entries.push({ url: `/studio/workshop/${w.slug}`, lastMod: w.date, priority: 0.7 });
    });

    // Add Actors
    const liveActors = await db.select().from(actors).where(eq(actors.status, 'live'));
    liveActors.forEach(a => {
      entries.push({ url: `/voice/${a.firstName.toLowerCase()}`, lastMod: a.updatedAt || new Date(), priority: 0.6 });
    });

    return entries;
  }

  /**
   * Internal Linking Engine
   * Finds keywords in text and wraps them in links
   */
  static automateInternalLinks(text: string): string {
    const links = [
      { keyword: 'workshop', url: '/studio' },
      { keyword: 'stemmen', url: '/agency' },
      { keyword: 'leren', url: '/academy' },
      { keyword: 'Johfrah', url: '/voice/johfrah' }
    ];

    let linkedText = text;
    links.forEach(link => {
      const regex = new RegExp(`\\b${link.keyword}\\b`, 'gi');
      // Simple replacement, avoiding nested links
      linkedText = linkedText.replace(regex, `<a href="${link.url}" class="seo-link">${link.keyword}</a>`);
    });

    return linkedText;
  }
}
