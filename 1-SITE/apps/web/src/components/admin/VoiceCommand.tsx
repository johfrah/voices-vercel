"use client";

import { useState } from 'react';
import { Mic, Play, Check, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * 🎙️ VOICE-TO-UI COMMAND (Shadow Mode)
 * 
 * Prototype voor conversational edits.
 * Veiligheid: Human-in-the-loop (Shadow Command).
 */

export default function VoiceCommand() {
  const [isRecording, setIsRecording] = useState(false);
  const [draft, setDraft] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const startRecording = () => {
    setIsRecording(true);
    // Simuleer spraakherkenning
    setTimeout(() => {
      setIsRecording(false);
      setIsProcessing(true);
      setTimeout(() => {
        setIsProcessing(false);
        setDraft("Maak de prijzen op de workshop-pagina 10% goedkoper voor de komende 24 uur.");
      }, 1500);
    }, 3000);
  };

  const confirmCommand = () => {
    console.log("🚀 Shadow Command Geactiveerd:", draft);
    setDraft(null);
    // Hier triggeren we de echte database mutatie
  };

  return (
    <div className="fixed bottom-8 right-8 z-50">
      <AnimatePresence>
        {draft && (
          <motion.div 
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="mb-4 p-6 bg-white/90 backdrop-blur-xl rounded-2xl shadow-2xl border border-primary/20 w-80"
          >
            <p className="text-[10px] font-black uppercase tracking-widest text-primary mb-2">Voicy Shadow Command</p>
            <p className="text-sm text-va-black mb-4 italic">&quot;{draft}&quot;</p>
            <div className="flex gap-2">
              <button 
                onClick={confirmCommand}
                className="flex-1 bg-va-black text-white py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest hover:bg-primary transition-colors flex items-center justify-center gap-2"
              >
                <Check size={12} /> Confirm
              </button>
              <button 
                onClick={() => setDraft(null)}
                className="px-4 py-2 bg-va-black/5 text-va-black rounded-lg hover:bg-va-black/10 transition-colors"
              >
                <X size={12} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <button
        onClick={startRecording}
        className={`w-16 h-16 rounded-full flex items-center justify-center shadow-2xl transition-all duration-500 ${
          isRecording ? 'bg-primary scale-110' : 'bg-va-black hover:bg-primary'
        }`}
      >
        {isProcessing ? (
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
          >
            <Play className="text-white fill-white" size={24} />
          </motion.div>
        ) : (
          <Mic className={`text-white ${isRecording ? 'animate-pulse' : ''}`} size={24} />
        )}
      </button>
    </div>
  );
}
