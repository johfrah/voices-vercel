"use client";

import { BentoCard } from '@/components/ui/BentoGrid';
import { VoiceglotText } from '@/components/ui/VoiceglotText';
import { useCheckout } from '@/contexts/CheckoutContext';
import { useSonicDNA } from '@/lib/sonic-dna';
import { AnimatePresence, motion } from 'framer-motion';
import { Apple, ArrowRight, CheckCircle2, ChevronUp, CreditCard, Mic } from 'lucide-react';
import Image from 'next/image';
import React, { useEffect, useState } from 'react';

/**
 * ANIMATED PRICE COUNTER (Protocol 2026)
 */
const AnimatedPrice: React.FC<{ value: number; label?: string }> = ({ value, label }) => {
  const [displayValue, setDisplayValue] = useState(value);

  useEffect(() => {
    const duration = 1000; // 1 second
    const steps = 60;
    const increment = (value - displayValue) / steps;
    let currentStep = 0;

    const timer = setInterval(() => {
      currentStep++;
      if (currentStep >= steps) {
        setDisplayValue(value);
        clearInterval(timer);
      } else {
        setDisplayValue(prev => prev + increment);
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [value, displayValue]);

  return (
    <div className="flex flex-col">
      <div className="flex items-baseline gap-2">
        <motion.span 
          key={value}
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="text-5xl font-black tracking-tighter text-primary"
        >
          €{displayValue.toFixed(2)}
        </motion.span>
        {label && (
          <span className="text-[15px] font-bold text-white/20 tracking-widest">{label}</span>
        )}
      </div>
    </div>
  );
};

/**
 * NATIVE-READY MOBILE CHECKOUT SHEET
 * Volgens Master Voices Protocol 2026
 */
export const MobileCheckoutSheet: React.FC = () => {
  const { state } = useCheckout();
  const { playClick } = useSonicDNA();
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState<'summary' | 'payment' | 'success' | 'voice-briefing'>('summary');
  const [isRecording, setIsRecording] = useState(false);
  const [transcription, setTranscription] = useState('');

  const subtotal = state.pricing.total;
  const total = subtotal * 1.21; // Excl. BTW wet

  const handleToggle = () => {
    playClick(isOpen ? 'light' : 'deep');
    setIsOpen(!isOpen);
  };

  const startVoiceBriefing = () => {
    playClick('deep');
    setStep('voice-briefing');
  };

  const toggleRecording = () => {
    playClick(isRecording ? 'light' : 'deep');
    setIsRecording(!isRecording);
    
    if (!isRecording) {
      // Simulate transcription
      setTimeout(() => {
        setTranscription("Ik want de stem warm en enthousiast klinkt, focus op de laatste zin van het script. Het is voor een online campagne.");
      }, 2000);
    }
  };

  const handlePayment = () => {
    playClick('deep');
    // Simulate payment
    setTimeout(() => {
      setStep('success');
      playClick('light');
    }, 1500);
  };

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 md:hidden">
      {/* Backdrop */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleToggle}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm"
          />
        )}
      </AnimatePresence>

      {/* The Sheet */}
      <motion.div
        animate={{ y: isOpen ? 0 : 'calc(100% - 80px)' }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="bg-va-off-white rounded-t-[40px] shadow-2xl border-t border-white/20 overflow-hidden"
      >
        {/* Handle / Trigger */}
        <div 
          onClick={handleToggle}
          className="h-20 flex flex-col items-center justify-center cursor-pointer"
        >
          <div className="w-12 h-1.5 bg-black/10 rounded-full mb-2" />
          {!isOpen && (
            <div className="flex justify-between items-center w-full px-8">
              <span className="text-[15px] font-black tracking-widest text-va-black/40">
                <VoiceglotText strokeWidth={1.5} translationKey="checkout.mobile.order_title" defaultText="Jouw Bestelling" / />
              </span>
              <div className="flex items-center gap-2">
                <span className="text-xl font-black text-primary">€{total.toFixed(2)}</span>
                <ChevronUp strokeWidth={1.5} className="text-primary animate-bounce" size={20} / />
              </div>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="px-6 pb-12 max-h-[80vh] overflow-y-auto">
          {step === 'summary' && (
            <div className="space-y-6">
              <h2 className="text-3xl font-black tracking-tighter">
                <VoiceglotText strokeWidth={1.5} translationKey="checkout.mobile.summary_title" defaultText="Check je order" / />
              </h2>
              
              <div className="grid grid-cols-2 gap-4">
                <BentoCard className="bg-white p-6 border border-black/5">
                  <p className="text-[15px] font-black tracking-widest text-va-black/30 mb-2">
                    <VoiceglotText strokeWidth={1.5} translationKey="common.voice" defaultText="Stem" / />
                  </p>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gray-100 overflow-hidden relative">
                      {state.selectedActor?.photo_url && (
                        <Image  
                          src={state.selectedActor.photo_url} 
                          alt="" 
                          fill
                          className="object-cover" 
                        / />
                      )}
                    </div>
                    <span className="font-bold text-[15px]">{state.selectedActor?.display_name || 'Selecteer stem'}</span>
                  </div>
                </BentoCard>

                <BentoCard 
                  onClick={startVoiceBriefing}
                  className="bg-white p-6 border border-black/5 cursor-pointer hover:border-primary/30 transition-all"
                >
                  <p className="text-[15px] font-black tracking-widest text-va-black/30 mb-2">
                    <VoiceglotText strokeWidth={1.5} translationKey="common.briefing" defaultText="Briefing" / />
                  </p>
                  <div className="flex items-center gap-2 text-primary">
                    <Mic strokeWidth={1.5} size={16} / />
                    <span className="font-bold text-[15px]">{transcription ? 'Ingebroken' : 'Voice-to-Text'}</span>
                  </div>
                </BentoCard>
              </div>

              {/* Price Card (Animated Concept) */}
              <BentoCard className="bg-va-black text-white p-8 shadow-aura relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10">
                  <CreditCard size={80} />
                </div>
                <p className="text-[15px] font-black tracking-widest text-white/30 mb-2">
                  <VoiceglotText strokeWidth={1.5} translationKey="common.total_amount" defaultText="Totaalbedrag" / />
                </p>
                
                <AnimatedPrice strokeWidth={1.5} value={total} label="Incl. BTW" / />

                <div className="mt-4 pt-4 border-t border-white/5 flex justify-between text-[15px] font-bold text-white/40 tracking-widest">
                  <span>Excl. BTW</span>
                  <motion.span
                    key={subtotal}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    €{subtotal.toFixed(2)}
                  </motion.span>
                </div>
              </BentoCard>

              {/* One-Tap Payment Buttons */}
              <div className="space-y-3">
                <button 
                  onClick={handlePayment}
                  className="w-full h-16 bg-black text-white rounded-2xl flex items-center justify-center gap-2 font-bold text-lg hover:scale-[0.98] transition-all"
                >
                  <Apple strokeWidth={1.5} fill="currentColor" size={24} / /> Pay
                </button>
                <button 
                  onClick={() => setStep('payment')}
                  className="w-full h-16 bg-white border-2 border-black/5 rounded-2xl flex items-center justify-center gap-2 font-bold text-[15px] tracking-widest hover:bg-gray-50 transition-all"
                >
                  <VoiceglotText strokeWidth={1.5} translationKey="checkout.mobile.other_payment" defaultText="Andere betaalmethode" / />
                </button>
              </div>
            </div>
          )}

          {step === 'voice-briefing' && (
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-8 py-4"
            >
              <div className="flex items-center gap-4">
                <button onClick={() => setStep('summary')} className="p-2 bg-black/5 rounded-full">
                  <ChevronUp strokeWidth={1.5} className="-rotate-90" size={20} / />
                </button>
                <h2 className="text-3xl font-black tracking-tighter">
                  <VoiceglotText strokeWidth={1.5} translationKey="checkout.mobile.voice_briefing_title" defaultText="Spreek je briefing in" / />
                </h2>
              </div>

              <div className="flex flex-col items-center justify-center py-12 space-y-8">
                <motion.button
                  animate={{ 
                    scale: isRecording ? [1, 1.1, 1] : 1,
                    backgroundColor: isRecording ? 'var(--va-primary)' : '#000000'
                  }}
                  transition={{ repeat: isRecording ? Infinity : 0, duration: 1.5 }}
                  onClick={toggleRecording}
                  className="w-32 h-32 rounded-full flex items-center justify-center text-white shadow-2xl"
                >
                  <Mic strokeWidth={1.5} size={48} fill={isRecording ? 'currentColor' : 'none'} / />
                </motion.button>
                
                <div className="text-center">
                  <p className="text-va-black/40 font-bold tracking-widest text-[15px] mb-2">
                    {isRecording ? 'Aan het luisteren...' : 'Tik om te starten'}
                  </p>
                  {isRecording && (
                    <div className="flex gap-1 justify-center">
                      {[1,2,3,4,5].map(i => (
                        <motion.div 
                          key={i}
                          animate={{ height: [10, 30, 10] }}
                          transition={{ repeat: Infinity, duration: 0.5, delay: i * 0.1 }}
                          className="w-1 bg-primary rounded-full"
                        />
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {transcription && (
                <BentoCard className="bg-white p-6 border-2 border-primary/20">
                  <p className="text-[15px] font-black tracking-widest text-primary mb-2">
                    <VoiceglotText strokeWidth={1.5} translationKey="checkout.mobile.registered_briefing" defaultText="Geregistreerde Briefing" / />
                  </p>
                  <p className="text-[15px] font-medium leading-relaxed italic">&quot;{transcription}&quot;</p>
                  <button 
                    onClick={() => setStep('summary')}
                    className="mt-6 w-full py-4 bg-va-black text-white rounded-xl text-[15px] font-black tracking-widest flex items-center justify-center gap-2"
                  >
                    <VoiceglotText strokeWidth={1.5} translationKey="checkout.mobile.confirm_briefing" defaultText="Bevestig Briefing" / /> <ArrowRight strokeWidth={1.5} size={14} />
                  </button>
                </BentoCard>
              )}
            </motion.div>
          )}

          {step === 'success' && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="py-12 text-center space-y-6"
            >
              <div className="w-24 h-24 bg-green-500/10 text-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 strokeWidth={1.5} size={48} />
              </div>
              <h2 className="text-4xl font-black tracking-tighter">
                <VoiceglotText strokeWidth={1.5} translationKey="checkout.mobile.success_title" defaultText="Bestelling Gelukt!" / />
              </h2>
              <p className="text-va-black/50 font-medium">
                <VoiceglotText strokeWidth={1.5} translationKey="checkout.mobile.success_desc" defaultText="Je ontvangt direct een pushbericht zodra de opname start." / />
              </p>
              <BentoCard className="bg-primary text-va-black p-6 font-black tracking-widest text-[15px] cursor-pointer hover:scale-105 transition-all">
                <VoiceglotText strokeWidth={1.5} translationKey="checkout.mobile.view_cockpit" defaultText="Bekijk Status in Cockpit" / />
              </BentoCard>
            </motion.div>
          )}
        </div>
      </motion.div>
    </div>
  );
};
