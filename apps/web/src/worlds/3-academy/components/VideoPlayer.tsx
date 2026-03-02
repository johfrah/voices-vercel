"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, Volume2, Maximize, Settings, RotateCcw } from 'lucide-react';

import { ContainerInstrument, ButtonInstrument, TextInstrument } from '@/components/ui/LayoutInstruments';

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
    <ContainerInstrument className="relative group aspect-video bg-va-black rounded-[32px] overflow-hidden shadow-2xl border border-white/5">
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
      <ContainerInstrument className={`absolute inset-0 bg-gradient-to-t from-va-black/80 via-transparent to-transparent transition-opacity duration-500 ${isPlaying ? 'opacity-0 group-hover:opacity-100' : 'opacity-100'}`}>
        
        {/* Center Play Button */}
        {!isPlaying && (
          <ButtonInstrument 
            onClick={togglePlay}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 rounded-full bg-primary text-white flex items-center justify-center shadow-2xl hover:scale-110 transition-all z-10"
          >
            <Play strokeWidth={1.5} size={40} fill="currentColor" className="ml-2" />
          </ButtonInstrument>
        )}

        {/* Bottom Bar */}
        <ContainerInstrument className="absolute bottom-0 left-0 right-0 p-8 space-y-6">
          {/* Progress Bar */}
          <ContainerInstrument className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden cursor-pointer group/progress relative">
            <ContainerInstrument 
              className="absolute inset-0 bg-primary transition-all duration-100 ease-linear" 
              style={{ width: `${progress}%` }}
            />
            <ContainerInstrument className="absolute inset-0 bg-white/20 opacity-0 group-hover/progress:opacity-100 transition-opacity" />
          </ContainerInstrument>

          <ContainerInstrument className="flex items-center justify-between">
            <ContainerInstrument className="flex items-center gap-6">
              <ButtonInstrument onClick={togglePlay} className="text-white hover:text-primary transition-colors">
                {isPlaying ? <Pause strokeWidth={1.5} size={24} fill="currentColor" /> : <Play strokeWidth={1.5} size={24} fill="currentColor" />}
              </ButtonInstrument>
              <TextInstrument className="text-white/60 text-[15px] font-black tracking-widest tabular-nums">
                <TextInstrument as="span" className="text-white">{formatTime(videoRef.current?.currentTime || 0)}</TextInstrument> / {formatTime(duration)}
              </TextInstrument>
            </ContainerInstrument>

            <ContainerInstrument className="flex items-center gap-6 text-white/40">
              <ButtonInstrument className="hover:text-white transition-colors"><RotateCcw strokeWidth={1.5} size={20} /></ButtonInstrument>
              <ButtonInstrument className="hover:text-white transition-colors"><Settings strokeWidth={1.5} size={20} /></ButtonInstrument>
              <ButtonInstrument className="hover:text-white transition-colors"><Maximize strokeWidth={1.5} size={20} /></ButtonInstrument>
            </ContainerInstrument>
          </ContainerInstrument>
        </ContainerInstrument>
      </ContainerInstrument>

      {/* Title Tag */}
      {title && (
        <ContainerInstrument className="absolute top-8 left-8 px-4 py-2 bg-va-black/40 backdrop-blur-md rounded-full border border-white/10 text-white text-[15px] font-black tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
          {title}
        </ContainerInstrument>
      )}
    </ContainerInstrument>
  );
};
