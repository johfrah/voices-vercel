"use client";

/**
 *  CHECKOUT CONTEXT (NUCLEAR 2026)
 * 
 * Beheert de volledige checkout flow van briefing tot betaling.
 * 
 *  CHRIS-PROTOCOL:
 * - Nuclear Loading: Alle zware hooks en effecten zijn geoptimaliseerd.
 * - Antifragile: Kan omgaan met zowel ISO-codes als UI-labels.
 * 
 * @lock-file
 */

import { PlanType, SlimmeKassa, UsageType } from '@/lib/engines/pricing-engine';
import { generateCartHash } from '@/lib/utils/cart-utils';
import { Actor } from '@/types';
import { cn } from '@/lib/utils';
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
  secondaryLanguages: string[]; // Added for telephony multi-language
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
    vat_verified?: boolean;
  };
  paymentMethod: string;
  paymentMethods: any[];
  taxRate: number;
  agreedToTerms: boolean;
  isSubmitting: boolean;
  items: any[];
  isLocked: boolean;
  mediaCache: Record<string, string[]>; //  NEW: Cache media selections per journey
  briefingFiles: {
    id: string;
    name: string;
    type: 'audio' | 'video' | 'text';
    url: string;
  }[];
  pricingConfig: any;
  pricing: {
    base: number;
    wordSurcharge: number;
    mediaSurcharge: number;
    mediaBreakdown?: Record<string, {
      subtotal: number;
      discount: number;
      final: number;
    }>;
    musicSurcharge: number;
    radioReadySurcharge: number;
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
  updateSecondaryLanguages: (languages: string[]) => void;
  updateSpots: (spots: number) => void;
  updateYears: (years: number) => void;
  updateSpotsDetail: (detail: Record<string, number>) => void;
  updateYearsDetail: (detail: Record<string, number>) => void;
  updateLiveSession: (liveSession: boolean) => void;
  updateIsQuoteRequest: (isQuote: boolean) => void;
  updateMusic: (music: Partial<CheckoutState['music']>) => void;
  selectActor: (actor: Actor | null) => void;
  updateCustomer: (customer: Partial<CheckoutState['customer']>) => void;
  updatePaymentMethod: (method: string) => void;
  updateAgreedToTerms: (agreed: boolean) => void;
  updateIsSubmitting: (submitting: boolean) => void;
  addItem: (item: any) => void;
  removeItem: (itemId: string) => void;
  restoreItem: (item: any) => void;
  resetSelection: () => void;
  calculatePricing: () => void;
  addBriefingFile: (file: { name: string, type: 'audio' | 'video' | 'text', url: string }) => void;
  removeBriefingFile: (id: string) => void;
  lockPrice: () => void;
  unlockPrice: () => void;
  isVatExempt: boolean;
  subtotal: number;
  cartHash: string;
  isHydrated: boolean;
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
  secondaryLanguages: [],
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
  paymentMethod: 'bancontact',
  paymentMethods: [
    { id: 'bancontact', description: 'Bancontact', image: { size2x: '/assets/common/branding/payment/bancontact.svg' } },
    { id: 'ideal', description: 'iDEAL', image: { size2x: '/assets/common/branding/payment/mollie.svg' } },
    { id: 'banktransfer', description: 'Betalen op factuur (Offerte)', isInvoice: true, image: { size2x: '/assets/common/branding/icons/ACCOUNT.svg' } }
  ],
  taxRate: 0.21,
  agreedToTerms: true,
  isSubmitting: false,
  items: [],
  isLocked: false,
  mediaCache: {
    commercial: ['online'],
  },
  briefingFiles: [],
  pricingConfig: null,
  pricing: {
    base: 0,
    wordSurcharge: 0,
    mediaSurcharge: 0,
    musicSurcharge: 0,
    radioReadySurcharge: 0,
    total: 0,
  },
};

const CheckoutContext = createContext<CheckoutContextType | undefined>(undefined);

export const CheckoutProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isHydrated, setIsHydrated] = useState(false);
  const [state, setState] = useState<CheckoutState>(initialState);

  //  CHRIS-PROTOCOL: Hydration & Persistence Layer
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('voices_checkout_state');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          console.log(`[CheckoutContext] Restoring state from localStorage: ${parsed.items?.length || 0} items`);
          
          //  KELLY-MANDATE: Clean up items during hydration (remove 0 prices and duplicates)
          const cleanItems = (parsed.items || []).filter((item: any, index: number, self: any[]) => {
            const price = item.pricing?.total ?? item.pricing?.subtotal ?? 0;
            if (price <= 0) return false;
            
            // Check if this is the first occurrence of this configuration
            return index === self.findIndex((itemToCompare: any) => (
              itemToCompare.actor?.id === item.actor?.id &&
              itemToCompare.briefing === item.briefing &&
              itemToCompare.usage === item.usage &&
              JSON.stringify(itemToCompare.media) === JSON.stringify(item.media) &&
              JSON.stringify(itemToCompare.spots) === JSON.stringify(item.spots) &&
              JSON.stringify(itemToCompare.years) === JSON.stringify(item.years) &&
              itemToCompare.liveSession === item.liveSession &&
              itemToCompare.music?.trackId === item.music?.trackId
            ));
          });

          setState(prev => ({
            ...prev,
            ...parsed,
            items: cleanItems,
            customer: { ...prev.customer, ...parsed.customer },
            paymentMethods: prev.paymentMethods
          }));
        } catch (e) {
          console.error('Failed to parse checkout state from localStorage', e);
        }
      }
      // 🛡️ CHRIS-PROTOCOL: Set hydrated flag AFTER state restoration
      setIsHydrated(true);
    }
  }, []);

  //  CHRIS-PROTOCOL: Centralized Config Fetching - ONLY AFTER HYDRATION
  useEffect(() => {
    if (!isHydrated) return;

    const fetchConfig = async () => {
      try {
        const res = await fetch('/api/checkout/config');
        const data = await res.json();
        
        const pricingRes = await fetch('/api/pricing/config');
        const pricingData = await pricingRes.json();

        if (data && data.paymentMethods) {
          const filtered = data.paymentMethods.filter((m: any) => 
            m.id !== 'paybybank' && m.id !== 'banktransfer'
          );
          
          const allMethods = [
            ...filtered.map((m: any) => {
              // 🛡️ CHRIS-PROTOCOL: Force local assets for stability (v2.14.272)
              // API URLs (Mollie) are sometimes unstable or blocked.
              let localPath = m.image?.size2x || m.image?.size1x;
              
              if (m.id === 'bancontact') localPath = '/assets/common/branding/payment/bancontact.svg';
              if (m.id === 'ideal') localPath = '/assets/common/branding/payment/ideal.svg';
              if (m.id === 'creditcard') localPath = '/assets/common/branding/payment/visa.svg';
              
              return {
                ...m,
                image: {
                  ...m.image,
                  size2x: localPath
                }
              };
            }),
            { 
              id: 'banktransfer', 
              description: 'Betalen op factuur (Offerte)', 
              isInvoice: true,
              image: { size2x: '/assets/common/branding/icons/ACCOUNT.svg' }
            }
          ];
          
          setState(prev => ({
            ...prev,
            paymentMethods: allMethods,
            taxRate: data.taxRate || 0.21,
            pricingConfig: pricingData
          }));
        }
      } catch (e) {
        console.warn('[CheckoutContext] Failed to fetch config', e);
      }
    };
    fetchConfig();
  }, [isHydrated]);

  useEffect(() => {
    if (isHydrated && typeof window !== 'undefined') {
      localStorage.setItem('voices_checkout_state', JSON.stringify({
        items: state.items,
        customer: state.customer,
        selectedActor: state.selectedActor,
        briefing: state.briefing,
        usage: state.usage,
        media: state.media,
        country: state.country,
        pricing: state.pricing,
        journey: state.journey,
        step: state.step
      }));
    }
  }, [state.items, state.customer, state.selectedActor, state.briefing, state.usage, state.media, state.country, state.pricing, state.journey, state.step, isHydrated]);

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

  const updatePlan = useCallback((plan: PlanType) => setState(prev => ({ ...prev, plan })), []);
  const updateMedia = useCallback((media: CheckoutState['media']) => {
    console.log(`[CheckoutContext] Updating media to: ${JSON.stringify(media)}`);
    setState(prev => {
      const newState = { ...prev, media };
      
      //  MONKEYPROOF CACHE: Save commercial media selection
      if (prev.usage === 'commercial') {
        newState.mediaCache = { ...prev.mediaCache, commercial: media };
      }
      
      return newState;
    });
  }, []);
  const updateCountry = useCallback((country: string | string[]) => setState(prev => ({ ...prev, country })), []);
  const updateSecondaryLanguages = useCallback((languages: string[]) => setState(prev => ({ ...prev, secondaryLanguages: languages })), []);
  const updateSpots = useCallback((spots: number) => setState(prev => ({ ...prev, spots })), []);
  const updateYears = useCallback((years: number) => setState(prev => ({ ...prev, years })), []);
  const updateSpotsDetail = useCallback((detail: Record<string, number>) => setState(prev => ({ ...prev, spotsDetail: detail })), []);
  const updateYearsDetail = useCallback((detail: Record<string, number>) => setState(prev => ({ ...prev, yearsDetail: detail })), []);
  const updateLiveSession = useCallback((liveSession: boolean) => setState(prev => ({ ...prev, liveSession })), []);
  const updateIsQuoteRequest = useCallback((isQuoteRequest: boolean) => setState(prev => ({ ...prev, isQuoteRequest })), []);

  const updateMusic = useCallback((music: Partial<CheckoutState['music']>) =>
    setState(prev => ({ ...prev, music: { ...prev.music, ...music } })), []);

  const selectActor = useCallback((actor: Actor | null) => setState(prev => {
    const status = actor ? SlimmeKassa.getAvailabilityStatus(
      actor,
      prev.usage === 'commercial' ? (prev.media as any) : [],
      Array.isArray(prev.country) ? prev.country[0] : prev.country
    ) : 'available';

    return {
      ...prev,
      selectedActor: actor,
      isQuoteRequest: status === 'unavailable' // SlimmeKassa returns available/unavailable
    };
  }), []);

  const updateCustomer = useCallback((customer: Partial<CheckoutState['customer']>) =>
    setState(prev => ({ ...prev, customer: { ...prev.customer, ...customer } })), []);

  const updatePaymentMethod = useCallback((paymentMethod: string) =>
    setState(prev => ({ ...prev, paymentMethod })), []);

  const updateAgreedToTerms = useCallback((agreedToTerms: boolean) =>
    setState(prev => ({ ...prev, agreedToTerms })), []);

  const updateIsSubmitting = useCallback((isSubmitting: boolean) =>
    setState(prev => ({ ...prev, isSubmitting })), []);

  const addItem = useCallback((item: any) => setState(prev => {
    //  KELLY-MANDATE: Prevent adding items with 0 price
    const itemPrice = item.pricing?.total ?? item.pricing?.subtotal ?? 0;
    if (itemPrice <= 0) {
      console.warn('[CheckoutContext] Attempted to add item with 0 price. Blocked.', item);
      return prev;
    }

    //  CHRIS-PROTOCOL: Prevent duplicate items (exact same configuration)
    const isDuplicate = prev.items.some(existing => 
      existing.actor?.id === item.actor?.id &&
      existing.briefing === item.briefing &&
      existing.usage === item.usage &&
      JSON.stringify(existing.media) === JSON.stringify(item.media) &&
      JSON.stringify(existing.spots) === JSON.stringify(item.spots) &&
      JSON.stringify(existing.years) === JSON.stringify(item.years) &&
      existing.liveSession === item.liveSession &&
      existing.music?.trackId === item.music?.trackId
    );

    if (isDuplicate) {
      console.warn('[CheckoutContext] Attempted to add duplicate item. Blocked.');
      return prev;
    }

    return {
      ...prev,
      items: [...prev.items, item]
    };
  }), []);

  const removeItem = useCallback((itemId: string) => setState(prev => {
    const newItems = prev.items.filter((i: { id?: string }) => i.id !== itemId);
    console.log(`[CheckoutContext] Removing item: ${itemId}. Remaining items: ${newItems.length}`);
    return {
      ...prev,
      items: newItems
    };
  }), []);

  const restoreItem = useCallback((item: any) => {
    console.log('[CheckoutContext] Restoring item for editing:', item.id, item);
    setState(prev => ({
      ...prev,
      selectedActor: item.actor,
      briefing: item.script || item.briefing || '',
      pronunciation: item.pronunciation || '',
      usage: item.usage || 'unpaid',
      media: item.media || ['online'],
      country: item.country || 'BE',
      secondaryLanguages: item.secondaryLanguages || [],
      spots: typeof item.spots === 'number' ? item.spots : 1,
      years: typeof item.years === 'number' ? item.years : 1,
      spotsDetail: typeof item.spots === 'object' ? item.spots : {},
      yearsDetail: typeof item.years === 'object' ? item.years : {},
      liveSession: item.liveSession || false,
      music: item.music || { trackId: null, asBackground: false, asHoldMusic: false },
      items: prev.items.filter((i: any) => i.id !== item.id)
    }));
  }, []);

  const resetSelection = useCallback(() => {
    setState(prev => ({
      ...prev,
      selectedActor: null,
      briefing: '',
      pronunciation: '',
      usage: 'unpaid',
      media: ['online'],
      country: 'BE',
      secondaryLanguages: [],
      prompts: 1,
      spots: 1,
      years: 1,
      spotsDetail: {},
      yearsDetail: {},
      liveSession: false,
      music: {
        trackId: null,
        asBackground: false,
        asHoldMusic: false,
      },
      pricing: {
        base: 0,
        wordSurcharge: 0,
        mediaSurcharge: 0,
        musicSurcharge: 0,
        radioReadySurcharge: 0,
        total: 0,
      }
    }));
  }, []);

  const addBriefingFile = useCallback((file: { name: string, type: 'audio' | 'video' | 'text', url: string }) => {
    setState(prev => ({
      ...prev,
      briefingFiles: [...prev.briefingFiles, { ...file, id: `file-${Date.now()}` }]
    }));
  }, []);

  const removeBriefingFile = useCallback((id: string) => {
    setState(prev => ({
      ...prev,
      briefingFiles: prev.briefingFiles.filter(f => f.id !== id)
    }));
  }, []);

  const lockPrice = useCallback(() => setState(prev => ({ ...prev, isLocked: true })), []);
  const unlockPrice = useCallback(() => setState(prev => ({ ...prev, isLocked: false })), []);

  const calculatePricing = useCallback(() => {
    if (state.isLocked) return; //  KELLY'S LOCK: No recalculation if price is frozen

    console.log(`[CheckoutContext] Calculating pricing for journey: ${state.journey}, usage: ${state.usage}`);

    // Academy pricing logic
    if (state.journey === 'academy') {
      const result = SlimmeKassa.calculate({
        usage: 'subscription',
        plan: 'pro',
        actorRates: {},
      }, state.pricingConfig || undefined);
      
      let academySubtotal = result.total; 
      if (state.upsells.workshop_home) {
        const workshopResult = SlimmeKassa.calculate({
          usage: 'subscription',
          plan: 'studio',
          actorRates: {},
        }, state.pricingConfig || undefined);
        academySubtotal += workshopResult.total;
      }

      console.log(`[CheckoutContext] Academy total: ${academySubtotal}`);

      setState(prev => ({
        ...prev,
        pricing: {
          ...prev.pricing,
          total: academySubtotal,
        }
      }));
      return;
    }

    // Studio pricing logic
    if (state.journey === 'studio' && state.editionId) {
      const result = SlimmeKassa.calculate({
        usage: 'subscription',
        plan: 'studio',
        actorRates: {},
      }, state.pricingConfig || undefined);
      
      setState(prev => ({
        ...prev,
        pricing: {
          ...prev.pricing,
          total: result.total,
        }
      }));
      return;
    }

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

    const result = SlimmeKassa.calculate({
      usage: state.usage,
      plan: state.plan,
      words: wordCount,
      prompts: promptCount,
      mediaTypes: state.usage === 'commercial' ? (state.media as any) : [],
      countries: Array.isArray(state.country) ? state.country : [state.country],
      spots: spotsMap,
      years: yearsMap,
      liveSession: state.liveSession,
      actorRates: state.selectedActor as any, 
      music: state.music,
      isVatExempt: !!state.customer.vat_number && 
        state.customer.vat_verified === true &&
        state.customer.vat_number.length > 2 && 
        !state.customer.vat_number.startsWith('BE') && 
        state.customer.country !== 'BE'
    }, state.pricingConfig || undefined);

    // Liquid price animation in context
    setState(prev => {
      //  INFINITE LOOP GUARD: Only update if values actually changed
      if (
        prev.prompts === promptCount &&
        prev.pricing.base === result.base &&
        prev.pricing.wordSurcharge === result.wordSurcharge &&
        prev.pricing.mediaSurcharge === result.mediaSurcharge &&
        prev.pricing.musicSurcharge === result.musicSurcharge &&
        prev.pricing.radioReadySurcharge === result.radioReadySurcharge &&
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
          mediaBreakdown: result.mediaBreakdown,
          musicSurcharge: result.musicSurcharge,
          radioReadySurcharge: result.radioReadySurcharge,
          total: result.subtotal, //  KELLY-MANDATE: Only current selection total
          legalDisclaimer: result.legalDisclaimer
        }
      };
    });
  }, [state.briefing, state.usage, state.plan, state.journey, state.upsells, state.music, state.customer.vat_number, state.customer.country, state.customer.vat_verified, state.isLocked, state.editionId, state.media, state.country, state.selectedActor, state.spots, state.years, state.spotsDetail, state.yearsDetail, state.liveSession, state.pricingConfig]);

  //  KELLY'S SYNC: Re-calculate pricing whenever usage, briefing or other key factors change
  // This effect is the primary driver for price updates in the configurator.
  useEffect(() => {
    calculatePricing();
  }, [calculatePricing]);

  const isVatExempt = !!state.customer.vat_number && 
    state.customer.vat_verified === true &&
    state.customer.vat_number.length > 2 && 
    !state.customer.vat_number.startsWith('BE') && 
    state.customer.country !== 'BE';

  //  CHRIS-PROTOCOL: Centralized Subtotal Selector
  // Dit is de enige bron van waarheid voor het subtotaal in de hele app.
  // Het telt de items in het mandje op, en voegt de huidige selectie toe ALLEEN als we in de briefing-stap zijn.
  const subtotal = React.useMemo(() => {
    const cartTotal = state.items.reduce((sum, item) => sum + (item.pricing?.total ?? item.pricing?.subtotal ?? 0), 0);
    // 🛡️ KELLY-FIX: Alleen de huidige selectie optellen als we NIET in de details/payment stap zitten
    // De bezoeker ziet het item al in de lijst (state.items), dus we mogen het niet dubbel tellen.
    const isAlreadyInCart = state.selectedActor && state.items.some(item => (item.actor?.id === state.selectedActor?.id || item.actor?.wpProductId === state.selectedActor?.id));
    const isEditing = state.selectedActor && state.items.length === 0; // Als items leeg is maar er is een actor, zijn we waarschijnlijk aan het editen
    const currentSelectionTotal = (state.selectedActor && (state.step === 'briefing' || isEditing) && !isAlreadyInCart) ? state.pricing.total : 0;
    return cartTotal + currentSelectionTotal;
  }, [state.items, state.selectedActor, state.step, state.pricing.total]);

  const cartHash = React.useMemo(() => {
    return generateCartHash(state.items, state.selectedActor, state.step);
  }, [state.items, state.selectedActor, state.step]);

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
      updateSecondaryLanguages,
      updateSpots, 
      updateYears, 
      updateSpotsDetail, 
      updateYearsDetail, 
      updateLiveSession, 
      updateIsQuoteRequest, 
      updateMusic, 
      selectActor, 
      updateCustomer,
      updatePaymentMethod,
      updateAgreedToTerms,
      updateIsSubmitting,
      addItem,
      removeItem,
      restoreItem,
      resetSelection,
      calculatePricing,
      addBriefingFile,
      removeBriefingFile,
      lockPrice,
      unlockPrice,
      isVatExempt,
      subtotal,
      cartHash,
      isHydrated
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
