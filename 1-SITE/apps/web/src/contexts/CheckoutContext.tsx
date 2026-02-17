"use client";

import { PlanType, PricingEngine, UsageType } from '@/lib/pricing-engine';
import { Actor } from '@/types';
import { CheckCircle2 } from 'lucide-react';
import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';

interface CheckoutState {
  step: 'briefing' | 'voice' | 'details' | 'payment' | 'done';
  journey: 'studio' | 'academy' | 'agency' | 'johfrai-subscription';
  courseId?: number;
  editionId?: number;
  upsells: {
    workshop_home: boolean;
  };
  briefing: string;
  pronunciation: string;
  usage: UsageType;
  plan: PlanType;
  media: string[];
    country: string | string[]; // Updated to support array
    prompts: number;
    spots: number;
    years: number;
    spotsDetail?: Record<string, number>;
    yearsDetail?: Record<string, number>;
    liveSession: boolean;
    selectedActor: Actor | null;
    isQuoteRequest: boolean;
    music: {
      trackId: string | null;
      asBackground: boolean;
      asHoldMusic: boolean;
    };
    customer: {
      first_name: string;
      last_name: string;
      email: string;
      phone: string;
      company: string;
      vat_number: string;
      address: string;
      address_street: string;
      city: string;
      postal_code: string;
      country: string;
    };
    items: any[];
    isLocked: boolean;
    pricing: {
      base: number;
      wordSurcharge: number;
      mediaSurcharge: number;
      musicSurcharge: number;
      total: number;
      legalDisclaimer?: string;
    };
  }
  
  interface CheckoutContextType {
    state: CheckoutState;
    setStep: (step: CheckoutState['step']) => void;
    setJourney: (journey: CheckoutState['journey'], courseId?: number) => void;
    toggleUpsell: (upsell: keyof CheckoutState['upsells']) => void;
    updateBriefing: (briefing: string) => void;
    updatePronunciation: (pronunciation: string) => void;
    updateUsage: (usage: CheckoutState['usage']) => void;
    updatePlan: (plan: PlanType) => void;
    updateMedia: (media: CheckoutState['media']) => void;
    updateCountry: (country: string | string[]) => void;
    updateSpots: (spots: number) => void;
    updateYears: (years: number) => void;
    updateSpotsDetail: (detail: Record<string, number>) => void;
    updateYearsDetail: (detail: Record<string, number>) => void;
    updateLiveSession: (liveSession: boolean) => void;
    updateIsQuoteRequest: (isQuote: boolean) => void;
    updateMusic: (music: Partial<CheckoutState['music']>) => void;
    selectActor: (actor: Actor | null) => void;
    updateCustomer: (customer: Partial<CheckoutState['customer']>) => void;
    addItem: (item: any) => void;
    removeItem: (itemId: string) => void;
    calculatePricing: () => void;
    lockPrice: () => void;
    unlockPrice: () => void;
    isVatExempt: boolean;
  }
  
  const initialState: CheckoutState = {
    step: 'briefing',
    journey: 'agency',
    upsells: {
      workshop_home: false,
    },
    briefing: '',
    pronunciation: '',
    usage: 'unpaid',
    plan: 'basic',
    media: ['online'],
    country: 'BE',
    prompts: 1,
    spots: 1,
    years: 1,
    isQuoteRequest: false,
    liveSession: false,
    selectedActor: null,
    music: {
      trackId: null,
      asBackground: false,
      asHoldMusic: false,
    },
    customer: {
      first_name: '',
      last_name: '',
      email: '',
      phone: '',
      company: '',
      vat_number: '',
      address: '',
      address_street: '',
      city: '',
      postal_code: '',
      country: 'BE',
    },
    items: [],
    isLocked: false,
    pricing: {
      base: 0,
      wordSurcharge: 0,
      mediaSurcharge: 0,
      musicSurcharge: 0,
      total: 0,
    },
  };
  
  const CheckoutContext = createContext<CheckoutContextType | undefined>(undefined);
  
  export const CheckoutProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [state, setState] = useState<CheckoutState>(initialState);
  
    const setStep = useCallback((step: CheckoutState['step']) => setState(prev => ({ ...prev, step })), []);
    
    const setJourney = useCallback((journey: CheckoutState['journey'], courseId?: number) => 
      setState(prev => ({ 
        ...prev, 
        journey, 
        courseId: journey === 'academy' ? courseId : undefined,
        editionId: journey === 'studio' ? courseId : undefined,
        items: (journey === 'studio' && courseId) ? [{ id: courseId, type: 'workshop_edition' }] : prev.items
      })), []);
  
    const toggleUpsell = useCallback((upsell: keyof CheckoutState['upsells']) =>
      setState(prev =>
        ({
        ...prev,
        upsells: { ...prev.upsells, [upsell]: !prev.upsells[upsell] }
      })), []);
  
    const updateBriefing = useCallback((briefing: string) => setState(prev => ({ ...prev, briefing })), []);
    
    const updatePronunciation = useCallback((pronunciation: string) => setState(prev => ({ ...prev, pronunciation })), []);
    
    const updateUsage = useCallback((usage: CheckoutState['usage']) => {
      console.log(`[CheckoutContext] Updating usage to: ${usage}`);
      setState(prev => {
        if (prev.usage === usage) return prev;
        return { ...prev, usage };
      });
    }, []);

    //  KELLY'S SYNC: Re-calculate pricing whenever usage, briefing or other key factors change
    // This effect is the primary driver for price updates in the configurator.
    useEffect(() => {
      calculatePricing();
    }, [state.usage, state.briefing, state.selectedActor, state.plan, state.media, state.country, state.spots, state.years, state.liveSession]);
    
    const updatePlan = useCallback((plan: PlanType) => setState(prev => ({ ...prev, plan })), []);
    
    const updateMedia = useCallback((media: CheckoutState['media']) => {
      console.log(`[CheckoutContext] Updating media to: ${JSON.stringify(media)}`);
      setState(prev => ({ ...prev, media }));
    }, []);
    const updateCountry = useCallback((country: string | string[]) => setState(prev => ({ ...prev, country })), []);
    const updateSpots = useCallback((spots: number) => setState(prev => ({ ...prev, spots })), []);
    const updateYears = useCallback((years: number) => setState(prev => ({ ...prev, years })), []);
    const updateSpotsDetail = useCallback((detail: Record<string, number>) => setState(prev => ({ ...prev, spotsDetail: detail })), []);
    const updateYearsDetail = useCallback((detail: Record<string, number>) => setState(prev => ({ ...prev, yearsDetail: detail })), []);
    const updateLiveSession = useCallback((liveSession: boolean) => setState(prev => ({ ...prev, liveSession })), []);
    const updateIsQuoteRequest = useCallback((isQuoteRequest: boolean) => setState(prev => ({ ...prev, isQuoteRequest })), []);
    
    const updateMusic = useCallback((music: Partial<CheckoutState['music']>) => 
      setState(prev => ({ ...prev, music: { ...prev.music, ...music } })), []);
    
    const selectActor = useCallback((actor: Actor | null) => setState(prev => {
      //  AUTO-QUOTE DETECTION: Als een stem geen tarieven heeft voor de huidige context, 
      // zetten we de checkout automatisch in 'offerte' modus.
      const status = actor ? PricingEngine.getAvailabilityStatus(
        actor, 
        prev.usage === 'commercial' ? (prev.media as any) : [], 
        Array.isArray(prev.country) ? prev.country[0] : prev.country // Use first country for check
      ) : 'available';
  
      return { 
        ...prev, 
        selectedActor: actor,
        isQuoteRequest: status === 'on_request'
      };
    }), []);
    
    const updateCustomer = useCallback((customer: Partial<CheckoutState['customer']>) => 
      setState(prev => ({ ...prev, customer: { ...prev.customer, ...customer } })), []);
  
    const addItem = useCallback((item: any) => setState(prev => ({
      ...prev,
      items: [...prev.items, item]
    })), []);

    const removeItem = useCallback((itemId: string) => setState(prev => ({
      ...prev,
      items: prev.items.filter(i => i.id !== itemId)
    })), []);

    const lockPrice = useCallback(() => setState(prev => ({ ...prev, isLocked: true })), []);
    const unlockPrice = useCallback(() => setState(prev => ({ ...prev, isLocked: false })), []);
  
    const calculatePricing = useCallback(() => {
      if (state.isLocked) return; //  KELLY'S LOCK: No recalculation if price is frozen
  
      console.log(`[CheckoutContext] Calculating pricing for journey: ${state.journey}, usage: ${state.usage}`);

      // Academy pricing logic
      if (state.journey === 'academy') {
        let total = 149;
        if (state.upsells.workshop_home) total += 395;
  
        setState(prev => ({
          ...prev,
          pricing: {
            base: 149,
            wordSurcharge: total - 149,
            total: total,
          }
        }));
        return;
      }
  
      // Studio pricing logic
      if (state.journey === 'studio' && state.editionId) {
        // For now, fixed price for workshops, can be made dynamic later via DB
        const workshopPrice = 395; 
        setState(prev => ({
          ...prev,
          pricing: {
            base: workshopPrice,
            wordSurcharge: 0,
            total: workshopPrice,
          }
        }));
        return;
      }
  
      //  AGENCY MANDATE: No Academy upsells during Agency journey
      const activeUpsells = state.journey === 'agency' ? {} : state.upsells;
  
      const wordCount = state.briefing.trim().split(/\s+/).filter(Boolean).length;
      const promptCount = state.briefing.trim().split(/\n+/).filter(Boolean).length;
  
      //  COMMERCIAL LOGIC: Apply spots/years to ALL selected media types
      // If detail maps exist, use those. Otherwise fall back to global spots/years.
      const spotsMap = state.usage === 'commercial' && Array.isArray(state.media) 
        ? state.media.reduce((acc, m) => ({ ...acc, [m]: (state.spotsDetail && state.spotsDetail[m]) || state.spots || 1 }), {})
        : undefined;
  
      const yearsMap = state.usage === 'commercial' && Array.isArray(state.media)
        ? state.media.reduce((acc, m) => ({ ...acc, [m]: (state.yearsDetail && state.yearsDetail[m]) || state.years || 1 }), {})
        : undefined;
  
      console.log(`[CheckoutContext] Calculating with media: ${JSON.stringify(state.media)}`);

      const result = PricingEngine.calculate({
        usage: state.usage,
        plan: state.plan,
        words: wordCount,
        prompts: promptCount,
        mediaTypes: state.usage === 'commercial' ? (state.media as any) : [],
        countries: Array.isArray(state.country) ? state.country : [state.country],
        spots: spotsMap,
        years: yearsMap,
        liveSession: state.liveSession,
        actorRates: state.selectedActor?.rates || state.selectedActor?.rates_raw,
        music: state.music,
        isVatExempt: !!state.customer.vat_number && state.customer.country !== 'BE'
      });
  
      // Liquid price animation in context
      setState(prev => {
        //  INFINITE LOOP GUARD: Only update if values actually changed
        if (
          prev.prompts === promptCount &&
          prev.pricing.base === result.base &&
          prev.pricing.wordSurcharge === result.wordSurcharge &&
          prev.pricing.mediaSurcharge === result.mediaSurcharge &&
          prev.pricing.musicSurcharge === result.musicSurcharge &&
          prev.pricing.total === result.subtotal &&
          prev.pricing.legalDisclaimer === result.legalDisclaimer &&
          prev.liveSession === state.liveSession &&
          prev.spots === state.spots &&
          prev.years === state.years
        ) {
          return prev;
        }
  
        return {
          ...prev,
          prompts: promptCount,
          pricing: {
            base: result.base,
            wordSurcharge: result.wordSurcharge,
            mediaSurcharge: result.mediaSurcharge,
            musicSurcharge: result.musicSurcharge,
            total: result.subtotal, // We store subtotal in pricing.total for historical reasons, UI adds VAT
            legalDisclaimer: result.legalDisclaimer
          }
        };
      });
    }, [state.briefing, state.usage, state.plan, state.journey, state.upsells, state.music, state.customer.vat_number, state.customer.country, state.isLocked, state.editionId, state.media, state.country, state.selectedActor, state.spots, state.years, state.spotsDetail, state.yearsDetail, state.liveSession]);
  
    useEffect(() => {
      // calculatePricing is now driven by the KELLY'S SYNC effect above
    }, []);
  
    const isVatExempt = !!state.customer.vat_number && state.customer.country !== 'BE';
  
    return (
      <CheckoutContext.Provider value={{ 
        state, 
        setStep, 
        setJourney,
        toggleUpsell,
        updateBriefing, 
        updatePronunciation, 
        updateUsage, 
        updatePlan, 
        updateMedia, 
        updateCountry,
        updateSpots,
        updateYears,
        updateSpotsDetail,
        updateYearsDetail,
        updateLiveSession,
        updateIsQuoteRequest,
        updateMusic,
        selectActor, 
        updateCustomer,
        addItem,
        removeItem,
        calculatePricing,
        lockPrice,
        unlockPrice,
        isVatExempt
      }}>
        <div className="hidden"><CheckCircle2 strokeWidth={1.5} /></div>
        {children}
      </CheckoutContext.Provider>
    );
  };

export const useCheckout = () => {
  const context = useContext(CheckoutContext);
  if (context === undefined) {
    throw new Error('useCheckout must be used within a CheckoutProvider');
  }
  return context;
};
