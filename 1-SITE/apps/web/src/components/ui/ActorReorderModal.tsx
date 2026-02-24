"use client";

import React, { useState, useEffect } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { 
  X, 
  GripVertical, 
  Save, 
  Loader2, 
  Search as SearchIcon,
  CheckCircle2,
  Clock,
  ShoppingBag
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ContainerInstrument, 
  HeadingInstrument, 
  TextInstrument, 
  ButtonInstrument,
  InputInstrument
} from './LayoutInstruments';
import { VoiceglotText } from './VoiceglotText';
import { VoiceglotImage } from './VoiceglotImage';
import { MarketManagerServer as MarketManager } from '@/lib/system/market-manager-server';
import { cn } from '@/lib/utils';
import { toast } from 'react-hot-toast';

interface SortableActorItemProps {
  actor: any;
  index: number;
}

const SortableActorItem = ({ actor, index }: SortableActorItemProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: actor.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 100 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "flex items-center gap-4 p-4 bg-white rounded-2xl border border-black/5 mb-2 transition-all",
        isDragging ? "shadow-2xl ring-2 ring-primary/20 opacity-90 scale-[1.02]" : "shadow-sm hover:border-primary/10"
      )}
    >
      <div 
        {...attributes} 
        {...listeners} 
        className="cursor-grab active:cursor-grabbing p-2 text-va-black/20 hover:text-va-black/40 transition-colors"
      >
        <GripVertical size={20} />
      </div>
      
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <div className="w-10 h-10 rounded-full bg-va-off-white border border-black/5 overflow-hidden relative shrink-0">
          {actor.photo_url ? (
            <VoiceglotImage src={actor.photo_url} alt={actor.display_name} fill className="object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-va-black/20 font-bold">
              {actor.display_name?.[0]}
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-[14px] font-bold text-va-black truncate">{actor.display_name}</div>
          <div className="text-[11px] text-va-black/40 uppercase tracking-widest">{actor.native_lang_label || actor.native_lang}</div>
        </div>
      </div>

      <div className="flex items-center gap-6">
        <div className="flex items-center gap-4">
          <div className="text-right">
            <div className="text-[9px] font-bold text-va-black/20 uppercase tracking-widest flex items-center gap-1 justify-end">
              <Clock size={10} /> <VoiceglotText translationKey="common.delivery" defaultText="Levering" />
            </div>
            <div className={cn(
              "text-[12px] font-bold",
              (actor.delivery_days_max || 0) <= 1 ? "text-green-500" : "text-va-black/60"
            )}>
              {actor.delivery_days_max ? `${actor.delivery_days_max}d` : '24u'}
            </div>
          </div>
          
          <div className="text-right min-w-[60px]">
            <div className="text-[9px] font-bold text-va-black/20 uppercase tracking-widest flex items-center gap-1 justify-end">
              <ShoppingBag size={10} /> <VoiceglotText translationKey="common.sales" defaultText="Sales" />
            </div>
            <div className="text-[12px] font-bold text-va-black/60">
              {actor.voice_score || 0}
            </div>
          </div>
        </div>

        <div className="text-right min-w-[40px]">
          <div className="text-[9px] font-bold text-va-black/20 uppercase tracking-widest">
            <VoiceglotText translationKey="common.position" defaultText="Positie" />
          </div>
          <div className="text-[14px] font-black text-primary">#{index + 1}</div>
        </div>
      </div>
    </div>
  );
};

interface ActorReorderModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: string;
  actors: any[];
  onSuccess?: () => void;
}

import { useTranslation } from '@/contexts/TranslationContext';

// ... (inside component)

export const ActorReorderModal = ({ isOpen, onClose, language, actors: initialActors, onSuccess }: ActorReorderModalProps) => {
  const { market } = useTranslation();
  const [items, setItems] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (isOpen) {
      //  CHRIS-PROTOCOL: Intelligent Market-Aware Sorting (Bob-methode)
      // If "Alle talen" is selected, we sort by market priority first, then menu_order.
      
      const filtered = initialActors
        .filter(a => {
          if (language === 'Alle talen') return true;
          const native = (a.native_lang_label || a.native_lang || '').toLowerCase();
          return native === language.toLowerCase();
        })
        .sort((a, b) => {
          // If sorting "Alle talen", prioritize market primary language
          if (language === 'Alle talen') {
            const getPriorityScore = (actor: any) => {
              const actorNative = (actor.native_lang_label || actor.native_lang || '').toLowerCase();
              const primaryLang = market.primary_language.toLowerCase();
              
              // 1. Primary Language of the market
              if (actorNative === primaryLang) return 1;
              
              // 2. English (Global standard)
              if (actorNative === 'engels' || actorNative === 'en-gb' || actorNative === 'en-us') return 2;
              
              // 3. Market-specific secondary priorities
              if (market.market_code === 'BE') {
                if (actorNative === 'nederlands') return 3;
                if (actorNative === 'frans') return 4;
                if (actorNative === 'duits') return 5;
              } else if (market.market_code === 'NLNL') {
                if (actorNative === 'vlaams') return 3;
                if (actorNative === 'duits') return 4;
                if (actorNative === 'frans') return 5;
              }
              
              return 100;
            };

            const scoreA = getPriorityScore(a);
            const scoreB = getPriorityScore(b);
            if (scoreA !== scoreB) return scoreA - scoreB;
          }

          return (a.menu_order || 0) - (b.menu_order || 0);
        });
      
      setItems(filtered);
    }
  }, [isOpen, initialActors, language]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setItems((prev) => {
        const oldIndex = prev.findIndex((item) => item.id === active.id);
        const newIndex = prev.findIndex((item) => item.id === over.id);
        return arrayMove(prev, oldIndex, newIndex);
      });
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Map new order to menu_order values (1-based)
      const orders = items.map((item, idx) => ({
        id: item.id,
        menuOrder: idx + 1
      }));

      const res = await fetch('/api/admin/actors/reorder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orders })
      });

      if (res.ok) {
        toast.success(`Volgorde voor ${language} opgeslagen!`);
        if (onSuccess) onSuccess();
        setTimeout(onClose, 500);
      } else {
        throw new Error('Failed to save order');
      }
    } catch (err) {
      console.error('Save reorder failed:', err);
      toast.error('Fout bij het opslaan van de volgorde.');
    } finally {
      setIsSaving(false);
    }
  };

  const filteredItems = items.filter(item => 
    item.display_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 md:p-10">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-va-black/90 backdrop-blur-md"
        />

        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-2xl bg-va-off-white rounded-[40px] shadow-2xl overflow-hidden flex flex-col max-h-[85vh] z-[10001]"
        >
          {/* Header */}
          <div className="p-8 bg-white border-b border-black/5 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
                <GripVertical size={24} strokeWidth={1.5} />
              </div>
              <div>
                <HeadingInstrument level={3} className="text-2xl font-light tracking-tighter">
                  Sorteer <span className="text-primary italic">{language}</span>
                </HeadingInstrument>
                <TextInstrument className="text-[11px] font-bold text-va-black/20 uppercase tracking-widest">
                  Drag & Drop om de volgorde te bepalen
                </TextInstrument>
              </div>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-va-off-white rounded-full transition-colors">
              <X size={20} />
            </button>
          </div>

          {/* Search & Stats */}
          <div className="px-8 py-4 bg-white/50 border-b border-black/5 flex items-center justify-between gap-4 shrink-0">
            <div className="relative flex-1">
              <SearchIcon size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-va-black/20" />
              <input 
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Zoek binnen deze taal..."
                className="w-full pl-11 pr-4 py-2 bg-white rounded-full text-[14px] border border-black/5 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
              />
            </div>
            <div className="px-4 py-2 bg-va-black text-white rounded-full text-[11px] font-bold tracking-widest uppercase">
              {items.length} Stemmen
            </div>
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto p-8 no-scrollbar">
            <DndContext 
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext 
                items={items.map(i => i.id)}
                strategy={verticalListSortingStrategy}
              >
                {filteredItems.map((actor, idx) => (
                  <SortableActorItem 
                    key={actor.id} 
                    actor={actor} 
                    index={items.findIndex(i => i.id === actor.id)} 
                  />
                ))}
              </SortableContext>
            </DndContext>

            {filteredItems.length === 0 && (
              <div className="py-20 text-center opacity-20">
                <SearchIcon size={48} className="mx-auto mb-4" />
                <TextInstrument className="text-lg font-light">
                  <VoiceglotText translationKey="common.no_voices_found" defaultText="Geen stemmen gevonden voor deze zoekopdracht." />
                </TextInstrument>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-8 bg-white border-t border-black/5 flex justify-between items-center shrink-0">
            <TextInstrument className="text-[11px] text-va-black/40 italic max-w-[240px]">
              <VoiceglotText translationKey="reorder.live_note" defaultText="De nieuwe volgorde is direct live na het opslaan." />
            </TextInstrument>
            <div className="flex gap-3">
              <ButtonInstrument 
                variant="ghost" 
                onClick={onClose}
                className="px-6 py-3 text-[13px] font-bold tracking-widest uppercase text-va-black/40"
              >
                <VoiceglotText translationKey="common.cancel" defaultText="Annuleren" />
              </ButtonInstrument>
              <ButtonInstrument 
                onClick={handleSave}
                disabled={isSaving || items.length === 0}
                className="va-btn-pro !bg-va-black !text-white px-8 py-4 flex items-center gap-2 shadow-xl hover:scale-105 transition-all"
              >
                {isSaving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                <span className="text-[13px] font-bold tracking-widest uppercase">
                  <VoiceglotText translationKey="action.save_order" defaultText="Volgorde Opslaan" />
                </span>
              </ButtonInstrument>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
