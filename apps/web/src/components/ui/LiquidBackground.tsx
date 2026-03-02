"use client";

import React from 'react';

/**
 * LIQUID BACKGROUND INSTRUMENT
 * 
 * Beheert de visuele 'Tone of Voice' achtergrond.
 */
export const LiquidBackground: React.FC<{ strokeWidth?: number }> = () => {
  return (
    <div className="fixed inset-0 z-0 pointer-events-none opacity-40">
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full hred blur-[120px]"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full hblue blur-[120px]"></div>
    </div>
  );
};
