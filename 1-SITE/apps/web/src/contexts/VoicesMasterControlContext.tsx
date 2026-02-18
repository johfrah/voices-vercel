"use client";

import { UsageType } from '@/lib/pricing-engine';
import { MarketManager } from '@config/market-manager';
import { useRouter, useSearchParams } from 'next/navigation';
import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { useCheckout } from './CheckoutContext';
import { useVoicesState } from './VoicesStateContext';

export type JourneyType = 'telephony' | 'video' | 'commercial';

interface MasterControlState {
  journey: JourneyType;
  usage: UsageType;
  filters: {
    language: string | null;
    languages?: string[]; //  Support for multi-language selection (Telephony)
    gender: string | null;
    style: string | null;
    sortBy: 'popularity' | 'delivery' | 'alphabetical'; //  NEW: Sorting options
    words?: number;
    media?: string[];
    countries?: string[];
    country?: string; // Kept for backward compatibility if needed
    spots?: number;
    years?: number;
    spotsDetail?: Record<string, number>;
    yearsDetail?: Record<string, number>;
    mediaRegion?: Record<string, string>;
    liveSession?: boolean;
  };
  currentStep: 'voice' | 'script' | 'checkout';
}

interface VoicesMasterControlContextType {
  state: MasterControlState;
  updateJourney: (journey: JourneyType) => void;
  updateFilters: (filters: Partial<MasterControlState['filters']>) => void;
  updateStep: (step: MasterControlState['currentStep']) => void;
  resetFilters: () => void;
}

const JOURNEY_USAGE_MAP: Record<JourneyType, UsageType> = {
  telephony: 'telefonie',
  video: 'unpaid',
  commercial: 'commercial',
};

const VoicesMasterControlContext = createContext<VoicesMasterControlContextType | undefined>(undefined);

export const useMasterControl = () => {
  const context = useContext(VoicesMasterControlContext);
  if (context === undefined) {
    throw new Error('useMasterControl must be used within a VoicesMasterControlProvider');
  }
  return context;
};

export const VoicesMasterControlProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { state: voicesState, updateJourney: updateVoicesJourney } = useVoicesState();
  const { state: checkoutState, updateUsage, updateMedia, updateSpots, updateYears, updateSpotsDetail, updateYearsDetail, updateLiveSession, updateBriefing, setStep: setCheckoutStep } = useCheckout();

  // Initialize state from URL or contexts
  const [state, setState] = useState<MasterControlState>(() => {
    //  MARKET-AWARE INITIALIZATION
    const host = typeof window !== 'undefined' ? window.location.host : 'voices.be';
    const market = MarketManager.getCurrentMarket(host);

    //  CHRIS-PROTOCOL: Priority order: URL > localStorage > Default
    let savedState: any = null;
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('voices_master_control');
      if (saved) {
        try {
          savedState = JSON.parse(saved);
        } catch (e) {}
      }
    }

    const journey = (searchParams.get('journey') as JourneyType) || 
                   savedState?.journey ||
                   (voicesState.current_journey !== 'general' ? voicesState.current_journey as JourneyType : 'video');
    
    const initialLanguageParam = searchParams.get('language');
    const initialLanguage = initialLanguageParam 
      ? MarketManager.getLanguageLabel(initialLanguageParam) 
      : (savedState?.filters?.language || MarketManager.getLanguageLabel(MarketManager.getLanguageCode(market.primary_language)));
      
    const initialLanguages = searchParams.get('languages') ? searchParams.get('languages')?.split(',') : (savedState?.filters?.languages || [initialLanguage.toLowerCase()]);
    const initialWordsParam = searchParams.get('words');
    const initialWords = (initialWordsParam && parseInt(initialWordsParam) > 0) 
      ? parseInt(initialWordsParam) 
      : (savedState?.filters?.words || (journey === 'telephony' ? 25 : (journey === 'commercial' ? 100 : 200)));
    const initialCountries = searchParams.get('countries') ? searchParams.get('countries')?.split(',') : (savedState?.filters?.countries || [market.market_code]);
    
    let initialSpotsDetail = savedState?.filters?.spotsDetail;
    try {
      const sd = searchParams.get('spotsDetail');
      if (sd) initialSpotsDetail = JSON.parse(decodeURIComponent(sd));
    } catch (e) {}

    let initialYearsDetail = savedState?.filters?.yearsDetail;
    try {
      const yd = searchParams.get('yearsDetail');
      if (yd) initialYearsDetail = JSON.parse(decodeURIComponent(yd));
    } catch (e) {}

    let initialMediaRegion = savedState?.filters?.mediaRegion;
    try {
      const mr = searchParams.get('mediaRegion');
      if (mr) initialMediaRegion = JSON.parse(decodeURIComponent(mr));
    } catch (e) {}

    const isRoot = typeof window !== 'undefined' && (window.location.pathname === '/' || window.location.pathname === '/agency/');
    
    return {
      journey,
      usage: JOURNEY_USAGE_MAP[journey],
      filters: {
        language: initialLanguage,
        languages: initialLanguages as string[],
        gender: searchParams.get('gender') || savedState?.filters?.gender || null,
        style: searchParams.get('style') || savedState?.filters?.style || null,
        sortBy: (searchParams.get('sortBy') as any) || savedState?.filters?.sortBy || 'popularity',
        words: initialWords,
        media: (searchParams.get('media') ? searchParams.get('media')?.split(',') : (savedState?.filters?.media || ['online'])),
        countries: initialCountries as string[],
        country: searchParams.get('country') || savedState?.filters?.country || market.market_code,
        spots: searchParams.get('spots') ? parseInt(searchParams.get('spots')!) : (savedState?.filters?.spots || 1),
        years: searchParams.get('years') ? parseInt(searchParams.get('years')!) : (savedState?.filters?.years || 1),
        spotsDetail: initialSpotsDetail,
        yearsDetail: initialYearsDetail,
        mediaRegion: initialMediaRegion,
        liveSession: searchParams.get('liveSession') === 'true' || savedState?.filters?.liveSession === true,
      },
      currentStep: (searchParams.get('step') as any) || (isRoot ? 'voice' : (savedState?.currentStep || 'voice')),
    };
  });

  const isRoot = typeof window !== 'undefined' && (window.location.pathname === '/' || window.location.pathname === '/agency/');
  
  //  CHRIS-PROTOCOL: Persistence Layer
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Don't save 'script' or 'checkout' step to localStorage if we are on the root/agency page
      // This prevents the "stuck on script page" issue on refresh.
      const stepToSave = isRoot ? 'voice' : state.currentStep;
      
      localStorage.setItem('voices_master_control', JSON.stringify({
        journey: state.journey,
        filters: state.filters,
        currentStep: stepToSave
      }));
    }
  }, [state, isRoot]);

  // CHRIS-PROTOCOL: Map mediaRegion from master to checkout
  useEffect(() => {
    if (state.filters.mediaRegion) {
      // We could add updateMediaRegion to checkout context if needed, 
      // but for now we'll ensure the media types themselves are correct.
      // The PricingEngine will need to know which specific radio/tv type to use.
    }
  }, [state.filters.mediaRegion]);

  //  CHRIS-PROTOCOL: Force initial sync of voicesState to ensure grid matches filters immediately
  useEffect(() => {
    if (state.filters.language) {
      // We forceren een update om de grid te synchroniseren met de initile market taal
      const params = new URLSearchParams(window.location.search);
      if (!params.get('language')) {
        params.set('language', state.filters.language);
        // router.push(`?${params.toString()}`, { scroll: false }); // Removed to keep URL cleaner
      }
    }
  }, [state.filters.language]);

  //  PRICING SYNC: Recalculate pricing whenever journey or filters change
  useEffect(() => {
    const targetUsage = JOURNEY_USAGE_MAP[state.journey];
    
    //  CHRIS-PROTOCOL: Only update if the target usage is different from current checkout usage
    if (checkoutState.usage !== targetUsage) {
      console.log(`[MasterControl] Syncing checkout usage to journey: ${state.journey} -> ${targetUsage}`);
      const timer = setTimeout(() => {
        updateUsage(targetUsage);
      }, 0);
      return () => clearTimeout(timer);
    }
    
    // If it's a commercial journey, sync the media type and details
    if (state.journey === 'commercial') {
      if (state.filters.media && JSON.stringify(checkoutState.media) !== JSON.stringify(state.filters.media)) {
        updateMedia(state.filters.media);
      }
      if (state.filters.spotsDetail && JSON.stringify(checkoutState.spotsDetail) !== JSON.stringify(state.filters.spotsDetail)) {
        updateSpotsDetail(state.filters.spotsDetail);
      }
      if (state.filters.yearsDetail && JSON.stringify(checkoutState.yearsDetail) !== JSON.stringify(state.filters.yearsDetail)) {
        updateYearsDetail(state.filters.yearsDetail);
      }
    }
  }, [
    state.journey, 
    state.filters.media, 
    state.filters.words, 
    state.filters.spotsDetail, 
    state.filters.yearsDetail, 
    checkoutState.briefing, 
    checkoutState.usage, 
    checkoutState.media, 
    checkoutState.spotsDetail, 
    checkoutState.yearsDetail, 
    updateBriefing, 
    updateMedia, 
    updateSpotsDetail, 
    updateUsage, 
    updateYearsDetail
  ]); 

  // Sync with URL and other contexts
  const updateJourney = useCallback((journey: JourneyType) => {
    const usage = JOURNEY_USAGE_MAP[journey];
    
    setState(prev => {
      const newFilters = { ...prev.filters };
      
      if (journey === 'telephony') newFilters.words = 25;
      else if (journey === 'video') newFilters.words = 200;
      else if (journey === 'commercial') newFilters.words = 100;

      if (journey === 'commercial' && (!newFilters.media || newFilters.media.length === 0)) {
        newFilters.media = ['online'];
      }
      
      const params = new URLSearchParams(window.location.search);
      params.set('journey', journey);
      if (journey === 'commercial' && !params.get('media')) {
        params.set('media', 'online');
      }
      const newUrl = `${window.location.pathname}${params.toString() ? '?' + params.toString() : ''}`;
      window.history.replaceState(null, '', newUrl);

      return { ...prev, journey, usage, filters: newFilters };
    });
    
    updateVoicesJourney(journey);
    updateUsage(usage);
  }, [updateVoicesJourney, updateUsage]);

  const updateFilters = useCallback((newFilters: Partial<MasterControlState['filters']>) => {
    setState(prev => {
      const updatedFilters = { ...prev.filters, ...newFilters };
      
      if (updatedFilters.words !== undefined && updatedFilters.words < 5) {
        updatedFilters.words = prev.journey === 'telephony' ? 25 : 200;
      }
      
      if (newFilters.media) {
        //  KELLY-MANDATE: Always require at least one media type for commercial journey
        if (prev.journey === 'commercial' && newFilters.media.length === 0) {
          console.warn("[MasterControl] Attempted to clear all media types via filters. Reverting to 'online'.");
          updatedFilters.media = ['online'];
          updatedFilters.spotsDetail = { online: 1 };
        }
        updateMedia(updatedFilters.media);
      }
      if (newFilters.spots) updateSpots(newFilters.spots);
      if (newFilters.years) updateYears(newFilters.years);
      if (newFilters.spotsDetail) updateSpotsDetail(newFilters.spotsDetail);
      if (newFilters.yearsDetail) updateYearsDetail(newFilters.yearsDetail);
      if (newFilters.liveSession !== undefined) updateLiveSession(newFilters.liveSession);

      const params = new URLSearchParams(window.location.search);
      Object.entries(newFilters).forEach(([key, value]) => {
        if (value) {
          if (Array.isArray(value)) params.set(key, value.join(','));
          else if (typeof value === 'object') params.set(key, encodeURIComponent(JSON.stringify(value)));
          else params.set(key, String(value));
        }
        else params.delete(key);
      });
      
      const newUrl = `${window.location.pathname}${params.toString() ? '?' + params.toString() : ''}`;
      window.history.replaceState(null, '', newUrl);

      return { ...prev, filters: updatedFilters };
    });
  }, [updateMedia, updateSpots, updateYears, updateSpotsDetail, updateYearsDetail, updateLiveSession]);

  const updateStep = useCallback((step: MasterControlState['currentStep']) => {
    setState(prev => ({ ...prev, currentStep: step }));
    const stepMap: Record<MasterControlState['currentStep'], any> = {
      voice: 'voice',
      script: 'briefing',
      checkout: 'details'
    };
    setCheckoutStep(stepMap[step]);
  }, [setCheckoutStep]);

  const resetFilters = useCallback(() => {
    const host = typeof window !== 'undefined' ? window.location.host : 'voices.be';
    const market = MarketManager.getCurrentMarket(host);
    
    const defaultLang = MarketManager.getLanguageLabel(MarketManager.getLanguageCode(market.primary_language));
    
    const defaultFilters: Partial<MasterControlState['filters']> = {
      language: defaultLang,
      gender: null,
      style: null,
      sortBy: 'popularity',
      words: state.journey === 'telephony' ? 25 : (state.journey === 'video' ? 200 : 100),
    };
    setState(prev => ({ ...prev, filters: { ...prev.filters, ...defaultFilters } as MasterControlState['filters'] }));
    
    const params = new URLSearchParams(window.location.search);
    params.set('language', defaultLang);
    ['gender', 'style', 'words'].forEach(k => params.delete(k));
    const newUrl = `${window.location.pathname}${params.toString() ? '?' + params.toString() : ''}`;
    window.history.replaceState(null, '', newUrl);
  }, [state.journey]);

  return (
    <VoicesMasterControlContext.Provider value={{ state, updateJourney, updateFilters, updateStep, resetFilters }}>
      {children}
    </VoicesMasterControlContext.Provider>
  );
};
