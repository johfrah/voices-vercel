'use client';
import { motion } from 'framer-motion';
import { CheckCircle2, MessageSquare, Music, Pause, Play, RotateCcw, Volume2 } from 'lucide-react';
import React, { useRef, useState } from 'react';
import { VoiceglotText } from '../ui/VoiceglotText';

/**
 * 🎙️ AUDIO REVIEW DASHBOARD (Bento Spotlight 2026)
 * 
 * Een interactieve interface voor klanten om audio te reviewen,
 * de muziekbalans aan te passen en feedback te geven.
 */

interface AudioReviewProps {
  voiceUrl: string;
  musicUrl?: string;
  orderId: string;
  projectName: string;
}

export const AudioReviewDashboard: React.FC<AudioReviewProps> = ({
  voiceUrl,
  musicUrl,
  orderId,
  projectName
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [musicBalance, setMusicBalance] = useState(20); // 0-100
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const audioRef = useRef<HTMLAudioElement>(null);

  // 🛡️ System: Optimistic UI voor balans aanpassingen
  const handleBalanceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value);
    setMusicBalance(val);
  };

  const triggerProcessing = async () => {
    setIsProcessing(true);
    // Simuleer API call naar onze nieuwe /api/audio/process endpoint
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsProcessing(false);
    // Hier zouden we normaal de audio source verversen met de nieuwe mix
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6 bg-va-off-white rounded-[32px] border border-gray-100 shadow-sm">
      
      {/* 1. Main Player Card (Bento Large) */}
      <div className="md:col-span-2 bg-white p-8 rounded-[24px] shadow-sm border border-gray-50 flex flex-col justify-between min-h-[300px]">
        <div>
          <div className="flex justify-between items-start mb-6">
            <div>
              <span className="text-[15px] font-black tracking-widest text-primary mb-1 block">
                <VoiceglotText translationKey="audio.review.mode" defaultText="Review Mode" />
              </span>
              <h2 className="text-2xl font-black tracking-tight text-gray-900 ">{projectName}</h2>
              <p className="text-[15px] font-black tracking-widest text-gray-400">
                <VoiceglotText translationKey="common.order_number" defaultText="Order #" />{orderId}
              </p>
            </div>
            <div className={`px-3 py-1 rounded-full text-[15px] font-bold uppercase tracking-wider ${isProcessing ? 'bg-blue-50 text-blue-500 animate-pulse' : 'bg-green-50 text-green-600'}`}>
              {isProcessing ? (
                <VoiceglotText translationKey="audio.review.processing" defaultText="Processing Mix..." />
              ) : (
                <VoiceglotText translationKey="audio.review.ready" defaultText="Ready for Review" />
              )}
            </div>
          </div>

          {/* Waveform Placeholder (Sonic DNA) */}
          <div className="relative h-24 bg-gray-50 rounded-xl mb-6 overflow-hidden flex items-center justify-center group cursor-pointer">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent opacity-50" />
            <div className="flex items-end gap-[2px] h-12">
              {[...Array(40)].map((_, i) => (
                <motion.div 
                  key={i}
                  initial={{ height: 2 }}
                  animate={{ height: isPlaying ? Math.random() * 40 + 5 : 10 }}
                  transition={{ repeat: Infinity, duration: 0.5, repeatType: 'reverse' }}
                  className="w-1 bg-primary/30 rounded-full"
                />
              ))}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <button 
            onClick={() => setIsPlaying(!isPlaying)}
            className="w-16 h-16 bg-gray-900 text-white rounded-full flex items-center justify-center hover:scale-105 transition-transform shadow-lg"
          >
            {isPlaying ? <Pause fill="currentColor" /> : <Play className="ml-1" fill="currentColor" />}
          </button>
          
          <div className="flex-1">
            <div className="flex justify-between text-[15px] font-bold text-gray-400 tracking-widest mb-2">
              <span>00:0{Math.floor(currentTime)}</span>
              <span>00:{duration || '15'}</span>
            </div>
            <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <motion.div 
                className="h-full bg-primary" 
                animate={{ width: `${(currentTime / 15) * 100}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* 2. Smart Mix Control (Bento Small) */}
      <div className="bg-white p-8 rounded-[24px] shadow-sm border border-gray-50 flex flex-col gap-6">
        <div>
          <h3 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Music size={16} className="text-primary" /> Smart Mix
          </h3>
          
          <div className="space-y-6">
            <div>
              <div className="flex justify-between text-[15px] font-bold text-gray-400 tracking-wider mb-3">
                <span>
                  <VoiceglotText translationKey="audio.review.voice" defaultText="Stem" />
                </span>
                <span>
                  <VoiceglotText translationKey="audio.review.music" defaultText="Muziek" />
                </span>
              </div>
              <input 
                type="range" 
                min="0" 
                max="100" 
                value={musicBalance}
                onChange={handleBalanceChange}
                onMouseUp={triggerProcessing}
                className="w-full h-1.5 bg-gray-100 rounded-full appearance-none cursor-pointer accent-primary"
              />
            </div>

            <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
              <span className="text-[15px] font-bold text-gray-400 block mb-2">
                <VoiceglotText translationKey="audio.review.selected_track" defaultText="Geselecteerde Track" />
              </span>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center text-primary">
                  <Music size={14} />
                </div>
                <span className="text-[15px] font-bold text-gray-700 truncate">Corporate Uplifting v2</span>
              </div>
            </div>
          </div>
        </div>

        <button className="mt-auto w-full py-4 bg-primary text-white rounded-2xl font-bold text-sm flex items-center justify-center gap-2 hover:opacity-90 transition-opacity">
          <CheckCircle2 strokeWidth={1.5} size={18} /> <VoiceglotText translationKey="common.approve" defaultText="Goedkeuren" />
        </button>
      </div>

      {/* 3. Feedback & Actions (Bento Small) */}
      <div className="md:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gray-900 p-6 rounded-[24px] text-white flex items-center justify-between group cursor-pointer hover:bg-black transition-colors">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
              <MessageSquare size={18} />
            </div>
            <div>
              <span className="block text-[15px] font-bold opacity-60 tracking-widest">
                <VoiceglotText translationKey="common.feedback" defaultText="Feedback" />
              </span>
              <span className="text-sm font-medium">
                <VoiceglotText translationKey="audio.review.leave_comment" defaultText="Laat een opmerking achter" />
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-[24px] border border-gray-100 flex items-center justify-between group cursor-pointer hover:border-primary/30 transition-colors">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-primary/5 rounded-xl flex items-center justify-center text-primary">
              <RotateCcw size={18} />
            </div>
            <div>
              <span className="block text-[15px] font-bold text-gray-400 tracking-widest">
                <VoiceglotText translationKey="common.revision" defaultText="Revisie" />
              </span>
              <span className="text-sm font-medium text-gray-700">
                <VoiceglotText translationKey="audio.review.request_retake" defaultText="Vraag een retake aan" />
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-[24px] border border-gray-100 flex items-center justify-between group cursor-pointer hover:border-primary/30 transition-colors">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-primary/5 rounded-xl flex items-center justify-center text-primary">
              <Volume2 size={18} />
            </div>
            <div>
              <span className="block text-[15px] font-bold text-gray-400 tracking-widest">
                <VoiceglotText translationKey="common.export" defaultText="Export" />
              </span>
              <span className="text-sm font-medium text-gray-700">
                <VoiceglotText translationKey="audio.review.download_all" defaultText="Download alle formaten" />
              </span>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};
