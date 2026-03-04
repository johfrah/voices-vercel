"use client";

import {
    ContainerInstrument,
    HeadingInstrument,
    LoadingScreenInstrument,
    PageWrapperInstrument,
    TextInstrument
} from '@/components/ui/LayoutInstruments';
import { useTranslation } from '@/contexts/TranslationContext';
import { VoiceglotText } from '@/components/ui/VoiceglotText';
import { useSonicDNA } from '@/lib/engines/sonic-dna';
import { VoicesLink as Link } from '@/components/ui/VoicesLink';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { CheckCircle2, ShoppingBag, Zap, Clock, ArrowRight, LogIn, Mail, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCheckout } from '@/contexts/CheckoutContext';
import { createClient } from '@/utils/supabase/client';

/**
 *  CHECKOUT SUCCESS PAGE (NUCLEAR 2026)
 * 
 * Doel: Bevestiging van betaling, vieren van vakmanschap, 
 * en direct doorsturen naar de volgende stap in de journey via Magic Login.
 */
export default function SuccessPageClient() {
  const searchParams = useSearchParams();
  const { t } = useTranslation();
  const router = useRouter();
  const auth = useAuth();
  const supabase = createClient();
  const { playClick } = useSonicDNA();
  const { state } = useCheckout();
  
  const orderId = searchParams?.get('orderId');
  const secureToken = searchParams?.get('token');
  const isVerificationFlow = searchParams?.get('verify') === 'true';
  const emailParam = searchParams?.get('email');
  const deliveryParam = searchParams?.get('delivery');
  const accountOrdersPath = orderId ? `/account/orders?orderId=${orderId}` : '/account/orders';
  const accountOrdersPathWithDelivery = deliveryParam
    ? `${accountOrdersPath}${accountOrdersPath.includes('?') ? '&' : '?'}delivery=${encodeURIComponent(deliveryParam)}`
    : accountOrdersPath;

  // Prevent verify flows from defaulting to a perpetual loader when hydration/effects are delayed.
  const [isVerifying, setIsVerifying] = useState(() => Boolean(orderId && !isVerificationFlow));
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [magicLinkSent, setMagicLinkSent] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  useEffect(() => {
    if (!orderId) {
      setIsVerifying(false);
      return;
    }

    const shouldAutoRedirect = !isVerificationFlow || auth.isAuthenticated;
    if (!shouldAutoRedirect) {
      // Verification flow for existing logged-out users: show login CTA immediately.
      setIsVerifying(false);
      return;
    }

    setIsVerifying(true);
    playClick('success');

    const timer = setTimeout(() => {
      const isValidToken = secureToken && secureToken !== 'undefined';
      const targetUrl = isValidToken
        ? `/api/auth/magic-login?token=${secureToken}&redirect=${encodeURIComponent(accountOrdersPathWithDelivery)}${emailParam ? `&email=${encodeURIComponent(emailParam)}` : ''}`
        : accountOrdersPathWithDelivery;

      router.push(targetUrl);
    }, 500);

    return () => clearTimeout(timer);
  }, [orderId, secureToken, router, playClick, isVerificationFlow, auth.isAuthenticated, accountOrdersPathWithDelivery, emailParam]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailParam) {
      setLoginError(t('checkout.success.verify.email_missing', 'We missen je e-mailadres in deze sessie.'));
      playClick('lock');
      return;
    }
    if (!supabase) {
      setLoginError(t('checkout.login.error_service', 'Inloggen is tijdelijk niet beschikbaar. Open je account login.'));
      playClick('lock');
      return;
    }
    
    setIsLoggingIn(true);
    setLoginError(null);
    playClick('pro');

    try {
      const response = await fetch('/api/auth/send-magic-link/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: emailParam, redirect: accountOrdersPathWithDelivery }),
      });

      const result = await response.json();

      if (!response.ok) {
        setLoginError(result.error || t('checkout.login.error_send', 'Versturen mislukt.'));
        playClick('lock');
      } else {
        playClick('success');
        setMagicLinkSent(true);
      }
    } catch (err) {
      setLoginError(t('checkout.login.error_send', 'Versturen mislukt.'));
    } finally {
      setIsLoggingIn(false);
    }
  };

  if (isVerifying) return <LoadingScreenInstrument text={t('checkout.success.verifying', 'Bestelling verifiëren...')} />;

  return (
    <PageWrapperInstrument className="min-h-screen flex flex-col items-center justify-center p-6 relative overflow-hidden bg-va-off-white">
      <ContainerInstrument className="max-w-4xl w-full text-center space-y-12 relative z-10 py-20">
        {/* Success Icon */}
        <motion.div 
          initial={{ scale: 0, rotate: -10 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", damping: 12, stiffness: 100 }}
          className="w-24 h-24 bg-white text-green-500 rounded-[20px] shadow-aura-lg flex items-center justify-center mx-auto border border-va-black/5"
        >
          <CheckCircle2 size={48} strokeWidth={1.5} className="animate-in zoom-in duration-700" />
        </motion.div>
        
        <ContainerInstrument className="space-y-4">
          <HeadingInstrument level={1} className="text-7xl md:text-8xl font-light tracking-tighter leading-none text-va-black Raleway">
            <VoiceglotText translationKey="checkout.success.title" defaultText="Gelukt!" />
          </HeadingInstrument>
          <TextInstrument className="text-[18px] md:text-[20px] text-va-black/40 font-light leading-relaxed max-w-xl mx-auto Raleway">
            <VoiceglotText  
              translationKey="checkout.success.subtitle" 
              defaultText={orderId
                ? `${t('checkout.success.subtitle_prefix', 'Je bestelling #')}${orderId} ${t('checkout.success.subtitle_suffix', 'is succesvol ontvangen. We sturen je direct een bevestigingsmail met alle details.')}`
                : t('checkout.success.subtitle_no_order', 'Je betaling is geregistreerd. Open je account om de status van je project te bekijken.')
              } 
            />
          </TextInstrument>
        </ContainerInstrument>

        <ContainerInstrument className="inline-flex items-center gap-3 px-6 py-3 bg-white/50 backdrop-blur-md border border-va-black/5 rounded-full shadow-sm">
          <Clock size={16} className="text-primary animate-pulse" />
          <TextInstrument className="text-[13px] font-bold tracking-[0.2em] text-primary uppercase">
            <VoiceglotText  
              translationKey="checkout.success.delivery.info" 
              defaultText={searchParams?.get('delivery') 
                ? `${t('checkout.success.delivery.label', "Verwachte levering:")} ${searchParams?.get('delivery')}` 
                : (state.selectedActor as any)?.delivery_time || (state.selectedActor as any)?.deliveryTime
                  ? `${t('checkout.success.delivery.label', "Verwachte levering:")} ${(state.selectedActor as any)?.delivery_time || (state.selectedActor as any)?.deliveryTime}`
                  : `${t('checkout.success.delivery.label', "Verwachte levering:")} ${t('common.within_48_hours', "binnen 48 uur")}`} 
            />
          </TextInstrument>
        </ContainerInstrument>

        <div className="max-w-xl mx-auto pt-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white border border-va-black/5 p-12 rounded-[32px] shadow-aura space-y-8 group hover:border-primary/20 transition-all relative overflow-hidden"
          >
            <div className="flex flex-col items-center text-center space-y-6 relative z-10">
              <div className="w-16 h-16 bg-primary/5 text-primary rounded-[20px] flex items-center justify-center">
                {isVerificationFlow ? <LogIn size={32} strokeWidth={1.5} /> : <ShoppingBag size={32} strokeWidth={1.5} />}
              </div>
              <div className="space-y-3">
                <HeadingInstrument level={3} className="text-3xl font-light tracking-tight text-va-black Raleway">
                  {isVerificationFlow 
                    ? <VoiceglotText translationKey="checkout.success.verify.title" defaultText="Bekijk je bestelling" />
                    : <VoiceglotText translationKey="checkout.success.primary.title" defaultText="Jouw project staat klaar" />
                  }
                </HeadingInstrument>
                <TextInstrument className="text-[16px] text-va-black/40 font-light leading-relaxed max-w-sm mx-auto">
                  {isVerificationFlow 
                    ? <VoiceglotText translationKey="checkout.success.verify.text" defaultText={`Omdat je al een account hebt bij ons (${emailParam}), vragen we je om even in te loggen om de details van deze bestelling veilig te bekijken.`} />
                    : <VoiceglotText translationKey="checkout.success.primary.text" defaultText="Je kunt direct de status van je opname volgen, je script bekijken en facturen downloaden in je account." />
                  }
                </TextInstrument>
              </div>
              
              {isVerificationFlow ? (
                <div className="w-full space-y-4">
                  {magicLinkSent ? (
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="p-6 bg-green-50 text-green-700 rounded-2xl border border-green-100 flex flex-col items-center gap-3"
                    >
                      <Mail size={24} />
                      <TextInstrument className="text-sm font-medium">
                        Check je inbox! We hebben een inlog-link gestuurd naar {emailParam || 'je e-mailadres'}.
                      </TextInstrument>
                    </motion.div>
                  ) : (
                    <form onSubmit={handleLogin} className="space-y-4">
                      <button  
                        disabled={isLoggingIn || !emailParam || !supabase}
                        className="va-btn-pro !bg-va-black !text-white !py-6 px-12 w-full text-center !rounded-[20px] font-bold tracking-widest uppercase text-[13px] hover:!bg-primary transition-all shadow-aura-lg group/btn flex items-center justify-center gap-3"
                      >
                        {isLoggingIn ? <Loader2 className="animate-spin" size={18} /> : <LogIn size={18} />}
                        <VoiceglotText translationKey="checkout.success.verify.cta" defaultText="Stuur mij een inlog-link" />
                      </button>
                      {!emailParam && (
                        <TextInstrument className="text-amber-600 text-xs">
                          <VoiceglotText
                            translationKey="checkout.success.verify.email_missing"
                            defaultText="We missen je e-mailadres in deze sessie. Open de account login en vraag daar een magic link aan."
                          />
                        </TextInstrument>
                      )}
                      {!supabase && (
                        <TextInstrument className="text-amber-600 text-xs">
                          <VoiceglotText
                            translationKey="checkout.success.verify.service_unavailable"
                            defaultText="De login-service is tijdelijk niet bereikbaar. Gebruik de account login als fallback."
                          />
                        </TextInstrument>
                      )}
                      {loginError && <TextInstrument className="text-red-500 text-xs">{loginError}</TextInstrument>}
                      <Link
                        href={`/account?redirect=${encodeURIComponent(accountOrdersPathWithDelivery)}`}
                        className="block text-center text-xs text-va-black/50 hover:text-primary transition-colors"
                      >
                        <VoiceglotText
                          translationKey="checkout.success.verify.fallback_account_login"
                          defaultText="Open account login"
                        />
                      </Link>
                    </form>
                  )}
                </div>
              ) : (
                <Link  
                  href={secureToken
                    ? `/api/auth/magic-login?token=${secureToken}&redirect=${encodeURIComponent(accountOrdersPathWithDelivery)}${emailParam ? `&email=${encodeURIComponent(emailParam)}` : ''}`
                    : accountOrdersPathWithDelivery} 
                  className="va-btn-pro !bg-va-black !text-white !py-6 px-12 w-full text-center !rounded-[20px] font-bold tracking-widest uppercase text-[13px] hover:!bg-primary transition-all shadow-aura-lg group/btn"
                >
                  <span className="flex items-center justify-center gap-3">
                    <VoiceglotText translationKey="checkout.success.primary.cta" defaultText="Bekijk mijn bestelling" />
                    <ArrowRight size={18} className="group-hover/btn:translate-x-1 transition-transform" />
                  </span>
                </Link>
              )}
            </div>
          </motion.div>
        </div>

        <ContainerInstrument className="pt-12">
          <Link  href="/" className="text-[13px] font-bold tracking-[0.2em] text-va-black/20 uppercase hover:text-primary transition-colors Raleway">
            <VoiceglotText translationKey="checkout.success.back_home" defaultText="Terug naar de homepagina" />
          </Link>
        </ContainerInstrument>
      </ContainerInstrument>
    </PageWrapperInstrument>
  );
}
