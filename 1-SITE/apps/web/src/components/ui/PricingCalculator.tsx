"use client";

import { useCheckout } from '@/contexts/CheckoutContext';
import { MediaChannel, PricingEngine, Region } from '@/lib/pricing-engine';
import { cn } from '@/lib/utils';
import { Check, ChevronRight, Megaphone, Music, Phone, Video, Radio, Tv, Globe, Mic2, Plus, Minus } from 'lucide-react';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BentoCard } from './BentoGrid';
import { ButtonInstrument, ContainerInstrument, HeadingInstrument, InputInstrument, OptionInstrument, SelectInstrument, TextInstrument } from './LayoutInstruments';
import { VoiceglotText } from './VoiceglotText';

import { VoiceCard } from './VoiceCard';

interface PricingCalculatorProps {
  mode?: 'human' | 'ai';
  actor?: any;
}

export const PricingCalculator: React.FC<PricingCalculatorProps> = ({ mode = 'human', actor }) => {
  const { state, updateUsage, updateBriefing, updateMusic, setStep, selectActor } = useCheckout();
  const router = useRouter();
  const [words, setWords] = useState(25);
  const [country, setCountry] = useState('BE');
  const [media, setMedia] = useState<MediaChannel[]>(['online']);
  const [mediaRegion, setMediaRegion] = useState<Record<string, Region>>({ tv: 'Nationaal', radio: 'Nationaal' });
  const [spots, setSpots] = useState(1);
  const [years, setYears] = useState(1);
  const [language, setLanguage] = useState('nl-BE');
  const [filteredActors, setFilteredActors] = useState<any[]>([]);
  const [pricing, setPricing] = useState({ price: 0, formatted: ' 0,00' });

  const pricingConfig = PricingEngine.getDefaultConfig();

  //  Fetch & Filter Voices based on criteria
  useEffect(() => {
    const fetchVoices = async () => {
      try {
        const res = await fetch(`/api/admin/config?type=actors&lang=${language.split('-')[0]}`);
        const data = await res.json();
        const allActors = data.results || [];
        
        // Filter op taal en of ze tarieven hebben voor de geselecteerde usage
    const relevant = allActors.filter((a: Actor) => {
      const hasLang = (a as Record<string, any>).languages?.some((l: { code: string }) => l.code === language || l.code === language.split('-')[0]);
      if (!hasLang) return false;

      if (state.usage === 'paid') {
        // Voor commercials moeten ze minimaal n paid rate hebben
        const rates = a.rates_raw || {};
        return Object.values(rates).some((r: any) => (r as Record<string, any>).price_online_media || (r as Record<string, any>).price_tv_national || (r as Record<string, any>).price_radio_national);
      }
      return true;
    });

        setFilteredActors(relevant.slice(0, 3)); // Toon top 3 voor snelle vergelijking
      } catch (err) {
        console.error('Failed to fetch voices:', err);
      }
    };
    fetchVoices();
  }, [language, state.usage]);

  // Calculate pricing locally without WP
  useEffect(() => {
    // Neem de eerste beschikbare stem als referentie, of gebruik een fallback object
    const referenceActor = filteredActors && filteredActors.length > 0 ? filteredActors[0] : null;
    
    const actorRates = actor || (referenceActor ? {
      first_name: referenceActor.first_name,
      ai_enabled: referenceActor.ai_enabled,
      price_unpaid_media: referenceActor.price_unpaid_media,
      price_ivr: referenceActor.price_ivr,
      rates: referenceActor.rates_raw || {}
    } : {
      //  NUCLEAR FALLBACK: Als er geen acteurs zijn, gebruik de globale defaults
      price_unpaid_media: 239,
      price_ivr: 89,
      rates: {}
    });

    const wordCount = Number(words) || 0;

    const result = PricingEngine.calculatePrice(actorRates, {
      usage: state.usage as MediaChannel,
      words: wordCount,
      prompts: state.usage === 'telefonie' ? 1 : 0,
      countries: [country],
      media: media,
      tvRegion: mediaRegion.tv || 'Nationaal',
      radioRegion: mediaRegion.radio || 'Nationaal',
      spots: Number(spots) || 1,
      years: Number(years) || 1,
      useEntryPricing: mode === 'ai',
      musicMix: state.music.asBackground || state.music.asHoldMusic
    });
    
    //  Dynamic Result Label based on usage
    const status = PricingEngine.getAvailabilityStatus(
      actor || referenceActor || {}, 
      state.usage === 'paid' ? media : [], 
      country
    );

    if (status === 'unavailable' && state.usage === 'paid') {
      setPricing({ ...result, formatted: 'Niet beschikbaar' });
      return;
    }

    const formattedPrice = result.formatted;

    setPricing({ ...result, formatted: formattedPrice });
  }, [state.usage, words, country, media, mediaRegion, spots, years, mode, actor, filteredActors, state.music.asBackground, state.music.asHoldMusic]);

  const handleBookNow = () => {
    //  AVAILABILITY PROTECTION
    const status = PricingEngine.getAvailabilityStatus(
      actor || (filteredActors && filteredActors[0]) || {}, 
      state.usage === 'paid' ? media : [], 
      country
    );

    if (status === 'unavailable' && state.usage === 'paid') {
      const event = new CustomEvent('voicy:suggestion', {
        detail: {
          title: 'Niet beschikbaar',
          content: `Het lijkt erop dat ${actor?.display_name || 'deze stem'} geen tarieven heeft ingesteld voor deze media-combinatie en daarom niet direct geboekt kan worden. Wil je dat ik een alternatieve stem voor je zoek of Johfrah vraag om een uitzondering?`,
          tab: 'mail'
        }
      });
      window.dispatchEvent(event);
      return;
    }

    //  ZERO PRICE PROTECTION
    if (pricing.price === 0) {
      const event = new CustomEvent('voicy:suggestion', {
        detail: {
          title: 'Oeps, een tarieffout',
          content: 'Het lijkt erop dat er een onregelmatigheid is in het tarief voor deze opdracht (0 euro). Om fouten te voorkomen heb ik de bestelling even gepauzeerd. Zal ik Johfrah een seintje geven om dit direct voor je recht te zetten?',
          tab: 'mail'
        }
      });
      window.dispatchEvent(event);
      return;
    }

    // Pre-fill context
    if (state.usage === 'telefonie') {
      // For telephony, we simulate prompts with newlines
      if (!state.briefing) updateBriefing("(Prompt 1)\n".repeat(words));
    } else {
      if (!state.briefing) updateBriefing(" ".repeat(words)); // Mock words for pricing
    }
    
    // If we have a geselecteerde stem, we go to the configurator
    if (actor || state.selectedActor) {
      router.push('/checkout/configurator');
    } else {
      setStep('voice');
      router.push(`/checkout?usage=${state.usage}&words=${words}`);
    }
  };

  const usageTypes = [
    { id: 'telefonie', label: 'Telefoon', translationKey: 'pricing.usage.telephony', icon: Phone },
    { id: 'unpaid', label: 'Video', translationKey: 'pricing.usage.video', icon: Video },
    { id: 'paid', label: 'Advertentie', translationKey: 'pricing.usage.ad', icon: Megaphone },
  ];

  const handleUsageChange = (newUsage: MediaChannel) => {
    updateUsage(newUsage);
    if (newUsage === 'telefonie') {
      setWords(25); // Default to 25 words for Telephony
    } else if (newUsage === 'unpaid') {
      setWords(200); // Default to 200 words for Video
    } else {
      setWords(25); // Default for others
    }
  };

  return (
    <BentoCard span="full" className="overflow-hidden !p-0">
      <ContainerInstrument className="flex flex-col lg:flex-row">
        {/* Main Config */}
        <ContainerInstrument className="flex-1 p-8 lg:p-12 space-y-10">
          <ContainerInstrument>
            <HeadingInstrument level={3} className="text-[15px] font-medium text-va-black/30 mb-6">
              <VoiceglotText  translationKey="pricing.step1.title" defaultText="1. Kies je projecttype" />
            </HeadingInstrument>
            <ContainerInstrument className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {usageTypes.map((type) => (
                <ButtonInstrument
                  key={type.id}
                  onClick={() => handleUsageChange(type.id as MediaChannel)}
                  className={`flex flex-col items-center gap-4 p-6 rounded-[32px] border-2 transition-all ${
                    state.usage === type.id 
                      ? 'border-primary bg-primary/5 text-primary' 
                      : 'border-black/5 hover:border-black/10 text-va-black/40'
                  }`}
                >
                  {(() => {
                    const Icon = type.icon;
                    if (!Icon) return null;
                    return (typeof Icon === 'function' || (typeof Icon === 'object' && (Icon as Record<string, any>).$$typeof)) 
                      ? <Icon strokeWidth={1.5} size={24} /> 
                      : Icon;
                  })()}
                  <TextInstrument className="font-medium text-[15px]">
                    <VoiceglotText  translationKey={type.translationKey} defaultText={type.label} />
                  </TextInstrument>
                </ButtonInstrument>
              ))}
            </ContainerInstrument>
          </ContainerInstrument>

          <ContainerInstrument className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <ContainerInstrument>
              <HeadingInstrument level={3} className="text-[15px] font-medium text-va-black/30 mb-6">
                <VoiceglotText  translationKey="pricing.step2.language" defaultText="2. Taal van de productie" />
              </HeadingInstrument>
              <SelectInstrument 
                className="w-full bg-va-off-white border-none rounded-[20px] py-5 px-6 text-[15px] font-medium focus:ring-2 focus:ring-primary/20 transition-all cursor-pointer"
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
              >
                <OptionInstrument value="nl-BE"><VoiceglotText  translationKey="auto.pricingcalculator.vlaams__nl_be_.c0d770" defaultText="Vlaams (NL-BE)" /></OptionInstrument>
                <OptionInstrument value="nl-NL"><VoiceglotText  translationKey="auto.pricingcalculator.nederlands__nl_nl_.6f41f1" defaultText="Nederlands (NL-NL)" /></OptionInstrument>
                <OptionInstrument value="fr-BE"><VoiceglotText  translationKey="auto.pricingcalculator.frans__fr_be_.875106" defaultText="Frans (FR-BE)" /></OptionInstrument>
                <OptionInstrument value="fr-FR"><VoiceglotText  translationKey="auto.pricingcalculator.frans__fr_fr_.659afe" defaultText="Frans (FR-FR)" /></OptionInstrument>
                <OptionInstrument value="en-GB"><VoiceglotText  translationKey="auto.pricingcalculator.engels__uk_.c91091" defaultText="Engels (UK)" /></OptionInstrument>
                <OptionInstrument value="en-US"><VoiceglotText  translationKey="auto.pricingcalculator.engels__us_.12e181" defaultText="Engels (US)" /></OptionInstrument>
                <OptionInstrument value="de-DE"><VoiceglotText  translationKey="auto.pricingcalculator.duits__de_.328280" defaultText="Duits (DE)" /></OptionInstrument>
              </SelectInstrument>
            </ContainerInstrument>

            {state.usage === 'paid' && (
              <ContainerInstrument className="animate-in fade-in slide-in-from-top-4 duration-700">
                <HeadingInstrument level={3} className="text-[15px] font-medium text-va-black/30 mb-6">
                  <VoiceglotText  translationKey="pricing.step2.country" defaultText="3. Land van uitzending" />
                </HeadingInstrument>
                <SelectInstrument 
                  className="w-full bg-va-off-white border-none rounded-[20px] py-5 px-6 text-[15px] font-medium focus:ring-2 focus:ring-primary/20 transition-all cursor-pointer"
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                >
                  <OptionInstrument value="BE"><VoiceglotText  translationKey="common.country.be" defaultText="België" /></OptionInstrument>
                  <OptionInstrument value="NL"><VoiceglotText  translationKey="common.country.nl" defaultText="Nederland" /></OptionInstrument>
                  <OptionInstrument value="FR"><VoiceglotText  translationKey="common.country.fr" defaultText="Frankrijk" /></OptionInstrument>
                  <OptionInstrument value="EU"><VoiceglotText  translationKey="common.country.eu" defaultText="Europa" /></OptionInstrument>
                  <OptionInstrument value="GLOBAL"><VoiceglotText  translationKey="common.country.global" defaultText="Wereldwijd" /></OptionInstrument>
                </SelectInstrument>
              </ContainerInstrument>
            )}
          </ContainerInstrument>

          {state.usage === 'paid' ? (
            <ContainerInstrument className="space-y-10 animate-in fade-in slide-in-from-top-4 duration-700">
              <ContainerInstrument className="space-y-6">
                <HeadingInstrument level={3} className="text-[15px] font-medium text-va-black/30">
                  <VoiceglotText  translationKey="pricing.media_buyout" defaultText="4. Media & Buyout" />
                </HeadingInstrument>
                <ContainerInstrument className="flex flex-col gap-4">
                  <div className="grid grid-cols-1 gap-3">
                    {[
                      { id: 'online', label: 'Online & Socials', sub: 'YouTube, Meta, LinkedIn', icon: Globe },
                      { id: 'podcast', label: 'Podcast', sub: 'Pre-roll, Mid-roll', icon: Mic2 },
                      { id: 'radio', label: 'Radio', sub: 'Landelijke of regionale zenders', icon: Radio, hasRegions: true },
                      { id: 'tv', label: 'TV', sub: 'Landelijke of regionale zenders', icon: Tv, hasRegions: true }
                    ].map((m) => {
                      const isActive = media.includes(m.id as MediaChannel);
                      return (
                        <div key={m.id} className="space-y-3">
                          <button
                            onClick={() => {
                              const mId = m.id as MediaChannel;
                              if (isActive) {
                                if (media.length > 1) setMedia(media.filter(item => item !== mId));
                              } else {
                                setMedia([...media, mId]);
                              }
                            }}
                            className={cn(
                              "w-full flex items-center justify-between p-4 rounded-2xl border-2 transition-all duration-500",
                              isActive ? "border-primary bg-primary/[0.02] shadow-sm" : "border-black/5 bg-va-off-white/30 hover:border-black/10"
                            )}
                          >
                            <div className="flex items-center gap-4">
                              <div className={cn(
                                "w-10 h-10 rounded-xl flex items-center justify-center transition-colors",
                                isActive ? "bg-primary text-white" : "bg-white text-va-black/20 shadow-sm border border-black/5"
                              )}>
                                <m.icon size={20} />
                              </div>
                              <div className="text-left">
                                <div className={cn("text-[14px] font-bold tracking-tight", isActive ? "text-va-black" : "text-va-black/40")}>{m.label}</div>
                                <div className="text-[11px] text-va-black/20 font-medium">{m.sub}</div>
                              </div>
                            </div>
                            <div className={cn(
                              "w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all",
                              isActive ? "bg-primary border-primary text-white" : "border-black/10"
                            )}>
                              {isActive && <Check size={14} />}
                            </div>
                          </button>

                          {isActive && m.hasRegions && (
                            <motion.div 
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              className="px-4 pb-4 space-y-4 border-l-2 border-primary/10 ml-5"
                            >
                              <div className="bg-va-off-white/50 p-6 rounded-[32px] border border-black/5 space-y-4">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-primary text-white flex items-center justify-center shadow-sm">
                                      {m.id === 'radio' ? <Radio size={20} /> : <Tv size={20} />}
                                    </div>
                                    <div>
                                      <TextInstrument className="text-[14px] font-bold tracking-tight text-va-black">
                                        {m.label} Commercial
                                      </TextInstrument>
                                      <TextInstrument className="text-[11px] text-va-black/30 font-medium uppercase tracking-widest">
                                        Uitzendgebied
                                      </TextInstrument>
                                    </div>
                                  </div>
                                </div>
                                <div className="flex items-center gap-3 bg-white p-1 rounded-2xl border border-black/5 shadow-inner">
                                  <button 
                                    onClick={() => {
                                      const current = mediaRegion[m.id] || 'Nationaal';
                                      const regions = ['Lokaal', 'Regionaal', 'Nationaal'];
                                      const currentIndex = regions.indexOf(current);
                                      const nextIndex = Math.max(0, currentIndex - 1);
                                      setMediaRegion(prev => ({ ...prev, [m.id]: regions[nextIndex] as Region }));
                                    }}
                                    className="w-10 h-10 flex items-center justify-center text-va-black/40 hover:text-primary transition-colors"
                                  >
                                    <Minus size={16} strokeWidth={2.5} />
                                  </button>
                                  <span className="flex-1 text-[14px] font-bold text-primary text-center uppercase tracking-tight">
                                    {mediaRegion[m.id] || 'Nationaal'}
                                  </span>
                                  <button 
                                    onClick={() => {
                                      const current = mediaRegion[m.id] || 'Nationaal';
                                      const regions = ['Lokaal', 'Regionaal', 'Nationaal'];
                                      const currentIndex = regions.indexOf(current);
                                      const nextIndex = Math.min(regions.length - 1, currentIndex + 1);
                                      setMediaRegion(prev => ({ ...prev, [m.id]: regions[nextIndex] as Region }));
                                    }}
                                    className="w-10 h-10 flex items-center justify-center text-va-black/40 hover:text-primary transition-colors"
                                  >
                                    <Plus size={16} strokeWidth={2.5} />
                                  </button>
                                </div>
                              </div>
                            </motion.div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </ContainerInstrument>
                
                <ContainerInstrument className="grid grid-cols-2 gap-8">
                  <ContainerInstrument className="space-y-4">
                    <TextInstrument className="text-[15px] font-medium text-va-black/30 tracking-widest">
                      <VoiceglotText  translationKey="pricing.spots_count" defaultText="Aantal Spots" />
                    </TextInstrument>
                    <ContainerInstrument className="flex items-center gap-4">
                      <InputInstrument 
                        type="range" min="1" max="10" value={spots} 
                        onChange={(e) => setSpots(parseInt(e.target.value))}
                        className="flex-1 h-2 bg-black/5 rounded-[20px] appearance-none cursor-pointer accent-primary"
                      />
                      <TextInstrument className="text-xl font-light text-primary w-8">{spots}</TextInstrument>
                    </ContainerInstrument>
                  </ContainerInstrument>
                  <ContainerInstrument className="space-y-4">
                    <TextInstrument className="text-[15px] font-medium text-va-black/30 tracking-widest">
                      <VoiceglotText  translationKey="pricing.duration_years" defaultText="Looptijd (Jaar)" />
                    </TextInstrument>
                                        <div className="flex items-center gap-3 bg-va-off-white p-1 rounded-lg border border-black/5">
                                          <button 
                                            onClick={() => {
                                              const current = years;
                                              const next = current === 2 ? 1 : (current === 1 ? 0.25 : 0.25);
                                              setYears(next);
                                            }}
                                            className="w-6 h-6 flex items-center justify-center text-va-black/40 hover:text-primary transition-colors"
                                          >-</button>
                                          <span className="text-[12px] font-black text-primary min-w-[45px] text-center">
                                            {years === 0.25 ? '3 mnd' : 
                                             years === 0.5 ? '6 mnd' : 
                                             `${years} jaar`}
                                          </span>
                                          <button 
                                            onClick={() => {
                                              const current = years;
                                              const next = current === 0.25 ? 1 : (current === 1 ? 2 : 2);
                                              setYears(next);
                                            }}
                                            className="w-6 h-6 flex items-center justify-center text-va-black/40 hover:text-primary transition-colors"
                                          >+</button>
                                        </div>
                  </ContainerInstrument>
                </ContainerInstrument>
              </ContainerInstrument>

              {/*  Sherlock: Universele VoiceCards in Pricing voor directe vergelijking */}
              <ContainerInstrument className="pt-10 border-t border-black/5">
                <HeadingInstrument level={3} className="text-[15px] font-medium text-va-black/30 mb-8">
                  <VoiceglotText  translationKey="pricing.matching_voices" defaultText="Direct vergelijken & boeken" />
                </HeadingInstrument>
                <ContainerInstrument className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredActors.map((a) => (
                    <VoiceCard 
                      key={a.id} 
                      voice={a} 
                      onSelect={() => {
                        selectActor(a);
                        handleBookNow();
                      }}
                    />
                  ))}
                </ContainerInstrument>
              </ContainerInstrument>
            </ContainerInstrument>
          ) : (
            <ContainerInstrument>
            <ContainerInstrument className="flex justify-between items-center mb-6">
                <HeadingInstrument level={3} className="text-[15px] font-medium text-va-black/30">
                  4. <VoiceglotText  translationKey="pricing.step3.words" defaultText="Aantal woorden" />
                </HeadingInstrument>
              </ContainerInstrument>
              <ContainerInstrument className="flex items-center gap-4 mb-4">
                <InputInstrument 
                  type="range" 
                  min="1" 
                  max={state.usage === 'telefonie' ? 500 : 5000} 
                  value={words} 
                  onChange={(e) => setWords(parseInt(e.target.value))}
                  className="flex-1 h-2 bg-black/5 rounded-[20px] appearance-none cursor-pointer accent-primary"
                />
                <ContainerInstrument className="relative">
                  <InputInstrument 
                    type="number" 
                    value={words} 
                    onChange={(e) => setWords(Math.max(1, parseInt(e.target.value) || 0))}
                    className="w-24 bg-va-off-white border-2 border-primary/20 rounded-xl py-3 px-4 text-[15px] font-medium text-primary text-center focus:border-primary focus:ring-0 outline-none transition-all"
                  />
                  <TextInstrument className="absolute -top-2 -right-2 bg-primary text-white text-[15px] font-medium px-1.5 py-0.5 rounded-md shadow-lg">
                    <VoiceglotText  translationKey="common.fill_in" defaultText="Vul in" />
                  </TextInstrument>
                </ContainerInstrument>
              </ContainerInstrument>
              <ContainerInstrument className="flex justify-between items-center">
                <TextInstrument className="text-[15px] font-medium text-va-black/20">
                  1 <VoiceglotText  translationKey="pricing.unit.word" defaultText="woord" />
                </TextInstrument>
                <TextInstrument className="text-xl font-light tracking-tighter text-primary">
                  {words} <VoiceglotText  translationKey="pricing.unit.words" defaultText="woorden" />
                </TextInstrument>
                <ContainerInstrument className="flex flex-col items-end">
                  <TextInstrument className="text-[15px] font-medium text-va-black/20">
                    {state.usage === 'telefonie' ? '500+' : '5000+'}
                  </TextInstrument>
                  <TextInstrument className="text-[15px] font-medium text-primary/40 tracking-tighter">
                     {Math.floor(words / 160)}:{(Math.round((words % 160) / 160 * 60)).toString().padStart(2, '0')} min (160 wpm)
                  </TextInstrument>
                </ContainerInstrument>
              </ContainerInstrument>

              {/*  Sherlock: Universele VoiceCards in Pricing voor directe vergelijking */}
              <ContainerInstrument className="pt-10 border-t border-black/5">
                <HeadingInstrument level={3} className="text-[15px] font-medium text-va-black/30 mb-8">
                  <VoiceglotText  translationKey="pricing.matching_voices" defaultText="Direct vergelijken & boeken" />
                </HeadingInstrument>
                <ContainerInstrument className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredActors.map((a) => (
                    <VoiceCard 
                      key={a.id} 
                      voice={a} 
                      onSelect={() => {
                        selectActor(a);
                        handleBookNow();
                      }}
                    />
                  ))}
                </ContainerInstrument>
              </ContainerInstrument>
            </ContainerInstrument>
          )}

          {state.usage === 'telefonie' && (
            <ContainerInstrument className="pt-6 border-t border-black/5 animate-in fade-in duration-500">
              <ContainerInstrument className="flex items-center justify-between mb-6">
                <ContainerInstrument className="flex items-center gap-3">
                  <ContainerInstrument className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center transition-all",
                    (state.music.asBackground || state.music.asHoldMusic) ? "bg-primary/10 text-primary" : "bg-va-black/5 text-va-black/20"
                  )}>
                    <Music strokeWidth={1.5} size={20} />
                  </ContainerInstrument>
                  <ContainerInstrument>
                    <HeadingInstrument level={3} className="text-[15px] font-medium tracking-tight">
                      <VoiceglotText  translationKey="pricing.music.title" defaultText="Wachtmuziek toevoegen" />
                    </HeadingInstrument>
                    <TextInstrument className="text-[15px] text-va-black/40 font-light">
                      <VoiceglotText  translationKey="pricing.music.subtitle" defaultText="Kies een track uit onze rechtenvrije bibliotheek." />
                    </TextInstrument>
                  </ContainerInstrument>
                </ContainerInstrument>
                <ContainerInstrument className="text-right">
                  <TextInstrument className="text-lg font-light text-va-black">59</TextInstrument>
                </ContainerInstrument>
              </ContainerInstrument>

              <ContainerInstrument className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <ButtonInstrument 
                  onClick={() => updateMusic({ asBackground: !state.music.asBackground, trackId: state.music.trackId || 'corporate-growth' })}
                  className={cn(
                    "flex items-center gap-3 p-4 rounded-xl border-2 transition-all text-left",
                    state.music.asBackground ? "border-primary bg-primary/5" : "border-black/5 bg-va-off-white/30 hover:border-black/10"
                  )}
                >
                  <ContainerInstrument className={cn("w-5 h-5 rounded-md border-2 flex items-center justify-center", state.music.asBackground ? "bg-primary border-primary text-white" : "border-black/10")}>
                    {state.music.asBackground && <Check strokeWidth={1.5} size={12} />}
                  </ContainerInstrument>
                  <ContainerInstrument>
                    <TextInstrument className="text-[15px] font-medium tracking-tight"><VoiceglotText  translationKey="auto.pricingcalculator.achtergrondmuziek.bb0154" defaultText="Achtergrondmuziek" /></TextInstrument>
                    <TextInstrument className="text-[15px] font-light text-va-black/40"><VoiceglotText  translationKey="auto.pricingcalculator.gemixt_onder_de_stem.5c81ba" defaultText="Gemixt onder de stem." /></TextInstrument>
                  </ContainerInstrument>
                </ButtonInstrument>

                <ButtonInstrument 
                  onClick={() => updateMusic({ asHoldMusic: !state.music.asHoldMusic, trackId: state.music.trackId || 'corporate-growth' })}
                  className={cn(
                    "flex items-center gap-3 p-4 rounded-xl border-2 transition-all text-left",
                    state.music.asHoldMusic ? "border-primary bg-primary/5" : "border-black/5 bg-va-off-white/30 hover:border-black/10"
                  )}
                >
                  <ContainerInstrument className={cn("w-5 h-5 rounded-md border-2 flex items-center justify-center", state.music.asHoldMusic ? "bg-primary border-primary text-white" : "border-black/10")}>
                    {state.music.asHoldMusic && <Check strokeWidth={1.5} size={12} />}
                  </ContainerInstrument>
                  <ContainerInstrument>
                    <TextInstrument className="text-[15px] font-medium tracking-tight"><VoiceglotText  translationKey="auto.pricingcalculator.wachtmuziek.57fcdd" defaultText="Wachtmuziek" /></TextInstrument>
                    <TextInstrument className="text-[15px] font-light text-va-black/40"><VoiceglotText  translationKey="auto.pricingcalculator.als_apart_audiobesta.ce73d8" defaultText="Als apart audiobestand." /></TextInstrument>
                  </ContainerInstrument>
                </ButtonInstrument>
              </ContainerInstrument>
            </ContainerInstrument>
          )}
        </ContainerInstrument>

        {/* Result Sidebar */}
        <ContainerInstrument className="lg:w-[380px] bg-va-black text-white p-8 lg:p-12 flex flex-col justify-center text-center relative overflow-hidden">
          <ContainerInstrument className="relative z-10 space-y-8">
            
            <ContainerInstrument className="space-y-2">
              <TextInstrument className="text-6xl font-light tracking-tighter text-primary">
                {pricing.formatted}
              </TextInstrument>
              <ContainerInstrument className="space-y-1">
                <TextInstrument className="text-[15px] font-medium text-white/20">
                  <VoiceglotText  translationKey="common.excl_vat" defaultText="Exclusief BTW" />
                </TextInstrument>
                <TextInstrument className="text-[15px] font-medium text-white/40 tracking-widest">
                  <VoiceglotText  translationKey="pricing.inclusive_label" defaultText="(Inclusief)" />
                </TextInstrument>
              </ContainerInstrument>
            </ContainerInstrument>

            <ContainerInstrument className="pt-8 space-y-4">
            <ButtonInstrument 
              onClick={handleBookNow}
              className={cn(
                "va-btn-pro w-full flex items-center justify-center gap-2 group",
                PricingEngine.getAvailabilityStatus(
                  actor || (filteredActors && filteredActors[0]) || {}, 
                  state.usage === 'paid' ? media : [], 
                  country
                ) === 'unavailable' && state.usage === 'paid' ? "opacity-50 cursor-not-allowed !bg-va-black" : "!bg-primary"
              )}
            >
              <VoiceglotText 
                translationKey={PricingEngine.getAvailabilityStatus(
                  actor || (filteredActors && filteredActors[0]) || {}, 
                  state.usage === 'paid' ? media : [], 
                  country
                ) === 'unavailable' && state.usage === 'paid' ? "common.unavailable" : "pricing.cta"} 
                defaultText={PricingEngine.getAvailabilityStatus(
                  actor || (filteredActors && filteredActors[0]) || {}, 
                  state.usage === 'paid' ? media : [], 
                  country
                ) === 'unavailable' && state.usage === 'paid' ? "Niet beschikbaar" : "Kies je stem"} 
              />
              <ChevronRight strokeWidth={1.5} size={18} className="group-hover:translate-x-1 transition-transform" />
            </ButtonInstrument>
              <ContainerInstrument className="space-y-2 opacity-0">
                <TextInstrument className="text-[15px] font-medium text-primary animate-pulse">
                  <VoiceglotText  translationKey="pricing.final_price" defaultText="Finale prijs voor deze opdracht" />
                </TextInstrument>
                <TextInstrument className="text-[15px] font-light text-white/40 leading-relaxed">
                  {mode === 'ai' ? (
                    <VoiceglotText  
                      translationKey="pricing.disclaimer.ai" 
                      defaultText="Inclusief alle formaten (8kHz & 48kHz). Gratis proevertje is altijd 8kHz." 
                    />
                  ) : (
                    <VoiceglotText  
                      translationKey="pricing.disclaimer" 
                      defaultText="Inclusief studiosessie, nabewerking en retakes op tone-of-voice. Geen verrassingen." 
                    />
                  )}
                </TextInstrument>
              </ContainerInstrument>
            </ContainerInstrument>
          </ContainerInstrument>

          {/* Decorative Background */}
          <ContainerInstrument className="absolute -bottom-20 -right-20 w-64 h-64 bg-primary/10 rounded-full blur-[100px]" />
        </ContainerInstrument>
      </ContainerInstrument>
    </BentoCard>
  );
};
