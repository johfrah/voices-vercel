"use client";

import { useSonicDNA } from '@/lib/sonic-dna';
import { AnimatePresence, motion } from 'framer-motion';
import {
    ChevronRight,
    Database,
    Layout,
    MousePointer2,
    Music,
    Sparkles,
    Type,
    Users,
    Video
} from 'lucide-react';
import React, { useEffect, useState } from 'react';

import { SystemContext, LayoutSuggestion, LayoutEngine } from '@/lib/predictive-engine';
import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';

interface BuilderWidget {
  type: string;
  label: string;
  icon: React.ReactNode;
  description: string;
}

interface BuilderWidget {
  type: string;
  label: string;
  icon: React.ReactNode;
  description: string;
}

const DraggableWidget: React.FC<{ widget: BuilderWidget }> = ({ widget }) => {
  const { playSwell, playClick } = useSonicDNA();
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `widget-${widget.type}`,
    data: { type: widget.type, isWidget: true }
  });

  const style = {
    transform: CSS.Translate.toString(transform),
    zIndex: isDragging ? 200 : 1,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      onMouseEnter={() => playSwell()}
      onClick={() => playClick('pro')}
      className="group bg-white/5 hover:bg-primary/10 border border-white/5 hover:border-primary/30 p-4 rounded-2xl cursor-grab active:cursor-grabbing transition-all flex items-center gap-4"
    >
      <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center text-white group-hover:text-primary transition-colors">
        {widget.icon}
      </div>
      <div>
        <h4 className="text-[15px] font-black tracking-widest text-white">{widget.label}</h4>
        <p className="text-[15px] text-white/30 font-bold tracking-tighter mt-1">{widget.description}</p>
      </div>
    </div>
  );
};

/**
 * 🏗️ BENTO ARCHITECT - HET ONTWERPPANEEL
 * Beheer-modus: Volledige controle over de structuur.
 */
export const BentoArchitect: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const { playClick, playSwell } = useSonicDNA();
  const [activeTab, setActiveTab] = useState<'widgets' | 'layers' | 'iap'>('widgets');
  const [suggestion, setSuggestion] = useState<LayoutSuggestion | null>(null);
  const [iapContext, setIapContext] = useState<SystemContext>({
    market: 'BE',
    journey: 'Studio',
    persona: 'Quality-Seeker',
    intent: 'browse'
  });

  // Simuleer analyse bij het openen van System tab
  useEffect(() => {
    if (activeTab === 'iap') {
      // We simuleren een fetch van de huidige layout
      const mockLayout = { sections: [] }; 
      const result = LayoutEngine.analyzeLayout(mockLayout, iapContext);
      setSuggestion(result);
    }
  }, [activeTab, iapContext]);

  const handleApplySuggestion = () => {
    playClick('success');
    // Trigger een globaal event dat de PageRenderer kan opvangen
    window.dispatchEvent(new CustomEvent('bento:apply-suggestion', { 
      detail: { suggestion } 
    }));
  };

  const widgets: BuilderWidget[] = [
    { type: 'text', label: 'Tekst Blok', icon: <Type size={18} />, description: 'Voiceglot-ready tekst' },
    { type: 'actor-feed', label: 'Actor Feed', icon: <Users size={18} />, description: 'Live stemmen lijst' },
    { type: 'video', label: 'Video Focus', icon: <Video size={18} />, description: 'Bento video speler' },
    { type: 'audio', label: 'Audio Demo', icon: <Music size={18} />, description: 'Sonic DNA player' },
    { type: 'cta', label: 'Call to Action', icon: <MousePointer2 size={18} />, description: 'Conversie knop' },
    { type: 'grid', label: 'Bento Grid', icon: <Layout size={18} />, description: 'Nieuwe sectie' },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ x: 400, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 400, opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="fixed top-0 right-0 w-[380px] h-full bg-va-black/95 backdrop-blur-3xl z-[150] border-l border-white/10 shadow-2xl flex flex-col"
        >
          {/* Header */}
          <div className="p-8 border-b border-white/10">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
                  <Layout size={18} className="text-white" />
                </div>
              <h2 className="text-sm font-black tracking-[0.2em] text-white">Architect</h2>
            </div>
            <button 
              onClick={() => { playClick('soft'); onClose(); }}
              className="text-white/40 hover:text-white transition-colors"
            >
              <ChevronRight size={24} />
            </button>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 bg-white/5 p-1 rounded-xl">
            {(['widgets', 'layers', 'iap'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => { playClick('soft'); setActiveTab(tab); }}
                className={`flex-1 py-2 text-[15px] font-black uppercase tracking-widest rounded-lg transition-all ${
                  activeTab === tab ? 'bg-white/10 text-white shadow-sm' : 'text-white/30 hover:text-white/50'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-8 space-y-8">
            {activeTab === 'widgets' && (
              <div className="space-y-4">
                <h3 className="text-[15px] font-black tracking-widest text-white/40">Componenten</h3>
                <div className="grid grid-cols-1 gap-3">
                  {widgets.map((widget) => (
                    <DraggableWidget key={widget.type} widget={widget} />
                  ))}
                </div>
              </div>
            )}


            {activeTab === 'iap' && (
              <div className="space-y-6">
                <h3 className="text-[15px] font-black tracking-widest text-white/40">Systeem Simulatie</h3>
                
                {/* Persona Selector */}
                <div className="grid grid-cols-2 gap-2">
                  {(['Quality-Seeker', 'Price-Conscious', 'Speed-Runner', 'Creative-Explorer'] as const).map(p => (
                    <button
                      key={p}
                      onClick={() => setIapContext(prev => ({ ...prev, persona: p }))}
                      className={`p-2 text-[15px] font-black uppercase tracking-tighter rounded-lg border transition-all ${
                        iapContext.persona === p 
                        ? 'bg-primary/20 border-primary text-primary' 
                        : 'bg-white/5 border-white/5 text-white/40 hover:text-white'
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>

                {suggestion && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-primary/10 border border-primary/20 p-6 rounded-2xl space-y-4"
                  >
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-3 text-primary">
                        <Sparkles size={16} />
                        <span className="text-[15px] font-black tracking-widest">Predictive Layout</span>
                      </div>
                      <div className="text-xl font-black text-primary">{suggestion.score}%</div>
                    </div>
                    
                    <p className="text-[15px] text-white/60 font-medium leading-relaxed">
                      {suggestion.reasoning}
                    </p>

                    <div className="space-y-2">
                      {suggestion.suggestedChanges.map((change, i) => (
                        <div key={i} className="text-[15px] font-bold tracking-widest text-white/30 flex items-center gap-2">
                          <div className="w-1 h-1 bg-primary rounded-full" />
                          {change.action} {change.targetSpan || 'position'}
                        </div>
                      ))}
                    </div>

                    <button 
                      onClick={handleApplySuggestion}
                      className="w-full bg-primary text-white py-3 rounded-xl text-[15px] font-black tracking-widest hover:scale-105 transition-all shadow-lg shadow-primary/20"
                    >
                      Apply Suggestion
                    </button>
                  </motion.div>
                )}
              </div>
            )}

          </div>

          {/* Footer */}
          <div className="p-8 border-t border-white/10 bg-black/20">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2 text-[15px] font-black tracking-widest text-white/40">
                <Database size={12} />
                Atomic Sync
              </div>
              <div className="text-[15px] font-black text-primary">LIVE</div>
            </div>
            <p className="text-[15px] text-white/20 font-medium italic">
              Elke wijziging wordt direct als atomic block opgeslagen in de Master Registry.
            </p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
