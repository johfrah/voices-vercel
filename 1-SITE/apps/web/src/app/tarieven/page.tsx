"use client";

import { AgencyCalculator } from "@/components/ui/AgencyCalculator";
import { 
  ContainerInstrument, 
  HeadingInstrument, 
  PageWrapperInstrument, 
  SectionInstrument, 
  TextInstrument,
  ButtonInstrument
} from "@/components/ui/LayoutInstruments";
import { cn } from "@/lib/utils";
import { LiquidBackground } from "@/components/ui/LiquidBackground";
import { useSearchParams, useRouter } from "next/navigation";
import { Suspense, useEffect, useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Search, Globe, Phone, Video, Megaphone, Radio, Tv, Zap } from "lucide-react";
import Image from "next/image";
import { useSonicDNA } from "@/lib/sonic-dna";
import { VoiceglotText } from "@/components/ui/VoiceglotText";
import { MarketManager } from "@config/market-manager";
import { FlagBE, FlagNL, FlagFR, FlagUK, FlagDE } from "@/components/ui/LayoutInstruments";

import { SlimmeKassa } from "@/lib/pricing-engine";

/**
 * AGENCY PRICE PAGE (2026)
 * Route: /tarieven
 * Doel: Transparante prijsindicatie met direct gekoppelde stemmenlijst.
 */
function PricePageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { playClick } = useSonicDNA();
  const journey = searchParams.get('journey') || 'commercial';
  
  // Map journey param naar calculator usage
  const initialUsage = journey === 'telephony' ? 'telefonie' : journey === 'video' ? 'unpaid' : 'paid';

  const [actors, setActors] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLanguageId, setSelectedLanguageId] = useState<number | null>(null);
  const [dbLanguages, setDbLanguages] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'telefonie' | 'unpaid' | 'paid'>(initialUsage as any);
  const [pricingConfig, setPricingConfig] = useState<any>(null);
  const [currentPage, setCurrentStepPage] = useState(1);
  const itemsPerPage = 10;

  // Sync activeTab met calculator state via URL of interne state
  const handleTabChange = (newTab: 'telefonie' | 'unpaid' | 'paid') => {
    setActiveTab(newTab);
    setCurrentStepPage(1);
  };

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const res = await fetch('/api/pricing/config');
        if (res.ok) {
          const data = await res.json();
          setPricingConfig(data);
        }
      } catch (err) {
        console.error('Failed to fetch pricing config', err);
      }
    };
    fetchConfig();
  }, []);

  useEffect(() => {
    const fetchActors = async () => {
      try {
        const [actorsRes, langsRes] = await Promise.all([
          fetch('/api/admin/config?type=actors'),
          fetch('/api/admin/config?type=languages')
        ]);
        
        const actorsData = await actorsRes.json();
        const langsData = await langsRes.json();
        
        const allActors = actorsData.results || [];
        const allLangs = langsData.results || [];
        
        setActors(allActors);
        setDbLanguages(allLangs);
        
        // Market Awareness: Set default language based on domain
        const host = typeof window !== 'undefined' ? window.location.host : 'voices.be';
        const market = MarketManager.getCurrentMarket(host);
        const defaultLang = allLangs.find((l: any) => 
          (market.market_code === 'BE' && (l.label === 'Vlaams' || l.code === 'nl-BE')) ||
          (market.market_code === 'NLNL' && (l.label === 'Nederlands' || l.code === 'nl-NL'))
        );
        
        if (defaultLang) setSelectedLanguageId(defaultLang.id);
        else if (allLangs.length > 0) setSelectedLanguageId(allLangs[0].id);
        
      } catch (err) {
        console.error('Failed to fetch actors or languages:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchActors();
  }, []);

  const filteredActors = useMemo(() => {
    return actors.filter(a => {
      const matchesSearch = a.display_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          a.first_name?.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesLang = selectedLanguageId ? a.native_lang_id === selectedLanguageId : true;
      
      return matchesSearch && matchesLang;
    }).sort((a, b) => (a.menu_order || 0) - (b.menu_order || 0));
  }, [actors, searchQuery, selectedLanguageId]);

  const paginatedActors = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredActors.slice(start, start + itemsPerPage);
  }, [filteredActors, currentPage]);

  const totalPages = Math.ceil(filteredActors.length / itemsPerPage);

  const languageOptions = useMemo(() => {
    const priority = ['Vlaams', 'Nederlands', 'Frans', 'Engels', 'Duits'];
    const icons: Record<string, any> = {
      'Vlaams': FlagBE,
      'Nederlands': FlagNL,
      'Frans': FlagFR,
      'Engels': FlagUK,
      'Duits': FlagDE
    };

    return dbLanguages
      .filter(l => priority.includes(l.label))
      .sort((a, b) => priority.indexOf(a.label) - priority.indexOf(b.label))
      .map(l => ({
        label: l.label,
        value: l.id,
        icon: icons[l.label]
      }));
  }, [dbLanguages]);

  return (
    <PageWrapperInstrument className="min-h-screen bg-va-off-white selection:bg-primary selection:text-white">
      <LiquidBackground strokeWidth={1.5} />
      
      {/* Header Section */}
      <SectionInstrument className="pt-48 pb-24">
        <ContainerInstrument className="max-w-5xl mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-6"
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-primary/5 rounded-full text-primary text-[11px] font-bold tracking-widest uppercase">
              <Search size={14} />
              Tarieven per projecttype
            </div>
            <HeadingInstrument level={1} className="text-6xl md:text-8xl font-extralight tracking-tighter leading-tight text-va-black">
              Bereken je <span className="text-primary/30 italic">Projectprijs.</span>
            </HeadingInstrument>
          </motion.div>
        </ContainerInstrument>
      </SectionInstrument>

      {/* Calculator Section */}
      <SectionInstrument className="pb-12">
        <ContainerInstrument className="max-w-6xl mx-auto px-6">
          <AgencyCalculator 
            initialJourney={activeTab} 
            actors={actors} 
            pricingConfig={pricingConfig}
            selectedLanguageId={selectedLanguageId}
            onJourneyChange={handleTabChange}
          />
        </ContainerInstrument>
      </SectionInstrument>

      {/* COMPACT RATE CARD SECTION (v2.21) */}
      <SectionInstrument className="pb-32 relative z-10 max-w-6xl mx-auto px-6">
        {/* LANGUAGE FILTERS - Market Aware */}
        <div className="flex flex-wrap items-center gap-3 mb-8">
          <span className="text-[11px] font-bold text-va-black/30 uppercase tracking-widest mr-2">Filter op taal:</span>
          {languageOptions.map((lang) => (
            <button
              key={lang.value}
              onClick={() => {
                setSelectedLanguageId(lang.value);
                setCurrentStepPage(1);
                playClick('soft');
              }}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-full border text-[13px] font-medium transition-all",
                selectedLanguageId === lang.value 
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
                    </>
                  ) : activeTab === 'unpaid' ? (
                    <th className="px-8 py-6 text-[11px] font-bold text-va-black/30 uppercase tracking-[0.2em]">
                      <div className="flex items-center gap-2">
                        <Video size={12} /> Video (Unpaid)
                      </div>
                    </th>
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
                ) : paginatedActors.length > 0 ? (
                  paginatedActors.map((a) => {
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
                              <span className="text-[15px] font-light text-va-black">€{SlimmeKassa.calculate({ usage: 'commercial', mediaTypes: ['online'], actorRates: a }, pricingConfig || undefined).total}</span>
                            </td>
                            <td className="px-8 py-5">
                              <span className="text-[15px] font-light text-va-black">€{SlimmeKassa.calculate({ usage: 'commercial', mediaTypes: ['radio_national'], actorRates: a }, pricingConfig || undefined).total}</span>
                            </td>
                            <td className="px-8 py-5">
                              <span className="text-[15px] font-light text-va-black">€{SlimmeKassa.calculate({ usage: 'commercial', mediaTypes: ['tv_national'], actorRates: a }, pricingConfig || undefined).total}</span>
                            </td>
                          </>
                        ) : activeTab === 'unpaid' ? (
                          <td className="px-8 py-5">
                            <span className="text-[15px] font-light text-va-black">€{SlimmeKassa.calculate({ usage: 'unpaid', words: 0, actorRates: a }, pricingConfig || undefined).base}</span>
                          </td>
                        ) : (
                          <td className="px-8 py-5">
                            <span className="text-[15px] font-light text-va-black">€{SlimmeKassa.calculate({ usage: 'telefonie', words: 0, actorRates: a }, pricingConfig || undefined).base}</span>
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
          
          {/* PAGINATION CONTROLS */}
          {totalPages > 1 && (
            <div className="px-8 py-6 border-t border-black/5 flex items-center justify-between bg-va-off-white/30">
              <TextInstrument className="text-[11px] font-bold text-va-black/30 uppercase tracking-widest">
                Pagina {currentPage} van {totalPages}
              </TextInstrument>
              <div className="flex gap-2">
                <button 
                  onClick={() => { setCurrentStepPage(prev => Math.max(1, prev - 1)); playClick('soft'); }}
                  disabled={currentPage === 1}
                  className="px-4 py-2 rounded-xl bg-white border border-black/5 text-[11px] font-bold uppercase tracking-widest hover:border-primary/20 disabled:opacity-30 transition-all"
                >
                  Vorige
                </button>
                <button 
                  onClick={() => { setCurrentStepPage(prev => Math.min(totalPages, prev + 1)); playClick('soft'); }}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 rounded-xl bg-white border border-black/5 text-[11px] font-bold uppercase tracking-widest hover:border-primary/20 disabled:opacity-30 transition-all"
                >
                  Volgende
                </button>
              </div>
            </div>
          )}
        </div>
      </SectionInstrument>

      {/* Trust Footer */}
      <SectionInstrument className="py-32 bg-white/50 backdrop-blur-sm border-t border-black/[0.03]">
        <ContainerInstrument className="max-w-4xl mx-auto px-6 text-center">
          <TextInstrument className="text-[13px] font-bold text-va-black/20 tracking-[0.2em] uppercase mb-8">Onze Belofte</TextInstrument>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {[
              { title: "Vaste Tarieven", desc: "Geen verrassingen achteraf. Wat je ziet is wat je betaalt." },
              { title: "Inclusief Regie", desc: "Al onze boekingen zijn inclusief professionele nabewerking." },
              { title: "Snelle Levering", desc: "Standaard binnen 48 uur geleverd, vaak sneller." }
            ].map((item, i) => (
              <div key={i} className="space-y-3">
                <HeadingInstrument level={3} className="text-xl font-bold text-va-black">{item.title}</HeadingInstrument>
                <TextInstrument className="text-[15px] text-va-black/40 font-light">{item.desc}</TextInstrument>
              </div>
            ))}
          </div>
        </ContainerInstrument>
      </SectionInstrument>
    </PageWrapperInstrument>
  );
}

export default function PricePage() {
  return (
    <Suspense fallback={null}>
      <PricePageContent />
    </Suspense>
  );
}
