"use client";

import { useCheckout } from '@/contexts/CheckoutContext';
import { getMusicLibrary } from '@/lib/api';
import { cn } from '@/lib/utils';
import { Check, Info, Loader2, Music, Pause, Play } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { 
  ButtonInstrument, 
  ContainerInstrument, 
  HeadingInstrument, 
  TextInstrument 
} from './LayoutInstruments';
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
      <ContainerInstrument className="bg-va-off-white rounded-[24px] md:rounded-[32px] p-6 md:p-8 border border-black/5 flex items-center justify-center min-h-[150px] md:min-h-[200px]">
        <Loader2 strokeWidth={1.5} className="animate-spin text-primary" size={24} md:size={32} />
      </ContainerInstrument>
    );
  }

  return (
    <ContainerInstrument className="bg-va-off-white rounded-[24px] md:rounded-[32px] p-6 md:p-8 border border-black/5 space-y-4 md:space-y-6 my-6 md:my-8">
      <ContainerInstrument className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 md:gap-0">
        <ContainerInstrument className="flex items-center gap-3">
          <ContainerInstrument className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
            <Music strokeWidth={1.5} size={18} md:size={20} />
          </ContainerInstrument>
          <ContainerInstrument>
            <HeadingInstrument level={4} className="text-[15px] md:text-[15px] font-light tracking-tight ">
              <VoiceglotText  translationKey="music.selector.title" defaultText="Kies je sfeer" />
            </HeadingInstrument>
            <TextInstrument className="text-[15px] md:text-[15px] text-va-black/40 font-medium">
              <VoiceglotText  translationKey="music.selector.subtitle" defaultText="Beluister enkele voorbeelden van onze rechtenvrije bibliotheek." />
            </TextInstrument>
          </ContainerInstrument>
        </ContainerInstrument>
        <ContainerInstrument className="text-left md:text-right">
          <TextInstrument as="span" className="text-base md:text-lg font-black text-va-black">€59</TextInstrument>
          <TextInstrument className="text-[15px] md:text-[15px] font-bold text-va-black/30 tracking-widest ">
            <VoiceglotText  translationKey="music.selector.price_label" defaultText="Eénmalig per set" />
          </TextInstrument>
        </ContainerInstrument>
      </ContainerInstrument>

      <ContainerInstrument className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
        {tracks.map((track) => (
          <ContainerInstrument key={track.id} className="relative group">
            <ButtonInstrument 
              onClick={() => handleSelectTrack(track.id)}
              className={cn(
                "w-full p-3 md:p-4 rounded-xl md:rounded-2xl border-2 transition-all text-left flex items-center justify-between bg-white",
                state.music.trackId === track.id ? "border-primary bg-primary/5 shadow-sm" : "border-black/5 hover:border-primary/20"
              )}
            >
              <ContainerInstrument>
                <TextInstrument className={cn("text-[15px] md:text-[15px] font-black uppercase tracking-widest", state.music.trackId === track.id ? "text-primary" : "text-va-black")}>{track.title}</TextInstrument>
                <TextInstrument className="text-[15px] md:text-[15px] font-bold text-va-black/30 tracking-tighter ">{track.vibe}</TextInstrument>
              </ContainerInstrument>
              <ButtonInstrument className={cn(
                "w-7 h-7 md:w-8 md:h-8 rounded-full flex items-center justify-center transition-all p-0",
                state.music.trackId === track.id ? "bg-primary text-white" : "bg-va-black/5 text-va-black/20 group-hover:bg-va-black group-hover:text-white"
              )} onClick={(e: any) => { e.stopPropagation(); togglePlay(track); }}>
                {playingId === track.id ? <Pause strokeWidth={1.5} size={12} md:size={14} fill="currentColor" /> : <Play strokeWidth={1.5} size={12} md:size={14} fill="currentColor" className="ml-0.5" />}
              </ButtonInstrument>
            </ButtonInstrument>
            {state.music.trackId === track.id && (
              <ContainerInstrument className="absolute -top-1.5 -right-1.5 md:-top-2 md:-right-2 w-4 h-4 md:w-5 md:h-5 bg-primary text-white rounded-full flex items-center justify-center shadow-lg animate-in zoom-in duration-300">
                <Check strokeWidth={1.5} size={10} md:size={12} />
              </ContainerInstrument>
            )}
          </ContainerInstrument>
        ))}
      </ContainerInstrument>

      {state.music.trackId && (
        <ContainerInstrument className="bg-white p-4 md:p-6 rounded-xl md:rounded-2xl border border-primary/10 space-y-3 md:space-y-4 animate-in slide-in-from-top-2 duration-500">
          <ContainerInstrument className="flex items-center gap-2 mb-1 md:mb-2">
            <Info strokeWidth={1.5} size={14} className="text-primary" />
            <TextInstrument className="text-[15px] md:text-[15px] font-black tracking-widest text-va-black/60 ">
              <VoiceglotText  translationKey="music.options.title" defaultText="Hoe wil je deze muziek gebruiken?" />
            </TextInstrument>
          </ContainerInstrument>
          
          <ContainerInstrument className="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-3">
            <ButtonInstrument 
              onClick={() => updateMusic({ asBackground: !state.music.asBackground })}
              className={cn(
                "flex items-center gap-3 p-3 md:p-4 rounded-xl border-2 transition-all text-left bg-white",
                state.music.asBackground ? "border-primary bg-primary/5" : "border-black/5 bg-va-off-white/30 hover:border-black/10"
              )}
            >
              <ContainerInstrument className={cn("w-4 h-4 md:w-5 md:h-5 rounded-md border-2 flex items-center justify-center shrink-0", state.music.asBackground ? "bg-primary border-primary text-white" : "border-black/10")}>
                {state.music.asBackground && <Check strokeWidth={1.5} size={10} md:size={12} />}
              </ContainerInstrument>
              <ContainerInstrument>
                <TextInstrument className="text-[15px] md:text-[15px] font-black tracking-tight ">
                  <VoiceglotText  translationKey="music.options.background.title" defaultText="Achtergrondmuziek" />
                </TextInstrument>
                <TextInstrument className="text-[15px] md:text-[15px] font-medium text-va-black/40">
                  <VoiceglotText  translationKey="music.options.background.desc" defaultText="Gemixt onder de stem (professionele mix)." />
                </TextInstrument>
              </ContainerInstrument>
            </ButtonInstrument>

            <ButtonInstrument 
              onClick={() => updateMusic({ asHoldMusic: !state.music.asHoldMusic })}
              className={cn(
                "flex items-center gap-3 p-3 md:p-4 rounded-xl border-2 transition-all text-left bg-white",
                state.music.asHoldMusic ? "border-primary bg-primary/5" : "border-black/5 bg-va-off-white/30 hover:border-black/10"
              )}
            >
              <ContainerInstrument className={cn("w-4 h-4 md:w-5 md:h-5 rounded-md border-2 flex items-center justify-center shrink-0", state.music.asHoldMusic ? "bg-primary border-primary text-white" : "border-black/10")}>
                {state.music.asHoldMusic && <Check strokeWidth={1.5} size={10} md:size={12} />}
              </ContainerInstrument>
              <ContainerInstrument>
                <TextInstrument className="text-[15px] md:text-[15px] font-black tracking-tight ">
                  <VoiceglotText  translationKey="music.options.hold.title" defaultText="Wachtmuziek" />
                </TextInstrument>
                <TextInstrument className="text-[15px] md:text-[15px] font-medium text-va-black/40">
                  <VoiceglotText  translationKey="music.options.hold.desc" defaultText="Als apart audiobestand voor je centrale." />
                </TextInstrument>
              </ContainerInstrument>
            </ButtonInstrument>
          </ContainerInstrument>
          
          {state.music.asBackground && state.music.asHoldMusic && (
            <TextInstrument className="text-[15px] md:text-[15px] font-bold text-primary text-center italic">
              <VoiceglotText  translationKey="music.options.both_hint" defaultText="Beide opties gekozen: we leveren zowel de mix als het losse bestand." />
            </TextInstrument>
          )}
        </ContainerInstrument>
      )}

      <ContainerInstrument className="flex items-center gap-2 bg-white/50 p-2 md:p-3 rounded-xl border border-black/5">
        <Check strokeWidth={1.5} size={14} className="text-green-500" />
        <TextInstrument className="text-[15px] md:text-[15px] font-medium text-va-black/60">
          <VoiceglotText  translationKey="music.selector.footer_note" defaultText="Inclusief professionele mix door onze technici." />
        </TextInstrument>
      </ContainerInstrument>
    </ContainerInstrument>
  );
};
