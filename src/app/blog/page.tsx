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
import { BookOpen, Calendar, ArrowRight, Loader2, Tag, Quote, Music, FileText } from 'lucide-react';
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
          <ContainerInstrument className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full text-primary text-[10px] font-black uppercase tracking-widest border border-primary/10 mb-8">
            <BookOpen size={12} fill="currentColor" /> 
            <VoiceglotText translationKey="blog.badge" defaultText="Kennis & Inspiratie" />
          </ContainerInstrument>
          <HeadingInstrument level={1} className="text-6xl md:text-8xl font-black uppercase tracking-tighter leading-none mb-6">
            <VoiceglotText translationKey="blog.title" defaultText="De Etalage." />
          </HeadingInstrument>
          <TextInstrument className="text-va-black/40 font-medium text-xl max-w-2xl">
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
              <BentoCard key={article.id} span={i === 0 ? "lg" : "sm"} className="bg-white shadow-sm hover:shadow-aura transition-all group overflow-hidden flex flex-col">
                <Link href={`/article/${article.slug}`} className="flex-1 flex flex-col p-8">
                  <ContainerInstrument className="flex items-center gap-4 mb-6">
                    <div className="px-3 py-1 bg-va-off-white rounded-full text-[8px] font-black uppercase tracking-widest text-va-black/40 border border-black/5 flex items-center gap-2">
                      <Icon size={10} className="text-primary" />
                      {theme}
                    </div>
                    <TextInstrument className="flex items-center gap-2 text-[10px] font-bold text-va-black/30 uppercase tracking-widest">
                      <Calendar size={12} /> {new Date(article.createdAt).toLocaleDateString('nl-BE')}
                    </TextInstrument>
                  </ContainerInstrument>
                  
                  <HeadingInstrument level={2} className={`${i === 0 ? 'text-4xl' : 'text-xl'} font-black uppercase tracking-tight mb-4 group-hover:text-primary transition-colors`}>
                    {article.title}
                  </HeadingInstrument>
                  
                  <TextInstrument className="text-va-black/40 text-sm font-medium leading-relaxed mb-8 flex-1">
                    {article.excerpt || article.content?.substring(0, 150) + '...'}
                  </TextInstrument>
                  
                  <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-primary group-hover:gap-4 transition-all">
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
