"use client";

import { useCheckout } from '@/contexts/CheckoutContext';
import { getMusicLibrary } from '@/lib/services/api';
import { cn } from '@/lib/utils/utils';
import { Check, Info, Loader2, Music, Pause, Play } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { VoiceglotText } from './VoiceglotText';

export const MusicSelector: React.FC<{ context?: string }> = ({ context }) => {
  const { state, updateMusic } = useCheckout();
  const [tracks, setTracks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [audio, setAudio] = useState<HTMLAudioElement | null>(null);

  useEffect(() => {
    async function loadMusic() {
      try {
        const data = await getMusicLibrary();
        setTracks(data);
      } catch (err) {
        console.error('Failed to load music library:', err);
      } finally {
        setLoading(false);
      }
    }
    loadMusic();
  }, []);

  const togglePlay = (track: any) => {
    if (playingId === track.id) {
      audio?.pause();
      setPlayingId(null);
    } else {
      audio?.pause();
      const newAudio = new Audio(track.preview);
      newAudio.play();
      newAudio.onended = () => setPlayingId(null);
      setAudio(newAudio);
      setPlayingId(track.id);
    }
  };

  const handleSelectTrack = (trackId: string) => {
    if (state.music.trackId === trackId) {
      updateMusic({ trackId: null, asBackground: false, asHoldMusic: false });
    } else {
      updateMusic({ trackId, asBackground: true }); // Default to background
    }
  };

  if (loading) {
    return (
      <div className="bg-va-off-white rounded-[32px] p-8 border border-black/5 flex items-center justify-center min-h-[200px]">
        <Loader2 strokeWidth={1.5} className="animate-spin text-primary" size={32} />
      </div>
    );
  }

  return (
    <div className="bg-va-off-white rounded-[32px] p-8 border border-black/5 space-y-6 my-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center">
            <Music strokeWidth={1.5} size={20} />
          </div>
          <div>
            <h4 className="text-[15px] font-light tracking-tight">
              <VoiceglotText  translationKey="music.selector.title" defaultText="Kies je sfeer" />
            </h4>
            <p className="text-[15px] text-va-black/40 font-medium">
              <VoiceglotText  translationKey="music.selector.subtitle" defaultText="Beluister enkele voorbeelden van onze rechtenvrije bibliotheek." />
            </p>
          </div>
        </div>
        <div className="text-right">
          <span className="text-lg font-black text-va-black">59</span>
          <p className="text-[15px] font-bold text-va-black/30 tracking-widest">
            <VoiceglotText  translationKey="music.selector.price_label" defaultText="Enmalig per set" />
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {tracks.map((track) => (
          <div key={track.id} className="relative group">
            <button 
              onClick={() => handleSelectTrack(track.id)}
              className={cn(
                "w-full p-4 rounded-2xl border-2 transition-all text-left flex items-center justify-between",
                state.music.trackId === track.id ? "border-primary bg-primary/5 shadow-sm" : "border-black/5 bg-white hover:border-primary/20"
              )}
            >
              <div>
                <p className={cn("text-[15px] font-black uppercase tracking-widest", state.music.trackId === track.id ? "text-primary" : "text-va-black")}>{track.title}</p>
                <p className="text-[15px] font-bold text-va-black/30 tracking-tighter">{track.vibe}</p>
              </div>
              <div className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center transition-all",
                state.music.trackId === track.id ? "bg-primary text-white" : "bg-va-black/5 text-va-black/20 group-hover:bg-va-black group-hover:text-white"
              )} onClick={(e) => { e.stopPropagation(); togglePlay(track); }}>
                {playingId === track.id ? <Pause strokeWidth={1.5} size={14} fill="currentColor" /> : <Play strokeWidth={1.5} size={14} fill="currentColor" className="ml-0.5" />}
              </div>
            </button>
            {state.music.trackId === track.id && (
              <div className="absolute -top-2 -right-2 w-5 h-5 bg-primary text-white rounded-full flex items-center justify-center shadow-lg animate-in zoom-in duration-300">
                <Check strokeWidth={1.5} size={12} />
              </div>
            )}
          </div>
        ))}
      </div>

      {state.music.trackId && (
        <div className="bg-white p-6 rounded-2xl border border-primary/10 space-y-4 animate-in slide-in-from-top-2 duration-500">
          <div className="flex items-center gap-2 mb-2">
            <Info strokeWidth={1.5} size={14} className="text-primary" />
            <p className="text-[15px] font-black tracking-widest text-va-black/60">
              <VoiceglotText  translationKey="music.options.title" defaultText="Hoe wil je deze muziek gebruiken?" />
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <button 
              onClick={() => updateMusic({ asBackground: !state.music.asBackground })}
              className={cn(
                "flex items-center gap-3 p-4 rounded-xl border-2 transition-all text-left",
                state.music.asBackground ? "border-primary bg-primary/5" : "border-black/5 bg-va-off-white/30 hover:border-black/10"
              )}
            >
              <div className={cn("w-5 h-5 rounded-md border-2 flex items-center justify-center", state.music.asBackground ? "bg-primary border-primary text-white" : "border-black/10")}>
                {state.music.asBackground && <Check strokeWidth={1.5} size={12} />}
              </div>
              <div>
                <p className="text-[15px] font-black tracking-tight">
                  <VoiceglotText  translationKey="music.options.background.title" defaultText="Achtergrondmuziek" />
                </p>
                <p className="text-[15px] font-medium text-va-black/40">
                  <VoiceglotText  translationKey="music.options.background.desc" defaultText="Gemixt onder de stem (professionele mix)." />
                </p>
              </div>
            </button>

            <button 
              onClick={() => updateMusic({ asHoldMusic: !state.music.asHoldMusic })}
              className={cn(
                "flex items-center gap-3 p-4 rounded-xl border-2 transition-all text-left",
                state.music.asHoldMusic ? "border-primary bg-primary/5" : "border-black/5 bg-va-off-white/30 hover:border-black/10"
              )}
            >
              <div className={cn("w-5 h-5 rounded-md border-2 flex items-center justify-center", state.music.asHoldMusic ? "bg-primary border-primary text-white" : "border-black/10")}>
                {state.music.asHoldMusic && <Check strokeWidth={1.5} size={12} />}
              </div>
              <div>
                <p className="text-[15px] font-black tracking-tight">
                  <VoiceglotText  translationKey="music.options.hold.title" defaultText="Wachtmuziek" />
                </p>
                <p className="text-[15px] font-medium text-va-black/40">
                  <VoiceglotText  translationKey="music.options.hold.desc" defaultText="Als apart audiobestand voor je centrale." />
                </p>
              </div>
            </button>
          </div>
          
          {state.music.asBackground && state.music.asHoldMusic && (
            <p className="text-[15px] font-bold text-primary text-center italic">
              <VoiceglotText  translationKey="music.options.both_hint" defaultText="Beide opties gekozen: we leveren zowel de mix als het losse bestand." />
            </p>
          )}
        </div>
      )}

      <div className="flex items-center gap-2 bg-white/50 p-3 rounded-xl border border-black/5">
        <Check strokeWidth={1.5} size={14} className="text-green-500" />
        <p className="text-[15px] font-medium text-va-black/60">
          <VoiceglotText  translationKey="music.selector.footer_note" defaultText="Inclusief professionele mix door onze technici." />
        </p>
      </div>
    </div>
  );
};
