import { db, getTable } from '@/lib/system/voices-config';

const faq = getTable('faq');
const actors = getTable('actors');
const workshops = getTable('workshops');
const contentArticles = getTable('contentArticles');
import { eq, and } from 'drizzle-orm';
import { MarketManagerServer as MarketManager } from '@/lib/system/market-manager-server';

/**
 *  SEO ENGINE SERVICE (2026)
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
    const market = MarketManager.getCurrentMarket(context.host);
    
    const defaultMeta: MetaTags = {
      title: `${market.name} | Jouw verhaal komt binnen`,
      description: market.seo_data?.description || 'De fysieke plek voor directe begeleiding in het stemmenambacht. Leer van de experts.',
      ogImage: '/assets/common/og-image.jpg'
    };

    // 1. Studio Page
    if (path === '/studio') {
      return {
        ...defaultMeta,
        title: `Workshops voor professionele sprekers | ${market.name} Studio`,
        description: `Ontdek onze workshops in de studio. Directe begeleiding van experts bij ${market.name}.`
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
          title: `${workshop.title} | ${market.name} Studio Workshop`,
          description: workshop.description?.substring(0, 160) || defaultMeta.description,
          ogImage: workshop.mediaId ? `/assets/media/${workshop.mediaId}` : defaultMeta.ogImage
        };
      }
    }

    // 3. FAQ Pages
    if (path.startsWith('/faq')) {
      const domains = MarketManager.getMarketDomains();
      const canonicalHost = domains[market.market_code]?.replace('https://', '') || 'www.voices.be';
      return {
        title: `Veelgestelde vragen over stemmen en workshops | ${canonicalHost}`,
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
      entries.push({ url: `/voice/${a.first_name.toLowerCase()}`, lastMod: a.updatedAt || new Date(), priority: 0.6 });
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
      { keyword: 'leren', url: '/academy' }
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
