"use client";

import { Actor } from '@/types';
import { PricingEngine, UsageType, PlanType } from '@/lib/pricing-engine';
import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';

interface CheckoutState {
  step: 'briefing' | 'voice' | 'details' | 'payment' | 'done';
  journey: 'studio' | 'academy' | 'agency' | 'johfrai-subscription';
  courseId?: number;
  upsells: {
    workshop_home: boolean;
  };
  briefing: string;
  pronunciation: string;
  usage: UsageType;
  plan: PlanType;
  media: 'online' | 'tv' | 'radio' | 'podcast';
  country: string;
  prompts: number;
  selectedActor: Actor | null;
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
  pricing: {
    base: number;
    wordSurcharge: number;
    total: number;
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
  updateMusic: (music: Partial<CheckoutState['music']>) => void;
  selectActor: (actor: Actor | null) => void;
  updateCustomer: (customer: Partial<CheckoutState['customer']>) => void;
  calculatePricing: () => void;
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
  media: 'online',
  country: 'BE',
  prompts: 1,
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
  pricing: {
    base: 0,
    wordSurcharge: 0,
    total: 0,
  },
};

const CheckoutContext = createContext<CheckoutContextType | undefined>(undefined);

export const CheckoutProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<CheckoutState>(initialState);

  const setStep = (step: CheckoutState['step']) => setState(prev => ({ ...prev, step }));
  
  const setJourney = (journey: CheckoutState['journey'], courseId?: number) => 
    setState(prev => ({ ...prev, journey, courseId }));

  const toggleUpsell = (upsell: keyof CheckoutState['upsells']) =>
    setState(prev => ({
      ...prev,
      upsells: { ...prev.upsells, [upsell]: !prev.upsells[upsell] }
    }));

  const updateBriefing = (briefing: string) => setState(prev => ({ ...prev, briefing }));
  
  const updatePronunciation = (pronunciation: string) => setState(prev => ({ ...prev, pronunciation }));
  
  const updateUsage = (usage: CheckoutState['usage']) => setState(prev => ({ ...prev, usage }));
  
  const updatePlan = (plan: PlanType) => setState(prev => ({ ...prev, plan }));
  
  const updateMedia = (media: CheckoutState['media']) => setState(prev => ({ ...prev, media }));
  
  const updateMusic = (music: Partial<CheckoutState['music']>) => 
    setState(prev => ({ ...prev, music: { ...prev.music, ...music } }));
  
  const selectActor = (actor: Actor | null) => setState(prev => ({ ...prev, selectedActor: actor }));
  
  const updateCustomer = (customer: Partial<CheckoutState['customer']>) => 
    setState(prev => ({ ...prev, customer: { ...prev.customer, ...customer } }));

  const calculatePricing = useCallback(() => {
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

    // 🛡️ AGENCY MANDATE: No Academy upsells during Agency journey
    const activeUpsells = state.journey === 'agency' ? {} : state.upsells;

    const wordCount = state.briefing.trim().split(/\s+/).filter(Boolean).length;
    const promptCount = state.briefing.trim().split(/\n+/).filter(Boolean).length;

    const result = PricingEngine.calculatePrice(
      state.selectedActor ? {
        first_name: state.selectedActor.first_name,
        ai_enabled: state.selectedActor.ai_enabled,
        rates: state.selectedActor.rates_raw || {}
      } : { first_name: 'johfrah', ai_enabled: true },
      {
        usage: state.usage,
        plan: state.plan,
        media: [state.media],
        words: wordCount,
        prompts: promptCount,
        countries: [state.country],
        musicMix: state.music.asBackground || state.music.asHoldMusic
      }
    );

    // Liquid price animation in context
    const targetPrice = result.price;
    setState(prev => ({
      ...prev,
      prompts: promptCount,
      pricing: {
        base: targetPrice - (result.breakdown?.word_surcharge || 0),
        wordSurcharge: result.breakdown?.word_surcharge || 0,
        total: targetPrice,
      }
    }));
  }, [state.briefing, state.usage, state.plan, state.selectedActor, state.media, state.country, state.journey, state.upsells, state.music.asBackground, state.music.asHoldMusic]);

  useEffect(() => {
    calculatePricing();
  }, [calculatePricing]);

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
      updateMusic,
      selectActor, 
      updateCustomer,
      calculatePricing
    }}>
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
