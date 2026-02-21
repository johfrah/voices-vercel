"use client";

import React, { useEffect, useState } from 'react';
import { Zap, X, Eye } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';

/**
 *  CODY PREVIEW BANNER
 * 
 * Verschijnt alleen voor admins wanneer er een actieve Live Preview draait.
 */
export const CodyPreviewBanner = () => {
  const { isAdmin } = useAuth();
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    if (!isAdmin) return;
    const checkPreview = () => {
      const active = sessionStorage.getItem('cody_preview_active') === 'true';
      setIsActive(active);
    };

    checkPreview();
    // Luister naar custom events of storage changes
    window.addEventListener('storage', checkPreview);
    const interval = setInterval(checkPreview, 2000);

    return () => {
      window.removeEventListener('storage', checkPreview);
      clearInterval(interval);
    };
  }, [isAdmin]);

  if (!isAdmin) return null;

  const stopPreview = () => {
    sessionStorage.removeItem('cody_preview_active');
    sessionStorage.removeItem('cody_preview_logic');
    setIsActive(false);
    window.location.reload(); // Herlaad om core logica te herstellen
  };

  return (
    <AnimatePresence>
      {isActive && (
        <motion.div 
          initial={{ y: -100 }}
          animate={{ y: 0 }}
          exit={{ y: -100 }}
          className="fixed top-0 left-0 right-0 z-[10002] bg-primary text-white py-2 px-6 flex justify-between items-center shadow-2xl"
        >
          <div className="flex items-center gap-3">
            <div className="bg-white/20 p-1.5 rounded-[20px] animate-pulse">
              <Zap strokeWidth={1.5} size={14} fill="currentColor" />
            </div>
            <div className="flex flex-col">
              <span className="text-[15px] font-black tracking-widest leading-none">Cody Live Preview</span>
              <span className="text-[15px] font-medium opacity-80 leading-tight">Je ziet de site met tijdelijke Shadow Logic.</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-3 py-1 bg-black/10 rounded-full border border-white/10">
              <Eye strokeWidth={1.5} size={12} />
              <span className="text-[15px] font-black tracking-widest">Alleen zichtbaar voor jou</span>
            </div>
            <button 
              onClick={stopPreview}
              className="p-1.5 hover:bg-white/20 rounded-full transition-colors"
              title="Stop Preview"
            >
              <X strokeWidth={1.5} size={18} />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
