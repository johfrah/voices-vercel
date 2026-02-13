"use client";

import React, { useState, useRef } from 'react';
import { useEditMode } from '@/contexts/EditModeContext';
import { useSonicDNA } from '@/lib/sonic-dna';
import { cn } from '@/lib/utils';
import { Image as ImageIcon, Upload, Loader2, X } from 'lucide-react';
import Image, { ImageProps } from 'next/image';

interface VoiceglotImageProps extends Omit<ImageProps, 'src'> {
  src: string;
  mediaId?: number;
  journey?: string;
  category?: string;
  onUpdate?: (newSrc: string, mediaId?: number) => void;
}

/**
 * 🖼️ VOICEGLOT IMAGE EDITOR
 * Maakt afbeeldingen vervangbaar in Beheer-modus.
 */
export const VoiceglotImage: React.FC<VoiceglotImageProps> = ({ 
  src, 
  mediaId,
  journey = 'common',
  category = 'misc',
  onUpdate,
  className,
  alt,
  ...props 
}) => {
  const { isEditMode } = useEditMode();
  const { playClick, playSwell } = useSonicDNA();
  const [isUploading, setIsUploading] = useState(false);
  const [currentSrc, setCurrentSrc] = useState(src);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    playClick('pro');

    const formData = new FormData();
    formData.append('file', file);
    formData.append('journey', journey);
    formData.append('category', category);

    try {
      const response = await fetch('/api/backoffice/media', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        const newSrc = `/${data.media.filePath}`;
        setCurrentSrc(newSrc);
        playClick('success');
        if (onUpdate) {
          onUpdate(newSrc, data.media.id);
        }
      } else {
        console.error('Upload failed');
      }
    } catch (error) {
      console.error('Error uploading image:', error);
    } finally {
      setIsUploading(false);
    }
  };

  const triggerUpload = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className={cn("relative group/image-edit", isEditMode && "cursor-pointer")}>
      <Image strokeWidth={1.5} 
        src={currentSrc} 
        alt={alt}
        className={cn(
          className,
          isEditMode && "ring-2 ring-primary/0 hover:ring-primary/50 transition-all duration-300"
        )}
        {...props}
      / />

      {isEditMode && (
        <>
          <div 
            onClick={triggerUpload}
            onMouseEnter={() => playSwell()}
            className="absolute inset-0 bg-primary/20 opacity-0 group-hover/image-edit:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px] rounded-[inherit]"
          >
            <div className="bg-va-black text-white px-4 py-2 rounded-full flex items-center gap-2 shadow-xl scale-90 group-hover/image-edit:scale-100 transition-transform">
              {isUploading ? (
                <Loader2 size={14} className="animate-spin text-primary" />
              ) : (
                <Upload size={14} className="text-primary" />
              )}
              <span className="text-[15px] font-black tracking-widest">
                {isUploading ? 'Uploaden...' : 'Vervang afbeelding'}
              </span>
            </div>
          </div>

          <input 
            type="file" 
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*"
            className="hidden"
          />

          <div className="absolute -top-6 right-0 opacity-0 group-hover/image-edit:opacity-100 transition-opacity flex items-center gap-1 bg-va-black text-white px-2 py-0.5 rounded text-[15px] font-black tracking-widest pointer-events-none z-50 shadow-lg">
            <ImageIcon size={8} className="text-primary" />
            Media: {category}
          </div>
        </>
      )}
    </div>
  );
};
