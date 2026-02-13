"use client";

import React, { useState, useRef } from 'react';
import { useSonicDNA } from '@/lib/sonic-dna';
import { Mic, Square, Play, Trash2, CheckCircle2, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * 🎙️ AUDIO RECORDER INSTRUMENT (2026)
 * 
 * Een intelligent instrument voor het opnemen van audiobriefings.
 * Vervangt de PHP [audiorecorder] shortcode.
 */

import { VoiceglotText } from "./VoiceglotText";

interface AudioRecorderProps {
  orderId?: number;
  onUploadComplete?: (url: string) => void;
  className?: string;
}

export const AudioRecorderInstrument: React.FC<AudioRecorderProps> = ({ 
  orderId, 
  onUploadComplete,
  className 
}) => {
  const { playClick, playSwell } = useSonicDNA();
  const [isRecording, setIsRecording] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const audioChunks = useRef<Blob[]>([]);

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
        const audioBlob = new Blob(audioChunks.current, { type: 'audio/mpeg' });
        const url = URL.createObjectURL(audioBlob);
        setAudioUrl(url);
      };

      mediaRecorder.current.start();
      setIsRecording(true);
    } catch (err) {
      setError('Microfoon toegang geweigerd.');
    }
  };

  const stopRecording = () => {
    playClick('soft');
    mediaRecorder.current?.stop();
    setIsRecording(false);
  };

  const handleUpload = async () => {
    if (!audioUrl) return;
    
    setIsUploading(true);
    playClick('pro');

    try {
      // 🚀 ATOMIC UPLOAD: Hier zou de upload naar Supabase Storage komen
      // Simulatie:
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const mockUrl = `https://storage.voices.be/briefings/order-${orderId || 'temp'}.mp3`;
      onUploadComplete?.(mockUrl);
      playClick('success');
      setAudioUrl(null); // Reset na succes
    } catch (err) {
      setError('Upload mislukt.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className={cn(
      "va-cockpit-card p-8 text-center flex flex-col items-center gap-6",
      className
    )}>
      <div className={cn(
        "w-20 h-20 rounded-full flex items-center justify-center transition-all duration-500",
        isRecording ? "bg-red-500 animate-pulse scale-110 shadow-lg shadow-red-500/20" : "bg-primary shadow-lg shadow-primary/20"
      )}>
        <Mic className="text-white" size={32} />
      </div>

      <div className="space-y-2">
        <h3 className="text-xl font-light tracking-tight">
          <VoiceglotText translationKey="recorder.title" defaultText="Audiobriefing" />
        </h3>
        <p className="text-sm text-va-black/40 max-w-xs mx-auto font-light">
          <VoiceglotText translationKey="recorder.subtitle" defaultText="Spreek je instructies in voor de stemacteur. Duidelijkheid boven alles." />
        </p>
      </div>

      <div className="flex flex-col gap-4 w-full max-w-xs">
        {!audioUrl ? (
          <button
            onClick={isRecording ? stopRecording : startRecording}
            onMouseEnter={() => playSwell()}
            className={cn(
              "va-btn-pro w-full py-4 flex items-center justify-center gap-3",
              isRecording && "bg-va-black text-white"
            )}
          >
            {isRecording ? (
              <><Square size={18} fill="currentColor" /> <VoiceglotText translationKey="recorder.stop" defaultText="Stop Opname" /></>
            ) : (
              <><Mic size={18} /> <VoiceglotText translationKey="recorder.start" defaultText="Start Opname" /></>
            )}
          </button>
        ) : (
          <div className="space-y-4 w-full">
            <audio src={audioUrl} controls className="w-full h-10" />
            
            <div className="flex gap-2">
              <button
                onClick={() => setAudioUrl(null)}
                className="va-btn-soft flex-1 py-3 flex items-center justify-center gap-2"
              >
                <Trash2 size={16} /> <VoiceglotText translationKey="recorder.retry" defaultText="Opnieuw" />
              </button>
              
              <button
                onClick={handleUpload}
                disabled={isUploading}
                className="va-btn-pro flex-[2] py-3 flex items-center justify-center gap-2"
              >
                {isUploading ? (
                  <><Loader2 size={16} className="animate-spin" /> <VoiceglotText translationKey="recorder.uploading" defaultText="Bezig..." /></>
                ) : (
                  <><CheckCircle2 size={16} /> <VoiceglotText translationKey="recorder.send" defaultText="Versturen" /></>
                )}
              </button>
            </div>
          </div>
        )}
      </div>

      {error && <p className="text-[15px] font-medium text-red-500 tracking-widest">{error}</p>}

      <div className="pt-6 border-t border-va-black/5 w-full text-left">
        <h4 className="text-[15px] font-medium tracking-widest opacity-30 mb-3">
          <VoiceglotText translationKey="recorder.tips.title" defaultText="Tips voor succes" />
        </h4>
        <ul className="text-[15px] text-va-black/50 space-y-1.5 font-light">
          <li>• <VoiceglotText translationKey="recorder.tips.1" defaultText="Spreek namen en vaktermen duidelijk uit." /></li>
          <li>• <VoiceglotText translationKey="recorder.tips.2" defaultText="Geef aan welk tempo of welke toon je wenst." /></li>
          <li>• <VoiceglotText translationKey="recorder.tips.3" defaultText="Maximaal 2 minuten per opname." /></li>
        </ul>
      </div>
    </div>
  );
};
