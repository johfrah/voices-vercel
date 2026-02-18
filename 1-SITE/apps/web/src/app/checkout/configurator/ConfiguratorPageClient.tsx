"use client";

import { TelephonySmartSuggestions } from '@/components/checkout/TelephonySmartSuggestions';
import { BriefingSelector } from '@/components/studio/BriefingSelector';
import { MusicSelector } from '@/components/studio/MusicSelector';
import { AddToCartEmailModal } from '@/components/checkout/AddToCartEmailModal';
import {
    ButtonInstrument,
    ContainerInstrument,
    HeadingInstrument,
    LabelInstrument,
    SectionInstrument,
    TextInstrument,
} from '@/components/ui/LayoutInstruments';
import { OrderStepsInstrument } from '@/components/ui/OrderStepsInstrument';
import { VoiceCard } from '@/components/ui/VoiceCard';
import { VoiceglotText } from '@/components/ui/VoiceglotText';
import { useCheckout } from '@/contexts/CheckoutContext';
import { useTranslation } from '@/contexts/TranslationContext';
import { JourneyType, useMasterControl } from '@/contexts/VoicesMasterControlContext';
import { PricingEngine } from '@/lib/pricing-engine';
import { useSonicDNA } from '@/lib/sonic-dna';
import { cn } from '@/lib/utils';
import { animate, AnimatePresence, motion } from 'framer-motion';
import {
    Check,
    CheckCircle2,
    ChevronRight,
    Clock,
    Info,
    Megaphone,
    Mic,
    Minus, Music,
    Paperclip,
    Phone,
    Plus,
    Radio,
    ShoppingBag,
    Sparkles,
    Tv,
    Video
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import React, { useEffect, useMemo, useRef, useState } from 'react';

/**
 *  CHRIS-PROTOCOL: Count-Up Component for Pricing
 */
const PriceCountUp = ({ value }: { value: number }) => {
  const [displayValue, setDisplayValue] = useState(value);
  
  useEffect(() => {
    const controls = animate(displayValue, value, {
      duration: 0.8,
      ease: [0.23, 1, 0.32, 1],
      onUpdate: (latest) => setDisplayValue(latest)
    });
    return () => controls.stop();
  }, [value, displayValue]);

  return <span>{PricingEngine.format(displayValue)}</span>;
};

/**
 *  ULTIMATE CONFIGURATOR (2026) - 3 KOLOMMEN MASTERCLASS
 */
export default function ConfiguratorPageClient({ 
  isEmbedded = false, 
  hideMediaSelector = false,
  minimalMode = false
}: { 
  isEmbedded?: boolean,
  hideMediaSelector?: boolean,
  minimalMode?: boolean
}) {
  const { state, updateBriefing, updateUsage, updateMedia, updateSpots, updateYears, updateSpotsDetail, updateYearsDetail, updateLiveSession, updateMusic, updateCountry, setStep, addItem, resetSelection, calculatePricing } = useCheckout();
  
  //  BOB-METHODE: Share Functionality
  const [isSharing, setIsSharing] = useState(false);
  const [shareUrl, setShareUrl] = useState<string | null>(null);

  const handleShare = async () => {
    setIsSharing(true);
    try {
      const res = await fetch('/api/config/token', {
        method: 'POST',
        body: JSON.stringify({
          briefing: state.briefing,
          usage: state.usage,
          media: state.media,
          country: state.country,
          spots: state.spotsDetail || state.spots,
          years: state.yearsDetail || state.years
        })
      });
      const { token } = await res.json();
      
      // Bouw de mooie URL
      const baseUrl = window.location.origin;
      const slug = state.selectedActor?.slug || state.selectedActor?.firstName?.toLowerCase();
      
      const journeyMap: Record<string, string> = {
        'telefonie': 'telefoon',
        'unpaid': 'video',
        'commercial': 'commercial'
      };
      const journey = journeyMap[state.usage] || 'video';
      
      let url = `${baseUrl}/${slug}/${journey}`;
      
      if (state.usage === 'commercial' && state.media?.[0]) {
        const mediumMap: Record<string, string> = {
          'online': 'online',
          'radio_national': 'radio',
          'tv_national': 'tv',
          'podcast': 'podcast'
        };
        const medium = mediumMap[state.media[0]];
        if (medium) url += `/${medium}`;
      }
      
      url += `?t=${token}`;
      
      setShareUrl(url);
      await navigator.clipboard.writeText(url);
      setTimeout(() => setShareUrl(null), 3000);
    } catch (e) {
      console.error("Share failed:", e);
    } finally {
      setIsSharing(false);
    }
  };

  const { state: masterControlState, updateJourney, updateStep } = useMasterControl();
  const sonicDNA = useSonicDNA();
  const playClick = sonicDNA?.playClick;
  const { t } = useTranslation();
  const router = useRouter();
  
  const [localBriefing, setLocalBriefing] = useState(state.briefing);
  const [isAutoSaving, setIsAutoSaving] = useState(false);
  const [addedToCart, setAddedToCart] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [pendingAction, setPendingAction] = useState<'checkout' | 'cart' | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  const { updateCustomer } = useCheckout();

  const handleAddToCartWithEmail = (action: 'checkout' | 'cart') => {
    if (!state.selectedActor || effectiveWordCount === 0) return;
    
    //  CHRIS-PROTOCOL: Persistent email check
    const savedEmail = state.customer.email || localStorage.getItem('voices_customer_email');
    
    // Als e-mail al bekend is, direct doorgaan
    if (savedEmail && savedEmail.includes('@')) {
      if (!state.customer.email) {
        updateCustomer({ email: savedEmail });
      }
      handleAddToCart();
      if (action === 'checkout') {
        //  BOB-METHODE: Direct naar stap 3 (checkout) in de MasterControl
        updateStep('checkout');
        
        // En ook de router redirecten voor de zekerheid/URL
        router.push('/checkout');
      } else {
        // Terug naar overzicht (Agency)
        router.push('/agency');
      }
      return;
    }

    // Anders popup tonen
    setPendingAction(action);
    setShowEmailModal(true);
  };

  const onEmailConfirm = (email: string, nextAction: 'checkout' | 'continue') => {
    updateCustomer({ email });
    localStorage.setItem('voices_customer_email', email);
    handleAddToCart();
    setShowEmailModal(false);

    if (nextAction === 'checkout') {
      //  BOB-METHODE: Direct naar stap 3 (checkout) in de MasterControl
      updateStep('checkout');
      
      if (isEmbedded) {
        //  BOB-METHODE: In SPA mode (Agency) navigeren we naar de echte checkout pagina
        // zodat de URL ook daadwerkelijk /checkout/ wordt.
        router.push('/checkout');
      } else {
        router.push('/checkout');
      }
    } else {
      // Terug naar overzicht
      router.push('/agency');
    }
  };
  
  // AI Assistant State
  const [showAiAssistant, setShowAiAssistant] = useState(false);
  const [showBriefingSelector, setShowBriefingSelector] = useState(false);
  const [aiSuggestion, setAiSuggestion] = useState("");
  const [isAiLoading, setIsAiLoading] = useState(false);
  const suggestionTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Auto-Save Logic
  useEffect(() => {
    const saved = localStorage.getItem('voices_draft_script');
    if (saved && !state.briefing && saved.trim() !== '' && !saved.includes('woord woord')) {
      setLocalBriefing(saved);
      updateBriefing(saved);
    }
  }, [state.briefing, updateBriefing]); // Added missing dependencies

  useEffect(() => {
    setIsAutoSaving(true);
    const timer = setTimeout(() => {
      localStorage.setItem('voices_draft_script', localBriefing);
      updateBriefing(localBriefing);
      setIsAutoSaving(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, [localBriefing, updateBriefing]);

  const lastBriefingRef = useRef(state.briefing);
  useEffect(() => {
    if (state.briefing !== localBriefing && state.briefing !== lastBriefingRef.current) {
      setLocalBriefing(state.briefing);
    }
    lastBriefingRef.current = state.briefing;
  }, [state.briefing, localBriefing]);

  // AI Predictive Logic (Johfrai)
  useEffect(() => {
    if (!showAiAssistant || !localBriefing || localBriefing.length < 5) {
      setAiSuggestion("");
      return;
    }

    if (suggestionTimeoutRef.current) clearTimeout(suggestionTimeoutRef.current);

    suggestionTimeoutRef.current = setTimeout(async () => {
      setIsAiLoading(true);
      try {
        const res = await fetch('/api/johfrai/predictive', {
          method: 'POST',
          body: JSON.stringify({
            text: localBriefing,
            companyName: state.customer.company,
            context: state.usage
          })
        });
        const data = await res.json();
        setAiSuggestion(data.suggestion || "");
      } catch (err) {
        console.error('AI Suggestion Error:', err);
      } finally {
        setIsAiLoading(false);
      }
    }, 800);

    return () => {
      if (suggestionTimeoutRef.current) clearTimeout(suggestionTimeoutRef.current);
    };
  }, [localBriefing, showAiAssistant, state.customer.company, state.usage]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Tab' && aiSuggestion) {
      e.preventDefault();
      const newText = localBriefing + aiSuggestion;
      setLocalBriefing(newText);
      updateBriefing(newText);
      setAiSuggestion("");
      try {
        if (playClick) {
          playClick('pro');
        }
      } catch (err) {
        console.warn('playClick failed:', err);
      }
      return;
    }
  };

  const handleBriefingChange = (val: string) => {
    setLocalBriefing(val);
  };

  const wordCount = useMemo(() => {
    const textWithoutRegie = localBriefing.replace(/\([^)]*\)/g, ' ');
    const words = textWithoutRegie.trim().split(/\s+/).filter(Boolean);
    return words.length;
  }, [localBriefing]);
  
  const promptCount = useMemo(() => {
    if (state.usage !== 'telefonie') return 0;
    const matches = localBriefing.match(/\(([^)]+)\)/g);
    return matches ? matches.length : 0;
  }, [localBriefing, state.usage]);

  const effectiveWordCount = useMemo(() => {
    if (wordCount > 0) return wordCount;
    return masterControlState.filters.words || 0;
  }, [wordCount, masterControlState.filters.words]);

  const estimatedTime = useMemo(() => {
    const seconds = Math.round((effectiveWordCount / 160) * 60);
    return `${Math.floor(seconds / 60)}:${(seconds % 60).toString().padStart(2, '0')}`;
  }, [effectiveWordCount]);

  const scriptPlaceholder = useMemo(() => {
    if (state.usage === 'telefonie') return t('configurator.placeholder.telephony', "Voer hier uw IVR of voicemail teksten in...");
    if (state.usage === 'commercial') return t('configurator.placeholder.commercial', "Voer hier uw commercial script in...");
    return t('configurator.placeholder.general', "Voer hier uw tekst in...");
  }, [state.usage, t]);

  const scriptIntelligence = useMemo(() => {
    if (!localBriefing || localBriefing.length < 10) return null;

    const insights: { type: 'warning' | 'info' | 'success', message: string, action?: string }[] = [];
    const text = localBriefing.toLowerCase();
    
    const telephonyKeywords = ['welkom bij', 'keuzemenu', 'druk 1', 'voicemail', 'openingsuren', 'verbonden met'];
    const commercialKeywords = ['nu verkrijgbaar', 'korting', 'actie', 'tijdelijk', 'alleen vandaag', 'bestel nu'];
    
    const hasTelephonySigns = telephonyKeywords.some(k => text.includes(k));
    const hasCommercialSigns = commercialKeywords.some(k => text.includes(k));

    if (state.usage !== 'telefonie' && hasTelephonySigns) {
      insights.push({
        type: 'warning',
        message: "Dit lijkt op een telefonie-script. Heb je de juiste journey gekozen?",
        action: 'switch_telephony'
      });
    }

    if (state.usage === 'telefonie' && hasCommercialSigns) {
      insights.push({
        type: 'warning',
        message: "Dit script bevat commerciële termen. Is dit een advertentie?",
        action: 'switch_commercial'
      });
    }

    const bracketMatches = localBriefing.match(/\(([^)]+)\)/g) || [];
    const directionKeywords = ['regie', 'aanwijzing', 'stem', 'toon', 'uitspraak', 'pauze', 'fluister', 'enthousiast', 'rustig', 'snel', 'traag'];
    const detectedTitles = bracketMatches.filter(m => {
      const content = m.toLowerCase();
      return !directionKeywords.some(k => content.includes(k));
    }).length;

    if (state.usage === 'commercial') {
      const selectedSpots = Object.values(state.spotsDetail || {}).reduce((a, b) => a + b, 0) || state.spots || 1;
      if (detectedTitles > selectedSpots) {
        insights.push({
          type: 'warning',
          message: `Ik zie ${detectedTitles} verschillende versies (tussen haakjes), maar je hebt ${selectedSpots} ${selectedSpots === 1 ? 'spot' : 'spots'} gekozen.`,
          action: 'check_spots'
        });
      } else if (detectedTitles > 0) {
        insights.push({
          type: 'success',
          message: `Gedetecteerd: ${detectedTitles} audiobestanden via (titels). Dit komt overeen met je selectie.`,
        });
      }
    }

    if (state.usage === 'telefonie' && detectedTitles > 0) {
      insights.push({
        type: 'success',
        message: `Gedetecteerd: ${detectedTitles} verschillende prompts via (titels).`,
      });
    }

    const words = localBriefing.split(/\s+/);
    const difficultWords: string[] = [];
    
    words.forEach((word, i) => {
      const cleanWord = word.replace(/[.,/#!$%^&*;:{}=\-_`~()]/g,"");
      if (cleanWord.length > 3 && /^[A-Z]/.test(cleanWord)) {
        const isStartOfSentence = i === 0 || /[.!?]$/.test(words[i-1]);
        if (!isStartOfSentence) {
          difficultWords.push(cleanWord);
        }
      }
      if (/[0-9]/.test(cleanWord) || /[\\/]/.test(word)) {
        difficultWords.push(word);
      }
    });

    const uniqueDifficult = Array.from(new Set(difficultWords)).slice(0, 3);
    if (uniqueDifficult.length > 0) {
      insights.push({
        type: 'info',
        message: `Namen of jargon gedetecteerd: "${uniqueDifficult.join(', ')}". Voeg eventueel een audio-briefing toe voor de juiste uitspraak.`,
        action: 'add_audio_briefing'
      });
    }

    return insights;
  }, [localBriefing, state.usage, state.spots, state.spotsDetail]);

  const renderHighlightedText = () => {
    if (!localBriefing) return null;
    const parts = localBriefing.split(/(\([^)]*\))/g);
    return parts.map((part, i) => {
      if (part.startsWith('(') && part.endsWith(')')) {
        return (
          <span key={i} className="text-primary italic bg-primary/5 rounded px-1 border border-primary/10">
            {part}
          </span>
        );
      }
      return <span key={i}>{part}</span>;
    });
  };

  const handleUsageSwitch = (usageId: any) => {
    const journeyMap: Record<string, JourneyType> = {
      'telefonie': 'telephony',
      'unpaid': 'video',
      'commercial': 'commercial'
    };

    if (journeyMap[usageId]) {
      updateJourney(journeyMap[usageId]);
    } else {
      updateUsage(usageId);
    }

    if (usageId !== 'commercial') {
      updateSpots(1);
      updateYears(1);
    }
    
    try {
      if (playClick) {
        playClick('pro');
      }
    } catch (err) {
      console.warn('playClick failed:', err);
    }

    setTimeout(() => {
      if (calculatePricing) calculatePricing();
    }, 250);
  };

  const handleMediaToggle = (mediaId: string) => {
    const currentMedia = state.media || [];
    const baseId = mediaId.split('_')[0];
    const existingMedia = currentMedia.find(m => m.startsWith(baseId));
    
    let newMedia: string[];
    if (existingMedia) {
      if (currentMedia.length > 1) {
        newMedia = currentMedia.filter(m => m !== existingMedia);
      } else {
        if (existingMedia === 'online') return;
        newMedia = ['online'];
      }
    } else {
      newMedia = [...currentMedia, mediaId];
    }
    
    updateMedia(newMedia);
    setTimeout(() => {
      if (calculatePricing) calculatePricing();
    }, 100);
  };

  const usageTypes = [
    { id: 'telefonie', label: 'Telefoon', icon: Phone, key: 'journey.telephony', description: 'IVR, Wachtmuziek' },
    { id: 'unpaid', label: 'Video', icon: Video, key: 'journey.video', description: 'Online, Corporate' },
    { id: 'commercial', label: 'Commercial', icon: Megaphone, key: 'journey.commercial', description: 'Radio, TV, Ads' },
  ];

  const commercialMediaOptions = [
    { id: 'online', label: 'Online / Social', icon: Video, description: 'Web, Social Media' },
    { id: 'radio_national', label: 'Radio', icon: Radio, description: 'Landelijke Radio', hasRegions: true },
    { id: 'tv_national', label: 'TV', icon: Tv, description: 'Landelijke TV', hasRegions: true },
    { id: 'podcast', label: 'Podcast', icon: Mic, description: 'In-podcast Ads' },
  ];

  const regions = [
    { id: 'Nationaal', label: 'Nationaal' },
    { id: 'Regionaal', label: 'Regionaal' },
    { id: 'Lokaal', label: 'Lokaal' },
  ];

  const countries = [
    { id: 'AL', label: 'Albanië' },
    { id: 'AD', label: 'Andorra' },
    { id: 'AT', label: 'Oostenrijk' },
    { id: 'BY', label: 'Wit-Rusland' },
    { id: 'BE', label: 'België' },
    { id: 'BA', label: 'Bosnië en Herzegovina' },
    { id: 'BG', label: 'Bulgarije' },
    { id: 'HR', label: 'Kroatië' },
    { id: 'CY', label: 'Cyprus' },
    { id: 'CZ', label: 'Tsjechië' },
    { id: 'DK', label: 'Denemarken' },
    { id: 'EE', label: 'Estland' },
    { id: 'FI', label: 'Finland' },
    { id: 'FR', label: 'Frankrijk' },
    { id: 'DE', label: 'Duitsland' },
    { id: 'GR', label: 'Griekenland' },
    { id: 'HU', label: 'Hongarije' },
    { id: 'IS', label: 'IJsland' },
    { id: 'IE', label: 'Ierland' },
    { id: 'IT', label: 'Italië' },
    { id: 'LV', label: 'Letland' },
    { id: 'LI', label: 'Liechtenstein' },
    { id: 'LT', label: 'Litouwen' },
    { id: 'LU', label: 'Luxemburg' },
    { id: 'MT', label: 'Malta' },
    { id: 'MD', label: 'Moldavië' },
    { id: 'MC', label: 'Monaco' },
    { id: 'ME', label: 'Montenegro' },
    { id: 'NL', label: 'Nederland' },
    { id: 'MK', label: 'Noord-Macedonië' },
    { id: 'NO', label: 'Noorwegen' },
    { id: 'PL', label: 'Polen' },
    { id: 'PT', label: 'Portugal' },
    { id: 'RO', label: 'Roemenië' },
    { id: 'SM', label: 'San Marino' },
    { id: 'RS', label: 'Servië' },
    { id: 'SK', label: 'Slowakije' },
    { id: 'SI', label: 'Slovenië' },
    { id: 'ES', label: 'Spanje' },
    { id: 'SE', label: 'Zweden' },
    { id: 'CH', label: 'Zwitserland' },
    { id: 'TR', label: 'Turkije' },
    { id: 'UA', label: 'Oekraïne' },
    { id: 'GB', label: 'Verenigd Koninkrijk' },
    { id: 'VA', label: 'Vaticaanstad' },
  ].sort((a, b) => a.label.localeCompare(b.label));

  const liveRegiePrice = useMemo(() => {
    if (!state.selectedActor) return 99;
    const actorRates = state.selectedActor.rates || state.selectedActor.rates_raw || {};
    const country = Array.isArray(state.country) ? state.country[0] : (state.country || 'BE');
    const countryRates = actorRates[country] || {};
    
    let fee = 0;
    if (countryRates['live_regie'] > 0) fee = parseFloat(countryRates['live_regie']);
    else if (actorRates.price_live_regie > 0) fee = parseFloat(actorRates.price_live_regie);
    else if (actorRates['price_live_regie'] > 0) fee = parseFloat(actorRates['price_live_regie']);
    
    return fee || 99;
  }, [state.selectedActor, state.country]);

  const handleAddToCart = () => {
    if (!state.selectedActor || effectiveWordCount === 0) return;
    const itemId = `voice-${state.selectedActor.id}-${Date.now()}`;

    // KELLY-MANDATE: Store ONLY this item's price, not the cart total.
    // state.pricing.total = cartSubtotal + currentSelection; we need just currentSelection.
    const cartSubtotal = state.items.reduce((sum, i) => sum + (i.pricing?.total ?? i.pricing?.subtotal ?? 0), 0);
    const currentItemPrice = Math.max(0, state.pricing.total - cartSubtotal);

    addItem({
      id: itemId,
      type: 'voice_over',
      actor: state.selectedActor,
      briefing: localBriefing,
      script: localBriefing,
      pronunciation: state.pronunciation,
      usage: state.usage,
      media: state.media,
      country: state.country,
      secondaryLanguages: state.secondaryLanguages,
      spots: state.spotsDetail || state.spots,
      years: state.yearsDetail || state.years,
      liveSession: state.liveSession,
      music: state.music,
      pricing: {
        base: state.pricing.base,
        wordSurcharge: state.pricing.wordSurcharge,
        mediaSurcharge: state.pricing.mediaSurcharge,
        mediaBreakdown: state.pricing.mediaBreakdown,
        musicSurcharge: state.pricing.musicSurcharge,
        radioReadySurcharge: state.pricing.radioReadySurcharge || 0,
        subtotal: currentItemPrice,
        total: currentItemPrice,
      }
    });
    
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 3000);
    return itemId;
  };

  /**
   *  SALLY'S PRICE BLOCK (Refactored for 2026)
   */
  const PriceBlock = () => (
    <ContainerInstrument className="bg-white rounded-[20px] p-8 text-va-black shadow-aura border border-black/[0.03] relative overflow-hidden">
      <div className="space-y-6 relative z-10">
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-black/[0.03] pb-2">
            <span className="text-[11px] font-bold tracking-widest text-va-black/30 uppercase">Opbouw prijs</span>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between text-[14px] items-center">
              <span className="text-va-black/60 font-medium">
                {state.usage === 'commercial' ? (
                  <div className="flex flex-col">
                    <span>Basistarief (Opname)</span>
                    <span className="text-[9px] text-va-black/30 font-light italic -mt-1">Basis Studio Fee (BSF)</span>
                  </div>
                ) : 
                 state.usage === 'telefonie' ? 'Basistarief (Telefonie)' : 
                 'Basistarief (Video)'}
              </span>
              <span className="font-bold text-va-black">{PricingEngine.format(state.pricing.base)}</span>
            </div>
            {state.pricing.wordSurcharge > 0 && (
              <div className="flex justify-between text-[14px] items-center">
                <span className="text-va-black/60 font-medium">
                  {state.usage === 'telefonie' ? (
                    <div className="flex flex-col">
                      <span>Extra prompts ({promptCount - 1})</span>
                      {wordCount > 25 && <span className="text-[9px] text-va-black/30 font-light italic -mt-1">Incl. extra woorden ({wordCount - 25})</span>}
                    </div>
                  ) : 
                   `Extra woorden (${Math.max(0, effectiveWordCount - (state.usage === 'unpaid' ? 200 : 0))})`}
                </span>
                <span className="font-bold text-va-black">+{PricingEngine.format(state.pricing.wordSurcharge)}</span>
              </div>
            )}
            {state.usage === 'commercial' && state.pricing.mediaSurcharge > 0 && (
              <div className="space-y-1.5 pt-1">
                <div className="text-[10px] font-black text-va-black/20 uppercase tracking-widest mb-1">Buyouts & Licenties</div>
                {state.media?.map((mediaId) => {
                  const opt = commercialMediaOptions.find(o => o.id === mediaId);
                  const detail = state.spotsDetail?.[mediaId] || 1;
                  const years = state.yearsDetail?.[mediaId] || 1;
                  const isPodcast = mediaId === 'podcast';
                  
                  let fullLabel = opt?.label || mediaId;
                  if (mediaId.includes('_national')) fullLabel = `TV (Nationaal)`;
                  else if (mediaId.includes('_regional')) fullLabel = `TV (Regionaal)`;
                  else if (mediaId.includes('_local')) fullLabel = `TV (Lokaal)`;
                  else if (mediaId.startsWith('radio_')) {
                    if (mediaId.includes('_national')) fullLabel = `Radio (Nationaal)`;
                    else if (mediaId.includes('_regional')) fullLabel = `Radio (Regionaal)`;
                    else if (mediaId.includes('_local')) fullLabel = `Radio (Lokaal)`;
                  }

                  const breakdown = state.pricing.mediaBreakdown?.[mediaId];
                  const itemPrice = typeof breakdown === 'object' ? breakdown.subtotal : (breakdown || 0);
                  const combinationDiscount = typeof breakdown === 'object' ? breakdown.discount : 0;

                  return (
                    <div key={mediaId} className="space-y-1 pl-3 border-l-2 border-primary/20 bg-primary/[0.02] py-2 pr-2 rounded-r-lg">
                      <div className="flex justify-between text-[13px] items-start">
                        <span className="text-va-black font-medium leading-snug">
                          {fullLabel} <span className="text-[10px] text-va-black/40 block font-normal tracking-wide">
                            {detail}x {detail === 1 ? 'spot' : 'spots'} • {isPodcast ? (
                              years === 0.25 ? "3 maanden" :
                              years === 0.5 ? "6 maanden" :
                              years === 0.75 ? "9 maanden" :
                              `${years} jaar`
                            ) : (
                              years === 1 ? "1 jaar" : `${years} jaar`
                            )}
                          </span>
                        </span>
                        <span className="font-bold text-va-black whitespace-nowrap ml-2">
                          {itemPrice > 0 ? `+${PricingEngine.format(itemPrice)}` : PricingEngine.format(0)}
                        </span>
                      </div>
                      {/* detail > 1 && (
                        <div className="flex justify-between text-[9px] text-green-600 font-medium italic pl-1">
                          <span>Staffelvoordeel ({detail} spots)</span>
                          <span>In prijs verwerkt</span>
                        </div>
                      ) */}
                      {combinationDiscount > 0 && (
                        <div className="flex justify-between text-[10px] text-green-600 font-bold italic pt-1 border-t border-green-600/10">
                          <span>Combinatiekorting</span>
                          <span>-{PricingEngine.format(combinationDiscount)}</span>
                        </div>
                      )}
                    </div>
                  );
                })}
                {state.media && state.media.length > 1 && (
                  <div className="flex justify-between text-[13px] pt-1 mt-1 border-t border-black/[0.03]">
                    <span className="text-va-black/40 font-light">Totaal Buyout</span>
                    <span className="font-medium">+{PricingEngine.format(state.pricing.mediaSurcharge)}</span>
                  </div>
                )}
              </div>
            )}
            {state.pricing.musicSurcharge > 0 && (
              <div className="flex justify-between text-[13px]">
                <span className="text-va-black/40 font-light">Music Mixing</span>
                <span className="font-medium">+{PricingEngine.format(state.pricing.musicSurcharge)}</span>
              </div>
            )}
            {state.liveSession && (
              <div className="flex justify-between text-[13px]">
                <span className="text-va-black/40 font-light">Live Regie</span>
                <span className="font-medium">+{PricingEngine.format(liveRegiePrice)}</span>
              </div>
            )}
          </div>
        </div>
        <div className="space-y-1 pt-4 border-t border-black/[0.03] text-right">
          <div className="text-[10px] font-bold tracking-[0.2em] text-va-black/20 uppercase">Totaal (excl. BTW)</div>
          <div className="text-4xl font-light tracking-tighter text-va-black">
            <PriceCountUp value={state.pricing.total} />
          </div>
          {state.pricing.legalDisclaimer && <div className="text-[10px] text-va-black/40 font-light italic mt-2 leading-tight">{state.pricing.legalDisclaimer}</div>}
        </div>
        <div className="pt-4 space-y-3">
          <ButtonInstrument 
            onClick={() => handleAddToCartWithEmail('checkout')} 
            disabled={!state.selectedActor} 
            className="va-btn-pro w-full !bg-va-black !text-white flex items-center justify-center gap-2 group py-5 text-lg hover:!bg-primary transition-all"
          >
            Bestellen <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
          </ButtonInstrument>
        </div>
      </div>
      <div className="absolute -bottom-20 -right-20 w-40 h-40 bg-primary/5 blur-[80px] rounded-full" />
    </ContainerInstrument>
  );

  return (
    <ContainerInstrument className={cn(
      "relative overflow-hidden",
      !isEmbedded && "min-h-screen bg-va-off-white pb-32"
    )}>
      
      {!isEmbedded && (
        <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-white to-transparent opacity-50 pointer-events-none" />
      )}
      
      <ContainerInstrument 
        as={isEmbedded ? 'div' : 'section'}
        className={cn(
          "max-w-7xl mx-auto relative z-10",
          !isEmbedded ? "pt-20 px-6" : "pt-0 px-0"
        )}
      >
        {!isEmbedded && (
          <ContainerInstrument className="text-center mb-12 space-y-8">
            <OrderStepsInstrument currentStep="script" className="mb-4" />
            <div className="space-y-2">
              <HeadingInstrument level={1} className="text-6xl md:text-8xl font-light tracking-tighter text-va-black leading-none">
                <VoiceglotText translationKey="configurator.title" defaultText="Script & Prijs" />
              </HeadingInstrument>
              <TextInstrument className="text-xl text-va-black/30 font-light tracking-tight">
                <VoiceglotText translationKey="configurator.subtitle" defaultText="Verfijn je script en kies de juiste rechten." />
              </TextInstrument>
            </div>
          </ContainerInstrument>
        )}

        <div className={cn(
          "flex flex-col lg:grid lg:grid-cols-12 gap-8 items-start pt-0",
          isEmbedded ? "pt-0" : ""
        )}>
          
          {!minimalMode && (
            <div className="w-full lg:col-span-3 space-y-6 lg:sticky lg:top-24 pt-0">
              <LabelInstrument className="text-[11px] font-bold tracking-[0.2em] text-va-black/20 uppercase px-2">
                <VoiceglotText translationKey="configurator.step1.label" defaultText="01. De Stem" />
              </LabelInstrument>
              {state.selectedActor ? (
                <div className="w-full">
                  <VoiceCard voice={state.selectedActor} />
                </div>
              ) : (
                <div onClick={() => router.push('/agency')} className="bg-white rounded-[20px] shadow-aura p-12 text-center border border-black/[0.03] cursor-pointer hover:scale-[1.02] transition-all group">
                  <Mic size={48} strokeWidth={1} className="mx-auto text-va-black/10 group-hover:text-primary/20 transition-colors mb-4" />
                  <TextInstrument className="text-[15px] font-light text-va-black/40">
                    <VoiceglotText translationKey="configurator.select_voice_first" defaultText="Kies eerst een stemacteur" />
                  </TextInstrument>
                </div>
              )}
            </div>
          )}

          <div className={cn(
            "w-full pt-0 space-y-6",
            minimalMode ? "lg:col-span-12" : "lg:col-span-6"
          )}>
            {!hideMediaSelector && (
              <div className="space-y-4 mb-8 relative">
                <div className="flex items-center justify-between px-2">
                  <LabelInstrument className="text-[11px] font-bold tracking-[0.2em] text-va-black/20 uppercase">
                    <VoiceglotText translationKey="configurator.step2.label" defaultText="02. Gebruik & Rechten" />
                  </LabelInstrument>
                </div>
                <div className="grid grid-cols-3 gap-3 relative">
                  {usageTypes.map((type) => {
                    const isActive = state.usage === type.id;
                    return (
                      <button
                        key={type.id}
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleUsageSwitch(type.id as any);
                        }}
                        className={cn(
                          "flex flex-col items-center gap-2 p-4 rounded-[15px] bg-white shadow-aura border transition-all duration-500 text-center group relative cursor-pointer w-full",
                          isActive ? "ring-2 ring-primary bg-primary/[0.02] border-primary/20" : "border-black/[0.03] hover:scale-[1.02]"
                        )}
                      >
                        <div className={cn(
                          "w-10 h-10 rounded-full flex items-center justify-center transition-colors pointer-events-none",
                          isActive ? "bg-primary text-white" : "bg-va-off-white text-va-black/20 group-hover:text-primary"
                        )}>
                          <type.icon size={18} strokeWidth={1.5} />
                        </div>
                        <div className="pointer-events-none">
                          <div className={cn("text-[12px] font-bold tracking-tight leading-tight transition-colors", isActive ? "text-primary" : "text-va-black")}>{type.label}</div>
                          <div className="text-[9px] text-va-black/30 uppercase tracking-widest font-black mt-0.5">{type.description}</div>
                        </div>
                      </button>
                    );
                  })}
                </div>

                {state.usage === 'commercial' && (
                  <div className="pt-4 space-y-6 animate-in fade-in slide-in-from-top-2 duration-500">
                    <div className="space-y-3">
                      <LabelInstrument className="text-[10px] font-bold tracking-[0.15em] text-va-black/30 uppercase px-2">Land van uitzending</LabelInstrument>
                      <div className="flex flex-wrap gap-2">
                        {countries.map((c) => {
                          const isSelected = Array.isArray(state.country) ? state.country.includes(c.id) : state.country === c.id;
                          return (
                            <button
                              key={c.id}
                              type="button"
                              onClick={() => {
                                updateCountry(c.id);
                                setTimeout(() => calculatePricing?.(), 50);
                              }}
                              className={cn(
                                "px-4 py-2 rounded-full border text-[11px] font-bold transition-all",
                                isSelected ? "bg-va-black text-white border-va-black shadow-md" : "bg-white border-black/[0.03] text-va-black/40 hover:border-black/10"
                              )}
                            >
                              {c.label}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div className="space-y-3">
                      <LabelInstrument className="text-[10px] font-bold tracking-[0.15em] text-va-black/30 uppercase px-2">Selecteer kanalen</LabelInstrument>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        {commercialMediaOptions.map((opt) => {
                          const baseId = opt.id.split('_')[0];
                          const isSelected = state.media?.some(m => m.startsWith(baseId));
                          return (
                            <button
                              key={opt.id}
                              type="button"
                              onClick={() => handleMediaToggle(opt.id)}
                              className={cn(
                                "flex flex-col items-center gap-1 p-3 rounded-[12px] border transition-all text-center group relative overflow-hidden",
                                isSelected ? "bg-va-black text-white border-va-black shadow-lg scale-[1.02]" : "bg-white border-black/[0.03] text-va-black/40 hover:border-black/10 hover:bg-va-off-white/50"
                              )}
                            >
                              <opt.icon size={16} strokeWidth={isSelected ? 2.5 : 1.5} className={cn(isSelected ? "text-white" : "text-va-black/20 group-hover:text-va-black/40")} />
                              <span className="text-[11px] font-bold tracking-tight leading-none mt-1 uppercase">{opt.label}</span>
                              {isSelected && <motion.div layoutId="active-media-glow" className="absolute inset-0 bg-primary/10 blur-xl pointer-events-none" />}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div className="space-y-3 pt-2">
                      <AnimatePresence mode="popLayout">
                        {state.media?.map((mediaId) => {
                          const opt = commercialMediaOptions.find(o => o.id === mediaId);
                          if (!opt) return null;
                          const isPodcast = mediaId === 'podcast';
                          const hasRegions = (opt as any).hasRegions;
                          const currentSpots = (state.spotsDetail && state.spotsDetail[mediaId]) || state.spots || 1;
                          const currentYears = (state.yearsDetail && state.yearsDetail[mediaId]) || state.years || 1;

                          return (
                            <motion.div key={mediaId} layout initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white rounded-[20px] p-5 shadow-aura border border-black/[0.03] relative overflow-hidden group">
                              <div className="flex items-center justify-between mb-5">
                                <div className="flex items-center gap-3">
                                  <div className="w-8 h-8 rounded-full bg-va-black text-white flex items-center justify-center">
                                    <opt.icon size={14} strokeWidth={2.5} />
                                  </div>
                                  <span className="text-[13px] font-bold text-va-black uppercase tracking-tight">{opt.label}</span>
                                </div>
                                <div className="text-[10px] font-black text-primary/40 uppercase tracking-widest bg-primary/5 px-2 py-1 rounded-md">Rechten</div>
                              </div>
                              <div className="space-y-6">
                                {hasRegions && (
                                  <div className="space-y-3">
                                    <span className="text-[10px] font-bold text-va-black/30 uppercase tracking-widest">Regio</span>
                                    <div className="flex gap-2">
                                      {regions.map(r => (
                                        <button key={r.id} onClick={() => {
                                          const baseId = mediaId.split('_')[0];
                                          const newId = `${baseId}_${r.id.toLowerCase()}`;
                                          const newMedia = state.media.map(m => m === mediaId ? newId : m);
                                          updateMedia(newMedia);
                                          setTimeout(() => calculatePricing?.(), 50);
                                        }} className={cn("flex-1 py-2 rounded-lg border text-[11px] font-bold transition-all", mediaId.includes(r.id.toLowerCase()) ? "bg-primary/10 border-primary/20 text-primary" : "bg-va-off-white/50 border-black/[0.03] text-va-black/40 hover:border-black/10")}>{r.label}</button>
                                      ))}
                                    </div>
                                  </div>
                                )}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                  <div className="space-y-3">
                                    <div className="flex justify-between items-center">
                                      <span className="text-[10px] font-bold text-va-black/30 uppercase tracking-widest">Aantal Spots</span>
                                      <span className="text-[14px] font-black text-primary">{currentSpots}</span>
                                    </div>
                                    <div className="flex items-center gap-4">
                                      <button onClick={() => { const next = Math.max(1, currentSpots - 1); updateSpotsDetail({ ...state.spotsDetail, [mediaId]: next }); setTimeout(() => calculatePricing?.(), 50); }} className="w-8 h-8 rounded-xl bg-va-off-white border border-black/5 flex items-center justify-center hover:bg-va-black hover:text-white transition-all active:scale-90"><Minus size={14} strokeWidth={2.5} /></button>
                                      <div className="flex-1 relative h-1.5 bg-va-black/5 rounded-full overflow-hidden">
                                        <motion.div className="absolute inset-y-0 left-0 bg-primary" initial={false} animate={{ width: `${(currentSpots / 10) * 100}%` }} />
                                        <input type="range" min="1" max="10" step="1" value={currentSpots} onChange={(e) => { updateSpotsDetail({ ...state.spotsDetail, [mediaId]: parseInt(e.target.value) }); setTimeout(() => calculatePricing?.(), 50); }} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                                      </div>
                                      <button onClick={() => { const next = Math.min(10, currentSpots + 1); updateSpotsDetail({ ...state.spotsDetail, [mediaId]: next }); setTimeout(() => calculatePricing?.(), 50); }} className="w-8 h-8 rounded-xl bg-va-off-white border border-black/5 flex items-center justify-center hover:bg-va-black hover:text-white transition-all active:scale-90"><Plus size={14} strokeWidth={2.5} /></button>
                                    </div>
                                  </div>
                                  <div className="space-y-3">
                                    <div className="flex justify-between items-center">
                                      <span className="text-[10px] font-bold text-va-black/30 uppercase tracking-widest">{isPodcast ? 'Licentie' : 'Looptijd'}</span>
                                      <span className="text-[14px] font-black text-primary">{isPodcast ? (currentYears === 0.25 ? "3 maanden" : currentYears === 0.5 ? "6 maanden" : currentYears === 0.75 ? "9 maanden" : `${currentYears} jaar`) : `${currentYears} jaar`}</span>
                                    </div>
                                    <div className="flex items-center gap-4">
                                      <button onClick={() => { const next = Math.max(isPodcast ? 0.25 : 1, currentYears - (isPodcast ? 0.25 : 1)); updateYearsDetail({ ...state.yearsDetail, [mediaId]: next }); setTimeout(() => calculatePricing?.(), 50); }} className="w-8 h-8 rounded-xl bg-va-off-white border border-black/5 flex items-center justify-center hover:bg-va-black hover:text-white transition-all active:scale-90"><Minus size={14} strokeWidth={2.5} /></button>
                                      <div className="flex-1 relative h-1.5 bg-va-black/5 rounded-full overflow-hidden">
                                        <motion.div className="absolute inset-y-0 left-0 bg-primary" initial={false} animate={{ width: `${(currentYears / 5) * 100}%` }} />
                                        <input type="range" min={isPodcast ? 0.25 : 1} max="5" step={isPodcast ? 0.25 : 1} value={currentYears} onChange={(e) => { updateYearsDetail({ ...state.yearsDetail, [mediaId]: parseFloat(e.target.value) }); setTimeout(() => calculatePricing?.(), 50); }} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                                      </div>
                                      <button onClick={() => { const next = Math.min(5, currentYears + (isPodcast ? 0.25 : 1)); updateYearsDetail({ ...state.yearsDetail, [mediaId]: next }); setTimeout(() => calculatePricing?.(), 50); }} className="w-8 h-8 rounded-xl bg-va-off-white border border-black/5 flex items-center justify-center hover:bg-va-black hover:text-white transition-all active:scale-90"><Plus size={14} strokeWidth={2.5} /></button>
                                    </div>
                                    {isPodcast && <div className="text-[10px] text-va-black/40 font-medium italic leading-none">Buyout per kwartaal.</div>}
                                  </div>
                                </div>
                              </div>
                            </motion.div>
                          );
                        })}
                      </AnimatePresence>
                    </div>
                  </div>
                )}
              </div>
            )}

            <ContainerInstrument className="bg-white rounded-[20px] shadow-aura border border-black/[0.03] overflow-hidden group/script mb-6 relative">
              <div className="p-4 bg-va-off-white/50 border-b border-black/[0.03] flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="text-[11px] font-bold text-va-black/20 tracking-widest uppercase">
                    {effectiveWordCount} {effectiveWordCount === 1 ? t('common.word', 'woord') : t('common.words', 'woorden')}
                  </div>
                  <div className="w-[1px] h-3 bg-va-black/10" />
                  <div className="flex items-center gap-2 text-va-black/40">
                    <Clock size={12} strokeWidth={1.5} />
                    <span className="text-[11px] font-medium uppercase tracking-widest">
                      {state.usage === 'telefonie' && promptCount > 0 ? (
                        <>{promptCount} {promptCount === 1 ? t('common.prompt', 'prompt') : t('common.prompts', 'prompts')}</>
                      ) : (
                        <>± {estimatedTime} min</>
                      )}
                    </span>
                  </div>
                  {isAutoSaving && (
                    <>
                      <div className="w-[1px] h-3 bg-va-black/10" />
                      <span className="text-[10px] font-bold text-primary animate-pulse tracking-widest uppercase">Auto-saving...</span>
                    </>
                  )}
                </div>

                <div className="flex items-center gap-6">
                  {state.usage === 'telefonie' && (
                    <button 
                      onClick={() => {
                        setShowAiAssistant(!showAiAssistant);
                        if (playClick) playClick(showAiAssistant ? 'light' : 'pro');
                      }}
                      className={cn(
                        "flex items-center gap-2 px-4 py-2 rounded-full border transition-all duration-500 group/ai relative overflow-hidden",
                        showAiAssistant 
                          ? "bg-va-black text-white border-va-black shadow-lg" 
                          : "bg-white border-black/10 text-va-black/60 hover:border-primary/40 hover:text-primary"
                      )}
                    >
                      <Sparkles size={14} className={cn(showAiAssistant ? "text-primary animate-pulse" : "text-primary/40 group-hover/ai:scale-110 transition-transform")} />
                      <span className="text-[11px] font-bold uppercase tracking-widest">
                        {showAiAssistant ? "Slimme Hulp Aan" : "Hulp bij schrijven?"}
                      </span>
                      {showAiAssistant && (
                        <motion.div 
                          layoutId="ai-glow"
                          className="absolute inset-0 bg-primary/10 blur-xl pointer-events-none"
                        />
                      )}
                    </button>
                  )}
                  <div className="flex items-center gap-2 text-[11px] text-va-black/40 font-light italic">
                    <Info size={12} className="text-primary/40" /> Zet regie-aanwijzingen of bestandsnamen (tussen haakjes)
                  </div>
                </div>
              </div>
              
              <div className="relative min-h-[400px]">
                <div 
                  className="absolute inset-0 p-8 text-xl font-light leading-relaxed whitespace-pre-wrap break-words pointer-events-none text-va-black"
                  aria-hidden="true"
                >
                  {renderHighlightedText()}
                  {showAiAssistant && aiSuggestion && (
                    <span className="text-va-black/20">
                      {aiSuggestion}
                      <span className="ml-2 inline-flex items-center gap-1 px-1.5 py-0.5 bg-primary/5 text-primary text-[10px] font-bold rounded border border-primary/10 align-middle">TAB</span>
                    </span>
                  )}
                </div>

                <textarea
                  ref={textareaRef}
                  value={localBriefing}
                  onChange={(e) => handleBriefingChange(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={scriptPlaceholder}
                  className="w-full h-[400px] p-8 text-xl font-light leading-relaxed bg-transparent border-none focus:ring-0 outline-none resize-none placeholder:text-va-black/10 relative z-10 text-transparent caret-va-black"
                  spellCheck={false}
                />
                
                {isAiLoading && (
                  <div className="absolute bottom-4 right-8 z-20">
                    <div className="w-4 h-4 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
                  </div>
                )}
              </div>

              <AnimatePresence>
                {scriptIntelligence && scriptIntelligence.length > 0 && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="bg-va-black text-white p-4 border-t border-white/5 flex flex-col gap-3"
                  >
                    {scriptIntelligence.map((insight, idx) => (
                      <div key={idx} className="flex items-center justify-between gap-4 animate-in fade-in slide-in-from-left-2 duration-500">
                        <div className="flex items-center gap-3">
                          <div className={cn(
                            "w-6 h-6 rounded-full flex items-center justify-center shrink-0",
                            insight.type === 'warning' ? "bg-amber-500/20 text-amber-500" : 
                            insight.type === 'success' ? "bg-green-500/20 text-green-500" :
                            "bg-primary/20 text-primary"
                          )}>
                            {insight.type === 'warning' ? <Info size={14} /> : 
                             insight.type === 'success' ? <Check size={14} /> :
                             <Sparkles size={14} />}
                          </div>
                          <span className="text-[13px] font-medium text-white/80">{insight.message}</span>
                        </div>
                        {insight.action === 'switch_telephony' && (
                          <button onClick={() => handleUsageSwitch('telefonie')} className="text-[11px] font-bold uppercase tracking-widest text-primary hover:text-white transition-colors whitespace-nowrap">Switch naar Telefoon</button>
                        )}
                        {insight.action === 'switch_commercial' && (
                          <button onClick={() => handleUsageSwitch('commercial')} className="text-[11px] font-bold uppercase tracking-widest text-primary hover:text-white transition-colors whitespace-nowrap">Switch naar Commercial</button>
                        )}
                        {insight.action === 'add_audio_briefing' && (
                          <button onClick={() => setShowBriefingSelector(true)} className="text-[11px] font-bold uppercase tracking-widest text-primary hover:text-white transition-colors whitespace-nowrap">Audio toevoegen</button>
                        )}
                      </div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </ContainerInstrument>

            <AnimatePresence>
              {showAiAssistant && state.usage === 'telefonie' && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="mb-6"
                >
                  <TelephonySmartSuggestions setLocalBriefing={setLocalBriefing} />
                </motion.div>
              )}
            </AnimatePresence>

            <div className={cn("grid grid-cols-1 gap-4", !minimalMode && "mt-8")}>
              <div className="space-y-4">
                <button 
                  onClick={() => {
                    setShowBriefingSelector(!showBriefingSelector);
                    if (playClick) playClick(showBriefingSelector ? 'light' : 'pro');
                  }} 
                  className={cn(
                    "w-full flex items-center justify-between p-5 rounded-[20px] border transition-all text-left group", 
                    (showBriefingSelector || state.briefingFiles.length > 0) ? "bg-primary/5 border-primary/20 shadow-sm" : "bg-white border-black/[0.03] hover:border-black/10"
                  )}
                >
                  <div className="flex items-center gap-4">
                    <div className={cn("w-10 h-10 rounded-full flex items-center justify-center transition-all duration-500", (showBriefingSelector || state.briefingFiles.length > 0) ? "bg-primary text-white scale-110" : "bg-va-off-white text-va-black/20 group-hover:text-primary")}>
                      {state.briefingFiles.length > 0 ? <Check size={18} strokeWidth={3} /> : <Paperclip size={18} strokeWidth={1.5} />}
                    </div>
                    <div>
                      <div className={cn("text-[13px] font-bold transition-colors", (showBriefingSelector || state.briefingFiles.length > 0) ? "text-primary" : "text-va-black")}>
                        <VoiceglotText translationKey="configurator.add_briefing" defaultText="Voeg briefing toe" />
                      </div>
                      <div className="text-[11px] text-va-black/40 font-light">
                        <VoiceglotText translationKey="configurator.add_briefing_sub" defaultText="Spreek je briefing in, upload een bestand of voeg extra tekst toe" />
                      </div>
                    </div>
                  </div>
                  {state.briefingFiles.length > 0 && (
                    <div className="bg-primary/10 text-primary text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-widest">
                      {state.briefingFiles.length} {state.briefingFiles.length === 1 ? 'item' : 'items'}
                    </div>
                  )}
                </button>

                <AnimatePresence>
                  {showBriefingSelector && (
                    <BriefingSelector />
                  )}
                </AnimatePresence>
              </div>

              {state.usage === 'telefonie' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <button 
                      onClick={() => {
                        const isActive = state.music.asBackground || state.music.asHoldMusic;
                        if (isActive) {
                          updateMusic({ asBackground: false, asHoldMusic: false, trackId: null });
                        } else {
                          updateMusic({ asBackground: true, trackId: state.music.trackId || 'corporate-growth' });
                        }
                      }} 
                      className={cn(
                        "w-full flex items-center justify-between p-5 rounded-[20px] border transition-all text-left group", 
                        (state.music.asBackground || state.music.asHoldMusic) ? "bg-primary/5 border-primary/20 shadow-sm" : "bg-white border-black/[0.03] hover:border-black/10"
                      )}
                    >
                      <div className="flex items-center gap-4">
                        <div className={cn("w-10 h-10 rounded-full flex items-center justify-center transition-all duration-500", (state.music.asBackground || state.music.asHoldMusic) ? "bg-primary text-white scale-110" : "bg-va-off-white text-va-black/20 group-hover:text-primary")}>
                          {(state.music.asBackground || state.music.asHoldMusic) ? <Check size={18} strokeWidth={3} /> : <Music size={18} strokeWidth={1.5} />}
                        </div>
                        <div>
                          <div className={cn("text-[13px] font-bold transition-colors", (state.music.asBackground || state.music.asHoldMusic) ? "text-primary" : "text-va-black")}>
                            <VoiceglotText translationKey="configurator.music_mixing" defaultText="Muziek & Mixage" />
                          </div>
                          <div className="text-[11px] text-va-black/40 font-light">
                            <VoiceglotText translationKey="configurator.music_mixing_sub" defaultText="Kies muziek als aparte wachtmuziek of laat mixen onder de stem" />
                          </div>
                        </div>
                      </div>
                      <div className={cn("text-[13px] font-medium transition-colors", (state.music.asBackground || state.music.asHoldMusic) ? "text-primary" : "text-va-black/40")}>+ €59</div>
                    </button>

                    <div className="flex gap-2">
                      <button 
                        onClick={() => updateMusic({ asBackground: !state.music.asBackground })}
                        disabled={!state.music.asBackground && !state.music.asHoldMusic}
                        className={cn(
                          "flex-1 flex flex-col items-center justify-center gap-1 p-3 rounded-xl border transition-all text-[10px] font-bold uppercase tracking-widest",
                          state.music.asBackground ? "bg-primary text-white border-primary" : "bg-white border-black/5 text-va-black/40 hover:border-black/10 disabled:opacity-30"
                        )}
                      >
                        <div className={cn("w-6 h-6 rounded-full flex items-center justify-center mb-1", state.music.asBackground ? "bg-white/20" : "bg-va-black/5")}>
                          <Check size={12} strokeWidth={3} className={state.music.asBackground ? "opacity-100" : "opacity-0"} />
                        </div>
                        <VoiceglotText translationKey="configurator.mix" defaultText="Mixen" />
                      </button>
                      <button 
                        onClick={() => updateMusic({ asHoldMusic: !state.music.asHoldMusic })}
                        disabled={!state.music.asBackground && !state.music.asHoldMusic}
                        className={cn(
                          "flex-1 flex flex-col items-center justify-center gap-1 p-3 rounded-xl border transition-all text-[10px] font-bold uppercase tracking-widest",
                          state.music.asHoldMusic ? "bg-primary text-white border-primary" : "bg-white border-black/5 text-va-black/40 hover:border-black/10 disabled:opacity-30"
                        )}
                      >
                        <div className={cn("w-6 h-6 rounded-full flex items-center justify-center mb-1", state.music.asHoldMusic ? "bg-white/20" : "bg-va-black/5")}>
                          <Check size={12} strokeWidth={3} className={state.music.asHoldMusic ? "opacity-100" : "opacity-0"} />
                        </div>
                        <VoiceglotText translationKey="configurator.hold_music" defaultText="Wachtmuziek" />
                      </button>
                    </div>
                  </div>

                  <AnimatePresence>
                    {(state.music.asBackground || state.music.asHoldMusic) && (
                      <MusicSelector />
                    )}
                  </AnimatePresence>
                </div>
              )}

              {/*  CHRIS-PROTOCOL: Render Price Block inline for minimal mode (Agency page) */}
              {minimalMode && (
                <div className="mt-8">
                  <PriceBlock />
                </div>
              )}
            </div>
          </div>

          {!minimalMode && (
            <div className="w-full space-y-8 lg:sticky lg:top-24 pt-0 z-20 mt-8 lg:mt-0 lg:col-span-3">
              <PriceBlock />
            </div>
          )}
        </div>
      </ContainerInstrument>

      {/* MOBY'S STICKY MOBILE ACTION BAR */}
      {isEmbedded && (
        <div className="lg:hidden fixed bottom-0 left-0 right-0 z-[100] p-4 bg-white/80 backdrop-blur-xl border-t border-black/5 animate-in slide-in-from-bottom-full duration-500">
          <div className="flex items-center justify-between gap-4">
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold text-va-black/20 uppercase tracking-widest leading-none">
                    <VoiceglotText translationKey="pricing.total" defaultText="Totaal" />
                  </span>
                  <span className="text-2xl font-light tracking-tighter text-va-black leading-none">
                    <PriceCountUp value={state.pricing.total} />
                  </span>
                </div>
                  <button 
                    onClick={() => handleAddToCartWithEmail('checkout')}
                    disabled={!state.selectedActor}
                    className="bg-va-black text-white px-8 py-3 rounded-xl font-bold text-[13px] tracking-widest uppercase active:scale-95 transition-all disabled:opacity-50"
                  >
                    <VoiceglotText translationKey="action.order" defaultText="Bestellen" />
                  </button>
          </div>
        </div>
      )}

      {/* ADD TO CART EMAIL MODAL */}
      <AddToCartEmailModal 
        isOpen={showEmailModal}
        onClose={() => setShowEmailModal(false)}
        onConfirm={onEmailConfirm}
        initialEmail={state.customer.email}
      />
    </ContainerInstrument>
  );
}
