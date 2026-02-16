"use client";

import { useCheckout } from '@/contexts/CheckoutContext';
import { useTranslation } from '@/contexts/TranslationContext';
import { useMasterControl } from '@/contexts/VoicesMasterControlContext';
import { cn } from '@/lib/utils';
import { MarketManager } from '@config/market-manager';
import { Check, Globe, Megaphone, Mic2, Phone, Radio, Tv, User, Users, Video } from 'lucide-react';
import React, { useMemo, useState } from 'react';
import { AgencyFilterSheet } from './AgencyFilterSheet';
import { ContainerInstrument, TextInstrument } from './LayoutInstruments';
import { OrderStepsInstrument } from './OrderStepsInstrument';
import { VoiceglotImage } from './VoiceglotImage';
import { VoiceglotText } from './VoiceglotText';
import { VoicesDropdown } from './VoicesDropdown';
import { VoicesWordSlider } from './VoicesWordSlider';


// 🛡️ CHRIS-PROTOCOL: Circular Flag Components
const FlagBE = () => (
  <div className="w-5 h-5 rounded-full overflow-hidden border border-black/5 shrink-0">
    <div className="flex h-full w-full">
      <div className="w-1/3 h-full bg-black" />
      <div className="w-1/3 h-full bg-[#FAE042]" />
      <div className="w-1/3 h-full bg-[#ED2939]" />
    </div>
  </div>
);

const FlagNL = () => (
  <div className="w-5 h-5 rounded-full overflow-hidden border border-black/5 shrink-0">
    <div className="flex flex-col h-full w-full">
      <div className="h-1/3 w-full bg-[#AE1C28]" />
      <div className="h-1/3 w-full bg-white" />
      <div className="h-1/3 w-full bg-[#21468B]" />
    </div>
  </div>
);

const FlagFR = () => (
  <div className="w-5 h-5 rounded-full overflow-hidden border border-black/5 shrink-0">
    <div className="flex h-full w-full">
      <div className="w-1/3 h-full bg-[#002395]" />
      <div className="w-1/3 h-full bg-white" />
      <div className="w-1/3 h-full bg-[#ED2939]" />
    </div>
  </div>
);

const FlagUK = () => (
  <div className="w-5 h-5 rounded-full overflow-hidden border border-black/5 shrink-0 bg-[#00247D] relative">
    {/* St Andrew's Cross (White Diagonal) */}
    <div className="absolute inset-0 flex items-center justify-center rotate-45">
      <div className="w-full h-[3px] bg-white" />
      <div className="h-full w-[3px] bg-white" />
    </div>
    {/* St Patrick's Cross (Red Diagonal) */}
    <div className="absolute inset-0 flex items-center justify-center rotate-45">
      <div className="w-full h-[1px] bg-[#CF142B] z-10" />
      <div className="h-full w-[1px] bg-[#CF142B] z-10" />
    </div>
    {/* St George's Cross (White background for red cross) */}
    <div className="absolute inset-0 flex items-center justify-center">
      <div className="w-full h-[5px] bg-white" />
      <div className="h-full w-[5px] bg-white" />
    </div>
    {/* St George's Cross (Red) */}
    <div className="absolute inset-0 flex items-center justify-center">
      <div className="w-full h-[3px] bg-[#CF142B] z-20" />
      <div className="h-full w-[3px] bg-[#CF142B] z-20" />
    </div>
  </div>
);

const FlagUS = () => (
  <div className="w-5 h-5 rounded-full overflow-hidden border border-black/5 shrink-0 bg-white relative flex flex-col">
    {/* Stripes */}
    {[...Array(7)].map((_, i) => (
      <div key={i} className={cn("h-[3px] w-full", i % 2 === 0 ? "bg-[#B22234]" : "bg-white")} />
    ))}
    {/* Canton (Blue field) */}
    <div className="absolute top-0 left-0 w-[45%] h-[50%] bg-[#3C3B6E] flex items-center justify-center">
      <div className="w-1 h-1 bg-white rounded-full shadow-[2px_2px_0_white,-2px_-2px_0_white,2px_-2px_0_white,-2px_2px_0_white]" style={{ transform: 'scale(0.5)' }} />
    </div>
  </div>
);

const FlagDE = () => (
  <div className="w-5 h-5 rounded-full overflow-hidden border border-black/5 shrink-0">
    <div className="flex flex-col h-full w-full">
      <div className="h-1/3 w-full bg-black" />
      <div className="h-1/3 w-full bg-[#FF0000]" />
      <div className="h-1/3 w-full bg-[#FFCC00]" />
    </div>
  </div>
);

const FlagES = () => (
  <div className="w-5 h-5 rounded-full overflow-hidden border border-black/5 shrink-0">
    <div className="flex flex-col h-full w-full">
      <div className="h-1/4 w-full bg-[#AA151B]" />
      <div className="h-2/4 w-full bg-[#F1BF00]" />
      <div className="h-1/4 w-full bg-[#AA151B]" />
    </div>
  </div>
);

const FlagIT = () => (
  <div className="w-5 h-5 rounded-full overflow-hidden border border-black/5 shrink-0">
    <div className="flex h-full w-full">
      <div className="w-1/3 h-full bg-[#009246]" />
      <div className="w-1/3 h-full bg-white" />
      <div className="w-1/3 h-full bg-[#CE2B37]" />
    </div>
  </div>
);

const FlagPL = () => (
  <div className="w-5 h-5 rounded-full overflow-hidden border border-black/5 shrink-0">
    <div className="flex flex-col h-full w-full">
      <div className="h-1/2 w-full bg-white" />
      <div className="h-1/2 w-full bg-[#DC143C]" />
    </div>
  </div>
);

const FlagDK = () => (
  <div className="w-5 h-5 rounded-full overflow-hidden border border-black/5 shrink-0 bg-[#C60C30] relative">
    <div className="absolute inset-0 flex items-center justify-center">
      <div className="w-full h-[2px] bg-white" />
      <div className="h-full w-[2px] bg-white" style={{ marginLeft: '-20%' }} />
    </div>
  </div>
);

const FlagPT = () => (
  <div className="w-5 h-5 rounded-full overflow-hidden border border-black/5 shrink-0 relative flex">
    <div className="w-[40%] h-full bg-[#006600]" />
    <div className="w-[60%] h-full bg-[#FF0000]" />
  </div>
);

interface VoicesMasterControlProps {
  filters: {
    languages: string[];
    genders: string[];
    styles: string[];
  };
}

export const VoicesMasterControl: React.FC<VoicesMasterControlProps> = ({ filters }) => {
  const { t } = useTranslation();
  const { state, updateJourney, updateFilters, updateStep, resetFilters } = useMasterControl();
  const { state: checkoutState } = useCheckout();
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  const journeys = [
    { 
      id: 'telephony', 
      icon: Phone, 
      label: 'Telefonie', 
      subLabel: 'Voicemail & IVR',
      key: 'journey.telephony', 
      color: 'text-primary' 
    },
    { 
      id: 'video', 
      icon: Video, 
      label: 'Video', 
      subLabel: 'Corporate & Website',
      key: 'journey.video', 
      color: 'text-primary' 
    },
    { 
      id: 'commercial', 
      icon: Megaphone, 
      label: 'Advertentie', 
      subLabel: 'Radio, TV & Online Ads',
      key: 'journey.commercial', 
      color: 'text-primary' 
    },
  ] as const;

  
  
  // 🌍 Comprehensive sorted languages from Database Audit
  const sortedLanguages = useMemo(() => {
    const host = typeof window !== 'undefined' ? window.location.host : 'voices.be';
    const market = MarketManager.getCurrentMarket(host);
    
    const languageConfig = [
      { label: 'Vlaams', value: 'nl-BE', icon: FlagBE, subLabel: 'België', popular: market.market_code === 'BE' || market.market_code === 'NLNL' },
      { label: 'Nederlands', value: 'nl-NL', icon: FlagNL, subLabel: 'Nederland', popular: market.market_code === 'BE' || market.market_code === 'NLNL' },
      { label: 'Frans (BE)', value: 'fr-BE', icon: FlagBE, subLabel: 'België', popular: market.market_code === 'BE' },
      { label: 'Frans (FR)', value: 'fr-FR', icon: FlagFR, subLabel: 'Frankrijk', popular: market.market_code === 'FR' || market.market_code === 'BE' },
      { label: 'Engels (UK)', value: 'en-GB', icon: FlagUK, subLabel: 'United Kingdom', popular: true },
      { label: 'Engels (US)', value: 'en-US', icon: FlagUS, subLabel: 'United States', popular: true },
      { label: 'Duits', value: 'de-DE', icon: FlagDE, subLabel: 'Duitsland', popular: market.market_code === 'DE' || market.market_code === 'BE' || market.market_code === 'NLNL' },
      { label: 'Spaans', value: 'es-ES', icon: FlagES, subLabel: 'Spanje', popular: market.market_code === 'ES' },
      { label: 'Italiaans', value: 'it-IT', icon: FlagIT, subLabel: 'Italië', popular: market.market_code === 'IT' },
      { label: 'Pools', value: 'pl-PL', icon: FlagPL, subLabel: 'Polen' },
      { label: 'Deens', value: 'da-DK', icon: FlagDK, subLabel: 'Denemarken' },
      { label: 'Portugees', value: 'pt-PT', icon: FlagPT, subLabel: 'Portugal', popular: market.market_code === 'PT' },
    ];

    const popularLangs = languageConfig.filter(l => l.popular);
    const otherLangs = languageConfig.filter(l => !l.popular);

    const sortFn = (a: any, b: any) => {
      // Specific Market Order
      if (market.market_code === 'BE') {
        if (a.label === 'Vlaams') return -1;
        if (b.label === 'Vlaams') return 1;
        if (a.label === 'Nederlands') return -1;
        if (b.label === 'Nederlands') return 1;
        if (a.label === 'Frans (BE)') return -1;
        if (b.label === 'Frans (BE)') return 1;
      }
      if (market.market_code === 'NLNL') {
        if (a.label === 'Nederlands') return -1;
        if (b.label === 'Nederlands') return 1;
        if (a.label === 'Vlaams') return -1;
        if (b.label === 'Vlaams') return 1;
        if (a.label.includes('Engels')) return -1;
        if (b.label.includes('Engels')) return 1;
      }
      return a.label.localeCompare(b.label);
    };

    return [
      ...popularLangs.sort(sortFn),
      { label: 'OVERIGE TALEN', value: '', isHeader: true },
      ...otherLangs.sort(sortFn)
    ];
  }, []);



  return (
    <ContainerInstrument className="w-full max-w-7xl mx-auto space-y-8">
      {/* 🏗️ THE MASTER CONTROL BOX */}
      <ContainerInstrument plain className="bg-white border border-black/10 rounded-[40px] p-3 shadow-aura group/master">
        
        {/* 1. Journey Selector (Top Row) */}
        <ContainerInstrument plain className="flex items-center justify-center p-1.5 bg-va-off-white/50 rounded-[32px] mb-3">
          {journeys.map((j) => {
            const isActive = state.journey === j.id;
            const Icon = j.icon;

            return (
              <button
                key={j.id}
                onClick={() => updateJourney(j.id)}
                className={cn(
                  "flex-1 flex items-center justify-start gap-4 px-6 py-3 rounded-[28px] transition-all duration-500 group/btn text-left",
                  isActive 
                    ? "bg-va-black text-white shadow-xl scale-[1.02] z-10" 
                    : "text-va-black/40 hover:text-va-black hover:bg-white/50"
                )}
              >
                <Icon size={24} strokeWidth={isActive ? 2 : 1.5} className={cn("transition-all duration-500 shrink-0", isActive && j.color)} />
                <div className="flex flex-col">
                  <span className="text-[14px] font-bold tracking-widest leading-none mb-1">
                    <VoiceglotText translationKey={j.key} defaultText={j.label} />
                  </span>
                  <span className={cn(
                    "text-[10px] font-medium tracking-wider uppercase opacity-60",
                    isActive ? "text-white/80" : "text-va-black/40 group-hover/btn:text-va-black/60"
                  )}>
                    {j.subLabel}
                  </span>
                </div>
                {isActive && <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse ml-auto" />}
              </button>
            );
          })}
        </ContainerInstrument>

        {/* 2. Primary Filter Pill (Airbnb Style) */}
        <ContainerInstrument plain className="p-1.5">
          <ContainerInstrument plain className="flex items-center bg-white rounded-full shadow-md border border-black/10 divide-x divide-black/10 h-20">
            
            {/* Language Segment */}
            <VoicesDropdown 
              searchable
              multiSelect={state.journey === 'telephony'}
              rounding="left"
              options={sortedLanguages}
              value={state.journey === 'telephony' ? (state.filters.languages || []) : state.filters.language}
              onChange={(val) => {
                if (state.journey === 'telephony') {
                  const langs = Array.isArray(val) ? val : (val ? [val] : []);
                  updateFilters({ languages: langs });
                } else {
                  updateFilters({ language: val || undefined });
                }
              }}
              placeholder={state.journey === 'telephony' ? "Kies taal/talen" : "Alle talen"}
              label={state.journey === 'telephony' ? "Welke talen?" : "Welke taal?"}
              className="flex-1 h-full"
            />

            {/* Gender Segment */}
            <VoicesDropdown 
              options={[
                { label: 'Iedereen', value: '', icon: Users },
                { label: 'Mannelijk', value: 'Mannelijk', icon: User },
                { label: 'Vrouwelijk', value: 'Vrouwelijk', icon: User },
              ]}
              value={state.filters.gender || ''}
              onChange={(val) => updateFilters({ gender: val || undefined })}
              placeholder="Iedereen"
              label="Wie?"
              className="flex-1 h-full"
            />

            {/* Words Segment (Telephony & Video) */}
            {(state.journey === 'telephony' || state.journey === 'video') && (
              <VoicesWordSlider 
                rounding="right"
                isTelephony={state.journey === 'telephony'}
                isVideo={state.journey === 'video'}
                value={state.filters.words || (state.journey === 'telephony' ? 25 : 200)}
                onChange={(val) => updateFilters({ words: val })}
                label="Hoeveelheid?"
                className="flex-1 h-full animate-in fade-in slide-in-from-left-4 duration-500"
              />
            )}

            {/* Media Segment (Commercial only) - 🛡️ AIRBNB STEPPER MODE */}
            {state.journey === 'commercial' && (
              <VoicesDropdown 
                stepperMode
                options={[
                  { label: 'Online & Socials', value: 'online', icon: Globe, subLabel: 'YouTube, Meta, LinkedIn' },
                  { label: 'Podcast', value: 'podcast', icon: Mic2, subLabel: 'Pre-roll, Mid-roll' },
                  
                  { label: 'RADIO', value: '', isHeader: true },
                  { label: 'Nationaal', value: 'radio_national', icon: Radio, isSub: true },
                  { label: 'Regionaal', value: 'radio_regional', icon: Radio, isSub: true },
                  { label: 'Lokaal', value: 'radio_local', icon: Radio, isSub: true },

                  { label: 'TELEVISIE', value: '', isHeader: true },
                  { label: 'Nationaal', value: 'tv_national', icon: Tv, isSub: true },
                  { label: 'Regionaal', value: 'tv_regional', icon: Tv, isSub: true },
                  { label: 'Lokaal', value: 'tv_local', icon: Tv, isSub: true },
                ]}
                value={state.filters.spotsDetail || {}}
                onChange={(val) => {
                  // Update spotsDetail and also the main media array for filtering
                  const media = Object.keys(val);
                  updateFilters({ 
                    spotsDetail: val,
                    media: media.length > 0 ? media as any : undefined
                  });
                }}
                placeholder="Kies type(s)"
                label="Mediatype?"
                className="flex-1 h-full animate-in fade-in slide-in-from-left-4 duration-500"
              />
            )}

            {/* Country Segment (Commercial only) */}
            {state.journey === 'commercial' && (
              <VoicesDropdown 
                searchable
                rounding="right"
                options={[
                  { label: 'België', value: 'BE' },
                  { label: 'Nederland', value: 'NL' },
                  { label: 'Frankrijk', value: 'FR' },
                  { label: 'Duitsland', value: 'DE' },
                  { label: 'United Kingdom', value: 'UK' },
                  { label: 'United States', value: 'US' },
                  { label: 'Spanje', value: 'ES' },
                  { label: 'Portugal', value: 'PT' },
                  { label: 'Italië', value: 'IT' },
                ]}
                value={state.filters.countries || [state.filters.country || 'BE']}
                onChange={(val) => {
                  const countries = Array.isArray(val) ? val : (val ? [val] : []);
                  updateFilters({ countries: countries as any });
                }}
                placeholder="Kies land(en)"
                label="Welk land?"
                className="flex-1 h-full animate-in fade-in slide-in-from-left-4 duration-500"
                multiSelect={true}
              />
            )}
          </ContainerInstrument>
        </ContainerInstrument>
      </ContainerInstrument>

      {/* De Filter Sheet (Mobile & Advanced) */}
      <AgencyFilterSheet 
        filters={filters} 
        activeParams={{
          language: state.filters.language || '',
          gender: state.filters.gender || '',
          style: state.filters.style || ''
        }} 
        onUpdate={(params) => updateFilters(params)}
        isOpen={isSheetOpen}
        onClose={() => setIsSheetOpen(false)}
      />

      {/* Live Regie Toggle (Always Visible for Commercial) */}
      {state.journey === 'commercial' && (
        <ContainerInstrument plain className="flex items-center justify-center gap-4 animate-in fade-in slide-in-from-top-2 duration-500">
          <button 
            onClick={() => updateFilters({ liveSession: !state.filters.liveSession })}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-full border transition-all duration-300",
              state.filters.liveSession 
                ? "bg-primary text-white border-primary shadow-lg shadow-primary/20" 
                : "bg-white/50 border-black/5 text-va-black/40 hover:text-va-black hover:border-black/10"
            )}
          >
            <span className="text-[11px] font-bold uppercase tracking-widest">Live Regie</span>
            {state.filters.liveSession ? <Check size={14} strokeWidth={3} /> : <div className="w-3.5 h-3.5 rounded-full border-2 border-current opacity-40" />}
          </button>
        </ContainerInstrument>
      )}

      {/* 3. Order Progress (Bottom Row - Subtle) */}
      <ContainerInstrument plain className="pt-4 relative z-0">
        <OrderStepsInstrument currentStep={state.currentStep} className="!mb-0" />
      </ContainerInstrument>
    </ContainerInstrument>
  );
};

const Chip = ({ label, onRemove }: { label: string, onRemove: () => void }) => (
  <ContainerInstrument className="inline-flex items-center gap-2 px-5 py-2.5 bg-white border border-black/5 rounded-full text-[14px] font-light tracking-widest shadow-sm hover:border-primary/20 transition-colors group">
    <TextInstrument className="text-va-black/60 group-hover:text-va-black">{label}</TextInstrument>
    <button onClick={onRemove} className="hover:text-primary transition-colors p-0.5">
      <VoiceglotImage src="/assets/common/branding/icons/BACK.svg" width={10} height={10} alt="Remove" style={{ filter: 'invert(18%) sepia(91%) saturate(6145%) hue-rotate(332deg) brightness(95%) contrast(105%)', opacity: 0.4 }} />
    </button>
  </ContainerInstrument>
);
