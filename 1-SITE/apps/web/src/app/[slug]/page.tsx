import { VideoPlayer } from '@/components/academy/VideoPlayer';
import { ContainerInstrument, HeadingInstrument, PageWrapperInstrument, TextInstrument } from '@/components/ui/LayoutInstruments';
import { LiquidBackground } from '@/components/ui/LiquidBackground';
import { PricingCalculator } from '@/components/ui/PricingCalculator';
import { VoiceglotText } from '@/components/ui/VoiceglotText';
import { db } from '@db';
import { contentArticles } from '@db/schema';
import { eq } from 'drizzle-orm';
import { ArrowRight, CreditCard, Info, ShieldCheck, Star, Zap } from 'lucide-react';
import { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const { slug } = params;
  try {
    const page = await db.query.contentArticles.findFirst({
      where: eq(contentArticles.slug, slug),
    });

    if (!page) return {};

    const title = `${page.title} | Voices.be`;
    const description = page.description || `Ontdek meer over ${page.title} op Voices.be. De standaard in stemmen en audio-productie.`;

    return {
      title,
      description,
      openGraph: {
        title,
        description,
        type: 'article',
        url: `https://www.voices.be/article/${slug}`,
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description,
      },
      alternates: {
        canonical: `https://www.voices.be/article/${slug}`,
      }
    };
  } catch (e) {
    return {};
  }
}

export default async function DynamicCmsPage({ params }: { params: { slug: string } }) {
  const { slug } = params;

  try {
    const page = await db.query.contentArticles.findFirst({
      where: eq(contentArticles.slug, slug),
      with: {
        blocks: {
          orderBy: (blocks, { asc }) => [asc(blocks.displayOrder)],
        },
      },
    });

    if (!page) notFound();

    const iapContext = page.iapContext as { journey?: string; lang?: string; author?: string } | null;
    const journey = iapContext?.journey || 'agency';
    const currentLang = iapContext?.lang || 'nl';

    // 🕸️ SUZY'S KNOWLEDGE GRAPH: Collect all videos for Schema
    const videos: any[] = [];
    page.blocks.forEach((block: any) => {
      if (block.type === 'lifestyle-overlay' || block.type === 'lifestyle') {
        const url = block.settings?.video_url;
        if (url) videos.push({ url, title: block.title || page.title });
      }
      if (block.type === 'bento') {
        const items = (block.content || '').split('\n\n');
        items.forEach((item: string) => {
          const videoMatch = item.match(/video:\s*([^\n]+)/);
          if (videoMatch) videos.push({ url: videoMatch[1].trim(), title: page.title });
        });
      }
    });

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

    // 🎭 RENDER LOGIC PER BLOK TYPE
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
              <ContainerInstrument className="absolute -bottom-60 -right-60 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[150px] group-hover:bg-primary/10 transition-all duration-1000" />
            </section>
          );

        case 'bento':
          // Apple-style Bento Grid (USP's & Features)
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
                  
                  // 🌍 Intelligent Market-Aware Subtitle Logic
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
                            slug={page.slug}
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
                      
                      {!videoUrl && <ContainerInstrument className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-[80px] group-hover/bento:bg-primary/10 transition-all duration-1000" />}
                    </ContainerInstrument>
                  );
                })}
              </ContainerInstrument>
            </section>
          );

        case 'lifestyle-overlay':
        case 'lifestyle':
          // Airbnb-style Overlay Island (Contextuele Beleving)
          const videoUrl = block.settings?.video_url;
          const useOwnPlayer = block.settings?.use_own_player;
          const subtitleUrl = videoUrl ? videoUrl.replace('.mp4', `-${currentLang}.vtt`) : null;

          return (
            <section key={block.id} className="py-32 relative min-h-[80vh] flex items-center animate-in fade-in duration-1000 fill-mode-both">
              <ContainerInstrument className="absolute inset-0 bg-va-black rounded-[20px] overflow-hidden shadow-aura-lg grayscale-[0.5] hover:grayscale-0 transition-all duration-1000 group/lifestyle">
                {videoUrl && useOwnPlayer ? (
                  <VideoPlayer 
                    url={videoUrl} 
                    title={title}
                    slug={page.slug}
                    subtitles={subtitleUrl ? [{
                      src: subtitleUrl,
                      lang: currentLang,
                      label: currentLang.toUpperCase()
                    }] : []}
                  />
                ) : (
                  <>
                    <ContainerInstrument className="absolute inset-0 bg-gradient-to-b from-black/20 to-black/60" />
                    <TextInstrument className="absolute inset-0 flex items-center justify-center text-white/5 font-black text-[20vw] rotate-12 tracking-tighter pointer-events-none ">
                      <VoiceglotText translationKey="auto.page.voices.92ff10" defaultText="VOICES" />
                    </TextInstrument>
                  </>
                )}
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
          // Flexible Step Grid (2, 3 of 4 kolommen gebaseerd op inhoud)
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
          // Thematic Split-Screen (voor guarantees etc.)
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
        <LiquidBackground strokeWidth={1.5} />
        
        <ContainerInstrument className="py-48 relative z-10">
          {/* 🚀 GLOBAL HERO MANDATE */}
          <header className="mb-64 max-w-5xl animate-in fade-in slide-in-from-bottom-12 duration-1000">
              <TextInstrument className="text-[15px] font-medium tracking-[0.4em] text-primary/60 mb-12 block">
                {journey}
              </TextInstrument>
              <HeadingInstrument level={1} className="text-[10vw] lg:text-[160px] font-light tracking-tighter mb-20 leading-[0.85] text-va-black"><VoiceglotText  translationKey={`page.${page.slug}.title`} defaultText={page.title} /></HeadingInstrument>
              <ContainerInstrument className="w-48 h-1 bg-black/5 rounded-full" />
            </header>

            {/* 🏗️ SECTIONAL ORCHESTRATION */}
            <ContainerInstrument className="space-y-24">
              {page.blocks.map((block: any, index: number) => renderBlock(block, index))}
            </ContainerInstrument>

            {/* 🕸️ SUZY'S SCHEMA INJECTION: CMS Article Authority & Video Knowledge Graph */}
            <script
              type="application/ld+json"
              dangerouslySetInnerHTML={{
                __html: JSON.stringify({
                  "@context": "https://schema.org",
                  "@graph": [
                    {
                      "@type": page.type === 'Blog' ? 'BlogPosting' : 'Article',
                      "headline": page.title,
                      "description": page.description,
                      "datePublished": page.createdAt,
                      "dateModified": page.updatedAt || page.createdAt,
                      "author": {
                        "@type": "Person",
                        "name": (page.iapContext as any)?.author || "Johfrah Lefebvre",
                        "url": "https://www.voices.be/voice/johfrah-lefebvre"
                      },
                      "publisher": {
                        "@type": "Organization",
                        "name": "Voices",
                        "logo": {
                          "@type": "ImageObject",
                          "url": "https://www.voices.be/assets/common/logo-voices-be.png"
                        }
                      },
                      "mainEntityOfPage": {
                        "@type": "WebPage",
                        "@id": `https://www.voices.be/article/${slug}`
                      }
                    },
                    ...videos.map(v => ({
                      "@type": "VideoObject",
                      "name": v.title,
                      "description": page.description || v.title,
                      "thumbnailUrl": `https://www.voices.be/assets/content/blog/thumbnails/${page.slug}.jpg`,
                      "uploadDate": page.createdAt,
                      "contentUrl": `https://www.voices.be${v.url}`,
                      "embedUrl": `https://www.voices.be${v.url}`,
                      "publisher": {
                        "@type": "Organization",
                        "name": "Voices",
                        "logo": {
                          "@type": "ImageObject",
                          "url": "https://www.voices.be/assets/common/logo-voices-be.png"
                        }
                      }
                    }))
                  ]
                })
              }}
            />

            {/* 🏁 GLOBAL SIGNATURE CTA MANDATE */}
            <footer className="mt-80 text-center">
              <ContainerInstrument className="bg-va-black text-white p-32 rounded-[20px] shadow-aura-lg relative overflow-hidden group">
                <ContainerInstrument className="relative z-10">
                  <TextInstrument className="text-[15px] font-medium tracking-[0.4em] text-primary/60 mb-10 block"><VoiceglotText  translationKey="cta.next_step" defaultText="volgende stap" /></TextInstrument>
                  <HeadingInstrument level={2} className="text-7xl lg:text-8xl font-light tracking-tighter mb-16 leading-[0.9]"><VoiceglotText  translationKey="cta.ready_title" defaultText="wil je onze stemmen beluisteren?" /></HeadingInstrument>
                  <ContainerInstrument className="flex flex-col sm:flex-row items-center justify-center gap-10">
                    <Link  href="/agency" className="bg-va-off-white text-va-black px-20 py-10 rounded-[10px] font-medium text-base tracking-tight hover:scale-105 transition-all duration-700 shadow-2xl hover:bg-white"><VoiceglotText  translationKey="cta.find_voice" defaultText="vind jouw stem" /></Link>
                    <Link  href="/contact" className="text-white/30 hover:text-white font-medium text-base tracking-tight flex items-center gap-4 group transition-all duration-700">
                      <VoiceglotText  translationKey="cta.ask_question" defaultText="stel een vraag" />
                      <ArrowRight strokeWidth={1.5} size={24} className="group-hover:translate-x-3 transition-transform duration-700" />
                    </Link>
                  </ContainerInstrument>
                </ContainerInstrument>
                <ContainerInstrument className="absolute -bottom-60 -right-60 w-[1000px] h-[1000px] bg-primary/5 rounded-full blur-[200px] group-hover:bg-primary/10 transition-all duration-1000" />
              </ContainerInstrument>
            </footer>
          </ContainerInstrument>
        </PageWrapperInstrument>
      );
  } catch (error: any) {
    return <ContainerInstrument className="p-32 text-center font-light text-va-black/10 text-2xl italic tracking-widest"><VoiceglotText  translationKey="auto.page.voices_is_calibratin.332891" defaultText="Voices is calibrating..." /></ContainerInstrument>;
  }
}
