"use client";

import React, { useState, useEffect } from 'react';
import { 
  PageWrapperInstrument, 
  SectionInstrument, 
  ContainerInstrument, 
  HeadingInstrument, 
  TextInstrument, 
  ButtonInstrument 
} from '@/components/ui/LayoutInstruments';
import { BentoGrid, BentoCard } from '@/components/ui/BentoGrid';
import { VoiceglotText } from '@/components/ui/VoiceglotText';
import { BookOpen, Calendar, ArrowRight, Loader2, Tag, Quote, Music, FileText, Lightbulb, Heart, Zap, Play, Recycle, Users, ShoppingBag, Radio, Mic2, Home, Globe, Ticket } from 'lucide-react';
import Link from 'next/link';

/**
 * 📰 CENTRAL ARTICLE HUB (NUCLEAR 2026)
 * 
 * Thema's: Stories, Inspiratie, Beleving, Nieuws
 */
export default function BlogPage() {
  const [articles, setArticles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Fysieke fallbacks voor als de DB nog niet meewerkt
  const fallbackArticles = [
    {
      id: 'skygge',
      slug: 'story-skygge',
      title: 'SKYGGE | Professionalisering via audio',
      excerpt: 'Hoe mede-zaakvoerder An Casters met een professionele telefooncentrale zorgt voor een onvergetelijke eerste indruk.',
      theme: 'Stories',
      createdAt: new Date().toISOString(),
      icon: Quote
    },
    {
      id: 'slv',
      slug: 'slv-belgium',
      title: 'SLV Belgium | Rust door professionalisering',
      excerpt: 'Hoe een marktleider in verlichting koos voor een uniform visitekaartje aan de telefoon.',
      theme: 'Stories',
      createdAt: new Date().toISOString(),
      icon: Lightbulb
    },
    {
      id: 'scripts',
      slug: 'voorbeeldteksten-telefooncentrale',
      title: 'Voorbeeldteksten voor je centrale',
      excerpt: 'Geen inspiratie? Gebruik onze beproefde teksten als basis voor jouw eigen boodschap. Kopieer, plak en pas aan.',
      theme: 'Inspiratie',
      createdAt: new Date().toISOString(),
      icon: FileText
    },
    {
      id: 'music',
      slug: 'wachtmuziek-die-werkt',
      title: 'Wachtmuziek die werkt',
      excerpt: 'Muziek is de hartslag van je wachtrij. Kies de juiste sfeer en verlaag de ervaren wachttijd.',
      theme: 'Beleving',
      createdAt: new Date().toISOString(),
      icon: Music
    },
    {
      id: 'mastering',
      slug: 'techniek-mastering',
      title: 'Loudness & Mastering',
      excerpt: 'Waarom onze audio zo professioneel klinkt. Een duik in onze mastering-engine.',
      theme: 'Beleving',
      createdAt: new Date().toISOString(),
      icon: Zap
    },
    {
      id: 'demos',
      slug: 'hoor-de-kwaliteit',
      title: 'Hoor de Kwaliteit',
      excerpt: 'Beluister onze top-stemmen in actie en ontdek welke stem het beste bij jouw resultaat past.',
      theme: 'Beleving',
      createdAt: new Date().toISOString(),
      icon: Play
    },
    {
      id: 'tips-voicemail',
      slug: 'tips-voicemail',
      title: '5 tips voor je voicemail',
      excerpt: 'Houd het kort, glimlach door de telefoon en vermijd clichés. Zo maak je een onvergetelijke eerste indruk.',
      theme: 'Inspiratie',
      createdAt: new Date().toISOString(),
      icon: Lightbulb
    },
    {
      id: 'coolblue',
      slug: 'coolblue-story',
      title: 'Coolblue: Alles voor een glimlach',
      excerpt: 'Waarom het klantvriendelijkste bedrijf van de Benelux zweert bij een herkenbare audio-branding.',
      theme: 'Stories',
      createdAt: new Date().toISOString(),
      icon: Heart
    },
    {
      id: 'ilari',
      slug: 'ilari-hoevenaars',
      title: 'In de studio bij Ilari Hoevenaars',
      excerpt: 'Ontdek de studio van de stem van WAZE en Hornbach. Zijn gouden tip: één accent per zin.',
      theme: 'Stories',
      createdAt: new Date().toISOString(),
      icon: Mic2
    },
    {
      id: 'machteld',
      slug: 'machteld-van-der-gaag',
      title: 'In de studio bij Machteld van der Gaag',
      excerpt: 'Een primeur in de nieuwe Home-Sweet-Home studio van een van de meest gevraagde stemmen.',
      theme: 'Stories',
      createdAt: new Date().toISOString(),
      icon: Home
    },
    {
      id: 'sean',
      slug: 'sean-gray',
      title: 'In de studio bij Sean Gray',
      excerpt: 'De Digital Vomad: Hoe deze Engelse voice-over de wereld ontdekt met zijn mobiele studio.',
      theme: 'Stories',
      createdAt: new Date().toISOString(),
      icon: Globe
    },
    {
      id: 'korneel',
      slug: 'korneel-de-clercq',
      title: 'In de studio bij Korneel De Clercq',
      excerpt: 'De vertrouwde stem van Radio 1 over het ambacht van voice-over en presentatie.',
      theme: 'Stories',
      createdAt: new Date().toISOString(),
      icon: Radio
    },
    {
      id: 'fostplus',
      slug: 'fost-plus',
      title: 'Fost Plus: Helderheid in recyclage',
      excerpt: 'Hoe audio bijdraagt aan een duurzame boodschap en een helder onthaal.',
      theme: 'Stories',
      createdAt: new Date().toISOString(),
      icon: Recycle
    },
    {
      id: 'aclvb',
      slug: 'aclvb',
      title: 'ACLVB: Menselijke nabijheid',
      excerpt: 'Een warme, professionele stem die leden meteen het juiste gevoel geeft.',
      theme: 'Stories',
      createdAt: new Date().toISOString(),
      icon: Users
    },
    {
      id: 'jokershop',
      slug: 'jokershop',
      title: 'Jokershop: Fun & Kwaliteit',
      excerpt: 'Waarom ook een feestwinkel kiest voor een professionele uitstraling aan de telefoon.',
      theme: 'Stories',
      createdAt: new Date().toISOString(),
      icon: ShoppingBag
    },
    {
      id: 'nkc',
      slug: 'nkc',
      title: 'NKC: Evolutie in audio',
      excerpt: 'Hoe technologische vooruitgang en een warme aanpak samengaan in de klantendienst.',
      theme: 'Stories',
      createdAt: new Date().toISOString(),
      icon: Radio
    },
    {
      id: 'ticketteam',
      slug: 'ticketteam',
      title: 'Ticket Team: Strak onthaal',
      excerpt: 'Van een rommeltje naar een professioneel visitekaartje aan de telefoon.',
      theme: 'Stories',
      createdAt: new Date().toISOString(),
      icon: Ticket
    }
  ];

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        const res = await fetch('/api/articles');
        if (res.ok) {
          const data = await res.json();
          // Merge DB articles with fallbacks, filter out duplicates by slug
          const dbArticles = data.results || [];
          const merged = [...dbArticles];
          
          fallbackArticles.forEach(fb => {
            if (!merged.find(a => a.slug === fb.slug)) {
              merged.push(fb);
            }
          });
          
          setArticles(merged);
        } else {
          setArticles(fallbackArticles);
        }
      } catch (e) {
        console.error('Failed to fetch articles', e);
        setArticles(fallbackArticles);
      } finally {
        setLoading(false);
      }
    };
    fetchArticles();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <Loader2 className="animate-spin text-primary" size={40} />
    </div>
  );

  return (
    <PageWrapperInstrument className="pt-32 pb-40 px-6 md:px-12 bg-va-off-white min-h-screen">
      <ContainerInstrument className="max-w-7xl mx-auto">
        
        {/* Header */}
        <SectionInstrument className="mb-16">
          <ContainerInstrument className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full text-primary text-[15px] font-light tracking-widest border border-primary/10 mb-8 ">
            <BookOpen size={12} fill="currentColor" /> 
            <VoiceglotText translationKey="blog.badge" defaultText="Kennis & Inspiratie" />
          </ContainerInstrument>
          <HeadingInstrument level={1} className="text-6xl md:text-8xl font-light tracking-tighter leading-none mb-6 text-va-black ">
            <VoiceglotText translationKey="blog.title" defaultText="De Etalage." />
          </HeadingInstrument>
          <TextInstrument className="text-va-black/40 font-light text-xl max-w-2xl leading-relaxed">
            <VoiceglotText 
              translationKey="blog.subtitle" 
              defaultText="Ontdek onze verhalen, laat je inspireren door scripts of duik in de psychologie van audio." 
            />
          </TextInstrument>
        </SectionInstrument>

        <BentoGrid columns={3}>
          {articles.map((article, i) => {
            const Icon = article.icon || Tag;
            const theme = article.theme || article.iapContext?.theme || 'Nieuws';
            
            return (
              <BentoCard key={article.id} span={i === 0 ? "lg" : "sm"} className="bg-white shadow-sm hover:shadow-aura transition-all group overflow-hidden flex flex-col !rounded-[20px]">
                <Link href={`/article/${article.slug}`} className="flex-1 flex flex-col p-8">
                  <ContainerInstrument className="flex items-center gap-4 mb-6">
                    <div className="px-3 py-1 bg-va-off-white rounded-full text-[15px] font-light tracking-widest text-va-black/40 border border-black/5 flex items-center gap-2 ">
                      <Icon size={10} className="text-primary" />
                      {theme}
                    </div>
                    <TextInstrument className="flex items-center gap-2 text-[15px] font-light text-va-black/30 tracking-widest ">
                      <Calendar size={12} /> {new Date(article.createdAt).toLocaleDateString('nl-BE')}
                    </TextInstrument>
                  </ContainerInstrument>
                  
                  <HeadingInstrument level={2} className={`${i === 0 ? 'text-4xl' : 'text-xl'} font-light tracking-tight mb-4 group-hover:text-primary transition-colors text-va-black uppercase`}>
                    {article.title}
                  </HeadingInstrument>
                  
                  <TextInstrument className="text-va-black/40 text-sm font-light leading-relaxed mb-8 flex-1">
                    {article.excerpt || article.content?.substring(0, 150) + '...'}
                  </TextInstrument>
                  
                  <div className="flex items-center gap-2 text-[15px] font-light tracking-widest text-primary group-hover:gap-4 transition-all ">
                    <VoiceglotText translationKey="common.read_more" defaultText="Lees meer" /> <ArrowRight size={14} />
                  </div>
                </Link>
              </BentoCard>
            );
          })}
        </BentoGrid>

      </ContainerInstrument>
    </PageWrapperInstrument>
  );
}
