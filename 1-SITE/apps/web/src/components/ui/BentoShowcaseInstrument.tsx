"use client";

import Image from "next/image";
import Link from "next/link";
import { BentoCard, BentoGrid } from "./BentoGrid";
import { ContainerInstrument, HeadingInstrument, TextInstrument } from "./LayoutInstruments";
import { VoiceglotText } from "./VoiceglotText";
import { Zap, ArrowRight, Mic, Clock, Star } from "lucide-react";

import { useTranslation } from "@/contexts/TranslationContext";

/**
 * BENTO SHOWCASE INSTRUMENT
 */
export const BentoShowcaseInstrument: React.FC<{ customerDNA?: any }> = ({ customerDNA }) => {
  const { t } = useTranslation();
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
        "name": "Gratis proefopname"
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
    <BentoGrid strokeWidth={1.5} className="mb-32">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      
      {/*  DYNAMIC MAIN CARD: Verandert op basis van DNA */}
      {detectedSector === 'it' || lastIntent === 'telephony' ? (
        <BentoCard span="xl" className="h-[500px] flex flex-col justify-between group overflow-hidden relative p-12 bg-va-black text-white border-none shadow-aura">
          <ContainerInstrument plain className="relative z-10">
            <ContainerInstrument plain className="w-16 h-16 bg-primary rounded-[15px] flex items-center justify-center text-va-black mb-8 shadow-lg shadow-primary/20">
              <Zap size={32} strokeWidth={1.5} />
            </ContainerInstrument>
            <HeadingInstrument level={3} className="text-5xl font-light tracking-tighter mb-6 leading-none text-primary "><VoiceglotText  translationKey="home.showcase.telephony.title" defaultText="Slimme Telefonie" /><TextInstrument className="text-white/40 font-light max-w-sm text-lg leading-relaxed"><VoiceglotText  
                translationKey="home.showcase.telephony.description" 
                defaultText="Ik zag dat je interesse hebt in telefonie. Onze IVR-experts staan klaar om jouw centrale naar een hoger niveau te tillen." 
              /></TextInstrument></HeadingInstrument>
          </ContainerInstrument>
          <ContainerInstrument plain className="relative z-10 flex gap-4">
            <Link  href="/ivr" className="va-btn-pro flex items-center gap-3 !bg-primary !text-va-black !rounded-[10px] !font-light !tracking-widest !"><VoiceglotText  translationKey="home.showcase.telephony.cta" defaultText="Configureer je keuzemenu" /><ArrowRight size={18} strokeWidth={1.5} /></Link>
          </ContainerInstrument>
        </BentoCard>
      ) : (
        <BentoCard span="xl" className="h-[500px] flex flex-col justify-between group overflow-hidden relative p-12 bg-white border border-black/[0.03] shadow-aura">
          <ContainerInstrument className="absolute inset-0 z-0">
            <Image  
              src="/assets/visuals/active/voicecards/1760-johfrah-photo-square-1.jpg" 
              alt={t('common.casting', "Casting")} 
              fill 
              className="object-cover opacity-10 group-hover:opacity-20 transition-opacity duration-1000"
            />
          </ContainerInstrument>
          <ContainerInstrument plain className="relative z-10">
            <ContainerInstrument plain className="w-16 h-16 bg-primary rounded-[15px] flex items-center justify-center text-white mb-8 shadow-lg shadow-primary/10">
              <Mic size={32} strokeWidth={1.5} />
            </ContainerInstrument>
            <HeadingInstrument level={3} className="text-5xl font-light tracking-tighter mb-6 leading-none text-va-black "><VoiceglotText  translationKey="home.showcase.casting.title" defaultText="Gratis proefopname" /><TextInstrument className="text-va-black/40 font-light max-w-sm text-lg leading-relaxed"><VoiceglotText  translationKey="home.showcase.casting.description" defaultText="Luister naar demo's. Filter op karakter. Ontvang een gratis proefopname voor jouw project." /></TextInstrument></HeadingInstrument>
          </ContainerInstrument>
          <ContainerInstrument plain className="relative z-10 flex gap-4">
            <Link  href="/agency" className="va-btn-pro flex items-center gap-3 !bg-va-dark-soft !rounded-[10px] !font-light !tracking-widest !"><VoiceglotText  translationKey="home.showcase.casting.cta" defaultText="Start jouw zoektocht" /><ArrowRight size={18} strokeWidth={1.5} /></Link>
          </ContainerInstrument>
        </BentoCard>
      )}

      <ContainerInstrument plain className="space-y-8">
        <BentoCard span="sm" className="bg-va-dark-soft text-white p-8 flex flex-col justify-between h-[240px] border-none !rounded-[20px]">
          <ContainerInstrument plain>
            <ContainerInstrument className="mb-4">
              <Clock size={24} strokeWidth={1.5} className="text-primary" />
            </ContainerInstrument>
            <HeadingInstrument level={3} className="text-xl font-light tracking-tight mb-2 text-primary"><VoiceglotText  translationKey="home.showcase.speed.title" defaultText="Snelheid" /><TextInstrument className="text-white/60 text-[15px] font-light leading-relaxed"><VoiceglotText  translationKey="home.showcase.speed.description" defaultText="Opnames in topkwaliteit. Vaak al binnen 24 uur geleverd." /></TextInstrument></HeadingInstrument>
          </ContainerInstrument>
          <TextInstrument className="text-[15px] font-light tracking-[0.2em] text-white/30"><VoiceglotText  translationKey="home.showcase.speed.footer" defaultText="Directe levering" /></TextInstrument>
        </BentoCard>

        <BentoCard span="sm" className="hred text-white p-8 flex flex-col justify-between h-[240px] border-none !rounded-[20px]">
          <ContainerInstrument plain>
            <ContainerInstrument className="mb-4">
              <Star size={24} strokeWidth={1.5} className="text-white fill-white" />
            </ContainerInstrument>
            <HeadingInstrument level={3} className="text-xl font-light tracking-tight mb-2"><VoiceglotText  translationKey="home.showcase.quality.title" defaultText="Kwaliteit" /><TextInstrument className="text-white/90 text-[15px] font-light leading-relaxed"><VoiceglotText  translationKey="home.showcase.quality.description" defaultText="Wij werken alleen met stemacteurs die hun vak verstaan." /></TextInstrument></HeadingInstrument>
          </ContainerInstrument>
          <TextInstrument className="text-[15px] font-light tracking-[0.2em] text-white/50"><VoiceglotText  translationKey="home.showcase.quality.footer" defaultText="Geselecteerde stemmen" /></TextInstrument>
        </BentoCard>
      </ContainerInstrument>
    </BentoGrid>
  );
};
