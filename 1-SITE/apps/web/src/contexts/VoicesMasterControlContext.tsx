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

      const journey = (searchParams.get('journey') as JourneyType) || 
                     (voicesState.current_journey !== 'general' ? voicesState.current_journey as JourneyType : 'video');
      
      const initialLanguageParam = searchParams.get('language');
      const initialLanguage = initialLanguageParam 
        ? MarketManager.getLanguageLabel(initialLanguageParam) 
        : MarketManager.getLanguageLabel(MarketManager.getLanguageCode(market.primary_language));
        
      const initialLanguages = searchParams.get('languages') ? searchParams.get('languages')?.split(',') : [initialLanguage.toLowerCase()];
      const initialWordsParam = searchParams.get('words');
      const initialWords = (initialWordsParam && parseInt(initialWordsParam) > 0) 
        ? parseInt(initialWordsParam) 
        : (journey === 'telephony' ? 25 : 200);
      const initialCountries = searchParams.get('countries') ? searchParams.get('countries')?.split(',') : [market.market_code];
      
      let initialSpotsDetail = undefined;
      try {
        const sd = searchParams.get('spotsDetail');
        if (sd) initialSpotsDetail = JSON.parse(decodeURIComponent(sd));
      } catch (e) {
        console.error('Failed to parse spotsDetail from URL', e);
      }

      let initialYearsDetail = undefined;
      try {
        const yd = searchParams.get('yearsDetail');
        if (yd) initialYearsDetail = JSON.parse(decodeURIComponent(yd));
      } catch (e) {
        console.error('Failed to parse yearsDetail from URL', e);
      }

      return {
        journey,
        usage: JOURNEY_USAGE_MAP[journey],
        filters: {
          language: initialLanguage,
          languages: initialLanguages as string[],
          gender: searchParams.get('gender') || null,
          style: searchParams.get('style') || null,
          sortBy: (searchParams.get('sortBy') as any) || 'popularity',
          words: initialWords,
          media: (searchParams.get('media') ? searchParams.get('media')?.split(',') : ['online']),
          countries: initialCountries as string[],
          country: searchParams.get('country') || market.market_code,
          spots: searchParams.get('spots') ? parseInt(searchParams.get('spots')!) : 1,
          years: searchParams.get('years') ? parseInt(searchParams.get('years')!) : 1,
          spotsDetail: initialSpotsDetail,
          yearsDetail: initialYearsDetail,
          liveSession: searchParams.get('liveSession') === 'true',
        },
        currentStep: 'voice',
      };
    });

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
    // This prevents the "reset" effect when the configurator updates usage directly.
    if (checkoutState.usage !== targetUsage) {
      console.log(`[MasterControl] Syncing checkout usage to journey: ${state.journey} -> ${targetUsage}`);
      updateUsage(targetUsage);
    }
    
    // Sync words with briefing if it's empty or needs initialization
    if (state.filters.words && !checkoutState.briefing) {
      const dummyText = Array(state.filters.words).fill('woord').join(' ');
      updateBriefing(dummyText);
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
  }, [state.journey, state.filters.media, state.filters.words, state.filters.spotsDetail, state.filters.yearsDetail, checkoutState.briefing, checkoutState.usage]); // Added checkoutState.usage back to dependencies to ensure sync works both ways but with the guard above

  // Sync with URL and other contexts
  const updateJourney = useCallback((journey: JourneyType) => {
    const usage = JOURNEY_USAGE_MAP[journey];
    
    setState(prev => {
      const newFilters = { ...prev.filters };
      
      //  CHRIS-PROTOCOL: Update default words based on journey
      if (journey === 'telephony') newFilters.words = 25;
      else if (journey === 'video') newFilters.words = 200;
      else if (journey === 'commercial') newFilters.words = 100;

      //  CHRIS-PROTOCOL: Enforce at least one media type for commercial journey
      if (journey === 'commercial' && (!newFilters.media || newFilters.media.length === 0)) {
        newFilters.media = ['online'];
      }
      
      //  CHRIS-PROTOCOL: Update URL silently (replaceState)
      const params = new URLSearchParams(window.location.search);
      params.set('journey', journey);
      if (journey === 'commercial' && !params.get('media')) {
        params.set('media', 'online');
      }
      const newUrl = `${window.location.pathname}${params.toString() ? '?' + params.toString() : ''}`;
      window.history.replaceState(null, '', newUrl);

      return { ...prev, journey, usage, filters: newFilters };
    });
    
    // Sync external contexts
    updateVoicesJourney(journey);
    updateUsage(usage);
  }, [updateVoicesJourney, updateUsage]);

  const updateFilters = useCallback((newFilters: Partial<MasterControlState['filters']>) => {
    setState(prev => {
      const updatedFilters = { ...prev.filters, ...newFilters };
      
      //  CHRIS-PROTOCOL: Sanity check for words
      if (updatedFilters.words !== undefined && updatedFilters.words < 5) {
        updatedFilters.words = prev.journey === 'telephony' ? 25 : 200;
      }
      
      // Sync with CheckoutContext
      if (newFilters.media) updateMedia(newFilters.media);
      if (newFilters.spots) updateSpots(newFilters.spots);
      if (newFilters.years) updateYears(newFilters.years);
      if (newFilters.spotsDetail) updateSpotsDetail(newFilters.spotsDetail);
      if (newFilters.yearsDetail) updateYearsDetail(newFilters.yearsDetail);
      if (newFilters.liveSession !== undefined) updateLiveSession(newFilters.liveSession);

      //  CHRIS-PROTOCOL: Update URL silently (replaceState) to keep it clean
      // but still allow sharing/refreshing.
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
    // Map master steps to checkout steps if needed
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
    
    const defaultFilters = {
      language: defaultLang,
      gender: null,
      style: null,
      sortBy: 'popularity',
      words: state.journey === 'telephony' ? 25 : (state.journey === 'video' ? 200 : 100),
    };
    setState(prev => ({ ...prev, filters: { ...prev.filters, ...defaultFilters } }));
    
    //  CHRIS-PROTOCOL: Update URL silently (replaceState)
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

export const useMasterControl = () => {
  const context = useContext(VoicesMasterControlContext);
  if (context === undefined) {
    throw new Error('useMasterControl must be used within a VoicesMasterControlProvider');
  }
  return context;
};
