"use client";

import { 
  ContainerInstrument, 
  HeadingInstrument, 
  PageWrapperInstrument, 
  SectionInstrument, 
  TextInstrument,
  ButtonInstrument
} from '@/components/ui/LayoutInstruments';
import { VoiceglotText } from '@/components/ui/VoiceglotText';
import { useSonicDNA } from '@/lib/sonic-dna';
import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState, useMemo, Suspense } from 'react';
import Image from 'next/image';
import { ChevronRight, Info, Search, Mic2, Globe, Radio, Tv, Phone, Video, Megaphone, Users, User, X, Zap } from 'lucide-react';
import { SlimmeKassa } from '@/lib/pricing-engine';
import { MarketManager } from '@config/market-manager';
import { cn } from '@/lib/utils';
import { FlagBE, FlagNL, FlagFR, FlagUK, FlagUS, FlagDE, FlagES, FlagIT, FlagPL, FlagDK, FlagPT } from '@/components/ui/LayoutInstruments';
import dynamic from "next/dynamic";
import { useRouter } from 'next/navigation';

//  NUCLEAR LOADING MANDATE
const LiquidBackground = dynamic(() => import("@/components/ui/LiquidBackground").then(mod => mod.LiquidBackground), { ssr: false });
const PricingCalculator = dynamic(() => import("@/components/ui/PricingCalculator").then(mod => mod.PricingCalculator), { ssr: false });

export default function TarievenPage() {
  const router = useRouter();
  const { playSwell, playClick } = useSonicDNA();
  const [actors, setActors] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState<string>('all');
  const [activeTab, setActiveJourney] = useState<'telefonie' | 'unpaid' | 'paid'>('paid');

  useEffect(() => {
    // Prefill language based on market
    const host = typeof window !== 'undefined' ? window.location.host : 'voices.be';
    const market = MarketManager.getCurrentMarket(host);
    if (market.market_code === 'BE') setSelectedLanguage('Vlaams');
    else if (market.market_code === 'NLNL') setSelectedLanguage('Nederlands');
  }, []);

  useEffect(() => {
    const fetchActors = async () => {
      try {
        const res = await fetch('/api/admin/config?type=actors');
        const data = await res.json();
        setActors(data.results || []);
      } catch (err) {
        console.error('Failed to fetch actors:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchActors();
  }, []);

  const languages = useMemo(() => {
    const langs = new Set<string>();
    actors.forEach(a => {
      if (a.native_lang) langs.add(a.native_lang);
    });
    return Array.from(langs).sort();
  }, [actors]);

  const filteredActors = useMemo(() => {
    return actors.filter(a => {
      const matchesSearch = a.display_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          a.first_name?.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesLang = selectedLanguage === 'all' || 
                         a.native_lang === selectedLanguage || 
                         (a.languages && a.languages.some((l: any) => l.label === selectedLanguage));
      
      return matchesSearch && matchesLang;
    }).sort((a, b) => (a.menu_order || 0) - (b.menu_order || 0));
  }, [actors, searchQuery, selectedLanguage]);

  const languageOptions = [
    { label: 'Alle talen', value: 'all', icon: Globe },
    { label: 'Vlaams', value: 'Vlaams', icon: FlagBE },
    { label: 'Nederlands', value: 'Nederlands', icon: FlagNL },
    { label: 'Frans', value: 'Frans', icon: FlagFR },
    { label: 'Engels', value: 'Engels', icon: FlagUK },
    { label: 'Duits', value: 'Duits', icon: FlagDE },
  ];

  return (
    <PageWrapperInstrument className="bg-va-off-white min-h-screen pb-32 overflow-x-hidden">
      <Suspense fallback={null}>
        <LiquidBackground strokeWidth={1.5} />
      </Suspense>
      
      {/* HERO SECTION */}
      <ContainerInstrument className="pt-64 pb-12 relative z-10 max-w-6xl mx-auto px-6 text-center">
        <header className="max-w-4xl mx-auto" onMouseEnter={() => playSwell()}>
          <HeadingInstrument level={1} className="text-[8vw] lg:text-[120px] font-extralight tracking-tighter mb-10 leading-[0.85] text-va-black">
            <VoiceglotText translationKey="pricing.title" defaultText="Tarieven" />
          </HeadingInstrument>
          
          <div className="h-[100px] flex items-center justify-center overflow-hidden">
            <TextInstrument className="text-2xl lg:text-3xl text-va-black/40 font-light tracking-tight max-w-2xl mx-auto leading-tight">
              <VoiceglotText 
                translationKey="pricing.subtitle" 
                defaultText="Transparante prijzen voor elk project. Bereken direct jouw projectprijs." 
              />
            </TextInstrument>
          </div>
          
          <ContainerInstrument className="w-24 h-1 bg-black/5 rounded-full mx-auto mt-8" />
        </header>
      </ContainerInstrument>

      {/* CALCULATOR SECTION */}
      <SectionInstrument className="py-16 relative z-10 max-w-6xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.23, 1, 0.32, 1] }}
        >
          <Suspense fallback={
            <div className="w-full h-[600px] bg-white/80 backdrop-blur-xl rounded-[20px] border border-white/20 shadow-aura flex flex-col lg:flex-row overflow-hidden">
              <div className="flex-1 p-8 lg:p-12 space-y-10">
                <div className="h-6 w-48 bg-va-black/5 rounded animate-pulse" />
                <div className="grid grid-cols-3 gap-4">
                  {[1, 2, 3].map(i => <div key={i} className="h-32 bg-va-black/5 rounded-[32px] animate-pulse" />)}
                </div>
                <div className="h-12 w-full bg-va-black/5 rounded-[20px] animate-pulse" />
              </div>
              <div className="lg:w-[380px] bg-va-black p-12 flex flex-col justify-center items-center gap-6">
                <div className="h-16 w-48 bg-white/5 rounded animate-pulse" />
                <div className="h-12 w-full bg-primary/20 rounded-[10px] animate-pulse" />
              </div>
            </div>
          }>
            <PricingCalculator />
          </Suspense>
        </motion.div>
      </SectionInstrument>

      {/* RATE CARD LIST SECTION */}
      <SectionInstrument className="py-32 relative z-10 max-w-6xl mx-auto px-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-12">
          <div className="max-w-xl">
            <HeadingInstrument level={2} className="text-5xl font-light tracking-tighter mb-6 text-va-black">
              <VoiceglotText translationKey="pricing.ratecard.title" defaultText="Tarieven per stem" />
            </HeadingInstrument>
            <TextInstrument className="text-xl text-va-black/40 font-light leading-relaxed">
              <VoiceglotText 
                translationKey="pricing.ratecard.subtitle" 
                defaultText="Voor telefonie en video hanteren we standaardtarieven. Bij advertenties variëren de prijzen per stemacteur." 
              />
            </TextInstrument>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto">
            <div className="relative w-full sm:w-64 group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-va-black/20 group-focus-within:text-primary transition-colors" size={18} />
              <input 
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Zoek een stemacteur..."
                className="w-full bg-white border border-black/5 rounded-full py-4 pl-12 pr-6 text-[15px] font-medium focus:ring-2 focus:ring-primary/10 outline-none transition-all shadow-sm"
              />
            </div>
          </div>
        </div>

        {/* JOURNEY TABS */}
        <div className="flex items-center gap-2 p-1.5 bg-va-off-white/50 rounded-[24px] border border-black/5 mb-8 w-fit">
          {[
            { id: 'paid', label: 'Advertentie', icon: Megaphone },
            { id: 'unpaid', label: 'Video', icon: Video },
            { id: 'telefonie', label: 'Telefoon', icon: Phone },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveJourney(tab.id as any);
                playClick('pro');
              }}
              className={cn(
                "flex items-center gap-3 px-6 py-3 rounded-[18px] text-[13px] font-bold transition-all duration-500",
                activeTab === tab.id 
                  ? "bg-va-black text-white shadow-lg scale-[1.02]" 
                  : "text-va-black/40 hover:text-va-black hover:bg-white/50"
              )}
            >
              <tab.icon size={16} strokeWidth={activeTab === tab.id ? 2.5 : 1.5} />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* LANGUAGE FILTERS */}
        <div className="flex flex-wrap items-center gap-3 mb-12">
          <span className="text-[11px] font-bold text-va-black/30 uppercase tracking-widest mr-2">Filter op taal:</span>
          {languageOptions.map((lang) => (
            <button
              key={lang.value}
              onClick={() => {
                setSelectedLanguage(lang.value);
                playClick('soft');
              }}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-full border text-[13px] font-medium transition-all",
                selectedLanguage === lang.value 
                  ? "bg-primary/10 border-primary/20 text-primary shadow-sm" 
                  : "bg-white border-black/5 text-va-black/40 hover:border-black/10"
              )}
            >
              {lang.icon && <lang.icon size={14} />}
              <span>{lang.label}</span>
            </button>
          ))}
        </div>

        <div className="bg-white/50 backdrop-blur-md rounded-[32px] border border-black/5 overflow-hidden shadow-aura">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-black/5">
                  <th className="px-8 py-6 text-[11px] font-bold text-va-black/30 uppercase tracking-[0.2em]">Stemacteur</th>
                  {activeTab === 'paid' ? (
                    <>
                      <th className="px-8 py-6 text-[11px] font-bold text-va-black/30 uppercase tracking-[0.2em]">
                        <div className="flex items-center gap-2">
                          <Globe size={12} /> Online Ad
                        </div>
                      </th>
                      <th className="px-8 py-6 text-[11px] font-bold text-va-black/30 uppercase tracking-[0.2em]">
                        <div className="flex items-center gap-2">
                          <Radio size={12} /> Radio
                        </div>
                      </th>
                  <th className="px-8 py-6 text-[11px] font-bold text-va-black/30 uppercase tracking-[0.2em]">
                    <div className="flex items-center gap-2">
                      <Tv size={12} /> TV Ad
                    </div>
                  </th>
                  <th className="px-8 py-6 text-[11px] font-bold text-va-black/30 uppercase tracking-[0.2em]">
                    <div className="flex items-center gap-2">
                      <Zap size={12} /> Live Regie
                    </div>
                  </th>
                </>
              ) : activeTab === 'unpaid' ? (
                <>
                  <th className="px-8 py-6 text-[11px] font-bold text-va-black/30 uppercase tracking-[0.2em]">
                    <div className="flex items-center gap-2">
                      <Video size={12} /> Video (Unpaid)
                    </div>
                  </th>
                  <th className="px-8 py-6 text-[11px] font-bold text-va-black/30 uppercase tracking-[0.2em]">
                    <div className="flex items-center gap-2">
                      <Zap size={12} /> Live Regie
                    </div>
                  </th>
                </>
              ) : (
                    <th className="px-8 py-6 text-[11px] font-bold text-va-black/30 uppercase tracking-[0.2em]">
                      <div className="flex items-center gap-2">
                        <Phone size={12} /> Telefoon / IVR
                      </div>
                    </th>
                  )}
                  <th className="px-8 py-6"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/[0.03]">
                {isLoading ? (
                  <tr>
                    <td colSpan={activeTab === 'paid' ? 5 : 3} className="px-8 py-20 text-center">
                      <div className="flex flex-col items-center gap-4">
                        <div className="w-8 h-8 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
                        <span className="text-[13px] font-bold text-va-black/20 uppercase tracking-widest">Tarieven laden...</span>
                      </div>
                    </td>
                  </tr>
                ) : filteredActors.length > 0 ? (
                  filteredActors.map((a) => {
                    const rates = a.rates || a.rates_raw || {};
                    const beRates = rates['BE'] || {};
                    
                    return (
                      <tr key={a.id} className="group hover:bg-primary/[0.02] transition-colors">
                        <td className="px-8 py-5">
                          <div className="flex items-center gap-4">
                            <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-va-off-white shadow-sm border border-black/5">
                              {a.photo_url ? (
                                <Image src={a.photo_url} alt={a.display_name} fill className="object-cover" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-va-black/20 font-bold">{a.display_name?.[0]}</div>
                              )}
                            </div>
                            <div>
                              <div className="text-[15px] font-bold text-va-black">{a.display_name}</div>
                              <div className="text-[11px] text-va-black/40 font-medium uppercase tracking-widest">{a.native_lang}</div>
                            </div>
                          </div>
                        </td>

                        {activeTab === 'paid' ? (
                          <>
                            <td className="px-8 py-5">
                              <span className="text-[15px] font-light text-va-black">€{SlimmeKassa.calculate({ usage: 'commercial', mediaTypes: ['online'], actorRates: a }).total}</span>
                            </td>
                            <td className="px-8 py-5">
                              <span className="text-[15px] font-light text-va-black">€{SlimmeKassa.calculate({ usage: 'commercial', mediaTypes: ['radio_national'], actorRates: a }).total}</span>
                            </td>
                            <td className="px-8 py-5">
                              <span className="text-[15px] font-light text-va-black">€{SlimmeKassa.calculate({ usage: 'commercial', mediaTypes: ['tv_national'], actorRates: a }).total}</span>
                            </td>
                            <td className="px-8 py-5">
                              <span className="text-[15px] font-light text-va-black">
                                {SlimmeKassa.calculate({ usage: 'commercial', mediaTypes: ['online'], liveSession: true, actorRates: a }).liveSessionSurcharge || '—'}
                              </span>
                            </td>
                          </>
                        ) : activeTab === 'unpaid' ? (
                          <>
                            <td className="px-8 py-5">
                              <span className="text-[15px] font-light text-va-black">€{SlimmeKassa.calculate({ usage: 'unpaid', words: 0, actorRates: a }).total}</span>
                            </td>
                            <td className="px-8 py-5">
                              <span className="text-[15px] font-light text-va-black">
                                {SlimmeKassa.calculate({ usage: 'unpaid', words: 0, liveSession: true, actorRates: a }).liveSessionSurcharge || '—'}
                              </span>
                            </td>
                          </>
                        ) : (
                          <td className="px-8 py-5">
                            <span className="text-[15px] font-light text-va-black">€{SlimmeKassa.calculate({ usage: 'telefonie', words: 0, actorRates: a }).total}</span>
                          </td>
                        )}

                        <td className="px-8 py-5 text-right">
                          <ButtonInstrument 
                            variant="outline" 
                            size="sm"
                            className="opacity-0 group-hover:opacity-100 transition-all rounded-full"
                            onClick={() => {
                              playClick('pro');
                              router.push(`/agency?search=${a.display_name}&usage=${activeTab}`);
                            }}
                          >
                            Boek nu
                          </ButtonInstrument>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={activeTab === 'paid' ? 5 : 3} className="px-8 py-20 text-center text-va-black/20 italic">Geen stemacteurs gevonden.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </SectionInstrument>

      {/* FOOTER INFO */}
      <SectionInstrument className="py-32 relative z-10">
        <ContainerInstrument className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
            <div className="lg:col-span-5">
              <HeadingInstrument level={2} className="text-4xl font-light tracking-tighter mb-6 text-va-black">
                <VoiceglotText translationKey="pricing.footer.title" defaultText="Wat is inbegrepen?" />
              </HeadingInstrument>
              <TextInstrument className="text-xl text-va-black/40 font-light leading-relaxed">
                <VoiceglotText 
                  translationKey="pricing.footer.subtitle" 
                  defaultText="Bij Voices geloven we in eenvoud. Geen verborgen kosten, gewoon vakmanschap." 
                />
              </TextInstrument>
            </div>
            
            <div className="lg:col-span-7">
              <ContainerInstrument className="prose prose-xl text-va-black/60 font-light leading-relaxed tracking-tight">
                <p>
                  <VoiceglotText  
                    translationKey="pricing.footer_text" 
                    defaultText="Onze tarieven zijn inclusief studiosessie, nabewerking en retakes op tone-of-voice. Voor tekstwijzigingen achteraf rekenen we een klein supplement. Geen verrassingen achteraf, gewoon de beste kwaliteit." 
                  />
                </p>
              </ContainerInstrument>
            </div>
          </div>
        </ContainerInstrument>
      </SectionInstrument>
    </PageWrapperInstrument>
  );
}
