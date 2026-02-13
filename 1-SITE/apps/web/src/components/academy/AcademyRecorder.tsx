"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Mic, Square, Play, RotateCcw, CheckCircle2, Monitor, Sliders } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { VoiceglotText } from '@/components/ui/VoiceglotText';
import { useTranslation } from '@/contexts/TranslationContext';
import { MobileBridge } from '@/lib/mobile-bridge';
import { useMemo } from 'react';

/**
 * ACADEMY RECORDER (GOD MODE 2026)
 * Persona: 'Praktische Mentor'
 * UI: Growth-Focused Recording Tool
 */

interface AcademyRecorderProps {
  lessonId: string;
  onUpload?: (blob: Blob) => void;
  initialText?: string;
}

export const AcademyRecorder: React.FC<AcademyRecorderProps> = ({ lessonId, onUpload, initialText = "" }) => {
  const { user } = useAuth();
  const { t } = useTranslation();
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const [showTeleprompter, setShowTeleprompter] = useState(false);
  const [scrollSpeed, setScrollSpeed] = useState(2);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Clean HTML for teleprompter
  const cleanText = useMemo(() => {
    if (typeof window === 'undefined') return initialText;
    const div = document.createElement("div");
    div.innerHTML = initialText;
    return div.textContent || div.innerText || "";
  }, [initialText]);

  // Teleprompter Scroll Logic
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRecording && showTeleprompter && scrollRef.current) {
      interval = setInterval(() => {
        if (scrollRef.current) {
          scrollRef.current.scrollTop += scrollSpeed;
        }
      }, 50);
    }
    return () => clearInterval(interval);
  }, [isRecording, showTeleprompter, scrollSpeed]);

  const startRecording = async () => {
    try {
      if (MobileBridge.isNative()) {
        const hasPermission = await MobileBridge.recorder.requestPermission();
        if (!hasPermission) return;
        await MobileBridge.recorder.start();
      } else {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const mediaRecorder = new MediaRecorder(stream);
        mediaRecorderRef.current = mediaRecorder;
        chunksRef.current = [];

        mediaRecorder.ondataavailable = (e) => {
          if (e.data.size > 0) chunksRef.current.push(e.data);
        };

        mediaRecorder.onstop = () => {
          const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
          const url = URL.createObjectURL(blob);
          setAudioBlob(blob);
          setAudioUrl(url);
        };

        mediaRecorder.start();
      }

      setIsRecording(true);
      setRecordingTime(0);
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
      MobileBridge.impact();
    } catch (err) {
      console.error("Microphone access denied", err);
    }
  };

  const stopRecording = async () => {
    if (MobileBridge.isNative()) {
      const result = await MobileBridge.recorder.stop();
      if (result) {
        // Convert base64 to blob
        const res = await fetch(`data:audio/webm;base64,${result.recordDataBase64}`);
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        setAudioBlob(blob);
        setAudioUrl(url);
      }
    } else if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
    }

    setIsRecording(false);
    if (timerRef.current) clearInterval(timerRef.current);
    MobileBridge.impact();
  };

  const resetRecording = () => {
    setAudioBlob(null);
    setAudioUrl(null);
    setRecordingTime(0);
  };

  const handleSubmit = async () => {
    if (!audioBlob || !user) return;
    
    const formData = new FormData();
    formData.append('audio', audioBlob, `lesson-${lessonId}-submission.webm`);
    formData.append('lesson_id', lessonId);
    formData.append('user_id', user.id);

    try {
      const res = await fetch('/api/academy/submit', {
        method: 'POST',
        body: formData
      });

      if (res.ok) {
        alert(t('academy.recorder.success_msg', "Inzending succesvol ontvangen! De mentor bekijkt het zo snel mogelijk. 🎙️"));
        resetRecording();
      }
    } catch (err) {
      console.error("Upload failed", err);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="bg-white rounded-[40px] p-12 border border-black/5 shadow-aura">
      <div className="flex items-center justify-between mb-12">
        <div className="flex items-center gap-4">
          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-xl transition-all ${isRecording ? 'bg-red-500 animate-pulse text-white' : 'bg-black text-white'}`}>
            <Mic size={28} />
          </div>
          <div>
            <h3 className="text-3xl font-black tracking-tighter ">
              <VoiceglotText translationKey="academy.recorder.title" defaultText="Jouw Opname" />
            </h3>
            <div className="flex items-center gap-4 mt-1">
              <p className="text-[15px] font-black tracking-widest text-black/30">
                {isRecording ? (
                  <VoiceglotText translationKey="academy.recorder.recording" defaultText="Nu aan het opnemen..." />
                ) : audioBlob ? (
                  <VoiceglotText translationKey="academy.recorder.completed" defaultText="Opname voltooid" />
                ) : (
                  <VoiceglotText translationKey="academy.recorder.ready" defaultText="Klaar voor opname" />
                )}
              </p>
              <button 
                onClick={() => setShowTeleprompter(!showTeleprompter)}
                className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full border text-[15px] font-black uppercase tracking-widest transition-all ${showTeleprompter ? 'bg-black text-white border-black' : 'bg-transparent text-black/30 border-black/10 hover:border-black/30'}`}
              >
                <Monitor strokeWidth={1.5} size={10} />
                {showTeleprompter ? <VoiceglotText translationKey="academy.recorder.teleprompter.on" defaultText="Teleprompter AAN" /> : <VoiceglotText translationKey="academy.recorder.teleprompter.off" defaultText="Teleprompter UIT" />}
              </button>
            </div>
          </div>
        </div>
        {isRecording && (
          <div className="text-3xl font-black tracking-tighter text-black tabular-nums">
            {formatTime(recordingTime)}
          </div>
        )}
      </div>
      
      <div className={`rounded-2xl mb-12 flex flex-col items-center justify-center relative overflow-hidden group transition-all ${showTeleprompter ? 'h-96 bg-va-black' : 'h-40 bg-black/5'}`}>
        {showTeleprompter ? (
          <div className="w-full h-full relative flex flex-col">
            <div className="absolute top-0 left-0 right-0 h-16 bg-gradient-to-b from-va-black to-transparent z-20 pointer-events-none" />
            <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-va-black to-transparent z-20 pointer-events-none" />
            
            {/* Reading Line Indicator */}
            <div className="absolute top-1/2 left-0 right-0 h-12 border-y border-primary/20 bg-primary/5 -translate-y-1/2 z-10 pointer-events-none" />

            <div 
              ref={scrollRef}
              className="flex-1 overflow-y-auto p-8 pt-32 pb-32 text-center scroll-smooth no-scrollbar"
            >
              <p className="text-xl md:text-2xl font-bold text-white/90 leading-relaxed">
                {cleanText}
              </p>
            </div>

            {/* Speed Control Overlay */}
            <div className="absolute bottom-4 right-4 z-30 flex items-center gap-3 bg-white/10 backdrop-blur-md px-4 py-2 rounded-full border border-white/10">
              <Sliders size={12} className="text-white/40" />
              <input 
                type="range" 
                min="1" 
                max="10" 
                value={scrollSpeed} 
                onChange={(e) => setScrollSpeed(parseInt(e.target.value))}
                className="w-16 accent-primary"
              />
              <span className="text-[15px] font-black text-white tracking-widest">
                <VoiceglotText translationKey="academy.recorder.tempo" defaultText="Tempo" />
              </span>
            </div>
          </div>
        ) : (
          <>
            {!audioBlob && !isRecording && (
              <div className="text-black/10 font-black tracking-[0.2em] text-sm">
                <VoiceglotText translationKey="academy.recorder.input_ready" defaultText="Microphone Input Ready" />
              </div>
            )}
            {isRecording && (
              <div className="flex items-center gap-1">
                {[...Array(32)].map((_, i) => (
                  <div 
                    key={i} 
                    className="w-1 bg-black rounded-full" 
                    style={{ 
                      height: `${Math.random() * 60 + 20}%`,
                      transition: 'height 0.1s ease'
                    }} 
                  />
                ))}
              </div>
            )}
            {audioUrl && (
              <audio src={audioUrl} controls className="w-full max-w-md accent-black" />
            )}
          </>
        )}
      </div>

      <div className="flex items-center justify-center gap-8">
        {!audioBlob ? (
          <button 
            onClick={isRecording ? stopRecording : startRecording}
            className={`w-24 h-24 rounded-full flex items-center justify-center shadow-2xl transition-all hover:scale-110 active:scale-95 ${
              isRecording ? 'bg-black text-white' : 'bg-black text-white'
            }`}
            data-voices-sonic-dna="click-premium"
          >
            {isRecording ? <Square size={32} fill="currentColor" /> : <Mic size={32} fill="currentColor" />}
          </button>
        ) : (
          <>
            <button 
              onClick={resetRecording}
              className="w-16 h-16 rounded-full bg-black/5 text-black/40 flex items-center justify-center hover:bg-black/10 hover:text-black transition-all"
            >
              <RotateCcw size={24} />
            </button>
            <button 
              onClick={handleSubmit}
              className="va-btn-pro !rounded-full !px-12 flex items-center gap-3"
              data-voices-sonic-dna="click-premium"
            >
              <CheckCircle2 strokeWidth={1.5} size={20} /> 
              <VoiceglotText translationKey="academy.recorder.submit" defaultText="INLEVEREN VOOR FEEDBACK" />
            </button>
          </>
        )}
      </div>
    </div>
  );
};
