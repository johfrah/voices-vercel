"use client";

import {
    ButtonInstrument,
    HeadingInstrument,
    InputInstrument,
    LabelInstrument
} from "@/components/ui/LayoutInstruments";
import { VoiceglotText } from "@/components/ui/VoiceglotText";
import { useAuth } from "@/contexts/AuthContext";
import { useCheckout } from "@/contexts/CheckoutContext";
import { useSonicDNA } from "@/lib/sonic-dna";
import { AlertCircle, CheckCircle2, FileText, Loader2, Send, Sparkles } from 'lucide-react';
import Image from 'next/image';
import React, { useEffect, useState } from 'react';
import { AcademyUpsellSection } from './AcademyUpsellSection';
import { EmailPreviewModal } from './EmailPreviewModal';

export const CheckoutForm: React.FC<{ onNext?: () => void }> = ({ onNext }) => {
  const { playClick } = useSonicDNA();
  const { state, updateCustomer } = useCheckout();
  const { isAdmin } = useAuth();
  
  const [formData, setFormData] = useState({
    ...state.customer,
    gateway: 'mollie',
    isQuote: false
  });

  const [vatStatus, setVatStatus] = useState<{ validating: boolean; valid: boolean | null }>({
    validating: false,
    valid: null
  });

  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [paymentMethods, setPaymentMethods] = useState<any[]>([]);
  const [selectedMethod, setSelectedMethod] = useState('bancontact');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);

    const gateways = [
    { id: 'mollie', name: 'Direct betalen', icon: '💳' },
    { id: 'banktransfer', name: 'Betalen op factuur', icon: '🏦' }
  ];

  useEffect(() => {
    const fetchMethods = async () => {
      try {
        const res = await fetch('/api/checkout/config');
        const data = await res.json();
        if (data && data.paymentMethods) {
          setPaymentMethods(data.paymentMethods);
        }
      } catch (e) {
        setPaymentMethods([
          { id: 'bancontact', description: 'Bancontact', image: { size2x: 'https://www.mollie.com/external/icons/payment-methods/bancontact%402x.png' } },
          { id: 'applepay', description: 'Apple Pay', image: { size2x: 'https://www.mollie.com/external/icons/payment-methods/applepay%402x.png' } },
          { id: 'ideal', description: 'iDEAL', image: { size2x: 'https://www.mollie.com/external/icons/payment-methods/ideal%402x.png' } },
          { id: 'creditcard', description: 'Creditcard', image: { size2x: 'https://www.mollie.com/external/icons/payment-methods/creditcard%402x.png' } },
        ]);
      }
    };
    fetchMethods();
  }, []);

  useEffect(() => {
    if (formData.vat_number && formData.vat_number.length > 8) {
      const validateVat = async () => {
        setVatStatus({ validating: true, valid: null });
        try {
          const res = await fetch(`/api/vat-verify?vat=${formData.vat_number}`);
          const data = await res.json();
          setVatStatus({ validating: false, valid: data.valid });
          
          if (data.valid && data.companyName) {
            playClick('pro');
            const updates: any = { company: data.companyName };
            if (data.address) {
              const addressParts = data.address.split('\n');
              if (addressParts.length > 0) {
                updates.address_street = addressParts[0].trim();
              }
            }
            setFormData(prev => ({ ...prev, ...updates }));
            updateCustomer(updates);
          }
        } catch (e) {
          setVatStatus({ validating: false, valid: false });
        }
      };
      const timer = setTimeout(validateVat, 800);
      return () => clearTimeout(timer);
    }
  }, [formData.vat_number, playClick, updateCustomer]);

  const handleChange = (field: string, value: any) => {
    playClick('light');
    const newData = { ...formData, [field]: value };
    setFormData(newData);
    updateCustomer({ [field]: value });
  };

  const handleSubmit = async (quoteMessage?: string) => {
    if (isSubmitting) return;
    
    playClick('deep');
    setIsSubmitting(true);

    try {
      const res = await fetch('/api/checkout/mollie', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...state,
          ...formData,
          quoteMessage,
          payment_method: selectedMethod,
          market: 'BE',
          music: state.music 
        }),
      });

      const data = await res.json();

      if (data.success) {
        if (formData.isQuote || data.isBankTransfer) {
          alert(data.isBankTransfer 
            ? 'Bedankt! Je bestelling is geplaatst. We sturen je de factuur per e-mail. Je bestelling wordt verwerkt zodra de betaling is ontvangen.' 
            : 'Offerte succesvol verzonden!');
          setIsPreviewOpen(false);
          setIsSubmitting(false);
          if (data.isBankTransfer) {
            window.location.href = `/checkout/success?orderId=${data.orderId}&method=banktransfer`;
          }
        } else if (data.checkoutUrl) {
          window.location.href = data.checkoutUrl;
        }
      } else {
        alert(data.message || 'Er is iets misgegaan.');
        setIsSubmitting(false);
      }
    } catch (error) {
      console.error('Checkout error:', error);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Admin Quote Toggle */}
      {isAdmin && (
        <div className="p-6 bg-primary/5 rounded-[20px] border border-primary/10 flex items-center justify-between group animate-fade-in">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white rounded-[10px] flex items-center justify-center text-primary shadow-sm group-hover:scale-110 transition-transform">
              <FileText size={24} />
            </div>
            <div>
              <h4 className="text-sm font-light tracking-tight">
                <VoiceglotText translationKey="checkout.admin.quote_mode" defaultText="Admin Offerte Modus" />
              </h4>
              <p className="text-[15px] font-light text-va-black/40 tracking-widest">
                <VoiceglotText translationKey="checkout.admin.quote_desc" defaultText="Verstuur een offerte i.p.v. directe betaling" />
              </p>
            </div>
          </div>
          <button 
            onClick={() => handleChange('isQuote', !formData.isQuote)}
            className={`w-14 h-8 rounded-full relative transition-all duration-500 ${formData.isQuote ? 'bg-primary' : 'bg-va-black/10'}`}
          >
            <div className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-all duration-500 ${formData.isQuote ? 'left-7 shadow-lg' : 'left-1'}`} />
          </button>
        </div>
      )}

      <div className="bg-white p-8 rounded-[20px] border border-black/[0.03] shadow-aura space-y-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-[10px] bg-primary/5 text-primary flex items-center justify-center">
            <CheckCircle2 strokeWidth={1.5} size={20} />
          </div>
          <HeadingInstrument level={3} className="text-xl font-light tracking-tight">
            <VoiceglotText translationKey="checkout.details.title" defaultText="Jouw Gegevens" />
          </HeadingInstrument>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-1">
            <LabelInstrument>
              <VoiceglotText translationKey="checkout.form.first_name" defaultText="Voornaam *" />
            </LabelInstrument>
            <InputInstrument
              value={formData.first_name || ''}
              placeholder="Bijv. Jan"
              className="w-full !rounded-[10px]"
              onChange={(e) => handleChange('first_name', e.target.value)}
            />
          </div>
          <div className="space-y-1">
            <LabelInstrument>
              <VoiceglotText translationKey="checkout.form.last_name" defaultText="Achternaam *" />
            </LabelInstrument>
            <InputInstrument
              value={formData.last_name || ''}
              placeholder="Bijv. Janssen"
              className="w-full !rounded-[10px]"
              onChange={(e) => handleChange('last_name', e.target.value)}
            />
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-1">
            <LabelInstrument>
              <VoiceglotText translationKey="checkout.form.email" defaultText="E-mailadres *" />
            </LabelInstrument>
            <InputInstrument
              type="email"
              value={formData.email || ''}
              placeholder="naam@bedrijf.be"
              className="w-full !rounded-[10px]"
              onChange={(e) => handleChange('email', e.target.value)}
            />
          </div>
          <div className="space-y-1">
            <LabelInstrument>
              <VoiceglotText translationKey="checkout.form.phone" defaultText="Telefoonnummer" />
            </LabelInstrument>
            <InputInstrument
              value={formData.phone || ''}
              placeholder="+32..."
              className="w-full !rounded-[10px]"
              onChange={(e) => handleChange('phone', e.target.value)}
            />
          </div>
        </div>
        
        <div className="space-y-1">
          <LabelInstrument>
            <VoiceglotText translationKey="checkout.form.vat" defaultText="BTW-nummer" />
          </LabelInstrument>
          <div className="relative">
            <InputInstrument
              value={formData.vat_number || ''}
              placeholder="Bijv. BE0662426460"
              className="w-full !rounded-[10px]"
              onChange={(e) => handleChange('vat_number', e.target.value.toUpperCase())}
            />
            <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
              {vatStatus.validating ? <Loader2 className="animate-spin text-primary" size={18} /> : 
               vatStatus.valid ? (
                 <div className="flex items-center gap-2 text-green-600 animate-fade-in">
                   <span className="text-[15px] font-light tracking-widest">
                     <VoiceglotText translationKey="checkout.form.vat_ready" defaultText="Geverifieerd" />
                   </span>
                   <CheckCircle2 strokeWidth={1.5} size={18} />
                 </div>
               ) : vatStatus.valid === false ? (
                 <div className="flex items-center gap-2 text-red-500 animate-shake">
                   <span className="text-[15px] font-light tracking-widest">
                     <VoiceglotText translationKey="checkout.form.vat_invalid" defaultText="Ongeldig" />
                   </span>
                   <AlertCircle size={18} />
                 </div>
               ) : null}
            </div>
          </div>
        </div>

        <div className="space-y-1">
          <LabelInstrument>
            <VoiceglotText translationKey="checkout.form.company" defaultText="Bedrijfsnaam" />
          </LabelInstrument>
          <InputInstrument
            value={formData.company || ''}
            placeholder="Jouw bedrijf"
            className="w-full !rounded-[10px]"
            onChange={(e) => handleChange('company', e.target.value)}
          />
        </div>

        <div className="space-y-1">
          <LabelInstrument>
            <VoiceglotText translationKey="checkout.form.address" defaultText="Straat en huisnummer" />
          </LabelInstrument>
          <InputInstrument
            value={formData.address_street || ''}
            placeholder="Kerkstraat 1"
            className="w-full !rounded-[10px]"
            onChange={(e) => handleChange('address_street', e.target.value)}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-1">
            <LabelInstrument>
              <VoiceglotText translationKey="checkout.form.zip" defaultText="Postcode *" />
            </LabelInstrument>
            <InputInstrument
              value={formData.postal_code || ''}
              placeholder="9000"
              className="w-full !rounded-[10px]"
              onChange={(e) => handleChange('postal_code', e.target.value)}
            />
          </div>
          <div className="space-y-1">
            <LabelInstrument>
              <VoiceglotText translationKey="checkout.form.city" defaultText="Stad *" />
            </LabelInstrument>
            <InputInstrument
              value={formData.city || ''}
              placeholder="Gent"
              className="w-full !rounded-[10px]"
              onChange={(e) => handleChange('city', e.target.value)}
            />
          </div>
        </div>
      </div>

      {!formData.isQuote ? (
        <>
          <div className="bg-white p-8 rounded-[20px] border border-black/[0.03] shadow-aura space-y-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-[10px] bg-primary/5 text-primary flex items-center justify-center">
                <Sparkles strokeWidth={1.5} size={20} />
              </div>
              <HeadingInstrument level={3} className="text-xl font-light tracking-tight">
                <VoiceglotText translationKey="checkout.payment.title" defaultText="Betaalmethode" />
              </HeadingInstrument>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {gateways.map((gateway) => (
                <button
                  key={gateway.id}
                  type="button"
                  onClick={() => handleChange('gateway', gateway.id)}
                  className={`p-6 rounded-[15px] border text-left transition-all flex items-center gap-4 ${
                    formData.gateway === gateway.id 
                      ? "bg-va-black text-white border-va-black shadow-aura-lg" 
                      : "bg-va-off-white text-va-black/40 border-transparent hover:border-black/10"
                  }`}
                >
                  <span className="text-2xl">{gateway.icon}</span>
                  <span className="font-light tracking-tight">{gateway.name}</span>
                </button>
              ))}
            </div>

            {formData.gateway === 'mollie' && (
              <div className="pt-6 border-t border-black/5">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {paymentMethods.map((method) => (
                    <button
                      key={method.id}
                      type="button"
                      onClick={() => setSelectedMethod(method.id)}
                      className={`flex flex-col items-center gap-3 p-4 rounded-[15px] border-2 transition-all ${
                        selectedMethod === method.id ? 'border-primary bg-primary/5' : 'border-black/5 hover:border-black/10'
                      }`}
                    >
                      <Image 
                        src={method.image.size2x} 
                        alt={method.description} 
                        width={64} 
                        height={32} 
                        className="h-8 object-contain" 
                      />
                      <span className="font-light tracking-widest text-[15px] text-va-black/60 ">
                        <VoiceglotText translationKey={`checkout.method.${method.id}`} defaultText={method.description} />
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </>
      ) : (
        <div className="p-8 bg-primary/5 rounded-[20px] border border-primary/10 flex items-center gap-6 animate-fade-in">
          <div className="w-14 h-14 bg-white rounded-[10px] flex items-center justify-center text-primary shadow-sm">
            <Sparkles strokeWidth={1.5} size={28} />
          </div>
          <div>
            <h4 className="text-lg font-light tracking-tight">
              <VoiceglotText translationKey="checkout.ready_to_send.title" defaultText="Klaar voor verzending" />
            </h4>
            <p className="text-sm text-va-black/40 font-light leading-relaxed">
              <VoiceglotText 
                translationKey="checkout.ready_to_send.desc" 
                defaultText={`Je staat op het punt een officiële offerte te sturen naar ${formData.email}. In de volgende stap kun je de begeleidende e-mail personaliseren.`} 
              />
            </p>
          </div>
        </div>
      )}

      {state.journey === 'academy' && (
        <div className="pt-4 pb-4">
          <label className="flex items-start gap-3 cursor-pointer group">
            <div className="pt-1">
              <input 
                type="checkbox" 
                checked={agreedToTerms}
                onChange={(e) => setAgreedToTerms(e.target.checked)}
                className="w-5 h-5 rounded border-2 border-black/10 text-primary focus:ring-primary/20 transition-all"
              />
            </div>
            <span className="text-[15px] text-va-black/40 font-light leading-relaxed group-hover:text-va-black transition-colors">
              <VoiceglotText 
                translationKey="checkout.academy.terms" 
                defaultText="Ik ga akkoord met de algemene voorwaarden en begrijp dat mijn herroepingsrecht vervalt zodra ik toegang krijg tot de digitale leeromgeving." 
              />
            </span>
          </label>
        </div>
      )}

      <AcademyUpsellSection />

      <div className="pt-4">
        <ButtonInstrument 
          onClick={() => formData.isQuote ? setIsPreviewOpen(true) : handleSubmit()}
          disabled={isSubmitting || (state.journey === 'academy' && !agreedToTerms)}
          className={`w-full va-btn-pro !py-8 text-lg !rounded-[10px] !bg-va-black !text-white flex items-center justify-center gap-3 group ${(isSubmitting || (state.journey === 'academy' && !agreedToTerms)) ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {isSubmitting ? (
            <><Loader2 className="animate-spin" size={24} /> <VoiceglotText translationKey="common.processing" defaultText="Verwerken..." /></>
          ) : formData.isQuote ? (
            <><VoiceglotText translationKey="checkout.cta.quote" defaultText="Preview Offerte E-mail" /> <Send strokeWidth={1.5} size={20} /></>
          ) : (
            <>
              <VoiceglotText translationKey="checkout.cta.pay" defaultText={`Nu Betalen via ${selectedMethod.charAt(0).toUpperCase() + selectedMethod.slice(1)}`} />
              <Send strokeWidth={1.5} size={20} className="group-hover:translate-x-1 transition-transform" />
            </>
          )}
        </ButtonInstrument>
        <p className="text-center text-[15px] font-light tracking-widest text-va-black/20 mt-6">
          Door af te ronden ga je akkoord met onze algemene voorwaarden.
        </p>
      </div>

      <EmailPreviewModal 
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        onSend={(msg) => handleSubmit(msg)}
        customerName={`${formData.first_name} ${formData.last_name}`}
        totalAmount={String(state.pricing?.total || '0')}
        items={state.items || []}
      />
    </div>
  );
};
