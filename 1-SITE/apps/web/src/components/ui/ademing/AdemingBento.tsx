"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Wind, Heart, Star, Clock, User } from 'lucide-react';
import { 
  ContainerInstrument, 
  HeadingInstrument, 
  TextInstrument, 
  ButtonInstrument 
} from '../LayoutInstruments';
import { BreathingInstrument } from './BreathingInstrument';
import { MeditationPlayerInstrument } from './MeditationPlayerInstrument';
import { VoiceglotText } from '../VoiceglotText';

interface AdemingBentoProps {
  tracks: any[];
  initialTrack?: any;
}

export const AdemingBento = ({ tracks, initialTrack }: AdemingBentoProps) => {
  const [activeTrack, setActiveTrack] = useState<any | null>(initialTrack || null);

  const featuredTrack = tracks[0];
  const otherTracks = tracks.slice(1, 5);

  return (
    <ContainerInstrument className="py-32 relative z-10">
      <header className="mb-24 max-w-4xl">
        <TextInstrument className="text-[11px] font-bold tracking-[0.4em] text-primary/60 mb-8 block uppercase">
          Ademing Journey
        </TextInstrument>
        <HeadingInstrument level={1} className="text-7xl md:text-9xl font-light tracking-tighter mb-12 leading-[0.85] text-va-black">
          Adem in. <br />
          <span className="text-primary/40 italic">Kom tot rust.</span>
        </HeadingInstrument>
        <TextInstrument className="text-xl md:text-2xl text-va-black/40 font-light max-w-2xl leading-relaxed">
          Ontdek de kracht van bewuste ademhaling en meditatie. Een moment voor jezelf, begeleid door de warmste stemmen.
        </TextInstrument>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        {/* Featured Track - Large Bento */}
        <motion.div 
          className="md:col-span-8 bg-white rounded-[40px] shadow-aura border border-black/5 overflow-hidden group relative min-h-[500px]"
          whileHover={{ y: -5 }}
        >
          {featuredTrack && (
            <>
              <div className="absolute inset-0 z-0">
                <img src={featuredTrack.cover_image_url} alt="" className="w-full h-full object-cover opacity-10 group-hover:opacity-20 transition-opacity duration-1000" />
                <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent" />
              </div>
              <div className="relative z-10 p-12 h-full flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-3 mb-8">
                    <span className="bg-primary/10 text-primary text-[10px] font-bold px-3 py-1 rounded-full tracking-widest uppercase">Aanbevolen</span>
                    <span className="text-va-black/20 text-[10px] font-bold tracking-widest uppercase">{featuredTrack.duration ? `${Math.floor(featuredTrack.duration / 60)} min` : '10 min'}</span>
                  </div>
                  <HeadingInstrument level={2} className="text-5xl md:text-7xl font-light tracking-tighter mb-6 text-va-black">
                    {featuredTrack.title}
                  </HeadingInstrument>
                  <TextInstrument className="text-lg text-va-black/40 font-light max-w-md">
                    {featuredTrack.short_description || 'Een diepe duik in je eigen rust.'}
                  </TextInstrument>
                </div>
                <div className="pt-12">
                  <ButtonInstrument 
                    onClick={() => setActiveTrack(featuredTrack)}
                    className="va-btn-pro !bg-va-black !text-white px-12 py-6 !rounded-full font-bold tracking-widest uppercase flex items-center gap-4 hover:bg-primary transition-all shadow-aura-lg"
                  >
                    <Play size={20} fill="currentColor" /> Start Meditatie
                  </ButtonInstrument>
                </div>
              </div>
            </>
          )}
        </motion.div>

        {/* Breathing Exercise - Square Bento */}
        <div className="md:col-span-4">
          <BreathingInstrument className="h-full" />
        </div>

        {/* Other Tracks - Grid */}
        {otherTracks.map((track, i) => (
          <motion.div 
            key={track.id}
            className="md:col-span-4 bg-white/60 backdrop-blur-md p-10 rounded-[32px] border border-black/5 hover:shadow-magic transition-all duration-700 cursor-pointer group"
            whileHover={{ y: -5 }}
            onClick={() => setActiveTrack(track)}
          >
            <div className="flex justify-between items-start mb-12">
              <div className="w-12 h-12 rounded-2xl bg-va-black/5 flex items-center justify-center text-va-black/20 group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                <Wind size={24} strokeWidth={1.5} />
              </div>
              <TextInstrument className="text-[10px] font-bold text-va-black/20 tracking-widest uppercase">
                {track.duration ? `${Math.floor(track.duration / 60)} min` : '8 min'}
              </TextInstrument>
            </div>
            <HeadingInstrument level={3} className="text-3xl font-light tracking-tighter leading-none mb-4 text-va-black">
              {track.title}
            </HeadingInstrument>
            <div className="flex items-center gap-2 text-va-black/30">
              <User size={14} />
              <TextInstrument className="text-[12px] font-medium">{track.maker || 'Voices Guide'}</TextInstrument>
            </div>
          </motion.div>
        ))}

        {/* Community Stats - Wide Bento */}
        <div className="md:col-span-12 bg-va-black text-white p-16 rounded-[40px] shadow-aura-lg relative overflow-hidden group mt-12">
          <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
            <div className="space-y-2">
              <TextInstrument className="text-5xl font-light tracking-tighter">12.4k</TextInstrument>
              <TextInstrument className="text-[10px] font-bold text-white/40 uppercase tracking-[0.2em]">Bewuste Ademhalingen</TextInstrument>
            </div>
            <div className="space-y-2 border-x border-white/10">
              <TextInstrument className="text-5xl font-light tracking-tighter">482</TextInstrument>
              <TextInstrument className="text-[10px] font-bold text-white/40 uppercase tracking-[0.2em]">Mensen nu online</TextInstrument>
            </div>
            <div className="space-y-2">
              <TextInstrument className="text-5xl font-light tracking-tighter">98%</TextInstrument>
              <TextInstrument className="text-[10px] font-bold text-white/40 uppercase tracking-[0.2em]">Voelt zich rustiger</TextInstrument>
            </div>
          </div>
          <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 to-transparent opacity-50" />
        </div>
      </div>

      {/* Fullscreen Player Portal */}
      <AnimatePresence>
        {activeTrack && (
          <MeditationPlayerInstrument 
            track={activeTrack} 
            onClose={() => setActiveTrack(null)} 
          />
        )}
      </AnimatePresence>
    </ContainerInstrument>
  );
};
