"use client";

import { VoiceglotText } from '@/components/ui/VoiceglotText';
import { useAuth } from '@/contexts/AuthContext';
import { useTranslation } from '@/contexts/TranslationContext';
import { MobileBridge } from '@/lib/bridges/mobile-bridge';
import { CheckCircle2, Mic, Monitor, RotateCcw, Sliders, Square } from 'lucide-react';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { 
  ContainerInstrument, 
  TextInstrument,
  ButtonInstrument,
  HeadingInstrument,
  InputInstrument
} from '@/components/ui/LayoutInstruments';
import { cn } from '@/lib/utils/utils';

/**
 * ACADEMY RECORDER (GOD MODE 2026)
 * Persona: 'Praktische Mentor'
 * UI: Growth-Focused Recording Tool for Voices
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

  const cleanText = useMemo(() => {
    if (typeof window === 'undefined') return initialText;
    const div = document.createElement("div");
    div.innerHTML = initialText;
    return div.textContent || div.innerText || "";
  }, [initialText]);

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
        alert(t('academy.recorder.success_msg', "Inzending succesvol ontvangen! De mentor bekijkt het zo snel mogelijk. "));
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
    <ContainerInstrument className="bg-white rounded-[20px] p-12 border border-va-black/5 shadow-aura">
      <ContainerInstrument className="flex items-center justify-between mb-12">
        <ContainerInstrument className="flex items-center gap-4">
          <ContainerInstrument className={cn(
            "w-14 h-14 rounded-[10px] flex items-center justify-center shadow-aura transition-all",
            isRecording ? 'bg-red-500 animate-pulse text-white' : 'bg-va-black text-white'
          )}>
            <Mic size={28} strokeWidth={1.5} />
          </ContainerInstrument>
          <ContainerInstrument>
            <HeadingInstrument level={3} className="text-3xl font-light tracking-tight">
              <VoiceglotText  translationKey="academy.recorder.title" defaultText="Jouw Opname" />
            </HeadingInstrument>
            <ContainerInstrument className="flex items-center gap-4 mt-1">
              <TextInstrument className="text-[15px] font-light tracking-widest text-va-black/30 ">
                {isRecording ? (
                  <VoiceglotText  translationKey="academy.recorder.recording" defaultText="Nu aan het opnemen..." />
                ) : audioBlob ? (
                  <VoiceglotText  translationKey="academy.recorder.completed" defaultText="Opname voltooid" />
                ) : (
                  <VoiceglotText  translationKey="academy.recorder.ready" defaultText="Klaar voor opname" />
                )}
              </TextInstrument>
              <ButtonInstrument 
                onClick={() => setShowTeleprompter(!showTeleprompter)}
                className={cn(
                  "flex items-center gap-1.5 px-2 py-0.5 rounded-full border text-[15px] font-light uppercase tracking-widest transition-all",
                  showTeleprompter ? 'bg-va-black text-white border-va-black' : 'bg-transparent text-va-black/30 border-va-black/10 hover:border-va-black/30'
                )}
              >
                <Monitor strokeWidth={1.5} size={10} />
                {showTeleprompter ? <VoiceglotText  translationKey="academy.recorder.teleprompter.on" defaultText="Teleprompter AAN" /> : <VoiceglotText  translationKey="academy.recorder.teleprompter.off" defaultText="Teleprompter UIT" />}
              </ButtonInstrument>
            </ContainerInstrument>
          </ContainerInstrument>
        </ContainerInstrument>
        {isRecording && (
          <TextInstrument className="text-3xl font-light tracking-tighter text-va-black tabular-nums">
            {formatTime(recordingTime)}
          </TextInstrument>
        )}
      </ContainerInstrument>
      
      <ContainerInstrument className={cn(
        "rounded-[10px] mb-12 flex flex-col items-center justify-center relative overflow-hidden group transition-all",
        showTeleprompter ? 'h-96 bg-va-black' : 'h-40 bg-va-black/5'
      )}>
        {showTeleprompter ? (
          <ContainerInstrument className="w-full h-full relative flex flex-col">
            <ContainerInstrument className="absolute top-0 left-0 right-0 h-16 bg-gradient-to-b from-va-black to-transparent z-20 pointer-events-none" />
            <ContainerInstrument className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-va-black to-transparent z-20 pointer-events-none" />
            
            <ContainerInstrument className="absolute top-1/2 left-0 right-0 h-12 border-y border-primary/20 bg-primary/5 -translate-y-1/2 z-10 pointer-events-none" />

            <ContainerInstrument 
              ref={scrollRef}
              className="flex-1 overflow-y-auto p-8 pt-32 pb-32 text-center scroll-smooth no-scrollbar"
            >
              <TextInstrument className="text-xl md:text-2xl font-light text-white/90 leading-relaxed">
                {cleanText}
              </TextInstrument>
            </ContainerInstrument>

            <ContainerInstrument className="absolute bottom-4 right-4 z-30 flex items-center gap-3 bg-white/10 backdrop-blur-md px-4 py-2 rounded-full border border-white/10">
              <Sliders size={12} className="text-white/40" strokeWidth={1.5} />
              <input 
                type="range" 
                min="1" 
                max="10" 
                value={scrollSpeed} 
                onChange={(e) => setScrollSpeed(parseInt(e.target.value))}
                className="w-16 accent-primary"
              />
              <TextInstrument className="text-[15px] font-light text-white tracking-widest ">
                <VoiceglotText  translationKey="academy.recorder.tempo" defaultText="Tempo" />
              </TextInstrument>
            </ContainerInstrument>
          </ContainerInstrument>
        ) : (
          <>
            {!audioBlob && !isRecording && (
              <TextInstrument className="text-va-black/10 font-light tracking-[0.2em] text-[15px] ">
                <VoiceglotText  translationKey="academy.recorder.input_ready" defaultText="Microphone Input Ready" />
              </TextInstrument>
            )}
            {isRecording && (
              <ContainerInstrument className="flex items-center gap-1">
                {[...Array(32)].map((_, i) => (
                  <ContainerInstrument 
                    key={i} 
                    className="w-1 bg-va-black rounded-full" 
                    style={{ 
                      height: `${Math.random() * 60 + 20}%`,
                      transition: 'height 0.1s ease'
                    }} 
                  />
                ))}
              </ContainerInstrument>
            )}
            {audioUrl && (
              <audio src={audioUrl} controls className="w-full max-w-md accent-va-black" />
            )}
          </>
        )}
      </ContainerInstrument>

      <ContainerInstrument className="flex items-center justify-center gap-8">
        {!audioBlob ? (
          <ButtonInstrument 
            onClick={isRecording ? stopRecording : startRecording}
            className="w-24 h-24 rounded-full flex items-center justify-center shadow-aura transition-all hover:scale-110 active:scale-95 bg-va-black text-white"
            data-voices-sonic-dna="click-premium"
          >
            {isRecording ? <Square size={32} fill="currentColor" strokeWidth={1.5} /> : <Mic size={32} fill="currentColor" strokeWidth={1.5} />}
          </ButtonInstrument>
        ) : (
          <>
            <ButtonInstrument 
              onClick={resetRecording}
              className="w-16 h-16 rounded-full bg-va-black/5 text-va-black/40 flex items-center justify-center hover:bg-va-black/10 hover:text-va-black transition-all"
            >
              <RotateCcw size={24} strokeWidth={1.5} />
            </ButtonInstrument>
            <ButtonInstrument 
              onClick={handleSubmit}
              className="va-btn-pro !rounded-full !px-12 flex items-center gap-3"
              data-voices-sonic-dna="click-premium"
            >
              <CheckCircle2 strokeWidth={1.5} size={20} /> 
              <TextInstrument className="font-light tracking-widest text-[15px] ">
                <VoiceglotText  translationKey="academy.recorder.submit" defaultText="INLEVEREN VOOR FEEDBACK" />
              </TextInstrument>
            </ButtonInstrument>
          </>
        )}
      </ContainerInstrument>
    </ContainerInstrument>
  );
};
