"use client";

import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Play, Pause, RotateCcw } from "lucide-react";
import { useSonicDNA } from "@/lib/engines/sonic-dna";

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
        // Play subtle haptic/sonic feedback on phase change
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
      case "inhale": return "Adem in";
      case "hold": return "Hou vast";
      case "exhale": return "Adem uit";
      case "rest": return "Rust";
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
    <ContainerInstrument plain className={cn(
      "p-12 text-center transition-all duration-1000 rounded-[40px] border border-black/5 bg-white/40 backdrop-blur-xl",
      isActive && "shadow-aura",
      className
    )}>
      <h3 className="text-3xl font-serif font-bold mb-2 tracking-tight">
        Neem even een bewuste adem
      </h3>
      <p className="text-[15px] text-muted-foreground mb-12">
        Een kleine oefening om tot rust te komen.
      </p>

      <div className="relative w-64 h-64 mx-auto mb-12 flex items-center justify-center">
        {/* Outer Ring */}
        <div className="absolute inset-0 rounded-full border border-primary/10 animate-pulse opacity-20" />
        
        {/* Breathing circle */}
        <div
          className={cn(
            "w-48 h-48 rounded-full transition-all duration-[4000ms] ease-in-out flex items-center justify-center relative z-10",
            isActive && phase === "inhale" && "scale-[1.4] bg-element-water/10",
            isActive && phase === "hold" && "scale-[1.4] bg-element-aarde/20",
            isActive && phase === "exhale" && "scale-100 bg-element-vuur/5",
            isActive && phase === "rest" && "scale-100 bg-element-lucht/5",
            !isActive && "scale-100 bg-black/5"
          )}
        >
          <div className="text-center">
            <p className="text-6xl font-serif font-light text-foreground leading-none mb-2">
              {counter}
            </p>
            <div className={cn(
              "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest transition-colors duration-500",
              isActive ? getPhaseColor() : "bg-black/5 text-muted-foreground"
            )}>
              {isActive ? getPhaseText() : "Klaar?"}
            </div>
          </div>
        </div>

        {/* Liquid DNA background effect (simulated) */}
        {isActive && (
          <div className="absolute inset-0 -z-0 opacity-30 blur-3xl animate-pulse">
            <div className={cn(
              "w-full h-full rounded-full transition-colors duration-1000",
              phase === 'inhale' ? 'bg-element-water' : 
              phase === 'hold' ? 'bg-element-aarde' : 
              phase === 'exhale' ? 'bg-element-vuur' : 'bg-element-lucht'
            )} />
          </div>
        )}
      </div>

      <div className="flex justify-center gap-4">
        <button
          onClick={toggleActive}
          className={cn(
            "px-10 py-4 rounded-full font-bold text-[13px] tracking-widest uppercase transition-all",
            isActive ? "bg-foreground text-background" : "bg-primary text-white"
          )}
        >
          {isActive ? (
            <span className="flex items-center gap-2"><Pause size={16} strokeWidth={2} /> Pauze</span>
          ) : (
            <span className="flex items-center gap-2"><Play size={16} strokeWidth={2} /> Start ademhaling</span>
          )}
        </button>
        
        {isActive && (
          <button
            onClick={() => {
              setIsActive(false);
              setPhase("inhale");
              setCounter(BREATHING_CYCLE.inhale);
              playClick('soft');
            }}
            className="w-14 h-14 rounded-full bg-black/5 text-muted-foreground flex items-center justify-center hover:bg-black/10 transition-all"
          >
            <RotateCcw size={20} strokeWidth={1.5} />
          </button>
        )}
      </div>

      {isActive && (
        <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-[0.2em] mt-12 animate-pulse">
          Volg gewoon je adem, zonder oordeel
        </p>
      )}
    </ContainerInstrument>
  );
};
