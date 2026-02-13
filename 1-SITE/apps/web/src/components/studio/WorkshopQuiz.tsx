'use client';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight, Loader2 } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';

interface QuizOption {
  text: string;
  next?: string;
  url?: string;
}

interface QuizStep {
  id: string;
  video: string;
  question: string;
  choices: QuizOption[];
}

const QUIZ_DATA: QuizStep[] = [
  {
    id: 'welkom',
    video: '/assets/studio/workshops/videos/welkom.mp4',
    question: 'Welke workshop past bij mij? Doe de quiz!',
    choices: [
      { text: 'Start de quiz', next: 'ervaring' }
    ]
  },
  {
    id: 'ervaring',
    video: '/assets/studio/workshops/videos/ervaring.mp4',
    question: 'Wat is jouw ervaring met stemwerk?',
    choices: [
      { text: 'Geen ervaring', next: 'doel' },
      { text: 'Een beetje ervaring', next: 'doel' },
      { text: 'Ik ben een pro', next: 'doel' }
    ]
  },
  {
    id: 'doel',
    video: '/assets/studio/workshops/videos/benieuwd_naar_meer.mp4',
    question: 'Wat is je belangrijkste doel?',
    choices: [
      { text: 'Mijn eigen stem ontdekken', next: 'resultaat_basis' },
      { text: 'Professioneel voice-over worden', next: 'resultaat_pro' },
      { text: 'Beter presenteren / spreken', next: 'resultaat_presentatie' }
    ]
  },
  {
    id: 'resultaat_basis',
    video: '/assets/studio/workshops/videos/bedankt.mp4',
    question: 'De "Stem & Presentatie" workshop is perfect voor jou!',
    choices: [
      { text: 'Bekijk workshop', url: '/studio/workshop/stem-presentatie' },
      { text: 'Opnieuw beginnen', next: 'welkom' }
    ]
  },
  {
    id: 'resultaat_pro',
    video: '/assets/studio/workshops/videos/bedankt.mp4',
    question: 'De "Voice-over Masterclass" is jouw volgende stap.',
    choices: [
      { text: 'Bekijk masterclass', url: '/studio/workshop/masterclass' },
      { text: 'Opnieuw beginnen', next: 'welkom' }
    ]
  },
  {
    id: 'resultaat_presentatie',
    video: '/assets/studio/workshops/videos/bedankt.mp4',
    question: 'Onze "Spreken met Impact" training past het best.',
    choices: [
      { text: 'Bekijk training', url: '/studio/workshop/impact' },
      { text: 'Opnieuw beginnen', next: 'welkom' }
    ]
  }
];

export const WorkshopQuiz: React.FC = () => {
  const [currentStepId, setCurrentStepId] = useState('welkom');
  const [isLoading, setIsLoading] = useState(true);
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const currentStep = QUIZ_DATA.find(s => s.id === currentStepId) || QUIZ_DATA[0];

  const handleChoice = (choice: QuizOption) => {
    if (choice.url) {
      window.location.href = choice.url;
      return;
    }

    if (choice.next) {
      setIsVideoLoaded(false);
      setCurrentStepId(choice.next);
    }
  };

  useEffect(() => {
    // Initial loading state
    const timer = setTimeout(() => setIsLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  // 🛡️ CHRIS-PROTOCOL: Deterministic Skeleton
  if (isLoading) {
    return (
      <div className="relative w-full max-w-md mx-auto aspect-[9/16] bg-va-off-white rounded-[2rem] overflow-hidden shadow-aura border border-black/5 animate-pulse">
        <div className="absolute inset-0 flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-va-black/10 animate-spin" />
        </div>
        <div className="absolute bottom-0 left-0 right-0 p-8 space-y-4">
          <div className="h-8 bg-va-black/5 rounded-lg w-3/4" />
          <div className="h-12 bg-va-black/5 rounded-xl w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full max-w-md mx-auto aspect-[9/16] bg-va-black rounded-[2rem] overflow-hidden shadow-2xl border-4 border-white/10 group">
      {/* 🔄 Video Loading State */}
      {!isVideoLoaded && (
        <div className="absolute inset-0 flex items-center justify-center z-20 bg-va-black">
          <Loader2 className="w-8 h-8 text-white/20 animate-spin" />
        </div>
      )}

      {/* Video Background */}
      <video
        ref={videoRef}
        key={currentStep.video}
        className={cn(
          "absolute inset-0 w-full h-full object-cover transition-opacity duration-700",
          isVideoLoaded ? "opacity-60 group-hover:opacity-80" : "opacity-0"
        )}
        playsInline
        muted
        autoPlay
        loop
        onLoadedData={() => setIsVideoLoaded(true)}
        src={currentStep.video}
      />

      {/* Glass Overlay Content */}
      <div className="absolute inset-0 flex flex-col justify-end p-8 bg-gradient-to-t from-va-black/90 via-va-black/20 to-transparent z-30">
        <AnimatePresence mode="wait">
          {isVideoLoaded && (
            <motion.div
              key={currentStep.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }} // va-bezier feel
              className="space-y-6"
            >
              <h3 className="text-2xl font-light text-white leading-tight drop-shadow-lg">
                {currentStep.question}
              </h3>

              <div className="space-y-3">
                {currentStep.choices.map((choice, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleChoice(choice)}
                    className="w-full py-4 px-6 bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 rounded-xl text-white text-[15px] font-light text-left flex items-center justify-between group/btn transition-all active:scale-[0.98] ease-va-bezier"
                  >
                    <span>{choice.text}</span>
                    <ArrowRight strokeWidth={1.5} size={18} className="opacity-40 group-hover/btn:opacity-100 group-hover/btn:translate-x-1 transition-all" />
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Progress Bar */}
      <div className="absolute top-6 left-6 right-6 flex gap-1.5 z-40">
        {QUIZ_DATA.filter(s => !s.id.startsWith('resultaat')).map((s, idx) => {
          const steps = QUIZ_DATA.filter(st => !st.id.startsWith('resultaat'));
          const activeIdx = steps.findIndex(step => step.id === currentStepId);
          const isCompleted = activeIdx === -1 || activeIdx >= idx;
          
          return (
            <div 
              key={s.id} 
              className={cn(
                "h-1 flex-1 rounded-full transition-all duration-700",
                isCompleted 
                  ? "bg-primary shadow-[0_0_12px_rgba(var(--primary-rgb),0.6)]" 
                  : "bg-white/20"
              )}
            />
          );
        })}
      </div>
    </div>
  );
};
