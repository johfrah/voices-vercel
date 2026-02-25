"use client";

import { ContainerInstrument, HeadingInstrument, SectionInstrument, TextInstrument } from "@/components/ui/LayoutInstruments";
import { VoiceCardSkeleton } from "@/components/ui/VoiceCardSkeleton";
import { VoiceGrid } from "@/components/ui/VoiceGrid";
import { VoiceglotText } from "@/components/ui/VoiceglotText";
import { useSonicDNA } from "@/lib/engines/sonic-dna";
import { AnimatePresence, motion } from "framer-motion";
import { useTranslation } from "@/contexts/TranslationContext";
import { Actor } from "@/types";
import { MarketManagerServer as MarketManager } from "@/lib/system/market-manager-server";
import { Suspense, useEffect, useMemo, useState, useCallback } from 'react';
import nextDynamic from "next/dynamic";
import { Globe, Mail } from "lucide-react";
import { VoicesDropdown } from "@/components/ui/VoicesDropdown";

const LiquidBackground = nextDynamic(() => import("@/components/ui/LiquidBackground").then(mod => mod.LiquidBackground), { 
  ssr: false,
  loading: () => <div className="fixed inset-0 z-0 bg-va-off-white" />
});

export default function LightPage() {
  const { t, language } = useTranslation();
  const sonic = useSonicDNA();
  const playClick = useCallback((type?: any) => {
    try { sonic.playClick(type); } catch (e) {}
  }, [sonic]);

  const [actors, setActors] = useState<Actor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedLanguage, setSelectedLanguage] = useState<string>('all');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    fetchActors();
  }, []);

  const fetchActors = async () => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/actors/?lang=all');
      if (!res.ok) throw new Error('Failed to fetch actors');
      const data = await res.json();
      
      const mappedActors = data.results.map((actor: any) => {
        let photoUrl = actor.photo_url;
        if (photoUrl && !photoUrl.startsWith('http') && !photoUrl.startsWith('/api/proxy') && !photoUrl.startsWith('/assets')) {
          photoUrl = `/api/proxy/?path=${encodeURIComponent(photoUrl)}`;
        }
        return {
          ...actor,
          photo_url: photoUrl,
          native_lang_label: MarketManager.getLanguageLabel(actor.native_lang || ''),
        };
      });
      setActors(mappedActors);
    } catch (err) {
      console.error('Error fetching actors:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredActors = useMemo(() => {
    if (selectedLanguage === 'all') return actors;
    return actors.filter(a => {
      const native = (a.native_lang || '').toLowerCase();
      const selected = selectedLanguage.toLowerCase();
      return native === selected || MarketManager.getLanguageCode(native) === MarketManager.getLanguageCode(selected);
    });
  }, [actors, selectedLanguage]);

  const languageOptions = useMemo(() => {
    const market = MarketManager.getCurrentMarket();
    const options = [
      { label: t('filter.all_languages', 'Alle talen'), value: 'all', icon: Globe },
      ...market.supported_languages.map(l => ({
        label: MarketManager.getLanguageLabel(l),
        value: l,
        langCode: MarketManager.getLanguageCode(l)
      }))
    ];
    return options;
  }, [t]);

  if (!mounted) return null;

  return (
    <main className="min-h-screen bg-va-off-white relative">
      <Suspense fallback={null}>
        <LiquidBackground strokeWidth={1.5} />
      </Suspense>

      <SectionInstrument className="!pt-32 pb-32 relative z-50">
        <ContainerInstrument plain className="max-w-[1440px] mx-auto px-4 md:px-6">
          
          {/* Header */}
          <ContainerInstrument plain className="mb-16 text-center max-w-4xl mx-auto space-y-6">
            <HeadingInstrument level={1} className="text-5xl md:text-7xl font-light tracking-tighter leading-none text-va-black">
              Vind de perfecte <span className="text-primary italic">stem</span>.
            </HeadingInstrument>
            <TextInstrument className="text-lg md:text-xl font-light text-va-black/40 max-w-2xl mx-auto">
              Beluister onze stemmen en stuur een mailtje om direct te boeken. 
              Snel, simpel en persoonlijk.
            </TextInstrument>
          </ContainerInstrument>

          {/* Simple Filter */}
          <div className="max-w-md mx-auto mb-16">
            <div className="bg-white rounded-[32px] p-2 shadow-aura border border-black/5">
              <VoicesDropdown 
                searchable
                options={languageOptions}
                value={selectedLanguage}
                onChange={(val) => {
                  playClick('pro');
                  setSelectedLanguage(val as string);
                }}
                placeholder={t('filter.all_languages', 'Alle talen')}
                label="Selecteer taal"
                className="w-full h-16"
              />
            </div>
          </div>

          {/* Grid */}
          <div className="relative min-h-[600px]">
            <AnimatePresence mode="wait">
              {isLoading ? (
                <motion.div 
                  key="loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5"
                >
                  {[...Array(10)].map((_, i) => (
                    <VoiceCardSkeleton key={i} />
                  ))}
                </motion.div>
              ) : (
                <motion.div
                  key="grid"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <VoiceGrid 
                    actors={filteredActors}
                    onSelect={(actor) => {
                      playClick('success');
                      const adminEmail = MarketManager.getCurrentMarket().email;
                      const subject = encodeURIComponent(`Boeking stem: ${actor.display_name}`);
                      const body = encodeURIComponent(`Beste Johfrah,\n\nIk zou graag de stem van ${actor.display_name} willen boeken voor een project.\n\nMet vriendelijke groet,`);
                      window.location.href = `mailto:${adminEmail}?subject=${subject}&body=${body}`;
                    }}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Footer CTA */}
          <div className="mt-32 text-center">
            <a 
              href={`mailto:${MarketManager.getCurrentMarket().email}`}
              className="inline-flex items-center gap-3 px-8 py-4 bg-va-black text-white rounded-full hover:scale-105 transition-all shadow-xl group"
            >
              <Mail size={20} className="group-hover:rotate-12 transition-transform" />
              <span className="font-bold tracking-widest uppercase text-sm">Stuur een algemene aanvraag</span>
            </a>
          </div>

        </ContainerInstrument>
      </SectionInstrument>
    </main>
  );
}
