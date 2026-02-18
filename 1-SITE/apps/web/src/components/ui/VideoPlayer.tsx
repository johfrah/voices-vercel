"use client";

import React, { useRef, useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Play, Pause, Volume2, VolumeX, Maximize, RotateCcw } from 'lucide-react';

interface SubtitleTrack {
  src: string;
  label: string;
  srcLang: string;
}

interface VideoPlayerProps {
  src: string;
  poster?: string;
  className?: string;
  aspectRatio?: 'video' | 'square' | 'portrait' | 'auto';
  autoPlay?: boolean;
  loop?: boolean;
  muted?: boolean;
  subtitles?: SubtitleTrack[];
}

/**
 * VIDEO PLAYER INSTRUMENT
 * 
 * Een high-end videospeler die video's afspeelt vanuit de lokale assetmap.
 * Volgt de Voices-stijl: zachte afronding, aura shadows en vloeiende interactie.
 * Nu met ondersteuning voor meertalige ondertitels (.vtt).
 */
export const VideoPlayer: React.FC<VideoPlayerProps> = ({
  src,
  poster,
  className,
  aspectRatio = 'video',
  autoPlay = false,
  loop = false,
  muted = false,
  subtitles = [],
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [isMuted, setIsMuted] = useState(muted);
  const [progress, setProgress] = useState(0);
  const [showControls, setShowControls] = useState(false);
  const [activeSubtitle, setActiveSubtitle] = useState<string | null>(subtitles.length > 0 ? subtitles[0].srcLang : null);

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleProgress = () => {
    if (videoRef.current) {
      const currentProgress = (videoRef.current.currentTime / videoRef.current.duration) * 100;
      setProgress(currentProgress);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (videoRef.current) {
      const seekTime = (Number(e.target.value) / 100) * videoRef.current.duration;
      videoRef.current.currentTime = seekTime;
      setProgress(Number(e.target.value));
    }
  };

  const toggleFullscreen = () => {
    if (videoRef.current) {
      if (videoRef.current.requestFullscreen) {
        videoRef.current.requestFullscreen();
      }
    }
  };

  const aspectClasses = {
    video: 'aspect-video',
    square: 'aspect-square',
    portrait: 'aspect-[9/16]',
    auto: 'aspect-auto',
  };

  return (
    <div 
      className={cn(
        "relative rounded-[20px] overflow-hidden bg-va-black shadow-aura group",
        aspectClasses[aspectRatio],
        className
      )}
      onMouseEnter={() => setShowControls(true)}
      onMouseLeave={() => setShowControls(false)}
    >
      <video
        ref={videoRef}
        src={src}
        poster={poster}
        className="w-full h-full object-cover"
        autoPlay={autoPlay}
        loop={loop}
        muted={muted}
        onTimeUpdate={handleProgress}
        onClick={togglePlay}
        playsInline
      >
        {subtitles.map((track) => (
          <track
            key={track.srcLang}
            kind="subtitles"
            src={track.src}
            srcLang={track.srcLang}
            label={track.label}
            default={activeSubtitle === track.srcLang}
          />
        ))}
      </video>

      {/* Overlay Play Button (Visible when paused) */}
      {!isPlaying && (
        <div 
          className="absolute inset-0 flex items-center justify-center bg-black/20 cursor-pointer transition-opacity duration-300"
          onClick={togglePlay}
        >
          <div className="w-20 h-20 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white scale-100 hover:scale-110 transition-transform">
            <Play size={32} fill="currentColor" />
          </div>
        </div>
      )}

      {/* Custom Controls */}
      <div className={cn(
        "absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/60 to-transparent transition-opacity duration-300 flex flex-col gap-4",
        showControls || !isPlaying ? "opacity-100" : "opacity-0"
      )}>
        {/* Progress Bar */}
        <input
          type="range"
          min="0"
          max="100"
          value={progress}
          onChange={handleSeek}
          className="w-full h-1 bg-white/20 rounded-full appearance-none cursor-pointer accent-primary"
        />

        <div className="flex items-center justify-between text-white">
          <div className="flex items-center gap-4">
            <button onClick={togglePlay} className="hover:text-primary transition-colors">
              {isPlaying ? <Pause size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" />}
            </button>
            <button onClick={toggleMute} className="hover:text-primary transition-colors">
              {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
            </button>
            
            {/* Subtitle Selector */}
            {subtitles.length > 0 && (
              <div className="flex items-center gap-2 ml-2">
                {subtitles.map((track) => (
                  <button
                    key={track.srcLang}
                    onClick={() => setActiveSubtitle(activeSubtitle === track.srcLang ? null : track.srcLang)}
                    className={cn(
                      "text-[15px] px-2 py-1 rounded border border-white/20 transition-all",
                      activeSubtitle === track.srcLang ? "bg-primary border-primary text-white" : "bg-white/10 text-white/60 hover:bg-white/20"
                    )}
                  >
                    {track.srcLang.toUpperCase()}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center gap-4">
            <button onClick={toggleFullscreen} className="hover:text-primary transition-colors">
              <Maximize size={20} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
