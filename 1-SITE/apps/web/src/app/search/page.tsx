"use client";

import React, { useState, useEffect } from 'react';
import { 
  PageWrapperInstrument, 
  SectionInstrument, 
  ContainerInstrument, 
  HeadingInstrument, 
  TextInstrument, 
  InputInstrument 
} from '@/components/ui/LayoutInstruments';
import { VoiceglotText } from '@/components/ui/VoiceglotText';
import { Search, Mic, BookOpen, ArrowRight, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

/**
 * 🔍 GLOBAL SEARCH PAGE (NUCLEAR 2026)
 */
export default function SearchPage() {
  const searchParams = useSearchParams();
  const query = searchParams.get('q') || '';
  const [results, setResults] = useState<any>({ voices: [], articles: [] });
  const [loading, setLoading] = useState(query.length > 0);

  useEffect(() => {
    if (!query) return;

    const performSearch = async () => {
      setLoading(true);
      try {
        // Simuleer gecombineerde zoekopdracht
        const res = await fetch(`/api/blueprints?q=${query}`);
        if (res.ok) {
          const data = await res.json();
          setResults(data);
        }
      } catch (e) {
        console.error('Search failed', e);
      } finally {
        setLoading(false);
      }
    };

    performSearch();
  }, [query]);

  return (
    <PageWrapperInstrument className="pt-32 pb-40 px-6 md:px-12 bg-va-off-white min-h-screen">
      <ContainerInstrument className="max-w-7xl mx-auto">
        
        {/* Header */}
        <SectionInstrument className="mb-16">
          <HeadingInstrument level={1} className="text-6xl font-black tracking-tighter leading-none mb-6">
            <VoiceglotText translationKey="search.title" defaultText="Zoekresultaten" />
          </HeadingInstrument>
          <TextInstrument className="text-va-black/40 font-medium text-xl">
            {query ? (
              <>Je zocht op: <span className="text-va-black font-black">&quot;{query}&quot;</span></>
            ) : (
              "Typ een zoekopdracht om resultaten te zien."
            )}
          </TextInstrument>
        </SectionInstrument>

        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center space-y-4">
            <Loader2 className="animate-spin text-primary" size={40} />
            <TextInstrument className="text-[15px] font-black tracking-widest text-va-black/20">Resultaten ophalen...</TextInstrument>
          </div>
        ) : query ? (
          <div className="space-y-16">
            {/* Voices Results */}
            <section className="space-y-8">
              <HeadingInstrument level={2} className="text-[15px] font-black tracking-[0.2em] text-va-black/20 flex items-center gap-3">
                <Mic size={14} /> Stemacteurs
              </HeadingInstrument>
              {results.voices?.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {results.voices.map((voice: any) => (
                    <Link key={voice.id} href={`/voice/${voice.slug}`} className="bg-white p-6 rounded-[32px] border border-black/5 shadow-sm hover:shadow-aura transition-all flex items-center gap-4 group">
                      <div className="w-12 h-12 bg-va-off-white rounded-2xl flex items-center justify-center font-black text-va-black/20 ">{voice.firstName[0]}</div>
                      <div className="flex-1">
                        <TextInstrument className="text-sm font-black tracking-tight">{voice.firstName} {voice.lastName}</TextInstrument>
                        <TextInstrument className="text-[15px] font-bold text-primary tracking-widest">{voice.nativeLang} Native</TextInstrument>
                      </div>
                      <ArrowRight strokeWidth={1.5} size={16} className="text-va-black/10 group-hover:text-primary transition-colors" />
                    </Link>
                  ))}
                </div>
              ) : (
                <TextInstrument className="text-sm font-medium text-va-black/30 italic">Geen stemmen gevonden.</TextInstrument>
              )}
            </section>

            {/* Articles Results */}
            <section className="space-y-8">
              <HeadingInstrument level={2} className="text-[15px] font-black tracking-[0.2em] text-va-black/20 flex items-center gap-3">
                <BookOpen strokeWidth={1.5} size={14} /> Artikelen & Nieuws
              </HeadingInstrument>
              {results.articles?.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {results.articles.map((article: any) => (
                    <Link key={article.id} href={`/article/${article.slug}`} className="bg-white p-8 rounded-[32px] border border-black/5 shadow-sm hover:shadow-aura transition-all group">
                      <TextInstrument className="text-[15px] font-black text-va-black/20 tracking-widest mb-4">{new Date(article.createdAt).toLocaleDateString('nl-BE')}</TextInstrument>
                      <HeadingInstrument level={3} className="text-xl font-black tracking-tight mb-2 group-hover:text-primary transition-colors">{article.title}</HeadingInstrument>
                      <TextInstrument className="text-sm text-va-black/40 line-clamp-2 font-light">{article.excerpt}</TextInstrument>
                    </Link>
                  ))}
                </div>
              ) : (
                <TextInstrument className="text-sm font-medium text-va-black/30 italic">Geen artikelen gevonden.</TextInstrument>
              )}
            </section>
          </div>
        ) : null}

      </ContainerInstrument>
    </PageWrapperInstrument>
  );
}
