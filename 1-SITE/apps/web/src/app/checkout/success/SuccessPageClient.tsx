"use client";

import { BentoCard, BentoGrid } from '@/components/ui/BentoGrid';
import {
    ButtonInstrument,
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
import Image from 'next/image';

/**
 *  CHECKOUT SUCCESS PAGE (NUCLEAR)
 * 
 * Doel: Bevestiging van betaling, vieren van vakmanschap, 
 * en direct doorsturen naar de volgende stap in de journey.
 */
export default function SuccessPageClient() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { playClick } = useSonicDNA();
  const orderId = searchParams.get('orderId');
  const secureToken = searchParams.get('token');
  const [isVerifying, setIsVerifying] = useState(true);

  useEffect(() => {
    if (orderId) {
      // Speel succes geluid
      playClick('success');
      
      // Simuleer korte verificatie van de webhook status
      const timer = setTimeout(() => {
        setIsVerifying(false);
      }, 2000);
      
      return () => clearTimeout(timer);
    }
  }, [orderId, playClick]);

  if (isVerifying) return <LoadingScreenInstrument />;

  return (
    <PageWrapperInstrument className="min-h-[80vh] flex items-center justify-center p-6 relative overflow-hidden">
      {/* Celebration Aura */}
      <ContainerInstrument className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/10 rounded-[20px] blur-[120px] animate-pulse" />

      <ContainerInstrument className="max-w-2xl text-center space-y-8 relative z-10">
        <ContainerInstrument className="w-24 h-24 bg-green-500/10 text-green-500 rounded-[20px] flex items-center justify-center mx-auto animate-in zoom-in duration-700">
          <Image  src="/assets/common/branding/icons/INFO.svg" width={48} height={48} alt="" style={{ filter: 'invert(18%) sepia(91%) saturate(6145%) hue-rotate(332deg) brightness(95%) contrast(105%)' }} />
        </ContainerInstrument>
        
        <ContainerInstrument className="space-y-2">
          <HeadingInstrument level={1} className="text-6xl md:text-7xl font-light tracking-tighter leading-none text-va-black"><VoiceglotText  translationKey="checkout.success.title" defaultText="Gelukt!" /><TextInstrument className="text-va-black/40 font-light text-[15px]"><VoiceglotText  
              translationKey="checkout.success.subtitle" 
              defaultText={`Je bestelling #${orderId} is succesvol ontvangen. We sturen je direct een bevestigingsmail met alle details.`} 
            /></TextInstrument></HeadingInstrument>
        </ContainerInstrument>

        <ContainerInstrument className="bg-primary/5 p-4 rounded-[10px] inline-block">
          <TextInstrument className="text-[15px] font-light tracking-widest text-primary animate-pulse"><VoiceglotText  
              translationKey="checkout.success.delivery.info" 
              defaultText={searchParams.get('delivery') ? `Verwachte levering: ${searchParams.get('delivery')}` : "Verwachte levering: binnen 48 uur"} 
            /></TextInstrument>
        </ContainerInstrument>

        <BentoGrid strokeWidth={1.5} columns={2} className="pt-8">
          <BentoCard span="sm" className="bg-white border border-black/5 p-8 rounded-[20px] text-left space-y-4">
            <ContainerInstrument className="w-10 h-10 bg-primary/10 text-primary rounded-[10px] flex items-center justify-center">
              <Image  src="/assets/common/branding/icons/CART.svg" width={20} height={20} alt="" style={{ filter: 'invert(18%) sepia(91%) saturate(6145%) hue-rotate(332deg) brightness(95%) contrast(105%)' }} />
            </ContainerInstrument>
            <HeadingInstrument level={3} className="text-xl font-light tracking-tight text-va-black">
              <VoiceglotText  translationKey="checkout.success.status.title" defaultText="Status" />
              <TextInstrument className="text-[15px] text-va-black/40 font-light leading-relaxed">
                <VoiceglotText  
                  translationKey="checkout.success.status.text" 
                  defaultText={searchParams.get('method') === 'banktransfer' 
                    ? "Je bestelling staat in de wacht tot de factuur is voldaan. Zodra de betaling binnen is, gaan we direct voor je aan de slag."
                    : "Je ontvangt binnen enkele minuten een bevestiging per e-mail. Je kunt de voortgang ook volgen in je dashboard."
                  } 
                />
              </TextInstrument>
            </HeadingInstrument>
            <ButtonInstrument as={Link} href="/account/orders" className="text-[15px] font-light tracking-widest text-primary flex items-center gap-2 hover:gap-3 transition-all">
              <VoiceglotText  translationKey="checkout.success.status.cta" defaultText="Mijn bestellingen" />
              <Image  src="/assets/common/branding/icons/FORWARD.svg" width={12} height={12} alt="" style={{ filter: 'invert(18%) sepia(91%) saturate(6145%) hue-rotate(332deg) brightness(95%) contrast(105%)' }} />
            </ButtonInstrument>
          </BentoCard>

          <BentoCard span="sm" className="bg-va-black text-white p-8 rounded-[20px] text-left space-y-4 relative overflow-hidden">
            <ContainerInstrument className="w-10 h-10 bg-primary text-va-black rounded-[10px] flex items-center justify-center relative z-10">
              <Image  src="/assets/common/branding/icons/INFO.svg" width={20} height={20} alt="" className="brightness-0 invert" />
            </ContainerInstrument>
            <HeadingInstrument level={3} className="text-xl font-light tracking-tight relative z-10 text-white">
              <VoiceglotText  translationKey="checkout.success.next.title" defaultText="Volgende stap" />
              <TextInstrument className="text-white/40 text-[15px] font-light leading-relaxed relative z-10">
                <VoiceglotText  
                  translationKey="checkout.success.next.text" 
                  defaultText={secureToken 
                    ? "Je hebt direct toegang tot je nieuwe project. Klik hieronder om meteen te starten." 
                    : "Wil je alvast een volgend project voorbereiden of je stem-techniek aanscherpen in de Academy?"
                  } 
                />
              </TextInstrument>
            </HeadingInstrument>
            <Link  
              href={secureToken ? `/api/auth/magic-login?token=${secureToken}&redirect=/cockpit` : "/academy"} 
              className="va-btn-pro !bg-primary !py-3 w-full text-center relative z-10 !rounded-[10px]"
            ><VoiceglotText  
                translationKey="checkout.success.next.cta" 
                defaultText={secureToken ? "Direct naar Cockpit" : "Naar de Academy"} 
              /></Link>
            <ContainerInstrument className="absolute -bottom-10 -right-10 w-32 h-32 bg-primary/10 rounded-[20px] blur-3xl" />
          </BentoCard>
        </BentoGrid>
        </ContainerInstrument>

        <ContainerInstrument className="pt-8">
          <Link  href="/" className="text-[15px] font-light tracking-widest text-va-black/20 hover:text-primary transition-colors"><VoiceglotText  translationKey="checkout.success.back_home" defaultText="Terug naar de homepagina" /></Link>
        </ContainerInstrument>
    </PageWrapperInstrument>
  );
}
