"use client";

import { ArrowRight, Heart, Mic, Zap } from "lucide-react";
import Link from "next/link";
import React from 'react';
import { BentoCard, BentoGrid } from "./BentoGrid";
import { VoiceglotText } from "./VoiceglotText";
import { ContainerInstrument, HeadingInstrument, TextInstrument } from "./LayoutInstruments";

/**
 * BENTO SHOWCASE INSTRUMENT
 */
export const BentoShowcaseInstrument: React.FC<{ customerDNA?: any }> = ({ customerDNA }) => {
  const detectedSector = customerDNA?.intelligence?.detectedSector;
  const lastIntent = customerDNA?.intelligence?.lastIntent;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "name": "Voices Platform Features",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Persoonlijke Casting"
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": "Snelheid"
      },
      {
        "@type": "ListItem",
        "position": 3,
        "name": "Kwaliteit"
      }
    ],
    "_llm_context": {
      "intent": "feature_discovery",
      "persona": "Musical Confidant",
      "capabilities": ["browse_features", "understand_value_prop"],
      "customer_dna": customerDNA ? "active" : "none",
      "lexicon": {
        "feature": "Kracht",
        "casting": "Selectie",
        "speed": "Snelheid"
      }
    }
  };

  return (
    <BentoGrid className="mb-32">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      
      {/* 🚀 DYNAMIC MAIN CARD: Verandert op basis van DNA */}
      {detectedSector === 'it' || lastIntent === 'telephony' ? (
        <BentoCard span="xl" className="h-[500px] flex flex-col justify-between group overflow-hidden relative p-12 bg-va-black text-white border-none shadow-aura">
          <ContainerInstrument className="relative z-10">
            <ContainerInstrument className="w-16 h-16 bg-primary rounded-[24px] flex items-center justify-center text-va-black mb-8 shadow-lg shadow-primary/20">
              <Zap size={32} fill="currentColor" />
            </ContainerInstrument>
            <HeadingInstrument level={3} className="text-5xl font-black uppercase tracking-tighter mb-6 leading-none text-primary">
              <VoiceglotText translationKey="home.showcase.telephony.title" defaultText="Slimme Telefonie" />
            </HeadingInstrument>
            <TextInstrument className="text-white/40 font-medium max-w-sm text-lg">
              <VoiceglotText 
                translationKey="home.showcase.telephony.description" 
                defaultText="Ik zag dat je interesse hebt in telefonie. Onze IVR-experts staan klaar om jouw centrale naar een hoger niveau te tillen." 
              />
            </TextInstrument>
          </ContainerInstrument>
          <ContainerInstrument className="relative z-10 flex gap-4">
            <Link href="/ivr" className="va-btn-pro flex items-center gap-3 !bg-primary !text-va-black">
              <VoiceglotText translationKey="home.showcase.telephony.cta" defaultText="Configureer je keuzemenu" /> <ArrowRight size={18} />
            </Link>
          </ContainerInstrument>
          <div className="absolute -bottom-40 -right-40 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[120px]" />
        </BentoCard>
      ) : (
        <BentoCard span="xl" className="h-[500px] flex flex-col justify-between group overflow-hidden relative p-12 bg-white border border-black/[0.03] shadow-aura">
          <ContainerInstrument className="relative z-10">
            <ContainerInstrument className="w-16 h-16 bg-primary rounded-[24px] flex items-center justify-center text-white mb-8 shadow-lg shadow-primary/10">
              <Mic size={32} />
            </ContainerInstrument>
            <HeadingInstrument level={3} className="text-5xl font-black uppercase tracking-tighter mb-6 leading-none text-va-black">
              <VoiceglotText translationKey="home.showcase.casting.title" defaultText="Persoonlijke Casting" />
            </HeadingInstrument>
            <TextInstrument className="text-va-black/40 font-medium max-w-sm text-lg">
              <VoiceglotText translationKey="home.showcase.casting.description" defaultText="Luister naar demo's. Filter op karakter. Vind direct de match voor jouw project." />
            </TextInstrument>
          </ContainerInstrument>
          <ContainerInstrument className="relative z-10 flex gap-4">
            <Link href="/agency" className="va-btn-pro flex items-center gap-3 !bg-va-dark-soft">
              <VoiceglotText translationKey="home.showcase.casting.cta" defaultText="Start jouw zoektocht" /> <ArrowRight size={18} />
            </Link>
          </ContainerInstrument>
          <ContainerInstrument className="absolute -bottom-40 -right-40 w-[600px] h-[600px] bg-primary/3 rounded-full blur-[120px] group-hover:bg-primary/6 transition-all duration-1000" />
        </BentoCard>
      )}

      <ContainerInstrument className="space-y-8">
        <BentoCard span="sm" className="bg-va-dark-soft text-white p-8 flex flex-col justify-between h-[240px] border-none">
          <ContainerInstrument>
            <Zap className="text-primary mb-4" size={24} fill="currentColor" />
            <HeadingInstrument level={3} className="text-xl font-black uppercase tracking-tight mb-2 text-primary">
              <VoiceglotText translationKey="home.showcase.speed.title" defaultText="Snelheid" />
            </HeadingInstrument>
            <TextInstrument className="text-white/60 text-xs font-medium leading-relaxed">
              <VoiceglotText translationKey="home.showcase.speed.description" defaultText="Opnames in topkwaliteit. Vaak al binnen 24 uur geleverd." />
            </TextInstrument>
          </ContainerInstrument>
          <TextInstrument className="text-[9px] font-black uppercase tracking-[0.2em] text-white/30">
            <VoiceglotText translationKey="home.showcase.speed.footer" defaultText="Directe levering" />
          </TextInstrument>
        </BentoCard>

        <BentoCard span="sm" className="hred text-white p-8 flex flex-col justify-between h-[240px] border-none">
          <ContainerInstrument>
            <Heart className="mb-4 text-white" size={24} fill="currentColor" />
            <HeadingInstrument level={3} className="text-xl font-black uppercase tracking-tight mb-2">
              <VoiceglotText translationKey="home.showcase.quality.title" defaultText="Kwaliteit" />
            </HeadingInstrument>
            <TextInstrument className="text-white/90 text-xs font-medium leading-relaxed">
              <VoiceglotText translationKey="home.showcase.quality.description" defaultText="Wij werken alleen met stemacteurs die hun vak verstaan." />
            </TextInstrument>
          </ContainerInstrument>
          <TextInstrument className="text-[9px] font-black uppercase tracking-[0.2em] text-white/50">
            <VoiceglotText translationKey="home.showcase.quality.footer" defaultText="Geselecteerde stemmen" />
          </TextInstrument>
        </BentoCard>
      </ContainerInstrument>
    </BentoGrid>
  );
};
