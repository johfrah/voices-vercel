"use client";

import { useCheckout } from '@/contexts/CheckoutContext';
import { MediaChannel, PricingEngine, Region } from '@/lib/pricing-engine';
import { cn } from '@/lib/utils';
import { Check, ChevronRight, Megaphone, Music, Phone, Video } from 'lucide-react';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import { BentoCard } from './BentoGrid';
import { VoiceglotText } from './VoiceglotText';

interface PricingCalculatorProps {
  mode?: 'human' | 'ai';
  actor?: any;
}

export const PricingCalculator: React.FC<PricingCalculatorProps> = ({ mode = 'human', actor }) => {
  const { state, updateUsage, updateBriefing, updateMusic, setStep } = useCheckout();
  const router = useRouter();
  const [words, setWords] = useState(25);
  const [country, setCountry] = useState('BE');
  const [media, setMedia] = useState<MediaChannel[]>(['online']);
  const [tvRegion, setTvRegion] = useState<Region>('Nationaal');
  const [radioRegion, setRadioRegion] = useState<Region>('Nationaal');
  const [spots, setSpots] = useState(1);
  const [years, setYears] = useState(1);
  const [language, setLanguage] = useState('nl-BE');
  const [filteredActors, setFilteredActors] = useState<any[]>([]);
  const [pricing, setPricing] = useState({ price: 0, formatted: '€ 0,00' });

  const pricingConfig = PricingEngine.getDefaultConfig();

  // 🎙️ Fetch & Filter Voices based on criteria
  useEffect(() => {
    const fetchVoices = async () => {
      try {
        const res = await fetch(`/api/admin/config?type=actors&lang=${language.split('-')[0]}`);
        const data = await res.json();
        const allActors = data.results || [];
        
        // Filter op taal en of ze tarieven hebben voor de geselecteerde usage
        const relevant = allActors.filter((a: any) => {
          const hasLang = a.languages?.some((l: any) => l.code === language || l.code === language.split('-')[0]);
          if (!hasLang) return false;

          if (state.usage === 'paid') {
            // Voor commercials moeten ze minimaal één paid rate hebben
            const rates = a.rates_raw || {};
            return Object.values(rates).some((r: any) => r.price_online_media || r.price_tv_national || r.price_radio_national);
          }
          return true;
        });

        setFilteredActors(relevant.slice(0, 6)); // Toon top 6
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
      // 🛡️ NUCLEAR FALLBACK: Als er geen acteurs zijn, gebruik de globale defaults
      price_unpaid_media: 239,
      price_ivr: 89,
      rates: {}
    });

    const wordCount = Number(words) || 0;

    const result = PricingEngine.calculatePrice(actorRates, {
      usage: state.usage as any,
      words: wordCount,
      prompts: state.usage === 'telefonie' ? 1 : 0,
      countries: [country],
      media: media,
      tvRegion,
      radioRegion,
      spots: Number(spots) || 1,
      years: Number(years) || 1,
      useEntryPricing: mode === 'ai',
      musicMix: state.music.asBackground || state.music.asHoldMusic
    });
    
    // 🎭 Dynamic Result Label based on usage
    const formattedPrice = result.price === 0 && state.usage === 'paid' 
      ? 'Op aanvraag' 
      : result.formatted;

    setPricing({ ...result, formatted: formattedPrice });
  }, [state.usage, words, country, media, tvRegion, radioRegion, spots, years, mode, actor, filteredActors, state.music.asBackground, state.music.asHoldMusic]);

  const handleBookNow = () => {
    // 🛡️ ZERO PRICE PROTECTION
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
    
    // If we have a selected actor (from the VoicePage), we skip the voice selection step
    if (state.selectedActor) {
      setStep('details');
      router.push(`/checkout?usage=${state.usage}&words=${words}&voice=${state.selectedActor.slug}`);
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

  const handleUsageChange = (newUsage: any) => {
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
      <div className="flex flex-col lg:flex-row">
        {/* Main Config */}
        <div className="flex-1 p-8 lg:p-12 space-y-10">
          <div>
            <h3 className="text-sm font-medium text-va-black/30 mb-6">
              <VoiceglotText translationKey="pricing.step1.title" defaultText="1. Kies je projecttype" />
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {usageTypes.map((type) => (
                <button
                  key={type.id}
                  onClick={() => handleUsageChange(type.id as any)}
                  className={`flex flex-col items-center gap-4 p-6 rounded-[32px] border-2 transition-all ${
                    state.usage === type.id 
                      ? 'border-primary bg-primary/5 text-primary' 
                      : 'border-black/5 hover:border-black/10 text-va-black/40'
                  }`}
                >
                  <type.icon size={24} />
                  <span className="font-medium text-[15px]">
                    <VoiceglotText translationKey={type.translationKey} defaultText={type.label} />
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div>
              <h3 className="text-sm font-medium text-va-black/30 mb-6">
                <VoiceglotText translationKey="pricing.step2.language" defaultText="2. Taal van de productie" />
              </h3>
              <select 
                className="w-full bg-va-off-white border-none rounded-[20px] py-5 px-6 text-[15px] font-medium focus:ring-2 focus:ring-primary/20 transition-all cursor-pointer"
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
              >
                <option value="nl-BE">Vlaams (NL-BE)</option>
                <option value="nl-NL">Nederlands (NL-NL)</option>
                <option value="fr-BE">Frans (FR-BE)</option>
                <option value="fr-FR">Frans (FR-FR)</option>
                <option value="en-GB">Engels (UK)</option>
                <option value="en-US">Engels (US)</option>
                <option value="de-DE">Duits (DE)</option>
              </select>
            </div>

            {state.usage === 'paid' && (
              <div className="animate-in fade-in slide-in-from-top-4 duration-700">
                <h3 className="text-sm font-medium text-va-black/30 mb-6">
                  <VoiceglotText translationKey="pricing.step2.country" defaultText="3. Land van uitzending" />
                </h3>
                <select 
                  className="w-full bg-va-off-white border-none rounded-[20px] py-5 px-6 text-[15px] font-medium focus:ring-2 focus:ring-primary/20 transition-all cursor-pointer"
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                >
                  <option value="BE"><VoiceglotText translationKey="common.country.be" defaultText="België" /></option>
                  <option value="NL"><VoiceglotText translationKey="common.country.nl" defaultText="Nederland" /></option>
                  <option value="FR"><VoiceglotText translationKey="common.country.fr" defaultText="Frankrijk" /></option>
                  <option value="EU"><VoiceglotText translationKey="common.country.eu" defaultText="Europa" /></option>
                  <option value="GLOBAL"><VoiceglotText translationKey="common.country.global" defaultText="Wereldwijd" /></option>
                </select>
              </div>
            )}
          </div>

          {state.usage === 'paid' ? (
            <div className="space-y-10 animate-in fade-in slide-in-from-top-4 duration-700">
              <div className="space-y-6">
                <h3 className="text-sm font-medium text-va-black/30">
                  <VoiceglotText translationKey="pricing.media_buyout" defaultText="4. Media & Buyout" />
                </h3>
                <div className="flex flex-wrap gap-2">
                  {['online', 'radio', 'tv', 'podcast'].map((m) => (
                    <button
                      key={m}
                      onClick={() => {
                        if (media.includes(m as any)) {
                          if (media.length > 1) setMedia(media.filter(item => item !== m));
                        } else {
                          setMedia([...media, m as any]);
                        }
                      }}
                      className={`px-6 py-3 rounded-full text-[15px] font-medium border-2 transition-all ${
                        media.includes(m as any) ? 'bg-primary border-primary text-white' : 'bg-white border-black/5 text-va-black/40'
                      }`}
                    >
                      <VoiceglotText translationKey={`common.media.${m}`} defaultText={m} />
                    </button>
                  ))}
                </div>
                
                <div className="grid grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <span className="text-[15px] font-medium text-va-black/30 tracking-widest">
                      <VoiceglotText translationKey="pricing.spots_count" defaultText="Aantal Spots" />
                    </span>
                    <div className="flex items-center gap-4">
                      <input 
                        type="range" min="1" max="10" value={spots} 
                        onChange={(e) => setSpots(parseInt(e.target.value))}
                        className="flex-1 h-2 bg-black/5 rounded-lg appearance-none cursor-pointer accent-primary"
                      />
                      <span className="text-xl font-light text-primary w-8">{spots}</span>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <span className="text-[15px] font-medium text-va-black/30 tracking-widest">
                      <VoiceglotText translationKey="pricing.duration_years" defaultText="Looptijd (Jaar)" />
                    </span>
                    <div className="flex items-center gap-4">
                      <input 
                        type="range" min="1" max="5" value={years} 
                        onChange={(e) => setYears(parseInt(e.target.value))}
                        className="flex-1 h-2 bg-black/5 rounded-lg appearance-none cursor-pointer accent-primary"
                      />
                      <span className="text-xl font-light text-primary w-8">{years}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* 🎙️ Dynamic Voice Preview for Paid */}
              <div className="pt-10 border-t border-black/5">
                <h3 className="text-sm font-medium text-va-black/30 mb-8">
                  <VoiceglotText translationKey="pricing.matching_voices" defaultText="Beschikbare stemmen voor dit tarief" />
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {filteredActors.map((a) => {
                    const actorPrice = PricingEngine.calculatePrice(
                      { ...a, rates: a.rates_raw }, 
                      { usage: 'paid', media, countries: [country], spots, years }
                    );
                    return (
                      <div key={a.id} className="p-4 bg-va-off-white rounded-[32px] border border-black/5 flex flex-col items-center text-center group hover:border-primary/20 transition-all">
                        <div className="w-12 h-12 rounded-full bg-primary/10 mb-3 flex items-center justify-center font-medium text-primary group-hover:bg-primary group-hover:text-white transition-all">
                          {a.first_name[0]}
                        </div>
                        <span className="text-[15px] font-medium mb-1">{a.first_name}</span>
                        <span className="text-[15px] font-medium text-primary">{actorPrice.formatted.split(',')[0]}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ) : (
            <div>
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-sm font-medium text-va-black/30">
                  4. <VoiceglotText translationKey="pricing.step3.words" defaultText="Aantal woorden" />
                </h3>
              </div>
              <div className="flex items-center gap-4 mb-4">
                <input 
                  type="range" 
                  min="1" 
                  max={state.usage === 'telefonie' ? 500 : 5000} 
                  value={words} 
                  onChange={(e) => setWords(parseInt(e.target.value))}
                  className="flex-1 h-2 bg-black/5 rounded-lg appearance-none cursor-pointer accent-primary"
                />
                <div className="relative">
                  <input 
                    type="number" 
                    value={words} 
                    onChange={(e) => setWords(Math.max(1, parseInt(e.target.value) || 0))}
                    className="w-24 bg-va-off-white border-2 border-primary/20 rounded-xl py-3 px-4 text-sm font-medium text-primary text-center focus:border-primary focus:ring-0 outline-none transition-all"
                  />
                  <span className="absolute -top-2 -right-2 bg-primary text-white text-[15px] font-medium px-1.5 py-0.5 rounded-md shadow-lg">
                    <VoiceglotText translationKey="common.fill_in" defaultText="Vul in" />
                  </span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[15px] font-medium text-va-black/20">
                  1 <VoiceglotText translationKey="pricing.unit.word" defaultText="woord" />
                </span>
                <span className="text-xl font-light tracking-tighter text-primary">
                  {words} <VoiceglotText translationKey="pricing.unit.words" defaultText="woorden" />
                </span>
                <div className="flex flex-col items-end">
                  <span className="text-[15px] font-medium text-va-black/20">
                    {state.usage === 'telefonie' ? '500+' : '5000+'}
                  </span>
                  <span className="text-[15px] font-medium text-primary/40 tracking-tighter">
                    ± {Math.floor(words / 160)}:{(Math.round((words % 160) / 160 * 60)).toString().padStart(2, '0')} min (160 wpm)
                  </span>
                </div>
              </div>
            </div>
          )}

          {state.usage === 'telefonie' && (
            <div className="pt-6 border-t border-black/5 animate-in fade-in duration-500">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center transition-all",
                    (state.music.asBackground || state.music.asHoldMusic) ? "bg-primary/10 text-primary" : "bg-va-black/5 text-va-black/20"
                  )}>
                    <Music size={20} />
                  </div>
                  <div>
                    <h3 className="text-sm font-medium tracking-tight">
                      <VoiceglotText translationKey="pricing.music.title" defaultText="Wachtmuziek toevoegen" />
                    </h3>
                    <p className="text-[15px] text-va-black/40 font-light">
                      <VoiceglotText translationKey="pricing.music.subtitle" defaultText="Kies een track uit onze rechtenvrije bibliotheek." />
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-lg font-light text-va-black">€59</span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button 
                  onClick={() => updateMusic({ asBackground: !state.music.asBackground, trackId: state.music.trackId || 'corporate-growth' })}
                  className={cn(
                    "flex items-center gap-3 p-4 rounded-xl border-2 transition-all text-left",
                    state.music.asBackground ? "border-primary bg-primary/5" : "border-black/5 bg-va-off-white/30 hover:border-black/10"
                  )}
                >
                  <div className={cn("w-5 h-5 rounded-md border-2 flex items-center justify-center", state.music.asBackground ? "bg-primary border-primary text-white" : "border-black/10")}>
                    {state.music.asBackground && <Check strokeWidth={1.5} size={12} />}
                  </div>
                  <div>
                    <p className="text-[15px] font-medium tracking-tight">Achtergrondmuziek</p>
                    <p className="text-[15px] font-light text-va-black/40">Gemixt onder de stem.</p>
                  </div>
                </button>

                <button 
                  onClick={() => updateMusic({ asHoldMusic: !state.music.asHoldMusic, trackId: state.music.trackId || 'corporate-growth' })}
                  className={cn(
                    "flex items-center gap-3 p-4 rounded-xl border-2 transition-all text-left",
                    state.music.asHoldMusic ? "border-primary bg-primary/5" : "border-black/5 bg-va-off-white/30 hover:border-black/10"
                  )}
                >
                  <div className={cn("w-5 h-5 rounded-md border-2 flex items-center justify-center", state.music.asHoldMusic ? "bg-primary border-primary text-white" : "border-black/10")}>
                    {state.music.asHoldMusic && <Check strokeWidth={1.5} size={12} />}
                  </div>
                  <div>
                    <p className="text-[15px] font-medium tracking-tight">Wachtmuziek</p>
                    <p className="text-[15px] font-light text-va-black/40">Als apart audiobestand.</p>
                  </div>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Result Sidebar */}
        <div className="lg:w-[380px] bg-va-black text-white p-8 lg:p-12 flex flex-col justify-center text-center relative overflow-hidden">
          <div className="relative z-10 space-y-8">
            
            <div className="space-y-2">
              <div className="text-6xl font-light tracking-tighter text-primary">
                {pricing.formatted}
              </div>
              <div className="space-y-1">
                <p className="text-[15px] font-medium text-white/20">
                  <VoiceglotText translationKey="common.excl_vat" defaultText="Exclusief BTW" />
                </p>
                <p className="text-sm font-medium text-white/40 tracking-widest">
                  <VoiceglotText translationKey="pricing.inclusive_label" defaultText="(Inclusief)" />
                </p>
              </div>
            </div>

            <div className="pt-8 space-y-4">
              <button 
                onClick={handleBookNow}
                className="va-btn-pro w-full !bg-primary flex items-center justify-center gap-2 group"
              >
                <VoiceglotText translationKey="pricing.cta" defaultText="Kies je stem" /> 
                <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </button>
              <div className="space-y-2 opacity-0">
                <p className="text-[15px] font-medium text-primary animate-pulse">
                  <VoiceglotText translationKey="pricing.final_price" defaultText="Finale prijs voor deze opdracht" />
                </p>
                <p className="text-[15px] font-light text-white/40 leading-relaxed">
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
                </p>
              </div>
            </div>
          </div>

          {/* Decorative Background */}
          <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-primary/10 rounded-full blur-[100px]" />
        </div>
      </div>
    </BentoCard>
  );
};
