"use client";

import { useTranslation } from "@/contexts/TranslationContext";
import { 
  ButtonInstrument, 
  ContainerInstrument, 
  HeadingInstrument, 
  TextInstrument,
  LabelInstrument
} from "@/components/ui/LayoutInstruments";
import Image from "next/image";
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
import { SlimmeKassa } from "@/lib/engines/pricing-engine";
import { useSonicDNA } from '@/lib/engines/sonic-dna';

interface AgencyCalculatorProps {
  initialJourney?: "telefonie" | "unpaid" | "paid";
  actors?: any[];
  pricingConfig?: any;
  selectedLanguageId?: number | null;
  onJourneyChange?: (journey: "telefonie" | "unpaid" | "paid") => void;
  // Pagination props for the integrated table
  isLoading?: boolean;
  currentPage?: number;
  totalPages?: number;
  onPageChange?: (page: number) => void;
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
  onJourneyChange,
  isLoading = false,
  currentPage = 1,
  totalPages = 1,
  onPageChange
}: AgencyCalculatorProps) => {
  const { t, language, market } = useTranslation();
  const router = useRouter();
  const { playClick } = useSonicDNA();
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
  }, [initialJourney, calcUsage]);

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
      label: t('common.webvideo', "Webvideo"), 
      sub: t('common.webvideo.sub', "Corporate & Web"),
      icon: Video,
      usage: "unpaid",
      national: (pricingConfig?.videoBasePrice / 100) || pricingConfig?.unpaid_base || 0
    },
    social: { 
      label: t('common.social_ad', "Social Ad"), 
      sub: t('common.social_ad.sub', "Social Ads"),
      icon: Megaphone,
      usage: "paid",
      national: ((pricingConfig?.videoBasePrice / 100) || pricingConfig?.unpaid_base || 0) + 50
    },
    radio: { 
      label: t('common.radio', "Radio"), 
      sub: t('common.radio.sub', "Radio Ads"),
      icon: Radio,
      usage: "paid",
      national: ((pricingConfig?.basePrice / 100) || pricingConfig?.entry_price_base || 0) + 150,
      regional: ((pricingConfig?.basePrice / 100) || pricingConfig?.entry_price_base || 0)
    },
    tv: { 
      label: t('common.tv_ad', "TV Ad"), 
      sub: t('common.tv_ad.sub', "TV Ads"),
      icon: Tv,
      usage: "paid",
      national: ((pricingConfig?.basePrice / 100) || pricingConfig?.entry_price_base || 0) + 250,
      regional: ((pricingConfig?.basePrice / 100) || pricingConfig?.entry_price_base || 0) + 50
    },
    podcast: { 
      label: t('common.podcast_ad', "Podcast Ad"), 
      sub: t('common.podcast_ad.sub', "Pre-roll"),
      icon: Mic2,
      usage: "paid",
      national: (pricingConfig?.videoBasePrice / 100) || pricingConfig?.unpaid_base || 0
    },
    ivr: { 
      label: t('common.telephony', "Telefoon"), 
      sub: t('common.telephony.sub', "Voicemail & IVR"),
      icon: Phone,
      usage: "telefonie",
      national: (pricingConfig?.telephonyBasePrice / 100) || pricingConfig?.ivr_base || 0
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
      music: { asBackground: calcMusic, asHoldMusic: calcMusic },
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
    const telephonyBase = (config.telephonyBasePrice / 100) || config.ivr_base || 0;
    const videoBase = (config.videoPrice / 100) || config.unpaid_base || 0;
    const currentBsf = (config.basePrice / 100) || config.entry_price_base || 0;
    const liveSurcharge = (config.liveSessionSurcharge / 100) || config.live_regie || 0;

    const isFr = language.startsWith('fr');
    const isEn = language.startsWith('en');

    switch (calcUsage) {
      case 'telefonie':
        return {
          title: t('calculator.telephony.title', isFr ? 'Comment fonctionne le prix?' : isEn ? 'How does the price work?' : "Hoe werkt de prijs?"),
          subtitle: t('calculator.telephony.subtitle', isFr ? 'POUR LA TÉLÉPHONIE & IVR' : isEn ? 'FOR TELEPHONY & IVR' : "VOOR TELEFONIE & IVR"),
          steps: [
            { num: 1, title: t('calculator.telephony.step1.title', isFr ? 'La Base' : isEn ? 'The Base' : "De Basis"), desc: t('calculator.telephony.step1.desc', isFr ? `Pour toutes les voix sur ${market.name}, le même tarif de départ fixe de €${telephonyBase} s'applique pour de les premiers ${config.telephonyWordThreshold || 25} mots.` : isEn ? `For all voices on ${market.name}, the same fixed starting rate of €${telephonyBase} applies for the first ${config.telephonyWordThreshold || 25} words.` : `Voor alle stemmen op ${market.name} geldt hetzelfde vaste starttarief van €${telephonyBase} voor de eerste ${config.telephonyWordThreshold || 25} woorden.`, { price: telephonyBase, words: config.telephonyWordThreshold || 25 }) },
            { num: 2, title: t('calculator.telephony.step2.title', isFr ? 'Volume' : isEn ? 'Volume' : "Volume"), desc: t('calculator.telephony.step2.desc', isFr ? "En plus de cela, vous payez un prix transparent par message. Plus il y a de messages, plus c'est avantageux." : isEn ? "On top of that, you pay a transparent price per prompt. The more prompts, the more advantageous." : "Daarbovenop betaal je een transparante prijs per prompt. Hoe meer prompts, hoe voordeliger.") },
            { num: 3, title: t('calculator.telephony.step3.title', isFr ? 'Multilingue' : isEn ? 'Multilingual' : "Meertalig"), desc: t('calculator.telephony.step3.desc', isFr ? "Nos voix peuvent être utilisées dans plusieurs langues pour een expérience de marque cohérente." : isEn ? "Our voices can be used in multiple languages for a consistent brand experience." : "Onze stemmen zijn meertalig inzetbaar voor een consistente merkbeleving.") }
          ]
        };
      case 'paid':
        return {
          title: t('calculator.paid.title', isFr ? 'Comment fonctionne le prix?' : isEn ? 'How does the price work?' : "Hoe werkt de prijs?"),
          subtitle: t('calculator.paid.subtitle', isFr ? 'POUR LES PUBLICITÉS' : isEn ? 'FOR ADVERTISEMENTS' : "VOOR ADVERTENTIES"),
          steps: [
            { num: 1, title: t('calculator.paid.step1.title', isFr ? 'L\'Enregistrement' : isEn ? 'The Recording' : "De Opname"), desc: t('calculator.paid.step1.desc', isFr ? `Pour toutes les voix op ${market.name}, le même tarif fixe de €${currentBsf} s'applique voor le temps de studio. C'est la base de votre session.` : isEn ? `For all voices on ${market.name}, the same fixed rate of €${currentBsf} applies for studio time. This is the basis for your session.` : `Voor alle stemmen op ${market.name} geldt hetzelfde vaste tarief van €${currentBsf} voor de studiotijd. Dit is de basis voor je sessie.`, { price: currentBsf }) },
            { num: 2, title: t('calculator.paid.step2.title', isFr ? 'Le Rachat' : isEn ? 'The Buyout' : "De Buyout"), desc: calcType === 'social' ? t('calculator.paid.step2.desc.social', isFr ? "Rémunération pour l'utilisation sur les réseaux sociaux." : isEn ? "Compensation for use on social media channels." : "Vergoeding voor gebruik op social media kanalen.") : calcType === 'podcast' ? t('calculator.paid.step2.desc.podcast', isFr ? "Rémunération voor le pré-roll of le sponsoring in de podcasts." : isEn ? "Compensation for pre-roll or sponsorship in podcasts." : "Vergoeding voor pre-roll of sponsoring in de podcasts.") : t('calculator.paid.step2.desc.broadcast', isFr ? "Rémunération pour le recht de diffusion à la radio/TV." : isEn ? "Compensation for broadcast rights on radio/TV." : "Vergoeding voor uitzendrecht op radio/TV.") },
            { num: 3, title: t('calculator.paid.step3.title', isFr ? 'Direction Live (Optionnel)' : isEn ? 'Live Direction (Optional)' : "Live Regie (Optioneel)"), desc: t('calculator.paid.step3.desc', isFr ? `Dirigez la voix en direct pendant la session. Le tarif voor cela est déterminé par le comédien voix choisi.` : isEn ? `Direct the voice live during the session. The rate for this is determined by the chosen voice actor.` : `Regisseer de stem live tijdens de sessie. Het tarief hiervoor wordt bepaald door de gekozen stemacteur.`) }
          ]
        };
      default:
        return {
          title: t('calculator.unpaid.title', isFr ? 'Comment fonctionne le prix?' : isEn ? 'How does the price work?' : "Hoe werkt de prijs?"),
          subtitle: t('calculator.unpaid.subtitle', isFr ? 'POUR LES VIDÉOS D\'ENTREPRISE' : isEn ? 'FOR CORPORATE VIDEOS' : "VOOR BEDRIJFSVIDEO'S"),
          steps: [
            { num: 1, title: t('calculator.unpaid.step1.title', isFr ? 'L\'Enregistrement' : isEn ? 'The Recording' : "De Opname"), desc: t('calculator.unpaid.step1.desc', isFr ? `Pour toutes les voix sur ${market.name}, le même tarif fixe de €${videoBase} s'applique voor le temps de studio. C'est la base de votre project.` : isEn ? `For all voices on ${market.name}, the same fixed rate of €${videoBase} applies for studio time. This is the basis for your project.` : `Voor alle stemmen op ${market.name} geldt hetzelfde vaste tarief van €${videoBase} voor de studiotijd. Dit is de basis voor je project.`, { price: videoBase }) },
            { num: 2, title: t('calculator.unpaid.step2.title', isFr ? 'L\'Utilisation' : isEn ? 'The Usage' : "Het Gebruik"), desc: t('calculator.unpaid.step2.desc', isFr ? "Pour les médias non payés, le droit d'utilisation est inclus de manière illimitée." : isEn ? "For unpaid media, the usage right is included indefinitely." : "Voor niet-betaalde media is het gebruiksrecht onbeperkt inbegrepen.") },
            { num: 3, title: t('calculator.unpaid.step3.title', isFr ? 'Qualité' : isEn ? 'Quality' : "Kwaliteit"), desc: t('calculator.unpaid.step3.desc', isFr ? "Vous recevez un enregistrement professionnel en 48kHz, prêt à l'emploi sur tous vos propres canaux." : isEn ? "You receive a professional recording in 48kHz, ready for use in all your own channels." : "Je ontvangt een professionele opname in 48kHz, klaar voor gebruik in al je eigen kanalen.") }
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
                  { id: 'telefonie', label: t('common.telephony', 'Telefonie'), sub: t('common.telephony.sub', 'Voicemail & IVR'), icon: Phone },
                  { id: 'unpaid', label: t('common.video', 'Video'), sub: t('common.video.sub', 'Corporate & Web'), icon: Video },
                  { id: 'paid', label: t('common.commercial', 'Advertentie'), sub: t('common.commercial.sub', 'Radio, TV & Ads'), icon: Megaphone }
                ].map((u) => (
                  <button 
                    key={u.id}
                    onClick={() => {
                      setCalcUsage(u.id as any);
                      if (onJourneyChange) onJourneyChange(u.id as any);
                      if (u.id === 'telefonie') { setCalcType('ivr'); setCalcWords(25); setCalcLive(false); }
                      else if (u.id === 'unpaid') { setCalcType('webvideo'); setCalcWords(200); setCalcLive(false); setCalcMusic(false); }
                      else { setCalcType('social'); setCalcWords(25); setCalcMusic(false); }
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
                    <LabelInstrument className="text-va-black/40 ml-0 tracking-[0.2em] text-[11px] font-bold uppercase">
                      <VoiceglotText translationKey="common.choose_medium" defaultText="Kies je medium" />
                    </LabelInstrument>
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
                            <span className={cn("font-bold text-[13px] block leading-tight", calcType === key ? "text-va-black" : "text-va-black/40")}>
                              <VoiceglotText translationKey={`common.media.${key}`} defaultText={val.label} />
                            </span>
                            <span className="text-[9px] text-va-black/20 font-medium tracking-widest block mt-1 uppercase">
                              <VoiceglotText translationKey={`common.media.${key}.sub`} defaultText={val.sub} />
                            </span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Spots Grid */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <LabelInstrument className="text-va-black/40 ml-0 tracking-[0.2em] text-[11px] font-bold uppercase">
                        <VoiceglotText translationKey="common.spots_count" defaultText="Aantal spots" />
                      </LabelInstrument>
                    </div>
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
                          {num} {num === 1 ? t('common.spot', 'Spot') : t('common.spots', 'Spots')}
                        </button>
                      ))}
                    </div>
                    <TextInstrument className="text-[10px] text-va-black/30 leading-relaxed italic px-1">
                      <VoiceglotText translationKey="calculator.spots_info" defaultText="Een campagne bestaat meestal uit 1 hoofdspot met variaties (vb. 30s, 20s en 6s) of verschillende call-to-actions. Elke variatie telt als een aparte spot." />
                    </TextInstrument>
                  </div>

                  {/* Duration Grid */}
                  <div className="space-y-4">
                    <LabelInstrument className="text-va-black/40 ml-0 tracking-[0.2em] text-[11px] font-bold uppercase">
                      {calcType === 'podcast' ? <VoiceglotText translationKey="common.duration_period" defaultText="Duurtijd (Periode)" /> : <VoiceglotText translationKey="common.duration_license" defaultText="Duurtijd (Licentie)" />}
                    </LabelInstrument>
                    <div className="flex p-1 bg-white rounded-2xl border border-black/5 shadow-sm h-[64px]">
                      {calcType === 'podcast' ? [3, 6, 12].map((m) => (
                        <button key={m} onClick={() => setCalcYears(m / 12)} className={cn("flex-1 rounded-xl text-[13px] font-bold transition-all", calcYears === m / 12 ? "bg-va-off-white text-primary shadow-inner" : "text-va-black/30 hover:text-va-black")}>
                          {m} <VoiceglotText translationKey="common.months" defaultText="Maanden" />
                        </button>
                      )) : [1, 2, 3, 5].map((y) => (
                        <button key={y} onClick={() => setCalcYears(y)} className={cn("flex-1 rounded-xl text-[13px] font-bold transition-all", calcYears === y ? "bg-va-off-white text-primary shadow-inner" : "text-va-black/30 hover:text-va-black")}>
                          {y} {y === 1 ? t('common.year', 'Jaar') : t('common.years', 'Jaar')}
                        </button>
                      ))}
                    </div>
                    <TextInstrument className="text-[10px] text-va-black/30 leading-relaxed italic px-1">
                      <VoiceglotText translationKey="calculator.duration_info" defaultText="De periode waarin de advertentie actief gepusht wordt (met mediabudget) op radio, TV of online. Na deze termijn kan de licentie eenvoudig worden verlengd." />
                    </TextInstrument>
                  </div>
                </div>
              ) : (
                /* 3. Word Slider Mandaat */
                <div className="space-y-8">
                  <div className="bg-white rounded-[32px] p-8 border border-black/5 shadow-aura">
                    <div className="flex justify-between items-center mb-8">
                      <LabelInstrument className="text-va-black/40 ml-0 tracking-[0.2em] text-[11px] font-bold uppercase">
                        <VoiceglotText translationKey="common.quantity" defaultText="Hoeveelheid?" />
                      </LabelInstrument>
                      <div className="px-4 py-2 bg-va-off-white rounded-full border border-black/5 shadow-inner flex items-center gap-2">
                        <span className="font-bold text-primary text-[15px]">{calcWords} <VoiceglotText translationKey="common.words" defaultText="woorden" /></span>
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

              {/* 4. Extra Options (Live Regie / Wachtmuziek) */}
              {calcUsage !== 'unpaid' && (
                <div className="pt-8 border-t border-black/5 space-y-4">
                  <LabelInstrument className="text-va-black/40 ml-0 tracking-[0.2em] text-[11px] font-bold uppercase">
                    <VoiceglotText translationKey="common.extra_options" defaultText="Extra Opties" />
                  </LabelInstrument>
                  
                  {calcUsage === 'paid' ? (
                    <div className="flex items-center justify-between p-4 bg-white rounded-2xl border border-black/5 shadow-sm hover:border-primary/20 transition-all group">
                      <div className="flex items-center gap-4">
                        <div className={cn(
                          "w-10 h-10 rounded-xl flex items-center justify-center transition-colors",
                          calcLive ? "bg-primary text-white" : "bg-va-off-white text-va-black/20"
                        )}>
                          <Mic2 size={20} strokeWidth={1.5} />
                        </div>
                        <div>
                          <span className={cn("font-bold text-[14px] block leading-tight", calcLive ? "text-va-black" : "text-va-black/40")}>
                            <VoiceglotText translationKey="common.live_direction" defaultText="Live Regie" />
                          </span>
                          <span className="text-[10px] text-va-black/20 font-medium tracking-widest block mt-1 uppercase">
                            <VoiceglotText translationKey="common.live_direction_desc" defaultText="Sessie volgen via Zoom/Teams" />
                          </span>
                        </div>
                      </div>
                      <button 
                        onClick={() => setCalcLive(!calcLive)}
                        className={cn(
                          "w-12 h-6 rounded-full relative transition-all duration-300",
                          calcLive ? "bg-primary" : "bg-black/10"
                        )}
                      >
                        <motion.div 
                          animate={{ x: calcLive ? 24 : 4 }}
                          className="absolute top-1 left-0 w-4 h-4 bg-white rounded-full shadow-sm"
                        />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between p-4 bg-white rounded-2xl border border-black/5 shadow-sm hover:border-primary/20 transition-all group">
                      <div className="flex items-center gap-4">
                        <div className={cn(
                          "w-10 h-10 rounded-xl flex items-center justify-center transition-colors",
                          calcMusic ? "bg-primary text-white" : "bg-va-off-white text-va-black/20"
                        )}>
                          <Music size={20} strokeWidth={1.5} />
                        </div>
                        <div>
                          <span className={cn("font-bold text-[14px] block leading-tight", calcMusic ? "text-va-black" : "text-va-black/40")}>
                            <VoiceglotText translationKey="common.hold_music" defaultText="Wachtmuziek" />
                          </span>
                          <span className="text-[10px] text-va-black/20 font-medium tracking-widest block mt-1 uppercase">
                            <VoiceglotText translationKey="common.hold_music_desc" defaultText="Inclusief licentie & mix (+ €59)" />
                          </span>
                        </div>
                      </div>
                      <button 
                        onClick={() => setCalcMusic(!calcMusic)}
                        className={cn(
                          "w-12 h-6 rounded-full relative transition-all duration-300",
                          calcMusic ? "bg-primary" : "bg-black/10"
                        )}
                      >
                        <motion.div 
                          animate={{ x: calcMusic ? 24 : 4 }}
                          className="absolute top-1 left-0 w-4 h-4 bg-white rounded-full shadow-sm"
                        />
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* 5. Price & CTA (Telephony & Video only) */}
            {(calcUsage === 'telefonie' || calcUsage === 'unpaid') && (
              <div className="pt-10 border-t border-black/[0.03] flex flex-col md:flex-row items-center justify-between gap-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                <div className="text-center md:text-left">
                  <TextInstrument className="text-va-black/30 text-[11px] tracking-[0.2em] font-bold mb-1 uppercase">
                    <VoiceglotText translationKey="common.total_excl_vat" defaultText="Indicatie Totaalprijs (excl. BTW)" />
                  </TextInstrument>
                  <div className="text-6xl font-extralight tracking-tighter text-va-black">
                    €{calculateTotal(true)}
                  </div>
                </div>
                <ButtonInstrument 
                  onClick={() => {
                    playClick('pro');
                    const params = new URLSearchParams();
                    params.set('usage', calcUsage);
                    if (calcUsage === 'paid') params.set('medium', calcType);
                    router.push(`/agency?${params.toString()}`);
                  }} 
                  className="va-btn-pro !bg-va-black !text-white !rounded-2xl px-10 py-6 text-lg shadow-xl hover:scale-105 transition-transform flex items-center gap-3"
                >
                  <VoiceglotText translationKey="action.view_all_voices" defaultText="Bekijk alle stemmen" /> <ArrowRight size={20} />
                </ButtonInstrument>
              </div>
            )}

            {/* 6. Integrated Actor Rate Table (v2.47: Moved from page.tsx) */}
            <div className="pt-10 border-t border-black/[0.03] space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
              <div className="flex items-center justify-between">
                <TextInstrument className="text-va-black/30 text-[11px] tracking-[0.2em] font-bold uppercase">
                  {calcUsage === 'paid' ? <VoiceglotText translationKey="calculator.rates_per_actor" defaultText="Tarieven per stemacteur (excl. BTW)" /> : <VoiceglotText translationKey="calculator.available_actors" defaultText="Beschikbare stemacteurs" />}
                </TextInstrument>
                <button 
                  onClick={() => {
                    playClick('soft');
                    const params = new URLSearchParams();
                    params.set('usage', calcUsage);
                    if (calcUsage === 'paid') params.set('medium', calcType);
                    router.push(`/agency?${params.toString()}`);
                  }} 
                  className="text-[11px] font-bold text-primary uppercase tracking-widest hover:opacity-70 transition-opacity"
                >
                  <VoiceglotText translationKey="common.view_all" defaultText="Bekijk alle" />
                </button>
              </div>
              
              <div className="bg-white rounded-[24px] border border-black/5 overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-black/5 bg-va-off-white/50">
                        <th className="px-6 py-4 text-[10px] font-bold text-va-black/30 uppercase tracking-[0.2em]">
                          <VoiceglotText translationKey="common.voice_actor" defaultText="Stemacteur" />
                        </th>
                        {calcUsage === 'paid' ? (
                          <th className="px-6 py-4 text-[10px] font-bold text-va-black/30 uppercase tracking-[0.2em]">
                            <VoiceglotText translationKey="common.total_price" defaultText="Totaalprijs" />
                          </th>
                        ) : calcUsage === 'unpaid' ? (
                          <th className="px-6 py-4 text-[10px] font-bold text-va-black/30 uppercase tracking-[0.2em]">
                            <VoiceglotText translationKey="common.base_price" defaultText="Basisprijs" />
                          </th>
                        ) : (
                          <th className="px-6 py-4 text-[10px] font-bold text-va-black/30 uppercase tracking-[0.2em]">
                            <VoiceglotText translationKey="common.starting_rate" defaultText="Starttarief" />
                          </th>
                        )}
                        <th className="px-6 py-4"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-black/[0.03]">
                      {isLoading ? (
                        <tr>
                          <td colSpan={3} className="px-6 py-12 text-center">
                            <div className="flex flex-col items-center gap-3">
                              <div className="w-6 h-6 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
                              <span className="text-[11px] font-bold text-va-black/20 uppercase tracking-widest">
                                <VoiceglotText translationKey="common.loading" defaultText="Laden..." />
                              </span>
                            </div>
                          </td>
                        </tr>
                      ) : actors.length > 0 ? (
                        actors.map((a) => (
                          <tr key={a.id} className="group hover:bg-primary/[0.01] transition-colors">
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <div className="relative w-10 h-10 rounded-full overflow-hidden bg-va-off-white border border-black/5">
                                  {a.photo_url ? (
                                    <Image 
                                      src={a.photo_url.startsWith('http') || a.photo_url.startsWith('/') ? a.photo_url : `/api/proxy/?path=${encodeURIComponent(a.photo_url)}`} 
                                      alt={a.display_name} 
                                      fill 
                                      className="object-cover" 
                                    />
                                  ) : (
                                    <div className="w-full h-full flex items-center justify-center text-va-black/20 font-bold">{a.display_name?.[0]}</div>
                                  )}
                                </div>
                                <div>
                                  <div className="text-[14px] font-bold text-va-black">{a.display_name}</div>
                                  <div className="text-[10px] text-va-black/40 font-medium uppercase tracking-widest">
                                    <VoiceglotText translationKey={`common.language.${a.native_lang}`} defaultText={a.native_lang_label || a.native_lang} noTranslate={true} />
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="text-right md:text-left">
                                <div className="text-xl font-extralight tracking-tighter text-va-black">
                                  {calculateTotal(true, a) === '0.00' ? (
                                    <span className="text-[13px] font-bold text-va-black/20 uppercase tracking-widest italic">
                                      <VoiceglotText translationKey="common.price_on_request" defaultText="Prijs op aanvraag" />
                                    </span>
                                  ) : (
                                    <>€{calculateTotal(true, a)}</>
                                  )}
                                </div>
                                <div className="text-[9px] text-va-black/30 font-bold uppercase tracking-widest">
                                {calcLive ? (
                                  <span className="text-primary flex items-center gap-1">
                                    <CheckCircle2 size={8} /> {parseFloat(a.price_live_regie || '0') > 0 ? t('common.incl_direction', `Incl. Regie`) : t('common.direction_free', "Regie Gratis")}
                                  </span>
                                ) : calcMusic ? (
                                  <span className="text-primary flex items-center gap-1">
                                    <CheckCircle2 size={8} /> <VoiceglotText translationKey="common.incl_hold_music" defaultText="Incl. Wachtmuziek" />
                                  </span>
                                ) : (calculateTotal(true, a) === '0.00' ? null : (calcUsage === 'paid' ? t('common.all_in', "All-in") : t('common.indication', "Indicatie")))}
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-right">
                              <ButtonInstrument 
                                variant="outline" 
                                size="sm" 
                                className="rounded-full !px-4 !py-2 text-[10px] font-bold uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all"
                                onClick={() => {
                                  playClick('pro');
                                  router.push(`/agency?search=${a.display_name}&usage=${calcUsage}`);
                                }}
                              >
                                <VoiceglotText translationKey="action.book" defaultText="Boek" />
                              </ButtonInstrument>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={3} className="px-6 py-12 text-center text-va-black/20 italic text-[13px]">
                            <VoiceglotText translationKey="common.no_actors_found" defaultText="Geen stemacteurs gevonden." />
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
                
                {/* PAGINATION CONTROLS */}
                {totalPages > 1 && (
                  <div className="px-6 py-4 border-t border-black/5 flex items-center justify-between bg-va-off-white/30">
                    <TextInstrument className="text-[10px] font-bold text-va-black/30 uppercase tracking-widest">
                      {currentPage} / {totalPages}
                    </TextInstrument>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => { onPageChange?.(Math.max(1, currentPage - 1)); playClick('soft'); }}
                        disabled={currentPage === 1}
                        className="p-2 rounded-lg bg-white border border-black/5 hover:border-primary/20 disabled:opacity-30 transition-all"
                      >
                        <Minus size={12} />
                      </button>
                      <button 
                        onClick={() => { onPageChange?.(Math.min(totalPages, currentPage + 1)); playClick('soft'); }}
                        disabled={currentPage === totalPages}
                        className="p-2 rounded-lg bg-white border border-black/5 hover:border-primary/20 disabled:opacity-30 transition-all"
                      >
                        <Plus size={12} />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Explanation (5/12) */}
        <div className="lg:col-span-5 p-12 bg-white space-y-12">
          <div className="space-y-2">
            <HeadingInstrument level={2} className="text-4xl font-light tracking-tight text-va-black">
              <VoiceglotText 
                translationKey="calculator.how_it_works.title_v3" 
                defaultText="Hoe werkt de *prijs?*" 
                components={{
                  highlight: (children) => <span className="text-primary italic">{children}</span>
                }}
              />
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
                  t('calculator.paid.footer_note', `De opnamekosten (€${(pricingConfig?.basePrice / 100) || 0}) zijn slechts één keer verrekend. De buyout is berekend per eenheid (jaar of 3 maanden).`, { price: (pricingConfig?.basePrice / 100) || 0 })
                ) : calcUsage === 'unpaid' ? (
                  t('calculator.unpaid.footer_note', `Inclusief studio-opname (€${(pricingConfig?.videoBasePrice / 100) || 0}) en onbeperkt gebruiksrecht. ${calcWords > (pricingConfig?.videoWordThreshold || 200) ? `Toeslag toegepast voor de extra lengte boven ${pricingConfig?.videoWordThreshold || 200} woorden.` : ''}`, { price: (pricingConfig?.videoBasePrice / 100) || 0, threshold: pricingConfig?.videoWordThreshold || 200 })
                ) : (
                  t('calculator.telephony.footer_note', `Transparante prijsberekening voor telefonie. ${calcWords > (pricingConfig?.telephonyWordThreshold || 25) ? "Inclusief eenmalige opstart- en verwerkingskosten." : ""}`, { threshold: pricingConfig?.telephonyWordThreshold || 25 })
                )}
              </TextInstrument>
            <div className="flex items-center gap-3 px-5 py-3 bg-va-off-white rounded-full border border-black/5 w-fit shadow-sm">
              <ShieldCheck size={16} className="text-green-500" />
              <TextInstrument className="text-[11px] font-bold text-va-black/40 tracking-[0.2em] uppercase">
                <VoiceglotText translationKey="common.guaranteed_quality" defaultText={`Gegarandeerde ${market.name} Kwaliteit`} />
              </TextInstrument>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
