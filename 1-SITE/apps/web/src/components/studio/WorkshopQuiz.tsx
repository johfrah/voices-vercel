'use client';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';

interface QuizOption {
  text: string;
  next?: string;
  url?: string;
  weight?: Record<string, number>;
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
    video: 'https://vcbxyyjsxuquytcsskpj.supabase.co/storage/v1/object/public/assets/studio/workshops/videos/welkom.mp4',
    question: 'Welke workshop past bij mij? Doe de quiz!',
    choices: [
      { text: 'Start de quiz', next: 'ervaring' }
    ]
  },
  {
    id: 'ervaring',
    video: 'https://vcbxyyjsxuquytcsskpj.supabase.co/storage/v1/object/public/assets/studio/workshops/videos/ervaring.mp4',
    question: 'Wat is jouw ervaring met stemwerk?',
    choices: [
      { text: 'Geen ervaring', next: 'doel' },
      { text: 'Een beetje ervaring', next: 'doel' },
      { text: 'Ik ben een pro', next: 'doel' }
    ]
  },
  {
    id: 'doel',
    video: 'https://vcbxyyjsxuquytcsskpj.supabase.co/storage/v1/object/public/assets/studio/workshops/videos/doel.mp4',
    question: 'Wat is je belangrijkste doel?',
    choices: [
      { text: 'Mijn eigen stem ontdekken', next: 'resultaat_basis' },
      { text: 'Professioneel voice-over worden', next: 'resultaat_pro' },
      { text: 'Beter presenteren / spreken', next: 'resultaat_presentatie' }
    ]
  },
  {
    id: 'resultaat_basis',
    video: 'https://vcbxyyjsxuquytcsskpj.supabase.co/storage/v1/object/public/assets/studio/workshops/videos/resultaat.mp4',
    question: 'De "Stem & Presentatie" workshop is perfect voor jou!',
    choices: [
      { text: 'Bekijk workshop', url: '/studio/workshop/stem-presentatie' },
      { text: 'Opnieuw beginnen', next: 'welkom' }
    ]
  },
  {
    id: 'resultaat_pro',
    video: 'https://vcbxyyjsxuquytcsskpj.supabase.co/storage/v1/object/public/assets/studio/workshops/videos/resultaat.mp4',
    question: 'De "Voice-over Masterclass" is jouw volgende stap.',
    choices: [
      { text: 'Bekijk masterclass', url: '/studio/workshop/masterclass' },
      { text: 'Opnieuw beginnen', next: 'welkom' }
    ]
  },
  {
    id: 'resultaat_presentatie',
    video: 'https://vcbxyyjsxuquytcsskpj.supabase.co/storage/v1/object/public/assets/studio/workshops/videos/resultaat.mp4',
    question: 'Onze "Spreken met Impact" training past het best.',
    choices: [
      { text: 'Bekijk training', url: '/studio/workshop/impact' },
      { text: 'Opnieuw beginnen', next: 'welkom' }
    ]
  }
];

export const WorkshopQuiz: React.FC = () => {
  const [currentStepId, setCurrentStepId] = useState('welkom');
  const [isTransitioning, setIsTransitioning] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const currentStep = QUIZ_DATA.find(s => s.id === currentStepId) || QUIZ_DATA[0];

  const handleChoice = (choice: QuizOption) => {
    if (choice.url) {
      window.location.href = choice.url;
      return;
    }

    if (choice.next) {
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrentStepId(choice.next!);
        setIsTransitioning(false);
      }, 500);
    }
  };

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.load();
      videoRef.current.play().catch(e => console.log('Autoplay blocked'));
    }
  }, [currentStepId]);

  return (
    <div className="relative w-full max-w-md mx-auto aspect-[9/16] bg-black rounded-[2rem] overflow-hidden shadow-2xl border-4 border-white/10 group">
      {/* Video Background */}
      <video
        ref={videoRef}
        key={currentStep.video}
        className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:opacity-80 transition-opacity duration-700"
        playsInline
        muted
        loop
      >
        <source src={currentStep.video} type="video/mp4" />
      </video>

      {/* Glass Overlay Content */}
      <div className="absolute inset-0 flex flex-col justify-end p-8 bg-gradient-to-t from-black/80 via-black/20 to-transparent">
        <AnimatePresence strokeWidth={1.5} mode="wait">
          <motion.div
            key={currentStep.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4 }}
            className="space-y-6"
          >
            <h3 className="text-2xl font-bold text-white leading-tight drop-shadow-lg">
              {currentStep.question}
            </h3>

            <div className="space-y-3">
              {currentStep.choices.map((choice, idx) => (
                <button
                  key={idx}
                  onClick={() => handleChoice(choice)}
                  className="w-full py-4 px-6 bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 rounded-xl text-white font-medium text-left flex items-center justify-between group/btn transition-all active:scale-[0.98]"
                >
                  <span>{choice.text}</span>
                  <ArrowRight strokeWidth={1.5} size={18} className="opacity-0 group-hover/btn:opacity-100 group-hover/btn:translate-x-1 transition-all" />
                </button>
              ))}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Progress Bar */}
      <div className="absolute top-4 left-4 right-4 flex gap-1">
        {QUIZ_DATA.filter(s => !s.id.startsWith('resultaat')).map((s, idx) => (
          <div 
            key={s.id} 
            className={`h-1 flex-1 rounded-full transition-all duration-500 ${
              QUIZ_DATA.findIndex(step => step.id === currentStepId) >= idx 
                ? 'bg-primary shadow-[0_0_10px_rgba(var(--primary-rgb),0.5)]' 
                : 'bg-white/20'
            }`}
          />
        ))}
      </div>
    </div>
  );
};
