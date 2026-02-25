"use client";

import { useSonicDNA } from '@/lib/engines/sonic-dna';
import { useGlobalAudio } from '@/contexts/GlobalAudioContext';
import { useVoicesState } from '@/contexts/VoicesStateContext';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Demo } from '@/types';
import { AnimatePresence, motion } from 'framer-motion';
import { Check, Edit2, Pause, Play, Save, Trash2, Volume2, X } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import {
    ButtonInstrument,
    ContainerInstrument,
    FlagBE,
    FlagDE,
    FlagDK,
    FlagES,
    FlagFR,
    FlagIT,
    FlagNL,
    FlagPL,
    FlagPT,
    FlagUK,
    FlagUS,
    TextInstrument
} from './LayoutInstruments';
import { VoiceglotImage } from './VoiceglotImage';

interface MediaMasterProps {
  demo: Demo;
  onClose?: () => void;
}

/**
 *  CHRIS-PROTOCOL: Flag Orchestrator (Synced with VoiceCard)
 */
const VoiceFlag = ({ lang, size = 16 }: { lang?: string, size?: number }) => {
  if (!lang) return null;
  const lowLang = lang.toLowerCase();
  
  if (lowLang.includes('be') || lowLang === 'vlaams') return <FlagBE size={size} />;
  if (lowLang.includes('nl') || lowLang === 'nederlands') return <FlagNL size={size} />;
  if (lowLang.includes('fr') || lowLang === 'frans') return <FlagFR size={size} />;
  if (lowLang.includes('de') || lowLang === 'duits') return <FlagDE size={size} />;
  if (lowLang.includes('gb') || lowLang.includes('uk') || lowLang === 'engels') return <FlagUK size={size} />;
  if (lowLang.includes('us')) return <FlagUS size={size} />;
  if (lowLang.includes('es') || lowLang === 'spaans') return <FlagES size={size} />;
  if (lowLang.includes('it') || lowLang === 'italiaans') return <FlagIT size={size} />;
  if (lowLang.includes('pl') || lowLang === 'pools') return <FlagPL size={size} />;
  if (lowLang.includes('dk') || lowLang === 'deens') return <FlagDK size={size} />;
  if (lowLang.includes('pt') || lowLang === 'portugees') return <FlagPT size={size} />;
  
  return null;
};

export const MediaMaster: React.FC<MediaMasterProps> = ({ demo, onClose }) => {
  const pathname = usePathname();
  const { state: voicesState } = useVoicesState();
  const { playlist, isPlaying, setIsPlaying, playDemo, activeDemo, setActiveDemo } = useGlobalAudio();
  const { isAdmin } = useAuth();
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [isDeleting, setIsDeleting] = useState<number | null>(null);
  const selectedActors = voicesState.selected_actors;

  //  CHRIS-PROTOCOL: Geen CastingDock op Artist, Voice of Launchpad pagina's (sync met CastingDock.tsx)
  const isExcludedPage = pathname?.startsWith('/artist/') || 
                         pathname?.startsWith('/voice/') || 
                         pathname?.startsWith('/casting/launchpad');
  
  const hasCastingDock = selectedActors.length > 0 && !isExcludedPage;

  //  CHRIS-PROTOCOL: Clean demo titles for display
  const cleanDemoTitle = (title: string, category?: string) => {
    if (category) {
      const cat = category.toLowerCase();
      if (cat.includes('telephony') || cat.includes('iv')) return 'Telefonie';
      if (cat.includes('corporate') || cat.includes('video')) return 'Corporate';
      if (cat.includes('commercial') || cat.includes('advertentie')) return 'Commercial';
    }

    if (!title) return '';
    
    // Remove file extensions
    let clean = title.replace(/\.(mp3|wav|ogg|m4a)$/i, '');
    
    // Remove common technical prefixes/suffixes (e.g., product IDs, language codes)
    clean = clean.replace(/^[a-z]+-A-\d+-/i, ''); // Remove "mona-A-258121-"
    clean = clean.replace(/-(flemish|dutch|french|english|german|voiceover|demo|voices)/gi, ' ');
    clean = clean.replace(/-/g, ' ');
    
    // Natural Capitalization
    clean = clean.charAt(0).toUpperCase() + clean.slice(1).toLowerCase();
    
    return clean.trim();
  };

  const { playClick } = useSonicDNA();
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (audioRef.current) {
      const audio = audioRef.current;
      // Don't reset isPlaying here, let the context handle it
      setProgress(0);
      
      const playAudio = () => {
        audio.play()
          .then(() => setIsPlaying(true))
          .catch((err) => {
            console.error("Autoplay failed:", err);
            setIsPlaying(false);
          });
      };

      const timer = setTimeout(playAudio, 100);
      return () => clearTimeout(timer);
    }
  }, [demo.audio_url, setIsPlaying]);

  // Sync audio element with context isPlaying state
  useEffect(() => {
    if (audioRef.current) {
      if (isPlaying && audioRef.current.paused) {
        audioRef.current.play().catch(err => console.error("Sync play failed:", err));
      } else if (!isPlaying && !audioRef.current.paused) {
        audioRef.current.pause();
      }
    }
  }, [isPlaying]);

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        audioRef.current.play()
          .then(() => setIsPlaying(true))
          .catch(err => console.error("Playback failed:", err));
      }
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      const current = audioRef.current.currentTime;
      const total = audioRef.current.duration;
      if (total > 0) {
        setProgress((current / total) * 100);
      }
      
      //  CHRIS-PROTOCOL: Force sync state if audio element and context differ
      if (!audioRef.current.paused && !isPlaying) {
        setIsPlaying(true);
      } else if (audioRef.current.paused && isPlaying) {
        setIsPlaying(false);
      }
    }
  };

  const handleError = (e: any) => {
    console.error(" MediaMaster: Audio error", {
      url: demo.audio_url,
      error: e.target.error,
      code: e.target.error?.code
    });
    setIsPlaying(false);
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

  const handleRename = async (e: React.MouseEvent, p: Demo) => {
    e.stopPropagation();
    if (editingId === p.id) {
      // Save
      try {
        const res = await fetch(`/api/admin/actors/demos/${p.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title: editTitle })
        });
        if (res.ok) {
          playClick('success');
          // Update local state in playlist and activeDemo
          p.title = editTitle;
          if (activeDemo?.id === p.id) {
            setActiveDemo({ ...activeDemo, title: editTitle });
          }
          setEditingId(null);
        }
      } catch (err) {
        console.error('Failed to rename demo:', err);
      }
    } else {
      setEditingId(p.id);
      setEditTitle(p.title);
      playClick('pro');
    }
  };

  const handleDelete = async (e: React.MouseEvent, p: Demo) => {
    e.stopPropagation();
    if (isDeleting === p.id) {
      try {
        const res = await fetch(`/api/admin/actors/demos/${p.id}`, {
          method: 'DELETE'
        });
        if (res.ok) {
          playClick('success');
          // Als dit de actieve demo is, stop dan
          if (activeDemo?.id === p.id) {
            onClose?.();
          } else {
            // Verwijder uit playlist (dit is een hacky way om UI te updaten zonder context refresh)
            const idx = playlist.findIndex(item => item.id === p.id);
            if (idx > -1) playlist.splice(idx, 1);
            setIsDeleting(null);
          }
        }
      } catch (err) {
        console.error('Failed to delete demo:', err);
      }
    } else {
      setIsDeleting(p.id);
      playClick('warning');
      setTimeout(() => setIsDeleting(null), 3000);
    }
  };

  return (
    <motion.div 
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: hasCastingDock ? -80 : 0, opacity: 1 }}
      exit={{ y: 100, opacity: 0 }}
      className="fixed bottom-12 inset-x-0 z-[200] px-6 pointer-events-none"
    >
      <ContainerInstrument 
        plain 
        className="max-w-4xl mx-auto bg-va-black shadow-[0_32px_128px_rgba(0,0,0,0.8)] rounded-full p-2 border border-white/10 pointer-events-auto relative overflow-hidden flex items-center gap-4"
      >
        {/*  LIQUID PROGRESS BACKGROUND */}
        <motion.div 
          className="absolute inset-0 bg-primary/20 pointer-events-none origin-left"
          initial={{ scaleX: 0 }}
          animate={{ scaleX: progress / 100 }}
          transition={{ type: "spring", bounce: 0, duration: 0.1 }}
        />

        <audio 
          ref={audioRef} 
          src={demo.audio_url || (demo.id ? `/api/admin/actors/demos/${demo.id}/stream` : undefined)}
          onTimeUpdate={handleTimeUpdate} 
          onLoadedMetadata={handleLoadedMetadata}
          onEnded={() => setIsPlaying(false)}
          onError={handleError}
        />
        
        {/*  ACTOR PHOTO */}
        <div className="relative w-14 h-14 rounded-full shrink-0 border-2 border-white/10 shadow-lg z-10 ml-1">
          <div className="w-full h-full rounded-full overflow-hidden relative">
            {demo.actor_photo ? (
              <VoiceglotImage  
                src={demo.actor_photo} 
                alt={demo.actor_name} 
                fill
                className="object-cover" 
              />
            ) : (
              <div className="w-full h-full bg-primary/20 flex items-center justify-center text-primary">
                <Volume2 size={24} />
              </div>
            )}
          </div>
          
          {/*  COUNTRY FLAG BADGE */}
          {demo.actor_lang && (
            <div className="absolute -bottom-1 -right-1 z-20 scale-75 border-2 border-va-black rounded-full overflow-hidden shadow-md">
              <VoiceFlag lang={demo.actor_lang} size={20} />
            </div>
          )}
        </div>

        {/*  INFO BLOCK */}
        <div className="flex-1 min-w-0 z-10 py-1">
          <TextInstrument className="text-white font-light text-[18px] tracking-tight truncate leading-tight block">
            {demo.actor_name || 'Stemacteur'}
          </TextInstrument>
          
          {/*  PLAYLIST / CATEGORIES (SPOTIFY STYLE) */}
          <div className="flex items-center gap-2 mt-1 overflow-x-auto no-scrollbar max-w-full">
            {playlist.length > 0 ? (
              playlist.map((p) => (
                  <div
                    key={p.id}
                    className="group/item relative flex items-center gap-1 bg-white/5 rounded-md px-1"
                  >
                    <button
                      onClick={() => {
                        playClick('pop');
                        playDemo(p);
                      }}
                      className={cn(
                        "px-1 py-0.5 rounded-md text-[10px] font-black tracking-widest uppercase transition-all whitespace-nowrap flex items-center gap-2",
                        p.id === demo.id 
                          ? "text-primary" 
                          : "text-white/40 hover:text-white"
                      )}
                    >
                      {editingId === p.id ? (
                        <input 
                          autoFocus
                          className="bg-transparent border-none outline-none text-white w-24"
                          value={editTitle}
                          onChange={(e) => setEditTitle(e.target.value)}
                          onClick={(e) => e.stopPropagation()}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleRename(e as any, p);
                            if (e.key === 'Escape') setEditingId(null);
                          }}
                        />
                      ) : (
                        cleanDemoTitle(p.title, p.category)
                      )}
                    </button>

                    {isAdmin && (
                      <div className="flex items-center gap-0.5 border-l border-white/10 ml-1 pl-1">
                        <button 
                          onClick={(e) => handleRename(e, p)}
                          className="p-1 hover:bg-white/10 rounded-full text-white/30 hover:text-white transition-colors"
                          title="Hernoemen"
                        >
                          {editingId === p.id ? <Save size={10} /> : <Edit2 size={10} />}
                        </button>
                        <button 
                          onClick={(e) => handleDelete(e, p)}
                          className={cn(
                            "p-1 hover:bg-red-500/20 rounded-full transition-colors",
                            isDeleting === p.id ? "text-red-500 animate-pulse" : "text-white/30 hover:text-red-500"
                          )}
                          title="Wissen"
                        >
                          {isDeleting === p.id ? <Check size={10} /> : <Trash2 size={10} />}
                        </button>
                      </div>
                    )}
                  </div>
              ))
            ) : (
              <TextInstrument className="text-white/40 text-[12px] font-bold tracking-[0.15em] uppercase truncate">
                {cleanDemoTitle(demo.title)}
              </TextInstrument>
            )}
          </div>
        </div>

        {/*  CONTROLS */}
        <div className="flex items-center gap-2 z-10 pr-2">
          {/* PLAY/PAUSE */}
          <button 
            onClick={() => {
              togglePlay();
              playClick(isPlaying ? 'soft' : 'pro');
            }}
            className="w-14 h-14 rounded-full bg-white text-va-black flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-xl group/play"
          >
            {isPlaying ? (
              <Pause size={24} fill="currentColor" strokeWidth={0} />
            ) : (
              <Play size={24} fill="currentColor" strokeWidth={0} className="ml-1" />
            )}
          </button>

          {/* CLOSE */}
          <button 
            onClick={() => {
              playClick('soft');
              onClose?.();
            }}
            className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white/40 hover:bg-white/10 hover:text-white transition-all ml-1"
          >
            <X size={20} strokeWidth={1.5} />
          </button>
        </div>

        {/*  INTERACTIVE PROGRESS OVERLAY */}
        <div 
          className="absolute inset-0 cursor-pointer opacity-0 hover:opacity-100 transition-opacity"
          onClick={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const clickedProgress = x / rect.width;
            if (audioRef.current) {
              audioRef.current.currentTime = clickedProgress * audioRef.current.duration;
              playClick('soft');
            }
          }}
        />
      </ContainerInstrument>
    </motion.div>
  );
};
