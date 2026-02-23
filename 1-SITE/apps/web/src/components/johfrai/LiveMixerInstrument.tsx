'use client';

import { cn } from '@/lib/utils/utils';
import { motion } from 'framer-motion';
import { Mic, Music, Pause, Play, Sliders, Trash2 } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';
import WaveSurfer from 'wavesurfer.js';
import { VoiceglotText } from '../ui/VoiceglotText';

interface LiveMixerInstrumentProps {
  title: string;
  voiceUrl: string;
  musicUrl?: string | null;
  initialMusicVolume?: number;
  onRemove?: () => void;
}

export const LiveMixerInstrument: React.FC<LiveMixerInstrumentProps> = ({
  title,
  voiceUrl,
  musicUrl,
  initialMusicVolume = 0.3,
  onRemove
}) => {
  const voiceWaveformRef = useRef<HTMLDivElement>(null);
  const musicWaveformRef = useRef<HTMLDivElement>(null);
  const wavesurferVoice = useRef<WaveSurfer | null>(null);
  const wavesurferMusic = useRef<WaveSurfer | null>(null);
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [musicVolume, setMusicVolume] = useState(initialMusicVolume);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);

  useEffect(() => {
    wavesurferMusic.current?.setVolume(musicVolume);
  }, [musicVolume]);

  useEffect(() => {
    if (!voiceWaveformRef.current || !musicWaveformRef.current) return;

    // Initialize Voice Waveform
    wavesurferVoice.current = WaveSurfer.create({
      container: voiceWaveformRef.current,
      waveColor: 'var(--va-primary)',
      progressColor: 'var(--va-primary-dark)',
      cursorColor: 'transparent',
      barWidth: 2,
      barGap: 3,
      barRadius: 4,
      height: 60,
      normalize: true,
      url: voiceUrl,
    });

    // Initialize Music Waveform (Subtle background)
    if (musicUrl) {
      wavesurferMusic.current = WaveSurfer.create({
        container: musicWaveformRef.current,
        waveColor: 'rgba(0, 0, 0, 0.05)',
        progressColor: 'rgba(0, 0, 0, 0.1)',
        cursorColor: 'transparent',
        barWidth: 2,
        barGap: 3,
        barRadius: 4,
        height: 60,
        normalize: true,
        interact: false, // Music follows voice interaction
        url: musicUrl,
      });
    }

    // Sync Events
    wavesurferVoice.current.on('play', () => {
      setIsPlaying(true);
      wavesurferMusic.current?.play();
    });

    wavesurferVoice.current.on('pause', () => {
      setIsPlaying(false);
      wavesurferMusic.current?.pause();
    });

    wavesurferVoice.current.on('finish', () => {
      setIsPlaying(false);
      wavesurferMusic.current?.stop();
    });

    wavesurferVoice.current.on('timeupdate', (time) => {
      setCurrentTime(time);
      // Sync music position if it drifts
      if (wavesurferMusic.current) {
        const musicTime = wavesurferMusic.current.getCurrentTime();
        if (Math.abs(musicTime - time) > 0.1) {
          wavesurferMusic.current.setTime(time);
        }
      }
    });

    wavesurferVoice.current.on('ready', (dur) => {
      setDuration(dur);
      if (wavesurferMusic.current) {
        wavesurferMusic.current.setVolume(musicVolume);
      }
    });

    wavesurferVoice.current.on('interaction', (newTime) => {
      wavesurferMusic.current?.setTime(newTime);
    });

    return () => {
      wavesurferVoice.current?.destroy();
      wavesurferMusic.current?.destroy();
    };
  }, [voiceUrl, musicUrl, musicVolume]);

  const togglePlay = () => {
    wavesurferVoice.current?.playPause();
  };

  const formatTime = (time: number) => {
    const mins = Math.floor(time / 60);
    const secs = Math.floor(time % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-[32px] p-6 border border-black/5 shadow-sm hover:shadow-xl transition-all group"
    >
      <div className="flex flex-col gap-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-va-black flex items-center justify-center text-white shadow-lg">
              <Mic strokeWidth={1.5} size={18} />
            </div>
            <div>
              <h4 className="font-light text-[15px] tracking-tight">
                {title || <VoiceglotText  translationKey="common.untitled_file" defaultText="Naamloos bestand" />}
              </h4>
              <p className="text-[15px] font-bold text-va-black/30 tracking-widest">
                {formatTime(currentTime)} / {formatTime(duration)}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button 
              onClick={togglePlay}
              className={cn(
                "w-12 h-12 rounded-2xl flex items-center justify-center transition-all shadow-md active:scale-95",
                isPlaying ? "bg-va-black text-white" : "bg-primary text-white hover:bg-va-black"
              )}
            >
              {isPlaying ? <Pause strokeWidth={1.5} size={20} fill="currentColor" /> : <Play strokeWidth={1.5} size={20} fill="currentColor" className="ml-1" />}
            </button>
            {onRemove && (
              <button 
                onClick={onRemove}
                className="w-12 h-12 rounded-2xl bg-va-black/5 text-va-black/20 flex items-center justify-center hover:bg-red-500 hover:text-white transition-all"
              >
                <Trash2 strokeWidth={1.5} size={18} />
              </button>
            )}
          </div>
        </div>

        {/* Waveforms Container */}
        <div className="relative bg-va-off-white/50 rounded-[24px] p-4 overflow-hidden border border-black/5">
          {/* Music Waveform (Background) */}
          <div ref={musicWaveformRef} className="absolute inset-0 pointer-events-none opacity-50" />
          
          {/* Voice Waveform (Foreground) */}
          <div ref={voiceWaveformRef} className="relative z-10" />
          
          {/* Labels */}
          <div className="absolute top-2 left-4 flex gap-4 pointer-events-none">
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-primary" />
              <span className="text-[15px] font-black tracking-widest text-va-black/40">
                <VoiceglotText  translationKey="audio.review.voice" defaultText="Stem" />
              </span>
            </div>
            {musicUrl && (
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-va-black/10" />
                <span className="text-[15px] font-black tracking-widest text-va-black/40">
                  <VoiceglotText  translationKey="audio.review.music" defaultText="Muziek" />
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Controls */}
        {musicUrl && (
          <div className="flex items-center gap-6 bg-va-off-white/30 p-4 rounded-2xl border border-black/5">
            <div className="flex items-center gap-3 flex-1">
              <div className="p-2 rounded-lg bg-white shadow-sm text-va-black/40">
                <Music strokeWidth={1.5} size={14} />
              </div>
              <div className="flex-1 space-y-1">
                <div className="flex justify-between items-center">
                  <span className="text-[15px] font-black tracking-widest text-va-black/40">
                    <VoiceglotText  translationKey="audio.review.mix_volume" defaultText="Mix Volume" />
                  </span>
                  <span className="text-[15px] font-black text-primary">{Math.round(musicVolume * 100)}%</span>
                </div>
                <input 
                  type="range" 
                  min="0" 
                  max="1" 
                  step="0.01" 
                  value={musicVolume}
                  onChange={(e) => setMusicVolume(parseFloat(e.target.value))}
                  className="w-full h-1.5 bg-va-black/5 rounded-full appearance-none cursor-pointer accent-primary"
                />
              </div>
            </div>
            
            <div className="flex items-center gap-2 text-va-black/20">
              <Sliders strokeWidth={1.5} size={14} />
              <span className="text-[15px] font-black tracking-widest">
                <VoiceglotText  translationKey="audio.review.live_mix" defaultText="Live Mix" />
              </span>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};
