"use client";

import { 
  ButtonInstrument, 
  ContainerInstrument, 
  HeadingInstrument, 
  PageWrapperInstrument, 
  SectionInstrument, 
  TextInstrument,
  LabelInstrument
} from "@/components/ui/LayoutInstruments";
import { LiquidBackground } from "@/components/ui/LiquidBackground";
import { VoiceglotText } from "@/components/ui/VoiceglotText";
import { getActor } from "@/lib/api";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { PortfolioTarievenSkeleton } from "@/components/portfolio/PortfolioTarievenSkeleton";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useTranslation } from "@/contexts/TranslationContext";
import { 
  CheckCircle2, 
  ArrowRight, 
  Zap, 
  Globe, 
  Music,
  ShieldCheck, 
  Clock,
  Mic2,
  Tv,
  Radio,
  FileText,
  Phone,
  Video,
  Megaphone,
  MessageSquare
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

/**
 * TARIEVEN PAGINA (INDIVIDUEEL PORTFOLIO)
 * Focus: Helderheid, transparantie en psychologische conversie.
 */
export default function PortfolioTarievenPage() {
  const params = useParams();
  const { t } = useTranslation();
  const slug = (params.slug as string) || "johfrah";
  
  //  CHRIS-PROTOCOL: All hooks must be at the very top level
  const [artistData, setArtistData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [calcUsage, setCalcUsage] = useState<"telefonie" | "unpaid" | "paid">("telefonie");
  const [calcType, setCalcType] = useState<"webvideo" | "social" | "radio" | "tv" | "ivr" | "podcast">("ivr");
  const [calcSpots, setCalcSpots] = useState(1);
  const [calcRegion, setCalcRegion] = useState("national");
  const [calcYears, setCalcYears] = useState(1);
  const [calcWords, setCalcWords] = useState(25);
  const [calcMusic, setCalcMusic] = useState(false);
  const [calcLive, setCalcLive] = useState(false);
  const [pricingConfig, setPricingConfig] = useState<any>(null);

  const getPortfolioHref = (subPath: string) => {
    if (typeof window === 'undefined') return `/portfolio/${slug}${subPath}`;
    const host = window.location.host;
    if (host.includes('johfrah.be')) {
      return subPath;
    }
    return `/portfolio/${slug}${subPath}`;
  };

  const bsf = 199;
  const config = pricingConfig || { telephonyBasePrice: 1995, telephonyWordThreshold: 25, videoWordThreshold: 200, basePrice: 19900 };

  useEffect(() => {
    async function loadData() {
      try {
        const data = await getActor(slug);
        setArtistData(data);
      } catch (e) {
        console.error("Failed to fetch actor data for rates", e);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [slug]);

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const res = await fetch('/api/pricing/config');
        const data = await res.json();
        setPricingConfig(data);
      } catch (err) {
        console.error('Failed to fetch pricing config', err);
      }
    };
    fetchConfig();
  }, []);

  // Early return for loading state
  if (loading) return <PortfolioTarievenSkeleton />;

  // Data-driven calculations
  const calculatorRates: Record<string, { label: string, icon: any, national: number, regional?: number, usage: "unpaid" | "paid" | "telefonie" }> = {
    webvideo: { 
      label: "Webvideo", 
      icon: Video,
      usage: "unpaid",
      national: artistData?.rates?.BE?.unpaid || artistData?.rates?.GLOBAL?.unpaid || (pricingConfig?.videoBasePrice / 100) || 0
    },
    social: { 
      label: "Social Ad", 
      icon: Megaphone,
      usage: "paid",
      national: artistData?.rates?.BE?.social_media || artistData?.rates?.GLOBAL?.social_media || (pricingConfig?.videoBasePrice / 100) + 50 || 0
    },
    radio: { 
      label: "Radio", 
      icon: Radio,
      usage: "paid",
      national: artistData?.rates?.BE?.radio_national || artistData?.rates?.GLOBAL?.radio_national || (pricingConfig?.basePrice / 100) + 150 || 0,
      regional: artistData?.rates?.BE?.radio_regional || artistData?.rates?.GLOBAL?.radio_regional || (pricingConfig?.basePrice / 100) || 0
    },
    tv: { 
      label: "TV Ad", 
      icon: Tv,
      usage: "paid",
      national: artistData?.rates?.BE?.tv_national || artistData?.rates?.GLOBAL?.tv_national || (pricingConfig?.basePrice / 100) + 250 || 0,
      regional: artistData?.rates?.BE?.tv_regional || artistData?.rates?.GLOBAL?.tv_regional || (pricingConfig?.basePrice / 100) + 50 || 0
    },
    podcast: { 
      label: "Podcast Ad", 
      icon: Mic2,
      usage: "paid",
      national: artistData?.rates?.GLOBAL?.podcast_ad || (pricingConfig?.videoBasePrice / 100) || 0
    },
    ivr: { 
      label: "Telefoon", 
      icon: Phone,
      usage: "telefonie",
      national: artistData?.rates?.BE?.ivr || artistData?.rates?.GLOBAL?.ivr || (pricingConfig?.telephonyBasePrice / 100) || 0
    },
  };

  const calculateTotal = () => {
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
      actorRates: artistData || {}
    }, config);

    return result.total.toFixed(2);
  };

  const getWpmTime = (words: number) => {
    const totalSeconds = Math.round((words / 160) * 60);
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins}${t('common.min_short', 'min')} ${secs.toString().padStart(2, '0')}${t('common.sec_short', 'sec')}`;
  };

  const getUsageSteps = () => {
    const telephonyBase = config.telephonyBasePrice / 100;
    switch (calcUsage) {
      case 'telefonie':
        return {
          title: "Hoe werkt de prijs?",
          subtitle: "Voor Telefonie & IVR",
          steps: [
            {
              num: 1,
              title: "De Basis",
              desc: `Je betaalt een vast starttarief van €${telephonyBase} voor de eerste ${config.telephonyWordThreshold || 25} woorden.`
            },
            {
              num: 2,
              title: "Volume",
              desc: "Daarbovenop betaal je een transparante prijs per prompt. Hoe meer prompts je bestelt, hoe lager de prijs per eenheid wordt."
            },
            {
              num: 3,
              title: "Meertalig",
              desc: artistData?.languages?.length > 0 
                ? `${artistData.name} spreekt vloeiend ${artistData.languages.map((l: any) => l.name).join(', ')}. Ideaal voor een consistente merkbeleving.`
                : `${artistData?.name || 'Deze stem'} is meertalig inzetbaar voor een consistente merkbeleving in al je talen.`
            }
          ]
        };
      case 'paid':
        return {
          title: "Hoe werkt de prijs?",
          subtitle: "Voor Advertenties",
          steps: [
            {
              num: 1,
              title: "De Opname",
              desc: `Je betaalt éénmalig €${bsf} voor mijn tijd in de studio. Dit is de basis voor je sessie.`
            },
            {
              num: 2,
              title: "De Buyout",
              desc: calcType === 'social' 
                ? "Dit is de vergoeding voor het gebruik op social media kanalen (Instagram, Facebook, TikTok, etc.)."
                : calcType === 'podcast'
                ? "Dit is de vergoeding voor het gebruik als pre-roll of sponsoring in podcasts."
                : calcType === 'radio'
                ? "Dit is de vergoeding voor het uitzendrecht op de radio. De prijs hangt af van de regio (Nationaal of Regionaal)."
                : "Dit is de vergoeding voor het uitzendrecht op TV. De prijs hangt af van de regio (Nationaal of Regionaal)."
            },
            {
              num: 3,
              title: calcType === 'podcast' ? "Periode" : "Licentieduur",
              desc: calcType === 'podcast' 
                ? "Standaard is 3 maanden inbegrepen. Je kunt dit eenvoudig verlengen voor een langere looptijd."
                : "Standaard is 1 jaar inbegrepen. Je kunt dit eenvoudig verlengen voor een langere looptijd."
            }
          ]
        };
      default: // unpaid / video
        return {
          title: "Hoe werkt de prijs?",
          subtitle: "Voor Bedrijfsvideo's",
          steps: [
            {
              num: 1,
              title: "De Opname",
              desc: `Je betaalt éénmalig €${bsf} voor de tijd in de studio. Dit is de basis voor je project.`
            },
            {
              num: 2,
              title: "Het Gebruik",
              desc: "Voor niet-betaalde media (website, intern) is het gebruiksrecht onbeperkt inbegrepen."
            },
            {
              num: 3,
              title: "Lengte",
              desc: `Tot ${config.videoWordThreshold || 200} woorden is de prijs vast. Daarboven rekenen we een kleine toeslag per extra woord.`
            }
          ]
        };
    }
  };

  const usageSteps = getUsageSteps();

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
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-primary/5 rounded-full text-primary text-[11px] font-bold tracking-widest">
              <Zap size={14} />
              <VoiceglotText translationKey="rates.page.badge" defaultText="Eerlijke tarieven" />
            </div>
            <HeadingInstrument level={1} className="text-6xl md:text-8xl font-extralight tracking-tighter leading-tight text-va-black">
              Tarieven & <span className="text-primary/30 italic">Mogelijkheden.</span>
            </HeadingInstrument>
            <TextInstrument className="text-xl text-va-black/40 font-light max-w-2xl mx-auto leading-relaxed">
              Geen verborgen kosten of ingewikkelde berekeningen. Eerlijke prijzen voor professioneel vakmanschap, direct uit mijn eigen studio.
            </TextInstrument>
          </motion.div>
        </ContainerInstrument>
      </SectionInstrument>

      {/*  INTEGRATED HOW IT WORKS & CALCULATOR */}
      <SectionInstrument id="calculator" className="pb-32">
        <ContainerInstrument className="max-w-6xl mx-auto px-6">
          <div className="bg-white text-va-black rounded-[40px] shadow-aura-lg overflow-hidden border border-black/[0.03]">
            <div className="grid grid-cols-1 lg:grid-cols-12 items-stretch">
              
              {/* Left: Interactive Calculator */}
              <div className="lg:col-span-7 p-12 relative overflow-hidden border-r border-black/[0.03]">
                <div className="absolute inset-0 bg-primary/[0.02] -rotate-12 scale-150" />
                
                <div className="relative z-10 space-y-10">
                  <div className="flex flex-col md:flex-row justify-end items-start md:items-center gap-6">
                    
                    {/* Top Level Usage Selection (Agency Style) */}
                    <div className="flex p-1 bg-va-off-white rounded-2xl border border-black/5 shadow-inner w-full md:w-auto">
                      <button 
                        onClick={() => {
                          setCalcUsage('telefonie');
                          setCalcType('ivr');
                          setCalcWords(25);
                          setCalcYears(1);
                        }}
                        className={cn(
                          "flex-1 md:px-8 py-3 rounded-xl text-[13px] font-bold transition-all flex flex-col items-center justify-center gap-1",
                          calcUsage === 'telefonie' ? "bg-primary text-white shadow-lg" : "text-va-black/30 hover:text-va-black"
                        )}
                      >
                        <div className="flex items-center gap-2">
                          <Phone size={14} /> <span>Telefonie</span>
                        </div>
                        <span className={cn("text-[9px] tracking-widest font-medium opacity-40", calcUsage === 'telefonie' ? "text-white" : "text-va-black")}>Voicemail & IVR</span>
                      </button>
                      <button 
                        onClick={() => {
                          setCalcUsage('unpaid');
                          setCalcType('webvideo');
                          setCalcWords(200);
                          setCalcYears(1);
                        }}
                        className={cn(
                          "flex-1 md:px-8 py-3 rounded-xl text-[13px] font-bold transition-all flex flex-col items-center justify-center gap-1",
                          calcUsage === 'unpaid' ? "bg-primary text-white shadow-lg" : "text-va-black/30 hover:text-va-black"
                        )}
                      >
                        <div className="flex items-center gap-2">
                          <Video size={14} /> <span>Video</span>
                        </div>
                        <span className={cn("text-[9px] tracking-widest font-medium opacity-40", calcUsage === 'unpaid' ? "text-white" : "text-va-black")}>Corporate & Website</span>
                      </button>
                      <button 
                        onClick={() => {
                          setCalcUsage('paid');
                          setCalcType('social');
                          setCalcYears(1);
                        }}
                        className={cn(
                          "flex-1 md:px-8 py-3 rounded-xl text-[13px] font-bold transition-all flex flex-col items-center justify-center gap-1",
                          calcUsage === 'paid' ? "bg-primary text-white shadow-lg" : "text-va-black/30 hover:text-va-black"
                        )}
                      >
                        <div className="flex items-center gap-2">
                          <Megaphone size={14} /> <span>Advertentie</span>
                        </div>
                        <span className={cn("text-[9px] tracking-widest font-medium opacity-40", calcUsage === 'paid' ? "text-white" : "text-va-black")}>Radio, TV & Online Ads</span>
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-8">
                      {calcUsage === 'paid' && (
                        <div className="space-y-8">
                          <div className="space-y-4">
                            <LabelInstrument className="text-va-black/40 ml-0 tracking-widest text-[11px] font-bold">Kies je medium</LabelInstrument>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                              {Object.entries(calculatorRates)
                                .filter(([_, val]) => val.usage === 'paid')
                                .map(([key, val]) => (
                                <button
                                  key={key}
                                  onClick={() => {
                                    setCalcType(key as any);
                                    if (key === 'social' || key === 'podcast') setCalcRegion('national');
                                    if (key === 'podcast') setCalcYears(0.25); // Standaard op 3 maanden (3/12)
                                    else setCalcYears(1);
                                  }}
                                  className={cn(
                                    "text-left p-4 rounded-2xl border transition-all duration-500 flex flex-col gap-3 relative group",
                                    calcType === key 
                                      ? "border-primary/20 bg-white shadow-aura-sm" 
                                      : "border-black/5 bg-va-off-white/50 hover:border-black/10"
                                  )}
                                >
                                  <div className="flex items-center justify-between w-full">
                                    <div className={cn(
                                      "w-8 h-8 rounded-lg flex items-center justify-center transition-colors",
                                      calcType === key ? "bg-primary text-white" : "bg-white text-va-black/20 shadow-sm border border-black/5"
                                    )}>
                                      <val.icon size={16} strokeWidth={1.5} />
                                    </div>
                                    {calcType === key && <CheckCircle2 size={16} className="text-primary" />}
                                  </div>
                                  <div>
                                    <span className={cn("font-bold text-[13px] block leading-tight", calcType === key ? "text-va-black" : "text-va-black/40")}>{val.label}</span>
                                    <span className="text-[9px] text-va-black/20 font-medium tracking-widest block mt-1">
                                      {key === 'social' ? 'Social Ads' : key === 'podcast' ? 'Pre-roll' : key === 'radio' ? 'Radio Ads' : 'TV Ads'}
                                    </span>
                                  </div>
                                </button>
                              ))}
                            </div>
                          </div>

                          {/* Full Width Swipers for Paid Options */}
                          <motion.div 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="space-y-8 pt-4 border-t border-black/[0.03]"
                          >
                            {/* Regio Swiper (Only for Radio/TV) */}
                            {calculatorRates[calcType].regional && (
                              <div className="space-y-4">
                                <LabelInstrument className="text-va-black/40 ml-0 tracking-widest text-[11px] font-bold">Regio</LabelInstrument>
                                <div className="flex p-1 bg-va-off-white rounded-2xl border border-black/5 shadow-inner h-[64px]">
                                  <button 
                                    onClick={() => setCalcRegion('national')}
                                    className={cn(
                                      "flex-1 rounded-xl text-[13px] font-bold transition-all",
                                      calcRegion === 'national' ? "bg-white text-primary shadow-md" : "text-va-black/30 hover:text-va-black"
                                    )}
                                  >Nationaal</button>
                                  <button 
                                    onClick={() => setCalcRegion('regional')}
                                    className={cn(
                                      "flex-1 rounded-xl text-[13px] font-bold transition-all",
                                      calcRegion === 'regional' ? "bg-white text-primary shadow-md" : "text-va-black/30 hover:text-va-black"
                                    )}
                                  >Regionaal</button>
                                </div>
                              </div>
                            )}

                            {/* Aantal Spots Swiper */}
                            <div className="space-y-4">
                              <LabelInstrument className="text-va-black/40 ml-0 tracking-widest text-[11px] font-bold">Aantal spots</LabelInstrument>
                              <div className="flex p-1 bg-va-off-white rounded-2xl border border-black/5 shadow-inner h-[64px]">
                                {[1, 2, 3, 4, 5].map((num) => (
                                  <button
                                    key={num}
                                    onClick={() => setCalcSpots(num)}
                                    className={cn(
                                      "flex-1 rounded-xl text-[13px] font-bold transition-all",
                                      calcSpots === num ? "bg-white text-primary shadow-md" : "text-va-black/30 hover:text-va-black"
                                    )}
                                  >
                                    {num} {num === 1 ? 'Spot' : 'Spots'}
                                  </button>
                                ))}
                              </div>
                            </div>

                            {/* Licentie Swiper */}
                            <div className="space-y-4">
                              <LabelInstrument className="text-va-black/40 ml-0 tracking-widest text-[11px] font-bold">
                                {calcType === 'podcast' ? 'Duurtijd (Periode)' : 'Duurtijd (Licentie)'}
                              </LabelInstrument>
                              <div className="flex p-1 bg-va-off-white rounded-2xl border border-black/5 shadow-inner h-[64px]">
                                {calcType === 'podcast' ? (
                                  [3, 6, 12].map((months) => (
                                    <button
                                      key={months}
                                      onClick={() => setCalcYears(months / 12)}
                                      className={cn(
                                        "flex-1 rounded-xl text-[13px] font-bold transition-all",
                                        calcYears === months / 12 ? "bg-white text-primary shadow-md" : "text-va-black/30 hover:text-va-black"
                                      )}
                                    >
                                      {months} Maanden
                                    </button>
                                  ))
                                ) : (
                                  [1, 2, 3, 5].map((year) => (
                                    <button
                                      key={year}
                                      onClick={() => setCalcYears(year)}
                                      className={cn(
                                        "flex-1 rounded-xl text-[13px] font-bold transition-all",
                                        calcYears === year ? "bg-white text-primary shadow-md" : "text-va-black/30 hover:text-va-black"
                                      )}
                                    >
                                      {year} {year === 1 ? 'Jaar' : 'Jaar'}
                                    </button>
                                  ))
                                )}
                              </div>
                            </div>
                          </motion.div>
                        </div>
                      )}

                      {/* Conditional Options based on Usage (Video/Telefonie) */}
                      {calcUsage !== 'paid' && (
                        <div className="space-y-6">
                          <div className="bg-va-off-white/50 rounded-[32px] p-8 border border-black/5 shadow-inner">
                            <div className="flex justify-between items-center mb-8">
                              <LabelInstrument className="text-va-black/40 ml-0 tracking-widest text-[11px] font-bold">Hoeveelheid?</LabelInstrument>
                              <div className="px-4 py-2 bg-white rounded-full border border-black/5 shadow-sm flex items-center gap-2">
                                <span className="font-bold text-va-black text-[15px]">{calcWords} woorden</span>
                                <span className="text-va-black/20 text-[13px] font-light">
                                  ({getWpmTime(calcWords)} • ±{Math.ceil(calcWords / 8)} prompts)
                                </span>
                              </div>
                            </div>
                            <div className="space-y-8">
                      <input 
                                type="range" 
                                min={calcUsage === 'telefonie' ? (pricingConfig?.telephonyWordThreshold || 25) : (pricingConfig?.videoWordThreshold || 200)} 
                                max={calcUsage === 'telefonie' ? 1500 : 1000} 
                                step="1"
                                value={calcWords}
                                onChange={(e) => setCalcWords(parseInt(e.target.value))}
                                className="w-full h-1.5 bg-black/5 rounded-lg appearance-none cursor-pointer accent-primary"
                              />
                              <div className="flex items-center gap-4 bg-white rounded-2xl p-1.5 border border-black/5 shadow-sm max-w-xs mx-auto">
                                <button 
                                  onClick={() => setCalcWords(Math.max(calcUsage === 'telefonie' ? (pricingConfig?.telephonyWordThreshold || 25) : (pricingConfig?.videoWordThreshold || 200), calcWords - 25))}
                                  className="w-12 h-12 rounded-xl bg-va-off-white flex items-center justify-center hover:bg-primary hover:text-white transition-all text-va-black/40 font-bold text-xl"
                                >-</button>
                                <div className="flex-1 text-center">
                                  <span className="font-bold text-2xl text-primary">{calcWords}</span>
                                </div>
                                <button 
                                  onClick={() => setCalcWords(calcWords + 25)}
                                  className="w-12 h-12 rounded-xl bg-va-off-white flex items-center justify-center hover:bg-primary hover:text-white transition-all text-va-black/40 font-bold text-xl"
                                >+</button>
                              </div>
                            </div>
                          </div>

                          {calcUsage === 'telefonie' && (
                            <div className="space-y-4 pt-4">
                              <LabelInstrument className="text-va-black/40 ml-0 tracking-widest text-[11px] font-bold uppercase">Extra Opties</LabelInstrument>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <button 
                                  onClick={() => setCalcMusic(!calcMusic)}
                                  className={cn(
                                    "p-6 rounded-[24px] border transition-all duration-500 flex items-center justify-between group",
                                    calcMusic 
                                      ? "border-primary/20 bg-primary/5 shadow-aura-sm" 
                                      : "border-black/5 bg-va-off-white/50 hover:border-black/10"
                                  )}
                                >
                                    <div className="flex items-center gap-4">
                                      <div className={cn(
                                        "w-10 h-10 rounded-xl flex items-center justify-center transition-colors",
                                        calcMusic ? "bg-primary text-white" : "bg-white text-va-black/20 shadow-sm border border-black/5"
                                      )}>
                                        <Music size={20} strokeWidth={1.5} />
                                      </div>
                                      <div className="text-left">
                                        <span className={cn("font-bold text-[15px] block", calcMusic ? "text-va-black" : "text-va-black/40")}>Wachtmuziek</span>
                                        <span className="text-[11px] text-va-black/20 font-medium tracking-widest uppercase">+ €59</span>
                                      </div>
                                    </div>
                                  <div className={cn(
                                    "w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all",
                                    calcMusic ? "border-primary bg-primary text-white" : "border-black/10 bg-white"
                                  )}>
                                    {calcMusic && <CheckCircle2 size={14} />}
                                  </div>
                                </button>

                                <button 
                                  onClick={() => setCalcLive(!calcLive)}
                                  className={cn(
                                    "p-6 rounded-[24px] border transition-all duration-500 flex items-center justify-between group",
                                    calcLive 
                                      ? "border-primary/20 bg-primary/5 shadow-aura-sm" 
                                      : "border-black/5 bg-va-off-white/50 hover:border-black/10"
                                  )}
                                >
                                    <div className="flex items-center gap-4">
                                      <div className={cn(
                                        "w-10 h-10 rounded-xl flex items-center justify-center transition-colors",
                                        calcLive ? "bg-primary text-white" : "bg-white text-va-black/20 shadow-sm border border-black/5"
                                      )}>
                                        <Zap size={20} strokeWidth={1.5} />
                                      </div>
                                      <div className="text-left">
                                        <span className={cn("font-bold text-[15px] block", calcLive ? "text-va-black" : "text-va-black/40")}>Live Regie</span>
                                        <span className="text-[11px] text-va-black/20 font-medium tracking-widest uppercase">
                                          + €{artistData?.rates?.GLOBAL?.live_regie || 0}
                                        </span>
                                      </div>
                                    </div>
                                  <div className={cn(
                                    "w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all",
                                    calcLive ? "border-primary bg-primary text-white" : "border-black/10 bg-white"
                                  )}>
                                    {calcLive && <CheckCircle2 size={14} />}
                                  </div>
                                </button>
                              </div>
                            </div>
                          )}

                          {calcUsage !== 'telefonie' && (
                            <div className="pt-4">
                              <LabelInstrument className="text-va-black/40 ml-0 tracking-widest text-[11px] font-bold uppercase mb-4 block">Extra Opties</LabelInstrument>
                              <button 
                                onClick={() => setCalcLive(!calcLive)}
                                className={cn(
                                  "w-full p-6 rounded-[24px] border transition-all duration-500 flex items-center justify-between group",
                                  calcLive 
                                    ? "border-primary/20 bg-primary/5 shadow-aura-sm" 
                                    : "border-black/5 bg-va-off-white/50 hover:border-black/10"
                                )}
                              >
                                <div className="flex items-center gap-4">
                                  <div className={cn(
                                    "w-10 h-10 rounded-xl flex items-center justify-center transition-colors",
                                    calcLive ? "bg-primary text-white" : "bg-white text-va-black/20 shadow-sm border border-black/5"
                                  )}>
                                    <Zap size={20} strokeWidth={1.5} />
                                  </div>
                                  <div className="text-left">
                                    <span className={cn("font-bold text-[15px] block", calcLive ? "text-va-black" : "text-va-black/40")}>Live Regie (Zoom/Teams)</span>
                                    <span className="text-[11px] text-va-black/20 font-medium tracking-widest uppercase">
                                      Regisseer de stem live tijdens de opname (+ €{artistData?.rates?.GLOBAL?.live_regie || 0})
                                    </span>
                                  </div>
                                </div>
                                <div className={cn(
                                  "w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all",
                                  calcLive ? "border-primary bg-primary text-white" : "border-black/10 bg-white"
                                )}>
                                  {calcLive && <CheckCircle2 size={14} />}
                                </div>
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                  </div>

                  <div className="pt-10 border-t border-black/[0.03] flex flex-col md:flex-row items-center justify-between gap-8">
                    <div className="text-center md:text-left">
                      <TextInstrument className="text-va-black/30 text-[13px] tracking-widest font-bold mb-1">Totaalprijs (excl. BTW)</TextInstrument>
                      <div className="text-6xl font-light tracking-tighter text-primary">
                        €{calculateTotal()}
                      </div>
                    </div>
                    
                    <ButtonInstrument 
                      as={Link}
                      href={getPortfolioHref('/bestellen')}
                      className="va-btn-pro !bg-va-black !text-white !rounded-2xl px-10 py-6 text-lg shadow-xl hover:scale-105 transition-transform"
                    >
                      Bestel nu online
                      <ArrowRight size={20} className="ml-2" />
                    </ButtonInstrument>
                  </div>
                </div>

                <TextInstrument className="relative z-10 mt-8 text-center text-va-black/20 text-[11px] font-light italic">
                  {calcUsage === 'paid' ? (
                    <>De opnamekosten (€{pricingConfig?.basePrice / 100 || 199}) zijn slechts één keer verrekend. De buyout is berekend per eenheid (jaar of 3 maanden).</>
                  ) : calcUsage === 'unpaid' ? (
                    <>Inclusief studio-opname (€{pricingConfig?.videoBasePrice / 100 || 249}) en onbeperkt gebruiksrecht. {calcWords > (pricingConfig?.videoWordThreshold || 200) && `Toeslag toegepast voor de extra lengte boven ${pricingConfig?.videoWordThreshold || 200} woorden.`}</>
                  ) : (
                    <>Transparante prijsberekening voor telefonie. {calcWords > (pricingConfig?.telephonyWordThreshold || 25) && "Inclusief eenmalige opstart- en verwerkingskosten."}</>
                  )}
                </TextInstrument>
              </div>

              {/* Right: Simple Explanation (Integrated & Dynamic) */}
              <div className="lg:col-span-5 p-12 bg-va-off-white/50 space-y-10">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={calcUsage}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.5, ease: "easeInOut" }}
                    className="space-y-10"
                  >
                    <div className="space-y-2">
                      <HeadingInstrument level={2} className="text-3xl font-light tracking-tight text-va-black">
                        {usageSteps.title.split(' ').map((word, i) => 
                          word.toLowerCase() === 'prijs?' ? <span key={`title-${i}`} className="text-primary italic"> {word}</span> : i === 0 ? word : ` ${word}`
                        )}
                      </HeadingInstrument>
                      <TextInstrument className="text-[13px] text-va-black/30 font-bold tracking-widest">
                        {usageSteps.subtitle}
                      </TextInstrument>
                    </div>
                    
                    <div className="space-y-8">
                      {usageSteps.steps.map((step) => (
                        <div key={step.num} className="flex gap-6">
                          <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0 font-bold border border-primary/10">
                            {step.num}
                          </div>
                          <div>
                            <TextInstrument className="font-bold text-va-black mb-1">{step.title}</TextInstrument>
                            <TextInstrument className="text-[14px] text-va-black/60 font-light leading-relaxed">
                              {step.desc}
                            </TextInstrument>
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                </AnimatePresence>

                <div className="pt-8 border-t border-black/[0.03] space-y-6">
                  {calcUsage === 'telefonie' && (
                    <div className="p-4 bg-white rounded-2xl border border-black/5 shadow-sm">
                      <TextInstrument className="text-[12px] font-bold text-va-black/40 tracking-widest mb-1">Advertentie of Video?</TextInstrument>
                      <TextInstrument className="text-[13px] text-va-black/60 font-light">
                        Voor commercials en bedrijfsvideo&apos;s gelden andere tarieven. Schakel bovenaan naar de juiste categorie voor een berekening.
                      </TextInstrument>
                    </div>
                  )}
                  <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-full border border-black/5 w-fit shadow-sm">
                    <ShieldCheck size={14} className="text-green-500" />
                    <TextInstrument className="text-[11px] font-bold text-va-black/40 tracking-widest">
                      Veilig via <a href="https://voices.be" target="_blank" rel="noopener noreferrer" className="text-va-black hover:text-primary transition-colors">Voices.be</a>
                    </TextInstrument>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </ContainerInstrument>
      </SectionInstrument>

      {/* Final CTA */}
      <SectionInstrument className="py-64 bg-white">
        <ContainerInstrument className="max-w-4xl mx-auto px-6 text-center">
          <HeadingInstrument level={2} className="text-7xl md:text-9xl font-extralight text-va-black tracking-tighter leading-[0.85] mb-16">
            Klaar voor je <br />
            <span className="text-primary/40 italic font-light">project?</span>
          </HeadingInstrument>
          <div className="flex flex-col md:flex-row items-center justify-center gap-12">
            <ButtonInstrument 
              as={Link}
              href={getPortfolioHref('/bestellen')}
              className="va-btn-pro !rounded-[10px] px-20 py-8 text-xl shadow-aura-lg hover:scale-105 transition-transform duration-500"
            >
              Start je project
            </ButtonInstrument>
            <a href="tel:+32475123456" className="text-va-black/20 hover:text-primary transition-colors font-bold tracking-widest text-[13px]">
              Bel direct: +32 475 12 34 56
            </a>
          </div>
        </ContainerInstrument>
      </SectionInstrument>
    </PageWrapperInstrument>
  );
}
