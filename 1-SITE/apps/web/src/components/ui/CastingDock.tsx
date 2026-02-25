"use client";

import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { usePathname } from 'next/navigation';


import { 
  ContainerInstrument, 
  ButtonInstrument, 
  TextInstrument 
} from '@/components/ui/LayoutInstruments';
import { LucideX, LucideChevronRight, Heart, Users, Link as LinkIcon, Loader2 } from 'lucide-react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { useVoicesState } from '@/contexts/VoicesStateContext';
import { VoiceglotText } from '@/components/ui/VoiceglotText';
import { useTranslation } from '@/contexts/TranslationContext';
import { useSonicDNA } from '@/lib/engines/sonic-dna';
import { VoicesLink, useVoicesRouter } from '@/components/ui/VoicesLink';
import { MarketManagerServer as MarketManager } from '@/lib/system/market-manager-server';
import { useAuth } from '@/contexts/AuthContext';
import toast from 'react-hot-toast';

/**
 * PREMIUM CASTING DOCK (GOD MODE 2026)
 * Focus: High-End Curation & Action
 * Volgens Chris-Protocol: 100ms feedback, Liquid DNA
 */
export const CastingDock = () => {
  const pathname = usePathname();
  const router = useVoicesRouter();
  const { state, toggleActorSelection } = useVoicesState();
  const { playClick } = useSonicDNA();
  const { isAdmin } = useAuth();
  const { t } = useTranslation();
  const [isGeneratingLink, setIsGeneratingLink] = useState(false);
  const selectedActors = state.selected_actors;
  
  const market = MarketManager.getCurrentMarket();
  
  //  CHRIS-PROTOCOL: Geen CastingDock op Artist, Portfolio, Voice of Launchpad pagina's
  const isExcludedMarket = ['ARTIST', 'PORTFOLIO', 'ADEMING'].includes(market.market_code);
  const isExcludedPage = isExcludedMarket || 
                         pathname?.startsWith('/casting/launchpad');
  const isVisible = selectedActors.length > 0 && !isExcludedPage;

  const removeActor = (e: React.MouseEvent, actor: any) => {
    e.stopPropagation();
    playClick('soft');
    toggleActorSelection(actor);
  };

  const startCasting = () => {
    playClick('pro');
    router.push('/casting/launchpad/');
  };

  const generateQuickLink = async () => {
    if (isGeneratingLink || selectedActors.length === 0) return;
    
    setIsGeneratingLink(true);
    playClick('pro');

    try {
      const res = await fetch('/api/admin/casting/quick-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          actorIds: selectedActors.map(a => a.id)
        })
      });

      const data = await res.json();
      if (data.success) {
        const fullUrl = `${window.location.origin}${data.url}`;
        await navigator.clipboard.writeText(fullUrl);
        toast.success(t('admin.casting.link_copied', 'Pitch link gekopieerd naar klembord!'));
        playClick('success');
      } else {
        throw new Error(data.error);
      }
    } catch (err) {
      console.error('Failed to generate quick link:', err);
      toast.error('Fout bij genereren link.');
    } finally {
      setIsGeneratingLink(false);
    }
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: 100, opacity: 0, scale: 0.9 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: 100, opacity: 0, scale: 0.9 }}
          transition={{ type: "spring", damping: 20, stiffness: 300 }}
          className="fixed bottom-8 left-0 right-0 z-[150] pointer-events-none flex justify-center px-6"
        >
          <ContainerInstrument 
            plain
            className="bg-va-black shadow-[0_32px_128px_rgba(0,0,0,0.8)] rounded-full p-2 border border-white/10 pointer-events-auto relative overflow-hidden flex items-center justify-center gap-2 md:gap-8 backdrop-blur-2xl bg-va-black/90 w-fit"
          >
            {/*  ACTOR AVATARS (Liquid Stack) */}
            <div className="flex items-center pl-2 shrink-0 scale-90 md:scale-100">
              <div className="flex -space-x-4 md:-space-x-3">
                {selectedActors.slice(0, 5).map((actorItem, idx) => (
                  <motion.div 
                    key={actorItem.id}
                    layoutId={`avatar-${actorItem.id}`}
                    className="relative w-12 h-14 rounded-full overflow-hidden border-2 border-va-black bg-va-off-white shadow-xl group cursor-pointer"
                    onClick={(e) => removeActor(e, actorItem)}
                  >
                    {(actorItem.photo_url && actorItem.photo_url !== 'NULL') || (actorItem.photoUrl && actorItem.photoUrl !== 'NULL') ? (
                      <Image src={actorItem.photo_url || actorItem.photoUrl} alt={actorItem.first_name || actorItem.display_name} fill className="object-cover transition-transform group-hover:scale-110" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-va-black font-bold text-sm">
                        {(actorItem.first_name || actorItem.display_name || 'S')[0]}
                      </div>
                    )}
                    {/* Remove Overlay on Hover */}
                    <div className="absolute inset-0 bg-primary/80 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <LucideX size={14} className="text-white" strokeWidth={3} />
                    </div>
                  </motion.div>
                ))}
                {selectedActors.length > 5 && (
                  <div className="relative w-12 h-12 rounded-full bg-va-off-white border-2 border-va-black flex items-center justify-center text-va-black font-bold text-xs shadow-xl z-10">
                    +{selectedActors.length - 5}
                  </div>
                )}
              </div>
            </div>

            {/*  SELECTION INFO */}
            <div className="py-1 shrink-0 hidden sm:block">
              <div className="flex items-center gap-2">
                <Users size={14} className="text-primary" />
                <TextInstrument className="text-white font-light text-[17px] tracking-tight truncate leading-tight block">
                  {selectedActors.length} <VoiceglotText translationKey={selectedActors.length === 1 ? 'common.voice' : 'common.voices'} defaultText={selectedActors.length === 1 ? 'stem' : 'stemmen'} />
                </TextInstrument>
              </div>
              <TextInstrument className="text-white/40 text-[11px] font-bold tracking-[0.1em] uppercase truncate mt-0.5 ml-5">
                <VoiceglotText translationKey="auto.castingdock.jouw_selectie" defaultText="Jouw selectie" />
              </TextInstrument>
            </div>

            {/*  ACTION BUTTONS */}
            <div className="flex items-center gap-2 shrink-0">
              {isAdmin && (
                <button 
                  onClick={generateQuickLink}
                  disabled={isGeneratingLink}
                  className="bg-white/10 hover:bg-white/20 text-white h-12 md:h-14 px-4 md:px-6 rounded-full flex items-center gap-2 transition-all hover:scale-105 active:scale-95 border border-white/5 group/admin shrink-0"
                  title="Genereer direct een deelbare link (Admin Only)"
                >
                  {isGeneratingLink ? (
                    <Loader2 size={18} className="animate-spin text-primary" />
                  ) : (
                    <LinkIcon size={18} strokeWidth={2.5} className="text-primary group-hover/admin:rotate-12 transition-transform" />
                  )}
                  <div className="flex flex-col items-start hidden md:flex">
                    <span className="text-[12px] font-bold tracking-widest uppercase leading-none">
                      <VoiceglotText translationKey="admin.casting.quick_link" defaultText="Admin Link" />
                    </span>
                    <span className="text-[9px] font-medium opacity-50 leading-none mt-1 uppercase">
                      Direct kopiëren
                    </span>
                  </div>
                </button>
              )}

              <button 
                onClick={startCasting}
                className="bg-primary hover:bg-primary/90 text-white h-12 md:h-14 px-4 md:px-6 rounded-full flex items-center gap-2 md:gap-3 transition-all hover:scale-105 active:scale-95 shadow-xl group/btn shrink-0"
              >
                <Heart size={18} strokeWidth={2.5} className="group-hover:animate-pulse md:w-5 md:h-5 fill-white/20" />
                <div className="flex flex-col items-start">
                  <span className="text-[12px] md:text-[14px] font-bold tracking-widest uppercase leading-none">
                    <VoiceglotText translationKey="auto.castingdock.proefopname" defaultText="Gratis proefopname" />
                  </span>
                  <span className="text-[9px] md:text-[10px] font-medium opacity-70 leading-none mt-1 uppercase">
                    <VoiceglotText translationKey="auto.castingdock.start_selectie" defaultText="Bevestig selectie" />
                  </span>
                </div>
                <LucideChevronRight size={16} strokeWidth={2.5} className="group-hover:translate-x-1 transition-transform md:w-5 md:h-5" />
              </button>
            </div>
          </ContainerInstrument>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
