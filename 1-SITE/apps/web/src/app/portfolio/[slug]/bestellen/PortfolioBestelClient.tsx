"use client";

import { useCheckout } from "@/contexts/CheckoutContext";
import { useEffect, useState } from "react";
import ConfiguratorPageClient from "@/app/checkout/configurator/ConfiguratorPageClient";
import CheckoutPageClient from "@/app/checkout/CheckoutPageClient";
import { MobileCheckoutSheet } from "@/components/checkout/MobileCheckoutSheet";
import { PageWrapperInstrument, SectionInstrument, ContainerInstrument, HeadingInstrument, TextInstrument } from "@/components/ui/LayoutInstruments";
import { motion } from "framer-motion";
import { Zap, ArrowLeft } from "lucide-react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { Suspense } from "react";
import { VoiceglotText } from "@/components/ui/VoiceglotText";

//  NUCLEAR LOADING MANDATE
const LiquidBackground = dynamic(() => import("@/components/ui/LiquidBackground").then(mod => mod.LiquidBackground), { ssr: false });

export function PortfolioBestelClient({ actor }: { actor: any }) {
  const { state, setStep, selectActor } = useCheckout();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function initOrder() {
      selectActor(actor);
      setStep('briefing');
      setLoading(false);
    }
    initOrder();
  }, [actor, selectActor, setStep]);

  if (loading) return null;

  return (
    <PageWrapperInstrument className="min-h-screen bg-va-off-white selection:bg-primary selection:text-white">
      <Suspense fallback={null}>
        <LiquidBackground strokeWidth={1.5} />
      </Suspense>
      
      <SectionInstrument className="pt-32 pb-24">
        <ContainerInstrument className="max-w-7xl mx-auto px-6">
          
          {/* Header & Navigatie terug */}
          <ContainerInstrument className="mb-12 flex flex-col md:flex-row md:items-center justify-between gap-8">
            <ContainerInstrument className="space-y-4">
              <Link 
                href={`/portfolio/${actor.slug}`} 
                className="inline-flex items-center gap-2 text-va-black/40 hover:text-primary transition-colors text-sm font-medium group"
              >
                <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                <VoiceglotText translationKey="portfolio.bestellen.back" defaultText="Terug naar portfolio" />
              </Link>
              <ContainerInstrument className="flex items-center gap-4">
                <ContainerInstrument className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shadow-sm border border-primary/5">
                  <Zap size={24} fill="currentColor" />
                </ContainerInstrument>
                <HeadingInstrument level={1} className="text-4xl md:text-5xl font-extralight tracking-tighter text-va-black">
                  <VoiceglotText translationKey="portfolio.bestellen.title" defaultText="Start je project" /> <span className="text-primary/30 italic">met {actor.display_name}</span>
                </HeadingInstrument>
              </ContainerInstrument>
            </ContainerInstrument>
            
            <ContainerInstrument className="hidden md:block">
              <TextInstrument className="text-[11px] font-bold tracking-widest text-va-black/20 uppercase">
                <VoiceglotText translationKey="portfolio.bestellen.usp" defaultText="Direct bestellen • Snelle levering • 100% kwaliteit" />
              </TextInstrument>
            </ContainerInstrument>
          </ContainerInstrument>

          {/* De Configurator Flow */}
          <ContainerInstrument className="bg-white/40 backdrop-blur-sm rounded-[40px] border border-black/[0.03] shadow-aura-lg overflow-hidden">
            <ContainerInstrument className="p-8 md:p-12">
              {state.step === 'briefing' ? (
                <ConfiguratorPageClient 
                  isEmbedded={true} 
                  hideVoiceCard={false} 
                  hideUsageSelector={false}
                  minimalMode={true}
                />
              ) : (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-8"
                >
                  <CheckoutPageClient />
                  <MobileCheckoutSheet />
                </motion.div>
              )}
            </ContainerInstrument>
          </ContainerInstrument>

        </ContainerInstrument>
      </SectionInstrument>
    </PageWrapperInstrument>
  );
}
