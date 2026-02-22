import { ContainerInstrument, HeadingInstrument, PageWrapperInstrument, TextInstrument, LoadingScreenInstrument, ButtonInstrument } from '@/components/ui/LayoutInstruments';
import { VoiceglotText } from '@/components/ui/VoiceglotText';
import { useTranslation } from '@/contexts/TranslationContext';
import { VoicesLink } from '@/components/ui/VoicesLink';
import { db } from '@db';
import { contentArticles, actors, artists, translations, castingLists } from '@db/schema';
import { eq, or, ilike, and } from 'drizzle-orm';
import { ArrowRight, CreditCard, Info, ShieldCheck, Star, Zap } from 'lucide-react';
import { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import { Suspense } from "react";
import { getActor, getArtist, getActors } from "@/lib/api-server";
import { headers } from "next/headers";
import { VoiceDetailClient } from "@/components/legacy/VoiceDetailClient";
import { ArtistDetailClient } from "@/components/legacy/ArtistDetailClient";
import { AgencyContent } from "@/components/legacy/AgencyContent";
import { AgencyHeroInstrument } from "@/components/ui/AgencyHeroInstrument";
import nextDynamic from "next/dynamic";
import { JourneyType } from '@/types/journey';
import { normalizeSlug } from '@/lib/system/slug';

//  NUCLEAR LOADING MANDATE
const LiquidBackground = nextDynamic(() => import("@/components/ui/LiquidBackground").then(mod => mod.LiquidBackground), { ssr: false });
const VideoPlayer = nextDynamic(() => import("@/components/academy/VideoPlayer").then(mod => mod.VideoPlayer), { ssr: false });

const AgencyCalculator = nextDynamic(() => import("@/components/ui/AgencyCalculator").then(mod => mod.AgencyCalculator), { ssr: false });

/**
 *  SUZY-MANDATE: Generate Structured Data (JSON-LD) for Voice Actors
 */
function generateActorSchema(actor: any, marketName: string = 'Voices', host: string = '') {
  const baseUrl = `https://${host || 'www.voices.be'}`;
  
  // Map internal delivery type to ISO 8601 duration
  const deliveryMap: Record<string, string> = {
    'sameday': 'PT4H',
    '24h': 'P1D',
    '48h': 'P2D',
    '72u': 'P3D'
  };
  
  const deliveryType = actor.delivery_config?.type || (actor.deliveryDaysMin === 0 ? 'sameday' : '24h');
  const deliveryDuration = deliveryMap[deliveryType] || 'P1D';

  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    'name': `${actor.firstName} - Voice-over Stem`,
    'description': actor.bio || actor.tagline,
    'provider': {
      '@type': 'LocalBusiness',
      'name': marketName,
      'url': baseUrl
    },
    'areaServed': 'BE',
    'offers': {
      '@type': 'Offer',
      'price': actor.starting_price || actor.price_unpaid,
      'priceCurrency': 'EUR',
      'availability': 'https://schema.org/InStock',
      'deliveryLeadTime': {
        '@type': 'QuantitativeValue',
        'value': deliveryType === 'sameday' ? 4 : (deliveryType === '24h' ? 1 : (deliveryType === '48h' ? 2 : 3)),
        'unitCode': deliveryType === 'sameday' ? 'HUR' : 'DAY'
      }
    },
    // Custom Nuclear Enrichment for LLMs
    'additionalType': 'https://schema.org/VoiceoverService',
    'identifier': actor.wpProductId || actor.id
  };
}

/**
 *  SUZY-MANDATE: Generate Structured Data (JSON-LD) for Artists
 */
function generateArtistSchema(artist: any, host: string = '') {
  const baseUrl = `https://${host || 'www.voices.be'}`;
  return {
    "@context": "https://schema.org",
    "@type": "MusicGroup",
    "name": artist.displayName,
    "description": artist.bio,
    "url": `${baseUrl}/artist/${artist.slug}`,
    "genre": artist.iapContext?.genre || "Pop",
    "sameAs": [
      artist.spotifyUrl,
      artist.youtubeUrl,
      artist.instagramUrl,
      artist.tiktokUrl
    ].filter(Boolean)
  };
}

/**
 * 🧠 SLUG RESOLVER (NUCLEAR 2026)
 * Zoekt de originele slug en entiteit op basis van een vertaalde slug.
 */
async function resolveSlug(slug: string, lang: string): Promise<{ originalSlug: string, type: 'article' | 'actor' | 'artist' | 'workshop' } | null> {
  const normalized = normalizeSlug(slug);
  
  // 1. Check de translations tabel voor een slug mapping
  // Key format: slug.[type].[original_slug]
  const mapping = await db.query.translations.findFirst({
    where: and(
      eq(translations.lang, lang),
      eq(translations.translatedText, normalized),
      ilike(translations.translationKey, 'slug.%')
    )
  });

  if (mapping && mapping.translationKey) {
    const parts = mapping.translationKey.split('.');
    if (parts.length >= 3) {
      return {
        originalSlug: parts.slice(2).join('.'),
        type: parts[1] as any
      };
    }
  }

  // 2. Geen mapping gevonden? Dan is het waarschijnlijk de originele slug
  return null;
}

export const dynamic = 'force-dynamic';

/**
 *  BOB-METHODE: De "Smart Router" (Root Dynamic Handler)
 *  Deze route handelt zowel CMS-artikelen als Stem-profielen af.
 *  URL Voorbeelden:
 *  - voices.be/over-ons (CMS)
 *  - voices.be/johfrah (Stem)
 *  - voices.be/johfrah/commercial/radio (Stem + Journey + Medium)
 * 
 * @lock-file
 */

interface SmartRouteParams {
  slug: string[];
}

export async function generateMetadata({ params }: { params: SmartRouteParams }): Promise<Metadata> {
  const [initialSegment] = params.slug;
  const reserved = ['admin', 'backoffice', 'account', 'api', 'auth', 'checkout', 'favicon.ico', 'robots.txt', 'sitemap.xml'];
  
  if (reserved.includes(initialSegment)) {
    return {};
  }

  const headersList = headers();
  const host = headersList.get('host') || 'www.voices.be';
  const { MarketManager } = await import('@config/market-manager');
  const market = MarketManager.getCurrentMarket(host);
  const lang = headersList.get('x-voices-lang') || 'nl';
  const normalizedSlug = normalizeSlug(params.slug);
  
  const siteUrl = `https://www.${market.market_code.toLowerCase() === 'be' ? 'voices.be' : (market.market_code.toLowerCase() === 'nlnl' ? 'voices.nl' : host)}`;
  
  // Resolve de slug naar de originele versie
  const resolved = await resolveSlug(normalizedSlug, lang);
  const firstSegment = resolved ? resolved.originalSlug : normalizedSlug.split('/')[0];

  //  CHRIS-PROTOCOL: Helper voor meertalige SEO via Voiceglot
  const getTranslatedSEO = async (key: string, defaultText: string) => {
    try {
      const mapping = await db.query.translations.findFirst({
        where: and(
          eq(translations.lang, lang),
          eq(translations.translationKey, key)
        )
      });
      return mapping?.translatedText || defaultText;
    } catch (e) {
      return defaultText;
    }
  };

  // 0. Agency Journey SEO
  if (firstSegment === "agency" || firstSegment === "stemmen" || firstSegment === "voix" || firstSegment === "stimmen") {
    const title = await getTranslatedSEO('seo.agency.title', `Voice-over Agency | Vind de perfecte stem | ${market.name}`);
    const description = await getTranslatedSEO('seo.agency.description', `Ontdek meer dan 500+ professionele voice-over stemmen voor video, commercial en telefonie. Directe prijsberekening en 24u levering bij ${market.name}.`);
    
    return {
      title,
      description,
      alternates: {
        canonical: `${siteUrl}/${lang !== 'nl' ? lang + '/' : ''}${normalizedSlug}`,
      }
    };
  }

  // 1. Probeer eerst een Artist te vinden (Artist Journey DNA)
  try {
    const artist = await getArtist(firstSegment, lang);
    if (artist) {
      const title = await getTranslatedSEO(`seo.artist.${artist.id}.title`, `${artist.displayName} | ${market.name} Artist`);
      const description = await getTranslatedSEO(`seo.artist.${artist.id}.description`, artist.bio);

      return {
        title,
        description,
        other: {
          'script:ld+json': JSON.stringify(generateArtistSchema(artist, host))
        }
      };
    }
  } catch (e) {}

  // 2. Probeer een Stem te vinden
  try {
    const actor = await getActor(firstSegment, lang);
    if (actor) {
      const title = await getTranslatedSEO(`seo.actor.${actor.id}.title`, `${actor.firstName} - Voice-over Stem | ${market.name}`);
      const description = await getTranslatedSEO(`seo.actor.${actor.id}.description`, actor.bio || `Ontdek de stem van ${actor.firstName} op ${market.name}.`);
      const schema = generateActorSchema(actor, market.name, host);

      return {
        title,
        description,
        alternates: {
          canonical: `${siteUrl}/${lang !== 'nl' ? lang + '/' : ''}${params.slug.join('/')}`,
        },
        other: {
          'script:ld+json': JSON.stringify(schema)
        }
      };
    }
  } catch (e) {
    // Geen stem gevonden, ga door naar CMS check
  }

  // 3. Probeer een CMS Artikel te vinden
  try {
    const page = await db.query.contentArticles.findFirst({
      where: eq(contentArticles.slug, firstSegment),
    }).catch(() => null);

    if (page) {
      const title = await getTranslatedSEO(`seo.page.${page.slug}.title`, `${page.title} | ${market.name}`);
      const description = await getTranslatedSEO(`seo.page.${page.slug}.description`, page.description || `Ontdek meer over ${page.title} op ${market.name}.`);
      return {
        title,
        description,
        alternates: {
          canonical: `${siteUrl}/${lang !== 'nl' ? lang + '/' : ''}${firstSegment}`,
        }
      };
    }
  } catch (e) {
    // Fout bij CMS check
  }

  return {};
}

export default async function SmartRoutePage({ params }: { params: SmartRouteParams }) {
  const [firstSegment] = params.slug;
  
  // Gereserveerde routes overslaan (Alleen harde systeem-folders)
  const reserved = ['admin', 'backoffice', 'account', 'api', 'auth', 'checkout', 'favicon.ico', 'robots.txt', 'sitemap.xml'];
  
  if (reserved.includes(firstSegment)) {
    return notFound();
  }

  return (
    <Suspense fallback={<LoadingScreenInstrument />}>
      <SmartRouteContent segments={params.slug} />
    </Suspense>
  );
}

async function SmartRouteContent({ segments }: { segments: string[] }) {
  const headersList = headers();
  const lang = headersList.get('x-voices-lang') || 'nl';
  const normalizedSlug = normalizeSlug(segments);
  
  // Resolve de slug naar de originele versie
  const resolved = await resolveSlug(normalizedSlug, lang);
  const firstSegment = resolved ? resolved.originalSlug : segments[0];
  const journey = segments[1];
  const medium = segments[2];

  // 1. Artist Journey (Youssef Mandate)
  try {
    const artist = await getArtist(firstSegment, lang);
    if (artist) {
      const isYoussef = firstSegment === 'youssef' || firstSegment === 'youssef-zaki';
      return (
        <PageWrapperInstrument>
          <ArtistDetailClient 
            artistData={artist} 
            isYoussef={isYoussef} 
            params={{ slug: firstSegment }} 
          />
        </PageWrapperInstrument>
      );
    }
  } catch (e) {}
  // 1.5 Agency Journey (Voice Casting)
  if (firstSegment === "agency" || firstSegment === "stemmen" || firstSegment === "voix" || firstSegment === "stimmen") {
    const filters: Record<string, string> = {};
    let agencyJourney = "video";
    if (segments[1] === "commercial" || segments[1] === "advertentie" || segments[1] === "reclame" || segments[1] === "publicité") agencyJourney = "commercial";
    else if (segments[1] === "telephony" || segments[1] === "telefonie" || segments[1] === "telefoon") agencyJourney = "telephony";
    else if (segments[1] === "video" || segments[1] === "corporate" || segments[1] === "vidéo") agencyJourney = "video";

    if (agencyJourney === "commercial" && segments[2]) {
      filters.media = segments[2];
    }

    let searchResults;
    try {
      searchResults = await getActors(filters, lang);
    } catch (error) {
      console.error("[SmartRouter] getActors failed:", error);
      searchResults = { results: [], filters: { genders: [], languages: [], styles: [] } };
    }
    const actors = searchResults.results || [];

    const mappedActors = actors.map((actor: any) => ({
      id: actor.id,
      display_name: actor.display_name,
      first_name: actor.first_name || actor.firstName,
      last_name: actor.last_name || actor.lastName,
      firstName: actor.firstName || actor.first_name,
      lastName: actor.lastName || actor.last_name,
      email: actor.email,
      photo_url: actor.photo_url,
      voice_score: actor.voice_score,
      native_lang: actor.native_lang,
      gender: actor.gender,
      starting_price: actor.starting_price,
      delivery_days_min: actor.delivery_days_min || 1,
      delivery_days_max: actor.delivery_days_max || 2,
      extra_langs: actor.extra_langs,
      tone_of_voice: actor.tone_of_voice,
      clients: actor.clients,
      cutoff_time: actor.cutoff_time || "18:00",
      availability: actor.availability || [],
      tagline: actor.tagline,
      ai_tags: actor.ai_tags || [],
      slug: actor.slug,
      demos: actor.demos || [],
      bio: actor.bio,
      price_ivr: actor.price_ivr,
      price_unpaid: actor.price_unpaid,
      price_online: actor.price_online,
      holiday_from: actor.holiday_from,
      holiday_till: actor.holiday_till,
      rates_raw: actor.rates_raw || {}
    }));

    const market = headersList.get("x-voices-market") || "BE";

    return (
      <>
        <Suspense fallback={null}>
          <LiquidBackground strokeWidth={1.5} />
        </Suspense>
        <AgencyHeroInstrument 
          filters={searchResults.filters}
          market={market}
          searchParams={filters}
        />
        <div className="!pt-0 -mt-24 relative z-40">
          <AgencyContent mappedActors={mappedActors} filters={searchResults.filters} />
        </div>
      </>
    );
  }

  // 2. Pitch Link (Casting List)
  if (firstSegment === 'pitch' && journey) {
    try {
      const { MarketManager } = await import('@config/market-manager');
      const host = headersList.get('host') || 'www.voices.be';
      const market = MarketManager.getCurrentMarket(host);

      //  CHRIS-PROTOCOL: Fetch real casting list from DB
      const list = await db.query.castingLists.findFirst({
        where: eq(castingLists.hash, journey),
        with: {
          items: {
            with: {
              actor: {
                with: {
                  actorLanguages: {
                    with: {
                      language: true
                    }
                  }
                }
              }
            },
            orderBy: (items, { asc }) => [asc(items.displayOrder)]
          }
        }
      });

      if (!list) return notFound();

      const schema = {
        '@context': 'https://schema.org',
        '@type': 'ItemList',
        'name': list.name,
        'numberOfItems': list.items.length,
        'itemListElement': list.items.map((item, i) => ({
          '@type': 'ListItem',
          'position': i + 1,
          'item': {
            '@type': 'Service',
            'name': item.actor.firstName,
            'provider': {
              '@type': 'LocalBusiness',
              'name': market.name
            }
          }
        }))
      };

      return (
        <PageWrapperInstrument className="bg-va-off-white">
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
          />
          <Suspense fallback={null}>
            <LiquidBackground strokeWidth={1.5} />
          </Suspense>
          <ContainerInstrument className="py-48 max-w-5xl mx-auto">
            <header className="mb-20 text-center">
              <TextInstrument className="text-[15px] font-medium tracking-[0.4em] text-primary/60 mb-6 block uppercase">
                <VoiceglotText translationKey="casting.selection_title" defaultText="Casting Selectie" />
              </TextInstrument>
              <HeadingInstrument level={1} className="text-6xl font-light tracking-tighter mb-8 text-va-black">
                {list.name}
              </HeadingInstrument>
              <ContainerInstrument className="w-24 h-1 bg-primary/20 rounded-full mx-auto" />
            </header>

            <ContainerInstrument className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {list.items.map((item, i) => (
                <ContainerInstrument key={i} className="bg-white p-8 rounded-[20px] shadow-aura border border-black/5 flex flex-col gap-6">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-va-off-white rounded-full flex items-center justify-center text-2xl font-light text-va-black/20 overflow-hidden">
                      {item.actor.photoId ? (
                        <img 
                          src={`/api/proxy/?path=${encodeURIComponent(item.actor.dropboxUrl || '')}`} 
                          alt={item.actor.firstName}
                          className="w-full h-full object-cover"
                        />
                      ) : item.actor.firstName[0]}
                    </div>
                    <div>
                      <HeadingInstrument level={3} className="text-2xl font-light">{item.actor.firstName}</HeadingInstrument>
                      <TextInstrument className="text-[15px] text-va-black/40">
                        <VoiceglotText 
                          translationKey={`common.language.${item.actor.actorLanguages?.find(al => al.isNative)?.language?.code || 'nl'}`} 
                          defaultText={item.actor.actorLanguages?.find(al => al.isNative)?.language?.label || 'Voice-over Stem'} 
                        />
                      </TextInstrument>
                    </div>
                  </div>
                  <div className="h-12 bg-va-off-white rounded-[10px] flex items-center px-4 gap-2">
                    <div className="w-8 h-8 bg-va-black rounded-full flex items-center justify-center text-white">
                      <ArrowRight size={14} />
                    </div>
                    <TextInstrument className="text-[13px] font-medium tracking-widest text-va-black/40 uppercase">
                      <VoiceglotText translationKey="action.view_profile" defaultText="Bekijk Profiel" />
                    </TextInstrument>
                  </div>
                  <VoicesLink 
                    href={`/${item.actor.slug}`}
                    className="w-full bg-va-black text-white py-4 rounded-[10px] font-medium tracking-widest text-[13px] uppercase hover:bg-primary transition-all text-center"
                  >
                    <VoiceglotText translationKey="action.select_voice" defaultText="Selecteer deze stem" />
                  </VoicesLink>
                </ContainerInstrument>
              ))}
            </ContainerInstrument>

            <footer className="mt-32 text-center">
              <ContainerInstrument className="bg-va-black text-white p-16 rounded-[20px] shadow-aura-lg">
                <HeadingInstrument level={2} className="text-4xl font-light mb-8">
                  <VoiceglotText translationKey="casting.no_match_title" defaultText="Niet de juiste match?" />
                </HeadingInstrument>
                <VoicesLink href="/agency" className="va-btn-pro inline-flex items-center gap-2">
                  <VoiceglotText translationKey="action.view_all_voices" defaultText="Bekijk alle stemmen" /> <ArrowRight size={18} />
                </VoicesLink>
              </ContainerInstrument>
            </footer>
          </ContainerInstrument>
        </PageWrapperInstrument>
      );
    } catch (e) {
      console.error("Pitch Link Error:", e);
      return notFound();
    }
  }

  // 2. Check voor Stem
  try {
    const actor = await getActor(firstSegment, lang);
    if (actor) {
      //  CHRIS-PROTOCOL: Map journey slug to internal journey type
      const journeyMap: Record<string, JourneyType> = {
        'telefoon': 'telephony',
        'telefooncentrale': 'telephony',
        'telephony': 'telephony',
        'video': 'video',
        'commercial': 'commercial',
        'reclame': 'commercial'
      };
      const mappedJourney = journey ? journeyMap[journey.toLowerCase()] : undefined;

      return (
        <PageWrapperInstrument>
          <VoiceDetailClient actor={actor} initialJourney={mappedJourney || journey} initialMedium={medium} />
        </PageWrapperInstrument>
      );
    }
  } catch (e) {
    // Geen stem
  }

  // 2. Check voor CMS Artikel (alleen als er maar 1 segment is)
  if (segments.length === 1) {
    try {
      const page = await db.query.contentArticles.findFirst({
        where: eq(contentArticles.slug, firstSegment),
        with: {
          blocks: {
            orderBy: (blocks, { asc }) => [asc(blocks.displayOrder)],
          },
        },
      }).catch(() => null);

      if (page) {
        return <CmsPageContent page={page} slug={firstSegment} />;
      }
    } catch (e) {
      // CMS Fout
    }
  }

  return notFound();
}

/**
 *  CMS Page Renderer (Gekopieerd uit de originele [slug]/page.tsx)
 */
function CmsPageContent({ page, slug }: { page: any, slug: string }) {
  const iapContext = page.iapContext as { journey?: string; lang?: string } | null;
  const journey = iapContext?.journey || 'agency';

  const getIcon = (cat: string) => {
    const c = cat.toLowerCase();
    if (c.includes('kwaliteit') || c.includes('veiligheid')) return <ShieldCheck strokeWidth={1.5} className="text-primary/40" size={40} />;
    if (c.includes('levering') || c.includes('annulering')) return <Zap strokeWidth={1.5} className="text-primary/40" size={40} />;
    if (c.includes('betaling') || c.includes('inschrijving')) return <CreditCard className="text-primary/40" size={40} />;
    return <Info strokeWidth={1.5} className="text-primary/40" size={40} />;
  };

  const extractTitle = (content: string) => {
    const match = content.match(/^(?:###|#####)\s+(.+)$/m);
    return {
      title: match ? match[1] : null,
      body: content.replace(/^(?:###|#####)\s+.+$/m, '').replace(/\\/g, '').replace(/\*\*/g, '').trim()
    };
  };

  const renderBlock = (block: any, index: number) => {
    const { title, body } = extractTitle(block.content || '');

    switch (block.type) {
      case 'founder':
        return (
          <section key={block.id} className="py-48 grid grid-cols-1 lg:grid-cols-12 gap-24 items-center animate-in fade-in slide-in-from-bottom-12 duration-1000 fill-mode-both">
            <ContainerInstrument className="lg:col-span-7">
              {title && <HeadingInstrument level={2} className="text-7xl font-light mb-12 leading-[1.1] tracking-tight text-va-black">{title}</HeadingInstrument>}
              <ContainerInstrument className="prose prose-2xl text-va-black/50 font-medium leading-relaxed tracking-tight">
                {body}
              </ContainerInstrument>
            </ContainerInstrument>
            <ContainerInstrument className="lg:col-span-5 relative">
              <ContainerInstrument className="aspect-[4/5] bg-va-black rounded-[80px] overflow-hidden shadow-aura-lg grayscale hover:grayscale-0 transition-all duration-1000 flex items-center justify-center group">
                <ContainerInstrument className="absolute inset-0 bg-gradient-to-tr from-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
                <TextInstrument className="text-primary/10 font-light text-9xl rotate-12 tracking-tighter"><VoiceglotText  translationKey="auto.page.voices.92ff10" defaultText="VOICES" /></TextInstrument>
              </ContainerInstrument>
              <ContainerInstrument className="absolute -bottom-20 -left-20 w-64 h-64 bg-primary/10 rounded-full blur-[100px] animate-pulse" />
            </ContainerInstrument>
          </section>
        );

      case 'carousel':
        return (
          <section key={block.id} className="py-48 bg-va-off-white border border-black/[0.03] -mx-4 px-4 lg:-mx-32 lg:px-32 rounded-[20px] shadow-aura relative overflow-hidden group animate-in fade-in duration-1000 fill-mode-both">
            <ContainerInstrument className="relative z-10">
              <ContainerInstrument className="flex items-center gap-6 mb-20">
                <Star strokeWidth={1.5} className="text-primary/40 fill-primary/10" size={32} />
                <HeadingInstrument level={2} className="text-5xl font-light tracking-tight text-va-black">{title || 'Onze Partners'}</HeadingInstrument>
              </ContainerInstrument>
              <ContainerInstrument className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
                {body.split('\n').filter(l => l.length > 5).map((partner, i) => (
                  <ContainerInstrument key={i} className="p-12 bg-white rounded-[20px] border border-black/[0.03] shadow-sm hover:shadow-aura transition-all duration-700 hover:scale-[1.02] group/card">
                    <TextInstrument className="text-2xl font-medium text-va-black/40 group-hover/card:text-va-black transition-colors leading-tight">{partner}</TextInstrument>
                  </ContainerInstrument>
                ))}
              </ContainerInstrument>
            </ContainerInstrument>
          </section>
        );

      case 'bento':
        const items = body.split('\n\n').filter(s => s.trim().length > 0);
        return (
          <section key={block.id} className="py-24 animate-in fade-in slide-in-from-bottom-12 duration-1000 fill-mode-both">
            <ContainerInstrument className="grid grid-cols-1 md:grid-cols-12 gap-8 auto-rows-[min-content]">
              {items.map((item, i) => {
                const videoMatch = item.match(/video:\s*([^\n]+)/);
                const videoUrl = videoMatch ? videoMatch[1].trim() : null;
                const cleanItem = item.replace(/video:\s*[^\n]+/, '').trim();
                const { title: itemTitle, body: itemBody } = extractTitle(cleanItem);
                const isLarge = i === 0;
                const currentLang = (page.iapContext as { lang?: string } | null)?.lang || 'nl';
                const subtitleUrl = videoUrl ? videoUrl.replace('.mp4', `-${currentLang}.vtt`) : null;
                
                return (
                  <ContainerInstrument 
                    key={i} 
                    className={`bg-white rounded-[20px] border border-black/[0.03] shadow-aura hover:shadow-aura-lg transition-all duration-1000 group/bento flex flex-col overflow-hidden
                      ${isLarge ? 'md:col-span-8' : 'md:col-span-4'}
                    `}
                  >
                    {videoUrl && (
                      <ContainerInstrument className="w-full bg-va-black relative">
                        <VideoPlayer strokeWidth={1.5} 
                          url={videoUrl} 
                          title={itemTitle}
                          subtitles={subtitleUrl ? [{
                            src: subtitleUrl,
                            lang: currentLang,
                            label: currentLang.toUpperCase()
                          }] : []}
                        />
                      </ContainerInstrument>
                    )}
                    <ContainerInstrument className="p-10 flex flex-col flex-grow">
                      {itemTitle && !videoUrl && (
                        <HeadingInstrument 
                          level={3} 
                          className={`${isLarge ? 'text-4xl' : 'text-xl'} font-light mb-4 tracking-tight text-va-black`}
                        >
                          {itemTitle}
                        </HeadingInstrument>
                      )}
                      <TextInstrument 
                        className={`${isLarge ? 'text-lg' : 'text-base'} text-va-black/40 font-medium leading-relaxed tracking-tight`}
                      >
                        {itemBody}
                      </TextInstrument>
                    </ContainerInstrument>
                  </ContainerInstrument>
                );
              })}
            </ContainerInstrument>
          </section>
        );

      case 'lifestyle':
        return (
          <section key={block.id} className="py-32 relative min-h-[80vh] flex items-center animate-in fade-in duration-1000 fill-mode-both">
            <ContainerInstrument className="absolute inset-0 bg-va-black rounded-[20px] overflow-hidden shadow-aura-lg grayscale-[0.5] hover:grayscale-0 transition-all duration-1000 group/lifestyle">
              <ContainerInstrument className="absolute inset-0 bg-gradient-to-b from-black/20 to-black/60" />
              <TextInstrument className="absolute inset-0 flex items-center justify-center text-white/5 font-black text-[20vw] rotate-12 tracking-tighter pointer-events-none "><VoiceglotText  translationKey="auto.page.voices.92ff10" defaultText="VOICES" /></TextInstrument>
            </ContainerInstrument>
            <ContainerInstrument className="relative z-10 max-w-xl ml-12 lg:ml-24 p-16 bg-white/90 backdrop-blur-xl rounded-[20px] shadow-aura-lg border border-white/20">
              {title && <HeadingInstrument level={2} className="text-5xl font-light mb-8 tracking-tight text-va-black leading-none">{title}</HeadingInstrument>}
              <ContainerInstrument className="prose prose-xl text-va-black/60 font-medium leading-relaxed tracking-tight">
                {body}
              </ContainerInstrument>
            </ContainerInstrument>
          </section>
        );

      case 'thematic':
        const steps = body.split('\n\n').filter(s => s.trim().length > 0);
        const gridCols = steps.length === 2 ? 'lg:grid-cols-2' : steps.length === 3 ? 'lg:grid-cols-3' : 'lg:grid-cols-4';
        return (
          <section key={block.id} className="py-24 animate-in fade-in slide-in-from-bottom-8 duration-1000 fill-mode-both">
            <ContainerInstrument className={`grid grid-cols-1 md:grid-cols-2 ${gridCols} gap-8`}>
              {steps.map((step, i) => {
                const { title: stepTitle, body: stepBody } = extractTitle(step);
                return (
                  <ContainerInstrument key={i} className="p-10 bg-white rounded-[20px] border border-black/[0.03] shadow-aura hover:shadow-aura-lg transition-all duration-700 hover:-translate-y-2 group/step">
                    <ContainerInstrument className="w-16 h-16 bg-va-off-white rounded-full flex items-center justify-center mb-8 group-hover/step:bg-primary/10 transition-colors duration-700">
                      <TextInstrument className="text-va-black/20 font-light text-2xl group-hover/step:text-primary transition-colors">0{i + 1}</TextInstrument>
                    </ContainerInstrument>
                    {stepTitle && <HeadingInstrument level={3} className="text-2xl font-light mb-4 tracking-tight text-va-black">{stepTitle}</HeadingInstrument>}
                    <TextInstrument className="text-lg text-va-black/40 font-medium leading-relaxed tracking-tight">
                      {stepBody}
                    </TextInstrument>
                  </ContainerInstrument>
                );
              })}
            </ContainerInstrument>
          </section>
        );

      case 'calculator':
        return (
          <section key={block.id} className="py-24 animate-in fade-in duration-1000 fill-mode-both">
            <AgencyCalculator />
          </section>
        );

      case 'Kwaliteit':
      case 'Levering':
      case 'Betaling':
      case 'Juridisch':
      case 'Service':
        return (
          <section key={block.id} className="grid grid-cols-1 lg:grid-cols-12 gap-24 items-start group py-32 border-b border-black/[0.03] last:border-none animate-in fade-in slide-in-from-bottom-8 duration-1000 fill-mode-both">
            <ContainerInstrument className="lg:col-span-5 sticky top-40">
              <ContainerInstrument className="mb-10 transform group-hover:scale-110 transition-transform duration-1000 ease-va-bezier">{getIcon(block.type)}</ContainerInstrument>
              <HeadingInstrument level={2} className="text-5xl font-light tracking-tight mb-8 text-va-black leading-none">
                {block.type}
              </HeadingInstrument>
              <TextInstrument className="text-3xl text-va-black/20 font-medium leading-tight tracking-tight">
                {title}
              </TextInstrument>
            </ContainerInstrument>
            <ContainerInstrument className="lg:col-span-7 pt-4">
              <ContainerInstrument className="prose prose-2xl text-va-black/40 font-medium leading-relaxed tracking-tight selection:bg-primary/10">
                {body}
              </ContainerInstrument>
            </ContainerInstrument>
          </section>
        );

      default:
        return (
          <section key={block.id} className="py-32 max-w-4xl mx-auto animate-in fade-in duration-1000 fill-mode-both">
            {title && <HeadingInstrument level={2} className="text-6xl font-light mb-16 tracking-tight leading-tight text-va-black">{title}</HeadingInstrument>}
            <ContainerInstrument className="prose prose-2xl text-va-black/50 font-medium leading-relaxed tracking-tight">
              {body}
            </ContainerInstrument>
          </section>
        );
    }
  };

  return (
    <PageWrapperInstrument className="bg-va-off-white">
      <Suspense fallback={null}>
        <LiquidBackground strokeWidth={1.5} />
      </Suspense>
      <ContainerInstrument className="py-48 relative z-10">
        <header className="mb-64 max-w-5xl animate-in fade-in slide-in-from-bottom-12 duration-1000">
          <TextInstrument className="text-[11px] font-bold tracking-[0.4em] text-primary/60 mb-12 block uppercase">
            Projecttype
          </TextInstrument>
          <HeadingInstrument level={1} className="text-[10vw] lg:text-[160px] font-light tracking-tighter mb-20 leading-[0.85] text-va-black"><VoiceglotText  translationKey={`page.${page.slug}.title`} defaultText={page.title} /></HeadingInstrument>
          <ContainerInstrument className="w-48 h-1 bg-black/5 rounded-full" />
        </header>
        <ContainerInstrument className="space-y-24">
          {page.blocks.map((block: any, index: number) => renderBlock(block, index))}
        </ContainerInstrument>
        <footer className="mt-80 text-center">
          {journey !== 'portfolio' && (
            <ContainerInstrument className="bg-va-black text-white p-32 rounded-[20px] shadow-aura-lg relative overflow-hidden group">
              <ContainerInstrument className="relative z-10">
                <TextInstrument className="text-[15px] font-medium tracking-[0.4em] text-primary/60 mb-10 block uppercase"><VoiceglotText  translationKey="cta.next_step" defaultText="volgende stap" /></TextInstrument>
                <HeadingInstrument level={2} className="text-7xl lg:text-8xl font-light tracking-tighter mb-16 leading-[0.9] text-white"><VoiceglotText  translationKey="cta.ready_title" defaultText="Klaar om jouw stem te vinden?" /></HeadingInstrument>
                <ContainerInstrument className="flex flex-col sm:flex-row items-center justify-center gap-10">
                  <VoicesLink  href="/agency" className="bg-va-off-white text-va-black px-20 py-10 rounded-[10px] font-medium text-base tracking-widest hover:scale-105 transition-all duration-700 shadow-2xl hover:bg-white uppercase"><VoiceglotText  translationKey="cta.find_voice" defaultText="vind jouw stem" /></VoicesLink>
                  <VoicesLink  href="/contact" className="text-white/30 hover:text-white font-medium text-base tracking-widest flex items-center gap-4 group transition-all duration-700 uppercase">
                    <VoiceglotText  translationKey="cta.ask_question" defaultText="stel een vraag" />
                    <ArrowRight strokeWidth={1.5} size={24} className="group-hover:translate-x-3 transition-transform duration-700" />
                  </VoicesLink>
                </ContainerInstrument>
              </ContainerInstrument>
            </ContainerInstrument>
          )}
        </footer>
      </ContainerInstrument>
    </PageWrapperInstrument>
  );
}
