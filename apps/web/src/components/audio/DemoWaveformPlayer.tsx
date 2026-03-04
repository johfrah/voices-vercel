'use client';

import { ButtonInstrument, ContainerInstrument, TextInstrument } from '@/components/ui/LayoutInstruments';
import { Pause, Play, Upload } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';
import WaveSurfer from 'wavesurfer.js';

interface DemoWaveformPlayerProps {
  url: string;
  onReplaceClick?: () => void;
  replaceLabel?: string;
}

/**
 * Single-audio waveform player (WaveSurfer). Directly playable, scrubable.
 * Used in signup demo upload and anywhere we need a modern audio preview.
 */
export const DemoWaveformPlayer: React.FC<DemoWaveformPlayerProps> = ({
  url,
  onReplaceClick,
  replaceLabel = 'Vervangen',
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const wavesurferRef = useRef<WaveSurfer | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!containerRef.current || !url) return;

    const ws = WaveSurfer.create({
      container: containerRef.current,
      waveColor: 'rgba(0,0,0,0.12)',
      progressColor: 'var(--va-primary)',
      cursorColor: 'var(--va-primary)',
      cursorWidth: 2,
      barWidth: 2,
      barGap: 2,
      barRadius: 2,
      height: 56,
      normalize: true,
      url,
    });

    ws.on('play', () => setIsPlaying(true));
    ws.on('pause', () => setIsPlaying(false));
    ws.on('finish', () => setIsPlaying(false));
    ws.on('timeupdate', (t) => setCurrentTime(t));
    ws.on('ready', (dur) => {
      setDuration(dur);
      setReady(true);
    });

    wavesurferRef.current = ws;
    return () => {
      ws.destroy();
      wavesurferRef.current = null;
      setReady(false);
    };
  }, [url]);

  const togglePlay = () => wavesurferRef.current?.playPause();

  const formatTime = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <ContainerInstrument className="rounded-2xl border border-black/[0.06] bg-va-off-white/50 p-4 space-y-3">
      <div ref={containerRef} className="min-h-[56px] w-full" />
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <ButtonInstrument
            type="button"
            onClick={togglePlay}
            disabled={!ready}
            className="h-12 w-12 rounded-full bg-primary text-white hover:bg-primary/90 flex items-center justify-center shadow-md disabled:opacity-50"
          >
            {isPlaying ? <Pause size={22} strokeWidth={2} /> : <Play size={22} strokeWidth={2} className="ml-0.5" />}
          </ButtonInstrument>
          <TextInstrument className="text-[13px] font-medium text-va-black/60 tabular-nums">
            {formatTime(currentTime)} / {formatTime(duration)}
          </TextInstrument>
        </div>
        {onReplaceClick && (
          <ButtonInstrument
            type="button"
            variant="ghost"
            onClick={onReplaceClick}
            className="min-h-[44px] min-w-[44px] px-3 py-2 text-[13px] font-medium text-va-black/50 hover:text-primary flex items-center gap-1.5 touch-manipulation"
          >
            <Upload size={14} />
            {replaceLabel}
          </ButtonInstrument>
        )}
      </div>
    </ContainerInstrument>
  );
};
