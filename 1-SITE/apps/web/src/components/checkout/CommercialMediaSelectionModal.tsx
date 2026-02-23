"use client";

import { useSonicDNA } from '@/lib/engines/sonic-dna';
import React, { useState } from 'react';
import { ButtonInstrument, HeadingInstrument, TextInstrument } from '../ui/LayoutInstruments';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Megaphone, Video, Radio, Mic, ChevronRight, Check } from 'lucide-react';
import { VoiceglotText } from '../ui/VoiceglotText';
import { cn } from '@/lib/utils';

interface CommercialMediaSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (selectedMedia: string[]) => void;
  initialMedia?: string[];
}

const mediaOptions = [
  { id: 'online', label: 'Online / Social', icon: Video, description: 'Web, Social Media' },
  { id: 'radio_national', label: 'Radio', icon: Radio, description: 'Landelijke Radio' },
  { id: 'tv_national', label: 'TV', icon: Tv, description: 'Landelijke TV' },
  { id: 'podcast', label: 'Podcast', icon: Mic, description: 'In-podcast Ads' },
];

// Re-using icons from Lucide
function Tv(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect width="20" height="15" x="2" y="7" rx="2" ry="2" />
      <polyline points="7 2 12 7 17 2" />
    </svg>
  )
}

export const CommercialMediaSelectionModal: React.FC<CommercialMediaSelectionModalProps> = ({ 
  isOpen, 
  onClose, 
  onConfirm,
  initialMedia = []
}) => {
  const { playClick } = useSonicDNA();
  const [selectedMedia, setSelectedMedia] = useState<string[]>(initialMedia);

  const toggleMedia = (id: string) => {
    playClick('light');
    if (selectedMedia.includes(id)) {
      setSelectedMedia(selectedMedia.filter(m => m !== id));
    } else {
      setSelectedMedia([...selectedMedia, id]);
    }
  };

  const handleConfirm = () => {
    if (selectedMedia.length === 0) {
      playClick('error');
      return;
    }
    playClick('deep');
    onConfirm(selectedMedia);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-6 bg-va-black/95 backdrop-blur-xl">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="w-full max-w-2xl bg-white rounded-[40px] shadow-aura overflow-hidden relative z-[10001]"
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
              <Megaphone size={40} strokeWidth={1.2} />
            </div>
            <HeadingInstrument level={2} className="text-4xl font-light tracking-tighter text-va-black">
              <VoiceglotText translationKey="configurator.media_modal.title" defaultText="Waarvoor wordt de commercial gebruikt?" />
            </HeadingInstrument>
            <TextInstrument className="text-lg text-va-black/40 font-light leading-relaxed max-w-md mx-auto">
              <VoiceglotText translationKey="configurator.media_modal.subtitle" defaultText="Selecteer ten minste één kanaal om de juiste licenties te berekenen." />
            </TextInstrument>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {mediaOptions.map((opt) => {
              const isSelected = selectedMedia.includes(opt.id);
              return (
                <button
                  key={opt.id}
                  onClick={() => toggleMedia(opt.id)}
                  className={cn(
                    "flex items-center gap-4 p-6 rounded-[24px] border transition-all duration-500 text-left group relative overflow-hidden",
                    isSelected 
                      ? "bg-va-black text-white border-va-black shadow-lg scale-[1.02]" 
                      : "bg-va-off-white/50 border-black/[0.03] text-va-black/40 hover:border-black/10 hover:bg-white"
                  )}
                >
                  <div className={cn(
                    "w-12 h-12 rounded-2xl flex items-center justify-center transition-colors",
                    isSelected ? "bg-primary text-white" : "bg-white text-va-black/20 shadow-sm"
                  )}>
                    <opt.icon size={24} strokeWidth={1.5} />
                  </div>
                  <div className="flex-1">
                    <div className={cn("text-[15px] font-bold tracking-tight", isSelected ? "text-white" : "text-va-black")}>{opt.label}</div>
                    <div className={cn("text-[11px] font-medium opacity-60")}>{opt.description}</div>
                  </div>
                  {isSelected && (
                    <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                      <Check size={14} strokeWidth={3} className="text-white" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          <div className="pt-4">
            <ButtonInstrument 
              onClick={handleConfirm}
              disabled={selectedMedia.length === 0}
              className={cn(
                "w-full py-6 text-lg !rounded-[24px] !bg-va-black !text-white flex items-center justify-center gap-3 group transition-all duration-500 shadow-aura-lg",
                selectedMedia.length === 0 ? "opacity-30 grayscale cursor-not-allowed" : "hover:!bg-primary hover:scale-[1.01] active:scale-[0.98]"
              )}
            >
              <span className="font-bold tracking-widest uppercase text-[13px]">
                Configuratie voltooien
              </span>
              <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </ButtonInstrument>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
