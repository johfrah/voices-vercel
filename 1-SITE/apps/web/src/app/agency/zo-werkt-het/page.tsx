"use client";

import { 
  ContainerInstrument, 
  HeadingInstrument, 
  PageWrapperInstrument, 
  SectionInstrument, 
  TextInstrument 
} from '@/components/ui/LayoutInstruments';
import { VoiceglotText } from '@/components/ui/VoiceglotText';
import { JourneyFaq } from '@/components/ui/JourneyFaq';
import { useMasterControl } from '@/contexts/VoicesMasterControlContext';
import { ArrowRight, Mic2, Music, Zap, ShieldCheck, Phone, Video, Megaphone, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import { useMemo, Suspense } from 'react';
import { cn } from '@/lib/utils';
import { useSonicDNA } from '@/lib/sonic-dna';
import { AnimatePresence, motion } from 'framer-motion';
import dynamic from "next/dynamic";

//  NUCLEAR LOADING MANDATE
const LiquidBackground = dynamic(() => import("@/components/ui/LiquidBackground").then(mod => mod.LiquidBackground), { ssr: false });

export default function HowItWorksPage() {
  return (
    <HowItWorksContent />
  );
}

function HowItWorksContent() {
  const { state, updateJourney } = useMasterControl();
  const { playClick, playSwell } = useSonicDNA();
  
  const journeys = [
    { id: 'telephony', icon: Phone, label: 'Telefonie', subLabel: 'Voicemail & IVR', key: 'journey.telephony' },
    { id: 'video', icon: Video, subLabel: 'Corporate & Website', label: 'Video', key: 'journey.video' },
    { id: 'commercial', icon: Megaphone, label: 'Advertentie', subLabel: 'Radio, TV & Online Ads', key: 'journey.commercial' },
  ] as const;
  
  const journeyData = useMemo(() => {
    switch (state.journey) {
      case 'telephony':
        return {
          id: 'telephony',
          title: "Zo werkt het",
          subtitle: "Van script tot professionele voicemail in drie eenvoudige stappen.",
          steps: [
            {
              title: "Kies jouw stem",
              description: "Luister naar onze stemmen en kies de karakteristiek die bij je past. Meertalig? Geen probleem, veel van onze stemmen spreken hun talen vloeiend.",
              icon: Mic2,
              guarantee: "top-selectie vakmensen"
            },
            {
              title: "Script & Muziek",
              description: "Voer je prompts in of upload een script. Voeg optioneel rechtenvrije wachtmuziek toe uit onze bibliotheek voor de perfecte sfeer.",
              icon: Music,
              guarantee: "inclusief muziek-mix"
            },
            {
              title: "Snelle levering",
              description: "Na je bestelling gaan we meteen aan de slag. Elke stemacteur heeft eigen levertijden, maar we streven altijd naar de hoogste snelheid en kwaliteit.",
              icon: Zap,
              guarantee: "90% binnen 24 uur"
            }
          ]
        };
      case 'commercial':
        return {
          id: 'commercial',
          title: "Zo werkt het",
          subtitle: "High-end commercials voor radio, TV en online met de juiste impact.",
          steps: [
            {
              title: "Casting & Briefing",
              description: "Selecteer de perfecte stem en geef je briefing door. Wij adviseren direct over de juiste buyout en tone-of-voice voor jouw media.",
              icon: Mic2,
              guarantee: "directe buy-out calculatie"
            },
            {
              title: "Regie & Opname",
              description: "Kies optioneel voor een live-sessie waarbij je direct aanwijzingen geeft. Wij zorgen voor een vlijmscherpe opname in onze studio.",
              icon: Music,
              guarantee: "stemmen met autoriteit"
            },
            {
              title: "Broadcast Master",
              description: "Ontvang je audio volledig afgemixt en broadcast-ready voor alle kanalen. Wij leveren altijd in de hoogste 48kHz kwaliteit.",
              icon: Zap,
              guarantee: "broadcast-ready master"
            }
          ]
        };
      default:
        return {
          id: 'video',
          title: "Zo werkt het",
          subtitle: "De perfecte voice-over voor jouw video, exact getimed op het beeld.",
          steps: [
            {
              title: "Stem & Script",
              description: "Kies een stem die past bij je merk en upload je script. Wij berekenen direct de duur op basis van het aantal woorden.",
              icon: Mic2,
              guarantee: "technisch perfect (48kHz)"
            },
            {
              title: "Timing & Flow",
              description: "Onze vakmensen zorgen for de juiste klemtoon en timing die naadloos aansluit bij de emotie en flow van jouw beelden.",
              icon: Music,
              guarantee: "perfecte timing & flow"
            },
            {
              title: "Studio Finish",
              description: "Je ontvangt een high-end WAV bestand, perfect nabewerkt en klaar om direct onder je videoproductie te monteren.",
              icon: Zap,
              guarantee: "foutloze opname-garantie"
            }
          ]
        };
    }
  }, [state.journey]);

  return (
    <PageWrapperInstrument className="bg-va-off-white min-h-screen overflow-hidden">
      <Suspense fallback={null}>
        <LiquidBackground strokeWidth={1.5} />
      </Suspense>
      
      {/* HERO SECTION - CENTERED ADEMING STYLE */}
      <ContainerInstrument className="pt-64 pb-12 relative z-10 max-w-6xl mx-auto px-6 text-center">
        <header className="max-w-4xl mx-auto">
          <HeadingInstrument level={1} className="text-[8vw] lg:text-[120px] font-extralight tracking-tighter mb-10 leading-[0.85] text-va-black">
            <VoiceglotText translationKey={`how.title.${state.journey}`} defaultText={journeyData.title} />
          </HeadingInstrument>
          
          <div className="h-[100px] flex items-center justify-center overflow-hidden">
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={state.journey}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
              >
                <TextInstrument className="text-2xl lg:text-3xl text-va-black/40 font-light tracking-tight max-w-2xl mx-auto leading-tight">
                  <VoiceglotText translationKey={`how.subtitle.${state.journey}`} defaultText={journeyData.subtitle} />
                </TextInstrument>
              </motion.div>
            </AnimatePresence>
          </div>
          
          <ContainerInstrument className="w-24 h-1 bg-black/5 rounded-full mx-auto mt-8" />
        </header>
      </ContainerInstrument>

      {/* JOURNEY SWITCHER - CENTERED */}
      <ContainerInstrument className="relative z-20 max-w-6xl mx-auto px-6 mb-16">
        <ContainerInstrument plain className="bg-va-off-white/50 border border-black/5 p-1.5 rounded-[32px] shadow-aura flex items-center gap-1.5 max-w-3xl mx-auto">
          {journeys.map((j) => {
            const isActive = state.journey === j.id;
            const Icon = j.icon;
            return (
              <button
                key={j.id}
                onClick={() => {
                  playClick('pro');
                  updateJourney(j.id as any);
                }}
                onMouseEnter={() => playSwell()}
                className={cn(
                  "flex-1 flex items-center justify-start gap-4 px-6 py-3 rounded-[28px] transition-all duration-300 group/btn text-left relative overflow-hidden",
                  isActive 
                    ? "text-white z-10" 
                    : "text-va-black/40 hover:text-va-black hover:bg-white/50"
                )}
              >
                {isActive && (
                  <motion.div 
                    layoutId="activeTab"
                    className="absolute inset-0 bg-va-black shadow-xl"
                    style={{ borderRadius: 28 }}
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
                <Icon size={24} strokeWidth={isActive ? 2 : 1.5} className={cn("transition-all duration-500 shrink-0 relative z-10", isActive && "text-primary")} />
                <div className="flex flex-col relative z-10">
                  <span className="text-[14px] font-bold tracking-widest leading-none mb-1">
                    <VoiceglotText translationKey={j.key} defaultText={j.label} />
                  </span>
                  <span className={cn(
                    "text-[10px] font-medium tracking-wider uppercase opacity-60",
                    isActive ? "text-white/80" : "text-va-black/40 group-hover/btn:text-va-black/60"
                  )}>
                    <VoiceglotText translationKey={`${j.key}.sub`} defaultText={j.subLabel} />
                  </span>
                </div>
                {isActive && <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse ml-auto relative z-10" />}
              </button>
            );
          })}
        </ContainerInstrument>
      </ContainerInstrument>

      {/* STEPS SECTION - 3 STEPS ISLAND FILOSOFIE */}
      <SectionInstrument className="py-16 relative z-10 max-w-6xl mx-auto px-6">
        <ContainerInstrument className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <AnimatePresence mode="popLayout" initial={false}>
            {journeyData.steps.map((step, i) => (
              <motion.div
                key={`${state.journey}-${i}`}
                initial={{ opacity: 0, scale: 0.98, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.98, y: -10 }}
                transition={{ duration: 0.4, delay: i * 0.05, ease: [0.23, 1, 0.32, 1] }}
              >
                <ContainerInstrument className="p-12 bg-white/80 backdrop-blur-xl rounded-[20px] border border-white/20 shadow-aura hover:shadow-aura-lg transition-all duration-700 hover:-translate-y-2 group/step flex flex-col h-full min-h-[420px]">
                  <ContainerInstrument className="w-16 h-16 bg-va-off-white rounded-full flex items-center justify-center mb-10 group-hover:bg-primary/10 transition-colors duration-1000">
                    <step.icon strokeWidth={1.5} size={24} className="text-primary/40 group-hover:text-primary transition-colors" />
                  </ContainerInstrument>
                  <HeadingInstrument level={3} className="text-3xl font-light mb-6 tracking-tight text-va-black leading-tight">
                    <VoiceglotText translationKey={`how.step.${state.journey}.${i}.title`} defaultText={step.title} />
                  </HeadingInstrument>
                  <TextInstrument className="text-lg text-va-black/50 font-light leading-relaxed tracking-tight">
                    <VoiceglotText translationKey={`how.step.${state.journey}.${i}.description`} defaultText={step.description} />
                  </TextInstrument>
                  <div className="mt-8 flex items-center gap-2">
                    <CheckCircle2 size={14} className="text-green-500" strokeWidth={1.5} />
                    <span className="text-[11px] font-bold uppercase tracking-widest text-va-black/30">
                      <VoiceglotText translationKey={`how.step.${state.journey}.${i}.guarantee`} defaultText={(step as any).guarantee} />
                    </span>
                  </div>
                  <ContainerInstrument className="mt-auto pt-10">
                    <TextInstrument className="text-va-black/5 font-black text-6xl tracking-tighter italic">0{i + 1}</TextInstrument>
                  </ContainerInstrument>
                </ContainerInstrument>
              </motion.div>
            ))}
          </AnimatePresence>
        </ContainerInstrument>
        
        {/* CTA UNDER STEPS */}
        <ContainerInstrument className="mt-20 text-center animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-500 fill-mode-both">
          <Link href="/agency" className="inline-flex items-center gap-4 bg-va-black text-white px-12 py-6 rounded-[10px] font-medium text-base tracking-widest hover:scale-105 transition-all duration-700 shadow-2xl uppercase group">
            <VoiceglotText translationKey="how.cta.start" defaultText="Start jouw project" />
            <ArrowRight size={20} className="group-hover:translate-x-2 transition-transform duration-500" />
          </Link>
        </ContainerInstrument>
      </SectionInstrument>

      {/* FAQ SECTION - THEMATIC SPLIT RHYTHM */}
      <SectionInstrument className="py-48 relative z-10 bg-va-black/[0.02] border-y border-black/5">
        <ContainerInstrument className="max-w-6xl mx-auto px-6">
          <ContainerInstrument plain className="grid grid-cols-1 lg:grid-cols-12 gap-24 items-start group">
            <ContainerInstrument plain className="lg:col-span-5 sticky top-40">
              <ContainerInstrument plain className="mb-12 transform group-hover:scale-110 transition-transform duration-1000 ease-va-bezier">
                <ShieldCheck strokeWidth={1.5} size={48} className="text-primary/40" />
              </ContainerInstrument>
              <HeadingInstrument level={2} className="text-6xl md:text-7xl font-light tracking-tighter mb-10 text-va-black leading-none">
                <VoiceglotText translationKey="how.faq.title" defaultText="Veelgestelde vragen" />
              </HeadingInstrument>
              <TextInstrument className="text-3xl text-va-black/20 font-light leading-tight tracking-tight max-w-sm">
                <VoiceglotText translationKey="how.faq.subtitle" defaultText="Alles wat je moet weten over jouw volgende stemproject." />
              </TextInstrument>
            </ContainerInstrument>
            
            <ContainerInstrument plain className="lg:col-span-7 pt-4">
              <AnimatePresence mode="wait">
                <motion.div
                  key={state.journey}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
                >
                  <JourneyFaq journey={state.journey} limit={10} />
                </motion.div>
              </AnimatePresence>
            </ContainerInstrument>
          </ContainerInstrument>
        </ContainerInstrument>
      </SectionInstrument>

      {/* SIGNATURE CTA - THE FINALE */}
      <footer className="pb-32 relative z-10 max-w-6xl mx-auto px-6">
        <ContainerInstrument className="bg-va-black text-white p-24 lg:p-32 rounded-[20px] shadow-aura-lg relative overflow-hidden group text-center">
          <ContainerInstrument className="relative z-10">
            <TextInstrument className="text-[15px] font-medium tracking-[0.4em] text-primary/60 mb-12 block uppercase">
              <VoiceglotText translationKey="cta.next_step" defaultText="volgende stap" />
            </TextInstrument>
            <HeadingInstrument level={2} className="text-[8vw] lg:text-8xl font-light tracking-tighter mb-20 leading-[0.9] text-white">
              <VoiceglotText translationKey="cta.ready_title" defaultText="Klaar om jouw stem te vinden?" />
            </HeadingInstrument>
            <ContainerInstrument className="flex flex-col sm:flex-row items-center justify-center gap-12">
              <Link href="/agency" className="bg-va-off-white text-va-black px-24 py-12 rounded-[10px] font-medium text-base tracking-widest hover:scale-105 transition-all duration-700 shadow-2xl hover:bg-white uppercase">
                <VoiceglotText translationKey="cta.find_voice" defaultText="vind jouw stem" />
              </Link>
              <Link href="/contact" className="text-white/30 hover:text-white font-medium text-base tracking-widest flex items-center gap-6 group/link transition-all duration-700 uppercase">
                <VoiceglotText translationKey="cta.ask_question" defaultText="stel een vraag" />
                <ArrowRight strokeWidth={1.5} size={28} className="group-hover/link:translate-x-4 transition-transform duration-700" />
              </Link>
            </ContainerInstrument>
          </ContainerInstrument>
        </ContainerInstrument>
      </footer>
    </PageWrapperInstrument>
  );
}
