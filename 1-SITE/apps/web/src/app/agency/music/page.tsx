"use client";

import { 
  PageWrapperInstrument, 
  SectionInstrument, 
  ContainerInstrument, 
  HeadingInstrument, 
  TextInstrument 
} from "@/components/ui/LayoutInstruments";
import { VoiceglotText } from "@/components/ui/VoiceglotText";
import { Music, Play, Pause, Loader2, ArrowRight, Check, Info } from "lucide-react";
import { useState, useEffect } from "react";
import { getMusicLibrary } from "@/lib/api";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { useCheckout } from "@/contexts/CheckoutContext";

export default function MusicLibraryPage() {
  const { state: checkoutState, updateMusic } = useCheckout();
  const router = useRouter();
  const [tracks, setTracks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [audio, setAudio] = useState<HTMLAudioElement | null>(null);
  const [selectedTrackId, setSelectedTrackId] = useState<string | null>(null);
  const [options, setOptions] = useState({ asBackground: true, asHoldMusic: false });

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

  const handleAddToCart = (track: any) => {
    updateMusic({
      trackId: track.id,
      asBackground: options.asBackground,
      asHoldMusic: options.asHoldMusic
    });
    router.push('/checkout?usage=telephony&music=true');
  };

  return (
    <PageWrapperInstrument className="min-h-screen bg-va-off-white">
      <SectionInstrument className="relative pt-32 pb-12 overflow-hidden">
        <ContainerInstrument className="max-w-7xl mx-auto px-6 text-center space-y-6">
          <ContainerInstrument className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full text-primary text-[15px] font-black tracking-widest">
            <Music size={12} fill="currentColor" /> 
            <VoiceglotText translationKey="music.badge" defaultText="Muziekbibliotheek" />
          </ContainerInstrument>
          <HeadingInstrument level={1} className="text-7xl md:text-9xl font-black leading-[0.85] tracking-tighter">
            MUSIC<span className="text-primary">.</span>
          </HeadingInstrument>
          <TextInstrument className="text-xl md:text-2xl font-medium text-va-black/60 leading-tight max-w-2xl mx-auto"><VoiceglotText translationKey="music.hero.subtitle" defaultText="De perfecte soundtrack voor uw voice-over. Rechtenvrije muziek, klaar voor gebruik." /></TextInstrument>
        </ContainerInstrument>
      </SectionInstrument>

      <SectionInstrument className="pb-32 px-6">
        <ContainerInstrument className="max-w-6xl mx-auto">
          {loading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="animate-spin text-primary" size={48} />
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
                {tracks.map((track) => (
                  <div 
                    key={track.id}
                    className={cn(
                      "bg-white rounded-[32px] p-8 border border-black/5 shadow-sm hover:shadow-aura transition-all group relative overflow-hidden",
                      selectedTrackId === track.id ? "ring-2 ring-primary border-transparent" : ""
                    )}
                  >
                    <div className="flex flex-col h-full justify-between space-y-8">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className={cn(
                            "w-10 h-10 rounded-full flex items-center justify-center transition-all",
                            playingId === track.id ? "bg-primary text-white" : "bg-va-black/5 text-va-black/20"
                          )}>
                            <Music size={20} />
                          </div>
                          <span className="text-[15px] font-black text-primary tracking-widest">€59</span>
                        </div>
                        <h3 className="text-xl font-black tracking-tight">{track.title}</h3>
                        <p className="text-[15px] font-bold text-va-black/30 tracking-widest">{track.vibe}</p>
                      </div>

                      <div className="flex items-center gap-4">
                        <button 
                          onClick={() => togglePlay(track)}
                          className={cn(
                            "flex-1 py-4 rounded-2xl font-black uppercase tracking-widest text-[15px] transition-all flex items-center justify-center gap-2 shadow-lg",
                            playingId === track.id ? "bg-va-black text-white" : "bg-va-off-white text-va-black hover:bg-va-black hover:text-white"
                          )}
                        >
                          {playingId === track.id ? <><Pause size={14} fill="currentColor" /><VoiceglotText translationKey="auto.page.pauze.899994" defaultText="Pauze" /></> : <><Play size={14} fill="currentColor" /><VoiceglotText translationKey="auto.page.beluister.59da41" defaultText="Beluister" /></>}
                        </button>
                        <button 
                          onClick={() => setSelectedTrackId(track.id)}
                          className={cn(
                            "w-12 h-14 rounded-2xl flex items-center justify-center transition-all",
                            selectedTrackId === track.id ? "bg-primary text-white" : "bg-va-black text-white hover:bg-primary"
                          )}
                        >
                          {selectedTrackId === track.id ? <Check strokeWidth={1.5} size={20} /> : <ArrowRight strokeWidth={1.5} size={20} />}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* 🛒 SELECTION PANEL */}
              <div className="relative">
                <div className="sticky top-32 space-y-6">
                  <div className="bg-va-black text-white rounded-[40px] p-8 shadow-2xl border-b-8 border-primary overflow-hidden relative">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full -mr-16 -mt-16 blur-3xl" />
                    
                    <h3 className="text-2xl font-black tracking-tight mb-6 relative z-10"><VoiceglotText translationKey="auto.page.jouw_selectie.eb01b0" defaultText="Jouw Selectie" /></h3>
                    
                    {selectedTrackId ? (
                      <div className="space-y-8 relative z-10">
                        <div className="flex items-center gap-4 p-4 bg-white/5 rounded-2xl border border-white/10">
                          <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center text-white">
                            <Music size={24} />
                          </div>
                          <div>
                            <p className="text-[15px] font-black tracking-widest text-white/40"><VoiceglotText translationKey="auto.page.gekozen_track.e38acd" defaultText="Gekozen track" /></p>
                            <p className="text-lg font-black ">{tracks.find(t => t.id === selectedTrackId)?.title}</p>
                          </div>
                        </div>

                        <div className="space-y-4">
                          <p className="text-[15px] font-black tracking-widest text-white/40 flex items-center gap-2">
                            <Info size={14} className="text-primary" /><VoiceglotText translationKey="auto.page.hoe_wil_je_dit_gebru.57f6f5" defaultText="Hoe wil je dit gebruiken?" /></p>
                          
                          <div className="grid grid-cols-1 gap-3">
                            <button 
                              onClick={() => setOptions(prev => ({ ...prev, asBackground: !prev.asBackground }))}
                              className={cn(
                                "flex items-center gap-3 p-4 rounded-xl border-2 transition-all text-left",
                                options.asBackground ? "border-primary bg-primary/10" : "border-white/5 bg-white/5 hover:bg-white/10"
                              )}
                            >
                              <div className={cn("w-5 h-5 rounded-md border-2 flex items-center justify-center", options.asBackground ? "bg-primary border-primary text-white" : "border-white/20")}>
                                {options.asBackground && <Check strokeWidth={1.5} size={12} />}
                              </div>
                              <div>
                                <p className="text-[15px] font-black tracking-tight"><VoiceglotText translationKey="auto.page.achtergrondmuziek.bb0154" defaultText="Achtergrondmuziek" /></p>
                                <p className="text-[15px] font-medium text-white/40"><VoiceglotText translationKey="auto.page.gemixt_onder_de_stem.5c81ba" defaultText="Gemixt onder de stem." /></p>
                              </div>
                            </button>

                            <button 
                              onClick={() => setOptions(prev => ({ ...prev, asHoldMusic: !prev.asHoldMusic }))}
                              className={cn(
                                "flex items-center gap-3 p-4 rounded-xl border-2 transition-all text-left",
                                options.asHoldMusic ? "border-primary bg-primary/10" : "border-white/5 bg-white/5 hover:bg-white/10"
                              )}
                            >
                              <div className={cn("w-5 h-5 rounded-md border-2 flex items-center justify-center", options.asHoldMusic ? "bg-primary border-primary text-white" : "border-white/20")}>
                                {options.asHoldMusic && <Check strokeWidth={1.5} size={12} />}
                              </div>
                              <div>
                                <p className="text-[15px] font-black tracking-tight"><VoiceglotText translationKey="auto.page.wachtmuziek.57fcdd" defaultText="Wachtmuziek" /></p>
                                <p className="text-[15px] font-medium text-white/40"><VoiceglotText translationKey="auto.page.als_apart_bestand_.63bd38" defaultText="Als apart bestand." /></p>
                              </div>
                            </button>
                          </div>
                        </div>

                        <div className="pt-6 border-t border-white/10 flex items-center justify-between">
                          <span className="text-2xl font-black text-primary">€59.00</span>
                          <button 
                            disabled={!options.asBackground && !options.asHoldMusic}
                            onClick={() => handleAddToCart(tracks.find(t => t.id === selectedTrackId))}
                            className="px-8 py-4 bg-primary text-white rounded-2xl font-black tracking-widest text-[15px] hover:scale-105 transition-all disabled:opacity-20 disabled:scale-100"
                          >
                            Voeg toe</button>
                        </div>
                      </div>
                    ) : (
                      <div className="py-12 text-center space-y-4 opacity-40 relative z-10">
                        <div className="w-16 h-16 rounded-full border-2 border-dashed border-white/20 flex items-center justify-center mx-auto">
                          <Music size={24} />
                        </div>
                        <p className="text-[15px] font-black tracking-widest"><VoiceglotText translationKey="auto.page.kies_een_track_om_te.2115aa" defaultText="Kies een track om te configureren" /></p>
                      </div>
                    )}
                  </div>
                  
                  <div className="p-6 bg-white rounded-[32px] border border-black/5">
                    <p className="text-[15px] font-medium text-va-black/60 leading-relaxed">
                      <span className="font-black text-va-black block mb-1 tracking-widest"><VoiceglotText translationKey="auto.page.inbegrepen_bij_elke_.b8ac49" defaultText="Inbegrepen bij elke licentie:" /></span>
                      • Onbeperkt gebruik (rechtenvrij)<br />
                      • Professionele mix door technicus<br /><VoiceglotText translationKey="auto.page.__hd_wav___8khz_tele.c13eb4" defaultText="• HD WAV & 8kHz Telefoon formaat" /></p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </ContainerInstrument>
      </SectionInstrument>
    </PageWrapperInstrument>
  );
}
