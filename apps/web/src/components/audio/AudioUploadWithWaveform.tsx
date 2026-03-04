'use client';

import { ContainerInstrument, TextInstrument } from '@/components/ui/LayoutInstruments';
import { VoiceglotText } from '@/components/ui/VoiceglotText';
import { cn } from '@/lib/utils';
import { Loader2, Music, Upload } from 'lucide-react';
import React, { useState } from 'react';
import { DemoWaveformPlayer } from './DemoWaveformPlayer';

interface AudioUploadWithWaveformProps {
  uploadEndpoint: string;
  value: string;
  onUploadSuccess: (url: string, mediaId?: number) => void;
  accept?: string;
  disabled?: boolean;
  replaceLabel?: string;
}

/**
 * Modern audio upload: file picker when empty, waveform + playable preview when uploaded.
 * Uses DemoWaveformPlayer (WaveSurfer) for direct playback and scrub.
 */
export const AudioUploadWithWaveform: React.FC<AudioUploadWithWaveformProps> = ({
  uploadEndpoint,
  value,
  onUploadSuccess,
  accept = '.mp3,.wav,.ogg,.m4a,audio/mpeg,audio/wav,audio/ogg,audio/mp4',
  disabled = false,
  replaceLabel,
}) => {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(null);
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await fetch(uploadEndpoint, { method: 'POST', body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'Upload mislukt');
      onUploadSuccess(data.url, data.mediaId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload mislukt.');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const handleReplace = () => {
    setError(null);
    inputRef.current?.click();
  };

  if (value) {
    return (
      <div className="space-y-2">
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          onChange={handleFileChange}
          className="hidden"
          disabled={disabled || uploading}
        />
        <DemoWaveformPlayer
          url={value}
          onReplaceClick={disabled || uploading ? undefined : handleReplace}
          replaceLabel={replaceLabel}
        />
        {error && (
          <TextInstrument className="text-[13px] text-red-600">{error}</TextInstrument>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        onChange={handleFileChange}
        className="hidden"
        disabled={disabled || uploading}
      />
      <ContainerInstrument
        onClick={() => !disabled && !uploading && inputRef.current?.click()}
        className={cn(
          'rounded-2xl border-2 border-dashed border-black/10 bg-va-off-white/40 p-6 sm:p-8 flex flex-col items-center justify-center gap-3 min-h-[140px] cursor-pointer transition-colors touch-manipulation',
          !disabled && !uploading && 'hover:border-primary/30 hover:bg-primary/5'
        )}
      >
        {uploading ? (
          <>
            <Loader2 size={32} className="animate-spin text-primary" />
            <TextInstrument className="text-[15px] font-medium text-va-black/60">
              <VoiceglotText translationKey="form.demo.uploading" defaultText="Bezig met uploaden..." />
            </TextInstrument>
          </>
        ) : (
          <>
            <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
              <Music size={28} strokeWidth={1.5} />
            </div>
            <TextInstrument className="text-[15px] font-medium text-va-black/70 text-center">
              <VoiceglotText translationKey="form.demo.drop_or_click" defaultText="Klik of sleep een audiobestand (mp3, wav, ogg, m4a)" />
            </TextInstrument>
            <div className="flex items-center gap-2 text-va-black/50">
              <Upload size={14} />
              <TextInstrument className="text-[13px]">
                <VoiceglotText translationKey="form.demo.optional" defaultText="Demo (optioneel)" />
              </TextInstrument>
            </div>
          </>
        )}
      </ContainerInstrument>
      {error && (
        <TextInstrument className="text-[13px] text-red-600">{error}</TextInstrument>
      )}
    </div>
  );
};
