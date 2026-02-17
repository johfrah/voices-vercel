"use client";

import React, { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Music, Play, Pause, Check, Search, X } from 'lucide-react';
import { useCheckout } from '@/contexts/CheckoutContext';
import { useGlobalAudio } from '@/contexts/GlobalAudioContext';
import { useSonicDNA } from '@/lib/sonic-dna';
import { cn } from '@/lib/utils';
import { ContainerInstrument, TextInstrument } from '../ui/LayoutInstruments';

interface MusicItem {
  id: string;
  title: string;
  vibe: string;
  preview: string;
}

export const MusicSelector: React.FC = () => {
  const { state, updateMusic } = useCheckout();
  const { activeDemo, isPlaying: globalIsPlaying, playDemo, stopDemo, setIsPlaying: setGlobalIsPlaying } = useGlobalAudio();
  const { playClick } = useSonicDNA();
  
  const [tracks, setTracks] = useState<MusicItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchMusic = async () => {
      try {
        const res = await fetch('/api/media/music');
        const data = await res.json();
        setTracks(data);
      } catch (err) {
        console.error('Failed to fetch music library:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchMusic();
  }, []);

  const filteredTracks = useMemo(() => {
    if (!searchQuery) return tracks;
    const lowQuery = searchQuery.toLowerCase();
    return tracks.filter(t => 
      t.title.toLowerCase().includes(lowQuery) || 
      t.vibe.toLowerCase().includes(lowQuery)
    );
  }, [tracks, searchQuery]);

  const handleTrackSelect = (track: MusicItem) => {
    playClick('pro');
    const isSelected = state.music.trackId === track.id;
    updateMusic({ 
      trackId: isSelected ? null : track.id,
      asBackground: !isSelected 
    });
  };

  const togglePreview = (e: React.MouseEvent, track: MusicItem) => {
    e.stopPropagation();
    
    if (activeDemo?.id === track.id) {
      setGlobalIsPlaying(!globalIsPlaying);
      playClick(globalIsPlaying ? 'light' : 'pro');
    } else {
      playClick('pro');
      playDemo({
        id: track.id,
        title: track.title,
        audio_url: track.preview,
        category: 'music',
        actor_name: 'Muziek Mix'
      });
    }
  };

  if (isLoading) return (
    <div className="py-8 text-center">
      <div className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-2" />
      <span className="text-[10px] font-bold text-va-black/20 uppercase tracking-widest">Bibliotheek laden...</span>
    </div>
  );

  return (
    <motion.div 
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      className="mt-4 space-y-4 overflow-hidden"
    >
      <div className="relative group">
        <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-va-black/20 group-focus-within:text-primary transition-colors" />
        <input 
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Zoek op vibe of titel (bijv. 'corporate', 'rustig')..."
          className="w-full bg-white border border-black/[0.03] rounded-xl py-3 pl-10 pr-4 text-[13px] font-light focus:ring-2 focus:ring-primary/10 transition-all outline-none"
        />
        {searchQuery && (
          <button onClick={() => setSearchQuery('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-va-black/20 hover:text-va-black">
            <X size={14} />
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-[300px] overflow-y-auto no-scrollbar pr-1">
        {filteredTracks.map((track) => {
          const isSelected = state.music.trackId === track.id;
          const isCurrentPreview = activeDemo?.id === track.id;
          const isPlaying = isCurrentPreview && globalIsPlaying;

          return (
            <button
              key={track.id}
              onClick={() => handleTrackSelect(track)}
              className={cn(
                "flex items-center gap-3 p-3 rounded-xl border transition-all text-left group/track relative overflow-hidden",
                isSelected 
                  ? "bg-primary/5 border-primary/20 shadow-sm" 
                  : "bg-white border-black/[0.03] hover:border-black/10"
              )}
            >
              <div 
                onClick={(e) => togglePreview(e, track)}
                className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-all duration-500",
                  isPlaying ? "bg-primary text-white scale-110" : "bg-va-off-white text-va-black/20 group-hover/track:text-primary"
                )}
              >
                {isPlaying ? <Pause size={16} fill="currentColor" /> : <Play size={16} className="ml-0.5" fill="currentColor" />}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className={cn("text-[12px] font-bold truncate", isSelected ? "text-primary" : "text-va-black")}>
                  {track.title}
                </div>
                <div className="text-[10px] text-va-black/40 uppercase tracking-widest font-medium truncate">
                  {track.vibe || 'Rechtenvrij'}
                </div>
              </div>

              {isSelected && (
                <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center animate-in zoom-in duration-300">
                  <Check size={12} className="text-white" strokeWidth={3} />
                </div>
              )}
            </button>
          );
        })}
      </div>

      {filteredTracks.length === 0 && (
        <div className="py-12 text-center bg-va-off-white/50 rounded-2xl border border-dashed border-black/5">
          <Music size={24} className="mx-auto text-va-black/10 mb-2" />
          <TextInstrument className="text-[13px] text-va-black/40 italic">Geen muziek gevonden voor deze zoekopdracht.</TextInstrument>
        </div>
      )}
    </motion.div>
  );
};
