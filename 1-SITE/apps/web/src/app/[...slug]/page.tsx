import { ContainerInstrument, HeadingInstrument, PageWrapperInstrument, TextInstrument, LoadingScreenInstrument, ButtonInstrument } from '@/components/ui/LayoutInstruments';
import { VoiceglotText } from '@/components/ui/VoiceglotText';
import { VoicesLink } from '@/components/ui/VoicesLink';
import { db, contentArticles, actors, translations, castingLists } from '@/lib/system/voices-config';
import { eq, or, ilike, and } from 'drizzle-orm';
import { ArrowRight, CreditCard, Info, ShieldCheck, Star, Zap } from 'lucide-react';
import { Metadata } from 'next';
import Image from 'next/image';
import { notFound, redirect } from 'next/navigation';
import { Suspense } from "react";
import { getActor, getArtist, getActors, getWorkshops } from "@/lib/services/api-server";
import { MarketManagerServer as MarketManager } from "@/lib/system/market-manager-server";
import { headers } from "next/headers";
import { VoiceDetailClient } from "@/components/legacy/VoiceDetailClient";
import { ArtistDetailClient } from "@/components/legacy/ArtistDetailClient";
import { AgencyContent } from "@/components/legacy/AgencyContent";
import { AgencyHeroInstrument } from "@/components/ui/AgencyHeroInstrument";
import nextDynamic from "next/dynamic";
import { JourneyType } from '@/contexts/VoicesMasterControlContext';
import { normalizeSlug, stripLanguagePrefix } from '@/lib/system/slug';

import { createClient } from "@supabase/supabase-js";

//  CHRIS-PROTOCOL: SDK fallback for stability (v2.14.273)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
    detectSessionInUrl: false
  }
});

  //  NUCLEAR LOADING MANDATE
  const LiquidBackground = nextDynamic(() => import("@/components/ui/LiquidBackground").then(mod => mod.LiquidBackground), { 
    ssr: false,
    loading: () => <ContainerInstrument className="fixed inset-0 z-0 bg-va-off-white" />
  });
  const VideoPlayer = nextDynamic(() => import("@/components/academy/VideoPlayer").then(mod => mod.VideoPlayer), { ssr: false });

const AgencyCalculator = nextDynamic(() => import("@/components/ui/AgencyCalculator").then(mod => mod.AgencyCalculator), { ssr: false });

// Workshop Components
const WorkshopCarousel = nextDynamic(() => import("@/components/studio/WorkshopCarousel").then(mod => mod.WorkshopCarousel), { ssr: false });
const WorkshopCalendar = nextDynamic(() => import("@/components/studio/WorkshopCalendar").then(mod => mod.WorkshopCalendar), { ssr: false });
const StudioVideoPlayer = nextDynamic(() => import("@/components/ui/StudioVideoPlayer").then(mod => mod.StudioVideoPlayer), { ssr: false });
const JourneyCta = nextDynamic(() => import("@/components/ui/JourneyCta").then(mod => mod.JourneyCta), { ssr: false });
const StudioLaunchpad = nextDynamic(() => import("@/components/ui/StudioLaunchpad").then(mod => mod.StudioLaunchpad), { ssr: false });

/**
 *  SUZY-MANDATE: Generate Structured Data (JSON-LD) for Voice Actors
 */
function generateActorSchema(actor: any, marketName: string = 'Voices', host: string = '') {
  const market = MarketManager.getCurrentMarket(host);
  const domains = MarketManager.getMarketDomains();
  const siteUrl = domains[market.market_code] || `https://${host || (market.market_code === 'BE' ? MarketManager.getMarketDomains()['BE']?.replace('https://', '') : 'www.voices.eu')}`;
  
  // Map internal delivery type to ISO 8601 duration
  const deliveryMap: Record<string, string> = {
    'sameday': 'PT4H',
    '24h': 'P1D',
    '48h': 'P2D',
    '72u': 'P3D'
  };
  
  const deliveryType = actor.delivery_config?.type || (actor.delivery_days_min === 0 ? 'sameday' : '24h');
  const deliveryDuration = deliveryMap[deliveryType] || 'P1D';

  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    'name': `${actor.first_name} - Voice-over Stem`,
    'description': actor.bio || actor.tagline,
    'provider': {
      '@type': 'LocalBusiness',
      'name': marketName,
      'url': siteUrl
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
    'identifier': actor.wp_product_id || actor.id
  };
}

/**
 *  SUZY-MANDATE: Generate Structured Data (JSON-LD) for Artists
 */
function generateArtistSchema(artist: any, host: string = '') {
  const market = MarketManager.getCurrentMarket(host);
  const domains = MarketManager.getMarketDomains();
  const siteUrl = domains[market.market_code] || `https://${host || (MarketManager.getMarketDomains()['BE']?.replace('https://', '') || 'www.voices.be')}`;
  return {
    "@context": "https://schema.org",
    "@type": "MusicGroup",
    "name": artist.displayName,
    "description": artist.bio,
    "url": `${siteUrl}/artist/${artist.slug}`,
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
 * 🧠 SLUG RESOLVER (ID-FIRST 2026)
 * Zoekt de entiteit op basis van de slug_registry (ID Handshake Truth).
 */
async function resolveSlugFromRegistry(slug: string, marketCode: string = 'ALL', journey: string = 'agency'): Promise<{ entity_id: number, routing_type: string, journey: string, canonical_slug?: string, metadata?: any, entity_type_id?: number, language_id?: number } | null> {
  try {
    const { data: entry, error } = await supabase
      .from('slug_registry')
      .select('entity_id, journey, canonical_slug, metadata, entity_type_id, language_id, entity_types(code)')
      .eq('slug', slug.toLowerCase())
      .or(`market_code.eq.${marketCode},market_code.eq.ALL`)
      .eq('is_active', true)
      .limit(1)
      .single();

    if (!error && entry) {
      return {
        entity_id: Number(entry.entity_id),
        routing_type: (entry.entity_types as any)?.code || 'article',
        journey: entry.journey,
        canonical_slug: entry.canonical_slug,
        metadata: entry.metadata,
        entity_type_id: entry.entity_type_id,
        language_id: entry.language_id
      };
    }
  } catch (err) {
    console.error('[resolveSlugFromRegistry] Fatal Error:', err);
  }
  return null;
}

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const revalidate = 0;

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
  console.error(` [SmartRouter] generateMetadata triggered for: ${params.slug.join('/')}`);
  const [initialSegment] = params.slug;
  const reserved = ['admin', 'backoffice', 'account', 'api', 'auth', 'checkout', 'favicon.ico', 'robots.txt', 'sitemap.xml'];
  
  if (reserved.includes(initialSegment)) {
    return {};
  }

  const headersList = headers();
  const host = (headersList.get('host') || (MarketManager.getMarketDomains()['BE']?.replace('https://', '') || 'www.voices.be')).replace(/^https?:\/\//, '');
  const market = MarketManager.getCurrentMarket(host);
  const domains = MarketManager.getMarketDomains();
  const lang = headersList.get('x-voices-lang') || 'nl';
  const normalizedSlug = normalizeSlug(params.slug);
  
  console.error(` [SmartRouter] Metadata context: host=${host}, market=${market.market_code}, lang=${lang}, slug=${normalizedSlug}`);
  
  // 🛡️ CHRIS-PROTOCOL: Strip language prefix for metadata resolution
  const cleanSlug = stripLanguagePrefix(normalizedSlug);
  const cleanSegments = cleanSlug.split('/').filter(Boolean);

  const siteUrl = domains[market.market_code] || `https://${host || (MarketManager.getMarketDomains()['BE']?.replace('https://', '') || 'www.voices.be')}`;
  
  // 🛡️ NUCLEAR HANDSHAKE: Resolve via Slug Registry for Metadata
  let lookupSlug = cleanSegments.join('/').toLowerCase();
  
  // Special case: if there's only one segment and it's a known prefix, we might need to handle it
  // But with multilingual registry, the full path should be in the database.
  
  const resolved = await resolveSlugFromRegistry(lookupSlug, market.market_code);
  const firstSegment = lookupSlug;

  console.error(` [SmartRouter] Resolved firstSegment: ${firstSegment} (from cleanSlug: ${cleanSlug})`);

  //  CHRIS-PROTOCOL: Helper voor meertalige SEO via Voiceglot
  const getTranslatedSEO = async (key: string, defaultText: string) => {
    try {
      // 🛡️ CHRIS-PROTOCOL: Use Drizzle for stability in Metadata (v2.14.547)
      const { db: directDb, translations: transTable } = await import('@/lib/system/voices-config');
      if (directDb) {
        const results = await directDb.select().from(transTable).where(and(eq(transTable.lang, lang), eq(transTable.translationKey, key))).limit(1);
        return results[0]?.translatedText || defaultText;
      }
      return defaultText;
    } catch (e) {
      return defaultText;
    }
  };

  // 0. Agency Journey SEO
  if (resolved?.routing_type === 'actor' && lookupSlug.includes('/')) {
    // This is a deep actor route, let it handle its own metadata or proceed
  } else if (MarketManager.isAgencySegment(firstSegment)) {
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
  if (resolved?.routing_type === 'artist') {
    try {
      const artist = await getArtist(resolved.entity_id.toString(), lang);
      if (artist) {
        const title = await getTranslatedSEO(`seo.artist.${artist.id}.title`, `${artist.display_name || artist.displayName} | ${market.name} Artist`);
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
  }

  // 2. Probeer een Stem te vinden
  if (resolved?.routing_type === 'actor') {
    try {
      const { db, systemEvents } = await import('@/lib/system/voices-config');
      const actor = await getActor(resolved.entity_id.toString(), lang).catch(async (err) => {
        if (db && systemEvents) {
          await db.insert(systemEvents).values({
            level: 'warn',
            source: 'SmartRouter',
            message: `[SmartRouter] Metadata actor fetch failed for ${resolved.entity_id}: ${err.message}`,
            details: { resolved, lang },
          });
        }
        return null;
      });
      
      if (actor) {
        const title = await getTranslatedSEO(`seo.actor.${actor.id}.title`, `${actor.first_name || actor.first_name} - Voice-over Stem | ${market.name}`);
        const description = await getTranslatedSEO(`seo.actor.${actor.id}.description`, actor.bio || `Ontdek de stem van ${actor.first_name || actor.first_name} op ${market.name}.`);
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
  }

    // 3. Probeer een CMS Artikel te vinden
    if (resolved?.routing_type === 'article') {
      try {
        const { db: directDb, contentArticles: articlesTable } = await import('@/lib/system/voices-config');
        if (directDb) {
          const results = await directDb.select().from(articlesTable).where(eq(articlesTable.id, resolved.entity_id)).limit(1);
          const page = results[0];

          if (page) {
            const title = await getTranslatedSEO(`seo.page.${page.slug}.title`, `${page.title} | ${market.name}`);
            const description = await getTranslatedSEO(`seo.page.${page.slug}.description`, page.excerpt || `Ontdek meer over ${page.title} op ${market.name}.`);
            return {
              title,
              description,
              alternates: {
                canonical: `${siteUrl}/${lang !== 'nl' ? lang + '/' : ''}${page.slug}`,
              }
            };
          }
        }
      } catch (e) {}
    }

    // 4. Probeer een CMS Artikel te vinden (Legacy Fallback by Slug)
    try {
      const { db: directDb, contentArticles: articlesTable } = await import('@/lib/system/voices-config');
      if (directDb) {
        const results = await directDb.select().from(articlesTable).where(eq(articlesTable.slug, firstSegment)).limit(1);
        const page = results[0];

        if (page) {
          const title = await getTranslatedSEO(`seo.page.${page.slug}.title`, `${page.title} | ${market.name}`);
          const description = await getTranslatedSEO(`seo.page.${page.slug}.description`, page.excerpt || `Ontdek meer over ${page.title} op ${market.name}.`);
          return {
            title,
            description,
            alternates: {
              canonical: `${siteUrl}/${lang !== 'nl' ? lang + '/' : ''}${firstSegment}`,
            }
          };
        }
      }
    } catch (e) {}

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
  const normalizedSlug = normalizeSlug(segments);
  const headersList = headers();
  const lang = headersList.get('x-voices-lang') || 'nl';
  
  // 🛡️ CHRIS-PROTOCOL: Strip language prefix if present (e.g. /nl/johfrah -> johfrah)
  const cleanSlug = stripLanguagePrefix(normalizedSlug);
  const cleanSegments = cleanSlug.split('/').filter(Boolean);

  // 🛡️ CHRIS-PROTOCOL: Log to database for forensic audit (v2.14.552)
  try {
    const { db: directDb, systemEvents } = await import('@/lib/system/voices-config');
    if (directDb && systemEvents) {
      await directDb.insert(systemEvents).values({
        level: 'info',
        source: 'SmartRouter',
        message: `[SmartRouter] SmartRouteContent START for: ${normalizedSlug}`,
        details: { segments, lang, cleanSlug, cleanSegments },
      });
    }
  } catch (e: any) {
    console.error(` [SmartRouter] DB logging failed: ${e.message}`);
  }

  console.error(` [SmartRouter] SmartRouteContent START for: ${segments.join('/')}`);
  try {
    // 🛡️ NUCLEAR HANDSHAKE: Resolve via Slug Registry
    const host = headersList.get('host') || '';
    const market = MarketManager.getCurrentMarket(host);
    
    // 1. Full Path Lookup (Multilingual Registry Handshake)
    let lookupSlug = cleanSegments.join('/').toLowerCase();
    let journey = cleanSegments[1];
    let medium = cleanSegments[2];

    const resolved = await resolveSlugFromRegistry(lookupSlug, market.market_code);

    if (resolved) {
      // 🛡️ CHRIS-PROTOCOL: Handle Redirects (Canonical Handshake)
      if (resolved.canonical_slug && resolved.canonical_slug !== lookupSlug) {
        console.error(` [SmartRouter] Redirecting legacy slug "${lookupSlug}" to canonical: "/${resolved.canonical_slug}"`);
        // 🛡️ NUCLEAR SEO: Use 301 Permanent Redirect for canonical handshake
        return redirect(`/${resolved.canonical_slug}`);
      }

      console.error(` [SmartRouter] Handshake SUCCESS: ${resolved.routing_type} (ID: ${resolved.entity_id})`);
      
      // Shift journey/medium for actor detail logic if it's a voice-like prefix
      // We detect this by checking if the resolved type is actor and there are more segments
      if (resolved.routing_type === 'actor' && cleanSegments.length > 1) {
        journey = cleanSegments[1];
        medium = cleanSegments[2];
      }
      
      // 🛡️ CHRIS-PROTOCOL: Log handshake success
      try {
        const { db: directDb, systemEvents } = await import('@/lib/system/voices-config');
        if (directDb && systemEvents) {
          await directDb.insert(systemEvents).values({
            level: 'info',
            source: 'SmartRouter',
            message: ` [SmartRouter] Handshake SUCCESS: ${resolved.routing_type} (ID: ${resolved.entity_id})`,
            details: { resolved, lookupSlug, lang },
          });
        }
      } catch (e: any) {
        console.error(` [SmartRouter] DB logging failed: ${e.message}`);
      }

      // Route based on type
      if (resolved.routing_type === 'actor') {
        const actor = await getActor(resolved.entity_id.toString(), lang);
        if (actor) {
          const journeyMap: Record<string, JourneyType> = {
            'telefoon': 'telephony', 'telefooncentrale': 'telephony', 'telephony': 'telephony',
            'video': 'video', 'commercial': 'commercial', 'reclame': 'commercial'
          };
          
          // 🛡️ CHRIS-PROTOCOL: Unified Journey Handshake
          // We prioritize the journey from the slug_registry metadata (if it was a deep match)
          // Otherwise we look at the segment after the resolved path.
          const registryJourney = resolved.metadata?.journey;
          const lookupSegments = lookupSlug.split('/');
          const nextSegment = cleanSegments[lookupSegments.length];
          const mappedJourney = registryJourney || (nextSegment ? journeyMap[nextSegment.toLowerCase()] : undefined);
          
          console.error(` [SmartRouter] Actor Handshake: registryJourney=${registryJourney}, nextSegment=${nextSegment}, finalJourney=${mappedJourney}`);
          
          return <VoiceDetailClient actor={actor} initialJourney={mappedJourney || (nextSegment as any)} initialMedium={cleanSegments[lookupSegments.length + 1]} />;
        }
      }

      if (resolved.routing_type === 'artist') {
        const artist = await getArtist(resolved.entity_id.toString(), lang);
        if (artist) {
          const isYoussef = resolved.entity_id === 1; // Example ID for Youssef
          return (
            <PageWrapperInstrument>
              <ArtistDetailClient artistData={artist} isYoussef={isYoussef} params={{ slug: lookupSlug }} />
            </PageWrapperInstrument>
          );
        }
      }

      if (resolved.routing_type === 'music') {
        const trackId = resolved.entity_id > 0 ? resolved.entity_id : null;
        const filters: Record<string, string> = { journey: 'telephony' };
        if (trackId) filters.musicTrackId = trackId.toString();
        
        const searchResults = await getActors(filters, lang);
        return (
          <>
            <Suspense fallback={null}><LiquidBackground /></Suspense>
            <AgencyHeroInstrument filters={searchResults?.filters || { genders: [], languages: [], styles: [] }} market={market.market_code} searchParams={filters} />
            <div className="!pt-0 -mt-24 relative z-40">
              <AgencyContent mappedActors={searchResults?.results || []} filters={searchResults?.filters || { genders: [], languages: [], styles: [] }} />
            </div>
          </>
        );
      }

      if (resolved.routing_type === 'blog' || resolved.routing_type === 'article') {
        const article = await getArticle(lookupSlug, lang);
        if (article) {
          return <CmsPageContent page={article} slug={lookupSlug} />;
        }
      }

      if (resolved.routing_type === 'language' || resolved.routing_type === 'country' || resolved.routing_type === 'attribute') {
        // Category Page Logic
        const filters: Record<string, string> = {};
        if (resolved.routing_type === 'language') filters.language = resolved.entity_id.toString();
        if (resolved.routing_type === 'country') filters.country = resolved.entity_id.toString();
        if (resolved.routing_type === 'attribute') filters.attribute = resolved.entity_id.toString();

        const searchResults = await getActors(filters, lang);
        const mappedActors = (searchResults?.results || []).map((actor: any) => ({
          ...actor,
          first_name: actor.first_name,
          last_name: actor.last_name,
          demos: actor.demos || []
        }));

        return (
          <>
            <Suspense fallback={null}><LiquidBackground /></Suspense>
            <AgencyHeroInstrument filters={searchResults?.filters || { genders: [], languages: [], styles: [] }} market={market.market_code} searchParams={filters} />
            <div className="!pt-0 -mt-24 relative z-40">
              <AgencyContent mappedActors={mappedActors} filters={searchResults?.filters || { genders: [], languages: [], styles: [] }} />
            </div>
          </>
        );
      }

      if (resolved.routing_type === 'faq' || resolved.routing_type === 'provider') {
        // Redirect to main FAQ or Provider page with anchor/context if needed
        // For now, render as a CMS page if possible, or redirect to /agency
        return redirect('/agency');
      }
    }

    // Legacy Fallbacks (Agency, Casting, etc.)
    if (MarketManager.isAgencySegment(lookupSlug)) {
      const filters: Record<string, string> = {};
      
      //  CHRIS-PROTOCOL: Map translated journey segments to internal journey types via MarketManager
      const agencyJourney = MarketManager.getJourneyFromSegment(segments[1]);

      if (agencyJourney === "commercial" && segments[2]) {
        filters.media = segments[2];
      }

      let searchResults;
      try {
        searchResults = await getActors(filters, lang);
      } catch (error) {
        console.error("[SmartRouter] getActors failed:", error);
        searchResults = { results: [], filters: { genders: [], languages: [], styles: [] }, reviews: [], reviewStats: { averageRating: 4.9, totalCount: 0, distribution: {} } };
      }
      const actors = searchResults?.results || [];

      const mappedActors = actors.map((actor: any) => ({
        id: actor.id,
        display_name: actor.display_name,
        first_name: actor.first_name,
        last_name: actor.last_name,
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

      const marketCode = headersList.get("x-voices-market") || "BE";

      return (
        <>
          <Suspense fallback={null}>
            <LiquidBackground />
          </Suspense>
          <AgencyHeroInstrument 
            filters={searchResults?.filters || { genders: [], languages: [], styles: [] }}
            market={marketCode}
            searchParams={filters}
          />
          <div className="!pt-0 -mt-24 relative z-40">
            <AgencyContent mappedActors={mappedActors} filters={searchResults?.filters || { genders: [], languages: [], styles: [] }} />
          </div>
        </>
      );
    }

    // 1.7 Casting Tool (Launchpad)
    if (firstSegment === 'casting') {
      return (
        <PageWrapperInstrument>
          <StudioLaunchpad initialJourney={journey} />
        </PageWrapperInstrument>
      );
    }

    // 2. Pitch Link (Casting List)
    if (lookupSlug === 'pitch' && journey) {
      try {
        const host = headersList.get('host') || MarketManager.getMarketDomains()['BE']?.replace('https://', '') || 'www.voices.be';
        const market = MarketManager.getCurrentMarket(host);
        const domains = MarketManager.getMarketDomains();

        // 🛡️ CHRIS-PROTOCOL: Use SDK for stability (v2.14.273)
        const { data: list, error: listError } = await supabase
          .from('casting_lists')
          .select('*, items:casting_list_items(*, actor:actors(*))')
          .eq('hash', journey)
          .single();

        if (listError || !list) return notFound();

        // Sort items by displayOrder manually since SDK join sorting is complex
        const sortedItems = (list.items || []).sort((a: any, b: any) => (a.display_order || 0) - (b.display_order || 0));

        const listSettings = list.settings as any;
        const showRates = listSettings?.isAdminGenerated === true;

        const schema = {
          '@context': 'https://schema.org',
          '@type': 'ItemList',
          'name': list.name,
          'numberOfItems': sortedItems.length,
          'itemListElement': sortedItems.map((item: any, i: number) => ({
            '@type': 'ListItem',
            'position': i + 1,
            'item': {
              '@type': 'Service',
              'name': item.actor.first_name || item.actor.first_name,
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
              <LiquidBackground />
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
                {sortedItems.map((item: any, i: number) => (
                  <ContainerInstrument key={i} className="bg-white p-8 rounded-[20px] shadow-aura border border-black/5 flex flex-col gap-6">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 bg-va-off-white rounded-full flex items-center justify-center text-2xl font-light text-va-black/20 overflow-hidden relative">
                        {item.actor.photo_id ? (
                          <Image 
                            src={`/api/proxy/?path=${encodeURIComponent(item.actor.dropbox_url || '')}`} 
                            alt={item.actor.first_name || item.actor.first_name}
                            fill
                            className="object-cover"
                          />
                        ) : (item.actor.first_name || item.actor.first_name)[0]}
                      </div>
                      <div>
                        <HeadingInstrument level={3} className="text-2xl font-light">{item.actor.first_name || item.actor.first_name}</HeadingInstrument>
                        <div className="flex items-center justify-between mt-1">
                          <TextInstrument className="text-[15px] text-va-black/40">
                            <VoiceglotText 
                              translationKey={`common.language.${(item.actor.native_lang || item.actor.native_lang)?.toLowerCase() || 'nl'}`} 
                              defaultText={MarketManager.getLanguageLabel(item.actor.native_lang || item.actor.native_lang || 'nl')} 
                            />
                          </TextInstrument>
                          {showRates && (
                            <TextInstrument className="text-[15px] font-bold text-primary">
                              €{parseFloat(item.actor.price_unpaid || item.actor.price_unpaid || '0').toFixed(2)}
                            </TextInstrument>
                          )}
                        </div>
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
      }
    }

    // 3. Check voor Stem (Legacy Fallback by Slug)
    try {
      // 🛡️ CHRIS-PROTOCOL: Strict Slug Mandate (v2.14.603)
      // We staan alleen legacy fallback toe voor single-segment slugs (bijv. /johfrah).
      // Paden met meerdere segmenten (bijv. /voice/video) MOETEN in de registry staan.
      if (segments.length > 1) {
        console.error(` [SmartRouter] Multi-segment path "${lookupSlug}" not in registry. Blocking legacy fallback.`);
        return notFound();
      }

      const actor = await getActor(lookupSlug, lang).catch((err) => {
        console.error(` [SmartRouter] getActor failed for "${lookupSlug}":`, err.message);
        return null;
      });

      if (actor) {
        console.error(` [SmartRouter] Handshake SUCCESS (Legacy Fallback) for ${actor.first_name}. Rendering VoiceDetailClient.`);
        
        // 🛡️ CHRIS-PROTOCOL: Log handshake success
        try {
          const { db: directDb, systemEvents } = await import('@/lib/system/voices-config');
          if (directDb && systemEvents) {
            await directDb.insert(systemEvents).values({
              level: 'info',
              source: 'SmartRouter',
              message: ` [SmartRouter] Handshake SUCCESS (Legacy Fallback) for ${actor.first_name}`,
              details: { actorId: actor.id, slug: actor.slug },
            });
          }
        } catch (e: any) {
          console.error(` [SmartRouter] DB logging failed: ${e.message}`);
        }
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
          <VoiceDetailClient actor={actor} initialJourney={mappedJourney || journey} initialMedium={medium} />
        );
      } else {
        console.error(` [SmartRouter] No actor found for "${lookupSlug}" after all attempts. Proceeding to CMS check.`);
      }
    } catch (e: any) {
      console.error("[SmartRouter] Actor check crashed:", e.message);
    }

    // 4. Check voor CMS Artikel (Legacy Fallback by Slug)
    const isAgencySubRoute = segments.length === 2 && MarketManager.isAgencySegment(segments[0]);
    if (segments.length === 1 || isAgencySubRoute) {
      const cmsSlug = isAgencySubRoute ? segments[1] : lookupSlug;
      try {
        console.log(` [SmartRouter] Fetching CMS article: ${cmsSlug}`);
        // 🛡️ CHRIS-PROTOCOL: Use SDK for stability (v2.14.273)
        const { data: page, error } = await supabase
          .from('content_articles')
          .select('*')
          .eq('slug', cmsSlug)
          .single();

        if (error) {
          console.warn(` [SmartRouter] CMS Article not found or SDK error: ${cmsSlug}`, error.message);
        }

        if (page) {
          // Fetch blocks via SDK
          const { data: blocks, error: blocksError } = await supabase
            .from('content_blocks')
            .select('*')
            .eq('article_id', page.id)
            .order('display_order', { ascending: true });

          if (blocksError) {
            console.error(` [SmartRouter] Error fetching blocks for ${cmsSlug}:`, blocksError.message);
          }

          console.log(` [SmartRouter] Successfully loaded CMS page: ${cmsSlug} with ${blocks?.length || 0} blocks.`);
          
          // Fetch extra data based on slug
          let extraData: any = {};
          if (cmsSlug === 'studio') {
            try {
              const workshops = await getWorkshops();
              workshops.sort((a, b) => {
                const nextA = a.editions && a.editions.length > 0 ? a.editions[0].date : null;
                const nextB = b.editions && b.editions.length > 0 ? b.editions[0].date : null;
                if (nextA && nextB) return new Date(nextA).getTime() - new Date(nextB).getTime();
                if (nextA) return -1;
                if (nextB) return 1;
                return (a.title || '').localeCompare(b.title || '');
              });
              extraData.workshops = workshops;
            } catch (err) {
              console.error("[SmartRouter] Failed to fetch workshops for studio page:", err);
            }
          } else if (cmsSlug === 'academy') {
            try {
              const { data: lessons } = await supabase.from('lessons').select('*').order('display_order');
              extraData.lessons = lessons || [];
            } catch (err) {
              console.error("[SmartRouter] Failed to fetch lessons for academy page:", err);
            }
          } else if (cmsSlug === 'ademing') {
            try {
              const { data: tracks } = await supabase.from('ademing_tracks').select('*').eq('is_public', true).limit(6);
              extraData.tracks = tracks || [];
            } catch (err) {
              console.error("[SmartRouter] Failed to fetch tracks for ademing page:", err);
            }
          }

          return <CmsPageContent page={{ ...page, blocks: blocks || [] }} slug={cmsSlug} extraData={extraData} />;
        }
      } catch (e: any) {
        console.error("[SmartRouter] CMS check failed:", e.message);
      }
    }

    return notFound();
  } catch (err: any) {
    console.error("[SmartRouter] FATAL ERROR:", err);
    const { ServerWatchdog } = await import('@/lib/services/server-watchdog');
    await ServerWatchdog.report({
      error: `SmartRouter Fatal Error: ${err.message}`,
      stack: err.stack,
      component: 'SmartRouter',
      url: segments.join('/'),
      level: 'critical'
    });
    throw err;
  }
}

/**
 *  CMS Page Renderer (Gekopieerd uit de originele [slug]/page.tsx)
 */
function CmsPageContent({ page, slug, extraData = {} }: { page: any, slug: string, extraData?: any }) {
  const iapContext = page.iapContext as { journey?: string; lang?: string } | null;
  const journey = iapContext?.journey || 'agency';

  const getIcon = (cat: string) => {
    const c = cat.toLowerCase();
    if (c.includes('kwaliteit') || c.includes('veiligheid')) return <ShieldCheck strokeWidth={1.5} className="text-primary/40" size={40} />;
    if (c.includes('levering') || c.includes('annulering')) return <Zap strokeWidth={1.5} className="text-primary/40" size={40} />;
    if (c.includes('betaling') || c.includes('inschrijving')) return <CreditCard className="text-primary/40" size={40} />;
    return <Info strokeWidth={1.5} className="text-primary/40" size={40} />;
  };

  const extractTitle = (content: string = '') => {
    if (!content) return { title: null, body: '' };
    const match = content.match(/^(?:###|#####)\s+(.+)$/m);
    return {
      title: match ? match[1] : null,
      body: content.replace(/^(?:###|#####)\s+.+$/m, '').replace(/\\/g, '').replace(/\*\*/g, '').trim()
    };
  };

  const renderBlock = (block: any, index: number) => {
    const { title, body } = extractTitle(block.content || '');

    switch (block.type) {
      case 'workshop_hero':
        const videoUrl = body.match(/video:\s*([^\n]+)/)?.[1]?.trim();
        const posterUrl = body.match(/poster:\s*([^\n]+)/)?.[1]?.trim();
        const subtitleUrl = body.match(/subtitles:\s*([^\n]+)/)?.[1]?.trim();
        
        return (
          <section key={block.id} className="voices-hero">
            <ContainerInstrument plain className="voices-video-hero-grid">
              <ContainerInstrument plain className="voices-hero-right group lg:order-1">
                <ContainerInstrument plain className="voices-hero-visual-container">
                  <Suspense fallback={<div className="w-full h-full bg-va-black/5 animate-pulse rounded-[32px]" />}>
                    <StudioVideoPlayer 
                      url={videoUrl || "/assets/studio/workshops/videos/workshop_studio_teaser.mp4"} 
                      subtitles={subtitleUrl || "/assets/studio/workshops/subtitles/workshop_studio_teaser-nl.vtt"}
                      poster={posterUrl || "/assets/visuals/branding/branding-branding-photo-horizontal-1.webp"}
                      aspect="portrait"
                      className="shadow-aura-lg border-none w-full h-full"
                    />
                  </Suspense>
                </ContainerInstrument>
                <ContainerInstrument plain className="absolute -top-10 -right-10 w-40 h-40 bg-primary/10 rounded-full blur-[80px] -z-10 animate-pulse" />
              </ContainerInstrument>

              <ContainerInstrument plain className="voices-hero-left lg:order-2">
                {title && (
                  <HeadingInstrument level={1} className="voices-hero-title font-light">
                    {title}
                  </HeadingInstrument>
                )}
                <TextInstrument className="voices-hero-subtitle font-light">
                  {body.replace(/video:\s*[^\n]+/, '').replace(/poster:\s*[^\n]+/, '').replace(/subtitles:\s*[^\n]+/, '').trim()}
                </TextInstrument>
                <ContainerInstrument plain className="pt-4">
                  <Link href="#workshops">
                    <ButtonInstrument className="va-btn-pro !bg-va-black !text-white px-12 py-6 !rounded-[10px] font-light tracking-widest hover:bg-primary transition-all duration-500 flex items-center gap-3 shadow-aura-lg uppercase">
                      <VoiceglotText translationKey="studio.hero.cta" defaultText="Bekijk workshops" />
                      <ArrowRight size={18} strokeWidth={1.5} />
                    </ButtonInstrument>
                  </Link>
                </ContainerInstrument>
              </ContainerInstrument>
            </ContainerInstrument>
          </section>
        );

      case 'workshop_carousel':
        return (
          <section key={block.id} id="workshops" className="py-40 bg-white border-y border-black/[0.03] -mx-4 px-4 lg:-mx-32 lg:px-32">
            <ContainerInstrument plain className="max-w-6xl mx-auto">
              <ContainerInstrument plain className="max-w-3xl mb-24 space-y-8 mx-auto text-center">
                {title && <HeadingInstrument level={2} className="text-5xl md:text-6xl font-light tracking-tighter leading-none text-va-black">{title}</HeadingInstrument>}
                <TextInstrument className="text-xl md:text-2xl text-black/40 font-light leading-relaxed">
                  {body}
                </TextInstrument>
              </ContainerInstrument>
              <Suspense fallback={<div className="h-96 w-full bg-va-black/5 animate-pulse rounded-[20px]" />}>
                <WorkshopCarousel workshops={extraData.workshops || []} />
              </Suspense>
            </ContainerInstrument>
          </section>
        );

      case 'workshop_calendar':
        return (
          <section key={block.id} className="py-40 bg-white">
            <ContainerInstrument className="max-w-[1140px]">
              <BentoGrid columns={3}>
                <BentoCard span="lg" className="bg-va-off-white rounded-[20px] shadow-aura border border-black/[0.02] overflow-hidden">
                  <ContainerInstrument className="p-12">
                    <ContainerInstrument className="flex items-center gap-4 mb-8">
                      <ContainerInstrument className="w-12 h-12 rounded-[10px] bg-primary/10 flex items-center justify-center">
                        <Image src="/assets/common/branding/icons/INFO.svg" width={24} height={24} alt="" style={{ opacity: 0.4 }} />
                      </ContainerInstrument>
                      <ContainerInstrument>
                        <HeadingInstrument level={2} className="text-3xl font-light tracking-tighter leading-none text-va-black">
                          {title || 'Kalender'}
                        </HeadingInstrument>
                      </ContainerInstrument>
                    </ContainerInstrument>
                    <TextInstrument className="text-[15px] text-black/40 font-light leading-relaxed mb-12 max-w-md">
                      {body}
                    </TextInstrument>
                    <Suspense fallback={<div className="h-64 w-full bg-va-black/5 animate-pulse rounded-[20px]" />}>
                      <WorkshopCalendar workshops={extraData.workshops || []} />
                    </Suspense>
                  </ContainerInstrument>
                </BentoCard>
                <BentoCard span="sm" className="bg-blue-600 p-12 text-white relative overflow-hidden flex flex-col justify-between min-h-[500px] rounded-[20px]">
                  <ContainerInstrument className="relative z-10">
                    <HeadingInstrument level={2} className="text-5xl font-light tracking-tighter leading-none mb-8 ">
                      <VoiceglotText translationKey="studio.bento.guide.title" defaultText="Welke workshop past bij jou?" />
                    </HeadingInstrument>
                  </ContainerInstrument>
                  <ContainerInstrument className="relative z-10">
                    <Link href="/studio/quiz">
                      <ButtonInstrument className="va-btn-pro !bg-white !text-black flex items-center gap-4 group !rounded-[10px] font-light tracking-widest uppercase">
                        <VoiceglotText translationKey="studio.bento.guide.cta" defaultText="Doe de quiz" />
                        <ArrowRight size={18} strokeWidth={1.5} className="group-hover:translate-x-2 transition-transform" />
                      </ButtonInstrument>
                    </Link>
                  </ContainerInstrument>
                  <ContainerInstrument className="absolute -right-20 -bottom-20 w-96 h-96 bg-white/10 rounded-[20px] blur-3xl" />
                </BentoCard>
              </BentoGrid>
            </ContainerInstrument>
          </section>
        );

      case 'journey_cta':
        return (
          <section key={block.id} className="py-20 bg-va-off-white">
            <ContainerInstrument className="max-w-[1140px]">
              <Suspense fallback={<div className="h-48 w-full bg-va-black/5 animate-pulse rounded-[20px]" />}>
                <JourneyCta journey={body.trim() as any || 'studio'} />
              </Suspense>
            </ContainerInstrument>
          </section>
        );

      case 'lesson_grid':
        return (
          <section key={block.id} className="py-24 bg-white">
            <ContainerInstrument className="max-w-7xl mx-auto px-6">
              {title && <HeadingInstrument level={2} className="text-5xl font-light tracking-tighter mb-16 text-va-black text-center">{title}</HeadingInstrument>}
              <BentoGrid columns={3}>
                {(extraData.lessons || []).map((lesson: any) => (
                  <BentoCard 
                    key={lesson.id} 
                    span="md"
                    className="group p-10 bg-white hover:bg-va-black transition-all duration-700 rounded-[20px] shadow-aura hover:shadow-aura-lg border border-black/5"
                  >
                    <ContainerInstrument className="flex justify-between items-start mb-12">
                      <ContainerInstrument className="bg-va-black/5 group-hover:bg-white/10 text-va-black group-hover:text-white text-[11px] font-bold px-3 py-1 rounded-full tracking-[0.2em] uppercase transition-colors ">ACADEMY</ContainerInstrument>
                      <TextInstrument className="text-[11px] font-bold text-va-black/30 group-hover:text-white/30 tracking-[0.2em] uppercase transition-colors ">Les {lesson.display_order || lesson.id}</TextInstrument>
                    </ContainerInstrument>
                    <HeadingInstrument level={3} className="text-4xl font-light tracking-tighter leading-[0.9] mb-8 text-va-black group-hover:text-white transition-colors">{lesson.title}</HeadingInstrument>
                    <TextInstrument className="text-va-black/40 group-hover:text-white/40 text-[15px] mb-8 font-light leading-relaxed">{lesson.description}</TextInstrument>
                    <Link href={`/academy/lesson/${lesson.display_order || lesson.id}`} className="mt-auto flex justify-between items-end">
                      <ContainerInstrument>
                        <TextInstrument className="text-[11px] text-va-black/40 group-hover:text-white/40 font-bold tracking-[0.2em] uppercase mb-1 transition-colors ">Start nu</TextInstrument>
                        <TextInstrument as="span" className="text-2xl font-light tracking-tighter text-va-black group-hover:text-white transition-colors">Bekijk les</TextInstrument>
                      </ContainerInstrument>
                      <ButtonInstrument className="!bg-va-black group-hover:!bg-white group-hover:!text-va-black !rounded-[10px] !px-6 transition-all">
                        <Play strokeWidth={1.5} size={16} fill="currentColor" />
                      </ButtonInstrument>
                    </Link>
                  </BentoCard>
                ))}
              </BentoGrid>
            </ContainerInstrument>
          </section>
        );

      case 'track_grid':
        return (
          <section key={block.id} className="py-24 bg-va-off-white">
            <ContainerInstrument className="max-w-7xl mx-auto px-6">
              {title && <HeadingInstrument level={2} className="text-5xl font-light tracking-tighter mb-16 text-va-black text-center">{title}</HeadingInstrument>}
              <BentoGrid columns={3}>
                {(extraData.tracks || []).map((track: any) => (
                  <BentoCard 
                    key={track.id} 
                    className="group p-10 bg-white/50 backdrop-blur-xl border-white/20 hover:shadow-magic transition-all duration-1000 rounded-[20px]"
                  >
                    <ContainerInstrument className="flex justify-between items-start mb-12">
                      <ContainerInstrument className="bg-black/5 text-black/40 text-[15px] font-black px-3 py-1 rounded-full tracking-widest">
                        {track.duration ? `${Math.floor(track.duration / 60)}` : '10'} min
                      </ContainerInstrument>
                    </ContainerInstrument>
                    <HeadingInstrument level={3} className="text-4xl font-light tracking-tighter leading-[0.8] mb-12 text-black/80">{track.title}</HeadingInstrument>
                    <ContainerInstrument className="mt-auto flex justify-center">
                      <ButtonInstrument className="w-16 h-16 rounded-full bg-va-black text-white flex items-center justify-center hover:scale-110 hover:bg-primary transition-all duration-500 shadow-lg active:scale-95">
                        <Play strokeWidth={1.5} size={24} fill="currentColor" />
                      </ButtonInstrument>
                    </ContainerInstrument>
                  </BentoCard>
                ))}
              </BentoGrid>
            </ContainerInstrument>
          </section>
        );

      case 'academy_pricing':
        const price = body.match(/price:\s*([^\n]+)/)?.[1]?.trim() || "€ 495";
        const features = body.replace(/price:\s*[^\n]+/, '').split('\n').filter(f => f.trim().startsWith('-')).map(f => f.replace('-', '').trim());
        
        return (
          <section key={block.id} id="inschrijven" className="py-48 bg-va-off-white">
            <ContainerInstrument className="max-w-4xl mx-auto px-6">
              <BentoCard span="full" className="bg-white p-20 rounded-[40px] shadow-aura border border-black/[0.02] text-center space-y-12">
                <div className="space-y-6">
                  {title && <HeadingInstrument level={2} className="text-5xl md:text-7xl font-light tracking-tighter leading-none text-va-black">{title}</HeadingInstrument>}
                </div>
                <div className="flex flex-col items-center gap-4">
                  <TextInstrument className="text-8xl font-extralight tracking-tighter text-va-black leading-none">{price}</TextInstrument>
                  <TextInstrument className="text-[11px] font-bold text-va-black/30 uppercase tracking-[0.2em]">Eenmalige investering (excl. BTW)</TextInstrument>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-12 border-t border-black/[0.03]">
                  {features.map((feature, i) => (
                    <div key={i} className="flex flex-col items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-primary/5 flex items-center justify-center text-primary">
                        <Zap size={20} strokeWidth={1.5} />
                      </div>
                      <TextInstrument className="text-[15px] font-light text-va-black/60">{feature}</TextInstrument>
                    </div>
                  ))}
                </div>
                <div className="pt-12">
                  <ButtonInstrument as={Link} href="/checkout?journey=academy" className="va-btn-pro !rounded-[10px] px-20 py-8 text-xl shadow-aura-lg hover:scale-105 transition-transform duration-500 uppercase">Nu inschrijven</ButtonInstrument>
                </div>
              </BentoCard>
            </ContainerInstrument>
          </section>
        );

      case 'academy_faq':
        const faqs = body.split('\n\n').filter(f => f.trim().length > 0).map(f => {
          const [q, ...a] = f.split('\n');
          return { q: q.replace('Q:', '').trim(), a: a.join('\n').replace('A:', '').trim() };
        });

        return (
          <section key={block.id} className="py-48 bg-white">
            <ContainerInstrument className="max-w-6xl mx-auto px-6">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-24">
                <div className="lg:col-span-4 space-y-6">
                  <ContainerInstrument className="inline-flex items-center gap-3 px-4 py-1.5 bg-va-black/5 rounded-full">
                    <Info strokeWidth={1.5} size={16} className="text-va-black/40" />
                    <TextInstrument className="text-[11px] font-bold tracking-[0.2em] text-va-black/40 uppercase">Support</TextInstrument>
                  </ContainerInstrument>
                  {title && <HeadingInstrument level={2} className="text-5xl font-light tracking-tighter leading-none text-va-black">{title}</HeadingInstrument>}
                </div>
                <div className="lg:col-span-8 space-y-12">
                  {faqs.map((faq, i) => (
                    <div key={i} className="space-y-4 pb-12 border-b border-black/[0.03] last:border-none last:pb-0">
                      <HeadingInstrument level={3} className="text-2xl font-light tracking-tight text-primary">{faq.q}</HeadingInstrument>
                      <TextInstrument className="text-lg text-va-black/60 font-light leading-relaxed">{faq.a}</TextInstrument>
                    </div>
                  ))}
                </div>
              </div>
            </ContainerInstrument>
          </section>
        );

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
                        <Suspense fallback={<div className="aspect-video w-full bg-va-black/20 animate-pulse" />}>
                          <VideoPlayer 
                            url={videoUrl} 
                            title={itemTitle}
                            subtitles={subtitleUrl ? [{
                              src: subtitleUrl,
                              lang: currentLang,
                              label: currentLang.toUpperCase()
                            }] : []}
                          />
                        </Suspense>
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
            <Suspense fallback={<div className="h-96 w-full bg-va-black/5 animate-pulse rounded-[20px]" />}>
              <AgencyCalculator />
            </Suspense>
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
        <LiquidBackground />
      </Suspense>
      <ContainerInstrument className="py-48 relative z-10">
        <header className="mb-64 max-w-5xl animate-in fade-in slide-in-from-bottom-12 duration-1000">
          <TextInstrument className="text-[11px] font-bold tracking-[0.4em] text-primary/60 mb-12 block uppercase">
            Projecttype
          </TextInstrument>
          <HeadingInstrument level={1} className="text-[10vw] lg:text-[160px] font-light tracking-tighter mb-20 leading-[0.85] text-va-black" suppressHydrationWarning><VoiceglotText  translationKey={`page.${page.slug}.title`} defaultText={page.title} /></HeadingInstrument>
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
