"use client";

import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Play, Pause, RotateCcw } from "lucide-react";
import { useSonicDNA } from "@/lib/engines/sonic-dna";

import { 
  SectionInstrument, 
  ContainerInstrument, 
  HeadingInstrument, 
  TextInstrument,
  ButtonInstrument 
} from "@/components/ui/LayoutInstruments";
import { VoiceglotText } from "@/components/ui/VoiceglotText";

const BREATHING_CYCLE = {
  inhale: 4,
  hold: 4,
  exhale: 6,
  rest: 2,
};

export const BreathingInstrument = ({ className }: { className?: string }) => {
  const [isActive, setIsActive] = useState(false);
  const [phase, setPhase] = useState<"inhale" | "hold" | "exhale" | "rest">("inhale");
  const [counter, setCounter] = useState(BREATHING_CYCLE.inhale);
  const { playClick } = useSonicDNA();

  useEffect(() => {
    if (!isActive) return;

    const interval = setInterval(() => {
      setCounter((prev) => {
        if (prev > 1) return prev - 1;

        // Move to next phase
        let nextPhase: "inhale" | "hold" | "exhale" | "rest";
        let nextCounter: number;

        if (phase === "inhale") {
          nextPhase = "hold";
          nextCounter = BREATHING_CYCLE.hold;
        } else if (phase === "hold") {
          nextPhase = "exhale";
          nextCounter = BREATHING_CYCLE.exhale;
        } else if (phase === "exhale") {
          nextPhase = "rest";
          nextCounter = BREATHING_CYCLE.rest;
        } else {
          nextPhase = "inhale";
          nextCounter = BREATHING_CYCLE.inhale;
        }

        setPhase(nextPhase);
        playClick('soft');
        return nextCounter;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isActive, phase, playClick]);

  const toggleActive = () => {
    if (!isActive) {
      setPhase("inhale");
      setCounter(BREATHING_CYCLE.inhale);
      playClick('success');
    } else {
      playClick('soft');
    }
    setIsActive(!isActive);
  };

  const getPhaseText = () => {
    switch (phase) {
      case "inhale": return <VoiceglotText translationKey="breathing.phase.inhale" defaultText="Adem in" />;
      case "hold": return <VoiceglotText translationKey="breathing.phase.hold" defaultText="Hou vast" />;
      case "exhale": return <VoiceglotText translationKey="breathing.phase.exhale" defaultText="Adem uit" />;
      case "rest": return <VoiceglotText translationKey="breathing.phase.rest" defaultText="Rust" />;
    }
  };

  const getPhaseColor = () => {
    switch (phase) {
      case "inhale": return "bg-element-water/10 text-element-water";
      case "hold": return "bg-element-aarde/10 text-element-aarde";
      case "exhale": return "bg-element-vuur/10 text-element-vuur";
      case "rest": return "bg-element-lucht/10 text-element-lucht";
    }
  };

  return (
    <ContainerInstrument className={cn(
      "p-16 md:p-24 text-center transition-all duration-1000 rounded-[64px] border border-primary/5 bg-white/40 backdrop-blur-2xl shadow-soft",
      isActive && "shadow-aura-lg scale-[1.01]",
      className
    )}>
      <ContainerInstrument className="relative w-80 h-80 mx-auto mb-16 flex items-center justify-center">
        {/* Outer Ring - Literal replication of kelder ripple */}
        <ContainerInstrument className={cn(
          "absolute inset-0 rounded-full border-2 border-primary/5 transition-all duration-1000",
          isActive ? "animate-ripple opacity-40 scale-150" : "opacity-0 scale-100"
        )} />
        
        {/* Breathing circle - Original kelder logic */}
        <ContainerInstrument
          className={cn(
            "w-64 h-64 rounded-full transition-all duration-[4000ms] ease-in-out flex items-center justify-center relative z-10 shadow-medium",
            isActive && phase === "inhale" && "scale-[1.3] bg-element-water/20",
            isActive && phase === "hold" && "scale-[1.3] bg-element-aarde/30",
            isActive && phase === "exhale" && "scale-100 bg-element-vuur/10",
            isActive && phase === "rest" && "scale-100 bg-element-lucht/10",
            !isActive && "scale-100 bg-black/5"
          )}
        >
          <ContainerInstrument className="text-center">
            <TextInstrument className="text-8xl font-serif font-light text-foreground leading-none mb-4">
              {counter}
            </TextInstrument>
            <ContainerInstrument className={cn(
              "px-6 py-2 rounded-full text-xs font-bold uppercase tracking-[0.3em] transition-colors duration-500 shadow-soft",
              isActive ? getPhaseColor() : "bg-black/5 text-muted-foreground"
            )}>
              {isActive ? getPhaseText() : <VoiceglotText translationKey="breathing.ready" defaultText="Klaar?" />}
            </ContainerInstrument>
          </ContainerInstrument>
        </ContainerInstrument>

        {/* Aura background effect */}
        <ContainerInstrument className={cn(
          "absolute inset-0 -z-0 opacity-40 blur-[100px] transition-all duration-1000",
          isActive ? "scale-150" : "scale-0 opacity-0",
          phase === 'inhale' ? 'bg-element-water' : 
          phase === 'hold' ? 'bg-element-aarde' : 
          phase === 'exhale' ? 'bg-element-vuur' : 'bg-element-lucht'
        )} />
      </ContainerInstrument>

      <ContainerInstrument className="flex justify-center gap-6">
        <ButtonInstrument
          onClick={toggleActive}
          className={cn(
            "px-12 py-6 rounded-full font-bold text-sm tracking-[0.2em] uppercase transition-all shadow-medium hover:shadow-large hover:scale-[1.02] active:scale-[0.98]",
            isActive ? "bg-foreground text-background" : "bg-primary text-white"
          )}
        >
          {isActive ? (
            <TextInstrument as="span" className="flex items-center gap-3"><Pause size={20} strokeWidth={2.5} /> <VoiceglotText translationKey="breathing.action.pause" defaultText="Pauze" /></TextInstrument>
          ) : (
            <TextInstrument as="span" className="flex items-center gap-3"><Play size={20} strokeWidth={2.5} /> <VoiceglotText translationKey="breathing.action.start" defaultText="Start ademhaling" /></TextInstrument>
          )}
        </ButtonInstrument>
        
        {isActive && (
          <ButtonInstrument
            onClick={() => {
              setIsActive(false);
              setPhase("inhale");
              setCounter(BREATHING_CYCLE.inhale);
              playClick('soft');
            }}
            className="w-20 h-20 rounded-full bg-black/5 text-muted-foreground flex items-center justify-center hover:bg-black/10 hover:rotate-[-180deg] transition-all duration-700 p-0"
          >
            <RotateCcw size={24} strokeWidth={1.5} />
          </ButtonInstrument>
        )}
      </ContainerInstrument>

      {isActive && (
        <TextInstrument className="text-xs font-bold text-primary/40 uppercase tracking-[0.4em] mt-16 animate-breathe-wave-subtle">
          <VoiceglotText translationKey="breathing.instruction" defaultText="Volg gewoon je adem, zonder oordeel" />
        </TextInstrument>
      )}
    </ContainerInstrument>
  );
};
