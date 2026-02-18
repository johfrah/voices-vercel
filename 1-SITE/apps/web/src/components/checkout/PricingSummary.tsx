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
import { useSonicDNA } from '@/lib/sonic-dna';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, Loader2, Trash2, Edit2, X, ChevronRight, Info, Star, CreditCard, FileText, Tag, Eye, Lock, AlertCircle, Send, ArrowRight, Check } from 'lucide-react';
import Image from 'next/image';
import React, { useEffect, useState } from 'react';
import { EmailPreviewModal } from './EmailPreviewModal';
import { TermsModal } from './TermsModal';

export const PricingSummary: React.FC<{ 
  onlyItems?: boolean; 
  onlyTotals?: boolean;
  className?: string;
}> = ({ onlyItems, onlyTotals, className }) => {
  const { state, removeItem, restoreItem, isVatExempt, updateCustomer, updateIsSubmitting, updateAgreedToTerms } = useCheckout();
  const { updateStep } = useMasterControl();
  const { playClick } = useSonicDNA();
  const [selectedItem, setSelectedItem] = useState<any>(null);

  const [couponCode, setCouponCode] = useState('');
  const [isApplyingCoupon, setIsCouponApplying] = useState(false);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isTermsOpen, setIsTermsOpen] = useState(false);

  const applyCoupon = async () => {
    if (!couponCode) return;
    setIsCouponApplying(true);
    setCouponError(null);
    playClick('light');

    try {
      // TODO: Implement real coupon validation API
      // For now, we simulate a successful validation for 'VOICES2026'
      if (couponCode.toUpperCase() === 'VOICES2026') {
        updateCustomer({ active_coupon: { code: 'VOICES2026', discount: 10, type: 'percentage' } });
        playClick('success');
      } else {
        setCouponError('Ongeldige kortingscode');
        playClick('error');
      }
    } catch (e) {
      setCouponError('Fout bij valideren');
    } finally {
      setIsCouponApplying(false);
    }
  };

  const handleSubmit = async (quoteMessage?: string) => {
    if (state.isSubmitting) return;
    
    playClick('deep');
    updateIsSubmitting(true);

    try {
      const res = await fetch('/api/checkout/mollie', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...state,
          ...state.customer,
          pricing: {
            ...state.pricing,
            total: subtotal // Send the correctly calculated grand total (excl VAT)
          },
          quoteMessage,
          payment_method: state.paymentMethod,
          country: state.customer.country || 'BE',
          music: state.music,
          metadata: {
            ...state.metadata,
            words: state.briefing.trim().split(/\s+/).filter(Boolean).length,
            prompts: state.prompts
          }
        }),
      });

      const data = await res.json();

      if (data.success) {
        if (state.isQuoteRequest || data.isBankTransfer || !data.checkoutUrl) {
          // CHRIS-PROTOCOL: Geen lelijke browser alerts. Direct doorsturen naar de succes-flow.
          setIsPreviewOpen(false);
          updateIsSubmitting(false);
          
          // Redirect to success page for all non-Mollie successes
          window.location.href = `/api/auth/magic-login?token=${data.token}&redirect=/account/orders?orderId=${data.orderId}${state.isQuoteRequest ? '&type=quote' : ''}`;
        } else if (data.checkoutUrl) {
          window.location.href = data.checkoutUrl;
        }
      } else {
        alert(data.message || 'Er is iets misgegaan.');
        updateIsSubmitting(false);
      }
    } catch (error) {
      console.error('Checkout error:', error);
      updateIsSubmitting(false);
    }
  };

  const usageLabels: Record<string, string> = {
    'telefonie': 'Telefoon / IVR',
    'unpaid': 'Online Video / Corporate',
    'commercial': 'Commercial / Advertentie'
  };

  const mediaLabels: Record<string, string> = {
    'online': 'Online / Social Media',
    'radio_national': 'Landelijke Radio',
    'radio_regional': 'Regionale Radio',
    'radio_local': 'Lokale Radio',
    'tv_national': 'Landelijke TV',
    'tv_regional': 'Regionale TV',
    'tv_local': 'Lokale TV',
    'podcast': 'Podcast Ads'
  };

  const countryLabels: Record<string, string> = {
    'BE': 'België',
    'NL': 'Nederland',
    'FR': 'Frankrijk',
    'EU': 'Europa (EU)',
    'GLOBAL': 'Wereldwijd'
  };

  const isSubscription = state.usage === 'subscription';
  const hasContextData = state.items.length > 0 || state.selectedActor || state.briefing || isSubscription || state.editionId;
  
  const cartSubtotal = state.items.reduce((sum, item) => sum + (item.pricing?.total ?? item.pricing?.subtotal ?? 0), 0);
  const currentSubtotal = state.selectedActor ? state.pricing.total : 0;
  const subtotal = cartSubtotal + currentSubtotal;

  const discountAmount = state.customer.active_coupon 
    ? (state.customer.active_coupon.type === 'percentage' 
        ? (subtotal * (state.customer.active_coupon.discount / 100)) 
        : state.customer.active_coupon.discount)
    : 0;

  const subtotalAfterDiscount = subtotal - discountAmount;
  const vatRate = isVatExempt ? 0 : 0.21;
  const tax = subtotalAfterDiscount * vatRate;
  const total = subtotalAfterDiscount + tax;

  return (
    <ContainerInstrument className={cn("space-y-6 w-full", className)}>
      {(!onlyTotals) && (
        <ContainerInstrument className="space-y-4 w-full">
          {/* Cart items list */}
          <ContainerInstrument className="space-y-4">
            {isSubscription && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex justify-between items-center p-6 bg-va-black text-white rounded-[20px] shadow-aura-lg border-b-4 border-primary relative overflow-hidden group"
              >
                <ContainerInstrument className="absolute inset-0 bg-gradient-to-r from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <ContainerInstrument className="flex items-center gap-4 relative z-10">
                  <ContainerInstrument className="w-12 h-12 rounded-[10px] bg-primary/20 flex items-center justify-center text-primary shadow-inner">
                    <Star size={24} strokeWidth={1.5} className="animate-pulse" />
                  </ContainerInstrument>
                  <ContainerInstrument>
                    <HeadingInstrument level={4} className="font-light text-lg tracking-tight text-white">
                      Johfrai {state.plan}
                    </HeadingInstrument>
                    <TextInstrument className="text-[15px] tracking-widest text-white/40 font-light ">
                      <VoiceglotText  translationKey="checkout.summary.subscription_desc" defaultText="Jaarabonnement  Direct Actief" />
                    </TextInstrument>
                  </ContainerInstrument>
                </ContainerInstrument>
                <ContainerInstrument className="text-right relative z-10">
                  <motion.span 
                    key={state.pricing.total}
                    initial={{ y: 10, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="block font-light text-2xl"
                  >
                    € {state.pricing.total.toFixed(2)}
                  </motion.span>
                  <TextInstrument className="text-[15px] tracking-widest text-white/20 font-light ">
                    <VoiceglotText  translationKey="common.per_month" defaultText="per maand" />
                  </TextInstrument>
                </ContainerInstrument>
              </motion.div>
            )}

            {state.items.length > 0 && state.items.map((item, idx) => (
              <ContainerInstrument 
                key={item.id || idx} 
                onClick={() => setSelectedItem(item)}
                className="flex items-center gap-6 p-6 bg-white rounded-[20px] border border-va-black/5 shadow-aura group relative cursor-pointer hover:border-primary/20 transition-all active:scale-[0.98]"
              >
                {/* Afbeelding links uitgelijnd (LAYA-MANDAAT) */}
                <ContainerInstrument className="w-16 h-16 rounded-[20px] overflow-hidden bg-va-off-white relative border border-va-black/5 shrink-0 shadow-sm">
                  <Image  
                    src={item.actor?.photo_url || '/mic-placeholder.png'} 
                    alt={item.actor?.display_name || 'Item'} 
                    fill 
                    className="object-cover" 
                  />
                </ContainerInstrument>

                {/* Uitleg, prijs en deleteknop rechts (LAYA-MANDAAT) */}
                <ContainerInstrument className="flex flex-1 items-center justify-between gap-4 min-w-0">
                  <ContainerInstrument className="min-w-0 flex-1">
                    <HeadingInstrument level={4} className="font-light text-xl text-va-black truncate tracking-tight">
                      {item.actor?.display_name || item.name || 'Stemopname'}
                    </HeadingInstrument>
                    <div className="text-[13px] leading-relaxed text-va-black/40 font-light mt-1 line-clamp-2">
                      {item.usage === 'telefonie' ? (
                        'Onbeperkt gebruik voor telefonie & IVR.'
                      ) : item.usage === 'commercial' ? (
                        <div className="flex flex-col gap-0.5">
                          <span className="font-medium text-primary/60">
                            {Array.isArray(item.media) 
                              ? item.media.map((m: string) => {
                                  const label = mediaLabels[m] || m;
                                  const spots = (typeof item.spots === 'object' ? item.spots[m] : item.spots) || 1;
                                  const years = (typeof item.years === 'object' ? item.years[m] : item.years) || 1;
                                  return `${label} (${spots} ${spots === 1 ? 'spot' : 'spots'}, ${years} ${years === 1 ? 'jaar' : 'jaar'})`;
                                }).join(' • ')
                              : (mediaLabels[item.media] || item.media)}
                          </span>
                          <span className="text-[11px] uppercase tracking-widest opacity-70">
                            {countryLabels[item.country] || item.country || 'België'}
                          </span>
                        </div>
                      ) : (
                        'Onbeperkt gebruik in de tijd zonder advertentie-budget.'
                      )}
                    </div>
                  </ContainerInstrument>

                  <div className="flex items-center gap-6 shrink-0">
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedItem(item);
                        }}
                        className="w-10 h-10 rounded-full bg-va-off-white flex items-center justify-center text-va-black/20 hover:text-primary hover:bg-primary/5 transition-all group/view"
                        title="Bekijk details"
                      >
                        <Eye size={18} strokeWidth={1.5} className="group-hover/view:scale-110 transition-transform" />
                      </button>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          removeItem(item.id);
                        }}
                        className="w-10 h-10 rounded-full bg-va-off-white flex items-center justify-center text-va-black/20 hover:text-red-500 hover:bg-red-50 transition-all group/delete"
                        title="Verwijder item"
                      >
                        <Trash2 size={18} strokeWidth={1.5} className="group-hover/delete:scale-110 transition-transform" />
                      </button>
                    </div>
                    <div className="flex flex-col items-end min-w-[120px]">
                      {state.customer.active_coupon && (
                        <TextInstrument className="text-[12px] text-va-black/20 line-through font-light">
                          €{(item.pricing?.subtotal ?? item.pricing?.total ?? 0).toFixed(2)}
                        </TextInstrument>
                      )}
                      <TextInstrument className={cn(
                        "font-light text-2xl tracking-tight",
                        state.customer.active_coupon ? "text-green-600" : "text-va-black"
                      )}>
                        €{((item.pricing?.subtotal ?? item.pricing?.total ?? 0) * (state.customer.active_coupon?.type === 'percentage' ? (1 - state.customer.active_coupon.discount / 100) : 1)).toFixed(2)}
                      </TextInstrument>
                      <TextInstrument className="text-[10px] text-va-black/20 font-light uppercase tracking-widest mt-0.5">
                        Excl. BTW
                      </TextInstrument>
                    </div>
                  </div>
                </ContainerInstrument>
              </ContainerInstrument>
            ))}
          </ContainerInstrument>
        </ContainerInstrument>
      )}

      {(!onlyItems) && (
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
          />
          <CTASection 
            handleSubmit={handleSubmit}
            setIsPreviewOpen={setIsPreviewOpen}
            setIsTermsOpen={setIsTermsOpen}
          />
        </ContainerInstrument>
      )}

      {/* ITEM DETAIL MODAL */}
      <AnimatePresence>
        {selectedItem && (
          <div className="fixed inset-0 z-[500] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedItem(null)}
              className="absolute inset-0 bg-va-black/60 backdrop-blur-xl"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-xl bg-white rounded-[32px] shadow-aura overflow-hidden max-h-[90vh] flex flex-col z-[501]"
            >
              <div className="p-10 flex-1 overflow-y-auto custom-scrollbar space-y-10">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-6">
                    <div className="w-24 h-24 rounded-[32px] overflow-hidden border border-va-black/5 shadow-md shrink-0 relative bg-va-off-white">
                      <Image 
                        src={selectedItem.actor?.photo_url || '/mic-placeholder.png'} 
                        alt={selectedItem.actor?.display_name} 
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <HeadingInstrument level={3} className="text-4xl font-light tracking-tighter text-va-black">
                        {selectedItem.actor?.display_name}
                      </HeadingInstrument>
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] font-bold tracking-[0.1em] uppercase text-va-black/40">
                        <span>{usageLabels[selectedItem.usage] || selectedItem.usage}</span>
                        <span className="w-1 h-1 rounded-full bg-va-black/10" />
                        <span>
                          {Array.isArray(selectedItem.media) 
                            ? selectedItem.media.map((m: string) => mediaLabels[m] || m).join(', ') 
                            : (mediaLabels[selectedItem.media] || selectedItem.media || 'Online')}
                        </span>
                        <span className="w-1 h-1 rounded-full bg-va-black/10" />
                        <span>{countryLabels[selectedItem.country] || selectedItem.country || 'België'}</span>
                        <span className="w-1 h-1 rounded-full bg-va-black/10" />
                        <span className="text-va-black">€ {(selectedItem.pricing?.subtotal ?? selectedItem.pricing?.total ?? 0).toFixed(2)}</span>
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
                    <LabelInstrument className="text-[11px] uppercase tracking-[0.1em] text-va-black/40 font-bold ml-0">Script & Briefing</LabelInstrument>
                    <div className="bg-va-off-white/40 p-8 rounded-[32px] border border-black/[0.02] max-h-[300px] overflow-y-auto custom-scrollbar relative group/script">
                      <p className="text-[16px] font-light leading-relaxed text-va-black italic whitespace-pre-wrap">
                        &quot;{selectedItem.script || selectedItem.briefing || 'Geen script ingevoerd'}&quot;
                      </p>
                      <div className="absolute top-4 right-4 opacity-0 group-hover/script:opacity-100 transition-opacity">
                        <Edit2 size={14} className="text-va-black/10" />
                      </div>
                    </div>
                  </div>

                  {selectedItem.pricing && (
                    <div className="pt-8 border-t border-va-black/5 space-y-4">
                      <LabelInstrument className="text-[11px] uppercase tracking-[0.1em] text-va-black/40 font-bold ml-0">Prijsopbouw (excl. BTW)</LabelInstrument>
                      <div className="space-y-3">
                        <div className="flex justify-between text-[15px]">
                          <span className="text-va-black/60 font-light">Basistarief</span>
                          <span className="font-medium text-va-black">€ {(selectedItem.pricing.base ?? 0).toFixed(2)}</span>
                        </div>
                        {(selectedItem.pricing.wordSurcharge ?? 0) > 0 && (
                          <div className="flex justify-between text-[15px]">
                            <span className="text-va-black/60 font-light">Extra woorden/prompts</span>
                            <span className="font-medium text-va-black">+ € {(selectedItem.pricing.wordSurcharge ?? 0).toFixed(2)}</span>
                          </div>
                        )}
                        {(selectedItem.pricing.mediaSurcharge ?? 0) > 0 && (
                          <div className="flex justify-between text-[15px]">
                            <span className="text-va-black/60 font-light">Buyouts & Licenties</span>
                            <span className="font-medium text-va-black">+ € {(selectedItem.pricing.mediaSurcharge ?? 0).toFixed(2)}</span>
                          </div>
                        )}
                        {(selectedItem.pricing.musicSurcharge ?? 0) > 0 && (
                          <div className="flex justify-between text-[15px]">
                            <span className="text-va-black/60 font-light">Muziek & Mixage</span>
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
          </div>
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
  couponCode, setCouponCode, applyCoupon, isApplyingCoupon, couponError
}) => {
  const { state, updateCustomer } = useCheckout();
  const { playClick } = useSonicDNA();
  
  return (
    <ContainerInstrument className="space-y-3 pt-6 border-t border-va-black/5">
      {/* Coupon Code Section */}
      <div className="pb-4">
        {!state.customer.active_coupon ? (
          <div className="flex gap-2">
            <div className="relative flex-1">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-va-black/20">
                <Tag size={14} strokeWidth={1.5} />
              </div>
              <InputInstrument
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                placeholder="Kortingscode"
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
                  {state.customer.active_coupon.code}
                </TextInstrument>
                <TextInstrument className="text-[10px] text-green-600/60 font-light">
                  {state.customer.active_coupon.type === 'percentage' ? `${state.customer.active_coupon.discount}% korting` : `€${state.customer.active_coupon.discount} korting`}
                </TextInstrument>
              </div>
            </div>
            <button 
              onClick={() => {
                updateCustomer({ active_coupon: null });
                setCouponCode('');
                playClick('soft');
              }}
              className="p-1.5 text-green-600/20 hover:text-red-500 transition-colors group/delete"
              title="Verwijder kortingscode"
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

      <ContainerInstrument className="flex justify-between text-[15px]">
        <TextInstrument className="text-va-black/40 font-light tracking-widest text-[15px] ">
          <VoiceglotText  translationKey="common.subtotal" defaultText="Subtotaal" />
        </TextInstrument>
        <TextInstrument className="font-light text-va-black">€ {subtotal.toFixed(2)}</TextInstrument>
      </ContainerInstrument>

      {state.customer.active_coupon && (
        <>
          <motion.div 
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex justify-between items-center text-[15px] text-green-600"
          >
            <div className="flex items-center gap-2">
              <Tag size={14} strokeWidth={2} />
              <TextInstrument className="font-light tracking-widest">
                Korting ({state.customer.active_coupon.code})
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

const CTASection: React.FC<any> = ({ handleSubmit, setIsPreviewOpen, setIsTermsOpen }) => {
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
            "w-full va-btn-pro !py-8 text-lg !rounded-[24px] !bg-va-black !text-white flex items-center justify-center gap-3 group transition-all duration-500",
            (state.isSubmitting || !state.agreedToTerms) ? 'opacity-30 grayscale cursor-not-allowed' : 'hover:shadow-aura-lg hover:scale-[1.01] active:scale-[0.98]'
          )}
        >
          {state.isSubmitting ? (
            <><Loader2 className="animate-spin" size={24} strokeWidth={1.5} /> <VoiceglotText  translationKey="common.processing" defaultText="Verwerken..." /></>
          ) : state.isQuoteRequest ? (
            <><VoiceglotText  translationKey="checkout.cta.quote" defaultText="Preview offerte e-mail" /> <Image  src="/assets/common/branding/icons/FORWARD.svg" width={20} height={20} alt="" className="brightness-0 invert group-hover:translate-x-1 transition-transform" /></>
          ) : state.paymentMethod === 'banktransfer' ? (
            <>
              <Lock size={20} strokeWidth={1.5} className="text-white/40" />
              <TextInstrument className="font-bold tracking-widest text-[13px]">
                <VoiceglotText translationKey="checkout.cta.banktransfer" defaultText="Bestelling plaatsen" />
              </TextInstrument>
              <Image  src="/assets/common/branding/icons/FORWARD.svg" width={20} height={20} alt="" className="brightness-0 invert group-hover:translate-x-1 transition-transform" />
            </>
          ) : (
            <>
              <Lock size={20} strokeWidth={1.5} className="text-white/40" />
              <TextInstrument className="font-bold tracking-widest text-[13px]">
                <VoiceglotText translationKey="checkout.cta.place_order" defaultText="Bestelling plaatsen" />
              </TextInstrument>
              <Image  src="/assets/common/branding/icons/FORWARD.svg" width={20} height={20} alt="" className="brightness-0 invert group-hover:translate-x-1 transition-transform" />
            </>
          )}
        </ButtonInstrument>
      </ContainerInstrument>

      {/* Trust & Security Section */}
      <ContainerInstrument className="pt-2 space-y-4">
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="flex items-center gap-2 text-green-600/60">
            <div className="flex -space-x-0.5">
              {[1,2,3,4,5].map(i => (
                <svg key={i} className="w-3 h-3 fill-current" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
            </div>
            <TextInstrument className="text-[11px] font-bold tracking-[0.2em] uppercase">
              <VoiceglotText translationKey="checkout.social_proof" defaultText="4.9/5 sterren op 395+ reviews" />
            </TextInstrument>
          </div>
          
          <div className="flex items-center gap-2 text-va-black/20">
            <Lock size={12} strokeWidth={2} />
            <TextInstrument className="text-[11px] font-bold tracking-[0.2em] uppercase">
              <VoiceglotText translationKey="checkout.secure_dutch" defaultText="Veilig afrekenen" />
            </TextInstrument>
          </div>
        </div>
      </ContainerInstrument>
    </ContainerInstrument>
  );
};
