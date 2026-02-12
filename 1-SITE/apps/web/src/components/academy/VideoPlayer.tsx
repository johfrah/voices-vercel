"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, Volume2, Maximize, Settings, RotateCcw } from 'lucide-react';

interface VideoPlayerProps {
  url: string;
  poster?: string;
  title?: React.ReactNode;
  subtitles?: {
    src: string;
    lang: string;
    label: string;
  }[];
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({ url, poster, title, subtitles }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const videoRef = useRef<HTMLVideoElement | null>(null);

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

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setProgress((videoRef.current.currentTime / videoRef.current.duration) * 100);
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
    }
  };

  const formatTime = (time: number) => {
    const mins = Math.floor(time / 60);
    const secs = Math.floor(time % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="relative group aspect-video bg-va-black rounded-[32px] overflow-hidden shadow-2xl border border-white/5">
      <video
        ref={videoRef}
        src={url}
        poster={poster}
        className="w-full h-full object-cover"
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onClick={togglePlay}
        crossOrigin="anonymous"
      >
        {subtitles?.map((sub, i) => (
          <track 
            key={i}
            kind="subtitles"
            src={sub.src}
            srcLang={sub.lang}
            label={sub.label}
            default={i === 0}
          />
        ))}
      </video>

      {/* Overlay Controls */}
      <div className={`absolute inset-0 bg-gradient-to-t from-va-black/80 via-transparent to-transparent transition-opacity duration-500 ${isPlaying ? 'opacity-0 group-hover:opacity-100' : 'opacity-100'}`}>
        
        {/* Center Play Button */}
        {!isPlaying && (
          <button 
            onClick={togglePlay}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 rounded-full bg-primary text-white flex items-center justify-center shadow-2xl hover:scale-110 transition-all z-10"
          >
            <Play size={40} fill="currentColor" className="ml-2" />
          </button>
        )}

        {/* Bottom Bar */}
        <div className="absolute bottom-0 left-0 right-0 p-8 space-y-6">
          {/* Progress Bar */}
          <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden cursor-pointer group/progress relative">
            <div 
              className="absolute inset-0 bg-primary transition-all duration-100 ease-linear" 
              style={{ width: `${progress}%` }}
            />
            <div className="absolute inset-0 bg-white/20 opacity-0 group-hover/progress:opacity-100 transition-opacity" />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <button onClick={togglePlay} className="text-white hover:text-primary transition-colors">
                {isPlaying ? <Pause size={24} fill="currentColor" /> : <Play size={24} fill="currentColor" />}
              </button>
              <div className="text-white/60 text-[11px] font-black uppercase tracking-widest tabular-nums">
                <span className="text-white">{formatTime(videoRef.current?.currentTime || 0)}</span> / {formatTime(duration)}
              </div>
            </div>

            <div className="flex items-center gap-6 text-white/40">
              <button className="hover:text-white transition-colors"><RotateCcw size={20} /></button>
              <button className="hover:text-white transition-colors"><Settings size={20} /></button>
              <button className="hover:text-white transition-colors"><Maximize size={20} /></button>
            </div>
          </div>
        </div>
      </div>

      {/* Title Tag */}
      {title && (
        <div className="absolute top-8 left-8 px-4 py-2 bg-va-black/40 backdrop-blur-md rounded-full border border-white/10 text-white text-[10px] font-black uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
          {title}
        </div>
      )}
    </div>
  );
};
