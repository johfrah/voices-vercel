"use client";

import { MarketManager } from '@config/market-manager';
import { useSonicDNA } from '@/lib/sonic-dna';
import { Construction, Mail } from "lucide-react";

import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';

import Image from 'next/image';
import { 
  ButtonInstrument, 
  ContainerInstrument, 
  HeadingInstrument, 
  SectionInstrument, 
  TextInstrument 
} from './LayoutInstruments';
import { VoiceglotText } from './VoiceglotText';
import { matTrack } from '@/lib/mat-intelligence';
import { useEffect } from 'react';

/**
 * UNDER CONSTRUCTION PAGE (2026)
 * 
 * Een minimalistisch instrument dat voldoet aan de Zero Laws.
 */
export default function UnderConstruction() {
  const market = MarketManager.getCurrentMarket();
  const { playClick, playSwell } = useSonicDNA();
  const { isAdmin } = useAuth();

  useEffect(() => {
    matTrack({
      event: 'pageview',
      intent: 'under_construction_view',
      iapContext: { market: market.market_code }
    });
  }, [market.market_code]);

  return (
    <SectionInstrument as="main" className="min-h-screen flex flex-col items-center justify-center px-4 md:px-6 relative overflow-hidden bg-va-off-white">
      {/* ⚡ ADMIN BYPASS LINK */}
      {isAdmin && (
        <ContainerInstrument className="fixed top-6 md:top-8 right-6 md:right-8 z-50">
          <ButtonInstrument  
            as={Link}
            href="/auth/login" 
            className="text-[15px] md:text-[15px] font-black tracking-widest bg-va-black text-white px-4 md:px-6 py-2 md:py-3 rounded-full hover:bg-primary transition-all shadow-lg"
            onClick={() => playClick('pro')}
          >
            <VoiceglotText  translationKey="admin.dashboard.link" defaultText="Admin Dashboard" />
          </ButtonInstrument>
        </ContainerInstrument>
      )}
      {/* 🧪 LIQUID BACKGROUND (Tone of Voice) */}
      <ContainerInstrument className="fixed inset-0 z-0 pointer-events-none opacity-40">
        <ContainerInstrument className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full hred blur-[80px] md:blur-[120px] animate-pulse" />
        <ContainerInstrument className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full hblue blur-[80px] md:blur-[120px] animate-pulse delay-1000" />
      </ContainerInstrument>

      <ContainerInstrument className="relative z-10 w-full max-w-2xl flex flex-col items-center space-y-8 md:space-y-12 animate-fade-in">
        {/* LOGO */}
        <ContainerInstrument 
          className="group cursor-pointer transition-transform duration-700 hover:scale-105"
          onMouseEnter={() => playSwell()}
          onClick={() => playClick('soft')}
        >
          <Image  
            src={market.logo_url} 
            alt={market.name} 
            width={240}
            height={96}
            className="h-12 md:h-24 w-auto drop-shadow-aura"
          />
        </ContainerInstrument>

        {/* BENTO STATUS BOX */}
        <ContainerInstrument className="w-full bg-white/80 backdrop-blur-xl border border-black/5 p-8 md:p-12 rounded-[24px] md:rounded-[32px] shadow-aura space-y-6 md:space-y-8 text-center">
          <ContainerInstrument className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full text-primary text-[15px] md:text-[15px] font-black tracking-widest border border-primary/10 ">
            <Construction strokeWidth={1.5} size={12} className="animate-pulse" /> <VoiceglotText  translationKey="construction.badge" defaultText="Voices in Aanbouw" />
          </ContainerInstrument>
          
          <HeadingInstrument level={1} className="text-3xl md:text-5xl font-medium leading-tight tracking-tight text-va-black/80">
            <VoiceglotText  translationKey="construction.title.part1" defaultText="Binnenkort een nieuwe" /> <br/>
            <TextInstrument as="span" className="text-va-black font-light"><VoiceglotText  translationKey="construction.title.part2" defaultText="ervaring voor stemmen." /></TextInstrument>
          </HeadingInstrument>

          <TextInstrument className="text-base md:text-lg text-va-black/40 font-normal leading-relaxed max-w-md mx-auto">
            <VoiceglotText  translationKey="construction.subtitle" defaultText="We werken momenteel aan ons platform." /> <br/>
            <VoiceglotText  translationKey="construction.cta_text" defaultText="Heb je nu een stem nodig?" />
          </TextInstrument>

          <ContainerInstrument className="pt-4">
            <ButtonInstrument 
              as="a"
              href={`mailto:${market.email}`}
              onMouseEnter={() => playSwell()}
              onClick={() => playClick('pro')}
              className="va-btn-pro inline-flex items-center gap-3 md:gap-4 !px-8 md:!px-12 !py-6 md:!py-8 text-base md:text-lg group"
            >
              <Mail strokeWidth={1.5} size={20} className="group-hover:rotate-12 transition-transform" />
              {market.email}
            </ButtonInstrument>
          </ContainerInstrument>
        </ContainerInstrument>

        {/* SONIC DNA INDICATOR VERWIJDERD OP VERZOEK */}
      </ContainerInstrument>

      {/* LLM Context Layer */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "WebApplication",
        "name": "Voices Under Construction",
        "description": "Voices is currently under construction",
        "data-voices-context": "Landing",
        "data-voices-intent": "Waiting",
        "_llm_context": {
          "intent": "wait_for_launch",
          "persona": "visitor",
          "market": market.market_code
        }
      })}} />
    </SectionInstrument>
  );
}
