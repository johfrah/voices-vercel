"use client";

import { UsageType } from '@/lib/engines/pricing-engine';
import { MarketManagerServer as MarketManager } from '@/lib/system/market-manager-server';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { useCheckout } from './CheckoutContext';
import { useVoicesState } from './VoicesStateContext';

export type JourneyType = 'telephony' | 'video' | 'commercial';

interface MasterControlState {
  journey: JourneyType;
  usage: UsageType;
  isMuted: boolean;
  filters: {
    language: string | null;
    languageId?: number | null;
    languages?: string[];
    languageIds?: number[];
    gender: string | null;
    style: string | null;
    toneIds?: number[];
    sortBy: 'popularity' | 'delivery' | 'alphabetical' | 'alphabetical_az' | 'alphabetical_za';
    words?: number;
    media?: string[];
    countries?: string[];
    country?: string;
    countryId?: number | null;
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
  toggleMute: () => void;
}

const JOURNEY_USAGE_MAP: Record<JourneyType, UsageType> = {
  telephony: 'telefonie',
  video: 'unpaid',
  commercial: 'commercial',
};

export const VoicesMasterControlContext = createContext<VoicesMasterControlContextType | undefined>(undefined);

export const useMasterControl = () => {
  const context = useContext(VoicesMasterControlContext);
  if (context === undefined) {
    throw new Error('useMasterControl must be used within a VoicesMasterControlProvider');
  }
  return context;
};

export const VoicesMasterControlProvider: React.FC<{ 
  children: React.ReactNode,
  initialJourney?: JourneyType,
  initialUsage?: UsageType
}> = ({ children, initialJourney, initialUsage }) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { state: voicesState, updateJourney: updateVoicesJourney } = useVoicesState();
  const checkout = useCheckout();
  const { state: checkoutState, updateUsage, updateMedia, updateSpots, updateYears, updateSpotsDetail, updateYearsDetail, updateLiveSession, updateBriefing, setStep: setCheckoutStep } = checkout;

  const [state, setState] = useState<MasterControlState>({
    journey: initialJourney || 'video',
    usage: initialUsage || 'unpaid',
    isMuted: false,
    filters: {
      language: 'nl-be',
      languages: ['nl-be'],
      gender: null,
      style: null,
      sortBy: 'popularity',
      words: (initialJourney === 'telephony' ? 25 : (initialJourney === 'commercial' ? 100 : 200)),
      media: ['online'],
      countries: ['BE'],
      country: 'BE',
      spots: 1,
      years: 1,
      liveSession: false,
    },
    currentStep: 'voice',
  });

  const [isClient, setIsClient] = useState(false);

  // 🛡️ CHRIS-PROTOCOL: Initialize state from URL/LocalStorage ONLY on client-side
  // to prevent Hydration Mismatch errors (#419).
  useEffect(() => {
    setIsClient(true);
    
    const host = window.location.host;
    const saved = localStorage.getItem('voices_master_control');
    let savedState: any = {};
    try {
      if (saved) savedState = JSON.parse(saved);
    } catch (e) {}

    const journey = initialJourney || (searchParams?.get('journey') as JourneyType) || 
                   (voicesState.current_journey !== 'general' ? voicesState.current_journey as JourneyType : 'video');
    
    const initialLanguageParam = searchParams?.get('language');
    const initialLanguage = initialLanguageParam 
      ? initialLanguageParam 
      : (savedState.filters?.language || 'nl-be');
      
    const initialLanguages = searchParams?.get('languages') ? searchParams?.get('languages')?.split(',') : (savedState.filters?.languages || [initialLanguage.toLowerCase()]);
    const initialWordsParam = searchParams?.get('words');
    const initialWords = (initialWordsParam && parseInt(initialWordsParam) > 0) 
      ? parseInt(initialWordsParam) 
      : (savedState.filters?.words || (journey === 'telephony' ? 25 : (journey === 'commercial' ? 100 : 200)));
    
    const currentPath = window.location.pathname;
    const pathSegments = currentPath.split('/').filter(Boolean);
    let initialMedia = (searchParams?.get('media') ? searchParams?.get('media')?.split(',') : (savedState.filters?.media || ['online']));
    
    if (currentPath.startsWith('/agency') && journey === 'commercial' && pathSegments[2]) {
      initialMedia = [pathSegments[2].toLowerCase()];
    }

    let initialSpotsDetail = savedState.filters?.spotsDetail;
    try {
      const sd = searchParams?.get('spotsDetail');
      if (sd) initialSpotsDetail = JSON.parse(decodeURIComponent(sd));
    } catch (e) {}

    let initialYearsDetail = savedState.filters?.yearsDetail;
    try {
      const yd = searchParams?.get('yearsDetail');
      if (yd) initialYearsDetail = JSON.parse(decodeURIComponent(yd));
    } catch (e) {}

    let initialMediaRegion = savedState.filters?.mediaRegion;
    try {
      const mr = searchParams?.get('mediaRegion');
      if (mr) initialMediaRegion = JSON.parse(decodeURIComponent(mr));
    } catch (e) {}

    const newState: MasterControlState = {
      journey,
      usage: JOURNEY_USAGE_MAP[journey],
      isMuted: savedState.isMuted ?? false,
      filters: {
        language: initialLanguage,
        languages: initialLanguages as string[],
        gender: searchParams?.get('gender') || savedState.filters?.gender || null,
        style: searchParams?.get('style') || savedState.filters?.style || null,
        sortBy: (searchParams?.get('sortBy') as any) || savedState.filters?.sortBy || 'popularity',
        words: initialWords,
        media: initialMedia,
        countries: savedState.filters?.countries || ['BE'],
        country: searchParams?.get('country') || savedState.filters?.country || 'BE',
        spots: searchParams?.get('spots') ? parseInt(searchParams?.get('spots')!) : (savedState.filters?.spots || 1),
        years: searchParams?.get('years') ? parseInt(searchParams?.get('years')!) : (savedState.filters?.years || 1),
        spotsDetail: initialSpotsDetail,
        yearsDetail: initialYearsDetail,
        mediaRegion: initialMediaRegion,
        liveSession: searchParams?.get('liveSession') === 'true' || savedState.filters?.liveSession || false,
      },
      currentStep: 'voice',
    };

    setState(newState);
  }, [searchParams, pathname, voicesState.current_journey]);

  // 🛡️ CHRIS-PROTOCOL: Decouple context sync from hydration (v2.14.629)
  // This prevents React Error #419 by moving side-effects to a separate tick.
  useEffect(() => {
    if (!isClient) return;

    const targetUsage = JOURNEY_USAGE_MAP[state.journey];
    
    // Only sync if there is an actual difference to prevent infinite loops
    if (checkoutState.usage !== targetUsage) {
      updateUsage(targetUsage);
    }
    
    if (state.filters.media && JSON.stringify(checkoutState.media) !== JSON.stringify(state.filters.media)) {
      updateMedia(state.filters.media);
    }
  }, [isClient, state.journey, state.filters.media, checkoutState.usage, checkoutState.media, updateUsage, updateMedia]);

  const detectStateFromUrl = useCallback((url: string) => {
    const segments = url.split('/').filter(Boolean);
    const isAgency = url.startsWith('/agency');
    
    let step: MasterControlState['currentStep'] = 'voice';
    let journey: JourneyType | undefined = undefined;
    let language: string | null = null;
    let gender: string | null = null;
    let media: string[] | undefined = undefined;

    if (url.includes('/checkout')) step = 'checkout';
    
    if (isAgency) {
      step = 'voice';
      const jSegment = segments[1]?.toLowerCase();
      
      const jMap: Record<string, JourneyType> = { 
        'telefonie': 'telephony', 
        'telephony': 'telephony',
        'telefoon': 'telephony',
        'video': 'video', 
        'corporate': 'video',
        'commercial': 'commercial', 
        'advertentie': 'commercial',
        'reclame': 'commercial',
        'advertising': 'commercial'
      };
      
      if (jSegment && jMap[jSegment]) {
        journey = jMap[jSegment];
      }

      if (journey === 'commercial') {
        const mediaSegments = segments.slice(2);
        if (mediaSegments.length > 0) {
          const newMedia: string[] = [];
          const newSpotsDetail: Record<string, number> = {};
          const newYearsDetail: Record<string, number> = {};

          mediaSegments.forEach(seg => {
            const match = seg.match(/^([a-z_]+)(\d+)x(\d+)$/i);
            if (match) {
              const [_, mId, spots, years] = match;
              const mediaId = mId.toLowerCase();
              newMedia.push(mediaId);
              newSpotsDetail[mediaId] = parseInt(spots);
              newYearsDetail[mediaId] = parseInt(years);
            } else {
              newMedia.push(seg.toLowerCase());
            }
          });

          if (newMedia.length > 0) {
            return { 
              step, 
              journey, 
              language, 
              gender, 
              media: newMedia,
              spotsDetail: Object.keys(newSpotsDetail).length > 0 ? newSpotsDetail : undefined,
              yearsDetail: Object.keys(newYearsDetail).length > 0 ? newYearsDetail : undefined
            };
          }
        }
      } 
      else if (journey === 'telephony' || journey === 'video') {
        const wordSegment = segments[2];
        if (wordSegment && /^\d+$/.test(wordSegment)) {
          const words = parseInt(wordSegment);
          return { step, journey, language, gender, words };
        }
      }
    } 
    else if (segments.length >= 2 && !isAgency) {
      const possibleJourneys: Record<string, JourneyType> = {
        'video': 'video',
        'commercial': 'commercial',
        'telefoon': 'telephony',
        'telephony': 'telephony',
        'reclame': 'commercial',
        'advertising': 'commercial'
      };
      journey = possibleJourneys[segments[1].toLowerCase()];
      if (journey) {
        step = 'script';
      }
    }

    return { step, journey, language, gender };
  }, []);

  useEffect(() => {
    const saved = localStorage.getItem('voices_master_control');
    if (saved) {
      try {
        const savedState = JSON.parse(saved);
        const currentUrl = typeof window !== 'undefined' ? window.location.pathname : '';
        const urlState = detectStateFromUrl(currentUrl);

        setState(prev => {
          const journey = urlState.journey || (searchParams?.get('journey') as JourneyType) || savedState.journey || prev.journey;
          
          return {
            ...prev,
            journey,
            usage: JOURNEY_USAGE_MAP[journey],
            isMuted: savedState.isMuted ?? prev.isMuted,
            filters: {
              ...prev.filters,
              ...savedState.filters,
              language: urlState.language || (searchParams?.get('language') ? MarketManager.getLanguageCode(searchParams?.get('language')!) : (savedState.filters?.language || prev.filters.language)),
              gender: urlState.gender || searchParams?.get('gender') || savedState.filters?.gender || prev.filters.gender,
              media: searchParams?.get('media') ? searchParams?.get('media')?.split(',') : (savedState.filters?.media || prev.filters.media),
            },
            currentStep: urlState.step || (searchParams?.get('step') as any) || 'voice'
          };
        });
      } catch (e) {}
    }
  }, [searchParams, detectStateFromUrl]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handlePopState = () => {
      const currentUrl = window.location.pathname;
      const urlState = detectStateFromUrl(currentUrl);
      
      setState(prev => ({
        ...prev,
        currentStep: urlState.step,
        journey: urlState.journey || prev.journey,
        filters: {
          ...prev.filters,
          language: urlState.language || prev.filters.language,
          gender: urlState.gender || prev.filters.gender,
          media: (urlState as any).media || prev.filters.media,
          spotsDetail: (urlState as any).spotsDetail || prev.filters.spotsDetail,
          yearsDetail: (urlState as any).yearsDetail || prev.filters.yearsDetail,
          words: (urlState as any).words || prev.filters.words
        }
      }));
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [detectStateFromUrl]);

  useEffect(() => {
    const urlState = detectStateFromUrl(pathname);
    if (urlState.journey || urlState.step !== state.currentStep) {
      setState(prev => ({
        ...prev,
        currentStep: urlState.step,
        journey: urlState.journey || prev.journey,
        usage: urlState.journey ? JOURNEY_USAGE_MAP[urlState.journey] : prev.usage,
        filters: {
          ...prev.filters,
          language: urlState.language || prev.filters.language,
          gender: urlState.gender || prev.filters.gender,
          media: (urlState as any).media || prev.filters.media,
          spotsDetail: (urlState as any).spotsDetail || prev.filters.spotsDetail,
          yearsDetail: (urlState as any).yearsDetail || prev.filters.yearsDetail,
          words: (urlState as any).words || prev.filters.words
        }
      }));
    }
  }, [pathname, detectStateFromUrl, state.currentStep]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('voices_master_control', JSON.stringify({
        journey: state.journey,
        filters: state.filters,
        currentStep: state.currentStep,
        isMuted: state.isMuted
      }));
    }
  }, [state]);

  useEffect(() => {
    if (state.filters.language) {
      const params = new URLSearchParams(searchParams.toString());
      if (!params.get('language')) {
        params.set('language', state.filters.language);
      }
    }
  }, [state.filters.language, searchParams]);

  useEffect(() => {
    const targetUsage = JOURNEY_USAGE_MAP[state.journey];
    
    if (checkoutState.usage !== targetUsage) {
      const timer = setTimeout(() => {
        updateUsage(targetUsage);
      }, 0);
      return () => clearTimeout(timer);
    }
    
    if (state.journey === 'commercial') {
      if (state.filters.media && JSON.stringify(checkoutState.media) !== JSON.stringify(state.filters.media)) {
        const timer = setTimeout(() => {
          updateMedia(state.filters.media!);
        }, 0);
        return () => clearTimeout(timer);
      }
      if (state.filters.spotsDetail && JSON.stringify(checkoutState.spotsDetail) !== JSON.stringify(state.filters.spotsDetail)) {
        const timer = setTimeout(() => {
          updateSpotsDetail(state.filters.spotsDetail!);
        }, 0);
        return () => clearTimeout(timer);
      }
      if (state.filters.yearsDetail && JSON.stringify(checkoutState.yearsDetail) !== JSON.stringify(state.filters.yearsDetail)) {
        const timer = setTimeout(() => {
          updateYearsDetail(state.filters.yearsDetail!);
        }, 0);
        return () => clearTimeout(timer);
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

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const params = new URLSearchParams(window.location.search);
    const URL_EXCLUDED_KEYS = ['spotsDetail', 'yearsDetail', 'mediaRegion', 'media'];
    URL_EXCLUDED_KEYS.forEach(key => params.delete(key));
    params.delete('journey');
    params.delete('language');
    params.delete('languages');

    const cleanPath = pathname.replace(/^\/(nl|fr|en|de|es|it|pt)/, '') || '/';
    const isAgencyFilterPage = (cleanPath.startsWith('/agency/') || cleanPath === '/agency') && 
                               !['/agency/tarieven', '/agency/over-ons', '/agency/privacy', '/agency/cookies', '/agency/voorwaarden', '/tarieven', '/price', '/contact'].includes(cleanPath);
    
    const pathSegments = cleanPath.split('/').filter(Boolean);
    
    // 🛡️ CHRIS-PROTOCOL: Refined Voice Profile detection (v2.14.612)
    // We detect if this is a voice profile (either legacy flat or prefixed /voice/).
    const isPrefixedVoice = pathSegments[0] === 'voice' && pathSegments.length >= 2;
    const isLegacyVoice = pathSegments.length >= 1 && !isAgencyFilterPage && 
                          !['admin', 'backoffice', 'account', 'api', 'auth', 'checkout', 'tarieven', 'price', 'contact', 'over-ons', 'agency', 'voice', 'artist', 'portfolio'].includes(pathSegments[0]);
    
    const isVoiceProfile = isPrefixedVoice || isLegacyVoice;
    
    // CHRIS-PROTOCOL: Strict URL rewrite mandate. 
    // We only touch the URL if we are in a known dynamic flow.
    let targetUrl = '';
    if (isAgencyFilterPage) {
      const jSlug = state.journey === 'telephony' ? 'telephony' : (state.journey === 'commercial' ? 'commercial' : 'video');
      const locale = pathname.match(/^\/(nl|fr|en|de|es|it|pt)/)?.[0] || '';
      targetUrl = locale + '/agency/' + jSlug + '/';
      
      if (state.journey === 'commercial' && state.filters.media) {
        state.filters.media.forEach(m => {
          const spots = state.filters.spotsDetail?.[m] || 1;
          const years = state.filters.yearsDetail?.[m] || 1;
          targetUrl += m + spots + 'x' + years + '/';
        });
      } else if ((state.journey === 'telephony' || state.journey === 'video') && state.filters.words) {
        targetUrl += state.filters.words + '/';
      }
    } else if (isVoiceProfile) {
      // 🛡️ CHRIS-PROTOCOL: Preserve prefix and slug correctly (v2.14.618)
      // CRITICAL FIX: Do NOT append journey if the URL already has a journey segment OR if we want the base profile page.
      const locale = pathname.match(/^\/(nl|fr|en|de|es|it|pt)/)?.[0] || '';
      const prefix = isPrefixedVoice ? 'voice/' : '';
      const slug = isPrefixedVoice ? pathSegments[1] : pathSegments[0];
      
      // Check if there's already a journey segment in the URL
      const hasJourneyInUrl = isPrefixedVoice ? (pathSegments.length > 2) : (pathSegments.length > 1);
      
      if (hasJourneyInUrl) {
        // URL already has a journey segment, preserve it as-is
        return;
      }
      
      // For base voice profile pages (e.g., /voice/christina/), do NOT append journey
      // This allows the Smart Checkout to be visible without forcing a journey redirect
      return;
    } else {
      // For all other pages (tarieven, contact, etc.), we NEVER touch the URL.
      return;
    }

    const queryString = params.toString();
    const finalUrl = targetUrl + (queryString ? '?' + queryString : '');
    
    if (window.location.pathname + window.location.search !== finalUrl) {
      window.history.replaceState(null, '', finalUrl);
    }
  }, [state.journey, state.filters, pathname]);

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
        if (prev.journey === 'commercial' && newFilters.media.length === 0) {
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

      return { ...prev, filters: updatedFilters };
    });
  }, [updateMedia, updateSpots, updateYears, updateSpotsDetail, updateYearsDetail, updateLiveSession]);

  const updateStep = useCallback((step: MasterControlState['currentStep']) => {
    setState(prev => {
      if (step === 'script' && checkoutState.selectedActor?.slug) {
        const slug = checkoutState.selectedActor.slug;
        const journey = prev.journey;
        const newUrl = '/' + slug + '/' + journey;
        if (typeof window !== 'undefined') {
          window.history.replaceState(null, '', newUrl);
        }
      } else if (step === 'voice') {
        const isAgencyFilterPage = pathname.startsWith('/agency/') || pathname === '/agency';
        const newUrl = isAgencyFilterPage ? '/agency/' + prev.journey : pathname;
        if (typeof window !== 'undefined' && newUrl !== pathname) {
          window.history.replaceState(null, '', newUrl);
        }
      }

      return { ...prev, currentStep: step };
    });

    const stepMap: Record<MasterControlState['currentStep'], any> = {
      voice: 'voice',
      script: 'briefing',
      checkout: 'details'
    };
    setCheckoutStep(stepMap[step]);
  }, [setCheckoutStep, checkoutState.selectedActor?.slug, pathname]);

  const resetFilters = useCallback(() => {
    const host = typeof window !== 'undefined' ? window.location.host : (process.env.NEXT_PUBLIC_SITE_URL?.replace('https://', '') || MarketManager.getMarketDomains()['BE'].replace('https://', ''));
    const market = MarketManager.getCurrentMarket(host);
    const defaultLang = MarketManager.getLanguageCode(market.primary_language);
    
    const defaultFilters: Partial<MasterControlState['filters']> = {
      language: defaultLang,
      gender: null,
      style: null,
      sortBy: 'popularity',
      words: state.journey === 'telephony' ? 25 : (state.journey === 'video' ? 200 : 100),
    };
    setState(prev => ({ ...prev, filters: { ...prev.filters, ...defaultFilters } as MasterControlState['filters'] }));
  }, [state.journey]);

  const toggleMute = useCallback(() => {
    setState(prev => ({ ...prev, isMuted: !prev.isMuted }));
  }, []);

  return (
    <VoicesMasterControlContext.Provider value={{ state, updateJourney, updateFilters, updateStep, resetFilters, toggleMute }}>
      {children}
    </VoicesMasterControlContext.Provider>
  );
};
