"use client";

import { useSonicDNA } from '@/lib/sonic-dna';
import React, { useState } from 'react';
import { ButtonInstrument, InputInstrument, HeadingInstrument, TextInstrument } from '../ui/LayoutInstruments';
import { motion } from 'framer-motion';
import { X, Mail, ArrowRight, ShoppingBag, Plus } from 'lucide-react';
import { VoiceglotText } from '../ui/VoiceglotText';

interface AddToCartEmailModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (email: string, action: 'checkout' | 'continue') => void;
  initialEmail?: string;
}

export const AddToCartEmailModal: React.FC<AddToCartEmailModalProps> = ({ 
  isOpen, 
  onClose, 
  onConfirm,
  initialEmail = ''
}) => {
  const { playClick } = useSonicDNA();
  const [email, setEmail] = useState(initialEmail);
  const [error, setError] = useState('');

  const handleAction = (action: 'checkout' | 'continue') => {
    if (!email || !email.includes('@')) {
      setError('Voer een geldig e-mailadres in');
      playClick('error');
      return;
    }
    playClick('deep');
    onConfirm(email, action);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-6 bg-va-black/95 backdrop-blur-xl">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="w-full max-w-xl bg-white rounded-[40px] shadow-aura overflow-hidden relative z-[10001]"
      >
        <button 
          onClick={() => {
            playClick('soft');
            onClose();
          }}
          className="absolute top-6 right-6 text-va-black/20 hover:text-va-black transition-colors"
        >
          <X size={24} strokeWidth={1.5} />
        </button>

        <div className="p-12 space-y-10">
          <div className="text-center space-y-4">
            <div className="w-20 h-20 bg-primary/5 rounded-3xl flex items-center justify-center mx-auto text-primary animate-in zoom-in duration-500">
              <ShoppingBag size={40} strokeWidth={1.2} />
            </div>
            <HeadingInstrument level={2} className="text-4xl font-light tracking-tighter text-va-black">
              <VoiceglotText translationKey="checkout.modal.title" defaultText="Project gestart!" />
            </HeadingInstrument>
            <TextInstrument className="text-lg text-va-black/40 font-light leading-relaxed max-w-xs mx-auto">
              <VoiceglotText translationKey="checkout.modal.subtitle" defaultText="Voer je e-mailadres in om je selectie en tarieven veilig te bewaren." />
            </TextInstrument>
          </div>

          <div className="space-y-8">
            <div className="space-y-3">
              <InputInstrument 
                type="email"
                placeholder="jouw@email.be"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (error) setError('');
                }}
                autoFocus
                className="w-full text-center text-xl py-6 !rounded-2xl border-va-black/5 focus:border-primary/30 transition-all shadow-sm"
              />
              {error && (
                <p className="text-red-500 text-[10px] font-bold uppercase tracking-widest text-center animate-shake">{error}</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button 
                onClick={() => handleAction('continue')}
                className="order-2 md:order-1 py-5 px-6 text-[13px] font-bold tracking-widest text-va-black/40 hover:text-va-black transition-all uppercase border border-va-black/5 rounded-2xl hover:bg-va-off-white flex items-center justify-center gap-2 group"
              >
                <Plus size={16} className="group-hover:rotate-90 transition-transform duration-300" />
                <VoiceglotText translationKey="checkout.modal.add_more" defaultText="Stem toevoegen" />
              </button>

              <ButtonInstrument 
                onClick={() => handleAction('checkout')}
                className="order-1 md:order-2 py-5 px-8 text-[13px] font-bold tracking-widest uppercase !rounded-2xl !bg-va-black !text-white flex items-center justify-center gap-3 group hover:!bg-primary transition-all shadow-aura-lg hover:scale-[1.02] active:scale-[0.98]"
              >
                <VoiceglotText translationKey="checkout.modal.finish" defaultText="Naar kassa" />
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </ButtonInstrument>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
