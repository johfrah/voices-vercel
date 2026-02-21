"use client";

import { useTranslation } from '@/contexts/TranslationContext';
import {
    ButtonInstrument,
    ContainerInstrument,
    HeadingInstrument,
    PageWrapperInstrument,
    SectionInstrument,
    TextInstrument
} from '@/components/ui/LayoutInstruments';
import { VoiceglotText } from '@/components/ui/VoiceglotText';
import { ArrowRight, BookOpen, Loader2, Mic } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

/**
 *  GLOBAL SEARCH PAGE (NUCLEAR 2026)
 */
export default function SearchPage() {
  const { t } = useTranslation();
  const searchParams = useSearchParams();
  const query = searchParams?.get('q') || '';
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
          <HeadingInstrument level={1} className="text-6xl font-light tracking-tighter leading-none mb-6"><VoiceglotText  translationKey="search.title" defaultText="Zoekresultaten" /></HeadingInstrument>
          <TextInstrument className="text-va-black/40 font-light text-xl">
            {query ? (
              <ContainerInstrument as="span"><VoiceglotText translationKey="search.query_prefix" defaultText="Je zocht op:" /> <TextInstrument as="span" className="text-va-black font-light">&quot;{query}&quot;</TextInstrument></ContainerInstrument>
            ) : (
              <VoiceglotText  translationKey="search.no_query" defaultText="Typ een zoekopdracht om resultaten te zien." />
            )}
          </TextInstrument>
        </SectionInstrument>

        {loading ? (
          <ContainerInstrument className="py-20 flex flex-col items-center justify-center space-y-4">
            <Loader2 strokeWidth={1.5} className="animate-spin text-primary" size={40} />
            <TextInstrument className="text-[15px] font-light tracking-widest text-va-black/20"><VoiceglotText  translationKey="auto.page.resultaten_ophalen__.00c214" defaultText="Resultaten ophalen..." /></TextInstrument>
          </ContainerInstrument>
        ) : query ? (
          <ContainerInstrument className="space-y-16">
            {/* Voices Results */}
            <SectionInstrument className="space-y-8">
              <HeadingInstrument level={2} className="text-[15px] font-light tracking-[0.2em] text-va-black/20 flex items-center gap-3">
                <Mic strokeWidth={1.5} size={14} /><VoiceglotText  translationKey="auto.page.stemacteurs.72986a" defaultText="Stemacteurs" /></HeadingInstrument>
              {results.voices?.length > 0 ? (
                <ContainerInstrument className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {results.voices.map((voice: any) => (
                    <ButtonInstrument as={Link} key={voice.id} href={`/voice/${voice.slug}`} className="bg-white p-6 rounded-[32px] border border-black/5 shadow-sm hover:shadow-aura transition-all flex items-center gap-4 group">
                      <ContainerInstrument className="w-12 h-12 bg-va-off-white rounded-2xl flex items-center justify-center font-light text-va-black/20 ">{voice.firstName[0]}</ContainerInstrument>
                      <ContainerInstrument className="flex-1">
                        <TextInstrument className="text-[15px] font-light tracking-tight">{voice.firstName} {voice.lastName}</TextInstrument>
                        <TextInstrument className="text-[15px] font-light text-primary tracking-widest">{voice.nativeLang} <VoiceglotText translationKey="common.native" defaultText="Native" /></TextInstrument>
                      </ContainerInstrument>
                      <ArrowRight strokeWidth={1.5} size={16} className="text-va-black/10 group-hover:text-primary transition-colors" />
                    </ButtonInstrument>
                  ))}
                </ContainerInstrument>
              ) : (
                <TextInstrument className="text-[15px] font-light text-va-black/30 italic"><VoiceglotText  translationKey="auto.page.geen_stemmen_gevonde.f55930" defaultText="Geen stemmen gevonden." /></TextInstrument>
              )}
            </SectionInstrument>

            {/* Articles Results */}
            <SectionInstrument className="space-y-8">
              <HeadingInstrument level={2} className="text-[15px] font-light tracking-[0.2em] text-va-black/20 flex items-center gap-3">
                <BookOpen strokeWidth={1.5} size={14} /><VoiceglotText  translationKey="auto.page.artikelen___nieuws.2c2839" defaultText="Artikelen & Nieuws" /></HeadingInstrument>
              {results.articles?.length > 0 ? (
                <ContainerInstrument className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {results.articles.map((article: any) => (
                    <ButtonInstrument as={Link} key={article.id} href={`/article/${article.slug}`} className="bg-white p-8 rounded-[32px] border border-black/5 shadow-sm hover:shadow-aura transition-all group">
                      <TextInstrument className="text-[15px] font-light text-va-black/20 tracking-widest mb-4">{new Date(article.createdAt).toLocaleDateString('nl-BE')}</TextInstrument>
                      <HeadingInstrument level={3} className="text-xl font-light tracking-tight mb-2 group-hover:text-primary transition-colors">{article.title}</HeadingInstrument>
                      <TextInstrument className="text-[15px] text-va-black/40 line-clamp-2 font-light">{article.excerpt}</TextInstrument>
                    </ButtonInstrument>
                  ))}
                </ContainerInstrument>
              ) : (
                <TextInstrument className="text-[15px] font-light text-va-black/30 italic"><VoiceglotText  translationKey="auto.page.geen_artikelen_gevon.3bda5b" defaultText="Geen artikelen gevonden." /></TextInstrument>
              )}
            </SectionInstrument>
          </ContainerInstrument>
        ) : null}

      </ContainerInstrument>
    </PageWrapperInstrument>
  );
}
