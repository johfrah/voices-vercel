import { ContainerInstrument, HeadingInstrument, PageWrapperInstrument, TextInstrument, LoadingScreenInstrument, ButtonInstrument } from '@/components/ui/LayoutInstruments';
import { VoiceglotText } from '@/components/ui/VoiceglotText';
import { db } from '@db';
import { contentArticles, actors, artists } from '@db/schema';
import { eq, or, ilike } from 'drizzle-orm';
import { ArrowRight, CreditCard, Info, ShieldCheck, Star, Zap } from 'lucide-react';
import { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Suspense } from "react";
import { getActor, getArtist } from "@/lib/api-server";
import { headers } from "next/headers";
import { VoiceDetailClient } from "../voice/[slug]/VoiceDetailClient";
import { ArtistDetailClient } from "../artist/[slug]/ArtistDetailClient";
import nextDynamic from "next/dynamic";
import { JourneyType } from '@/types/journey';

//  NUCLEAR LOADING MANDATE
const LiquidBackground = nextDynamic(() => import("@/components/ui/LiquidBackground").then(mod => mod.LiquidBackground), { ssr: false });
const VideoPlayer = nextDynamic(() => import("@/components/academy/VideoPlayer").then(mod => mod.VideoPlayer), { ssr: false });
const PricingCalculator = nextDynamic(() => import("@/components/ui/PricingCalculator").then(mod => mod.PricingCalculator), { ssr: false });

/**
 *  SUZY-MANDATE: Generate Structured Data (JSON-LD) for Voice Actors
 */
function generateActorSchema(actor: any) {
  const baseUrl = 'https://www.voices.be';
  
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
      'name': 'Voices.be',
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
function generateArtistSchema(artist: any) {
  return {
    "@context": "https://schema.org",
    "@type": "MusicGroup",
    "name": artist.displayName,
    "description": artist.bio,
    "url": `https://www.voices.be/artist/${artist.slug}`,
    "genre": artist.iapContext?.genre || "Pop",
    "sameAs": [
      artist.spotifyUrl,
      artist.youtubeUrl,
      artist.instagramUrl,
      artist.tiktokUrl
    ].filter(Boolean)
  };
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
  const [firstSegment] = params.slug;
  const headersList = headers();
  const lang = headersList.get('x-voices-lang') || 'nl';

  // 1. Probeer eerst een Artist te vinden (Artist Journey DNA)
  try {
    const artist = await getArtist(firstSegment, lang);
    if (artist) {
      return {
        title: `${artist.displayName} | Voices Artist`,
        description: artist.bio,
        other: {
          'script:ld+json': JSON.stringify(generateArtistSchema(artist))
        }
      };
    }
  } catch (e) {}

  // 2. Probeer een Stem te vinden
  try {
    const actor = await getActor(firstSegment, lang);
    if (actor) {
      const title = `${actor.firstName} - Voice-over Stem | Voices.be`;
      const description = actor.bio || `Ontdek de stem van ${actor.firstName} op Voices.be.`;
      const schema = generateActorSchema(actor);

      return {
        title,
        description,
        alternates: {
          canonical: `https://www.voices.be/${params.slug.join('/')}`,
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
      const title = `${page.title} | Voices.be`;
      const description = page.description || `Ontdek meer over ${page.title} op Voices.be.`;
      return {
        title,
        description,
        alternates: {
          canonical: `https://www.voices.be/${firstSegment}`,
        }
      };
    }
  } catch (e) {
    // Fout bij CMS check
  }

  return {};
}

export default async function SmartRoutePage({ params }: { params: SmartRouteParams }) {
  const [firstSegment, journey, language, gender] = params.slug;
  
  // Gereserveerde routes overslaan (Alleen harde systeem-folders)
  const reserved = ['admin', 'backoffice', 'account', 'api', 'auth', 'checkout'];
  
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
  const [firstSegment, journey, medium] = segments;
  const headersList = headers();
  const lang = headersList.get('x-voices-lang') || 'nl';

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

  // 2. Pitch Link (Casting List)
  if (firstSegment === 'pitch' && journey) {
    try {
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
              'name': 'Voices.be'
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
                Casting Selectie
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
                        {item.actor.actorLanguages?.find(al => al.isNative)?.language?.label || 'Voice-over Stem'}
                      </TextInstrument>
                    </div>
                  </div>
                  <div className="h-12 bg-va-off-white rounded-[10px] flex items-center px-4 gap-2">
                    <div className="w-8 h-8 bg-va-black rounded-full flex items-center justify-center text-white">
                      <ArrowRight size={14} />
                    </div>
                    <TextInstrument className="text-[13px] font-medium tracking-widest text-va-black/40 uppercase">Bekijk Profiel</TextInstrument>
                  </div>
                  <Link 
                    href={`/${item.actor.slug}`}
                    className="w-full bg-va-black text-white py-4 rounded-[10px] font-medium tracking-widest text-[13px] uppercase hover:bg-primary transition-all text-center"
                  >
                    Selecteer deze stem
                  </Link>
                </ContainerInstrument>
              ))}
            </ContainerInstrument>

            <footer className="mt-32 text-center">
              <ContainerInstrument className="bg-va-black text-white p-16 rounded-[20px] shadow-aura-lg">
                <HeadingInstrument level={2} className="text-4xl font-light mb-8">Niet de juiste match?</HeadingInstrument>
                <Link href="/agency" className="va-btn-pro inline-flex items-center gap-2">
                  Bekijk alle stemmen <ArrowRight size={18} />
                </Link>
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
            <PricingCalculator   />
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
                  <Link  href="/agency" className="bg-va-off-white text-va-black px-20 py-10 rounded-[10px] font-medium text-base tracking-widest hover:scale-105 transition-all duration-700 shadow-2xl hover:bg-white uppercase"><VoiceglotText  translationKey="cta.find_voice" defaultText="vind jouw stem" /></Link>
                  <Link  href="/contact" className="text-white/30 hover:text-white font-medium text-base tracking-widest flex items-center gap-4 group transition-all duration-700 uppercase">
                    <VoiceglotText  translationKey="cta.ask_question" defaultText="stel een vraag" />
                    <ArrowRight strokeWidth={1.5} size={24} className="group-hover:translate-x-3 transition-transform duration-700" />
                  </Link>
                </ContainerInstrument>
              </ContainerInstrument>
            </ContainerInstrument>
          )}
        </footer>
      </ContainerInstrument>
    </PageWrapperInstrument>
  );
}
