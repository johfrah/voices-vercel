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
import { BookOpen, Calendar, ArrowRight, Loader2, Tag } from 'lucide-react';
import Link from 'next/link';

/**
 * 📰 BLOG / ARTICLE ARCHIVE (NUCLEAR 2026)
 */
export default function BlogPage() {
  const [articles, setArticles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        const res = await fetch('/api/articles');
        if (res.ok) {
          const data = await res.json();
          setArticles(data.results || []);
        }
      } catch (e) {
        console.error('Failed to fetch articles', e);
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
            <VoiceglotText translationKey="blog.badge" defaultText="Inspiratie & Nieuws" />
          </ContainerInstrument>
          <HeadingInstrument level={1} className="text-6xl md:text-8xl font-black uppercase tracking-tighter leading-none mb-6">
            <VoiceglotText translationKey="blog.title" defaultText="Voices Blog." />
          </HeadingInstrument>
          <TextInstrument className="text-va-black/40 font-medium text-xl max-w-2xl">
            <VoiceglotText 
              translationKey="blog.subtitle" 
              defaultText="Tips over stemgebruik, technische gidsen en updates uit de wereld van voice-overs." 
            />
          </TextInstrument>
        </SectionInstrument>

        {articles.length > 0 ? (
          <BentoGrid columns={3}>
            {articles.map((article, i) => (
              <BentoCard key={article.id} span={i === 0 ? "lg" : "sm"} className="bg-white shadow-sm hover:shadow-aura transition-all group overflow-hidden flex flex-col">
                <Link href={`/article/${article.slug}`} className="flex-1 flex flex-col p-8">
                  <ContainerInstrument className="flex items-center gap-4 mb-6">
                    <div className="px-3 py-1 bg-va-off-white rounded-full text-[8px] font-black uppercase tracking-widest text-va-black/40 border border-black/5">
                      {article.category || 'Nieuws'}
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
            ))}
          </BentoGrid>
        ) : (
          <ContainerInstrument className="bg-white rounded-[40px] p-20 text-center border border-black/5">
            <TextInstrument className="text-va-black/20 font-black uppercase tracking-widest">
              Geen artikelen gevonden.
            </TextInstrument>
          </ContainerInstrument>
        )}

      </ContainerInstrument>
    </PageWrapperInstrument>
  );
}
