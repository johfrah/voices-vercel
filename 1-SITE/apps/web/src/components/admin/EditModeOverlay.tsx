"use client";

import { useEditMode } from '@/contexts/EditModeContext';
import { useSonicDNA } from '@/lib/sonic-dna';
import { DndContext, DragEndEvent, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { AnimatePresence, motion } from 'framer-motion';
import { Layout, Plus, Save, Sparkles, X } from 'lucide-react';
import React from 'react';
import { BentoArchitect } from './BentoArchitect';
import { VoiceglotText } from '../ui/VoiceglotText';

/**
 * ⚡ EDIT MODE OVERLAY (GOD MODE 2026)
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
    <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
      <div className="va-edit-overlay-container">
        <AnimatePresence>
          {isEditMode && (
            <motion.div 
              initial={{ y: 100, opacity: 0, scale: 0.9 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: 100, opacity: 0, scale: 0.9 }}
              transition={{ type: "spring", stiffness: 260, damping: 20 }}
              className="va-admin-toolbar"
            >
              <div className="va-admin-toolbar-status">
                <motion.div 
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="va-status-dot" 
                />
                <div className="va-status-text">
                  <span className="va-status-label">
                    <VoiceglotText translationKey="admin.toolbar.mode" defaultText="Beheer-modus" />
                  </span>
                  <span className="va-status-sublabel">
                    <VoiceglotText translationKey="admin.toolbar.status" defaultText="Systeem Actief" />
                  </span>
                </div>
              </div>
              
              <div className="va-admin-toolbar-actions">
                <button 
                  onMouseEnter={() => playSwell()}
                  onClick={() => playClick('pro')}
                  className="va-admin-btn-action"
                >
                  <Plus strokeWidth={1.5} size={14} className="va-btn-icon-rotate" />
                  <VoiceglotText translationKey="admin.toolbar.add_section" defaultText="Sectie" />
                </button>
                
                <button 
                  onMouseEnter={() => playSwell()}
                  onClick={() => playClick('pop')}
                  className="va-admin-btn-action"
                >
                  <Sparkles strokeWidth={1.5} size={14} className="va-btn-icon-scale" />
                  <VoiceglotText translationKey="admin.toolbar.predictive" defaultText="Predictive" />
                </button>

                <button 
                  onMouseEnter={() => playSwell()}
                  onClick={() => {
                    playClick('pro');
                    setIsArchitectOpen(true);
                  }}
                  className="va-admin-btn-action"
                >
                  <Layout size={14} className="va-btn-icon-scale" />
                  <VoiceglotText translationKey="admin.toolbar.architect" defaultText="Architect" />
                </button>
              </div>

              <BentoArchitect isOpen={isArchitectOpen} onClose={() => setIsArchitectOpen(false)} />

              <div className="va-admin-toolbar-controls">
                <button 
                  onMouseEnter={() => playSwell()}
                  onClick={() => {
                    playClick('unlock');
                    toggleEditMode();
                  }}
                  className="va-admin-btn-close"
                >
                  <X strokeWidth={1.5} size={16} />
                </button>
                <button 
                  onMouseEnter={() => playSwell()}
                  onClick={() => playClick('success')}
                  className="va-admin-btn-save"
                >
                  <Save size={14} />
                  <VoiceglotText translationKey="admin.toolbar.save" defaultText="Opslaan" />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {children}
      </div>
    </DndContext>
  );
};
