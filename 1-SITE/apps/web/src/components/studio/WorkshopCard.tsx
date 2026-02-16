"use client";

import { ContainerInstrument, HeadingInstrument, TextInstrument } from "@/components/ui/LayoutInstruments";
import { VoiceglotText } from "@/components/ui/VoiceglotText";
import { useEditMode } from "@/contexts/EditModeContext";
import { useSonicDNA } from "@/lib/sonic-dna";
import { Settings } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

interface WorkshopCardProps {
  workshop: any;
}

export const WorkshopCard: React.FC<WorkshopCardProps> = ({ workshop }) => {
  const { playClick } = useSonicDNA();
  const { isEditMode } = useEditMode();
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeSubtitle, setActiveSubtitle] = useState<string | null>(null);
  
  const nextEdition = workshop.editions?.length > 0 ? workshop.editions[0] : null;
  const videoPath = workshop.media?.filePath || workshop.media?.file_path;

  // 🧠 SMART AVAILABILITY LOGIC
  const getAvailabilityStatus = (edition: any) => {
    if (!edition) return null;
    const capacity = edition.capacity || 8;
    const filled = edition.participants?.length || 0;
    const remaining = capacity - filled;

    if (remaining <= 0) return { label: 'VOLZET', color: 'bg-va-black text-white' };
    if (remaining <= 2) return { label: `LAATSTE ${remaining === 1 ? 'PLEK' : 'PLEKKEN'}`, color: 'bg-primary text-white animate-pulse' };
    return { label: 'BESCHIKBAAR', color: 'bg-va-off-white text-va-black/40' };
  };

  const availability = getAvailabilityStatus(nextEdition);

  // 📝 SUBTITLE LOGIC (VOICES 2026)
  const [shouldLoadVideo, setShouldLoadVideo] = useState(false);

  useEffect(() => {
    // 🛡️ CHRIS-PROTOCOL: Lazy load video only when card is in view or after a short delay
    const timer = setTimeout(() => setShouldLoadVideo(true), 1000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!shouldLoadVideo) return;
    const video = videoRef.current;
    if (!video) return;

    const handleCueChange = (e: Event) => {
      const track = e.target as TextTrack;
      if (track.activeCues && track.activeCues.length > 0) {
        const cue = track.activeCues[0] as VTTCue;
        setActiveSubtitle(cue.text);
      } else {
        setActiveSubtitle(null);
      }
    };

    // We need to wait for the tracks to be available
    const setupTracks = () => {
      const tracks = video.textTracks;
      if (tracks.length === 0) {
        // If no tracks yet, try again in a bit
        setTimeout(setupTracks, 500);
        return;
      }
      for (let i = 0; i < tracks.length; i++) {
        tracks[i].mode = 'hidden'; // Hide default browser subtitles
        tracks[i].removeEventListener('cuechange', handleCueChange);
        tracks[i].addEventListener('cuechange', handleCueChange);
      }
    };

    video.addEventListener('loadedmetadata', setupTracks);
    setupTracks(); // Try immediately too

    return () => {
      video.removeEventListener('loadedmetadata', setupTracks);
      const tracks = video.textTracks;
      for (let i = 0; i < tracks.length; i++) {
        tracks[i].removeEventListener('cuechange', handleCueChange);
      }
    };
  }, [videoPath, shouldLoadVideo]);

  const handleCardClick = () => {
    if (isEditMode) return;
    playClick('soft');
    router.push(`/studio/${workshop.slug}`);
  };

  const handleAdminClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    playClick('pro');
    // Open admin modal or navigate to admin page
    router.push(`/admin/workshops/${workshop.id}`);
  };
  
  const togglePlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!videoRef.current) return;

    if (isPlaying) {
      videoRef.current.pause();
      videoRef.current.muted = true;
      setIsPlaying(false);
      playClick('light');
    } else {
      videoRef.current.play();
      videoRef.current.muted = false;
      setIsPlaying(true);
      playClick('pro');
    }
  };
  
  const handleCTAClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    playClick('pro');
  };
  
  // 🛡️ CHRIS-PROTOCOL: Strip HTML and clean whitespace
  const cleanDescription = (text: string) => {
    if (!text) return '';
    return text
      .replace(/<[^>]*>?/gm, '') // Strip HTML tags
      .replace(/\\r\\n/g, ' ')
      .replace(/\r\n/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  };
  
  return (
    <ContainerInstrument 
      onClick={handleCardClick}
      plain
      className={`group relative bg-white rounded-[20px] overflow-hidden shadow-aura hover:scale-[1.01] active:scale-[0.99] transition-all duration-500 border border-black/[0.02] flex flex-col cursor-pointer touch-manipulation h-full ${isEditMode ? 'ring-2 ring-primary ring-inset' : ''}`}
    >
      {/* ADMIN EDIT BUTTON */}
      {isEditMode && (
        <button
          onClick={handleAdminClick}
          className="absolute top-4 right-4 z-[60] w-10 h-10 rounded-full bg-primary text-white shadow-lg flex items-center justify-center hover:scale-110 active:scale-95 transition-all animate-in fade-in zoom-in duration-300"
          title="Bewerk Workshop & Edities"
        >
          <Settings size={20} strokeWidth={2} />
        </button>
      )}

      {/* VIDEO PREVIEW / AFTERMOVIE */}
      {videoPath && (
        <ContainerInstrument plain className="relative aspect-square w-full bg-va-black overflow-hidden">
          {/* 🧠 SMART AVAILABILITY CHIP */}
          {availability && (
            <div className={`absolute top-6 left-6 z-30 px-3 py-1.5 rounded-full text-[10px] font-black tracking-[0.2em] uppercase shadow-lg ${availability.color}`}>
              {availability.label}
            </div>
          )}

          {shouldLoadVideo ? (
            <video 
              ref={videoRef}
              src={`/assets/${videoPath}`}
              className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity duration-700"
              muted
              loop
              playsInline
              autoPlay
              crossOrigin="anonymous"
              preload="metadata"
            >
              {/* MARK'S SUBTITLES INTEGRATION */}
              <track 
                label="Nederlands"
                kind="subtitles"
                srcLang="nl"
                src={`/assets/studio/workshops/subtitles/${videoPath.split('/').pop().replace(/\.[^/.]+$/, "")}-nl.vtt`}
                default
              />
            </video>
          ) : (
            <div className="w-full h-full bg-va-black/20 animate-pulse" />
          )}

          {/* PLAY BUTTON OVERLAY */}
          <ContainerInstrument 
            plain 
            onClick={togglePlay}
            className="absolute inset-0 flex items-center justify-center bg-black/10 transition-opacity duration-500 z-10"
          >
            <ContainerInstrument 
              plain 
              className={`w-16 h-16 rounded-full bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center hover:scale-110 transition-all duration-300 ${isPlaying ? 'opacity-0 hover:opacity-100' : 'opacity-100'}`}
            >
              <Image 
                src={`/assets/common/branding/icons/${isPlaying ? 'INFO' : 'FORWARD'}.svg`} 
                width={24} 
                height={24} 
                alt={isPlaying ? "Pause" : "Play"} 
                className="brightness-0 invert object-contain"
                style={!isPlaying ? { marginLeft: '4px' } : {}}
              />
            </ContainerInstrument>
          </ContainerInstrument>
          <ContainerInstrument plain className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent pointer-events-none" />
          
          {/* 📝 CUSTOM SUBTITLES (VOICES MIX) */}
          {activeSubtitle && (
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 w-[85%] z-20 pointer-events-none text-center">
              <span className="inline-block px-4 py-2 bg-va-black/80 backdrop-blur-md rounded-[12px] text-white text-[14px] font-light leading-relaxed shadow-aura-lg border border-white/5 animate-in fade-in slide-in-from-bottom-2 duration-300">
                {activeSubtitle}
              </span>
            </div>
          )}
        </ContainerInstrument>
      )}

      <ContainerInstrument plain className="p-0 flex flex-col flex-grow">
        <ContainerInstrument plain className="flex flex-col gap-4 mb-8 px-8 pt-8">
          {workshop.editions?.length > 0 && (
            <ContainerInstrument plain className="flex flex-col gap-3">
              {workshop.editions.map((edition: any, index: number) => (
                <ContainerInstrument key={edition.id} plain className="flex flex-wrap gap-x-6 gap-y-2">
                  {/* Datum */}
                  <ContainerInstrument plain className="flex items-center gap-2">
                    <Image src="/assets/common/branding/icons/INFO.svg" width={14} height={14} alt="" style={{ filter: 'invert(18%) sepia(91%) saturate(6145%) hue-rotate(332deg) brightness(95%) contrast(105%)', opacity: 0.4 }} /> 
                    <TextInstrument className={`text-[15px] tracking-widest ${index === 0 ? 'font-medium text-va-black' : 'font-light text-va-black/30'}`}>
                      {new Date(edition.date).toLocaleDateString('nl-BE', { day: 'numeric', month: 'long' })}
                    </TextInstrument>
                  </ContainerInstrument>
                  
                  {/* Tijd & Locatie (alleen voor de eerste editie om rust te bewaren, of compact voor alle) */}
                  <ContainerInstrument plain className="flex items-center gap-4">
                    <TextInstrument className="text-[15px] font-light text-va-black/30 tracking-widest">
                      {new Date(edition.date).toLocaleTimeString('nl-BE', { hour: '2-digit', minute: '2-digit' })}
                    </TextInstrument>
                    {edition.location?.city && (
                      <TextInstrument className="text-[15px] font-light text-va-black/30 tracking-widest">
                        {edition.location.city}
                      </TextInstrument>
                    )}
                  </ContainerInstrument>
                </ContainerInstrument>
              ))}
            </ContainerInstrument>
          )}
        </ContainerInstrument>

        <ContainerInstrument plain className="px-8 pb-8 flex flex-col flex-grow">
          <HeadingInstrument level={3} className="text-3xl font-light tracking-tighter leading-tight mb-1 group-hover:text-primary transition-colors">
            <VoiceglotText translationKey={`studio.workshop.${workshop.id}.title`} defaultText={workshop.title} />
          </HeadingInstrument>

          {/* Workshopgever */}
          {(nextEdition?.instructor?.name || workshop.instructor?.name) && (
            <TextInstrument className="text-[15px] font-light text-va-black/40 mb-6 tracking-widest">
              door {nextEdition?.instructor?.name || workshop.instructor?.name}
            </TextInstrument>
          )}
          
          <ContainerInstrument plain className="max-h-[115px] overflow-y-auto no-scrollbar mb-8">
            <TextInstrument className="text-va-black/40 text-[15px] font-light leading-relaxed max-w-xs">
              <VoiceglotText 
                translationKey={`studio.workshop.${workshop.id}.description`} 
                defaultText={cleanDescription(workshop.description || 'Ga samen met de workshopgever aan de slag in de studio.')} 
              />
            </TextInstrument>
          </ContainerInstrument>

          <ContainerInstrument plain className="flex justify-between items-end pt-6 border-t border-black/[0.03]">
            <ContainerInstrument plain>
              <TextInstrument className="text-[15px] text-va-black/30 font-light tracking-widest mb-1">
                <VoiceglotText translationKey="studio.investment" defaultText="Investering" />
              </TextInstrument>
              <TextInstrument className="text-3xl font-light tracking-tighter text-va-black">
                € {nextEdition?.price ? parseFloat(nextEdition.price.toString()).toFixed(2) : parseFloat(workshop.price?.toString() || '0').toFixed(2)}
              </TextInstrument>
            </ContainerInstrument>
            
            <Link 
              href={`/studio/${workshop.slug}`}
              onClick={handleCTAClick}
              className="flex items-center gap-3 text-[15px] font-light tracking-widest text-primary group/btn min-h-[44px] px-4 py-2 bg-primary/5 hover:bg-primary/10 rounded-[10px] transition-all"
            >
              <VoiceglotText translationKey="studio.book_cta" defaultText="Bekijk workshop" />
              <Image src="/assets/common/branding/icons/FORWARD.svg" width={16} height={16} alt="" style={{ filter: 'invert(18%) sepia(91%) saturate(6145%) hue-rotate(332deg) brightness(95%) contrast(105%)' }} className="group-hover/btn:translate-x-2 transition-transform" />
            </Link>
          </ContainerInstrument>
        </ContainerInstrument>
      </ContainerInstrument>
    </ContainerInstrument>
  );
};
