"use client";

import { useEditMode } from '@/contexts/EditModeContext';
import { useSonicDNA } from '@/lib/engines/sonic-dna';
import { cn } from '@/lib/utils';
import { Image as ImageIcon, Loader2, Upload } from 'lucide-react';
import Image, { ImageProps } from 'next/image';
import React, { useEffect, useRef, useState } from 'react';

interface VoiceglotImageProps extends Omit<ImageProps, 'src'> {
  src: string;
  mediaId?: number;
  journey?: string;
  category?: string;
  onUpdate?: (newSrc: string, mediaId?: number) => void;
}

/**
 *  VOICEGLOT IMAGE EDITOR
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
  const [error, setError] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setCurrentSrc(src);
    setError(false);
  }, [src]);

  const handleError = () => {
    if (error) return; // Prevent infinite loop
    setError(true);
    
    //  CHRIS-PROTOCOL: Fallback logic for actor photos
    // If a path contains 'visuals/active/voicecards' or 'visuals/active/photos' or 'agency/voices' or 'active/voicecards', it might be a missing photo
    if (currentSrc.includes('visuals/active/voicecards') || 
        currentSrc.includes('visuals/active/photos') || 
        currentSrc.includes('agency/voices') ||
        currentSrc.includes('active/voicecards') ||
        currentSrc.includes('/api/proxy')) {
      
      // If we are in the new structure but it failed, try the ID-based fallback if we can extract it
      const idMatch = currentSrc.match(/(\d+)-/);
      if (idMatch && !currentSrc.includes('placeholder')) {
        const actorId = idMatch[1];
        // Try a simpler path or different extension as a last resort before placeholder
        if (currentSrc.endsWith('.jpg')) {
          setCurrentSrc(currentSrc.replace('.jpg', '.webp'));
          return;
        }
      }

      // Final fallback to a generic placeholder for actors
      setCurrentSrc('/assets/common/placeholders/placeholder-voice.jpg');
    } else {
      //  CHRIS-PROTOCOL: No Voicy fallback for branding/system assets
      // We prefer a broken image icon over a confusing avatar
      console.warn(`[VoiceglotImage] Asset failed to load: ${currentSrc}`);
    }
  };

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
      const response = await fetch('/api/admin/actors/upload', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        const newSrc = data.url;
        const newMediaId = data.mediaId;
        setCurrentSrc(newSrc);
        playClick('success');
        if (onUpdate) {
          onUpdate(newSrc, newMediaId);
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

  const isFill = !!props.fill;
  const fillValue = props.fill === true ? true : undefined;
  const isProxied = currentSrc?.includes('/api/proxy');
  const isLocal = currentSrc?.startsWith('/') && !isProxied && !currentSrc?.startsWith('https://vcbxyyjsxuquytcsskpj.supabase.co');
  const isSupabase = currentSrc?.startsWith('https://vcbxyyjsxuquytcsskpj.supabase.co');
  const isGoogle = currentSrc?.includes('googleusercontent.com');
  const isDropbox = currentSrc?.includes('dropbox.com');

  const isValidSrc = currentSrc && 
    currentSrc !== 'image/' && 
    currentSrc !== '/image/' && 
    currentSrc !== 'undefined' && 
    currentSrc !== '/undefined' && 
    currentSrc !== 'NULL' && 
    currentSrc !== '/NULL' &&
    currentSrc !== '' &&
    !currentSrc.endsWith('/image/') &&
    // 🛡️ CHRIS-PROTOCOL: Prevent Dropbox folder links from being used as images (v2.14.163)
    !(isDropbox && currentSrc.includes('/scl/fo/'));

  //  CHRIS-PROTOCOL: Automatic Proxy Wrapping (2026 Mandate)
  // We only use the proxy for external assets (Supabase, Google, Dropbox) or relative paths 
  // that need optimization. Local assets in /assets/ are served directly.
  const finalSrc = React.useMemo(() => {
    if (!isValidSrc) return currentSrc;
    
    // If it's already a proxy URL, don't wrap it again
    if (isProxied) return currentSrc;

    //  FIX: Supabase, Google and Dropbox URLs through proxy to avoid 400 Bad Request from Next.js Image optimizer
    if (isSupabase || isGoogle || isDropbox) {
      return `/api/proxy/?path=${encodeURIComponent(currentSrc)}`;
    }

    //  CHRIS-PROTOCOL: Local assets in /assets/ do NOT need the proxy.
    // They are served directly from the public folder.
    if (currentSrc.startsWith('/assets/')) {
      return currentSrc;
    }

    // If it's a relative path that doesn't start with /assets/, it might be a direct Supabase path (e.g. "active/voicecards/...")
    // But we must be careful not to wrap paths that are already intended to be local.
    if (!currentSrc.startsWith('http') && !currentSrc.startsWith('/')) {
      return `/api/proxy/?path=${encodeURIComponent(currentSrc)}`;
    }

    return currentSrc;
  }, [currentSrc, isProxied, isSupabase, isGoogle, isDropbox, isValidSrc]);

  // Remove fill from props to avoid passing it to the DOM if it's not needed
  const { fill, ...otherProps } = props;

  return (
    <div className={cn(
      "relative group/image-edit", 
      isEditMode && "cursor-pointer",
      isFill && "w-full h-full"
    )}>
      {isValidSrc ? (
        <Image  
          src={finalSrc} 
          alt={alt}
          onError={handleError}
          width={!isFill ? (props.width || 500) : undefined}
          height={!isFill ? (props.height || 500) : undefined}
          fill={fillValue}
          unoptimized={isProxied || isLocal}
          priority={isSupabase || props.priority}
          sizes={isFill ? "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" : undefined}
          style={isFill ? { objectFit: 'cover' } : undefined}
          className={cn(
            className,
            isEditMode && "ring-2 ring-primary/0 hover:ring-primary/50 transition-all duration-300"
          )}
          {...otherProps}
        />
      ) : (
        <div className={cn("bg-va-off-white flex items-center justify-center", className)} {...(props as any)}>
          <ImageIcon className="text-va-black/10" />
        </div>
      )}

      {isEditMode && (
        <>
          <div 
            onClick={triggerUpload}
            onMouseEnter={() => playSwell()}
            className="absolute inset-0 bg-primary/20 opacity-0 group-hover/image-edit:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px] rounded-[inherit]"
          >
            <div className="bg-va-black text-white px-4 py-2 rounded-full flex items-center gap-2 shadow-xl scale-90 group-hover/image-edit:scale-100 transition-transform">
              {isUploading ? (
                <Loader2 strokeWidth={1.5} size={14} className="animate-spin text-primary" />
              ) : (
                <Upload strokeWidth={1.5} size={14} className="text-primary" />
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
            <ImageIcon    size={8} className="text-primary" />
            Media: {category}
          </div>
        </>
      )}
    </div>
  );
};
