"use client";

import {
    ButtonInstrument,
    ContainerInstrument,
    HeadingInstrument,
    InputInstrument,
    LabelInstrument,
    TextInstrument
} from "@/components/ui/LayoutInstruments";
import { VoiceglotText } from "@/components/ui/VoiceglotText";
import { useAuth } from "@/contexts/AuthContext";
import { useCheckout } from "@/contexts/CheckoutContext";
import { useSonicDNA } from "@/lib/sonic-dna";
import { cn } from '@/lib/utils';
import { createClient } from '@/utils/supabase/client';
import { CheckCircle2, Loader2, Clock, User, CreditCard, FileText, Send, AlertCircle, Lock, Tag, X, Mail, ArrowRight, LogIn } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import React, { useEffect, useState } from 'react';
import { AcademyUpsellSection } from './AcademyUpsellSection';
import { EmailPreviewModal } from './EmailPreviewModal';
import { TermsModal } from './TermsModal';

export const CheckoutForm: React.FC<{ onNext?: () => void }> = ({ onNext }) => {
  const { playClick } = useSonicDNA();
  const { state, updateCustomer, updatePaymentMethod, updateAgreedToTerms, updateIsSubmitting } = useCheckout();
  const auth = useAuth();
  const isAdmin = auth.isAdmin;
  const supabase = createClient();
  
  const [formData, setFormData] = useState({
    ...state.customer,
    isQuote: state.isQuoteRequest || false
  });

  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  
  // Modal Login States
  const [modalEmail, setModalEmail] = useState(formData.email || '');
  const [isModalLoggingIn, setIsModalLoggingIn] = useState(false);
  const [modalLoginError, setModalLoginError] = useState<string | null>(null);
  const [magicLinkSent, setMagicLinkSent] = useState(false);

  // Sync modal email with form email when modal opens
  useEffect(() => {
    if (isLoginModalOpen && formData.email) {
      setModalEmail(formData.email);
    }
  }, [isLoginModalOpen, formData.email]);

  const handleModalLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!modalEmail || !supabase) return;
    
    setIsModalLoggingIn(true);
    setModalLoginError(null);
    playClick('deep');

    try {
      // CHRIS-PROTOCOL: Gebruik onze eigen custom auth API voor 100% controle
      const response = await fetch('/api/auth/send-magic-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: modalEmail, redirect: '/checkout' }),
      });

      const result = await response.json();

      if (!response.ok) {
        setModalLoginError(result.error || 'Versturen mislukt. Probeer het later opnieuw.');
        playClick('error');
      } else {
        playClick('success');
        setMagicLinkSent(true);
      }
    } catch (err) {
      setModalLoginError('Versturen mislukt. Probeer het later opnieuw.');
    } finally {
      setIsModalLoggingIn(false);
    }
  };

  //  SYNC QUOTE MODE: Als de context zegt dat het een offerte-aanvraag is, dwingen we dit af
  useEffect(() => {
    if (state.isQuoteRequest) {
      setFormData(prev => ({ ...prev, isQuote: true }));
    }
  }, [state.isQuoteRequest]);

  const [vatStatus, setVatStatus] = useState<{ validating: boolean; valid: boolean | null; lastChecked: string }>({
    validating: false,
    valid: state.customer.vat_number ? true : null, // Assume valid if already in context
    lastChecked: state.customer.vat_number || ''
  });

  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isTermsOpen, setIsTermsOpen] = useState(false);
  const [showExtraDetails, setShowExtraDetails] = useState(false);

  useEffect(() => {
    if (formData.vat_number && formData.vat_number.length > 8 && formData.vat_number !== vatStatus.lastChecked) {
      const validateVat = async () => {
        setVatStatus(prev => ({ ...prev, validating: true, valid: null, lastChecked: formData.vat_number }));
        try {
          const res = await fetch(`/api/vat-verify?vat=${formData.vat_number}`);
          const data = await res.json();
          setVatStatus(prev => ({ ...prev, validating: false, valid: data.valid }));
          
          if (data.valid && data.companyName) {
            playClick('pro');
            const updates: any = { 
              company: data.companyName,
              country: formData.vat_number.substring(0, 2),
              vat_verified: true
            };
            if (data.address) {
              const addressParts = data.address.split('\n');
              if (addressParts.length > 0) {
                updates.address_street = addressParts[0].trim();
              }
              if (addressParts.length > 1) {
                const cityParts = addressParts[1].trim().split(' ');
                if (cityParts.length >= 2) {
                  updates.postal_code = cityParts[0];
                  updates.city = cityParts.slice(1).join(' ');
                }
              }
            }
            setFormData(prev => ({ ...prev, ...updates }));
            updateCustomer(updates);
          }
        } catch (e) {
          setVatStatus(prev => ({ ...prev, validating: false, valid: false }));
        }
      };
      const timer = setTimeout(validateVat, 800);
      return () => clearTimeout(timer);
    }
  }, [formData.vat_number, playClick, updateCustomer, vatStatus.lastChecked]);

  useEffect(() => {
    if (formData.email && formData.email.includes('@') && formData.email.length > 5) {
      const fetchUserData = async () => {
        try {
          const res = await fetch(`/api/admin/users/lookup?email=${encodeURIComponent(formData.email)}`);
          if (res.ok) {
            const userData = await res.json();
            if (userData && userData.user) {
              playClick('pro');
              const updates = {
                first_name: userData.user.firstName || '',
                last_name: userData.user.lastName || '',
                phone: userData.user.phone || '',
                company: userData.user.companyName || '',
                vat_number: userData.user.vatNumber || '',
                address_street: userData.user.addressStreet || '',
                postal_code: userData.user.addressZip || '',
                city: userData.user.addressCity || '',
                country: userData.user.addressCountry || 'BE'
              };
              setFormData(prev => ({ ...prev, ...updates }));
              updateCustomer(updates);
            }
          }
        } catch (e) {
          console.warn('[Admin Lookup] Failed to fetch user data:', e);
        }
      };
      const timer = setTimeout(fetchUserData, 500);
      return () => clearTimeout(timer);
    }
  }, [formData.email, isAdmin, playClick, updateCustomer]);

  const handleChange = (field: string, value: any) => {
    playClick('light');
    const newData = { ...formData, [field]: value };
    
    // Reset verification if VAT number changes
    if (field === 'vat_number') {
      newData.vat_verified = false;
    }
    
    setFormData(newData);
    updateCustomer(field === 'vat_number' ? { [field]: value, vat_verified: false } : { [field]: value });
  };

  const handleSubmit = async (quoteMessage?: string) => {
    if (state.isSubmitting) return;
    
    playClick('deep');
    updateIsSubmitting(true);

    try {
    const cartSubtotal = state.items.reduce((sum, item) => sum + (item.pricing?.total ?? item.pricing?.subtotal ?? 0), 0);
    const currentSubtotal = state.selectedActor ? state.pricing.total : 0;
    const grandSubtotal = cartSubtotal + currentSubtotal;

    const res = await fetch('/api/checkout/mollie', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...state,
        ...formData,
        pricing: {
          ...state.pricing,
          total: grandSubtotal
        },
        quoteMessage,
        payment_method: state.paymentMethod,
        country: formData.country || 'BE',
        music: state.music,
        metadata: {
          ...state.metadata,
          words: state.briefing.trim().split(/\s+/).filter(Boolean).length,
          prompts: state.prompts
        }
      }),
    });

    const data = await res.json();
    console.log('[Checkout] API Response:', data);

    if (data.success) {
        if (formData.isQuote || data.isBankTransfer) {
          // CHRIS-PROTOCOL: Geen lelijke browser alerts. Direct doorsturen.
          setIsPreviewOpen(false);
          updateIsSubmitting(false);
          if (data.isBankTransfer) {
            const redirectUrl = data.token 
              ? `/api/auth/magic-login?token=${data.token}&redirect=/account/orders?orderId=${data.orderId}`
              : `/account/orders?orderId=${data.orderId}`;
            window.location.href = redirectUrl;
          } else {
            // Offerte succesvol - direct naar de bestelling/offerte pagina
            if (data.orderId) {
              const redirectUrl = data.token 
                ? `/api/auth/magic-login?token=${data.token}&redirect=/account/orders?orderId=${data.orderId}&type=quote`
                : `/account/orders?orderId=${data.orderId}&type=quote`;
              window.location.href = redirectUrl;
            }
          }
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

  const countries = [
    { id: 'AL', label: 'Albanië' },
    { id: 'AD', label: 'Andorra' },
    { id: 'AT', label: 'Oostenrijk' },
    { id: 'BY', label: 'Wit-Rusland' },
    { id: 'BE', label: 'België' },
    { id: 'BA', label: 'Bosnië en Herzegovina' },
    { id: 'BG', label: 'Bulgarije' },
    { id: 'HR', label: 'Kroatië' },
    { id: 'CY', label: 'Cyprus' },
    { id: 'CZ', label: 'Tsjechië' },
    { id: 'DK', label: 'Denemarken' },
    { id: 'EE', label: 'Estland' },
    { id: 'FI', label: 'Finland' },
    { id: 'FR', label: 'Frankrijk' },
    { id: 'DE', label: 'Duitsland' },
    { id: 'GR', label: 'Griekenland' },
    { id: 'HU', label: 'Hongarije' },
    { id: 'IS', label: 'IJsland' },
    { id: 'IE', label: 'Ierland' },
    { id: 'IT', label: 'Italië' },
    { id: 'LV', label: 'Letland' },
    { id: 'LI', label: 'Liechtenstein' },
    { id: 'LT', label: 'Litouwen' },
    { id: 'LU', label: 'Luxemburg' },
    { id: 'MT', label: 'Malta' },
    { id: 'MD', label: 'Moldavië' },
    { id: 'MC', label: 'Monaco' },
    { id: 'ME', label: 'Montenegro' },
    { id: 'NL', label: 'Nederland' },
    { id: 'MK', label: 'Noord-Macedonië' },
    { id: 'NO', label: 'Noorwegen' },
    { id: 'PL', label: 'Polen' },
    { id: 'PT', label: 'Portugal' },
    { id: 'RO', label: 'Roemenië' },
    { id: 'SM', label: 'San Marino' },
    { id: 'RS', label: 'Servië' },
    { id: 'SK', label: 'Slowakije' },
    { id: 'SI', label: 'Slovenië' },
    { id: 'ES', label: 'Spanje' },
    { id: 'SE', label: 'Zweden' },
    { id: 'CH', label: 'Zwitserland' },
    { id: 'TR', label: 'Turkije' },
    { id: 'UA', label: 'Oekraïne' },
    { id: 'GB', label: 'Verenigd Koninkrijk' },
    { id: 'VA', label: 'Vaticaanstad' },
  ].sort((a, b) => a.label.localeCompare(b.label));

  const cartSubtotal = state.items.reduce((sum, item) => sum + (item.pricing?.total ?? item.pricing?.subtotal ?? 0), 0);
  const subtotalBeforeDiscount = cartSubtotal + state.pricing.total;
  
  const discountAmount = state.customer.active_coupon 
    ? (state.customer.active_coupon.type === 'percentage' 
        ? (subtotalBeforeDiscount * (state.customer.active_coupon.discount / 100)) 
        : state.customer.active_coupon.discount)
    : 0;

  const grandTotal = subtotalBeforeDiscount - discountAmount;
  const selectedMethod = state.paymentMethod || 'bancontact';
  const selectedMethodObj = state.paymentMethods.find(m => m.id === selectedMethod);
  const methodLabel = selectedMethodObj?.description || (selectedMethod.charAt(0).toUpperCase() + selectedMethod.slice(1));

  return (
    <ContainerInstrument className="space-y-8 w-full max-w-full">
      <ContainerInstrument className="bg-white p-8 rounded-[20px] border border-va-black/5 shadow-aura space-y-6 w-full max-w-full">
        <ContainerInstrument className="flex items-center gap-3 mb-2">
          <ContainerInstrument className="w-10 h-10 rounded-[10px] bg-primary/5 text-primary flex items-center justify-center">
            <User size={20} strokeWidth={1.5} />
          </ContainerInstrument>
          <HeadingInstrument level={3} className="text-xl font-light tracking-tight">
            <VoiceglotText  translationKey="checkout.details.title" defaultText="Jouw gegevens" />
          </HeadingInstrument>
        </ContainerInstrument>

        <ContainerInstrument className="space-y-0.5">
          <LabelInstrument className="flex justify-between items-center">
            <VoiceglotText  translationKey="checkout.form.email" defaultText="E-mailadres *" />
            {!auth.isAuthenticated && (
              <button 
                type="button"
                onClick={() => setIsLoginModalOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1 bg-primary/5 hover:bg-primary/10 text-primary rounded-full transition-all group/login"
              >
                <LogIn size={12} strokeWidth={2.5} className="group-hover/login:translate-x-0.5 transition-transform" />
                <span className="text-[10px] font-bold uppercase tracking-widest">
                  <VoiceglotText translationKey="checkout.login_trigger" defaultText="Al een account?" />
                </span>
              </button>
            )}
          </LabelInstrument>
          <InputInstrument
            type="email"
            value={formData.email || ''}
            placeholder="naam@bedrijf.be"
            className="w-full !rounded-[10px] !py-5"
            onChange={(e) => handleChange('email', e.target.value)}
          />
        </ContainerInstrument>

        <ContainerInstrument className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <ContainerInstrument className="space-y-0.5">
            <LabelInstrument>
              <VoiceglotText  translationKey="checkout.form.first_name" defaultText="Voornaam *" />
            </LabelInstrument>
            <InputInstrument
              value={formData.first_name || ''}
              placeholder="Bijv. Jan"
              className="w-full !rounded-[10px]"
              onChange={(e) => handleChange('first_name', e.target.value)}
            />
          </ContainerInstrument>
          <ContainerInstrument className="space-y-0.5">
            <LabelInstrument>
              <VoiceglotText  translationKey="checkout.form.last_name" defaultText="Achternaam *" />
            </LabelInstrument>
            <InputInstrument
              value={formData.last_name || ''}
              placeholder="Bijv. Janssen"
              className="w-full !rounded-[10px]"
              onChange={(e) => handleChange('last_name', e.target.value)}
            />
          </ContainerInstrument>
        </ContainerInstrument>
        
        <ContainerInstrument className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <ContainerInstrument className="space-y-0.5">
            <LabelInstrument>
              <VoiceglotText  translationKey="checkout.form.phone" defaultText="Telefoonnummer" />
            </LabelInstrument>
            <InputInstrument
              value={formData.phone || ''}
              placeholder="+32..."
              className="w-full !rounded-[10px]"
              onChange={(e) => handleChange('phone', e.target.value)}
            />
          </ContainerInstrument>
          <ContainerInstrument className="space-y-0.5">
            <LabelInstrument>
              <VoiceglotText  translationKey="checkout.form.vat" defaultText="BTW-nummer" />
            </LabelInstrument>
            <ContainerInstrument className="relative">
              <InputInstrument
                value={formData.vat_number || ''}
                placeholder="Bijv. BE0662426460"
                className="w-full !rounded-[10px]"
                onChange={(e) => handleChange('vat_number', e.target.value.toUpperCase())}
              />
              <ContainerInstrument className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
                {vatStatus.validating ? <Loader2 className="animate-spin text-primary" size={18} strokeWidth={1.5} /> : 
                 vatStatus.valid === true ? (
                   <ContainerInstrument className="flex items-center gap-2 text-green-600 animate-fade-in">
                     <TextInstrument className="text-[15px] font-light tracking-widest ">
                       <VoiceglotText  translationKey="checkout.form.vat_ready" defaultText="Geverifieerd" />
                     </TextInstrument>
                     <CheckCircle2 strokeWidth={1.5} size={18} />
                   </ContainerInstrument>
                 ) : vatStatus.valid === false ? (
                   <ContainerInstrument className="flex items-center gap-2 text-red-500 animate-shake">
                     <TextInstrument className="text-[15px] font-light tracking-widest ">
                       <VoiceglotText  translationKey="checkout.form.vat_invalid" defaultText="Ongeldig" />
                     </TextInstrument>
                     <AlertCircle size={18} strokeWidth={1.5} />
                   </ContainerInstrument>
                 ) : vatStatus.valid === null && vatStatus.lastChecked ? (
                   <ContainerInstrument className="flex items-center gap-2 text-va-black/30 animate-fade-in">
                     <TextInstrument className="text-[15px] font-light tracking-widest ">
                       <VoiceglotText  translationKey="checkout.form.vat_unavailable" defaultText="Check niet mogelijk" />
                     </TextInstrument>
                     <Clock size={18} strokeWidth={1.5} />
                   </ContainerInstrument>
                 ) : null}
              </ContainerInstrument>
            </ContainerInstrument>
          </ContainerInstrument>
        </ContainerInstrument>

        <ContainerInstrument className="space-y-0.5">
          <LabelInstrument>
            <VoiceglotText  translationKey="checkout.form.company" defaultText="Bedrijfsnaam" />
          </LabelInstrument>
          <InputInstrument
            value={formData.company || ''}
            placeholder="Jouw bedrijf"
            className="w-full !rounded-[10px]"
            onChange={(e) => handleChange('company', e.target.value)}
          />
        </ContainerInstrument>

        <ContainerInstrument className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <ContainerInstrument className="space-y-0.5">
            <LabelInstrument>
              <VoiceglotText  translationKey="checkout.form.address" defaultText="Straat en huisnummer" />
            </LabelInstrument>
            <InputInstrument
              value={formData.address_street || ''}
              placeholder="Kerkstraat 1"
              className="w-full !rounded-[10px]"
              onChange={(e) => handleChange('address_street', e.target.value)}
            />
          </ContainerInstrument>
          <ContainerInstrument className="space-y-0.5">
            <LabelInstrument>
              <VoiceglotText  translationKey="checkout.form.zip" defaultText="Postcode *" />
            </LabelInstrument>
            <InputInstrument
              value={formData.postal_code || ''}
              placeholder="9000"
              className="w-full !rounded-[10px]"
              onChange={(e) => handleChange('postal_code', e.target.value)}
            />
          </ContainerInstrument>
        </ContainerInstrument>

        <ContainerInstrument className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <ContainerInstrument className="space-y-0.5">
            <LabelInstrument>
              <VoiceglotText  translationKey="checkout.form.city" defaultText="Stad *" />
            </LabelInstrument>
            <InputInstrument
              value={formData.city || ''}
              placeholder="Gent"
              className="w-full !rounded-[10px]"
              onChange={(e) => handleChange('city', e.target.value)}
            />
          </ContainerInstrument>
          <ContainerInstrument className="space-y-0.5">
            <LabelInstrument>
              <VoiceglotText  translationKey="checkout.form.country" defaultText="Land *" />
            </LabelInstrument>
            <select 
              value={formData.country || 'BE'}
              onChange={(e) => handleChange('country', e.target.value)}
              className="w-full bg-va-off-white border-none rounded-[10px] px-6 py-4 text-[15px] font-medium focus:ring-2 focus:ring-primary/20 transition-all appearance-none cursor-pointer"
            >
              {countries.map((c) => (
                <option key={c.id} value={c.id}>{c.label}</option>
              ))}
            </select>
          </ContainerInstrument>
        </ContainerInstrument>

        <ContainerInstrument className="pt-4 border-t border-va-black/5 space-y-4">
          <button 
            type="button"
            onClick={() => {
              playClick('light');
              setShowExtraDetails(!showExtraDetails);
            }}
            className="flex items-center gap-3 group"
          >
            <div className={cn(
              "w-5 h-5 rounded border-2 flex items-center justify-center transition-all duration-300",
              showExtraDetails ? "bg-green-500 border-green-500" : "bg-white border-va-black/10 group-hover:border-primary/30"
            )}>
              {showExtraDetails && <CheckCircle2 size={12} strokeWidth={3} className="text-white" />}
            </div>
            <span className="text-[13px] font-bold tracking-[0.1em] text-va-black/40 uppercase group-hover:text-va-black transition-colors">
              Extra Facturatie Details
            </span>
          </button>
          
          <AnimatePresence>
            {showExtraDetails && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
                className="overflow-hidden"
              >
                <ContainerInstrument className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                  <ContainerInstrument className="space-y-0.5">
                    <LabelInstrument>
                      <VoiceglotText  translationKey="checkout.form.po_number" defaultText="PO Nummer / Referentie" />
                    </LabelInstrument>
                    <InputInstrument
                      value={(formData as any).billing_po || ''}
                      placeholder="Bijv. PO-12345"
                      className="w-full !rounded-[10px]"
                      onChange={(e) => handleChange('billing_po', e.target.value)}
                    />
                  </ContainerInstrument>
                  <ContainerInstrument className="space-y-0.5">
                    <LabelInstrument>
                      <VoiceglotText  translationKey="checkout.form.financial_email" defaultText="E-mail facturatie (optioneel)" />
                    </LabelInstrument>
                    <InputInstrument
                      type="email"
                      value={(formData as any).financial_email || ''}
                      placeholder="facturatie@bedrijf.be"
                      className="w-full !rounded-[10px]"
                      onChange={(e) => handleChange('financial_email', e.target.value)}
                    />
                  </ContainerInstrument>
                </ContainerInstrument>
              </motion.div>
            )}
          </AnimatePresence>
        </ContainerInstrument>
      </ContainerInstrument>

      {!formData.isQuote ? (
        <ContainerInstrument className="bg-white p-8 rounded-[20px] border border-va-black/5 shadow-aura space-y-6 w-full">
          <ContainerInstrument className="flex items-center gap-3 mb-2">
            <ContainerInstrument className="w-10 h-10 rounded-[10px] bg-primary/5 text-primary flex items-center justify-center">
              <CreditCard size={20} strokeWidth={1.5} />
            </ContainerInstrument>
            <HeadingInstrument level={3} className="text-xl font-light tracking-tight">
              <VoiceglotText  translationKey="checkout.payment.title" defaultText="Betaalmethode" />
            </HeadingInstrument>
          </ContainerInstrument>

          <ContainerInstrument className="space-y-2">
            {state.paymentMethods.map((method) => (
              <ButtonInstrument
                key={method.id}
                type="button"
                variant="ghost"
                onClick={() => {
                  playClick('light');
                  updatePaymentMethod(method.id);
                }}
                className={cn(
                  "w-full px-5 py-4 rounded-[16px] border transition-all duration-300 flex items-center justify-between group shadow-none",
                  state.paymentMethod === method.id
                    ? 'border-primary/40 bg-va-black/[0.02] shadow-sm'
                    : 'border-va-black/5 bg-white hover:border-va-black/10 hover:bg-va-off-white/50'
                )}
              >
                <div className="flex items-center gap-4">
                  <div className={cn(
                    "w-10 h-8 flex items-center justify-center transition-all duration-500",
                    state.paymentMethod === method.id ? "scale-105" : "grayscale opacity-30 group-hover:grayscale-0 group-hover:opacity-100"
                  )}>
                    {method.id === 'banktransfer' ? (
                      <FileText size={20} strokeWidth={1.2} className={state.paymentMethod === method.id ? "text-primary" : "text-va-black/40"} />
                    ) : (
                      <Image  
                        src={method.image.size2x} 
                        alt={method.description} 
                        width={40} 
                        height={20} 
                        className="h-5 object-contain"
                      />
                    )}
                  </div>
                  <div className="text-left">
                    <TextInstrument className={cn(
                      "font-light tracking-widest text-[12px] uppercase block",
                      state.paymentMethod === method.id ? "text-primary" : "text-va-black/40 group-hover:text-va-black/60"
                    )}>
                      <VoiceglotText translationKey={`checkout.method.${method.id}`} defaultText={method.description} />
                    </TextInstrument>
                  </div>
                </div>
                
                <div className={cn(
                  "w-5 h-5 rounded-full border flex items-center justify-center transition-all duration-500",
                  state.paymentMethod === method.id 
                    ? "border-primary bg-primary shadow-inner" 
                    : "border-va-black/10 bg-va-off-white/30"
                )}>
                  {state.paymentMethod === method.id && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="w-1.5 h-1.5 rounded-full bg-white"
                    />
                  )}
                </div>
              </ButtonInstrument>
            ))}

            {/* Bank Transfer Info Box */}
            <AnimatePresence>
              {state.paymentMethod === 'banktransfer' && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="pt-2"
                >
                  <div className="p-5 bg-va-off-white/50 rounded-[16px] border border-va-black/5 flex items-start gap-4">
                    <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center text-va-black/20 shadow-sm shrink-0">
                      <Clock size={16} strokeWidth={1.5} />
                    </div>
                                  <div className="space-y-0.5">
                                    <HeadingInstrument level={4} className="text-[13px] font-medium tracking-tight text-va-black/60">
                                      <VoiceglotText translationKey="checkout.banktransfer.pending_title" defaultText="Factuur via e-mail" />
                                    </HeadingInstrument>
                                    <TextInstrument className="text-[12px] text-va-black/40 font-light leading-relaxed">
                                      {(auth.user as any)?.preferences?.has_special_payment_agreement === true ? (
                                        <VoiceglotText 
                                          translationKey="checkout.banktransfer.special_agreement_desc" 
                                          defaultText="Je ontvangt de factuur direct na het afronden. De bestelling wordt conform onze afspraak direct in behandeling genomen." 
                                        />
                                      ) : (
                                        <VoiceglotText 
                                          translationKey="checkout.banktransfer.pending_desc" 
                                          defaultText="Je ontvangt de factuur direct na het afronden. De bestelling staat in de wacht tot het bedrag is overgemaakt, tenzij expliciet anders overeengekomen." 
                                        />
                                      )}
                                    </TextInstrument>
                                  </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </ContainerInstrument>
        </ContainerInstrument>
      ) : (
        <ContainerInstrument className="p-8 bg-va-black/[0.02] rounded-[20px] border border-va-black/5 flex items-center gap-6 animate-fade-in">
          <ContainerInstrument className="w-14 h-14 bg-white rounded-[10px] flex items-center justify-center text-va-black/40 shadow-sm">
            <Send size={28} strokeWidth={1.5} />
          </ContainerInstrument>
          <ContainerInstrument>
            <HeadingInstrument level={4} className="text-lg font-light tracking-tight">
              <VoiceglotText  translationKey="checkout.ready_to_send.title" defaultText="Klaar voor verzending" />
            </HeadingInstrument>
            <TextInstrument className="text-[15px] text-va-black/40 font-light leading-relaxed">
              <VoiceglotText  
                translationKey="checkout.ready_to_send.desc" 
                defaultText={`Je staat op het punt een officile offerte te sturen naar ${formData.email}. In de volgende stap kun je de begeleidende e-mail personaliseren.`} 
              />
            </TextInstrument>
          </ContainerInstrument>
        </ContainerInstrument>
      )}

      {state.journey === 'academy' && (
        <ContainerInstrument className="pt-4 pb-4">
          <LabelInstrument className="flex items-start gap-3 cursor-pointer group">
            <ContainerInstrument className="pt-1">
              <input 
                type="checkbox" 
                checked={state.agreedToTerms}
                onChange={(e) => updateAgreedToTerms(e.target.checked)}
                className="w-5 h-5 rounded border-2 border-va-black/10 text-green-500 focus:ring-green-500/20 transition-all"
              />
            </ContainerInstrument>
            <TextInstrument className="text-[15px] text-va-black/40 font-light leading-relaxed group-hover:text-va-black transition-colors">
              <VoiceglotText  
                translationKey="checkout.academy.terms" 
                defaultText="Ik ga akkoord met de algemene voorwaarden en begrijp dat mijn herroepingsrecht vervalt zodra ik toegang krijg tot de digitale leeromgeving." 
              />
            </TextInstrument>
          </LabelInstrument>
        </ContainerInstrument>
      )}

      <AcademyUpsellSection strokeWidth={1.5} />

      <ContainerInstrument className="pt-6 border-t border-va-black/5 mt-8">
        {/* Admin Quote Toggle */}
        {isAdmin && (
          <ContainerInstrument className="mb-8 p-6 bg-va-black/[0.02] rounded-[20px] border border-va-black/5 flex items-center justify-between group animate-fade-in">
            <ContainerInstrument className="flex items-center gap-4">
              <ContainerInstrument className="w-12 h-12 bg-white rounded-[10px] flex items-center justify-center text-va-black/40 shadow-sm group-hover:scale-110 transition-transform">
                <FileText size={24} strokeWidth={1.5} />
              </ContainerInstrument>
              <ContainerInstrument>
                <HeadingInstrument level={4} className="text-[15px] font-light tracking-tight">
                  <VoiceglotText  translationKey="checkout.admin.quote_mode" defaultText="Admin offerte modus" />
                </HeadingInstrument>
                <TextInstrument className="text-[15px] font-light text-va-black/40 tracking-widest">
                  <VoiceglotText  translationKey="checkout.admin.quote_desc" defaultText="Verstuur een offerte i.p.v. directe betaling" />
                </TextInstrument>
              </ContainerInstrument>
            </ContainerInstrument>
            <ButtonInstrument 
              onClick={() => handleChange('isQuote', !formData.isQuote)}
              className={cn(
                "w-14 h-8 rounded-full relative transition-all duration-500",
                formData.isQuote ? 'bg-primary' : 'bg-va-black/10'
              )}
            >
              <ContainerInstrument className={cn(
                "absolute top-1 w-6 h-6 bg-white rounded-full transition-all duration-500",
                formData.isQuote ? 'left-7 shadow-lg' : 'left-1'
              )} />
            </ButtonInstrument>
          </ContainerInstrument>
        )}
      </ContainerInstrument>

      <EmailPreviewModal strokeWidth={1.5} 
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        onSend={(msg) => handleSubmit(msg)}
        customerName={`${formData.first_name} ${formData.last_name}`}
        totalAmount={String(grandTotal || '0')}
        items={state.items || []}
      />

      <TermsModal 
        isOpen={isTermsOpen}
        onClose={() => setIsTermsOpen(false)}
      />

      {/* Login Modal Overlay */}
      <AnimatePresence>
        {isLoginModalOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[600] flex items-center justify-center p-6 bg-va-black/90 backdrop-blur-xl"
          >
            <ContainerInstrument plain className="relative w-full max-w-md bg-white rounded-[40px] overflow-hidden shadow-2xl flex flex-col z-[601]">
              <div className="p-8 border-b border-black/5 flex justify-between items-center">
                <HeadingInstrument level={3} className="text-2xl font-light tracking-tighter">
                  Inloggen
                </HeadingInstrument>
                <button onClick={() => setIsLoginModalOpen(false)} className="p-2 hover:bg-va-off-white rounded-full transition-colors">
                  <X size={20} />
                </button>
              </div>
              <div className="p-8 space-y-6">
                <AnimatePresence mode="wait">
                  {!magicLinkSent ? (
                    <motion.div
                      key="login-form"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      className="space-y-6"
                    >
                      <TextInstrument className="text-[15px] text-va-black/40 font-light leading-relaxed">
                        Vul je e-mailadres in om een magische link te ontvangen. Hiermee log je direct in en worden je gegevens automatisch ingevuld.
                      </TextInstrument>

                      <form onSubmit={handleModalLogin} className="space-y-4">
                        {modalLoginError && (
                          <div className="p-3 bg-red-50 border-l-2 border-red-500 text-red-600 text-[13px] rounded-r-lg animate-in fade-in slide-in-from-top-1">
                            {modalLoginError}
                          </div>
                        )}
                        
                        <div className="space-y-0.5">
                          <LabelInstrument className="ml-1 mb-1">E-mailadres</LabelInstrument>
                          <div className="relative group">
                            <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-va-black/20 group-focus-within:text-primary transition-colors" />
                            <InputInstrument 
                              type="email"
                              value={modalEmail}
                              onChange={(e) => setModalEmail(e.target.value)}
                              placeholder="naam@bedrijf.be"
                              className="w-full !pl-12 !py-3 !rounded-xl bg-va-off-white/50 border-transparent focus:bg-white transition-all"
                              required
                            />
                          </div>
                        </div>

                        <ButtonInstrument 
                          type="submit"
                          variant="pure"
                          disabled={isModalLoggingIn}
                          className="w-full va-btn-pro !bg-va-black !text-white flex items-center justify-center gap-3 py-4 rounded-2xl mt-2"
                        >
                          {isModalLoggingIn ? (
                            <Loader2 size={20} className="animate-spin" />
                          ) : (
                            <>
                              Magische link versturen
                              <Send size={18} />
                            </>
                          )}
                        </ButtonInstrument>
                      </form>

                      <div className="flex flex-col gap-3 pt-2">
                        <button 
                          onClick={() => setIsLoginModalOpen(false)}
                          className="w-full text-center text-[13px] font-light text-va-black/40 hover:text-va-black transition-colors"
                        >
                          Doorgaan als gast
                        </button>
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="success-message"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="text-center py-8 space-y-6"
                    >
                      <div className="w-20 h-20 bg-green-500/10 text-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Mail size={40} strokeWidth={1.5} className="animate-bounce" />
                      </div>
                      <div className="space-y-2">
                        <HeadingInstrument level={4} className="text-2xl font-light tracking-tighter">
                          Check je inbox!
                        </HeadingInstrument>
                        <TextInstrument className="text-[15px] text-va-black/40 font-light leading-relaxed">
                          We hebben een magische link gestuurd naar <span className="text-va-black font-medium">{modalEmail}</span>.<br />
                          Klik op de link in de e-mail om direct in te loggen.
                        </TextInstrument>
                      </div>
                      <ButtonInstrument 
                        onClick={() => setIsLoginModalOpen(false)}
                        variant="pure"
                        className="w-full va-btn-nav !rounded-xl !bg-va-black !text-white"
                      >
                        Sluiten
                      </ButtonInstrument>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </ContainerInstrument>
          </motion.div>
        )}
      </AnimatePresence>
    </ContainerInstrument>
  );
};
