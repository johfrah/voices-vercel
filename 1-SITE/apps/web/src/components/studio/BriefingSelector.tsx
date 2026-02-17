"use client";

import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, Upload, FileText, X, Play, Pause, Trash2, Check, AlertCircle } from 'lucide-react';
import { useCheckout } from '@/contexts/CheckoutContext';
import { useSonicDNA } from '@/lib/sonic-dna';
import { cn } from '@/lib/utils';
import { ContainerInstrument, TextInstrument, ButtonInstrument } from '../ui/LayoutInstruments';

export const BriefingSelector: React.FC = () => {
  const { state, addBriefingFile, removeBriefingFile } = useCheckout();
  const { playClick } = useSonicDNA();
  
  const [mode, setMode] = useState<'none' | 'record' | 'upload' | 'text'>('none');
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;
      
      const chunks: BlobPart[] = [];
      recorder.ondataavailable = (e) => chunks.push(e.data);
      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/webm' });
        setAudioBlob(blob);
        // In a real app, you would upload this to Supabase Storage here
        const fakeUrl = URL.createObjectURL(blob);
        addBriefingFile({
          name: `Audio Briefing ${new Date().toLocaleTimeString()}`,
          type: 'audio',
          url: fakeUrl
        });
      };

      recorder.start();
      setIsRecording(true);
      setRecordingTime(0);
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
      playClick('pro');
    } catch (err) {
      console.error('Failed to start recording:', err);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      setIsRecording(false);
      if (timerRef.current) clearInterval(timerRef.current);
      playClick('light');
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      playClick('pro');
      // In a real app, upload to Supabase Storage
      const fakeUrl = URL.createObjectURL(file);
      const type = file.type.startsWith('audio') ? 'audio' : file.type.startsWith('video') ? 'video' : 'text';
      addBriefingFile({
        name: file.name,
        type: type as any,
        url: fakeUrl
      });
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <motion.div 
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      className="mt-4 space-y-4 overflow-hidden"
    >
      <div className="grid grid-cols-3 gap-2">
        <button 
          onClick={() => setMode(mode === 'record' ? 'none' : 'record')}
          className={cn(
            "flex flex-col items-center gap-2 p-4 rounded-xl border transition-all",
            mode === 'record' ? "bg-primary/5 border-primary/20 text-primary" : "bg-white border-black/[0.03] hover:border-black/10 text-va-black/40"
          )}
        >
          <Mic size={18} />
          <span className="text-[10px] font-bold uppercase tracking-widest">Opnemen</span>
        </button>
        <button 
          onClick={() => setMode(mode === 'upload' ? 'none' : 'upload')}
          className={cn(
            "flex flex-col items-center gap-2 p-4 rounded-xl border transition-all",
            mode === 'upload' ? "bg-primary/5 border-primary/20 text-primary" : "bg-white border-black/[0.03] hover:border-black/10 text-va-black/40"
          )}
        >
          <Upload size={18} />
          <span className="text-[10px] font-bold uppercase tracking-widest">Upload</span>
        </button>
        <button 
          onClick={() => setMode(mode === 'text' ? 'none' : 'text')}
          className={cn(
            "flex flex-col items-center gap-2 p-4 rounded-xl border transition-all",
            mode === 'text' ? "bg-primary/5 border-primary/20 text-primary" : "bg-white border-black/[0.03] hover:border-black/10 text-va-black/40"
          )}
        >
          <FileText size={18} />
          <span className="text-[10px] font-bold uppercase tracking-widest">Extra Tekst</span>
        </button>
      </div>

      <AnimatePresence mode="wait">
        {mode === 'record' && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="p-6 bg-va-off-white/50 rounded-2xl border border-black/5 flex flex-col items-center gap-4"
          >
            <div className="flex items-center gap-4">
              <div className={cn(
                "w-12 h-12 rounded-full flex items-center justify-center transition-all duration-500",
                isRecording ? "bg-red-500 animate-pulse scale-110" : "bg-va-black/5"
              )}>
                <Mic size={20} className={isRecording ? "text-white" : "text-va-black/20"} />
              </div>
              <div className="flex flex-col">
                <span className="text-2xl font-light tracking-tighter tabular-nums">{formatTime(recordingTime)}</span>
                <span className="text-[10px] font-bold text-va-black/20 uppercase tracking-widest">{isRecording ? 'Aan het opnemen...' : 'Klaar om op te nemen'}</span>
              </div>
            </div>
            <ButtonInstrument 
              onClick={isRecording ? stopRecording : startRecording}
              className={cn(
                "px-8 py-3 rounded-full font-bold text-[12px] tracking-widest uppercase transition-all",
                isRecording ? "bg-va-black text-white" : "bg-primary text-white shadow-lg shadow-primary/20"
              )}
            >
              {isRecording ? 'Stop Opname' : 'Start Opname'}
            </ButtonInstrument>
          </motion.div>
        )}

        {mode === 'upload' && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="relative"
          >
            <input 
              type="file" 
              onChange={handleFileUpload}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              accept="audio/*,video/*,.pdf,.doc,.docx,.txt"
            />
            <div className="p-8 border-2 border-dashed border-black/5 rounded-2xl bg-white flex flex-col items-center gap-3 text-va-black/20 hover:border-primary/20 hover:text-primary/40 transition-all">
              <Upload size={32} strokeWidth={1} />
              <span className="text-[13px] font-light italic">Sleep een bestand hierheen of klik om te bladeren</span>
              <span className="text-[10px] font-bold uppercase tracking-widest opacity-50">Audio, Video of Documenten</span>
            </div>
          </motion.div>
        )}

        {mode === 'text' && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
          >
            <textarea 
              placeholder="Voeg hier extra instructies, uitspraak-hulp of context toe..."
              className="w-full h-32 p-4 bg-white border border-black/[0.03] rounded-xl text-[14px] font-light focus:ring-2 focus:ring-primary/10 transition-all outline-none resize-none"
              onBlur={(e) => {
                if (e.target.value.trim()) {
                  addBriefingFile({
                    name: `Extra instructies (${e.target.value.substring(0, 20)}...)`,
                    type: 'text',
                    url: e.target.value
                  });
                  e.target.value = '';
                  setMode('none');
                }
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {state.briefingFiles.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center gap-2 px-2">
            <Check size={12} className="text-green-500" />
            <span className="text-[10px] font-bold text-va-black/30 uppercase tracking-widest">Toegevoegde briefing ({state.briefingFiles.length})</span>
          </div>
          <div className="flex flex-col gap-2">
            {state.briefingFiles.map((file) => (
              <div key={file.id} className="flex items-center justify-between p-3 bg-white rounded-xl border border-black/[0.03] shadow-sm animate-in slide-in-from-left-2 duration-300">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-va-off-white flex items-center justify-center text-va-black/20">
                    {file.type === 'audio' ? <Mic size={14} /> : file.type === 'video' ? <Play size={14} /> : <FileText size={14} />}
                  </div>
                  <span className="text-[12px] font-medium truncate text-va-black/60">{file.name}</span>
                </div>
                <button 
                  onClick={() => removeBriefingFile(file.id)}
                  className="p-2 text-va-black/20 hover:text-red-500 transition-colors"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
};
