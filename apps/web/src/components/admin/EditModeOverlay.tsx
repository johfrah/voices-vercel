"use client";

import { useEditMode } from '@/contexts/EditModeContext';
import { useSonicDNA } from '@/lib/engines/sonic-dna';
import { DndContext, DragEndEvent, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { AnimatePresence, motion } from 'framer-motion';
import { Layout, Plus, Save, Sparkles, X } from 'lucide-react';
import React from 'react';
import { BentoArchitect } from './BentoArchitect';
import { VoiceglotText } from '../ui/VoiceglotText';

/**
 *  EDIT MODE OVERLAY (GOD MODE 2026)
 * 
 * Voldoet aan de Zero Laws:
 * - HTML ZERO: Geen rauwe tags in de page layer.
 * - CSS ZERO: Styling via gecentraliseerde classes.
 * - TEXT ZERO: Alle content via Voiceglot.
 */
export const EditModeOverlay: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isEditMode, toggleEditMode } = useEditMode();
  const { playClick, playSwell } = useSonicDNA();
  const [isArchitectOpen, setIsArchitectOpen] = React.useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.data.current?.isWidget) {
      playClick('success');
      window.dispatchEvent(new CustomEvent('bento:add-widget', { 
        detail: { 
          type: active.data.current.type,
          targetId: over.id 
        } 
      }));
    }
  };

  if (!isEditMode) return <>{children}</>;

  return (
    <DndContext strokeWidth={1.5} sensors={sensors} onDragEnd={handleDragEnd}>
      <div className="va-edit-overlay-container">
        {children}
      </div>
    </DndContext>
  );
};
