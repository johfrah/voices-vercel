"use client";

import { ContainerInstrument, HeadingInstrument, TextInstrument } from "@/components/ui/LayoutInstruments";
import { VoiceglotText } from "@/components/ui/VoiceglotText";
import { WorkshopEditModal } from "@/components/ui/WorkshopEditModalInstrument";
import { useEditMode } from "@/contexts/EditModeContext";
import { useSonicDNA } from "@/lib/engines/sonic-dna";
import { Settings, Play, Pause, Calendar, ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

interface WorkshopCardProps {
  workshop: any;
  onUpdate?: (updatedWorkshop: any) => void;
}

export const WorkshopCard: React.FC<WorkshopCardProps> = ({ workshop, onUpdate }) => {
  const { playClick } = useSonicDNA();
  const { isEditMode } = useEditMode();
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeSubtitle, setActiveSubtitle] = useState<string | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const nextEdition = workshop.editions?.length > 0 ? workshop.editions[0] : null;
  const videoPath = workshop.media?.filePath || workshop.media?.file_path;

  //  SMART AVAILABILITY LOGIC
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

  // 🛡️ CHRIS-PROTOCOL: Determine CTA label based on availability
  const ctaLabel = nextEdition 
    ? (availability?.label === 'VOLZET' ? 'studio.view_cta' : 'studio.book_cta') 
    : 'studio.interest_cta';
  
  const ctaDefaultText = nextEdition
    ? (availability?.label === 'VOLZET' ? 'Bekijk workshop' : 'Boek nu')
    : 'Meld je aan';

  //  SUBTITLE LOGIC (VOICES 2026)
  const [shouldLoadVideo, setShouldLoadVideo] = useState(false);

  useEffect(() => {
    //  CHRIS-PROTOCOL: Lazy load video only when card is in view or after a short delay
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
    setIsEditModalOpen(true);
  };
  
  const togglePlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!videoRef.current) return;

    if (isPlaying) {
      videoRef.current.pause();
      videoRef.current.muted = true;
      setIsPlaying(false);
      playClick('soft');
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
  
  //  CHRIS-PROTOCOL: Strip HTML and clean whitespace
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
      className={`group relative bg-white rounded-[20px] overflow-hidden shadow-aura hover:shadow-aura-lg hover:scale-[1.01] active:scale-[0.99] transition-all duration-500 border border-black/[0.02] flex flex-col cursor-pointer touch-manipulation h-full ${isEditMode ? 'ring-2 ring-primary ring-inset' : ''}`}
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
          {/*  SMART AVAILABILITY CHIP */}
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
                srcLang="nl-BE"
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
            className={`w-16 h-16 !rounded-full bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center hover:scale-110 transition-all duration-300 ${isPlaying ? 'opacity-0 hover:opacity-100' : 'opacity-100'}`}
          >
            {isPlaying ? (
              <Pause size={24} className="text-white fill-white" />
            ) : (
              <Play size={24} className="text-white fill-white ml-1" />
            )}
          </ContainerInstrument>
          </ContainerInstrument>
          <ContainerInstrument plain className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent pointer-events-none" />
          
          {/*  CUSTOM SUBTITLES (VOICES MIX) */}
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
        <ContainerInstrument plain className="flex flex-col gap-4 px-8 pt-8">
          {workshop.editions?.length > 0 && (
            <ContainerInstrument plain className="flex flex-col gap-3">
              {workshop.editions.slice(0, 2).map((edition: any, index: number) => (
                <ContainerInstrument key={edition.id} plain className="flex flex-wrap gap-x-6 gap-y-2">
                  {/* Datum */}
                  <ContainerInstrument plain className="flex items-center gap-2">
                    <Calendar size={14} strokeWidth={1.5} className="text-va-black/40" /> 
                    <TextInstrument className={`text-[15px] tracking-widest ${index === 0 ? 'font-medium text-va-black' : 'font-light text-va-black/30'}`} suppressHydrationWarning>
                      {mounted ? (
                        <VoiceglotText 
                          translationKey={`studio.workshop.${workshop.id}.edition.${edition.id}.date`} 
                          defaultText={new Date(edition.date).toLocaleDateString('nl-BE', { day: 'numeric', month: 'long' })} 
                        />
                      ) : '...'}
                    </TextInstrument>
                  </ContainerInstrument>
                  
                  {/* Tijd & Locatie */}
                  <ContainerInstrument plain className="flex items-center gap-4">
                    <TextInstrument className="text-[15px] font-light text-va-black/30 tracking-widest" suppressHydrationWarning>
                      {mounted ? (
                        <VoiceglotText 
                          translationKey={`studio.workshop.${workshop.id}.edition.${edition.id}.time`} 
                          defaultText={new Date(edition.date).toLocaleTimeString('nl-BE', { hour: '2-digit', minute: '2-digit' })} 
                        />
                      ) : '...'}
                    </TextInstrument>
                    {edition.location?.city && (
                      <TextInstrument className="text-[15px] font-light text-va-black/30 tracking-widest">
                        <VoiceglotText 
                          translationKey={`studio.workshop.${workshop.id}.edition.${edition.id}.location`} 
                          defaultText={edition.location.city} 
                        />
                      </TextInstrument>
                    )}
                  </ContainerInstrument>
                </ContainerInstrument>
              ))}
            </ContainerInstrument>
          )}
        </ContainerInstrument>

        <ContainerInstrument plain className="px-8 pt-8 pb-8 flex flex-col flex-grow">
          <HeadingInstrument level={3} className="text-3xl font-light tracking-tighter leading-tight mb-1 group-hover:text-primary transition-colors">
            <VoiceglotText translationKey={`studio.workshop.${workshop.id}.title`} defaultText={workshop.title} />
          </HeadingInstrument>

          {/* Workshopgever */}
          {(nextEdition?.instructor?.name || workshop.instructor?.name) && (
            <TextInstrument className="text-[15px] font-light text-va-black/40 mb-6 tracking-widest">
              <VoiceglotText 
                translationKey={`studio.workshop.${workshop.id}.instructor_prefix`} 
                defaultText="door" 
                className="mr-1"
              />
              <VoiceglotText 
                translationKey={`instructor.${workshop.instructor_id || 'default'}.name`} 
                defaultText={nextEdition?.instructor?.name || workshop.instructor?.name} 
              />
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

          {/* Spacer to push price/cta to bottom */}
          <div className="flex-grow" />

          <ContainerInstrument plain className="flex justify-between items-end pt-6 border-t border-black/[0.03] mt-auto">
            <ContainerInstrument plain>
              <TextInstrument className="text-[15px] text-va-black/30 font-light tracking-widest mb-1">
                <VoiceglotText translationKey="studio.investment" defaultText="Investering" />
              </TextInstrument>
              <TextInstrument className="text-3xl font-light tracking-tighter text-va-black">
                 {nextEdition?.price ? parseFloat(nextEdition.price.toString()).toFixed(2) : parseFloat(workshop.price?.toString() || '0').toFixed(2)}
              </TextInstrument>
            </ContainerInstrument>
            
            <Link 
              href={nextEdition ? `/studio/${workshop.slug}` : `/studio/doe-je-mee?workshop=${workshop.slug}`}
              onClick={(e) => {
                e.preventDefault();
                if (nextEdition) {
                  router.push(`/studio/${workshop.slug}`);
                } else {
                  router.push(`/studio/doe-je-mee?workshop=${workshop.slug}`);
                }
              }}
              className="flex items-center gap-3 text-[15px] font-light tracking-widest text-primary group/btn min-h-[44px] px-4 py-2 bg-primary/5 hover:bg-primary/10 rounded-[10px] transition-all"
            >
              <VoiceglotText translationKey={ctaLabel} defaultText={ctaDefaultText} />
              <ArrowRight size={16} strokeWidth={1.5} className="group-hover/btn:translate-x-1 transition-transform" />
            </Link>
          </ContainerInstrument>
        </ContainerInstrument>
      </ContainerInstrument>

      <WorkshopEditModal 
        workshop={workshop}
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onUpdate={onUpdate}
      />
    </ContainerInstrument>
  );
};
