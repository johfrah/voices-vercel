"use client";

import { 
  ButtonInstrument, 
  ContainerInstrument, 
  HeadingInstrument, 
  TextInstrument,
  LabelInstrument
} from "@/components/ui/LayoutInstruments";
import { VoiceglotText } from "@/components/ui/VoiceglotText";
import { useEffect, useState, useMemo } from "react";
import { cn } from "@/lib/utils";
import { 
  CheckCircle2, 
  ArrowRight, 
  Zap, 
  Globe, 
  Music,
  ShieldCheck, 
  Phone,
  Video,
  Megaphone,
  Mic2,
  Tv,
  Radio,
  Minus,
  Plus
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { SlimmeKassa } from "@/lib/pricing-engine";

interface AgencyCalculatorProps {
  initialJourney?: "telefonie" | "unpaid" | "paid";
  actors?: any[];
  pricingConfig?: any;
  selectedLanguageId?: number | null;
  onJourneyChange?: (journey: "telefonie" | "unpaid" | "paid") => void;
}

/**
 * SLIMME INPAGE KASSA (2026)
 * Voldoet aan het Voices Configurator Pattern (Exploratief).
 * Layout: Split-screen (7/5 verdeling).
 */
export const AgencyCalculator = ({ 
  initialJourney = "paid", 
  actors = [], 
  pricingConfig: externalPricingConfig,
  selectedLanguageId,
  onJourneyChange
}: AgencyCalculatorProps) => {
  const router = useRouter();
  const [calcUsage, setCalcUsage] = useState<"telefonie" | "unpaid" | "paid">(initialJourney);
  const [calcType, setCalcType] = useState<"webvideo" | "social" | "radio" | "tv" | "ivr" | "podcast">("social");
  const [calcSpots, setCalcSpots] = useState(1);
  const [calcRegion, setCalcRegion] = useState("national");
  const [calcYears, setCalcYears] = useState(1);
  const [calcWords, setCalcWords] = useState(25);
  const [calcMusic, setCalcMusic] = useState(false);
  const [calcLive, setCalcLive] = useState(false);

  // Sync interne state met prop indien gewijzigd (voor URL navigatie)
  useEffect(() => {
    if (initialJourney !== calcUsage) {
      setCalcUsage(initialJourney);
    }
  }, [initialJourney]);

  const [internalPricingConfig, setInternalPricingConfig] = useState<any>(null);
  const pricingConfig = externalPricingConfig || internalPricingConfig;
  
  useEffect(() => {
    if (!externalPricingConfig) {
      const fetchConfig = async () => {
        try {
          const res = await fetch('/api/pricing/config');
          const data = await res.json();
          setInternalPricingConfig(data);
        } catch (err) {
          console.error('Failed to fetch pricing config', err);
        }
      };
      fetchConfig();
    }
  }, [externalPricingConfig]);

  const calculatorRates: Record<string, { label: string, sub: string, icon: any, national: number, regional?: number, usage: "unpaid" | "paid" | "telefonie" }> = {
    webvideo: { 
      label: "Webvideo", 
      sub: "Corporate & Web",
      icon: Video,
      usage: "unpaid",
      national: (pricingConfig?.videoBasePrice / 100) || pricingConfig?.unpaid_base || 239
    },
    social: { 
      label: "Social Ad", 
      sub: "Social Ads",
      icon: Megaphone,
      usage: "paid",
      national: ((pricingConfig?.videoBasePrice / 100) || pricingConfig?.unpaid_base || 239) + 50
    },
    radio: { 
      label: "Radio", 
      sub: "Radio Ads",
      icon: Radio,
      usage: "paid",
      national: ((pricingConfig?.basePrice / 100) || (pricingConfig?.entry_price_base === 9 ? 199 : pricingConfig?.entry_price_base) || 199) + 150,
      regional: ((pricingConfig?.basePrice / 100) || (pricingConfig?.entry_price_base === 9 ? 199 : pricingConfig?.entry_price_base) || 199)
    },
    tv: { 
      label: "TV Ad", 
      sub: "TV Ads",
      icon: Tv,
      usage: "paid",
      national: ((pricingConfig?.basePrice / 100) || (pricingConfig?.entry_price_base === 9 ? 199 : pricingConfig?.entry_price_base) || 199) + 250,
      regional: ((pricingConfig?.basePrice / 100) || (pricingConfig?.entry_price_base === 9 ? 199 : pricingConfig?.entry_price_base) || 199) + 50
    },
    podcast: { 
      label: "Podcast Ad", 
      sub: "Pre-roll",
      icon: Mic2,
      usage: "paid",
      national: (pricingConfig?.videoBasePrice / 100) || pricingConfig?.unpaid_base || 239
    },
    ivr: { 
      label: "Telefoon", 
      sub: "Voicemail & IVR",
      icon: Phone,
      usage: "telefonie",
      national: (pricingConfig?.telephonyBasePrice / 100) || pricingConfig?.ivr_base || 89
    },
  };

  const calculateTotal = (excludeVat = false, actorRates?: any) => {
    const config = pricingConfig || SlimmeKassa.getDefaultConfig();
    const wordCount = calcWords;
    const promptCount = Math.ceil(calcWords / 8); // Geschat aantal prompts voor IVR

    const result = SlimmeKassa.calculate({
      usage: calcUsage,
      words: wordCount,
      prompts: promptCount,
      mediaTypes: calcUsage === 'paid' ? [calcType as any] : [],
      country: calcRegion === 'regional' ? 'BE-REGIONAL' : 'BE', // Simuleer regio via landcode voor globale kassa
      spots: { [calcType]: calcSpots },
      years: { [calcType]: calcYears },
      liveSession: calcLive,
      music: { asBackground: calcMusic, asHoldMusic: false },
      actorRates: actorRates || {} // Gebruik specifieke actor tarieven indien meegegeven
    }, config);

    const finalValue = excludeVat ? (result?.subtotal || 0) : (result?.total || 0);
    return finalValue.toFixed(2);
  };

  const filteredActors = useMemo(() => {
    if (!actors || actors.length === 0) return [];
    return actors.filter(a => {
      const matchesLang = selectedLanguageId ? a.native_lang_id === selectedLanguageId : true;
      return matchesLang;
    }).sort((a, b) => (a.menu_order || 0) - (b.menu_order || 0)).slice(0, 5);
  }, [actors, selectedLanguageId]);

  const getUsageSteps = () => {
    const config = pricingConfig || SlimmeKassa.getDefaultConfig();
    
    // CHRIS-PROTOCOL: Smart mapping between Drizzle/JSON keys and SlimmeKassaConfig
    const telephonyBase = (config.telephonyBasePrice / 100) || config.ivr_base || 89;
    const videoBase = (config.videoBasePrice / 100) || config.unpaid_base || 239;
    const currentBsf = (config.basePrice / 100) || config.entry_price_base === 9 ? 199 : (config.entry_price_base || 199); // Handle weird 9 value
    const liveSurcharge = (config.liveSessionSurcharge / 100) || config.live_regie || 50;

    switch (calcUsage) {
      case 'telefonie':
        return {
          title: "Hoe werkt de prijs?",
          subtitle: "VOOR TELEFONIE & IVR",
          steps: [
            { num: 1, title: "De Basis", desc: `Je betaalt een vast starttarief van €${telephonyBase} voor de eerste ${config.telephonyWordThreshold || 25} woorden.` },
            { num: 2, title: "Volume", desc: "Daarbovenop betaal je een transparante prijs per prompt. Hoe meer prompts, hoe voordeliger." },
            { num: 3, title: "Meertalig", desc: "Onze stemmen zijn meertalig inzetbaar voor een consistente merkbeleving." }
          ]
        };
      case 'paid':
        return {
          title: "Hoe werkt de prijs?",
          subtitle: "VOOR ADVERTENTIES",
          steps: [
            { num: 1, title: "De Opname", desc: `Je betaalt éénmalig €${currentBsf} voor de studiotijd. Dit is de basis voor je sessie.` },
            { num: 2, title: "De Buyout", desc: calcType === 'social' ? "Vergoeding voor gebruik op social media kanalen." : calcType === 'podcast' ? "Vergoeding voor pre-roll of sponsoring in podcasts." : "Vergoeding voor uitzendrecht op radio/TV." },
            { num: 3, title: "Live Regie (Optioneel)", desc: `Wil je de opname live volgen via Zoom of Teams? Dat kan tegen een vast tarief van €${liveSurcharge}.` }
          ]
        };
      default:
        return {
          title: "Hoe werkt de prijs?",
          subtitle: "VOOR BEDRIJFSVIDEO'S",
          steps: [
            { num: 1, title: "De Opname", desc: `Je betaalt éénmalig €${videoBase} voor de studiotijd. Dit is de basis voor je project.` },
            { num: 2, title: "Het Gebruik", desc: "Voor niet-betaalde media is het gebruiksrecht onbeperkt inbegrepen." },
            { num: 3, title: "Live Regie (Optioneel)", desc: `Regisseer de stem live tijdens de sessie voor het beste resultaat (+ €${liveSurcharge}).` }
          ]
        };
    }
  };

  const usageSteps = getUsageSteps();

  return (
    <div className="bg-white text-va-black rounded-[40px] shadow-aura-lg overflow-hidden border border-black/[0.03]">
      <div className="grid grid-cols-1 lg:grid-cols-12 items-stretch">
        
        {/* Left Column: Configuration (7/12) */}
        <div className="lg:col-span-7 p-12 relative overflow-hidden border-r border-black/[0.03] bg-va-off-white/30">
          <div className="relative z-10 space-y-12">
            
            {/* 1. Journey Selector */}
            <div className="flex justify-center">
              <div className="flex p-1 bg-white rounded-2xl border border-black/5 shadow-sm">
                {[
                  { id: 'telefonie', label: 'Telefonie', sub: 'Voicemail & IVR', icon: Phone },
                  { id: 'unpaid', label: 'Video', sub: 'Corporate & Web', icon: Video },
                  { id: 'paid', label: 'Advertentie', sub: 'Radio, TV & Ads', icon: Megaphone }
                ].map((u) => (
                  <button 
                    key={u.id}
                    onClick={() => {
                      setCalcUsage(u.id as any);
                      if (onJourneyChange) onJourneyChange(u.id as any);
                      if (u.id === 'telefonie') { setCalcType('ivr'); setCalcWords(25); }
                      else if (u.id === 'unpaid') { setCalcType('webvideo'); setCalcWords(200); }
                      else { setCalcType('social'); setCalcWords(25); }
                      setCalcYears(u.id === 'paid' && calcType === 'podcast' ? 0.25 : 1);
                    }}
                    className={cn(
                      "flex-1 md:px-8 py-3 rounded-xl text-[13px] font-bold transition-all flex flex-col items-center justify-center gap-1",
                      calcUsage === u.id ? "bg-va-black text-white shadow-lg" : "text-va-black/30 hover:text-va-black"
                    )}
                  >
                    <div className="flex items-center gap-2">
                      <u.icon size={14} className={calcUsage === u.id ? "text-primary" : ""} /> 
                      <span>{u.label}</span>
                    </div>
                    <span className={cn("text-[9px] tracking-widest font-medium opacity-40")}>{u.sub}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* 2. Contextual Grids */}
            <div className="space-y-10">
              {calcUsage === 'paid' ? (
                <div className="space-y-10">
                  {/* Medium Grid */}
                  <div className="space-y-4">
                    <LabelInstrument className="text-va-black/40 ml-0 tracking-[0.2em] text-[11px] font-bold uppercase">Kies je medium</LabelInstrument>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {Object.entries(calculatorRates)
                        .filter(([_, val]) => val.usage === 'paid')
                        .map(([key, val]) => (
                        <button
                          key={key}
                          onClick={() => {
                            setCalcType(key as any);
                            if (key === 'social' || key === 'podcast') setCalcRegion('national');
                            setCalcYears(key === 'podcast' ? 0.25 : 1);
                          }}
                          className={cn(
                            "text-left p-4 rounded-2xl border transition-all duration-500 flex flex-col gap-3 relative group",
                            calcType === key 
                              ? "border-primary/20 bg-white shadow-aura-sm" 
                              : "border-black/5 bg-white/50 hover:border-black/10"
                          )}
                        >
                          <div className="flex items-center justify-between w-full">
                            <div className={cn(
                              "w-8 h-8 rounded-lg flex items-center justify-center transition-colors",
                              calcType === key ? "bg-primary text-white" : "bg-va-off-white text-va-black/20"
                            )}>
                              <val.icon size={16} strokeWidth={1.5} />
                            </div>
                            {calcType === key && <CheckCircle2 size={16} className="text-primary" />}
                          </div>
                          <div>
                            <span className={cn("font-bold text-[13px] block leading-tight", calcType === key ? "text-va-black" : "text-va-black/40")}>{val.label}</span>
                            <span className="text-[9px] text-va-black/20 font-medium tracking-widest block mt-1 uppercase">{val.sub}</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Spots Grid */}
                  <div className="space-y-4">
                    <LabelInstrument className="text-va-black/40 ml-0 tracking-[0.2em] text-[11px] font-bold uppercase">Aantal spots</LabelInstrument>
                    <div className="flex p-1 bg-white rounded-2xl border border-black/5 shadow-sm h-[64px]">
                      {[1, 2, 3, 4, 5].map((num) => (
                        <button
                          key={num}
                          onClick={() => setCalcSpots(num)}
                          className={cn(
                            "flex-1 rounded-xl text-[13px] font-bold transition-all",
                            calcSpots === num ? "bg-va-off-white text-primary shadow-inner" : "text-va-black/30 hover:text-va-black"
                          )}
                        >
                          {num} {num === 1 ? 'Spot' : 'Spots'}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Duration Grid */}
                  <div className="space-y-4">
                    <LabelInstrument className="text-va-black/40 ml-0 tracking-[0.2em] text-[11px] font-bold uppercase">
                      {calcType === 'podcast' ? 'Duurtijd (Periode)' : 'Duurtijd (Licentie)'}
                    </LabelInstrument>
                    <div className="flex p-1 bg-white rounded-2xl border border-black/5 shadow-sm h-[64px]">
                      {calcType === 'podcast' ? [3, 6, 12].map((m) => (
                        <button key={m} onClick={() => setCalcYears(m / 12)} className={cn("flex-1 rounded-xl text-[13px] font-bold transition-all", calcYears === m / 12 ? "bg-va-off-white text-primary shadow-inner" : "text-va-black/30 hover:text-va-black")}>
                          {m} Maanden
                        </button>
                      )) : [1, 2, 3, 5].map((y) => (
                        <button key={y} onClick={() => setCalcYears(y)} className={cn("flex-1 rounded-xl text-[13px] font-bold transition-all", calcYears === y ? "bg-va-off-white text-primary shadow-inner" : "text-va-black/30 hover:text-va-black")}>
                          {y} {y === 1 ? 'Jaar' : 'Jaar'}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                /* 3. Word Slider Mandaat */
                <div className="space-y-8">
                  <div className="bg-white rounded-[32px] p-8 border border-black/5 shadow-aura">
                    <div className="flex justify-between items-center mb-8">
                      <LabelInstrument className="text-va-black/40 ml-0 tracking-[0.2em] text-[11px] font-bold uppercase">Hoeveelheid?</LabelInstrument>
                      <div className="px-4 py-2 bg-va-off-white rounded-full border border-black/5 shadow-inner flex items-center gap-2">
                        <span className="font-bold text-primary text-[15px]">{calcWords} woorden</span>
                      </div>
                    </div>
                    <div className="space-y-8">
                      <input 
                        type="range" 
                        min={calcUsage === 'telefonie' ? (pricingConfig?.telephonyWordThreshold || 25) : (pricingConfig?.videoWordThreshold || 200)} 
                        max={calcUsage === 'telefonie' ? 1500 : 5000} 
                        step="1" 
                        value={calcWords} 
                        onChange={(e) => setCalcWords(parseInt(e.target.value))} 
                        className="w-full h-1.5 bg-black/5 rounded-lg appearance-none cursor-pointer accent-primary" 
                      />
                      <div className="flex items-center gap-4 bg-va-off-white rounded-2xl p-1.5 border border-black/5 shadow-inner max-w-xs mx-auto">
                        <button onClick={() => setCalcWords(Math.max(calcUsage === 'telefonie' ? (pricingConfig?.telephonyWordThreshold || 25) : (pricingConfig?.videoWordThreshold || 200), calcWords - 25))} className="w-12 h-12 rounded-xl bg-white flex items-center justify-center hover:bg-primary hover:text-white transition-all text-va-black/40 font-bold text-xl shadow-sm">-</button>
                        <div className="flex-1 text-center"><span className="font-bold text-2xl text-primary">{calcWords}</span></div>
                        <button onClick={() => setCalcWords(calcWords + 25)} className="w-12 h-12 rounded-xl bg-white flex items-center justify-center hover:bg-primary hover:text-white transition-all text-va-black/40 font-bold text-xl shadow-sm">+</button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* 4. Price & CTA (v2.30: Fixed visibility for Telephony & Video) */}
            {(calcUsage === 'telefonie' || calcUsage === 'unpaid') && (
              <div className="pt-10 border-t border-black/[0.03] flex flex-col md:flex-row items-center justify-between gap-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                <div className="text-center md:text-left">
                  <TextInstrument className="text-va-black/30 text-[11px] tracking-[0.2em] font-bold mb-1 uppercase">Indicatie Totaalprijs (excl. BTW)</TextInstrument>
                  <div className="text-6xl font-extralight tracking-tighter text-va-black">
                    €{calculateTotal(true)}
                  </div>
                </div>
                <ButtonInstrument onClick={() => router.push('/agency')} className="va-btn-pro !bg-va-black !text-white !rounded-2xl px-10 py-6 text-lg shadow-xl hover:scale-105 transition-transform flex items-center gap-3">
                  Bekijk alle stemmen <ArrowRight size={20} />
                </ButtonInstrument>
              </div>
            )}

            {/* 5. Interactive Actor List for Commercial (v2.33) */}
            {calcUsage === 'paid' && filteredActors.length > 0 && (
              <div className="pt-10 border-t border-black/[0.03] space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
                <div className="flex items-center justify-between">
                  <TextInstrument className="text-va-black/30 text-[11px] tracking-[0.2em] font-bold uppercase">Tarieven per stemacteur (excl. BTW)</TextInstrument>
                  <button onClick={() => router.push('/agency')} className="text-[11px] font-bold text-primary uppercase tracking-widest hover:opacity-70 transition-opacity">Bekijk alle</button>
                </div>
                
                <div className="space-y-2">
                  {filteredActors.map((a) => (
                    <div key={a.id} className="flex items-center justify-between p-4 bg-white rounded-2xl border border-black/5 shadow-sm hover:border-primary/20 transition-all group">
                      <div className="flex items-center gap-3">
                        <div className="relative w-10 h-10 rounded-full overflow-hidden bg-va-off-white border border-black/5">
                          {a.photo_url ? <Image src={a.photo_url} alt={a.display_name} fill className="object-cover" /> : <div className="w-full h-full flex items-center justify-center text-va-black/20 font-bold">{a.display_name?.[0]}</div>}
                        </div>
                        <div>
                          <div className="text-[14px] font-bold text-va-black">{a.display_name}</div>
                          <div className="text-[10px] text-va-black/40 font-medium uppercase tracking-widest">{a.native_lang}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-6">
                        <div className="text-right">
                          <div className="text-2xl font-extralight tracking-tighter text-va-black">€{calculateTotal(true, a)}</div>
                          <div className="text-[9px] text-va-black/30 font-bold uppercase tracking-widest">Totaalprijs</div>
                        </div>
                        <ButtonInstrument 
                          variant="outline" 
                          size="sm" 
                          className="rounded-full !px-4 !py-2 text-[11px] font-bold uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all"
                          onClick={() => router.push(`/agency?search=${a.display_name}&usage=paid`)}
                        >
                          Boek
                        </ButtonInstrument>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Explanation (5/12) */}
        <div className="lg:col-span-5 p-12 bg-white space-y-12">
          <div className="space-y-2">
            <HeadingInstrument level={2} className="text-4xl font-light tracking-tight text-va-black">
              Hoe werkt de <span className="text-primary italic">prijs?</span>
            </HeadingInstrument>
            <TextInstrument className="text-[11px] text-va-black/30 font-bold tracking-[0.2em] uppercase">
              {usageSteps.subtitle}
            </TextInstrument>
          </div>
          
          <div className="space-y-10">
            {usageSteps.steps.map((step) => (
              <div key={step.num} className="flex gap-6 group">
                <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0 font-bold border border-primary/10 group-hover:scale-110 transition-transform duration-500">
                  {step.num}
                </div>
                <div className="space-y-1">
                  <TextInstrument className="font-bold text-va-black">{step.title}</TextInstrument>
                  <TextInstrument className="text-[15px] text-va-black/60 font-light leading-relaxed">
                    {step.desc}
                  </TextInstrument>
                </div>
              </div>
            ))}
          </div>

          <div className="pt-8 border-t border-black/[0.03] space-y-6">
              <TextInstrument className="text-[11px] text-va-black/40 leading-relaxed italic">
                {calcUsage === 'paid' ? (
                  <>De opnamekosten (€{(pricingConfig?.basePrice / 100) || 199}) zijn slechts één keer verrekend. De buyout is berekend per eenheid (jaar of 3 maanden).</>
                ) : calcUsage === 'unpaid' ? (
                  <>Inclusief studio-opname (€{(pricingConfig?.videoBasePrice / 100) || 249}) en onbeperkt gebruiksrecht. {calcWords > (pricingConfig?.videoWordThreshold || 200) && `Toeslag toegepast voor de extra lengte boven ${pricingConfig?.videoWordThreshold || 200} woorden.`}</>
                ) : (
                  <>Transparante prijsberekening voor telefonie. {calcWords > (pricingConfig?.telephonyWordThreshold || 25) && "Inclusief eenmalige opstart- en verwerkingskosten."}</>
                )}
              </TextInstrument>
            <div className="flex items-center gap-3 px-5 py-3 bg-va-off-white rounded-full border border-black/5 w-fit shadow-sm">
              <ShieldCheck size={16} className="text-green-500" />
              <TextInstrument className="text-[11px] font-bold text-va-black/40 tracking-[0.2em] uppercase">
                Gegarandeerde Voices.be Kwaliteit
              </TextInstrument>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
