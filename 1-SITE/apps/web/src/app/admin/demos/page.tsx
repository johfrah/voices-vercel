"use client";

import { 
  PageWrapperInstrument, 
  SectionInstrument, 
  ContainerInstrument, 
  HeadingInstrument, 
  TextInstrument, 
  ButtonInstrument 
} from '@/components/ui/LayoutInstruments';
import { VoiceglotText } from '@/components/ui/VoiceglotText';
import { ArrowLeft, LayoutDashboard, Music, Play, Pause, User, Tag, ExternalLink, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';
import toast from 'react-hot-toast';

interface Demo {
  id: number;
  name: string;
  audio_url: string;
  type: string;
  actor_name: string;
  media_id: number | null;
}

export default function DemoBeheerPage() {
  const [demos, setDemos] = useState<Demo[]>([]);
  const [loading, setLoading] = useState(true);
  const [playingId, setPlayingId] = useState<number | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    fetchDemos();
    audioRef.current = new Audio();
    audioRef.current.onended = () => setPlayingId(null);
    return () => {
      audioRef.current?.pause();
      audioRef.current = null;
    };
  }, []);

  const fetchDemos = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/demos');
      const data = await res.json();
      if (data.success) {
        setDemos(data.demos);
      }
    } catch (err) {
      toast.error('Fout bij laden demo\'s');
    } finally {
      setLoading(false);
    }
  };

  const togglePlay = (demo: Demo) => {
    if (playingId === demo.id) {
      audioRef.current?.pause();
      setPlayingId(null);
    } else {
      if (audioRef.current) {
        audioRef.current.src = demo.audio_url;
        audioRef.current.play();
        setPlayingId(demo.id);
      }
    }
  };

  return (
    <PageWrapperInstrument className="min-h-screen bg-va-off-white p-8 pt-24">
      <ContainerInstrument className="max-w-7xl mx-auto">
        <SectionInstrument className="mb-12">
          <Link href="/admin/dashboard" className="flex items-center gap-2 text-va-black/30 hover:text-primary transition-colors text-[15px] font-black tracking-widest mb-8">
            <ArrowLeft strokeWidth={1.5} size={12} /> 
            <VoiceglotText translationKey="admin.back_to_dashboard" defaultText="Terug naar Dashboard" />
          </Link>
          
          <div className="flex justify-between items-end">
            <div className="space-y-4">
              <ContainerInstrument className="inline-block bg-primary/10 text-primary text-[13px] font-black px-3 py-1 rounded-full tracking-widest uppercase">
                1 Truth Handshake Active
              </ContainerInstrument>
              <HeadingInstrument level={1} className="text-6xl font-light tracking-tighter">
                Demo Beheer
              </HeadingInstrument>
              <TextInstrument className="text-xl text-black/40 font-medium tracking-tight max-w-2xl">
                Centraal overzicht van alle {demos.length} audio fragmenten in de media tabel.
              </TextInstrument>
            </div>
          </div>
        </SectionInstrument>

        {loading ? (
          <div className="flex flex-col items-center justify-center p-20 space-y-4">
            <Loader2 className="animate-spin text-primary" size={40} />
            <span className="text-[13px] font-black uppercase tracking-widest text-va-black/20">Data synchroniseren...</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {demos.map((demo) => (
              <div 
                key={demo.id} 
                className="group bg-white rounded-[24px] p-6 border border-black/[0.03] shadow-sm hover:shadow-aura-sm transition-all duration-500 flex items-center gap-6"
              >
                <button 
                  onClick={() => togglePlay(demo)}
                  className={cn(
                    "w-14 h-14 rounded-full flex items-center justify-center transition-all duration-500",
                    playingId === demo.id ? "bg-primary text-white scale-110 shadow-aura-sm" : "bg-va-off-white text-va-black/40 hover:bg-primary/10 hover:text-primary"
                  )}
                >
                  {playingId === demo.id ? <Pause size={24} fill="currentColor" /> : <Play size={24} fill="currentColor" className="ml-1" />}
                </button>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1">
                    <span className="text-[15px] font-bold text-va-black truncate">{demo.name}</span>
                    <span className="px-2 py-0.5 bg-va-black text-white text-[9px] font-black uppercase tracking-widest rounded">
                      ID: {demo.id}
                    </span>
                    {demo.media_id && (
                      <span className="px-2 py-0.5 bg-primary/10 text-primary text-[9px] font-black uppercase tracking-widest rounded border border-primary/10">
                        Media ID: {demo.media_id}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-4 text-[12px] text-va-black/40 font-medium">
                    <div className="flex items-center gap-1.5">
                      <User size={12} className="text-primary" />
                      {demo.actor_name}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Tag size={12} className="text-primary" />
                      {demo.type || 'Algemeen'}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <a 
                    href={demo.audio_url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="p-3 rounded-xl bg-va-off-white text-va-black/20 hover:text-primary transition-colors"
                    title="Open bronbestand"
                  >
                    <ExternalLink size={18} />
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </ContainerInstrument>
    </PageWrapperInstrument>
  );
}
