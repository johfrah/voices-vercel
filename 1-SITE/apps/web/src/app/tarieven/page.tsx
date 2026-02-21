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
  const journey = searchParams?.get('journey') || 'commercial';
  
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
        
        const mappedActors = actorsData.results || [];
        const allActors = mappedActors.map((a: any) => ({
          ...a,
          native_lang_label: MarketManager.getLanguageLabel(a.native_lang || '')
        }));
        const allLangs = langsData.results || [];
        
        console.log(`[Tarieven] Fetched ${allActors.length} actors and ${allLangs.length} languages`);
        
        setActors(allActors);
        setDbLanguages(allLangs);
        
        // Market Awareness: Set default language based on domain
        const host = typeof window !== 'undefined' ? window.location.host : 'voices.be';
        const market = MarketManager.getCurrentMarket(host);
        console.log(`[Tarieven] Current market: ${market.market_code}`);

        const defaultLang = allLangs.find((l: any) => 
          (market.market_code === 'BE' && (l.label === 'Vlaams' || l.code === 'nl-BE')) ||
          (market.market_code === 'NLNL' && (l.label === 'Nederlands' || l.code === 'nl-NL'))
        );
        
        if (defaultLang) {
          console.log(`[Tarieven] Setting default language to: ${defaultLang.label} (ID: ${defaultLang.id})`);
          setSelectedLanguageId(defaultLang.id);
        } else if (allLangs.length > 0) {
          console.log(`[Tarieven] No default lang found for market, using first: ${allLangs[0].label}`);
          setSelectedLanguageId(allLangs[0].id);
        }
        
        // Debug: Check if any actors match the default language
        if (defaultLang) {
          const matching = allActors.filter(a => a.native_lang_id === defaultLang.id);
          console.log(`[Tarieven] Found ${matching.length} actors matching default language ID ${defaultLang.id}`);
        }
        
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
            className="space-y-8"
          >
            <ContainerInstrument plain className="inline-flex items-center gap-2 px-4 py-2 bg-primary/5 rounded-full text-primary text-[13px] font-bold tracking-[0.2em] uppercase border border-primary/10">
              <Search size={14} strokeWidth={2} />
              <VoiceglotText translationKey="pricing.hero.badge" defaultText="Tarieven per projecttype" />
            </ContainerInstrument>
            <HeadingInstrument level={1} className="text-6xl md:text-8xl font-light tracking-tighter leading-[0.9] text-va-black">
              <VoiceglotText translationKey="pricing.hero.title_part1" defaultText="Bereken je " />
              <TextInstrument as="span" className="text-primary italic font-light text-inherit">
                <VoiceglotText translationKey="pricing.hero.title_highlight" defaultText="Projectprijs." />
              </TextInstrument>
            </HeadingInstrument>
            <TextInstrument className="text-xl md:text-2xl font-light text-va-black/40 leading-tight tracking-tight mx-auto max-w-2xl">
              <VoiceglotText translationKey="pricing.hero.subtitle" defaultText="Transparante prijzen zonder verrassingen achteraf. Kies je projecttype en ontdek direct de investering." />
            </TextInstrument>
          </motion.div>
        </ContainerInstrument>
      </SectionInstrument>

          {/* Calculator Section */}
      <SectionInstrument className="pb-32">
        <ContainerInstrument className="max-w-6xl mx-auto px-6 space-y-12">
          <AgencyCalculator 
            initialJourney={activeTab} 
            actors={paginatedActors} 
            pricingConfig={pricingConfig}
            selectedLanguageId={selectedLanguageId}
            onJourneyChange={handleTabChange}
            isLoading={isLoading}
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={(page) => setCurrentStepPage(page)}
          />

          {/* LANGUAGE FILTERS - Market Aware - Moved below calculator, above table */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-8 border-t border-black/[0.03]">
            <span className="text-[11px] font-bold text-va-black/30 uppercase tracking-widest mr-2">
              <VoiceglotText translationKey="pricing.filter.language" defaultText="Filter op taal:" />
            </span>
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
                <span>
                  <VoiceglotText translationKey={`common.language.${lang.label.toLowerCase()}`} defaultText={lang.label} />
                </span>
              </button>
            ))}
          </div>
        </ContainerInstrument>
      </SectionInstrument>

      {/* Trust Footer */}
      <SectionInstrument className="py-48 bg-white/50 backdrop-blur-sm border-t border-black/[0.03]">
        <ContainerInstrument className="max-w-5xl mx-auto px-6 text-center">
          <TextInstrument className="text-[13px] font-bold text-va-black/20 tracking-[0.3em] uppercase mb-16">
            <VoiceglotText translationKey="pricing.promise.label" defaultText="Onze Belofte" />
          </TextInstrument>
          <ContainerInstrument plain className="grid grid-cols-1 md:grid-cols-3 gap-16">
            {[
              { title: "Vaste Tarieven", desc: "Geen verrassingen achteraf. Wat je ziet is wat je betaalt.", key: "pricing.promise.1" },
              { title: "Inclusief Regie", desc: "Al onze boekingen zijn inclusief professionele nabewerking.", key: "pricing.promise.2" },
              { title: "Snelle Levering", desc: "Standaard binnen 48 uur geleverd, vaak sneller.", key: "pricing.promise.3" }
            ].map((item, i) => (
              <ContainerInstrument key={i} plain className="space-y-4">
                <HeadingInstrument level={3} className="text-2xl font-light tracking-tight text-va-black">
                  <VoiceglotText translationKey={`${item.key}.title`} defaultText={item.title} />
                </HeadingInstrument>
                <TextInstrument className="text-[16px] text-va-black/40 font-light leading-relaxed">
                  <VoiceglotText translationKey={`${item.key}.desc`} defaultText={item.desc} />
                </TextInstrument>
              </ContainerInstrument>
            ))}
          </ContainerInstrument>
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
