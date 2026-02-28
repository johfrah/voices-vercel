"use client";

import { useSonicDNA } from '@/lib/engines/sonic-dna';
import { cn } from '@/lib/utils';
import { Maximize, Pause, Play, RotateCcw, Volume2, VolumeX } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';

interface StudioVideoPlayerProps {
  url: string;
  poster?: string;
  subtitles?: string; // .vtt URL
  subtitleData?: { start: number; end: number; text: string }[]; // Hardcoded subtitles
  aspect?: 'video' | 'portrait' | 'square';
  className?: string;
}

/**
 *  STUDIO VIDEO PLAYER (VOICES 2026)
 * 
 * Een high-end videoplayer met:
 * - Skeleton loader tijdens het laden.
 * - Geen zwarte randen (object-cover).
 * - Verticale ondersteuning voor TikTok/Reels stijl.
 * - Sonic DNA integratie.
 * - Ondertiteling support (.vtt of hardcoded array).
 */
export const StudioVideoPlayer: React.FC<StudioVideoPlayerProps> = ({ 
  url, 
  poster, 
  subtitles,
  subtitleData,
  aspect = 'portrait',
  className 
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [isLoaded, setIsLoaded] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [activeSubtitle, setActiveSubtitle] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const { playClick } = useSonicDNA();

  // Update active subtitle based on array data
  useEffect(() => {
    if (subtitleData) {
      const sub = subtitleData.find(s => currentTime >= s.start && currentTime <= s.end);
      setActiveSubtitle(sub?.text || null);
    }
  }, [currentTime, subtitleData]);

  React.useEffect(() => {
    if (videoRef.current && !videoRef.current.paused) {
      setIsPlaying(true);
    }

    //  Subtitle Logic via TextTrack API (for .vtt files)
    const video = videoRef.current;
    if (!video || subtitleData) return; // Skip if using hardcoded array

    const handleCueChange = (e: Event) => {
      const track = e.target as TextTrack;
      if (track.activeCues && track.activeCues.length > 0) {
        const cue = track.activeCues[0] as VTTCue;
        setActiveSubtitle(cue.text);
      } else {
        setActiveSubtitle(null);
      }
    };

    const setupTracks = () => {
      const tracks = video.textTracks;
      if (tracks.length === 0) {
        setTimeout(setupTracks, 500);
        return;
      }
      for (let i = 0; i < tracks.length; i++) {
        tracks[i].mode = 'hidden'; // Verberg standaard browser ondertitels
        tracks[i].removeEventListener('cuechange', handleCueChange);
        tracks[i].addEventListener('cuechange', handleCueChange);
      }
    };

    video.addEventListener('loadedmetadata', setupTracks);
    setupTracks();

    return () => {
      video.removeEventListener('loadedmetadata', setupTracks);
      const tracks = video.textTracks;
      for (let i = 0; i < tracks.length; i++) {
        tracks[i].removeEventListener('cuechange', handleCueChange);
      }
    };
  }, [url, isLoaded, subtitleData]);

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
        // Als we expliciet op play drukken, willen we geluid
        if (isMuted) {
          videoRef.current.muted = false;
          setIsMuted(false);
        }
      }
      setIsPlaying(!isPlaying);
      playClick('soft');
    }
  };

  const toggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
      playClick('soft');
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setProgress((videoRef.current.currentTime / videoRef.current.duration) * 100);
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  return (
    <div className={cn(
      "relative group overflow-hidden rounded-[20px] bg-transparent shadow-aura-lg border-none",
      aspect === 'portrait' ? "aspect-[9/16]" : "aspect-video",
      className
    )}>
      {/*  SKELETON LOADER */}
      {!isLoaded && (
        <div className="absolute inset-0 bg-va-black/5 flex items-center justify-center">
          <div className="w-12 h-12 rounded-full border-2 border-primary/20 border-t-primary animate-spin" />
        </div>
      )}

      <video
        ref={videoRef}
        key={url}
        poster={poster}
        autoPlay
        muted={isMuted}
        loop
        playsInline
        preload="metadata"
        className={cn(
          "w-full h-full object-cover transition-opacity duration-700",
          isLoaded ? "opacity-100" : "opacity-0"
        )}
        onTimeUpdate={handleTimeUpdate}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onLoadedData={() => {
          console.log(" Video data loaded:", url);
          setIsLoaded(true);
        }}
        onCanPlay={() => {
          console.log(" Video can play:", url);
          setIsLoaded(true);
        }}
        onLoadedMetadata={() => {
          console.log(" Video metadata loaded:", url);
          setIsLoaded(true);
        }}
        onError={(e) => {
          console.error(" Video failed to load:", url, e);
          setIsLoaded(true);
        }}
        onClick={togglePlay}
        crossOrigin="anonymous"
        src={url}
      >
        {subtitles && (
          <track 
            label="Nederlands"
            kind="subtitles"
            srcLang="nl-BE"
            src={subtitles}
            default
          />
        )}
      </video>

      {/*  CUSTOM SUBTITLES (VOICES MIX) */}
      {activeSubtitle && (
        <div className="absolute bottom-32 left-1/2 -translate-x-1/2 w-[80%] z-20 pointer-events-none text-center">
          <span className="inline-block px-4 py-2 bg-va-black/80 backdrop-blur-md rounded-[12px] text-white text-[15px] md:text-[16px] font-light leading-relaxed shadow-aura-lg border border-white/5">
            {activeSubtitle}
          </span>
        </div>
      )}

      {/* Overlay Controls */}
      <div className={cn(
        "absolute inset-0 bg-gradient-to-t from-va-black/60 via-transparent to-transparent transition-opacity duration-500 flex flex-col justify-end p-6",
        isPlaying ? "opacity-0 group-hover:opacity-100" : "opacity-100"
      )}>
        
        {/* Play Button Overlay */}
        {!isPlaying && isLoaded && (
          <ButtonInstrument 
            variant="pure"
            size="none"
            onClick={togglePlay}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 rounded-full bg-white text-va-black flex items-center justify-center shadow-2xl hover:scale-110 transition-all z-10"
          >
            <Play strokeWidth={1.5} size={32} fill="currentColor" className="ml-1" />
          </ButtonInstrument>
        )}

        {/* Progress Bar */}
        <div className="w-full space-y-4">
          <div className="h-1 w-full bg-white/20 rounded-full overflow-hidden">
            <div 
              className="h-full bg-primary transition-all duration-100 ease-linear" 
              style={{ width: `${progress}%` }}
            />
          </div>
          
          <ContainerInstrument plain className="flex items-center justify-between">
            <ContainerInstrument plain className="flex items-center gap-4">
              <ButtonInstrument 
                variant="pure"
                size="none"
                onClick={togglePlay} 
                className="text-white/80 hover:text-white transition-colors"
              >
                {isPlaying ? <Pause strokeWidth={1.5} size={20} fill="currentColor" /> : <Play strokeWidth={1.5} size={20} fill="currentColor" />}
              </ButtonInstrument>
              <ButtonInstrument 
                variant="pure"
                size="none"
                onClick={toggleMute} 
                className="text-white/80 hover:text-white transition-colors"
              >
                {isMuted ? <VolumeX strokeWidth={1.5} size={20} /> : <Volume2 strokeWidth={1.5} size={20} />}
              </ButtonInstrument>
            </ContainerInstrument>
            <ContainerInstrument plain className="flex gap-4">
               <ButtonInstrument variant="pure" size="none" className="text-white/40 hover:text-white transition-colors"><RotateCcw strokeWidth={1.5} size={18} /></ButtonInstrument>
               <ButtonInstrument variant="pure" size="none" className="text-white/40 hover:text-white transition-colors"><Maximize strokeWidth={1.5} size={18} /></ButtonInstrument>
            </ContainerInstrument>
          </ContainerInstrument>
        </div>
      </div>
    </div>
  );
};
