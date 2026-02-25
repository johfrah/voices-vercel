"use client";

import { ContainerInstrument, HeadingInstrument, SectionInstrument, TextInstrument } from "@/components/ui/LayoutInstruments";
import { MarketManagerServer as MarketManager } from "@/lib/system/market-manager-server";
import { Suspense, useEffect, useMemo, useState } from 'react';
import nextDynamic from "next/dynamic";
import { Globe, Mail, Play, Pause } from "lucide-react";
import { VoicesDropdown } from "@/components/ui/VoicesDropdown";
import { useTranslation } from "@/contexts/TranslationContext";
import { Actor } from "@/types";
import { cn } from "@/lib/utils";

const LiquidBackground = nextDynamic(() => import("@/components/ui/LiquidBackground").then(mod => mod.LiquidBackground), { 
  ssr: false,
  loading: () => <div className="fixed inset-0 z-0 bg-va-off-white" />
});

// Minimalistische Voice Card voor de Light versie (0 dependencies)
const LightVoiceCard = ({ actor, onSelect }: { actor: Actor, onSelect: (a: Actor) => void }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [audio, setAudio] = useState<HTMLAudioElement | null>(null);

  const togglePlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    // 🛡️ CHRIS-PROTOCOL: Forensic Audio Check
    const demoUrl = actor.demos?.[0]?.audio_url;
    if (!demoUrl) {
      console.warn(`[LightVoiceCard] No audio_url found for actor: ${actor.display_name}`);
      return;
    }

    if (isPlaying) {
      audio?.pause();
      setIsPlaying(false);
    } else {
      if (!audio) {
        const newAudio = new Audio(demoUrl);
        newAudio.onended = () => setIsPlaying(false);
        newAudio.onerror = (err) => {
          console.error(`[LightVoiceCard] Audio load error for ${actor.display_name}:`, err);
          setIsPlaying(false);
        };
        setAudio(newAudio);
        newAudio.play().catch(err => {
          console.error(`[LightVoiceCard] Playback failed for ${actor.display_name}:`, err);
          setIsPlaying(false);
        });
      } else {
        audio.play().catch(err => {
          console.error(`[LightVoiceCard] Playback failed for ${actor.display_name}:`, err);
          setIsPlaying(false);
        });
      }
      setIsPlaying(true);
    }
  };

  useEffect(() => {
    return () => {
      audio?.pause();
    };
  }, [audio]);

  return (
    <div 
      onClick={() => onSelect(actor)}
      className="group bg-white rounded-[20px] overflow-hidden shadow-aura border border-black/[0.02] flex flex-col cursor-pointer hover:scale-[1.02] transition-all duration-500"
    >
      <div className="relative aspect-square bg-va-black overflow-hidden">
        {actor.photo_url && (
          <img 
            src={actor.photo_url} 
            alt={actor.display_name}
            className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity duration-700"
          />
        )}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <button 
            onClick={togglePlay}
            className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-xl border border-white/30 flex items-center justify-center text-white"
          >
            {isPlaying ? <Pause fill="currentColor" /> : <Play className="ml-1" fill="currentColor" />}
          </button>
        </div>
      </div>
      <div className="p-6 flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold text-primary uppercase tracking-widest">
            {MarketManager.getLanguageLabel(actor.native_lang || '')}
          </span>
        </div>
        <HeadingInstrument level={3} className="text-xl font-light tracking-tighter truncate">
          {actor.display_name}
        </HeadingInstrument>
      </div>
    </div>
  );
};

export default function LightPage() {
  const { t } = useTranslation();
  const [actors, setActors] = useState<Actor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedLanguage, setSelectedLanguage] = useState<string>('nl-be');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setSelectedLanguage('nl-be');
    fetch('/api/actors/?lang=all')
      .then(res => res.json())
      .then(data => {
        if (data?.results) {
          // 🛡️ CHRIS-PROTOCOL: Sorteer op menu_order en voice_score
          // We forceren Serge en Marilyn bovenaan door hun menu_order virtueel te verlagen
          const sorted = data.results.sort((a: any, b: any) => {
            const nameA = a.display_name || '';
            const nameB = b.display_name || '';
            
            // Forceer Serge en Marilyn naar de absolute top
            const orderA = nameA.match(/Serge|Marilyn/i) ? -1000 : (a.menu_order || 0);
            const orderB = nameB.match(/Serge|Marilyn/i) ? -1000 : (b.menu_order || 0);

            if (orderA !== orderB) return orderA - orderB;
            return (b.voice_score || 0) - (a.voice_score || 0);
          });

          const mapped = sorted.map((a: any) => ({
            ...a,
            photo_url: a.photo_url?.startsWith('http') ? a.photo_url : `/api/proxy/?path=${encodeURIComponent(a.photo_url || '')}`
          }));
          setActors(mapped);
        }
      })
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, []);

  const filteredActors = useMemo(() => {
    if (selectedLanguage === 'all') return actors;
    const targetCode = MarketManager.getLanguageCode(selectedLanguage).toLowerCase();
    return actors.filter(a => {
      const actorCode = MarketManager.getLanguageCode(a.native_lang || '').toLowerCase();
      return actorCode === targetCode;
    });
  }, [actors, selectedLanguage]);

  const languageOptions = useMemo(() => {
    const market = MarketManager.getCurrentMarket();
    return [
      { label: t('filter.all_languages', 'Alle talen'), value: 'all', icon: Globe },
      ...market.supported_languages.map(l => ({
        label: MarketManager.getLanguageLabel(l),
        value: l
      }))
    ];
  }, [t]);

  if (!mounted) return null;

  return (
    <main className="min-h-screen bg-va-off-white relative">
      <style jsx global>{`
        .va-main-layout { padding-top: 0 !important; }
        footer, header:not(.light-header) { display: none !important; }
      `}</style>

      <Suspense fallback={null}>
        <LiquidBackground strokeWidth={1.5} />
      </Suspense>

      <SectionInstrument className="!pt-32 pb-32 relative z-50">
        <ContainerInstrument plain className="max-w-[1440px] mx-auto px-4 md:px-6">
          <div className="mb-16 text-center max-w-4xl mx-auto space-y-6">
            <HeadingInstrument level={1} className="text-5xl md:text-7xl font-light tracking-tighter leading-none text-va-black">
              Vind de perfecte <span className="text-primary italic">stem</span>.
            </HeadingInstrument>
            <TextInstrument className="text-lg md:text-xl font-light text-va-black/40">
              Beluister onze stemmen en stuur een mailtje om direct te boeken.
            </TextInstrument>
          </div>

          <div className="max-w-md mx-auto mb-16">
            <VoicesDropdown 
              searchable
              options={languageOptions}
              value={selectedLanguage}
              onChange={(val) => setSelectedLanguage(val as string)}
              placeholder="Alle talen"
              label="Selecteer taal"
              className="bg-white rounded-full shadow-aura"
            />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {isLoading ? (
              [...Array(10)].map((_, i) => (
                <div key={i} className="aspect-[4/5] bg-va-black/5 rounded-[20px] animate-pulse" />
              ))
            ) : (
              filteredActors.map(actor => (
                <LightVoiceCard 
                  key={actor.id} 
                  actor={actor} 
                  onSelect={(a) => {
                    const subject = encodeURIComponent(`Boeking stem: ${a.display_name}`);
                    const body = encodeURIComponent(`Beste Johfrah,\n\nIk zou graag de stem van ${a.display_name} willen boeken.\n\nGroet,`);
                    window.location.href = `mailto:${MarketManager.getCurrentMarket().email}?subject=${subject}&body=${body}`;
                  }}
                />
              ))
            )}
          </div>

          <div className="mt-32 text-center">
            <a 
              href={`mailto:${MarketManager.getCurrentMarket().email}`}
              className="inline-flex items-center gap-3 px-10 py-5 bg-va-black text-white rounded-full font-bold tracking-widest uppercase text-sm hover:scale-105 transition-all shadow-2xl"
            >
              <Mail size={20} />
              Stuur een algemene aanvraag
            </a>
          </div>
        </ContainerInstrument>
      </SectionInstrument>
    </main>
  );
}
