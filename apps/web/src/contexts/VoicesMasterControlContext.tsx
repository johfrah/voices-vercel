"use client";

import { UsageType, SlimmeKassa } from '@/lib/engines/pricing-engine';
import { MarketManagerServer as MarketManager } from "@/lib/system/core/market-manager";
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { useCheckout } from './CheckoutContext';
import { useVoicesState } from './VoicesStateContext';
import { normalizeLocale } from '@/lib/system/locale-utils';
import { buildCanonicalActorPath } from '@/lib/system/slug';

export type JourneyType = 'telephony' | 'video' | 'commercial' | 'agency' | 'general';

interface MasterControlState {
  journey: JourneyType;
  journeyId?: number | null;
  usage: UsageType;
  isMuted: boolean;
  filters: {
    language: string | null;
    languageId?: number | null;
    languages?: string[];
    languageIds?: number[];
    gender: string | null;
    genderId?: number | null;
    style: string | null;
    toneIds?: number[];
    sortBy: 'popularity' | 'delivery' | 'alphabetical' | 'alphabetical_az' | 'alphabetical_za';
    words?: number;
    media?: string[];
    mediaIds?: number[]; // 🛡️ Handshake Truth
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

const JOURNEY_USAGE_MAP: Record<string, UsageType> = {
  telephony: 'telefonie',
  video: 'unpaid',
  commercial: 'commercial',
  agency: 'unpaid',
  general: 'unpaid'
};

const COMMERCIAL_MEDIA_ALIAS_MAP: Record<string, string> = {
  online: 'online',
  podcast: 'podcast',
  radio: 'radio_national',
  radio_national: 'radio_national',
  radio_regional: 'radio_regional',
  radio_local: 'radio_local',
  tv: 'tv_national',
  tv_national: 'tv_national',
  tv_regional: 'tv_regional',
  tv_local: 'tv_local',
  social: 'social_media',
  socials: 'social_media',
  social_media: 'social_media',
  cinema: 'cinema',
  pos: 'pos',
};

const DEFAULT_COMMERCIAL_MEDIA_CODE = 'online';

const normalizeCommercialMediaCode = (rawCode: string | null | undefined): string | null => {
  const normalized = String(rawCode || '').toLowerCase().trim();
  if (!normalized) return null;
  return COMMERCIAL_MEDIA_ALIAS_MAP[normalized] || null;
};

const sanitizeCommercialDetailMap = (
  detailMap: Record<string, number> | undefined,
  mediaCodes: string[],
  fallbackValue: number
): Record<string, number> => {
  const sanitized: Record<string, number> = {};

  mediaCodes.forEach((mediaCode) => {
    const value = detailMap?.[mediaCode];
    sanitized[mediaCode] = typeof value === 'number' && Number.isFinite(value) && value > 0
      ? value
      : fallbackValue;
  });

  return sanitized;
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
  const { state: voicesState, updateJourney: updateVoicesJourney } = useVoicesState() || { state: { current_journey: 'video' }, updateJourney: () => {} };
  const checkout = useCheckout();
  const { state: checkoutState, updateUsage, updateMedia, updateSpots, updateYears, updateSpotsDetail, updateYearsDetail, updateLiveSession, updateBriefing, setStep: setCheckoutStep } = checkout;

  const [state, setState] = useState<MasterControlState>({
    journey: initialJourney || 'video',
    journeyId: initialJourney ? MarketManager.getJourneyId(initialJourney) : 27, // 🛡️ Handshake Truth: Default to Voice-over (ID 27)
    usage: initialUsage || ((initialJourney as string) === 'studio' || (initialJourney as string) === 'academy' ? 'subscription' : 'unpaid'),
    isMuted: false,
    filters: {
      language: null,
      languageId: 1, // 🛡️ Handshake Truth: Default to Vlaams (ID 1)
      languages: [],
      languageIds: [1],
      gender: null,
      genderId: null,
      style: null,
      sortBy: 'popularity',
      words: (initialJourney === 'telephony' ? 25 : (initialJourney === 'commercial' ? 100 : 200)),
      media: ['online'],
      mediaIds: [5], // 🛡️ Handshake Truth: Default to Online (ID 5)
      countries: ['BE'],
      country: 'BE',
      countryId: 1, // 🛡️ Handshake Truth: Default to België (ID 1)
      spots: 1,
      years: 1,
      liveSession: false,
    },
    currentStep: 'voice',
  });

  const [isClient, setIsClient] = useState(false);
  const [isStateInitialized, setIsStateInitialized] = useState(false);

  // 🛡️ CHRIS-PROTOCOL: Initialize state from URL/LocalStorage ONLY on client-side
  // to prevent Hydration Mismatch errors (#419).
  useEffect(() => {
    setIsClient(true);
    
    // We delay the actual state initialization from external sources (URL/Storage)
    // until AFTER the first render to ensure hydration matches the server.
    const initializeState = () => {
      try {
      const host = typeof window !== 'undefined' ? window.location.host : '';
      const market = MarketManager.getCurrentMarket(host, window.location.pathname);
      const localePrefixMatch = window.location.pathname.match(/^\/(nl|fr|en|de|es|it|pt)(\/|$)/i);
      const localeFromPath = localePrefixMatch ? normalizeLocale(localePrefixMatch[1], market?.primary_language || 'nl-be') : null;
      const localeIdFromPath = localeFromPath
        ? (MarketManager.getLanguageId(localeFromPath, market?.primary_language || 'nl-be') || market?.primary_language_id || 1)
        : null;
      // 🛡️ CHRIS-PROTOCOL: When no URL locale, prefer handshake so filter matches page language (e.g. cookie/header).
      const handshake = typeof window !== 'undefined' ? (window as any).handshakeContext : null;
      const handshakeLangId = handshake?.languageId != null ? handshake.languageId : null;
      const handshakeLangCode = handshakeLangId != null && MarketManager.languages?.length
        ? (MarketManager.languages.find((l: { id: number; code: string }) => l.id === handshakeLangId)?.code)
        : null;
      const defaultLang = localeFromPath || handshakeLangCode || market?.primary_language || 'nl-be';
      const defaultLangId = localeIdFromPath ?? handshakeLangId ?? market?.primary_language_id ?? 1;
      
      const saved = localStorage.getItem('voices_master_control');
      let savedState: any = {};
      try {
        if (saved) savedState = JSON.parse(saved);
      } catch (e) {}

      const currentPath = window.location.pathname;
      const rawSegments = currentPath.split('/').filter(Boolean);
      const pathSegments = localePrefixMatch ? rawSegments.slice(1) : rawSegments;

      // 🛡️ CHRIS-PROTOCOL: URL-First Journey/Media parse (v2.28.24)
      // Deep links like /agency/commercial/online must override stale localStorage.
      const pathJourneyMap: Record<string, JourneyType> = {
        telephony: 'telephony',
        telefonie: 'telephony',
        telefoon: 'telephony',
        video: 'video',
        corporate: 'video',
        commercial: 'commercial',
        advertentie: 'commercial',
        reclame: 'commercial',
        advertising: 'commercial',
      };
      const firstPathSegment = pathSegments[0]?.toLowerCase() || '';
      const isAgencyPath = firstPathSegment === 'agency';
      const nonVoiceProfilePrefixes = new Set([
        'admin', 'backoffice', 'account', 'api', 'auth', 'checkout',
        'tarieven', 'price', 'contact', 'over-ons', 'agency', 'voice',
        'artist', 'portfolio', 'studio', 'academy', 'ademing', 'johfrai',
        'partners', 'freelance', 'casting'
      ]);
      const isActorJourneyPath =
        pathSegments.length >= 2 &&
        !isAgencyPath &&
        !nonVoiceProfilePrefixes.has(firstPathSegment);
      const pathJourneySegment =
        (isAgencyPath || isActorJourneyPath)
          ? pathSegments[1]?.toLowerCase()
          : undefined;
      const journeyFromPath = pathJourneySegment ? pathJourneyMap[pathJourneySegment] : undefined;

      const parseCommercialMediaSegments = (segments: string[]) => {
        const media: string[] = [];
        const media_ids: number[] = [];
        const spots_detail: Record<string, number> = {};
        const years_detail: Record<string, number> = {};

        segments.forEach((seg) => {
          const normalizedSegment = String(seg || '').toLowerCase();
          const encodedMatch = normalizedSegment.match(/^([a-z_]+)(\d+)x(\d+)$/i);
          const rawMediaCode = encodedMatch ? encodedMatch[1] : normalizedSegment;
          const mediaCode = normalizeCommercialMediaCode(rawMediaCode);
          if (!mediaCode) return;

          if (!media.includes(mediaCode)) {
            media.push(mediaCode);
          }
          const mediaId = MarketManager.getServiceId(mediaCode);
          if (mediaId != null) media_ids.push(mediaId);

          if (encodedMatch) {
            spots_detail[mediaCode] = parseInt(encodedMatch[2], 10);
            years_detail[mediaCode] = parseInt(encodedMatch[3], 10);
          }
        });

        return { media, media_ids, spots_detail, years_detail };
      };

      const pathCommercialState =
        journeyFromPath === 'commercial'
          ? parseCommercialMediaSegments(pathSegments.slice(2))
          : null;

      // 🛡️ CHRIS-PROTOCOL: Journey Resolution Priority (v2.28.24)
      // URL path wins, then query, then explicit user selection, then storage.
      const queryJourney = searchParams?.get('journey') as JourneyType | null;
      const queryJourneyId = searchParams?.get('journeyId') ? parseInt(searchParams.get('journeyId')!, 10) : null;
      const userSelectedJourney = voicesState?.current_journey && voicesState.current_journey !== 'general' && voicesState.current_journey !== 'agency'
        ? voicesState.current_journey as JourneyType
        : null;
      const journey = journeyFromPath || queryJourney || userSelectedJourney || savedState.journey || initialJourney || 'video';

      const journeyId =
        (journeyFromPath ? MarketManager.getJourneyId(journeyFromPath) : null) ||
        queryJourneyId ||
        savedState.journeyId ||
        MarketManager.getJourneyId(journey);
      const targetUsage = SlimmeKassa.getUsageFromJourneyId(journeyId || journey);

      const initialLanguageParam = searchParams?.get('language');
      const initialLanguageIdParam = searchParams?.get('languageId');
      
      let initialLanguage = initialLanguageParam 
        ? MarketManager.getLanguageCode(initialLanguageParam)
        : (localeFromPath || savedState.filters?.language || defaultLang);
      
      let initialLanguageId = initialLanguageIdParam 
        ? parseInt(initialLanguageIdParam) 
        : (localeIdFromPath || savedState.filters?.languageId || defaultLangId);

      const resolvedLanguageIdFromCode = MarketManager.getLanguageId(
        initialLanguage,
        market?.primary_language || 'nl-be'
      );
      if (!initialLanguageIdParam && resolvedLanguageIdFromCode) {
        initialLanguageId = resolvedLanguageIdFromCode;
      }

      let initialLanguages = searchParams?.get('languages')
        ? searchParams?.get('languages')?.split(',')
        : (
          localeFromPath
            ? [localeFromPath]
            : (savedState.filters?.languages || [initialLanguage.toLowerCase()])
        );
      let initialLanguageIds = searchParams?.get('languageIds')
        ? searchParams?.get('languageIds')?.split(',').map(Number)
        : (
          localeIdFromPath
            ? [localeIdFromPath]
            : (savedState.filters?.languageIds || (initialLanguageId ? [initialLanguageId] : []))
        );

      if (!initialLanguageIds || initialLanguageIds.length === 0) {
        initialLanguageIds = initialLanguageId ? [initialLanguageId] : [defaultLangId];
      }

      if (journeyFromPath === 'commercial' && !initialLanguageParam && !initialLanguageIdParam) {
        initialLanguage = localeFromPath || defaultLang;
        initialLanguageId = localeIdFromPath || defaultLangId;
        initialLanguages = [initialLanguage.toLowerCase()];
        initialLanguageIds = [initialLanguageId];
      }

      const initialWordsParam = searchParams?.get('words');
      const initialWords = (initialWordsParam && parseInt(initialWordsParam) > 0) 
        ? parseInt(initialWordsParam) 
        : (savedState.filters?.words || (journey === 'telephony' ? 25 : (journey === 'commercial' ? 100 : 200)));
      
      let initialMedia: string[] = (searchParams?.get('media')
        ? (searchParams?.get('media')?.split(',') || [])
        : (savedState.filters?.media || ['online'])) as string[];
      
      if (journey === 'commercial' && pathCommercialState?.media && pathCommercialState.media.length > 0) {
        initialMedia = pathCommercialState.media;
      }

      let initialSpotsDetail = savedState.filters?.spotsDetail;
      if (journey === 'commercial' && pathCommercialState?.spots_detail && Object.keys(pathCommercialState.spots_detail).length > 0) {
        initialSpotsDetail = { ...(initialSpotsDetail || {}), ...pathCommercialState.spots_detail };
      }
      try {
        const sd = searchParams?.get('spotsDetail');
        if (sd) initialSpotsDetail = JSON.parse(decodeURIComponent(sd));
      } catch (e) {}

      let initialYearsDetail = savedState.filters?.yearsDetail;
      if (journey === 'commercial' && pathCommercialState?.years_detail && Object.keys(pathCommercialState.years_detail).length > 0) {
        initialYearsDetail = { ...(initialYearsDetail || {}), ...pathCommercialState.years_detail };
      }
      try {
        const yd = searchParams?.get('yearsDetail');
        if (yd) initialYearsDetail = JSON.parse(decodeURIComponent(yd));
      } catch (e) {}

      let initialMediaRegion = savedState.filters?.mediaRegion;
      try {
        const mr = searchParams?.get('mediaRegion');
        if (mr) initialMediaRegion = JSON.parse(decodeURIComponent(mr));
      } catch (e) {}

      let initialMediaIds: number[] = (searchParams?.get('mediaIds')
        ? (searchParams?.get('mediaIds')?.split(',').map(Number) || [])
        : (savedState.filters?.mediaIds || [5])) as number[];
      if (journey === 'commercial' && pathCommercialState?.media_ids && pathCommercialState.media_ids.length > 0) {
        initialMediaIds = pathCommercialState.media_ids;
      }

      if (journey === 'commercial') {
        const sanitizedMedia = Array.from(
          new Set(
            (initialMedia || [])
              .map((mediaCode) => normalizeCommercialMediaCode(mediaCode))
              .filter((mediaCode): mediaCode is string => !!mediaCode)
          )
        );

        initialMedia = sanitizedMedia.length > 0 ? sanitizedMedia : [DEFAULT_COMMERCIAL_MEDIA_CODE];

        const derivedMediaIds = initialMedia
          .map((mediaCode) => MarketManager.getServiceId(mediaCode))
          .filter((mediaId): mediaId is number => mediaId != null);

        initialMediaIds = derivedMediaIds.length > 0
          ? derivedMediaIds
          : [MarketManager.getServiceId(DEFAULT_COMMERCIAL_MEDIA_CODE) || 5];

        initialSpotsDetail = sanitizeCommercialDetailMap(initialSpotsDetail, initialMedia, 1);
        initialYearsDetail = sanitizeCommercialDetailMap(initialYearsDetail, initialMedia, 1);
      }

      const newState: MasterControlState = {
        journey,
        journeyId,
        usage: targetUsage,
        isMuted: savedState.isMuted ?? false,
        filters: {
          language: initialLanguage,
          languageId: initialLanguageId,
          languages: initialLanguages as string[],
          languageIds: initialLanguageIds,
          gender: searchParams?.get('gender') || savedState.filters?.gender || null,
          genderId: searchParams?.get('genderId') ? parseInt(searchParams.get('genderId')!) : (savedState.filters?.genderId || null),
          style: searchParams?.get('style') || savedState.filters?.style || null,
          sortBy: (searchParams?.get('sortBy') as any) || savedState.filters?.sortBy || 'popularity',
          words: initialWords,
          media: initialMedia,
          mediaIds: initialMediaIds,
          countries: savedState.filters?.countries || ['BE'],
          country: searchParams?.get('country') || savedState.filters?.country || 'BE',
          countryId: searchParams?.get('countryId') ? parseInt(searchParams.get('countryId')!) : (savedState.filters?.countryId || null),
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
      } finally {
        setIsStateInitialized(true);
      }
    };

    // CHRIS-PROTOCOL: Execute initialization in the next tick to guarantee hydration completion
    const timer = setTimeout(initializeState, 0);
    return () => clearTimeout(timer);
  }, [searchParams, pathname, voicesState.current_journey, initialJourney]);

  useEffect(() => {
    if (!isClient || !isStateInitialized) return;

    const targetUsage = SlimmeKassa.getUsageFromJourneyId(state.journeyId || state.journey);
    
    // Only sync if there is an actual difference to prevent infinite loops
    if (checkoutState.usage !== targetUsage || checkoutState.usageId !== state.journeyId) {
      updateUsage(targetUsage, state.journeyId || undefined);
    }
    
    if (state.filters.media && (JSON.stringify(checkoutState.media) !== JSON.stringify(state.filters.media) || JSON.stringify(checkoutState.mediaIds) !== JSON.stringify(state.filters.mediaIds))) {
      updateMedia(state.filters.media, state.filters.mediaIds);
    }
  }, [isClient, isStateInitialized, state.journey, state.journeyId, state.filters.media, state.filters.mediaIds, checkoutState.usage, checkoutState.usageId, checkoutState.media, checkoutState.mediaIds, updateUsage, updateMedia]);

  const detectStateFromUrl = useCallback((url: string) => {
    const localeMatch = url.match(/^\/(nl|fr|en|de|es|it|pt)(\/|$)/i);
    const rawSegments = url.split('/').filter(Boolean);
    const segments = localeMatch ? rawSegments.slice(1) : rawSegments;
    const urlWithoutLocale = `/${segments.join('/')}`;
    const isAgency = urlWithoutLocale.startsWith('/agency');
    
    let step: MasterControlState['currentStep'] = 'voice';
    let journey: JourneyType | undefined = undefined;
    let journeyId: number | undefined = undefined;
    let language: string | null = null;
    let languageId: number | null = null;
    let gender: string | null = null;
    let genderId: number | null = null;
    let media: string[] | undefined = undefined;
    let mediaIds: number[] | undefined = undefined;

    if (localeMatch) {
      const host = typeof window !== 'undefined' ? window.location.host : '';
      const market = MarketManager.getCurrentMarket(host, url);
      const locale = normalizeLocale(localeMatch[1], market?.primary_language || 'nl-be');
      language = locale;
      languageId = MarketManager.getLanguageId(locale, market?.primary_language || 'nl-be');
    }

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
        journeyId = MarketManager.getJourneyId(journey) || undefined;
      }

      if (journey === 'commercial') {
        const mediaSegments = segments.slice(2);
        if (mediaSegments.length > 0) {
          const newMedia: string[] = [];
          const newMediaIds: number[] = [];
          const newSpotsDetail: Record<string, number> = {};
          const newYearsDetail: Record<string, number> = {};

          mediaSegments.forEach(seg => {
            const match = seg.match(/^([a-z_]+)(\d+)x(\d+)$/i);
            const rawMediaCode = match ? match[1] : seg.toLowerCase();
            const mediaCode = normalizeCommercialMediaCode(rawMediaCode);
            if (!mediaCode) return;

            if (match) {
              const [_, __, spots, years] = match;
              if (!newMedia.includes(mediaCode)) newMedia.push(mediaCode);
              
              const mId = MarketManager.getServiceId(mediaCode);
              if (mId) newMediaIds.push(mId);
              
              newSpotsDetail[mediaCode] = parseInt(spots);
              newYearsDetail[mediaCode] = parseInt(years);
            } else {
              if (!newMedia.includes(mediaCode)) newMedia.push(mediaCode);
              const mId = MarketManager.getServiceId(mediaCode);
              if (mId) newMediaIds.push(mId);
            }
          });

          if (newMedia.length === 0 && mediaSegments.length > 0) {
            newMedia.push(DEFAULT_COMMERCIAL_MEDIA_CODE);
            const defaultMediaId = MarketManager.getServiceId(DEFAULT_COMMERCIAL_MEDIA_CODE);
            if (defaultMediaId) newMediaIds.push(defaultMediaId);
            newSpotsDetail[DEFAULT_COMMERCIAL_MEDIA_CODE] = 1;
            newYearsDetail[DEFAULT_COMMERCIAL_MEDIA_CODE] = 1;
          }

          if (newMedia.length > 0) {
            return { 
              step, 
              journey, 
              journeyId,
              language, 
              languageId,
              gender, 
              genderId,
              media: newMedia,
              mediaIds: newMediaIds,
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
          return { step, journey, journeyId, language, languageId, gender, genderId, words };
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
        journeyId = MarketManager.getJourneyId(journey) || undefined;
        step = 'script';
      }
    }

    return { step, journey, journeyId, language, languageId, gender, genderId };
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
          const queryJourneyId = searchParams?.get('journeyId') ? parseInt(searchParams.get('journeyId')!, 10) : null;
          const journeyId = (urlState as any).journeyId || (urlState.journey ? MarketManager.getJourneyId(urlState.journey) : null) || queryJourneyId || savedState.journeyId || MarketManager.getJourneyId(journey);
          const mergedMedia = ((urlState as any).media && (urlState as any).media.length > 0)
            ? (urlState as any).media
            : (searchParams?.get('media') ? searchParams?.get('media')?.split(',') : (savedState.filters?.media || prev.filters.media));

          let media = mergedMedia;
          let mediaIds = ((urlState as any).mediaIds && (urlState as any).mediaIds.length > 0)
            ? (urlState as any).mediaIds
            : (searchParams?.get('mediaIds') ? searchParams?.get('mediaIds')?.split(',').map(Number) : (savedState.filters?.mediaIds || prev.filters.mediaIds));

          let spotsDetail = (urlState as any).spotsDetail || savedState.filters?.spotsDetail || prev.filters.spotsDetail;
          let yearsDetail = (urlState as any).yearsDetail || savedState.filters?.yearsDetail || prev.filters.yearsDetail;

          if (journey === 'commercial') {
            const normalizedMedia = Array.from(
              new Set(
                (media || [])
                  .map((mediaCode: string) => normalizeCommercialMediaCode(mediaCode))
                  .filter((mediaCode: string | null): mediaCode is string => !!mediaCode)
              )
            );
            media = normalizedMedia.length > 0 ? normalizedMedia : [DEFAULT_COMMERCIAL_MEDIA_CODE];

            const normalizedMediaIds = media
              .map((mediaCode: string) => MarketManager.getServiceId(mediaCode))
              .filter((mediaId: number | null): mediaId is number => mediaId != null);
            mediaIds = normalizedMediaIds.length > 0
              ? normalizedMediaIds
              : [MarketManager.getServiceId(DEFAULT_COMMERCIAL_MEDIA_CODE) || 5];

            spotsDetail = sanitizeCommercialDetailMap(spotsDetail, media, 1);
            yearsDetail = sanitizeCommercialDetailMap(yearsDetail, media, 1);
          }
          
          return {
            ...prev,
            journey,
            journeyId,
            usage: SlimmeKassa.getUsageFromJourneyId(journeyId || journey),
            isMuted: savedState.isMuted ?? prev.isMuted,
            filters: {
              ...prev.filters,
              ...savedState.filters,
              language: urlState.language || (searchParams?.get('language') ? MarketManager.getLanguageCode(searchParams?.get('language')!) : (savedState.filters?.language || prev.filters.language)),
              languageId: urlState.languageId || (searchParams?.get('languageId') ? parseInt(searchParams.get('languageId')!) : (savedState.filters?.languageId || prev.filters.languageId)),
              languageIds: urlState.languageId ? [urlState.languageId] : (savedState.filters?.languageIds || prev.filters.languageIds),
              gender: urlState.gender || searchParams?.get('gender') || savedState.filters?.gender || prev.filters.gender,
              media,
              mediaIds,
              spotsDetail,
              yearsDetail,
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
      
      setState(prev => {
        const journey = urlState.journey || prev.journey;
        let media = (urlState as any).media || prev.filters.media;
        let mediaIds = (urlState as any).mediaIds || prev.filters.mediaIds;
        let spotsDetail = (urlState as any).spotsDetail || prev.filters.spotsDetail;
        let yearsDetail = (urlState as any).yearsDetail || prev.filters.yearsDetail;

        if (journey === 'commercial') {
          const normalizedMedia = Array.from(
            new Set(
              (media || [])
                .map((mediaCode: string) => normalizeCommercialMediaCode(mediaCode))
                .filter((mediaCode: string | null): mediaCode is string => !!mediaCode)
            )
          );
          media = normalizedMedia.length > 0 ? normalizedMedia : [DEFAULT_COMMERCIAL_MEDIA_CODE];

          const normalizedMediaIds = media
            .map((mediaCode: string) => MarketManager.getServiceId(mediaCode))
            .filter((mediaId: number | null): mediaId is number => mediaId != null);
          mediaIds = normalizedMediaIds.length > 0
            ? normalizedMediaIds
            : [MarketManager.getServiceId(DEFAULT_COMMERCIAL_MEDIA_CODE) || 5];

          spotsDetail = sanitizeCommercialDetailMap(spotsDetail, media, 1);
          yearsDetail = sanitizeCommercialDetailMap(yearsDetail, media, 1);
        }

        return {
          ...prev,
          currentStep: urlState.step,
          journey,
          filters: {
            ...prev.filters,
            language: urlState.language || prev.filters.language,
            languageId: urlState.languageId || prev.filters.languageId,
            languageIds: urlState.languageId ? [urlState.languageId] : prev.filters.languageIds,
            gender: urlState.gender || prev.filters.gender,
            media,
            mediaIds,
            spotsDetail,
            yearsDetail,
            words: (urlState as any).words || prev.filters.words
          }
        };
      });
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [detectStateFromUrl]);

  useEffect(() => {
    const urlState = detectStateFromUrl(pathname);
    const hasLocaleLanguageChange =
      !!urlState.language &&
      (urlState.language !== state.filters.language ||
        urlState.languageId !== state.filters.languageId);
    if (urlState.journey || urlState.step !== state.currentStep || hasLocaleLanguageChange) {
      const journey = urlState.journey || state.journey;
      const journeyId = MarketManager.getJourneyId(journey);
      setState(prev => {
        let media = (urlState as any).media || prev.filters.media;
        let mediaIds = (urlState as any).mediaIds || prev.filters.mediaIds;
        let spotsDetail = (urlState as any).spotsDetail || prev.filters.spotsDetail;
        let yearsDetail = (urlState as any).yearsDetail || prev.filters.yearsDetail;

        if (journey === 'commercial') {
          const normalizedMedia = Array.from(
            new Set(
              (media || [])
                .map((mediaCode: string) => normalizeCommercialMediaCode(mediaCode))
                .filter((mediaCode: string | null): mediaCode is string => !!mediaCode)
            )
          );
          media = normalizedMedia.length > 0 ? normalizedMedia : [DEFAULT_COMMERCIAL_MEDIA_CODE];

          const normalizedMediaIds = media
            .map((mediaCode: string) => MarketManager.getServiceId(mediaCode))
            .filter((mediaId: number | null): mediaId is number => mediaId != null);
          mediaIds = normalizedMediaIds.length > 0
            ? normalizedMediaIds
            : [MarketManager.getServiceId(DEFAULT_COMMERCIAL_MEDIA_CODE) || 5];

          spotsDetail = sanitizeCommercialDetailMap(spotsDetail, media, 1);
          yearsDetail = sanitizeCommercialDetailMap(yearsDetail, media, 1);
        }

        return {
          ...prev,
          currentStep: urlState.step,
          journey,
          journeyId,
          usage: SlimmeKassa.getUsageFromJourneyId(journeyId || journey),
          filters: {
            ...prev.filters,
            language: urlState.language || prev.filters.language,
            languageId: urlState.languageId || prev.filters.languageId,
            languageIds: urlState.languageId ? [urlState.languageId] : prev.filters.languageIds,
            gender: urlState.gender || prev.filters.gender,
            media,
            mediaIds,
            spotsDetail,
            yearsDetail,
            words: (urlState as any).words || prev.filters.words
          }
        };
      });
    }
  }, [pathname, detectStateFromUrl, state.currentStep, state.filters.language, state.filters.languageId, state.journey]);

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
    const targetUsage = SlimmeKassa.getUsageFromJourneyId(state.journeyId || state.journey);
    
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
    state.journeyId,
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
    if (!isStateInitialized) return;

    const params = new URLSearchParams(window.location.search);
    const URL_EXCLUDED_KEYS = ['spotsDetail', 'yearsDetail', 'mediaRegion', 'media'];
    URL_EXCLUDED_KEYS.forEach(key => params.delete(key));
    params.delete('journey');
    params.delete('journeyId');
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
      
      if (state.journey === 'commercial') {
        const normalizedEntriesMap = new Map<string, string>();
        (state.filters.media || []).forEach((rawMediaCode) => {
          const normalizedMediaCode = normalizeCommercialMediaCode(rawMediaCode);
          if (!normalizedMediaCode) return;
          if (!normalizedEntriesMap.has(normalizedMediaCode)) {
            normalizedEntriesMap.set(normalizedMediaCode, rawMediaCode);
          }
        });

        const normalizedEntries = normalizedEntriesMap.size > 0
          ? Array.from(normalizedEntriesMap.entries())
          : [[DEFAULT_COMMERCIAL_MEDIA_CODE, DEFAULT_COMMERCIAL_MEDIA_CODE] as [string, string]];

        normalizedEntries.forEach(([normalizedMediaCode, rawMediaCode]) => {
          const spots = state.filters.spotsDetail?.[normalizedMediaCode] || state.filters.spotsDetail?.[rawMediaCode] || 1;
          const years = state.filters.yearsDetail?.[normalizedMediaCode] || state.filters.yearsDetail?.[rawMediaCode] || 1;
          if (spots === 1 && years === 1) {
            targetUrl += normalizedMediaCode + '/';
          } else {
            targetUrl += normalizedMediaCode + spots + 'x' + years + '/';
          }
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
  }, [state.journey, state.filters, pathname, isStateInitialized, state.journeyId]);

  const updateJourney = useCallback((journeyInput: JourneyType | number) => {
    let journey: JourneyType;
    let journeyId: number | null;

    if (typeof journeyInput === 'number') {
      journeyId = journeyInput;
      const match = MarketManager.journeys.find(j => j.id === journeyId);
      const code = match?.code.toLowerCase() || '';
      if (code.includes('ivr') || code.includes('telephony')) journey = 'telephony';
      else if (code.includes('commercial')) journey = 'commercial';
      else journey = 'video';
    } else {
      journey = journeyInput;
      journeyId = MarketManager.getJourneyId(journey);
    }

    const usage = SlimmeKassa.getUsageFromJourneyId(journeyId || journey);
    
    setState(prev => {
      const newFilters = { ...prev.filters };
      if (journey === 'telephony') newFilters.words = 25;
      else if (journey === 'video') newFilters.words = 200;
      else if (journey === 'commercial') newFilters.words = 100;

      if (journey === 'commercial' && (!newFilters.media || newFilters.media.length === 0)) {
        newFilters.media = ['online'];
      }
      
      return { ...prev, journey, journeyId, usage, filters: newFilters };
    });

    updateVoicesJourney(journey);
    updateUsage(usage, journeyId || undefined);
  }, [updateVoicesJourney, updateUsage]);

  const updateFilters = useCallback((newFilters: Partial<MasterControlState['filters']>) => {
    setState(prev => {
      const updatedFilters = { ...prev.filters, ...newFilters };

      // 🛡️ CHRIS-PROTOCOL: Auto-sync IDs for Handshake Truth (v2.28.1)
      if (newFilters.languageIds && newFilters.languageIds.length > 0 && !newFilters.languageId) {
        updatedFilters.languageId = newFilters.languageIds[0];
      }
      if (newFilters.language && !newFilters.languageId) {
        const langId = MarketManager.getLanguageId(newFilters.language);
        if (langId) updatedFilters.languageId = langId;
      }

      if (newFilters.gender && !newFilters.genderId) {
        // Gender IDs are usually 1 (Male), 2 (Female), 3 (Neutral)
        const gMap: Record<string, number> = { 'male': 1, 'man': 1, 'female': 2, 'vrouw': 2, 'neutral': 3, 'neutraal': 3 };
        const gId = gMap[newFilters.gender.toLowerCase()];
        if (gId) updatedFilters.genderId = gId;
      }

      if (newFilters.country && !newFilters.countryId) {
        const cId = MarketManager.getCountryId(newFilters.country);
        if (cId) updatedFilters.countryId = cId;
      }

      if (updatedFilters.words !== undefined && updatedFilters.words < 5) {
        updatedFilters.words = prev.journey === 'telephony' ? 25 : 200;
      }
      
      if (newFilters.media) {
        if (prev.journey === 'commercial') {
          const normalizedMedia = Array.from(
            new Set(
              (newFilters.media || [])
                .map((mediaCode) => normalizeCommercialMediaCode(mediaCode))
                .filter((mediaCode): mediaCode is string => !!mediaCode)
            )
          );

          const commercialMedia = normalizedMedia.length > 0 ? normalizedMedia : [DEFAULT_COMMERCIAL_MEDIA_CODE];
          updatedFilters.media = commercialMedia;

          const normalizedMediaIds = commercialMedia
            .map((mediaCode) => MarketManager.getServiceId(mediaCode))
            .filter((mediaId): mediaId is number => mediaId != null);

          updatedFilters.mediaIds = normalizedMediaIds.length > 0
            ? normalizedMediaIds
            : [MarketManager.getServiceId(DEFAULT_COMMERCIAL_MEDIA_CODE) || 5];

          updatedFilters.spotsDetail = sanitizeCommercialDetailMap(
            updatedFilters.spotsDetail,
            commercialMedia,
            1
          );

          updatedFilters.yearsDetail = sanitizeCommercialDetailMap(
            updatedFilters.yearsDetail,
            commercialMedia,
            1
          );
        }
        updateMedia(updatedFilters.media || [], updatedFilters.mediaIds);
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
        if (typeof window !== 'undefined') {
          const actorPath = buildCanonicalActorPath(
            checkoutState.selectedActor.slug,
            checkoutState.selectedActor.display_name || checkoutState.selectedActor.first_name
          );
          const newUrl = `${actorPath}${window.location.search || ''}`;
          const currentUrl = `${window.location.pathname}${window.location.search || ''}`;
          if (newUrl !== currentUrl) {
            window.history.replaceState(null, '', newUrl);
          }
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
  }, [
    setCheckoutStep,
    checkoutState.selectedActor?.slug,
    checkoutState.selectedActor?.display_name,
    checkoutState.selectedActor?.first_name,
    pathname
  ]);

  const resetFilters = useCallback(() => {
    const host = typeof window !== 'undefined' ? window.location.host : (process.env.NEXT_PUBLIC_SITE_URL?.replace('https://', '') || MarketManager.getMarketDomains()['BE'].replace('https://', ''));
    const pathnameNow = typeof window !== 'undefined' ? window.location.pathname : '';
    const market = MarketManager.getCurrentMarket(host, pathnameNow);
    const localePrefixMatch = pathnameNow.match(/^\/(nl|fr|en|de|es|it|pt)(\/|$)/i);
    const localeFromPath = localePrefixMatch ? normalizeLocale(localePrefixMatch[1], market?.primary_language || 'nl-be') : null;
    const handshake = typeof window !== 'undefined' ? (window as any).handshakeContext : null;
    const handshakeLangId = handshake?.languageId != null ? handshake.languageId : null;
    const handshakeLangCode = handshakeLangId != null && MarketManager.languages?.length
      ? (MarketManager.languages.find((l: { id: number; code: string }) => l.id === handshakeLangId)?.code)
      : null;
    const defaultLang = localeFromPath || handshakeLangCode || MarketManager.getLanguageCode(market?.primary_language || 'nl-be');
    const defaultLangId =
      (localeFromPath ? MarketManager.getLanguageId(localeFromPath, market?.primary_language || 'nl-be') : null)
      ?? handshakeLangId
      ?? market?.primary_language_id
      ?? 1;
    
    const defaultFilters: Partial<MasterControlState['filters']> = {
      language: defaultLang,
      languageId: defaultLangId,
      languages: [defaultLang.toLowerCase()],
      languageIds: [defaultLangId],
      gender: null,
      genderId: null,
      style: null,
      sortBy: 'popularity',
      words: state.journey === 'telephony' ? 25 : (state.journey === 'video' ? 200 : 100),
      media: ['online'],
      mediaIds: [5],
      country: 'BE',
      countryId: 1,
      spots: 1,
      years: 1,
      liveSession: false,
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
