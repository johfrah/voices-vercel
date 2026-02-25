"use client";

import { ContainerInstrument, HeadingInstrument, PageWrapperInstrument, TextInstrument } from "@/components/ui/LayoutInstruments";
import { VoiceglotText } from "@/components/ui/VoiceglotText";
import { useSonicDNA } from "@/lib/engines/sonic-dna";
import { motion } from "framer-motion";
import { Mail, ArrowRight } from "lucide-react";
import { Suspense } from "react";
import nextDynamic from "next/dynamic";
import { VoicesLink } from "@/components/ui/VoicesLink";
import { useCallback } from 'react';

import { MarketManagerServer as MarketManager } from "@/lib/system/market-manager-server";

const LiquidBackground = nextDynamic(() => import("@/components/ui/LiquidBackground").then(mod => mod.LiquidBackground), { 
  ssr: false,
  loading: () => <div className="fixed inset-0 z-0 bg-va-off-white" />
});

export default function UnderConstructionPage() {
  const sonic = useSonicDNA();
  const playClick = useCallback((type?: any) => {
    try { sonic.playClick(type); } catch (e) {}
  }, [sonic]);

  return (
    <main className="min-h-screen bg-va-off-white relative flex items-center justify-center overflow-hidden">
      <Suspense fallback={null}>
        <LiquidBackground strokeWidth={1.5} />
      </Suspense>

      <ContainerInstrument plain className="max-w-4xl mx-auto px-6 relative z-50 text-center space-y-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.23, 1, 0.32, 1] }}
          className="space-y-6"
        >
          <div className="inline-flex items-center gap-3 px-4 py-1.5 bg-primary/10 rounded-full mb-4">
            <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            <TextInstrument className="text-[11px] font-bold tracking-[0.2em] text-primary uppercase">
              Coming Soon
            </TextInstrument>
          </div>
          
          <HeadingInstrument level={1} className="text-6xl md:text-8xl font-light tracking-tighter leading-[0.9] text-va-black">
            We bouwen aan de <span className="text-primary italic">toekomst</span> van stemmen.
          </HeadingInstrument>
          
          <TextInstrument className="text-xl md:text-2xl font-light text-va-black/40 max-w-2xl mx-auto leading-relaxed">
            Onze nieuwe site is bijna klaar. Tot die tijd kun je alvast onze stemmen bekijken via onze light-versie.
          </TextInstrument>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: [0.23, 1, 0.32, 1] }}
          className="flex flex-col sm:flex-row items-center justify-center gap-6"
        >
          <VoicesLink 
            href="/light"
            onClick={() => playClick('pro')}
            className="group bg-va-black text-white px-10 py-5 rounded-full font-bold tracking-widest uppercase text-sm flex items-center gap-3 hover:scale-105 transition-all shadow-2xl"
          >
            Bekijk stemmen (Light)
            <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
          </VoicesLink>

          <a 
            href={`mailto:${MarketManager.getCurrentMarket().email}`}
            onClick={() => playClick('soft')}
            className="group bg-white text-va-black border border-black/5 px-10 py-5 rounded-full font-bold tracking-widest uppercase text-sm flex items-center gap-3 hover:bg-va-off-white transition-all shadow-lg"
          >
            <Mail size={18} />
            Contacteer ons
          </a>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.5 }}
          className="pt-12"
        >
          <TextInstrument className="text-[10px] font-bold tracking-[0.3em] text-va-black/20 uppercase">
            Voices © 2026 • De Bob-methode
          </TextInstrument>
        </motion.div>
      </ContainerInstrument>

      {/* Decorative elements */}
      <div className="absolute -bottom-20 -left-20 w-96 h-96 bg-primary/5 rounded-full blur-[100px] -z-10" />
      <div className="absolute -top-20 -right-20 w-96 h-96 bg-primary/5 rounded-full blur-[100px] -z-10" />
    </main>
  );
}
