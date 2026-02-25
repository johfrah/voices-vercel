"use client";

import { useEditMode } from '@/contexts/EditModeContext';
import { VoicesMasterControlContext } from '@/contexts/VoicesMasterControlContext';
import { useSonicDNA } from '@/lib/engines/sonic-dna';
import { MarketManagerServer } from '@/lib/system/market-manager-server';
import { cn } from '@/lib/utils';
import { Image as ImageIcon, Loader2, Upload } from 'lucide-react';
import Image, { ImageProps } from 'next/image';
import React, { useEffect, useRef, useState, useContext } from 'react';

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
  const masterControl = useContext(VoicesMasterControlContext);
  const isMuted = masterControl?.state?.isMuted ?? false;
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
  const isSupabase = currentSrc?.startsWith('https://vcbxyyjsxuquytcsskpj.supabase.co') || currentSrc?.includes('supabase.co');
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

    let cleanSrc = currentSrc;

    // 🛡️ CHRIS-PROTOCOL: Forensic domain stripping (v2.14.644)
    // If the URL is from one of our own domains, strip it to make it a relative path.
    // This ensures it hits the local asset logic and bypasses Next.js remote pattern restrictions.
    if (cleanSrc.startsWith('http')) {
      try {
        const url = new URL(cleanSrc);
        const marketDomains = Object.values(MarketManagerServer.getMarketDomains());
        const isOwnDomain = marketDomains.some(d => url.hostname.includes(d.replace('https://', '').replace('www.', ''))) || 
                           url.hostname === 'localhost' || 
                           url.hostname === '127.0.0.1' || 
                           url.hostname.includes('vercel.app');
        
        if (isOwnDomain) {
          cleanSrc = url.pathname + url.search;
        }
      } catch (e) {
        // Not a valid URL, ignore
      }
    }

    //  FIX: Supabase, Google and Dropbox URLs through proxy to avoid 400 Bad Request from Next.js Image optimizer
    if (isSupabase || isGoogle || isDropbox) {
      return `/api/proxy/?path=${encodeURIComponent(cleanSrc)}`;
    }

    //  CHRIS-PROTOCOL: Local assets in /assets/ do NOT need the proxy.
    // They are served directly from the public folder.
    if (cleanSrc.startsWith('/assets/')) {
      return cleanSrc;
    }

    // If it's a relative path that doesn't start with /assets/, it might be a direct Supabase path (e.g. "active/voicecards/...")
    // But we must be careful not to wrap paths that are already intended to be local.
    if (!cleanSrc.startsWith('http') && !cleanSrc.startsWith('/')) {
      return `/api/proxy/?path=${encodeURIComponent(cleanSrc)}`;
    }

    return cleanSrc;
  }, [currentSrc, isProxied, isSupabase, isGoogle, isDropbox, isValidSrc]);

  // Remove fill from props to avoid passing it to the DOM if it's not needed
  const { fill, ...otherProps } = props;

  // 🛡️ CHRIS-PROTOCOL: Animated SVG Inlining (v2.14.653)
  // Standard <img> tags (and next/image) often fail to play internal SVG animations.
  // We explicitly inline the animated logo to ensure the waveform and dot bounce work.
  const isAnimatedLogo = finalSrc?.includes('Voices-LOGO-Animated.svg');

  if (isAnimatedLogo && !isEditMode) {
    return (
      <div 
        className={cn("relative", isFill && "w-full h-full", className)}
        style={{ width: props.width, height: props.height }}
      >
        <div 
          className="w-full h-full flex items-center justify-center"
          dangerouslySetInnerHTML={{ 
            __html: `
              <svg viewBox="0 0 3000 1179.28" class="w-full h-full" style="display: block;">
                <style>
                  .st0{fill:#FF2F8D;}
                  .st1{fill:url(#SVGID_1_);}
                  .st2{fill:url(#SVGID_2_);}
                  .st3{fill:url(#SVGID_3_);}
                  .st4{fill:url(#SVGID_4_);}
                  .st5{fill:url(#SVGID_5_);}
                  .st6{fill:url(#SVGID_6_);}
                  .st7{fill:url(#SVGID_7_);}
                  .st8{fill:url(#SVGID_8_);}
                  .st9{fill:url(#SVGID_9_);}
                  .bar{ transform-box: fill-box; transform-origin: 50% 50%; animation-name: wave; animation-timing-function: cubic-bezier(.4,0,.2,1); animation-iteration-count: infinite; animation-play-state: paused; }
                  svg:hover .bar, svg:hover .dot { animation-play-state: running !important; }
                  .b1,.b5{ animation-duration: 2.80s; } .b2,.b4{ animation-duration: 2.40s; } .b3{ animation-duration: 2.10s; }
                  .b1{ animation-delay: -0.10s; } .b2{ animation-delay: -0.35s; } .b3{ animation-delay: -0.20s; } .b4{ animation-delay: -0.45s; } .b5{ animation-delay: -0.25s; }
                  @keyframes wave{ 0% { transform: scaleY(0.92); } 25% { transform: scaleY(1.05); } 50% { transform: scaleY(0.96); } 75% { transform: scaleY(1.08); } 100% { transform: scaleY(0.92); } }
                  .dot{ transform-box: fill-box; transform-origin: 50% 50%; animation: dotBounce 2.80s ease-in-out infinite; animation-delay: -0.20s; animation-play-state: paused; }
                  @keyframes dotBounce{ 0%, 78%, 100% { transform: translateY(0px); } 82% { transform: translateY(-10px); } 88% { transform: translateY(0px); } }
                </style>
                <linearGradient id="SVGID_1_" gradientUnits="userSpaceOnUse" x1="936.3499" y1="624.0659" x2="3189.7175" y2="616.466"><stop offset="0" style="stop-color:#FF309E"/><stop offset="1" style="stop-color:#D63CFF"/></linearGradient>
                <linearGradient id="SVGID_2_" gradientUnits="userSpaceOnUse" x1="936.3526" y1="624.8897" x2="3189.7202" y2="617.2898"><stop offset="0" style="stop-color:#FF309E"/><stop offset="1" style="stop-color:#D63CFF"/></linearGradient>
                <linearGradient id="SVGID_3_" gradientUnits="userSpaceOnUse" x1="936.3605" y1="627.2191" x2="3189.728" y2="619.6192"><stop offset="0" style="stop-color:#FF309E"/><stop offset="1" style="stop-color:#D63CFF"/></linearGradient>
                <linearGradient id="SVGID_4_" gradientUnits="userSpaceOnUse" x1="936.5673" y1="688.5532" x2="3189.9351" y2="680.9533"><stop offset="0" style="stop-color:#FF309E"/><stop offset="1" style="stop-color:#D63CFF"/></linearGradient>
                <linearGradient id="SVGID_5_" gradientUnits="userSpaceOnUse" x1="936.3967" y1="637.9409" x2="3189.7644" y2="630.341"><stop offset="0" style="stop-color:#FF309E"/><stop offset="1" style="stop-color:#D63CFF"/></linearGradient>
                <linearGradient id="SVGID_6_" gradientUnits="userSpaceOnUse" x1="936.3569" y1="626.142" x2="3189.7246" y2="618.5421"><stop offset="0" style="stop-color:#FF309E"/><stop offset="1" style="stop-color:#D63CFF"/></linearGradient>
                <linearGradient id="SVGID_7_" gradientUnits="userSpaceOnUse" x1="936.8349" y1="767.8751" x2="3190.2026" y2="760.2751"><stop offset="0" style="stop-color:#FF309E"/><stop offset="1" style="stop-color:#D63CFF"/></linearGradient>
                <linearGradient id="SVGID_8_" gradientUnits="userSpaceOnUse" x1="936.3627" y1="627.8738" x2="3189.7302" y2="620.2739"><stop offset="0" style="stop-color:#FF309E"/><stop offset="1" style="stop-color:#D63CFF"/></linearGradient>
                <linearGradient id="SVGID_9_" gradientUnits="userSpaceOnUse" x1="936.3665" y1="628.985" x2="3189.7341" y2="621.3852"><stop offset="0" style="stop-color:#FF309E"/><stop offset="1" style="stop-color:#D63CFF"/></linearGradient>
                <g>
                  <rect class="st0 bar b1" x="402.21" y="117.60" width="79.85" height="959.57" rx="39.92" ry="39.92"/>
                  <rect class="st0 bar b2" x="207.63" y="358.58" width="89.02" height="478.73" rx="44.51" ry="44.51"/>
                  <rect class="st0 bar b3" x="585.09" y="358.58" width="89.02" height="478.73" rx="44.51" ry="44.51"/>
                  <rect class="st0 bar b4" x="760.47" y="484.62" width="82.79" height="258.44" rx="41.40" ry="41.40"/>
                  <rect class="st0 bar b5" x="40.17" y="484.62" width="82.79" height="258.44" rx="41.39" ry="41.39"/>
                  <path class="st1" d="M1021.15,518.01c-1.94-4.5-2.91-9.43-2.91-14.79c0-4.5,0.77-8.95,2.33-13.35c1.55-4.39,3.79-8.25,6.7-11.58c2.91-3.32,6.36-6,10.34-8.04c3.98-2.03,8.3-3.06,12.96-3.06c6.21,0,11.99,1.93,17.33,5.79c5.34,3.86,9.37,9.01,12.09,15.44l61.8,171.72l60.06-171.4c2.52-6.64,6.56-11.9,12.09-15.76c5.54-3.86,11.41-5.79,17.63-5.79c4.66,0,8.98,1.02,12.96,3.06c3.98,2.04,7.38,4.72,10.2,8.04c2.81,3.33,5,7.13,6.56,11.42c1.55,4.29,2.33,8.68,2.33,13.19c0,4.72-0.97,9.76-2.91,15.12l-89.05,240.62c-3.89,7.94-8.35,13.46-13.4,16.56c-5.05,3.11-10.68,4.66-16.9,4.66c-7.38,0-13.6-2.2-18.65-6.59c-5.05-4.39-8.64-9.27-10.78-14.63L1021.15,518.01z"/>
                  <path class="st2" d="M1278.86,623.56c0-21.88,3.93-42.47,11.78-61.76c7.85-19.28,18.56-36.13,32.13-50.54c13.56-14.41,29.38-25.79,47.43-34.13c18.05-8.34,37.38-12.52,57.99-12.52c20.6,0,39.98,4.18,58.14,12.52c18.15,8.34,33.97,19.72,47.43,34.13c13.46,14.41,24.12,31.26,31.98,50.54c7.85,19.29,11.78,39.87,11.78,61.76c0,21.89-3.93,42.42-11.78,61.6c-7.86,19.18-18.51,35.92-31.98,50.22s-29.28,25.63-47.43,33.97c-18.16,8.34-37.54,12.51-58.14,12.51c-20.61,0-39.93-4.17-57.99-12.51c-18.05-8.34-33.87-19.67-47.43-33.97c-13.57-14.3-24.28-31.04-32.13-50.22C1282.79,665.97,1278.86,645.45,1278.86,623.56z M1346.8,623.56c0,11.92,2.14,23.08,6.44,33.48c4.29,10.4,10.12,19.5,17.48,27.3c7.36,7.8,15.94,13.98,25.75,18.53c9.81,4.55,20.34,6.83,31.58,6.83c11.45,0,22.12-2.28,32.03-6.83c9.91-4.55,18.55-10.73,25.91-18.53c7.36-7.8,13.13-16.9,17.32-27.3c4.19-10.4,6.29-21.56,6.29-33.48c0-11.91-2.15-23.08-6.44-33.48c-4.29-10.4-10.12-19.5-17.47-27.3c-7.36-7.8-15.99-13.92-25.91-18.36c-9.91-4.44-20.49-6.66-31.73-6.66c-11.04,0-21.52,2.22-31.43,6.66c-9.91,4.44-18.55,10.56-25.9,18.36c-7.36,7.8-13.18,16.9-17.48,27.3C1348.94,600.48,1346.8,611.64,1346.8,623.56z"/>
                  <path class="st6" d="M1642.59,781.64L1642.59,781.64c-16.56,0-29.99-13.43-29.99-29.99V495.87c0-16.56,13.43-29.99,29.99-29.99l0,0c16.56,0,29.99,13.43,29.99,29.99v255.79C1672.58,768.22,1659.15,781.64,1642.59,781.64z"/>
                  <path class="st8" d="M1852.64,780.95c-0.56,0-1.12,0-1.68-0.01c-50.72-0.57-96.95-28.09-123.66-73.61c-26.96-45.95-30.23-100.6-8.95-149.91c23.67-54.87,73.53-88.06,133.39-88.78c0.64-0.01,1.3-0.01,1.94-0.01c57.6,0,109.07,31.21,131.5,79.91c6.92,15.02,0.35,32.79-14.67,39.71c-15.02,6.91-32.79,0.35-39.71-14.67c-12.81-27.81-43.63-45.51-78.34-45.09c-17.06,0.21-58.93,5.75-79.15,52.64c-13.64,31.62-11.59,66.58,5.62,95.91c15.99,27.25,43.17,43.71,72.7,44.05c0.31,0,0.63,0.01,0.95,0.01c31.6,0,60.77-17.93,80.16-49.33c8.69-14.06,27.12-18.43,41.2-9.74c14.06,8.69,18.42,27.13,9.74,41.2C1953.12,752.69,1905.43,780.95,1852.64,780.95z"/>
                  <path class="st3" d="M2236.31,760.54c-5.88,4.1-12.65,7.7-20.3,10.8c-7.66,3.1-16.26,5.6-25.81,7.48c-9.55,1.88-20.3,2.82-32.26,2.82c-20.78,0-40.29-4.15-58.55-12.46c-18.26-8.31-34.21-19.66-47.85-34.07c-13.64-14.4-24.45-31.19-32.42-50.35c-7.98-19.16-11.96-39.72-11.96-61.66c0-21.94,3.98-42.54,11.96-61.82c7.97-19.28,18.78-36.06,32.42-50.35c13.64-14.29,29.59-25.59,47.85-33.9c18.26-8.31,37.77-12.46,58.55-12.46c20.56,0,39.92,4.1,58.07,12.3c18.15,8.2,34.1,19.34,47.85,33.4c13.74,14.07,24.6,30.63,32.58,49.69c7.97,19.06,12.17,39.44,12.59,61.16c0,10.2-3.1,18.45-9.29,24.76c-6.19,6.31-14.32,9.47-24.39,9.47l-205.68,0c27.75,58.4,72.85,87.43,147.34,45.05c15.27-8.68,29.75-3.36,37.69,6.78C2265.09,720.42,2266.69,739.75,2236.31,760.54z M2235.91,593.25c-2.4-9.94-6.21-18.92-11.44-26.92c-5.23-8-11.44-14.79-18.63-20.37c-7.19-5.58-15.2-9.82-24.02-12.73c-8.83-2.91-18.25-4.37-28.27-4.37c-10.02,0-19.45,1.58-28.27,4.73c-8.82,3.15-16.78,7.52-23.86,13.1c-7.08,5.58-13.13,12.31-18.14,20.19c-5.01,7.88-8.72,16.68-11.11,26.38H2235.91z"/>
                  <path class="st9" d="M2458.41,567.14c6.36,3.73,13.82,4.97,21.22,2.85c5.5-1.57,10.18-5.21,13.73-9.7c18.48-23.37,6.2-49.05-24.91-74.78c-92.32-76.35-215.56,85.76-92.77,159.12c9.72,5.81,20.7,9.2,31.97,10.3l0,0c36.69,0.83,44.35,39.96,23.31,58.27c-12.37,10.77-31.53,7.9-41.22-5.33c0,0-12.45-18.57-17.56-23.97c-8.23-8.71-26.08-11.57-36.42-0.47c-10.77,11.56-13.19,28.76-3.98,43.59c57.71,92.21,156.29,59.17,168.82-24.51c5.75-38.39-11.7-77.08-44.7-97.53c-9.43-5.84-19.53-9.42-30.49-10.09c-2.23-0.14-4.46-0.17-6.67-0.47c-37.97-5.09-46.54-43.02-16.92-60.2c8.24-4.78,18.34-5.44,26.61-0.71c6.14,3.51,10.65,8.95,13.99,15.79C2446.04,556.59,2451.39,563.02,2458.41,567.14z"/>
                  <circle class="st7 dot" cx="2551.21" cy="762.43" r="19.63"/>
                  <path class="st5" d="M2583.69,501.7c0-9.77,7.92-17.7,17.7-17.7l0,0h0c10.97,0,19.86,8.89,19.86,19.86v100.71c18.85-15.26,38.44-21.95,59.04-21.16c13.3,0.51,26.13,3.79,37.87,8.87c11.73,5.08,21.95,14.54,30.65,23.32c8.7,8.78,15.55,19.04,20.57,30.78c5.01,11.74,7.52,24.28,7.52,37.61c0,13.33-2.51,25.83-7.52,37.51c-5.01,11.68-11.88,21.87-20.59,30.58c-8.71,8.71-18.94,15.61-30.68,20.69c-11.74,5.08-24.28,7.62-37.61,7.62s-25.87-2.54-37.61-7.61c-11.74-5.07-22.01-11.96-30.78-20.66c-8.77-8.7-15.71-18.88-20.78-30.55c-5.08-11.67-7.62-24.16-7.62-37.47V501.7z M2620.44,683.24c0,8.11,1.55,15.74,4.66,22.9c3.11,7.16,7.32,13.4,12.64,18.72c5.32,5.32,11.6,9.53,18.82,12.64c7.22,3.11,14.96,4.66,23.2,4.66c8.24,0,15.97-1.55,23.19-4.66c7.22-3.1,13.5-7.32,18.82-12.64c5.32-5.32,9.51-11.56,12.55-18.72c3.04-7.16,4.56-14.79,4.56-22.9c0-8.23-1.52-15.93-4.56-23.09c-3.04-7.16-7.22-13.4-12.55-18.72c-5.32-5.32-11.6-9.5-18.82-12.54c-7.22-3.04-14.96-4.56-23.19-4.56c-8.24,0-15.97,1.52-23.2,4.56c-7.22,3.04-13.5,7.22-18.82,12.54c-5.32,5.32-9.54,11.56-12.64,18.72C2621.99,667.31,2620.44,675.01,2620.44,683.24z"/>
                  <path class="st4" d="M2926.87,769.02c-3.8,2.6-8.17,4.88-13.12,6.84c-4.95,1.97-10.51,3.54-16.68,4.73c-6.17,1.19-13.12,1.79-20.85,1.79c-13.43,0-26.04-2.63-37.83-7.89c-11.8-5.26-22.1-12.45-30.92-21.57c-8.82-9.12-15.8-19.74-20.95-31.88c-5.15-12.13-7.73-25.14-7.73-39.03c0-13.89,2.57-26.93,7.73-39.14c5.15-12.2,12.13-22.83,20.95-31.88c8.81-9.05,19.12-16.2,30.92-21.46c11.8-5.26,24.41-7.89,37.83-7.89c13.29,0,25.8,2.6,37.53,7.79c11.73,5.19,22.03,12.24,30.92,21.15c8.88,8.91,15.9,19.39,21.05,31.46c5.15,12.07,7.86,24.97,8.14,38.72c0,6.45-2,11.68-6,15.68c-4,4-9.25,6-15.76,6l-132.91,0c17.93,36.97,47.08,55.35,95.21,28.52c9.86-5.5,19.22-2.13,24.36,4.29C2945.46,743.62,2946.5,755.86,2926.87,769.02z M2926.6,663.11c-1.55-6.29-4.01-11.98-7.39-17.04c-3.38-5.07-7.39-9.36-12.04-12.9c-4.65-3.53-9.82-6.22-15.52-8.06c-5.7-1.84-11.79-2.76-18.27-2.76c-6.48,0-12.57,1-18.27,2.99c-5.7,2-10.84,4.76-15.42,8.29c-4.58,3.53-8.48,7.79-11.72,12.78c-3.24,4.99-5.63,10.56-7.18,16.7H2926.6z"/>
                </g>
              </svg>
            `
          }}
        />
      </div>
    );
  }

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
          unoptimized={isProxied || isLocal || finalSrc?.toLowerCase().endsWith('.svg')}
          priority={isSupabase || props.priority}
          sizes={props.sizes || (isFill ? "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" : undefined)}
          style={isFill ? { objectFit: 'cover' } : undefined}
          className={cn(
            className,
            isEditMode && "ring-2 ring-primary/0 hover:ring-primary/50 transition-all duration-300"
          )}
          {...otherProps}
        />
      ) : (
        <ContainerInstrument plain className={cn("bg-va-off-white flex items-center justify-center", className)} {...(props as any)}>
          <ImageIcon className="text-va-black/10" />
        </ContainerInstrument>
      )}

      {isEditMode && (
        <>
          <ContainerInstrument 
            plain
            onClick={triggerUpload}
            onMouseEnter={() => playSwell()}
            className="absolute inset-0 bg-primary/20 opacity-0 group-hover/image-edit:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px] rounded-[inherit]"
          >
            <ContainerInstrument plain className="bg-va-black text-white px-4 py-2 rounded-full flex items-center gap-2 shadow-xl scale-90 group-hover/image-edit:scale-100 transition-transform">
              {isUploading ? (
                <Loader2 strokeWidth={1.5} size={14} className="animate-spin text-primary" />
              ) : (
                <Upload strokeWidth={1.5} size={14} className="text-primary" />
              )}
              <TextInstrument as="span" className="text-[15px] font-black tracking-widest">
                {isUploading ? 'Uploaden...' : 'Vervang afbeelding'}
              </TextInstrument>
            </ContainerInstrument>
          </ContainerInstrument>

          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileChange}
            accept="image/*"
            className="hidden"
          />

          <ContainerInstrument plain className="absolute -top-6 right-0 opacity-0 group-hover/image-edit:opacity-100 transition-opacity flex items-center gap-1 bg-va-black text-white px-2 py-0.5 rounded text-[15px] font-black tracking-widest pointer-events-none z-50 shadow-lg">
            <ImageIcon    size={8} className="text-primary" />
            Media: {category}
          </ContainerInstrument>
        </>
      )}
    </div>
  );
};
