"use client";

import React, { useState, useRef, useEffect } from 'react';
import { useSonicDNA } from '@/lib/sonic-dna';
import { Mic, Square, Play, Trash2, Download, Settings, Sliders, Check, Volume2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

/**
 *  TELEPROMPTER RECORDER INSTRUMENT (2026)
 * 
 * Een geavanceerd instrument voor DIY opnames met teleprompter en multi-format export.
 */

import { VoiceglotText } from "./VoiceglotText";

interface TeleprompterRecorderProps {
  initialText?: string;
  className?: string;
}

export const TeleprompterRecorderInstrument: React.FC<TeleprompterRecorderProps> = ({ 
  initialText = "Welkom bij ons bedrijf. We zijn momenteel gesloten, maar laat gerust een bericht achter na de toon.",
  className 
}) => {
  const { playClick, playSwell } = useSonicDNA();
  const [isRecording, setIsRecording] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [text, setText] = useState(initialText);
  const [scrollSpeed, setScrollSpeed] = useState(2);
  const [isScrolling, setIsScrollling] = useState(false);
  const [exportFormat, setExportFormat] = useState<'8khz' | '16khz' | '48khz'>('16khz');
  
  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const audioChunks = useRef<Blob[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Teleprompter Scroll Logic
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isScrolling && scrollRef.current) {
      interval = setInterval(() => {
        if (scrollRef.current) {
          scrollRef.current.scrollTop += scrollSpeed;
        }
      }, 50);
    }
    return () => clearInterval(interval);
  }, [isScrolling, scrollSpeed]);

  const startRecording = async () => {
    try {
      playClick('pro');
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorder.current = new MediaRecorder(stream);
      audioChunks.current = [];

      mediaRecorder.current.ondataavailable = (event) => {
        audioChunks.current.push(event.data);
      };

      mediaRecorder.current.onstop = () => {
        const audioBlob = new Blob(audioChunks.current, { type: 'audio/wav' });
        const url = URL.createObjectURL(audioBlob);
        setAudioUrl(url);
      };

      mediaRecorder.current.start();
      setIsRecording(true);
      setIsScrollling(true);
    } catch (err) {
      console.error('Microfoon toegang geweigerd.');
    }
  };

  const stopRecording = () => {
    playClick('soft');
    mediaRecorder.current?.stop();
    setIsRecording(false);
    setIsScrollling(false);
  };

  const handleDownload = () => {
    if (!audioUrl) return;
    playClick('success');
    const link = document.createElement('a');
    link.href = audioUrl;
    link.download = `mijn-opname-${exportFormat}.wav`;
    link.click();
  };

  return (
    <div className={cn(
      "bg-white rounded-[48px] shadow-aura border border-black/5 overflow-hidden flex flex-col md:flex-row h-[600px]",
      className
    )}>
      {/* Left: Teleprompter View */}
      <div className="flex-[2] bg-va-black relative flex flex-col">
        <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-va-black to-transparent z-20 pointer-events-none" />
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-va-black to-transparent z-20 pointer-events-none" />
        
        {/* Reading Line Indicator */}
        <div className="absolute top-1/2 left-0 right-0 h-16 border-y border-primary/20 bg-primary/5 -translate-y-1/2 z-10 pointer-events-none" />

        <div 
          ref={scrollRef}
          className="flex-1 overflow-y-auto p-12 pt-48 pb-48 text-center scroll-smooth no-scrollbar"
        >
          <p className="text-3xl md:text-4xl font-medium text-white/90 leading-relaxed">
            {text}
          </p>
        </div>

        {/* Speed Control */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-30 flex items-center gap-4 bg-white/10 backdrop-blur-md px-6 py-3 rounded-full border border-white/10">
          <Sliders strokeWidth={1.5} size={14} className="text-white/40" />
          <input 
            type="range" 
            min="1" 
            max="10" 
            value={scrollSpeed} 
            onChange={(e) => setScrollSpeed(parseInt(e.target.value))}
            className="w-24 accent-primary"
          />
          <span className="text-[15px] font-medium text-white tracking-widest"><VoiceglotText  translationKey="auto.teleprompterrecorderinstrument.tempo.d65dab" defaultText="Tempo" /></span>
        </div>
      </div>

      {/* Right: Controls & Settings */}
      <div className="flex-1 p-8 flex flex-col justify-between border-l border-black/5">
        <div className="space-y-8">
          <div>
            <h3 className="text-xl font-light tracking-tight mb-2">
              <VoiceglotText  translationKey="teleprompter.title" defaultText="DIY Studio" />
            </h3>
            <p className="text-[15px] text-va-black/40 font-light">
              <VoiceglotText  translationKey="teleprompter.subtitle" defaultText="Neem je eigen tekst op met professionele instellingen." />
            </p>
          </div>

          <div className="space-y-4">
            <label className="text-[15px] font-medium tracking-widest text-va-black/30"><VoiceglotText  translationKey="teleprompter.export_format" defaultText="Export Formaat" /></label>
            <div className="grid grid-cols-1 gap-2">
              {(['8khz', '16khz', '48khz'] as const).map((format) => (
                <button
                  key={format}
                  onClick={() => { playClick('soft'); setExportFormat(format); }}
                  className={cn(
                    "flex items-center justify-between px-4 py-3 rounded-2xl border transition-all text-left",
                    exportFormat === format ? "bg-va-black text-white border-va-black shadow-lg" : "bg-va-off-white border-transparent text-va-black/40 hover:border-black/10"
                  )}
                >
                  <span className="text-[15px] font-medium tracking-widest">{format}</span>
                  {exportFormat === format && <Check strokeWidth={1.5} size={14} className="text-primary" />}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <AnimatePresence  mode="wait">
            {!audioUrl ? (
              <motion.button
                key="record"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                onClick={isRecording ? stopRecording : startRecording}
                className={cn(
                  "w-full py-6 rounded-[24px] font-medium uppercase tracking-[0.2em] text-[15px] transition-all flex items-center justify-center gap-3 shadow-xl",
                  isRecording ? "bg-red-500 text-white animate-pulse" : "bg-primary text-white hover:scale-105 active:scale-95"
                )}
              >
                {isRecording ? <><Square strokeWidth={1.5} size={18} fill="currentColor" /> <VoiceglotText  translationKey="teleprompter.stop" defaultText="Stop" /></> : <><Mic strokeWidth={1.5} size={18} /> <VoiceglotText  translationKey="teleprompter.start" defaultText="Start Opname" /></>}
              </motion.button>
            ) : (
              <motion.div
                key="result"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="space-y-3"
              >
                <div className="bg-va-off-white p-4 rounded-2xl flex items-center gap-3">
                  <button onClick={() => playClick('pro')} className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center text-primary hover:scale-110 transition-transform">
                    <Play strokeWidth={1.5} size={16} fill="currentColor" className="ml-1" />
                  </button>
                  <div className="flex-1 h-1 bg-black/5 rounded-full overflow-hidden">
                    <div className="h-full bg-primary w-1/3" />
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <button
                    onClick={() => { playClick('soft'); setAudioUrl(null); }}
                    className="flex-1 py-4 bg-va-off-white text-va-black/40 rounded-2xl text-[15px] font-medium tracking-widest hover:text-red-500 transition-all"
                  >
                    <Trash2 strokeWidth={1.5} size={14} className="mx-auto" />
                  </button>
                  <button
                    onClick={handleDownload}
                    className="flex-[3] py-4 bg-va-black text-white rounded-2xl text-[15px] font-medium tracking-widest flex items-center justify-center gap-2 hover:bg-primary transition-all"
                  >
                    <Download strokeWidth={1.5} size={14} /> <VoiceglotText  translationKey="teleprompter.download" defaultText="Download .WAV" />
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          
          <p className="text-[15px] font-light text-va-black/20 text-center tracking-tighter">
            <VoiceglotText  translationKey="teleprompter.tip" defaultText="Tip: Voor de beste indruk laat je het professioneel inspreken in de studio." />
          </p>
        </div>
      </div>
    </div>
  );
};
