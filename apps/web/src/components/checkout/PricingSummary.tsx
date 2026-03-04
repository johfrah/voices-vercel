"use client";

import {
    ContainerInstrument,
    HeadingInstrument,
    TextInstrument,
    LabelInstrument,
    InputInstrument,
    ButtonInstrument
} from '@/components/ui/LayoutInstruments';
import { VoiceglotText } from '@/components/ui/VoiceglotText';
import { useCheckout } from '@/contexts/CheckoutContext';
import { useMasterControl } from '@/contexts/VoicesMasterControlContext';
import { useSonicDNA } from '@/lib/engines/sonic-dna';
import { useTranslation } from '@/contexts/TranslationContext';
import { cn } from '@/lib/utils';
import { formatWorkshopLocationLabel } from '@/lib/utils/workshop-location';
import { normalizeWorkshopImageUrl, resolveWorkshopImageFromItem } from '@/lib/utils/workshop-image';
import { VOICES_CONFIG } from '@/lib/core-internal/config';
import { normalizeLocale } from '@/lib/system/locale-utils';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, Loader2, Trash2, Edit2, X, ChevronRight, Info, CreditCard, FileText, Tag, Eye, Lock, AlertCircle, Send, ArrowRight, Check, Instagram, Clock3, RadioTower, Target, CalendarDays, MapPin, UserRound, Mail } from 'lucide-react';
import Image from 'next/image';
import React, { useEffect, useState } from 'react';
import { MarketManagerServer as MarketManager } from "@/lib/system/core/market-manager";
import { EmailPreviewModal } from './EmailPreviewModal';
import { TermsModal } from './TermsModal';

import { calculateDeliveryDate } from '@/lib/utils/delivery-logic';

export const PricingSummary: React.FC<{ 
  onlyItems?: boolean; 
  onlyTotals?: boolean;
  showCtaWhenOnlyTotals?: boolean;
  className?: string;
}> = ({ onlyItems, onlyTotals, showCtaWhenOnlyTotals, className }) => {
  const { state, subtotal, cartHash, removeItem, clearCart, restoreItem, isVatExempt, updateIsSubmitting, isHydrated } = useCheckout();
  const { updateStep } = useMasterControl();
  const { playClick } = useSonicDNA();
  const { t, language } = useTranslation();
  
  // CHRIS-PROTOCOL: Hydration Guard to prevent Error #419
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [couponCode, setCouponCode] = useState('');
  const [isApplyingCoupon, setIsCouponApplying] = useState(false);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isTermsOpen, setIsTermsOpen] = useState(false);
  const [reviewStats, setReviewStats] = useState<{ averageRating: number, totalCount: number } | null>(null);
  const [workshopThumbnailMap, setWorkshopThumbnailMap] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!isHydrated) return;
    const fetchStats = async () => {
      try {
        //  CHRIS-PROTOCOL: Fetch stats directly from public API to avoid proxy overhead and admin auth
        const res = await fetch('/api/actors');
        const data = await res.json();
        if (data.reviewStats) setReviewStats(data.reviewStats);
      } catch (e) {
        console.warn('[PricingSummary] Failed to fetch review stats:', e);
      }
    };
    fetchStats();
  }, [isHydrated]);

  useEffect(() => {
    if (!isHydrated) return;
    const workshopItems = (state.items || []).filter((item: any) => item?.type === 'workshop_edition');
    if (workshopItems.length === 0) return;

    let cancelled = false;

    const fetchWorkshopThumbnails = async () => {
      try {
        const res = await fetch('/api/studio/workshops', { cache: 'no-store' });
        if (!res.ok) return;
        const data = await res.json();
        if (!data?.workshops || !Array.isArray(data.workshops)) return;

        const mappedThumbnails: Record<string, string> = {};
        for (const workshop of data.workshops) {
          const rawFilePath = workshop?.featured_image?.file_path;
          if (!rawFilePath || typeof rawFilePath !== 'string') continue;

          const normalizedUrl = normalizeWorkshopImageUrl(rawFilePath);
          if (!normalizedUrl) continue;

          if (workshop.id) mappedThumbnails[`workshop:${String(workshop.id)}`] = normalizedUrl;
          if (workshop.slug) mappedThumbnails[`slug:${String(workshop.slug).toLowerCase()}`] = normalizedUrl;
          if (workshop.title) mappedThumbnails[`title:${String(workshop.title).trim().toLowerCase()}`] = normalizedUrl;

          if (Array.isArray(workshop.upcoming_editions)) {
            for (const edition of workshop.upcoming_editions) {
              const editionId = edition?.id;
              if (editionId !== null && editionId !== undefined) {
                mappedThumbnails[`edition:${String(editionId)}`] = normalizedUrl;
              }
            }
          }
        }

        if (!cancelled) {
          setWorkshopThumbnailMap(mappedThumbnails);
        }
      } catch (error) {
        console.warn('[PricingSummary] Workshop thumbnail hydration failed:', error);
      }
    };

    fetchWorkshopThumbnails();

    return () => {
      cancelled = true;
    };
  }, [isHydrated, state.items]);

  const applyCoupon = async () => {
    setIsCouponApplying(true);
    setCouponError(null);
    playClick('light');

    try {
      setCouponError(t('checkout.coupon.disabled', 'Kortingscodes zijn tijdelijk niet beschikbaar'));
      playClick('error');
    } catch (e) {
      setCouponError(t('checkout.coupon.error', 'Fout bij valideren'));
    } finally {
      setIsCouponApplying(false);
    }
  };

  const handleSubmit = async (quoteMessage?: string) => {
    if (state.isSubmitting) return;
    
    playClick('deep');
    updateIsSubmitting(true);

    try {
      // 🛡️ CHRIS-PROTOCOL: Structural Integrity (v2.14.245)
      // No more "pleisters". We use the shared CheckoutPayloadSchema to prepare the data.
      const safeBriefing = state.briefing || '';
      const wordCount = ((safeBriefing || '')).trim().split(/\s+/).filter(Boolean).length;
      
      const payload = {
        pricing: {
          total: subtotal,
          cartHash: cartHash,
          base: state.pricing.base,
          wordSurcharge: state.pricing.wordSurcharge,
          mediaSurcharge: state.pricing.mediaSurcharge,
          musicSurcharge: state.pricing.musicSurcharge,
        },
        items: state.items || [],
        selectedActor: state.selectedActor,
        step: state.step,
        email: state.customer.email,
        first_name: state.customer.first_name,
        last_name: state.customer.last_name,
        phone: state.customer.phone,
        company: state.customer.company,
        vat_number: state.customer.vat_number,
        address_street: state.customer.address_street,
        postal_code: state.customer.postal_code,
        city: state.customer.city,
        country: state.customer.country || 'BE',
        language: normalizeLocale(language),
        usage: state.usage,
        plan: state.plan,
        briefing: safeBriefing,
        quoteMessage: quoteMessage || null,
        is_quote: state.isQuoteRequest || false,
        payment_method: state.paymentMethod,
        metadata: {
          words: wordCount,
          prompts: state.prompts || 0,
          user_id: (state as any).metadata?.user_id
        }
      };

      // 🛡️ CHRIS-PROTOCOL: "Black Box" Snapshot Logging (v2.14.245)
      // We loggen de VOLLEDIGE payload naar de Watchdog voordat we de API aanroepen.
      // Dit geeft ons 100% zicht op wat de browser probeert te versturen.
      console.log('[Checkout] 📦 BLACK BOX SNAPSHOT:', payload);

      console.log('[Checkout] Submitting validated payload...', { 
        email: payload.email, 
        amount: payload.pricing.total 
      });

      const res = await fetch('/api/checkout/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || data.message || `Server error: ${res.status}`);
      }

      if (data.success) {
        // 🛡️ CHRIS-PROTOCOL: Clear cart after successful order (v2.14.325)
        clearCart();

        if (state.isQuoteRequest || data.isBankTransfer || !data.checkoutUrl) {
          setIsPreviewOpen(false);
          updateIsSubmitting(false);
          
          // 🛡️ CHRIS-PROTOCOL: Smart Redirect (v2.14.313)
          // Als we verificatie nodig hebben, tonen we een speciale succes-pagina
          if (data.requiresVerification) {
            window.location.href = `/checkout/success?orderId=${data.orderId}&verify=true&email=${encodeURIComponent(payload.email)}`;
            return;
          }

          const redirectUrl = data.token 
            ? `/api/auth/magic-login?token=${data.token}&redirect=/account/orders?orderId=${data.orderId}${state.isQuoteRequest ? '&type=quote' : ''}${data.deliveryTime ? `&delivery=${encodeURIComponent(data.deliveryTime)}` : ''}`
            : `/account/orders?orderId=${data.orderId}${state.isQuoteRequest ? '&type=quote' : ''}${data.deliveryTime ? `&delivery=${encodeURIComponent(data.deliveryTime)}` : ''}`;
          
          window.location.href = redirectUrl;
        } else if (data.checkoutUrl) {
          window.location.href = data.checkoutUrl;
        }
      } else {
        throw new Error(data.message || t('common.error.generic', 'Er is iets misgegaan.'));
      }
    } catch (error: any) {
      console.error('[Checkout] Submission failed:', error);
      alert(error.message || t('common.error.generic', 'Er is een fout opgetreden.'));
      updateIsSubmitting(false);
    }
  };

  const isCartPage = typeof window !== 'undefined' && window.location.pathname.includes('/cart');
  const isCheckoutPage = typeof window !== 'undefined' && window.location.pathname.includes('/checkout');
  const localePrefix = typeof window !== 'undefined'
    ? (window.location.pathname.match(/^\/(fr|en|nl|de|es|it|pt)(?=\/|$)/i)?.[0] || '')
    : '';
  const isStudioJourney = state.journey === 'studio'
    || !!state.editionId
    || (state.items || []).some((item: any) => item?.type === 'workshop_edition');
  const studioCartPath = `${localePrefix}/studio/cart`;
  const defaultCartPath = `${localePrefix}/cart`;
  const resolveWorkshopImageSrc = (workshopItem: any): string => {
    return resolveWorkshopImageFromItem(workshopItem as Record<string, unknown>, workshopThumbnailMap) || '/icon-workshop.svg';
  };
  const activeCoupon = ((state as any)?.customer?.active_coupon?.verified === true)
    ? (state as any).customer.active_coupon
    : null;
  const discountAmount = activeCoupon
    ? (activeCoupon.type === 'percentage'
        ? (subtotal * (activeCoupon.discount / 100))
        : Number(activeCoupon.discount || 0))
    : 0;
  const subtotalAfterDiscount = Math.max(0, subtotal - discountAmount);
  const vatRate = isVatExempt ? 0 : 0.21;
  const tax = subtotalAfterDiscount * vatRate;
  const total = subtotalAfterDiscount + tax;
  const toArrayValues = (value: unknown): Array<string | number> => {
    if (Array.isArray(value)) return value.filter((entry): entry is string | number => typeof entry === 'string' || typeof entry === 'number');
    if (value === null || value === undefined || value === '') return [];
    if (typeof value === 'string') {
      return value
        .split(',')
        .map((entry) => entry.trim())
        .filter(Boolean);
    }
    if (typeof value === 'number') return [value];
    return [];
  };

  const toNumberOrNull = (value: unknown): number | null => {
    if (typeof value === 'number' && Number.isFinite(value)) return value;
    if (typeof value === 'string') {
      const trimmed = value.trim();
      if (!trimmed) return null;
      const parsed = Number(trimmed);
      return Number.isFinite(parsed) ? parsed : null;
    }
    return null;
  };

  const resolveUsageLabel = (item: Record<string, unknown>): string | null => {
    const usageCandidate = item.usageId ?? item.usage_id ?? item.usage ?? item.journeyId ?? item.journey_id;
    if (typeof usageCandidate === 'number') {
      const mapped = MarketManager.getUsageLabel(usageCandidate);
      return typeof mapped === 'string' && mapped.trim().length > 0 ? mapped : String(usageCandidate);
    }
    if (typeof usageCandidate === 'string' && usageCandidate.trim()) {
      const mapped = MarketManager.getUsageLabel(usageCandidate);
      return typeof mapped === 'string' && mapped.trim().length > 0 ? mapped : usageCandidate.trim();
    }
    return null;
  };

  const resolveMediaLabels = (item: Record<string, unknown>): string[] => {
    const mediaCandidates = toArrayValues(item.mediaIds ?? item.media_ids);
    const mediaValues = mediaCandidates.length > 0 ? mediaCandidates : toArrayValues(item.media);
    return mediaValues
      .map((entry) => MarketManager.getMediaLabel(entry))
      .filter((label): label is string => !!label && label.trim().length > 0);
  };

  const resolveCountryLabels = (item: Record<string, unknown>): string[] => {
    const countryIdCandidates = toArrayValues(item.countryIds ?? item.country_ids ?? item.countryId ?? item.country_id);
    const countryValues = countryIdCandidates.length > 0 ? countryIdCandidates : toArrayValues(item.country);
    return countryValues
      .map((entry) => MarketManager.getCountryLabel(entry))
      .filter((label): label is string => !!label && label.trim().length > 0);
  };

  const resolveCountDetails = (
    value: unknown,
    labelResolver: (key: string | number) => string,
    suffix = ''
  ): string[] => {
    if (value === null || value === undefined || value === '') return [];

    if (typeof value === 'number' || typeof value === 'string') {
      const numericValue = toNumberOrNull(value);
      return numericValue !== null ? [`${numericValue}${suffix}`] : [];
    }

    if (typeof value !== 'object' || Array.isArray(value)) return [];

    return Object.entries(value as Record<string, unknown>)
      .map(([rawKey, rawValue]) => {
        const numericValue = toNumberOrNull(rawValue);
        if (numericValue === null) return '';
        const asNumber = toNumberOrNull(rawKey);
        const resolvedLabel = labelResolver(asNumber ?? rawKey);
        return `${resolvedLabel || rawKey}: ${numericValue}${suffix}`;
      })
      .filter(Boolean);
  };

  const resolveDeliveryLabel = (item: Record<string, unknown>): string | null => {
    const actor = item.actor as Record<string, unknown> | null;
    if (!actor) return null;

    const actorDeliveryText = [actor.delivery_time, actor.deliveryTime].find(
      (entry) => typeof entry === 'string' && entry.trim().length > 0
    );
    if (typeof actorDeliveryText === 'string') return actorDeliveryText.trim();

    const minDays = toNumberOrNull(actor.delivery_days_min);
    const maxDays = toNumberOrNull(actor.delivery_days_max);
    if (minDays === null && maxDays === null) return null;

    const delivery = calculateDeliveryDate({
      delivery_days_min: minDays ?? maxDays ?? 1,
      delivery_days_max: maxDays ?? minDays ?? 1,
      cutoff_time: (typeof actor.cutoff_time === 'string' && actor.cutoff_time.trim()) ? actor.cutoff_time : '18:00',
      availability: Array.isArray(actor.availability) ? actor.availability : [],
      holidayFrom: typeof actor.holiday_from === 'string' ? actor.holiday_from : null,
      holidayTill: typeof actor.holiday_till === 'string' ? actor.holiday_till : null,
      delivery_config: (actor.delivery_config as any) || undefined
    });

    return delivery.formatted;
  };

  const resolveWorkshopParticipantRows = (item: Record<string, unknown>): Array<{ label: string; value: string; icon: 'user' | 'mail' }> => {
    const participant = (item.participant_info || item.participantInfo) as Record<string, unknown> | undefined;
    if (!participant || typeof participant !== 'object') return [];

    const fullName = [
      participant.first_name,
      participant.firstName,
      participant.last_name,
      participant.lastName
    ]
      .filter((part): part is string => typeof part === 'string' && part.trim().length > 0)
      .join(' ')
      .trim();

    const email = [participant.email, participant.email_address]
      .find((entry) => typeof entry === 'string' && entry.trim().length > 0);
    const profession = [participant.profession, participant.job]
      .find((entry) => typeof entry === 'string' && entry.trim().length > 0);
    const age = toNumberOrNull(participant.age);

    const rows: Array<{ label: string; value: string; icon: 'user' | 'mail' }> = [];

    if (fullName) rows.push({ label: t('cart.workshop.participant', 'Deelnemer'), value: fullName, icon: 'user' });
    if (typeof email === 'string') rows.push({ label: t('common.email', 'E-mail'), value: email, icon: 'mail' });
    if (typeof profession === 'string') rows.push({ label: t('cart.workshop.profession', 'Beroep'), value: profession, icon: 'user' });
    if (age !== null) rows.push({ label: t('cart.workshop.age', 'Leeftijd'), value: `${age}`, icon: 'user' });

    return rows;
  };

  const selectedWorkshopLocation =
    selectedItem?.type === 'workshop_edition'
      ? formatWorkshopLocationLabel(selectedItem as Record<string, unknown>)
      : null;
  const selectedUsageLabel =
    selectedItem
      ? (selectedItem.type === 'workshop_edition'
          ? (typeof selectedItem.type === 'string' && selectedItem.type.trim().length > 0 ? selectedItem.type : null)
          : resolveUsageLabel(selectedItem as Record<string, unknown>))
      : null;
  const selectedMediaLabels =
    selectedItem && selectedItem.type !== 'workshop_edition'
      ? resolveMediaLabels(selectedItem as Record<string, unknown>)
      : [];
  const selectedCountryLabels =
    selectedItem && selectedItem.type !== 'workshop_edition'
      ? resolveCountryLabels(selectedItem as Record<string, unknown>)
      : [];

  if (!isHydrated) return null;

  return (
    <ContainerInstrument className={cn("space-y-6 w-full max-w-full", className)}>
      {(!onlyTotals) && (
        <ContainerInstrument className="space-y-4 w-full max-w-full">
          {/* Cart items list */}
          <ContainerInstrument className="space-y-4">
            {/* 🛡️ CHRIS-PROTOCOL: Defensive guard for items array (v2.15.065) */}
            {(state.items?.length || 0) > 0 && (state.items || []).map((itemObj, idx) => {
              const isWorkshopItem = itemObj.type === 'workshop_edition';
              const itemData = itemObj as Record<string, unknown>;
              const itemImage = isWorkshopItem
                ? resolveWorkshopImageSrc(itemObj)
                : (itemObj.actor?.photo_url || VOICES_CONFIG.assets.placeholders.voice);
              const itemTitle =
                itemObj.actor?.display_name ||
                itemObj.actor?.name ||
                itemObj.name ||
                itemObj.id ||
                null;
              const usageLabel = isWorkshopItem
                ? (typeof itemObj.type === 'string' && itemObj.type.trim().length > 0 ? itemObj.type : null)
                : resolveUsageLabel(itemData);
              const mediaLabels = isWorkshopItem ? [] : resolveMediaLabels(itemData);
              const countryLabels = isWorkshopItem ? [] : resolveCountryLabels(itemData);
              const spotsDetails = isWorkshopItem
                ? []
                : resolveCountDetails(itemData.spots, (key) => MarketManager.getMediaLabel(key) || String(key));
              const yearsDetails = isWorkshopItem
                ? []
                : resolveCountDetails(itemData.years, (key) => MarketManager.getMediaLabel(key) || String(key), ' jaar');
              const deliveryLabel = isWorkshopItem ? null : resolveDeliveryLabel(itemData);
              const workshopParticipantRows = isWorkshopItem ? resolveWorkshopParticipantRows(itemData) : [];
              const workshopLocationLabel = isWorkshopItem ? formatWorkshopLocationLabel(itemData) : null;

              return (
                <ContainerInstrument 
                  key={itemObj.id || idx} 
                  onClick={() => !isCartPage && setSelectedItem(itemObj)}
                  className={cn(
                    "flex items-start gap-6 p-8 bg-white rounded-[32px] border border-va-black/5 shadow-aura group relative transition-all",
                    !isCartPage && "cursor-pointer hover:border-primary/20 active:scale-[0.98]"
                  )}
                >
                  {/* Afbeelding links uitgelijnd (LAYA-MANDAAT) */}
                  <ContainerInstrument className="w-16 h-16 rounded-[20px] overflow-hidden bg-va-off-white relative border border-va-black/5 shrink-0 shadow-sm">
                    <Image  
                      src={itemImage} 
                      alt={itemTitle} 
                      fill 
                      sizes="64px"
                      className="object-cover" 
                    />
                  </ContainerInstrument>

                  {/* Uitleg, prijs en deleteknop rechts (LAYA-MANDAAT) */}
                  <ContainerInstrument className="flex flex-1 items-start justify-between gap-4 min-w-0">
                    <ContainerInstrument className="min-w-0 flex-1">
                      <HeadingInstrument level={4} className="font-light text-xl text-va-black truncate tracking-tight">
                        {itemTitle || t('common.not_available', 'Niet beschikbaar')}
                      </HeadingInstrument>
                      <ContainerInstrument className="mt-2 flex flex-wrap items-center gap-2 text-[11px] text-va-black/45">
                        {usageLabel && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-va-off-white border border-va-black/[0.04] font-medium text-va-black/65">
                            <RadioTower size={12} strokeWidth={1.8} />
                            {usageLabel}
                          </span>
                        )}

                        {isWorkshopItem ? (
                          <>
                            {itemObj.date && (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-va-off-white border border-va-black/[0.04]">
                                <CalendarDays size={12} strokeWidth={1.8} />
                                {itemObj.date}
                              </span>
                            )}
                            {workshopLocationLabel && (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-va-off-white border border-va-black/[0.04]">
                                <MapPin size={12} strokeWidth={1.8} />
                                {workshopLocationLabel}
                              </span>
                            )}
                          </>
                        ) : (
                          <>
                            {mediaLabels.length > 0 && (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-va-off-white border border-va-black/[0.04]">
                                <RadioTower size={12} strokeWidth={1.8} />
                                {mediaLabels.join(' • ')}
                              </span>
                            )}
                            {countryLabels.length > 0 && (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-va-off-white border border-va-black/[0.04]">
                                <MapPin size={12} strokeWidth={1.8} />
                                {countryLabels.join(', ')}
                              </span>
                            )}
                            {deliveryLabel && (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-green-500/5 border border-green-500/15 text-green-700/80">
                                <Clock3 size={12} strokeWidth={1.8} />
                                {deliveryLabel}
                              </span>
                            )}
                          </>
                        )}
                      </ContainerInstrument>

                      <div className="text-[13px] leading-relaxed text-va-black/40 font-light mt-1">
                        {isCartPage && (
                          <div className="mt-6 space-y-6">
                            {isWorkshopItem ? (
                              <div className="pt-4 border-t border-va-black/[0.03] space-y-3">
                                <LabelInstrument className="text-[10px] uppercase tracking-widest text-va-black/30 font-bold ml-0">
                                  <VoiceglotText translationKey="cart.workshop.details" defaultText="Workshop details" />
                                </LabelInstrument>
                                <div className="space-y-2.5 text-[13px] text-va-black/60">
                                  {itemObj.date && (
                                    <div className="space-y-0.5">
                                      <span className="text-[10px] uppercase tracking-widest text-va-black/35">Datum</span>
                                      <span className="block font-medium text-va-black/70">{itemObj.date}</span>
                                    </div>
                                  )}
                                  {workshopLocationLabel && (
                                    <div className="space-y-0.5">
                                      <span className="text-[10px] uppercase tracking-widest text-va-black/35">Locatie</span>
                                      <span className="block font-medium text-va-black/70">{workshopLocationLabel}</span>
                                    </div>
                                  )}
                                  {workshopParticipantRows.map((row, rowIndex) => (
                                    <div key={`${row.label}-${rowIndex}`} className="space-y-0.5">
                                      <span className="inline-flex items-center gap-1.5 text-[10px] uppercase tracking-widest text-va-black/35">
                                        {row.icon === 'mail' ? (
                                          <Mail size={12} strokeWidth={1.8} className="text-va-black/40" />
                                        ) : (
                                          <UserRound size={12} strokeWidth={1.8} className="text-va-black/40" />
                                        )}
                                        {row.label}
                                      </span>
                                      <span className="block font-medium text-va-black/70">{row.value}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            ) : (
                              <>
                                {/* Script Preview */}
                                {(itemObj.script || itemObj.briefing) && (
                                  <div className="space-y-2">
                                    <LabelInstrument className="text-[10px] uppercase tracking-widest text-va-black/30 font-bold ml-0">
                                      Ingevoerde tekst
                                    </LabelInstrument>
                                    <div className="p-6 bg-va-off-white/40 rounded-[24px] border border-va-black/[0.03] italic text-va-black/80 relative group/script-preview text-[15px] leading-relaxed">
                                      <div className="absolute -top-2 -left-2 bg-white rounded-full p-1.5 shadow-sm border border-va-black/5">
                                        <FileText size={12} className="text-primary" />
                                      </div>
                                      &quot;{itemObj.script || itemObj.briefing}&quot;
                                    </div>
                                  </div>
                                )}
                                
                                <div className="pt-4 border-t border-va-black/[0.03] space-y-3">
                                  <LabelInstrument className="text-[10px] uppercase tracking-widest text-va-black/30 font-bold ml-0">
                                    <VoiceglotText translationKey="cart.usage_and_rights.label" defaultText="Gebruik & rechten" />
                                  </LabelInstrument>
                                  <div className="space-y-3 text-[13px] text-va-black/60">
                                    {usageLabel && (
                                      <div className="space-y-0.5">
                                        <span className="inline-flex items-center gap-1.5 text-[10px] uppercase tracking-widest text-va-black/35">
                                          <RadioTower size={12} strokeWidth={1.8} className="text-va-black/40" />
                                          <VoiceglotText translationKey="cart.usage.label" defaultText="Gebruikstype" />
                                        </span>
                                        <span className="block font-medium text-va-black/70">{usageLabel}</span>
                                      </div>
                                    )}
                                    {mediaLabels.length > 0 && (
                                      <div className="space-y-0.5">
                                        <span className="inline-flex items-center gap-1.5 text-[10px] uppercase tracking-widest text-va-black/35">
                                          <RadioTower size={12} strokeWidth={1.8} className="text-va-black/40" />
                                          <VoiceglotText translationKey="cart.media.label" defaultText="Mediatype(s)" />
                                        </span>
                                        <span className="block font-medium text-va-black/70">{mediaLabels.join(' • ')}</span>
                                      </div>
                                    )}
                                    {countryLabels.length > 0 && (
                                      <div className="space-y-0.5">
                                        <span className="inline-flex items-center gap-1.5 text-[10px] uppercase tracking-widest text-va-black/35">
                                          <MapPin size={12} strokeWidth={1.8} className="text-va-black/40" />
                                          <VoiceglotText translationKey="cart.broadcast_area.label" defaultText="Uitzendgebied" />
                                        </span>
                                        <span className="block font-medium text-va-black/70">{countryLabels.join(', ')}</span>
                                      </div>
                                    )}
                                    {spotsDetails.length > 0 && (
                                      <div className="space-y-0.5">
                                        <span className="inline-flex items-center gap-1.5 text-[10px] uppercase tracking-widest text-va-black/35">
                                          <Target size={12} strokeWidth={1.8} className="text-va-black/40" />
                                          <VoiceglotText translationKey="cart.spots.label" defaultText="Aantal spots" />
                                        </span>
                                        <span className="block font-medium text-va-black/70">{spotsDetails.join(' • ')}</span>
                                      </div>
                                    )}
                                    {yearsDetails.length > 0 && (
                                      <div className="space-y-0.5">
                                        <span className="inline-flex items-center gap-1.5 text-[10px] uppercase tracking-widest text-va-black/35">
                                          <CalendarDays size={12} strokeWidth={1.8} className="text-va-black/40" />
                                          <VoiceglotText translationKey="cart.license_years.label" defaultText="Looptijd licentie" />
                                        </span>
                                        <span className="block font-medium text-va-black/70">{yearsDetails.join(' • ')}</span>
                                      </div>
                                    )}
                                  </div>
                                </div>

                                {/* Delivery & Pricing */}
                                <div className="space-y-5 pt-4 border-t border-va-black/[0.03]">
                                  {/* Delivery Date */}
                                  {deliveryLabel && (
                                    <div className="space-y-2">
                                      <LabelInstrument className="text-[10px] uppercase tracking-widest text-va-black/30 font-bold ml-0">
                                        Levering
                                      </LabelInstrument>
                                      <div className="inline-flex items-center gap-2 px-3 py-2 bg-green-500/5 border border-green-500/10 rounded-xl w-fit">
                                        <Clock3 size={13} strokeWidth={1.8} className="text-green-600/80" />
                                        <span className="text-[12px] font-bold text-green-600/80 uppercase tracking-wider">
                                          {deliveryLabel}
                                        </span>
                                      </div>
                                    </div>
                                  )}

                                  {/* Price Breakdown */}
                                  {itemObj.pricing && (
                                    <div className="space-y-3">
                                      <LabelInstrument className="text-[10px] uppercase tracking-widest text-va-black/30 font-bold ml-0">
                                        Prijsopbouw (excl. BTW)
                                      </LabelInstrument>
                                      <div className="space-y-2">
                                        {toNumberOrNull(itemObj.pricing.base) !== null && (
                                          <div className="space-y-0.5 text-[13px] text-va-black/60">
                                            <span className="text-[10px] uppercase tracking-widest text-va-black/35">Basistarief</span>
                                            <span className="block font-medium text-va-black/70">€ {toNumberOrNull(itemObj.pricing.base)!.toFixed(2)}</span>
                                          </div>
                                        )}
                                        {(itemObj.pricing.wordSurcharge ?? 0) > 0 && (
                                          <div className="space-y-0.5 text-[13px] text-va-black/60">
                                            <span className="text-[10px] uppercase tracking-widest text-va-black/35">Extra woorden/verwerking</span>
                                            <span className="block font-medium text-va-black/70">+ € {(itemObj.pricing.wordSurcharge ?? 0).toFixed(2)}</span>
                                          </div>
                                        )}
                                        {(itemObj.pricing.mediaSurcharge ?? 0) > 0 && (
                                          <div className="space-y-0.5 text-[13px] text-va-black/60">
                                            <span className="text-[10px] uppercase tracking-widest text-va-black/35">Licenties & Buyouts</span>
                                            <span className="block font-medium text-va-black/70">+ € {(itemObj.pricing.mediaSurcharge ?? 0).toFixed(2)}</span>
                                          </div>
                                        )}
                                        {(itemObj.pricing.musicSurcharge ?? 0) > 0 && (
                                          <div className="space-y-0.5 text-[13px] text-va-black/60">
                                            <span className="text-[10px] uppercase tracking-widest text-va-black/35">Muziek & Mixage</span>
                                            <span className="block font-medium text-va-black/70">+ € {(itemObj.pricing.musicSurcharge ?? 0).toFixed(2)}</span>
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </>
                            )}
                          </div>
                        )}
                      </div>
                    </ContainerInstrument>

                    <ContainerInstrument className="flex flex-col items-end gap-3 shrink-0 self-start">
                      <div className="flex flex-col items-end min-w-[120px]">
                        {activeCoupon && (
                          <TextInstrument className="text-[12px] text-va-black/20 line-through font-light">
                            {toNumberOrNull(itemObj.pricing?.subtotal ?? itemObj.pricing?.total ?? itemObj.price) !== null
                              ? `€${toNumberOrNull(itemObj.pricing?.subtotal ?? itemObj.pricing?.total ?? itemObj.price)!.toFixed(2)}`
                              : t('common.not_available', 'Niet beschikbaar')}
                          </TextInstrument>
                        )}
                        <TextInstrument className={cn(
                          "font-light text-2xl tracking-tight",
                          "text-va-black"
                        )}>
                          {toNumberOrNull(itemObj.pricing?.subtotal ?? itemObj.pricing?.total ?? itemObj.price) !== null
                            ? `€${toNumberOrNull(itemObj.pricing?.subtotal ?? itemObj.pricing?.total ?? itemObj.price)!.toFixed(2)}`
                            : t('common.not_available', 'Niet beschikbaar')}
                        </TextInstrument>
                        <TextInstrument className="text-[10px] text-va-black/20 font-light uppercase tracking-widest mt-0.5">
                          Excl. BTW
                        </TextInstrument>
                      </div>
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            if (!isCartPage) {
                              window.location.href = isStudioJourney ? studioCartPath : defaultCartPath;
                            } else {
                              restoreItem(itemObj);
                              updateStep('script');
                            }
                          }}
                          className="w-10 h-10 rounded-full bg-va-off-white flex items-center justify-center text-va-black/20 hover:text-primary hover:bg-primary/5 transition-all group/edit"
                          title={isCartPage ? t('action.edit_item', "Bewerk item") : t('action.view_details', "Bekijk details")}
                        >
                          {isCartPage ? <Edit2 size={18} strokeWidth={1.5} className="group-hover/edit:scale-110 transition-transform" /> : <Eye size={18} strokeWidth={1.5} className="group-hover/edit:scale-110 transition-transform" />}
                        </button>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            removeItem(itemObj.id);
                          }}
                          className="w-10 h-10 rounded-full bg-va-off-white flex items-center justify-center text-va-black/20 hover:text-red-500 hover:bg-red-50 transition-all group/delete"
                          title={t('action.remove_item', "Verwijder item")}
                        >
                          <Trash2 size={18} strokeWidth={1.5} className="group-hover/delete:scale-110 transition-transform" />
                        </button>
                      </div>
                    </ContainerInstrument>
                  </ContainerInstrument>
                </ContainerInstrument>
              );
            })}
          </ContainerInstrument>
        </ContainerInstrument>
      )}

      {(!onlyItems && (isCheckoutPage || !!onlyTotals)) && (
        <ContainerInstrument className={cn(
          "space-y-6",
          !onlyTotals && "block"
        )}>
          <TotalsSection 
            subtotal={subtotal}
            discountAmount={discountAmount}
            subtotalAfterDiscount={subtotalAfterDiscount}
            tax={tax}
            total={total}
            isVatExempt={isVatExempt}
            couponCode={couponCode}
            setCouponCode={setCouponCode}
            applyCoupon={applyCoupon}
            isApplyingCoupon={isApplyingCoupon}
            couponError={couponError}
            activeCoupon={activeCoupon}
            showCoupon={false}
          />
          {((!onlyTotals || !!showCtaWhenOnlyTotals) && isCheckoutPage) && (
            <CTASection 
              handleSubmit={handleSubmit}
              setIsPreviewOpen={setIsPreviewOpen}
              setIsTermsOpen={setIsTermsOpen}
              reviewStats={reviewStats}
            />
          )}
        </ContainerInstrument>
      )}

      {/* ITEM DETAIL MODAL */}
      <AnimatePresence>
        {selectedItem && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[10000] flex items-center justify-center p-6 bg-va-black/95 backdrop-blur-xl"
          >
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-xl bg-white rounded-[32px] shadow-aura overflow-hidden max-h-[90vh] flex flex-col z-[10001]"
            >
              <div className="p-10 flex-1 overflow-y-auto custom-scrollbar space-y-10">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-6">
                    <div className="w-24 h-24 rounded-[32px] overflow-hidden border border-va-black/5 shadow-md shrink-0 relative bg-va-off-white">
                      <Image 
                        src={selectedItem.type === 'workshop_edition' ? resolveWorkshopImageSrc(selectedItem) : (selectedItem.actor?.photo_url || VOICES_CONFIG.assets.placeholders.voice)} 
                        alt={selectedItem.actor?.display_name || selectedItem.name || 'Item'} 
                        fill
                        sizes="96px"
                        className="object-cover"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <HeadingInstrument level={3} className="text-4xl font-light tracking-tighter text-va-black">
                        {selectedItem.actor?.display_name || selectedItem.name}
                      </HeadingInstrument>
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] font-bold tracking-[0.1em] uppercase text-va-black/40">
                        {selectedUsageLabel && <span>{selectedUsageLabel}</span>}
                        {selectedItem.type === 'workshop_edition' ? (
                          <>
                            {selectedItem.date && (
                              <>
                                <span className="w-1 h-1 rounded-full bg-va-black/10" />
                                <span>{selectedItem.date}</span>
                              </>
                            )}
                            {selectedWorkshopLocation && (
                              <>
                                <span className="w-1 h-1 rounded-full bg-va-black/10" />
                                <span>{selectedWorkshopLocation}</span>
                              </>
                            )}
                          </>
                        ) : selectedItem.usage === 'telefonie' ? (
                          <>
                            <span className="w-1 h-1 rounded-full bg-va-black/10" />
                            <span><VoiceglotText translationKey="common.unlimited_usage" defaultText="Onbeperkt gebruik" /></span>
                          </>
                        ) : (
                          <>
                            {selectedMediaLabels.length > 0 && (
                              <>
                                <span className="w-1 h-1 rounded-full bg-va-black/10" />
                                <span>{selectedMediaLabels.join(', ')}</span>
                              </>
                            )}
                            {selectedCountryLabels.length > 0 && (
                              <>
                                <span className="w-1 h-1 rounded-full bg-va-black/10" />
                                <span>{selectedCountryLabels.join(', ')}</span>
                              </>
                            )}
                          </>
                        )}
                        <span className="w-1 h-1 rounded-full bg-va-black/10" />
                        <span className="text-va-black">
                          {toNumberOrNull(selectedItem.pricing?.subtotal ?? selectedItem.pricing?.total ?? selectedItem.price) !== null
                            ? `€ ${toNumberOrNull(selectedItem.pricing?.subtotal ?? selectedItem.pricing?.total ?? selectedItem.price)!.toFixed(2)}`
                            : t('common.not_available', 'Niet beschikbaar')}
                        </span>
                      </div>
                    </div>
                  </div>
                  <button 
                    onClick={() => setSelectedItem(null)}
                    className="w-12 h-12 rounded-full bg-va-off-white flex items-center justify-center text-va-black/20 hover:text-va-black hover:bg-va-black/5 transition-all shrink-0 group"
                  >
                    <X size={24} className="group-hover:rotate-90 transition-transform duration-300" />
                  </button>
                </div>

                <div className="space-y-8">
                  <div className="space-y-3">
                    <LabelInstrument className="text-[11px] uppercase tracking-[0.1em] text-va-black/40 font-bold ml-0">
                      <VoiceglotText translationKey="checkout.your_text" defaultText="Jouw Tekst" />
                    </LabelInstrument>
                    <div className="bg-va-off-white/40 p-8 rounded-[32px] border border-black/[0.02] max-h-[300px] overflow-y-auto custom-scrollbar relative group/script">
                      <p className="text-[16px] font-light leading-relaxed text-va-black italic whitespace-pre-wrap">
                        &quot;{selectedItem.script || selectedItem.briefing || t('common.no_text_entered', 'Nog geen tekst ingevoerd')}&quot;
                      </p>
                      <div className="absolute top-4 right-4 opacity-0 group-hover/script:opacity-100 transition-opacity">
                        <Edit2 size={14} className="text-va-black/10" />
                      </div>
                    </div>
                  </div>

                  {selectedItem.pricing && (
                    <div className="pt-8 border-t border-va-black/5 space-y-4">
                      <LabelInstrument className="text-[11px] uppercase tracking-[0.1em] text-va-black/40 font-bold ml-0">
                        <VoiceglotText translationKey="pricing.breakdown_excl_vat" defaultText="Prijsopbouw (excl. BTW)" />
                      </LabelInstrument>
                      <div className="space-y-3">
                        {toNumberOrNull(selectedItem.pricing.base) !== null && (
                          <div className="flex justify-between text-[15px]">
                            <span className="text-va-black/60 font-light">
                              {selectedItem.usage === 'telefonie' ? t('pricing.base_telephony', 'Basistarief (Telefoon)') : t('pricing.base', 'Basistarief')}
                            </span>
                            <span className="font-medium text-va-black">€ {toNumberOrNull(selectedItem.pricing.base)!.toFixed(2)}</span>
                          </div>
                        )}
                        {(selectedItem.pricing.wordSurcharge ?? 0) > 0 && (
                          <div className="flex justify-between text-[15px]">
                            <span className="text-va-black/60 font-light">
                              {selectedItem.usage === 'telefonie' ? t('pricing.production_fee', 'Productie & Verwerking') : t('pricing.extra_words_prompts', 'Extra woorden/prompts')}
                            </span>
                            <span className="font-medium text-va-black">+ € {(selectedItem.pricing.wordSurcharge ?? 0).toFixed(2)}</span>
                          </div>
                        )}
                        {(selectedItem.pricing.mediaSurcharge ?? 0) > 0 && (
                          <div className="flex justify-between text-[15px]">
                            <span className="text-va-black/60 font-light">
                              <VoiceglotText translationKey="pricing.buyouts_licenses" defaultText="Buyouts & Licenties" />
                            </span>
                            <span className="font-medium text-va-black">+ € {(selectedItem.pricing.mediaSurcharge ?? 0).toFixed(2)}</span>
                          </div>
                        )}
                        {(selectedItem.pricing.musicSurcharge ?? 0) > 0 && (
                          <div className="flex justify-between text-[15px]">
                            <span className="text-va-black/60 font-light">
                              <VoiceglotText translationKey="pricing.music_mix" defaultText="Muziek & Mixage" />
                            </span>
                            <span className="font-medium text-va-black">+ € {(selectedItem.pricing.musicSurcharge ?? 0).toFixed(2)}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="p-10 bg-va-off-white/30 border-t border-va-black/[0.03] flex gap-4">
                <button 
                  onClick={() => {
                    restoreItem(selectedItem);
                    updateStep('script');
                    setSelectedItem(null);
                  }}
                  className="flex-1 py-6 bg-va-black text-white rounded-[24px] font-bold tracking-[0.2em] text-[13px] flex items-center justify-center gap-3 hover:bg-primary transition-all active:scale-[0.98] shadow-aura-lg group"
                >
                  <Edit2 size={18} className="group-hover:scale-110 transition-transform" />
                  <VoiceglotText translationKey="checkout.edit_this_voice" defaultText="Deze stem bewerken" />
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <EmailPreviewModal strokeWidth={1.5} 
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        onSend={(msg) => handleSubmit(msg)}
        customerName={`${state.customer.first_name} ${state.customer.last_name}`}
        totalAmount={String(total || '0')}
        items={state.items || []}
      />

      <TermsModal 
        isOpen={isTermsOpen}
        onClose={() => setIsTermsOpen(false)}
      />
    </ContainerInstrument>
  );
};

// Helper components to avoid duplication
const TotalsSection: React.FC<any> = ({ 
  subtotal, discountAmount, subtotalAfterDiscount, tax, total, isVatExempt,
  couponCode, setCouponCode, applyCoupon, isApplyingCoupon, couponError, activeCoupon, showCoupon = true
}) => {
  const { t } = useTranslation();
  const { playClick } = useSonicDNA();
  
  return (
    <ContainerInstrument className="space-y-3 pt-6 border-t border-va-black/5">
      {showCoupon && (
        <div className="pb-4">
          {!activeCoupon ? (
            <div className="flex gap-2">
              <div className="relative flex-1">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-va-black/20">
                  <Tag size={14} strokeWidth={1.5} />
                </div>
                <InputInstrument
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                  placeholder={t('checkout.coupon.placeholder', "Kortingscode")}
                  className="w-full !pl-10 !py-2 !text-[13px] !rounded-[12px] bg-va-off-white/50 border-transparent focus:bg-white transition-all"
                />
              </div>
              <ButtonInstrument
                type="button"
                onClick={applyCoupon}
                disabled={!couponCode || isApplyingCoupon}
                className="px-4 bg-va-black text-white rounded-[12px] text-[11px] font-bold tracking-widest hover:bg-primary transition-all disabled:opacity-30"
              >
                {isApplyingCoupon ? <Loader2 size={14} className="animate-spin" /> : <VoiceglotText translationKey="common.apply" defaultText="Toepassen" />}
              </ButtonInstrument>
            </div>
          ) : (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-3 bg-green-500/5 border border-green-500/20 rounded-[12px] flex items-center justify-between group"
            >
              <div className="flex items-center gap-3">
                <div className="w-7 h-7 bg-green-500 rounded-lg flex items-center justify-center text-white shadow-sm">
                  <Tag size={14} strokeWidth={2} />
                </div>
                <div>
                  <TextInstrument className="text-[12px] font-bold text-green-600 tracking-wider">
                    {activeCoupon.code}
                  </TextInstrument>
                  <TextInstrument className="text-[10px] text-green-600/60 font-light">
                    {activeCoupon.type === 'percentage' ? `${activeCoupon.discount}% ${t('common.discount', 'korting')}` : `€${activeCoupon.discount} ${t('common.discount', 'korting')}`}
                  </TextInstrument>
                </div>
              </div>
              <button 
                onClick={() => {
                  setCouponCode('');
                  playClick('soft');
                }}
                className="p-1.5 text-green-600/20 hover:text-red-500 transition-colors group/delete"
                title={t('action.remove_coupon', "Verwijder kortingscode")}
              >
                <Trash2 size={14} strokeWidth={1.5} className="group-hover/delete:scale-110 transition-transform" />
              </button>
            </motion.div>
          )}
          {couponError && (
            <motion.p 
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-[10px] text-red-500 font-medium mt-2 ml-3 flex items-center gap-1"
            >
              <AlertCircle size={10} /> {couponError}
            </motion.p>
          )}
        </div>
      )}

      <ContainerInstrument className="flex justify-between text-[15px]">
        <TextInstrument className="text-va-black/40 font-light tracking-widest text-[15px] ">
          <VoiceglotText  translationKey="common.subtotal" defaultText="Subtotaal" />
        </TextInstrument>
        <TextInstrument className="font-light text-va-black">€ {subtotal.toFixed(2)}</TextInstrument>
      </ContainerInstrument>

      {activeCoupon && (
        <>
          <motion.div 
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex justify-between items-center text-[15px] text-green-600"
          >
            <div className="flex items-center gap-2">
              <Tag size={14} strokeWidth={2} />
              <TextInstrument className="font-light tracking-widest">
                <VoiceglotText 
                  translationKey="checkout.discount_label_v2" 
                  defaultText="Korting ({code})" 
                  values={{ code: activeCoupon.code }}
                />
              </TextInstrument>
            </div>
            <TextInstrument className="font-medium">- € {discountAmount.toFixed(2)}</TextInstrument>
          </motion.div>
          <div className="flex justify-between items-center text-[13px] pb-1">
            <TextInstrument className="font-light text-va-black/20 tracking-widest">
              <VoiceglotText translationKey="checkout.summary.subtotal_after_discount" defaultText="Subtotaal na korting" />
            </TextInstrument>
            <TextInstrument className="font-medium text-va-black/40">€ {subtotalAfterDiscount.toFixed(2)}</TextInstrument>
          </div>
        </>
      )}

      <ContainerInstrument className="flex justify-between text-[15px]">
        <TextInstrument className="text-va-black/40 font-light tracking-widest text-[15px] ">
          <VoiceglotText translationKey={isVatExempt ? "common.vat_exempt" : "checkout.summary.vat_label"} defaultText={isVatExempt ? "BTW (vrijgesteld)" : "BTW (21%)"} />
        </TextInstrument>
        <TextInstrument className="font-light text-va-black">€ {tax.toFixed(2)}</TextInstrument>
      </ContainerInstrument>
      <ContainerInstrument className="pt-4 border-t border-va-black/5 flex justify-between items-center">
        <TextInstrument className="text-[15px] font-light tracking-widest text-va-black ">
          <VoiceglotText  translationKey="checkout.summary.total_label" defaultText="Totaal (incl. BTW)" />
        </TextInstrument>
        <motion.span 
          key={total}
          initial={{ scale: 1.1 }}
          animate={{ scale: 1 }}
          className="text-3xl font-light text-va-black"
        >
          € {total.toFixed(2)}
        </motion.span>
      </ContainerInstrument>
    </ContainerInstrument>
  );
};

const CTASection: React.FC<any> = ({ handleSubmit, setIsPreviewOpen, setIsTermsOpen, reviewStats }) => {
  const { t } = useTranslation();
  const { state, updateAgreedToTerms } = useCheckout();
  const { playClick } = useSonicDNA();

  return (
    <ContainerInstrument className="space-y-6">
      {/* Place Order Button */}
      <ContainerInstrument className="pt-4 space-y-6">
        <LabelInstrument className="flex items-start gap-4 cursor-pointer group">
          <div className="pt-1">
            <div className={cn(
              "w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all duration-300",
              state.agreedToTerms 
                ? "bg-green-500 border-green-500 shadow-sm" 
                : "bg-white border-va-black/10 group-hover:border-primary/30"
            )}>
              <input 
                type="checkbox" 
                checked={state.agreedToTerms}
                onChange={(e) => {
                  playClick(e.target.checked ? 'pro' : 'light');
                  updateAgreedToTerms(e.target.checked);
                }}
                className="absolute opacity-0 w-6 h-6 cursor-pointer"
              />
              {state.agreedToTerms && <CheckCircle2 size={14} strokeWidth={3} className="text-white" />}
            </div>
          </div>
          <TextInstrument className="text-[14px] text-va-black/40 font-light leading-relaxed group-hover:text-va-black transition-colors">
            <VoiceglotText  
              translationKey="checkout.terms_agreement_checkbox" 
              defaultText="Ik ga akkoord met de" 
            />
            {' '}
            <button 
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                playClick('soft');
                setIsTermsOpen(true);
              }}
              className="text-va-black/60 font-medium hover:text-va-black hover:underline decoration-va-black/30 underline-offset-4 transition-colors"
            >
              algemene voorwaarden
            </button>
            .
          </TextInstrument>
        </LabelInstrument>

        <ButtonInstrument 
          onClick={() => state.isQuoteRequest ? setIsPreviewOpen(true) : handleSubmit()}
          disabled={state.isSubmitting || !state.agreedToTerms}
          className={cn(
            "w-full va-btn-pro !py-8 text-lg !rounded-[24px] !bg-va-black !text-white flex items-center justify-center gap-3 group transition-all duration-500 cursor-pointer",
            (state.isSubmitting || !state.agreedToTerms) ? 'opacity-30 grayscale cursor-not-allowed' : 'hover:shadow-aura-lg hover:scale-[1.01] active:scale-[0.98]'
          )}
        >
          {state.isSubmitting ? (
            <><Loader2 className="animate-spin" size={24} strokeWidth={1.5} /> <VoiceglotText  translationKey="common.processing" defaultText="Verwerken..." /></>
          ) : state.isQuoteRequest ? (
            <><VoiceglotText  translationKey="checkout.cta.quote" defaultText="Preview offerte e-mail" /> <ArrowRight size={20} strokeWidth={1.5} className="group-hover:translate-x-1 transition-transform" /></>
          ) : state.paymentMethod === 'banktransfer' ? (
            <>
              <Lock size={20} strokeWidth={1.5} className="text-white/40" />
              <TextInstrument className="font-bold tracking-widest text-[13px]">
                <VoiceglotText translationKey="checkout.cta.banktransfer" defaultText="Bestelling plaatsen" />
              </TextInstrument>
              <ArrowRight size={20} strokeWidth={1.5} className="group-hover:translate-x-1 transition-transform" />
            </>
          ) : (
            <>
              <Lock size={20} strokeWidth={1.5} className="text-white/40" />
              <TextInstrument className="font-bold tracking-widest text-[13px]">
                <VoiceglotText translationKey="checkout.cta.place_order" defaultText="Bestelling plaatsen" />
              </TextInstrument>
              <ArrowRight size={20} strokeWidth={1.5} className="group-hover:translate-x-1 transition-transform" />
            </>
          )}
        </ButtonInstrument>
      </ContainerInstrument>

      {/* Trust & Security Section */}
      <ContainerInstrument className="pt-2 space-y-4">
        <ContainerInstrument className="flex flex-col items-center gap-3 text-center">
          <TextInstrument className="text-[11px] font-bold tracking-[0.2em] uppercase text-va-black/45">
            <VoiceglotText translationKey="checkout.trust.heading" defaultText="Bedankt voor het vertrouwen" />
          </TextInstrument>

          {reviewStats && (
            <ContainerInstrument className="flex items-center gap-2 text-green-600/60">
              <ContainerInstrument className="flex -space-x-0.5">
                {[1,2,3,4,5].map(i => (
                  <svg key={i} className="w-3 h-3 fill-current" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </ContainerInstrument>
              <TextInstrument className="text-[11px] font-bold tracking-[0.2em] uppercase">
                <VoiceglotText translationKey="checkout.trust.rating_line" defaultText={`${reviewStats.averageRating}/5 sterren op ${reviewStats.totalCount} reviews`} />
              </TextInstrument>
            </ContainerInstrument>
          )}

          <ContainerInstrument className="flex items-center gap-2">
            <ContainerInstrument
              title="Google"
              className="w-8 h-8 rounded-full bg-[#4285F4]/10 border border-[#4285F4]/20 flex items-center justify-center"
            >
              <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 text-[#4285F4] fill-current">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.16H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.84l3.66-2.75z" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.16l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
            </ContainerInstrument>
            <ContainerInstrument
              title="Facebook"
              className="w-8 h-8 rounded-full bg-[#1877F2]/10 border border-[#1877F2]/20 flex items-center justify-center"
            >
              <TextInstrument className="text-[12px] font-bold text-[#1877F2] leading-none">f</TextInstrument>
            </ContainerInstrument>
            <ContainerInstrument
              title="Instagram"
              className="w-8 h-8 rounded-full bg-[#E1306C]/10 border border-[#E1306C]/20 flex items-center justify-center"
            >
              <Instagram size={12} className="text-[#E1306C]" strokeWidth={2} />
            </ContainerInstrument>
          </ContainerInstrument>
          
          <ContainerInstrument className="flex items-center gap-2 text-va-black/20">
            <Lock size={12} strokeWidth={2} />
            <TextInstrument className="text-[11px] font-bold tracking-[0.2em] uppercase">
              <VoiceglotText translationKey="checkout.secure_dutch" defaultText="Veilig afrekenen" />
            </TextInstrument>
          </ContainerInstrument>
        </ContainerInstrument>
      </ContainerInstrument>
    </ContainerInstrument>
  );
};
