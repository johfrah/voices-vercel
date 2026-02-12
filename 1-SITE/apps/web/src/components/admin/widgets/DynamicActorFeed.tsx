"use client";

import { useSonicDNA } from '@/lib/sonic-dna';
import { motion } from 'framer-motion';
import { Play, Sparkles, Star } from 'lucide-react';
import Image from 'next/image';
import React, { useEffect, useState } from 'react';

interface Actor {
  id: number;
  firstName: string;
  lastName: string;
  photoUrl: string;
  startingPrice: number;
  voiceScore: number;
  nativeLang: string;
}

interface DynamicActorFeedProps {
  limit?: number;
  filter?: 'top-rated' | 'newest' | 'market-specific';
  market?: string;
}

/**
 * 🎙️ DYNAMIC ACTOR FEED WIDGET
 * 500% Beheer-modus: Haalt live stemmen op en rendert ze in een Bento-stijl.
 * AI-Native: Kan filters accepteren van Voicy.
 */
export const DynamicActorFeed: React.FC<DynamicActorFeedProps> = ({ 
  limit = 3, 
  filter = 'top-rated',
  market = 'BE' 
}) => {
  const { playClick, playSwell } = useSonicDNA();
  const [actors, setActors] = useState<Actor[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchActors = async () => {
      setIsLoading(true);
      try {
        const res = await fetch(`/api/agency/actors?limit=${limit}&filter=${filter}&market=${market}`);
        const data = await res.json();
        // We mappen de data naar ons interne formaat
        setActors(data.results.slice(0, limit).map((a: any) => ({
          id: a.id,
          firstName: a.first_name,
          lastName: a.last_name,
          photoUrl: a.photo_url || '/assets/common/placeholders/placeholder-voice.jpg',
          startingPrice: a.starting_price,
          voiceScore: a.voice_score,
          nativeLang: a.native_lang
        })));
      } catch (error) {
        console.error('Failed to fetch actors for widget:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchActors();
  }, [limit, filter, market]);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-4 w-full">
        {[...Array(limit)].map((_, i) => (
          <div key={i} className="h-24 bg-va-black/5 animate-pulse rounded-2xl w-full" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4 w-full">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-2">
          <Sparkles size={14} className="text-primary" />
          <span className="text-[10px] font-black uppercase tracking-widest text-va-black/40">
            Live Actor Feed • {filter}
          </span>
        </div>
      </div>

      {actors.map((actor) => (
        <motion.div
          key={actor.id}
          whileHover={{ x: 4 }}
          onMouseEnter={() => playSwell()}
          className="flex items-center gap-4 p-4 bg-white/50 backdrop-blur-sm border border-black/5 rounded-2xl hover:bg-white hover:shadow-aura transition-all group cursor-pointer"
        >
          <div className="w-12 h-12 rounded-xl bg-va-off-white overflow-hidden relative shadow-inner">
            <Image 
              src={actor.photoUrl} 
              alt={actor.firstName} 
              fill
              className="object-cover grayscale group-hover:grayscale-0 transition-all duration-700" 
            />
          </div>
          
          <div className="flex-1">
            <h4 className="text-xs font-black uppercase tracking-tight">{actor.firstName}</h4>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-[8px] font-black text-primary uppercase tracking-widest">{actor.nativeLang}</span>
              <div className="flex gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={6} fill={i < 4 ? "currentColor" : "none"} className="text-yellow-500" />
                ))}
              </div>
            </div>
          </div>

          <div className="text-right">
            <p className="text-[8px] font-black text-va-black/20 uppercase tracking-widest">Vanaf</p>
            <p className="text-xs font-black tracking-tighter">€{actor.startingPrice}</p>
          </div>

          <button 
            onClick={(e) => {
              e.stopPropagation();
              playClick('pop');
            }}
            className="w-8 h-8 rounded-lg bg-va-black text-white flex items-center justify-center hover:bg-primary transition-all active:scale-90"
          >
            <Play size={12} fill="currentColor" />
          </button>
        </motion.div>
      ))}

      <button className="w-full py-3 mt-4 border-2 border-dashed border-black/5 rounded-2xl text-[9px] font-black uppercase tracking-widest text-va-black/20 hover:border-primary/20 hover:text-primary transition-all">
        Bekijk alle stemmen
      </button>
    </div>
  );
};
