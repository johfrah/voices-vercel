"use client";

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { 
  PageWrapperInstrument, 
  SectionInstrument, 
  ContainerInstrument, 
  HeadingInstrument, 
  TextInstrument, 
  ButtonInstrument,
  LoadingScreenInstrument
} from '@/components/ui/LayoutInstruments';
import { VoiceglotText } from '@/components/ui/VoiceglotText';
import { BentoGrid, BentoCard } from '@/components/ui/BentoGrid';
import { CheckCircle2, ArrowRight, ShoppingBag, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { useSonicDNA } from '@/lib/sonic-dna';

/**
 * 🎊 CHECKOUT SUCCESS PAGE (NUCLEAR)
 * 
 * Doel: Bevestiging van betaling, vieren van vakmanschap, 
 * en direct doorsturen naar de volgende stap in de journey.
 */
export default function SuccessPageClient() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { playClick } = useSonicDNA();
  const orderId = searchParams.get('orderId');
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
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[120px] animate-pulse" />

      <ContainerInstrument className="max-w-2xl text-center space-y-8 relative z-10">
        <ContainerInstrument className="w-24 h-24 bg-green-500/10 text-green-500 rounded-full flex items-center justify-center mx-auto animate-in zoom-in duration-700">
          <CheckCircle2 strokeWidth={1.5} size={48} />
        </ContainerInstrument>
        
        <ContainerInstrument className="space-y-2">
          <HeadingInstrument level={1} className="text-6xl md:text-7xl font-black tracking-tighter leading-none text-va-black">
            <VoiceglotText translationKey="checkout.success.title" defaultText="Gelukt!" />
          </HeadingInstrument>
            <TextInstrument className="text-va-black/40 font-medium text-lg">
            <VoiceglotText 
              translationKey="checkout.success.subtitle" 
              defaultText={`Je bestelling #${orderId} is succesvol ontvangen. We sturen je direct een bevestigingsmail met alle details.`} 
            />
          </TextInstrument>
        </ContainerInstrument>

        <ContainerInstrument className="bg-primary/5 p-4 rounded-2xl inline-block">
          <TextInstrument className="text-[15px] font-black tracking-widest text-primary animate-pulse">
            <VoiceglotText 
              translationKey="checkout.success.delivery.info" 
              defaultText={searchParams.get('delivery') ? `Verwachte levering: ${searchParams.get('delivery')}` : "Verwachte levering: Binnen 48 uur"} 
            />
          </TextInstrument>
        </ContainerInstrument>

        <BentoGrid columns={2} className="pt-8">
          <BentoCard span="sm" className="bg-white border border-black/5 p-8 rounded-[32px] text-left space-y-4">
            <div className="w-10 h-10 bg-primary/10 text-primary rounded-xl flex items-center justify-center">
              <ShoppingBag size={20} />
            </div>
            <HeadingInstrument level={3} className="text-xl font-black tracking-tight">
              <VoiceglotText translationKey="checkout.success.status.title" defaultText="Status" />
            </HeadingInstrument>
            <TextInstrument className="text-[15px] text-va-black/40 font-medium leading-relaxed">
              <VoiceglotText 
                translationKey="checkout.success.status.text" 
                defaultText={searchParams.get('method') === 'banktransfer' 
                  ? "Je bestelling staat in de wacht tot de factuur is voldaan. Zodra de betaling binnen is, gaan we direct voor je aan de slag."
                  : "Je ontvangt binnen enkele minuten een bevestiging per e-mail. Je kunt de voortgang ook volgen in je dashboard."
                } 
              />
            </TextInstrument>
            <Link href="/account/orders" className="text-[15px] font-black tracking-widest text-primary flex items-center gap-2 hover:gap-3 transition-all">
              <VoiceglotText translationKey="checkout.success.status.cta" defaultText="Mijn Bestellingen" /> <ArrowRight strokeWidth={1.5} size={12} />
            </Link>
          </BentoCard>

          <BentoCard span="sm" className="bg-va-black text-white p-8 rounded-[32px] text-left space-y-4 relative overflow-hidden">
            <div className="w-10 h-10 bg-primary text-va-black rounded-xl flex items-center justify-center relative z-10">
              <Sparkles strokeWidth={1.5} size={20} />
            </div>
            <HeadingInstrument level={3} className="text-xl font-black tracking-tight relative z-10">
              <VoiceglotText translationKey="checkout.success.next.title" defaultText="Volgende Stap" />
            </HeadingInstrument>
            <TextInstrument className="text-white/40 text-[15px] font-medium leading-relaxed relative z-10">
              <VoiceglotText translationKey="checkout.success.next.text" defaultText="Wil je alvast een volgend project voorbereiden of je stem-techniek aanscherpen in de Academy?" />
            </TextInstrument>
            <Link href="/academy" className="va-btn-pro !bg-primary !py-3 w-full text-center relative z-10">
              <VoiceglotText translationKey="checkout.success.next.cta" defaultText="Naar de Academy" />
            </Link>
            <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-primary/10 rounded-full blur-3xl" />
          </BentoCard>
        </BentoGrid>

        <ContainerInstrument className="pt-8">
          <Link href="/" className="text-[15px] font-black tracking-widest text-va-black/20 hover:text-primary transition-colors">
            <VoiceglotText translationKey="checkout.success.back_home" defaultText="Terug naar de homepagina" />
          </Link>
        </ContainerInstrument>
      </ContainerInstrument>
    </PageWrapperInstrument>
  );
}
