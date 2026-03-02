"use client";

import React, { useRef, useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Play, Pause, Volume2, VolumeX, Maximize, RotateCcw } from 'lucide-react';

interface SubtitleData {
  start: number;
  end: number;
  text: string;
}

interface SubtitleTrack {
  src?: string;
  label: string;
  srcLang: string;
  data?: SubtitleData[];
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
 * Ondersteunt meertalige ondertitels via .vtt of direct via subtitleData array.
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
  const [currentTime, setCurrentTime] = useState(0);
  const [showControls, setShowControls] = useState(false);
  const [activeSubtitle, setActiveSubtitle] = useState<string | null>(subtitles.length > 0 ? subtitles[0].srcLang : null);
  const [currentSubtitleText, setCurrentSubtitleText] = useState<string>("");

  // Update active subtitle based on array data if available
  useEffect(() => {
    if (!activeSubtitle) {
      setCurrentSubtitleText("");
      return;
    }

    const activeTrack = subtitles.find(s => s.srcLang === activeSubtitle);
    if (activeTrack?.data) {
      const sub = activeTrack.data.find(s => currentTime >= s.start && currentTime <= s.end);
      setCurrentSubtitleText(sub?.text || "");
    }
  }, [currentTime, activeSubtitle, subtitles]);

  useEffect(() => {
    if (!videoRef.current) return;

    const video = videoRef.current;
    const tracks = video.textTracks;

    const onCueChange = (event: Event) => {
      const track = event.target as TextTrack;
      // Skip if we are using hardcoded data for this language
      const activeTrack = subtitles.find(s => s.srcLang === track.language);
      if (activeTrack?.data) return;

      if (track.mode === 'hidden' || track.mode === 'showing') {
        const activeCue = track.activeCues?.[0] as VTTCue;
        setCurrentSubtitleText(activeCue ? activeCue.text : "");
      }
    };

    // Set initial mode and listeners
    for (let i = 0; i < tracks.length; i++) {
      const track = tracks[i];
      if (track.language === activeSubtitle) {
        track.mode = 'hidden'; // We use 'hidden' to get events but not native rendering
        track.addEventListener('cuechange', onCueChange);
        
        // Check if there's already an active cue (e.g. when switching languages while playing)
        const activeCue = track.activeCues?.[0] as VTTCue;
        if (activeCue) setCurrentSubtitleText(activeCue.text);
      } else {
        track.mode = 'disabled';
      }
    }

    return () => {
      for (let i = 0; i < tracks.length; i++) {
        tracks[i].removeEventListener('cuechange', onCueChange);
      }
    };
  }, [activeSubtitle, subtitles]);

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
      setCurrentTime(videoRef.current.currentTime);
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

      {/* VOICES GLASS UI SUBTITLES (The Mark Standard) */}
      {currentSubtitleText && (
        <div className="absolute bottom-24 left-0 right-0 flex justify-center px-8 pointer-events-none z-20">
          <div 
            className={cn(
              "bg-va-black/80 backdrop-blur-md border border-white/10 px-6 py-3 rounded-[15px] shadow-aura-lg max-w-[90%] animate-in fade-in slide-in-from-bottom-2 duration-300",
              activeSubtitle === 'ar' ? "text-right" : "text-center"
            )}
            dir={activeSubtitle === 'ar' ? 'rtl' : 'ltr'}
          >
            <p className="text-white text-[15px] md:text-lg font-light leading-snug tracking-wide">
              {currentSubtitleText.split('\n').map((line, i) => (
                <React.Fragment key={i}>
                  {line}
                  {i < currentSubtitleText.split('\n').length - 1 && <br />}
                </React.Fragment>
              ))}
            </p>
          </div>
        </div>
      )}

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
          className="w-full h-1 bg-white/20 rounded-full appearance-none cursor-pointer accent-[#FFC421]"
        />

        <div className="flex items-center justify-between text-white">
          <div className="flex items-center gap-4">
            <button onClick={togglePlay} className="hover:text-[#FFC421] transition-colors">
              {isPlaying ? <Pause size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" />}
            </button>
            <button onClick={toggleMute} className="hover:text-[#FFC421] transition-colors">
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
                      activeSubtitle === track.srcLang ? "bg-[#FFC421] border-[#FFC421] text-va-black" : "bg-white/10 text-white/60 hover:bg-white/20"
                    )}
                  >
                    {track.srcLang.toUpperCase()}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center gap-4">
            <button onClick={toggleFullscreen} className="hover:text-[#FFC421] transition-colors">
              <Maximize size={20} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
