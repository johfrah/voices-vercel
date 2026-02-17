'use client';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight, Loader2, Volume2, VolumeX } from 'lucide-react';
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
  subtitles?: { start: number; end: number; text: string }[];
}

const QUIZ_DATA: QuizStep[] = [
  {
    id: 'welkom',
    video: '/assets/studio/workshops/videos/welkom.mp4',
    question: 'Welke workshop past bij mij? Doe de quiz!',
    choices: [
      { text: 'Start de quiz', next: 'ervaring' }
    ],
    subtitles: [
      { start: 0, end: 2, text: "Welkom bij Voices Studio!" },
      { start: 2, end: 5, text: "Ontdek in 30 seconden welke workshop bij jou past." }
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
    ],
    subtitles: [
      { start: 0, end: 3, text: "Vertel eens, heb je al vaker voor een microfoon gestaan?" }
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
    ],
    subtitles: [
      { start: 0, end: 3, text: "Wat zou je het liefste willen bereiken?" }
    ]
  },
  {
    id: 'resultaat_basis',
    video: '/assets/studio/workshops/videos/workshop_stem.mp4',
    question: 'De "Stem & Presentatie" workshop is perfect voor jou!',
    choices: [
      { text: 'Bekijk workshop', url: '/studio/stem-presentatie' },
      { text: 'Opnieuw beginnen', next: 'welkom' }
    ],
    subtitles: [
      { start: 0, end: 3, text: "Ik heb het! De Stem & Presentatie workshop is jouw match." }
    ]
  },
  {
    id: 'resultaat_pro',
    video: '/assets/studio/workshops/videos/workshop_beginners.mp4',
    question: 'De "Voice-over Masterclass" is jouw volgende stap.',
    choices: [
      { text: 'Bekijk masterclass', url: '/studio/masterclass' },
      { text: 'Opnieuw beginnen', next: 'welkom' }
    ],
    subtitles: [
      { start: 0, end: 3, text: "Voor jou hebben we de Voice-over Masterclass klaarliggen." }
    ]
  },
  {
    id: 'resultaat_presentatie',
    video: '/assets/studio/workshops/videos/perfect-spreken-in-een-dag.mp4',
    question: 'Onze "Spreken met Impact" training past het best.',
    choices: [
      { text: 'Bekijk training', url: '/studio/perfect-spreken-in-1-dag' },
      { text: 'Opnieuw beginnen', next: 'welkom' }
    ],
    subtitles: [
      { start: 0, end: 3, text: "Spreken met Impact gaat jou enorm helpen!" }
    ]
  }
];

//  FELIX-OPTIMIZATION: Exact va-bezier for framer-motion
const VA_BEZIER = [0.165, 0.84, 0.44, 1];

export const WorkshopQuiz: React.FC = () => {
  const [currentStepId, setCurrentStepId] = useState('welkom');
  const [isLoading, setIsLoading] = useState(true);
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [forceContentVisible, setForceContentVisible] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);

  const currentStep = QUIZ_DATA.find(s => s.id === currentStepId) || QUIZ_DATA[0];

  // Get current subtitle based on time
  const currentSubtitle = currentStep.subtitles?.find(
    s => currentTime >= s.start && currentTime <= s.end
  );

  const handleChoice = (choice: QuizOption) => {
    if (choice.url) {
      window.location.href = choice.url;
      return;
    }

    if (choice.next) {
      setIsVideoLoaded(false);
      setHasError(false);
      setCurrentStepId(choice.next);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  useEffect(() => {
    setIsMounted(true);
    const timer = setTimeout(() => {
      setIsLoading(false);
      setForceContentVisible(true);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  // Update time for subtitles
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => setCurrentTime(video.currentTime);
    video.addEventListener('timeupdate', handleTimeUpdate);
    return () => video.removeEventListener('timeupdate', handleTimeUpdate);
  }, [isVideoLoaded, currentStepId]);

  //  FELIX-OPTIMIZATION: Preload next possible videos
  useEffect(() => {
    if (!isMounted) return;
    
    const nextStepIds = currentStep.choices
      .map(c => c.next)
      .filter((id): id is string => !!id);
    
    nextStepIds.forEach(id => {
      const step = QUIZ_DATA.find(s => s.id === id);
      if (step) {
        const link = document.createElement('link');
        link.rel = 'preload';
        link.as = 'video';
        link.href = step.video;
        document.head.appendChild(link);
      }
    });
  }, [currentStep.choices, isMounted]);

  //  CHRIS-PROTOCOL: Deterministic Skeleton (Server-side safe)
  if (!isMounted || isLoading) {
    return (
      <div className="relative w-full aspect-[9/16] bg-va-off-white rounded-[20px] overflow-hidden shadow-aura border border-black/5 flex-shrink-0">
        <div className="absolute inset-0 flex items-center justify-center">
          <Loader2 strokeWidth={1.5} className="w-8 h-8 text-va-black/10 animate-spin" />
        </div>
        <div className="absolute bottom-0 left-0 right-0 p-8 space-y-4">
          <div className="h-8 bg-va-black/5 rounded-lg w-3/4 animate-pulse" />
          <div className="h-12 bg-va-black/5 rounded-xl w-full animate-pulse" />
          <div className="h-12 bg-va-black/5 rounded-xl w-full animate-pulse" />
        </div>
      </div>
    );
  }

  const shouldShowContent = forceContentVisible || isVideoLoaded || hasError;

  return (
    <div className="relative w-full aspect-[9/16] bg-va-black rounded-[20px] overflow-hidden shadow-aura border border-white/10 group flex-shrink-0 will-change-transform">
      {/*  Video Loading State */}
      {!isVideoLoaded && !hasError && (
        <div className="absolute inset-0 flex items-center justify-center z-20 bg-va-black/50">
          <Loader2 strokeWidth={1.5} className="w-8 h-8 text-white/20 animate-spin" />
        </div>
      )}

      {/* Video Background */}
      <video
        ref={videoRef}
        key={currentStep.video}
        className={cn(
          "absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ease-va-bezier",
          (isVideoLoaded || hasError) ? "opacity-60 group-hover:opacity-80" : "opacity-0"
        )}
        playsInline
        muted={isMuted}
        autoPlay
        loop
        preload="auto"
        onLoadedData={() => setIsVideoLoaded(true)}
        onError={() => setHasError(true)}
        src={currentStep.video}
      />

      {/*  Mute Toggle */}
      <button 
        onClick={toggleMute}
        className="absolute top-6 right-6 z-50 p-3 bg-va-black/20 hover:bg-va-black/40 backdrop-blur-md rounded-full text-white transition-all active:scale-90 border border-white/10"
      >
        {isMuted ? <VolumeX size={18} strokeWidth={1.5} /> : <Volume2 size={18} strokeWidth={1.5} />}
      </button>

      {/*  Subtitles (Top-aligned to avoid buttons) */}
      <AnimatePresence>
        {currentSubtitle && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-20 left-6 right-6 z-40 text-center"
          >
            <span className="inline-block px-4 py-2 bg-va-black/60 backdrop-blur-lg rounded-lg text-white text-[15px] font-light leading-snug shadow-lg border border-white/5">
              {currentSubtitle.text}
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Fallback Background */}
      {hasError && (
        <div className="absolute inset-0 bg-va-black flex items-center justify-center z-10">
          <div className="text-white/20 text-[15px] text-center p-4 font-light">
            Video tijdelijk niet beschikbaar
          </div>
        </div>
      )}

      {/* Glass Overlay Content */}
      <div className="absolute inset-0 flex flex-col justify-end p-8 bg-gradient-to-t from-va-black/90 via-va-black/20 to-transparent z-30">
        <AnimatePresence mode="wait">
          {shouldShowContent && (
            <motion.div
              key={currentStep.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5, ease: VA_BEZIER }}
              className="space-y-6"
            >
              <h3 className="text-2xl font-light font-display text-white leading-tight drop-shadow-lg">
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
      <div className="absolute top-6 left-6 right-6 flex gap-1.5 z-40 pr-12">
        {QUIZ_DATA.filter(s => !s.id.startsWith('resultaat')).map((s, idx) => {
          const steps = QUIZ_DATA.filter(st => !st.id.startsWith('resultaat'));
          const activeIdx = steps.findIndex(step => step.id === currentStepId);
          const isCompleted = activeIdx === -1 || activeIdx >= idx;
          
          return (
            <div 
              key={s.id} 
              className={cn(
                "h-1 flex-1 rounded-full transition-all duration-500 ease-va-bezier",
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
