"use client";

import { useState, useEffect, useRef } from 'react';
import { 
  PageWrapperInstrument, 
  SectionInstrument, 
  ContainerInstrument, 
  HeadingInstrument, 
  TextInstrument, 
  ButtonInstrument 
} from '@/components/ui/LayoutInstruments';
import { VoiceglotText } from '@/components/ui/VoiceglotText';
import { ArrowLeft, Play, Loader2, CheckCircle2, AlertCircle, Mic2, Mail } from 'lucide-react';
import Link from 'next/link';
import { private-voice-bridge } from '@/lib/services/private-voice-bridge';

export default function JohfraiStudioPage() {
  const [text, setText] = useState("Dag Johfrah, dit is je eigen stemkloon die rechtstreeks vanaf je Mac Mini spreekt. Hoe klinkt dit voor een eerste test?");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [engineStatus, setEngineStatus] = useState<'loading' | 'online' | 'offline'>('loading');
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    checkStatus();
    const interval = setInterval(checkStatus, 10000);
    return () => clearInterval(interval);
  }, []);

  const checkStatus = async () => {
    try {
      const isOnline = await private-voice-bridge.checkHealth();
      setEngineStatus(isOnline ? 'online' : 'offline');
    } catch {
      setEngineStatus('offline');
    }
  };

  const handleGenerate = async () => {
    if (!text || isGenerating) return;
    
    setIsGenerating(true);
    setAudioUrl(null);
    setAudioBlob(null);
    
    try {
      const audioData = await private-voice-bridge.generateAudio(text);
      if (audioData) {
        const blob = new Blob([audioData], { type: 'audio/wav' });
        setAudioBlob(blob);
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);
      }
    } catch (error) {
      console.error('Generatie fout:', error);
      alert('Er is iets misgegaan bij het genereren op de Mac Mini.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSendMail = async () => {
    if (!audioBlob || isSending) return;
    
    setIsSending(true);
    
    try {
      const formData = new FormData();
      formData.append('audio', audioBlob, 'johfrai-fragment.wav');
      formData.append('text', text);
      formData.append('email', process.env.ADMIN_EMAIL || VOICES_CONFIG.company.email);

      const response = await fetch('/api/admin/johfrai/mail', {
        method: 'POST',
        body: formData
      });

      const result = await response.json();
      if (result.success) {
        alert(`Audio succesvol verzonden naar ${process.env.ADMIN_EMAIL || VOICES_CONFIG.company.email}! 🎙️📧`);
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error('Mail fout:', error);
      alert('Er is iets misgegaan bij het verzenden van de mail.');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <PageWrapperInstrument className="min-h-screen bg-va-off-white p-8 pt-24">
      <ContainerInstrument className="max-w-5xl mx-auto">
        <SectionInstrument className="mb-12">
          <Link href="/admin/dashboard" className="flex items-center gap-2 text-va-black/30 hover:text-primary transition-colors text-[15px] font-black tracking-widest mb-8">
            <ArrowLeft strokeWidth={1.5} size={12} /> 
            <VoiceglotText translationKey="admin.back_to_dashboard" defaultText="Terug naar Dashboard" />
          </Link>
          
          <ContainerInstrument className="flex items-center justify-between mb-6">
            <ContainerInstrument className="inline-block bg-primary/10 text-primary text-[13px] font-black px-3 py-1 rounded-full tracking-widest uppercase">
              Private Voice Engine
            </ContainerInstrument>
            
            <ContainerInstrument className={`flex items-center gap-2 px-3 py-1 rounded-full text-[12px] font-bold tracking-tight ${
              engineStatus === 'online' ? 'bg-green-500/10 text-green-600' : 
              engineStatus === 'loading' ? 'bg-amber-500/10 text-amber-600' : 
              'bg-red-500/10 text-red-600'
            }`}>
              {engineStatus === 'online' ? <CheckCircle2 size={14} /> : 
               engineStatus === 'loading' ? <Loader2 size={14} className="animate-spin" /> : 
               <AlertCircle size={14} />}
              {engineStatus === 'online' ? 'Mac Mini Online' : 
               engineStatus === 'loading' ? 'Engine Laden...' : 
               'Mac Mini Offline'}
            </ContainerInstrument>
          </ContainerInstrument>
          
          <HeadingInstrument level={1} className="text-6xl font-light tracking-tighter mb-4">
            Johfrai Studio
          </HeadingInstrument>
          
          <TextInstrument className="text-xl text-black/40 font-medium tracking-tight max-w-2xl">
            Typ hier je tekst en laat je eigen Mac Mini de audio genereren. 100% privé, 0 kosten.
          </TextInstrument>
        </SectionInstrument>

        <ContainerInstrument className="grid grid-cols-1 gap-8">
          <ContainerInstrument className="bg-white rounded-[32px] p-10 shadow-aura-lg border border-black/[0.03]">
            <textarea 
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Typ hier de tekst voor Johfrai..."
              className="w-full h-48 bg-va-off-white/50 rounded-[20px] p-6 text-xl font-light tracking-tight focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all resize-none border-none"
            />
            
            <ContainerInstrument className="mt-8 flex items-center justify-between">
              <ContainerInstrument className="flex items-center gap-4 text-va-black/40">
                <Mic2 size={20} strokeWidth={1.5} />
                <TextInstrument className="text-[15px] font-medium italic">
                  Gebruikt: johfrah-master-2026.wav
                </TextInstrument>
              </ContainerInstrument>

              <ButtonInstrument 
                onClick={handleGenerate}
                disabled={isGenerating || engineStatus !== 'online'}
                className={`h-16 px-10 rounded-[15px] text-lg font-bold tracking-tight transition-all flex items-center gap-3 ${
                  isGenerating ? 'bg-va-black/10 text-va-black/20' : 'bg-primary text-white hover:scale-[1.02] active:scale-[0.98]'
                }`}
              >
                {isGenerating ? (
                  <>
                    <Loader2 size={20} className="animate-spin" />
                    Genereren...
                  </>
                ) : (
                  <>
                    <Play size={20} fill="currentColor" />
                    Speel af op Johfrai
                  </>
                )}
              </ButtonInstrument>
            </ContainerInstrument>
          </ContainerInstrument>

          {audioUrl && (
            <ContainerInstrument className="bg-va-black rounded-[25px] p-8 flex items-center gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <ContainerInstrument className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-white">
                <Play size={20} fill="currentColor" />
              </ContainerInstrument>
              <ContainerInstrument className="flex-1">
                <TextInstrument className="text-white font-bold tracking-tight mb-1">
                  Audio Resultaat
                </TextInstrument>
                <audio 
                  ref={audioRef}
                  src={audioUrl} 
                  controls 
                  autoPlay
                  className="w-full h-8 invert opacity-80"
                />
              </ContainerInstrument>
              <ContainerInstrument className="flex items-center gap-6">
                <a 
                  href={audioUrl} 
                  download="johfrai-output.wav"
                  className="text-[13px] font-black text-white/40 hover:text-white transition-colors tracking-widest uppercase"
                >
                  Download
                </a>

                <ButtonInstrument 
                  onClick={handleSendMail}
                  disabled={isSending}
                  className="bg-white/10 hover:bg-white/20 text-white text-[13px] font-black px-4 py-2 rounded-full tracking-widest uppercase flex items-center gap-2 transition-all"
                >
                  {isSending ? <Loader2 size={12} className="animate-spin" /> : <Mail size={12} />}
                  {isSending ? 'Verzenden...' : 'Mail naar Johfrah'}
                </ButtonInstrument>
              </ContainerInstrument>
            </ContainerInstrument>
          )}
        </ContainerInstrument>
      </ContainerInstrument>
    </PageWrapperInstrument>
  );
}
