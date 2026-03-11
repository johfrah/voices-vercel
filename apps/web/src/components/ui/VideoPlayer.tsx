"use client";

import { cn } from '@/lib/utils';
import { Maximize, Pause, Play, Volume2, VolumeX } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';

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

function toVttTimestamp(seconds: number): string {
  const clamped = Math.max(0, Number.isFinite(seconds) ? seconds : 0);
  const hours = Math.floor(clamped / 3600);
  const minutes = Math.floor((clamped % 3600) / 60);
  const wholeSeconds = Math.floor(clamped % 60);
  const milliseconds = Math.floor((clamped % 1) * 1000);
  const hh = String(hours).padStart(2, '0');
  const mm = String(minutes).padStart(2, '0');
  const ss = String(wholeSeconds).padStart(2, '0');
  const mmm = String(milliseconds).padStart(3, '0');
  return `${hh}:${mm}:${ss}.${mmm}`;
}

function subtitleDataToVtt(data: SubtitleData[]): string {
  const header = 'WEBVTT\n\n';
  const cues = data
    .filter((cue) => Number.isFinite(cue.start) && Number.isFinite(cue.end) && cue.end > cue.start)
    .map((cue, index) => {
      const from = toVttTimestamp(cue.start);
      const to = toVttTimestamp(cue.end);
      const text = (cue.text || '').trim() || '...';
      return `${index + 1}\n${from} --> ${to}\n${text}`;
    })
    .join('\n\n');
  return `${header}${cues}\n`;
}

interface VideoPlayerProps {
  src?: string;
  mediaId?: number | null;
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
  mediaId,
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
  const [isFrameReady, setIsFrameReady] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [showControls, setShowControls] = useState(false);
  const [activeSubtitle, setActiveSubtitle] = useState<string | null>(subtitles.length > 0 ? subtitles[0].srcLang : null);
  const [currentSubtitleText, setCurrentSubtitleText] = useState<string>("");
  const [resolvedSubtitles, setResolvedSubtitles] = useState<SubtitleTrack[]>(subtitles);
  const [resolvedSrc, setResolvedSrc] = useState<string>(src || '');

  // 🛡️ CHRIS-PROTOCOL: ID-First Handshake (v3.0.0)
  useEffect(() => {
    const resolveUrl = async () => {
      if (mediaId) {
        const { AssetManager } = await import('@/lib/system/core/asset-manager');
        const resolved = await AssetManager.resolveMediaUrl({ mediaId });
        if (resolved) {
          setResolvedSrc(resolved);
          return;
        }
      }
      if (src) {
        setResolvedSrc(src);
      }
    };
    resolveUrl();
    setIsFrameReady(false);
  }, [src, mediaId, poster]);

  useEffect(() => {
    const generatedObjectUrls: string[] = [];
    const nextTracks = subtitles.map((track) => {
      if (track.src || !Array.isArray(track.data) || track.data.length === 0) return track;
      const vtt = subtitleDataToVtt(track.data);
      const objectUrl = URL.createObjectURL(new Blob([vtt], { type: 'text/vtt' }));
      generatedObjectUrls.push(objectUrl);
      return { ...track, src: objectUrl };
    });
    setResolvedSubtitles(nextTracks);
    return () => {
      generatedObjectUrls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [subtitles]);

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
  }, [activeSubtitle, subtitles, resolvedSubtitles]);

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
        "relative rounded-[20px] overflow-hidden bg-va-off-white shadow-aura group",
        aspectClasses[aspectRatio],
        className
      )}
      onMouseEnter={() => setShowControls(true)}
      onMouseLeave={() => setShowControls(false)}
    >
      <video
        ref={videoRef}
        src={resolvedSrc}
        className={cn(
          "w-full h-full object-cover transition-opacity duration-300",
          isFrameReady ? "opacity-100" : "opacity-0"
        )}
        autoPlay={autoPlay}
        loop={loop}
        muted={muted}
        preload="metadata"
        onTimeUpdate={handleProgress}
        onLoadedMetadata={() => setIsFrameReady(true)}
        onLoadedData={() => setIsFrameReady(true)}
        onCanPlay={() => setIsFrameReady(true)}
        onClick={togglePlay}
        playsInline
      >
        {resolvedSubtitles.map((track) => (
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

      {!isFrameReady && (
        <div className="absolute inset-0 flex items-center justify-center bg-va-off-white">
          <div className="w-12 h-12 rounded-full border-2 border-primary/20 border-t-primary animate-spin" />
        </div>
      )}

      {/* Overlay Play Button (Visible when paused) */}
      {!isPlaying && isFrameReady && (
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
            {resolvedSubtitles.length > 0 && (
              <div className="flex items-center gap-2 ml-2">
                {resolvedSubtitles.map((track) => (
                  <button
                    key={track.srcLang}
                    onClick={() => setActiveSubtitle(activeSubtitle === track.srcLang ? null : track.srcLang)}
                    aria-pressed={activeSubtitle === track.srcLang}
                    aria-label={activeSubtitle === track.srcLang ? `Ondertitels ${track.srcLang} uitschakelen` : `Ondertitels ${track.srcLang} inschakelen`}
                    title={activeSubtitle === track.srcLang ? `Ondertitels ${track.srcLang} uitschakelen` : `Ondertitels ${track.srcLang} inschakelen`}
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
