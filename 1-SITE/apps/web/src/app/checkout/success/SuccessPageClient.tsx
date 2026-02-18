"use client";

import {
    ContainerInstrument,
    HeadingInstrument,
    LoadingScreenInstrument,
    PageWrapperInstrument,
    TextInstrument
} from '@/components/ui/LayoutInstruments';
import { VoiceglotText } from '@/components/ui/VoiceglotText';
import { useSonicDNA } from '@/lib/sonic-dna';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { CheckCircle2, ShoppingBag, Zap, Clock, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCheckout } from '@/contexts/CheckoutContext';

/**
 *  CHECKOUT SUCCESS PAGE (NUCLEAR 2026)
 * 
 * Doel: Bevestiging van betaling, vieren van vakmanschap, 
 * en direct doorsturen naar de volgende stap in de journey via Magic Login.
 */
export default function SuccessPageClient() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { playClick } = useSonicDNA();
  const { state } = useCheckout();
  const orderId = searchParams.get('orderId');
  const secureToken = searchParams.get('token');
  const [isVerifying, setIsVerifying] = useState(true);

  useEffect(() => {
    if (orderId) {
      playClick('success');
      
      // CHRIS-PROTOCOL: Zero-Friction Redirection
      // We sturen de gebruiker na 3 seconden automatisch door naar hun account/bestelling
      const timer = setTimeout(() => {
        const targetUrl = secureToken 
          ? `/api/auth/magic-login?token=${secureToken}&redirect=/account/orders?orderId=${orderId}` 
          : `/account/orders?orderId=${orderId}`;
        
        router.push(targetUrl);
      }, 3000);
      
      // Simuleer korte verificatie voor de UI
      const verifyTimer = setTimeout(() => {
        setIsVerifying(false);
      }, 1000);
      
      return () => {
        clearTimeout(timer);
        clearTimeout(verifyTimer);
      };
    }
  }, [orderId, secureToken, router, playClick]);

  if (isVerifying) return <LoadingScreenInstrument message="Bestelling verifiëren..." />;

  return (
    <PageWrapperInstrument className="min-h-screen flex flex-col items-center justify-center p-6 relative overflow-hidden bg-va-off-white">
      {/* Celebration Aura (Ademing-feel) */}
      <ContainerInstrument className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-[140px] animate-pulse pointer-events-none" />

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
              defaultText={`Je bestelling #${orderId} is succesvol ontvangen. We sturen je direct een bevestigingsmail met alle details.`} 
            />
          </TextInstrument>
        </ContainerInstrument>

        <ContainerInstrument className="inline-flex items-center gap-3 px-6 py-3 bg-white/50 backdrop-blur-md border border-va-black/5 rounded-full shadow-sm">
          <Clock size={16} className="text-primary animate-pulse" />
          <TextInstrument className="text-[13px] font-bold tracking-[0.2em] text-primary uppercase">
            <VoiceglotText  
              translationKey="checkout.success.delivery.info" 
              defaultText={searchParams.get('delivery') 
                ? `Verwachte levering: ${searchParams.get('delivery')}` 
                : state.selectedActor?.delivery_time 
                  ? `Verwachte levering: ${state.selectedActor.delivery_time}`
                  : "Verwachte levering: binnen 48 uur"} 
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
                <ShoppingBag size={32} strokeWidth={1.5} />
              </div>
              <div className="space-y-3">
                <HeadingInstrument level={3} className="text-3xl font-light tracking-tight text-va-black Raleway">
                  <VoiceglotText translationKey="checkout.success.primary.title" defaultText="Jouw project staat klaar" />
                </HeadingInstrument>
                <TextInstrument className="text-[16px] text-va-black/40 font-light leading-relaxed max-w-sm mx-auto">
                  <VoiceglotText  
                    translationKey="checkout.success.primary.text" 
                    defaultText="Je kunt direct de status van je opname volgen, je script bekijken en facturen downloaden in je account."
                  />
                </TextInstrument>
              </div>
              
              <Link  
                href={secureToken ? `/api/auth/magic-login?token=${secureToken}&redirect=/account/orders?orderId=${orderId}` : `/account/orders?orderId=${orderId}`} 
                className="va-btn-pro !bg-va-black !text-white !py-6 px-12 w-full text-center !rounded-[20px] font-bold tracking-widest uppercase text-[13px] hover:!bg-primary transition-all shadow-aura-lg group/btn"
              >
                <span className="flex items-center justify-center gap-3">
                  <VoiceglotText translationKey="checkout.success.primary.cta" defaultText="Bekijk mijn bestelling" />
                  <ArrowRight size={18} className="group-hover/btn:translate-x-1 transition-transform" />
                </span>
              </Link>
            </div>
            
            {/* Subtle background detail */}
            <div className="absolute -bottom-12 -right-12 w-48 h-48 bg-primary/5 rounded-full blur-3xl group-hover:bg-primary/10 transition-colors" />
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
