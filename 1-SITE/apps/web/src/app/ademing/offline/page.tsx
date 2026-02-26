"use client";

import React from 'react';
import { Logo } from '@/components/ui/ademing/Logo';
import { ContainerInstrument } from '@/components/ui/LayoutInstruments';
import { motion } from 'framer-motion';

export default function AdemingOfflinePage() {
  return (
    <ContainerInstrument plain className="min-h-screen bg-background flex items-center justify-center overflow-hidden relative">
      {/* Decorative background elements consistent with Ademing branding */}
      <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-primary/3 rounded-full blur-3xl animate-breathe-glow" />
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-primary/5 rounded-full blur-3xl animate-breathe-glow" style={{ animationDelay: '-2s' }} />
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 2, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10"
      >
        <Logo className="scale-150 md:scale-[2]" />
      </motion.div>
    </ContainerInstrument>
  );
}
