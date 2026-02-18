"use client";

import { useTranslation } from '@/contexts/TranslationContext';
import React, { useState, useCallback, useRef } from 'react';
import Cropper from 'react-easy-crop';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, X, Check, Camera, Loader2, Image as ImageIcon } from 'lucide-react';
import { ButtonInstrument, ContainerInstrument, TextInstrument, HeadingInstrument } from './LayoutInstruments';
import { VoiceglotImage } from './VoiceglotImage';
import { VoiceglotText } from './VoiceglotText';
import { cn } from '@/lib/utils';

interface PhotoUploaderProps {
  currentPhotoUrl?: string;
  onUploadSuccess: (newUrl: string, mediaId: number) => void;
  actorName: string;
}

export const PhotoUploader: React.FC<PhotoUploaderProps> = ({ 
  currentPhotoUrl, 
  onUploadSuccess,
  actorName 
}) => {
  const { t } = useTranslation();
  const [image, setImage] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const onCropComplete = useCallback((_croppedArea: any, croppedAreaPixels: any) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const reader = new FileReader();
      reader.addEventListener('load', () => setImage(reader.result as string));
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  const createImage = (url: string): Promise<HTMLImageElement> =>
    new Promise((resolve, reject) => {
      const image = new Image();
      image.addEventListener('load', () => resolve(image));
      image.addEventListener('error', (error) => reject(error));
      image.setAttribute('crossOrigin', 'anonymous');
      image.src = url;
    });

  const getCroppedImg = async (imageSrc: string, pixelCrop: any): Promise<Blob> => {
    const image = await createImage(imageSrc);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (!ctx) throw new Error('No 2d context');

    canvas.width = 800;
    canvas.height = 800;

    ctx.drawImage(
      image,
      pixelCrop.x,
      pixelCrop.y,
      pixelCrop.width,
      pixelCrop.height,
      0,
      0,
      800,
      800
    );

    return new Promise((resolve) => {
      canvas.toBlob((blob) => {
        if (!blob) throw new Error('Canvas is empty');
        resolve(blob);
      }, 'image/png'); //  CHRIS-PROTOCOL: Use PNG for maximum quality and transparency support
    });
  };

  const handleUpload = async () => {
    if (!image || !croppedAreaPixels) return;

    setIsUploading(true);
    try {
      const croppedImageBlob = await getCroppedImg(image, croppedAreaPixels);
      const formData = new FormData();
      formData.append('file', croppedImageBlob, `${actorName.toLowerCase().replace(/\s+/g, '-')}.png`);

      const response = await fetch('/api/admin/actors/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('Upload failed');

      const data = await response.json();
      onUploadSuccess(data.url, data.mediaId);
      setImage(null);
    } catch (error) {
      console.error('Upload error:', error);
      alert(t('admin.photo.upload_error', 'Fout bij het uploaden van de foto.'));
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-4">
      <label className="text-[11px] font-bold text-va-black/40 uppercase tracking-[0.2em] px-1 flex items-center gap-2">
        <Camera size={14} className="text-primary" />
        <VoiceglotText translationKey="admin.photo.label" defaultText="Profielfoto" />
      </label>

      <div className="relative group">
        {/* Current Photo or Placeholder */}
        <div 
          onClick={() => fileInputRef.current?.click()}
          className="relative aspect-square w-48 rounded-[30px] overflow-hidden bg-va-off-white border-2 border-dashed border-black/5 cursor-pointer hover:border-primary/20 transition-all shadow-inner group"
        >
          {currentPhotoUrl ? (
            <VoiceglotImage 
              src={currentPhotoUrl} 
              alt={actorName} 
              fill
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-va-black/20">
              <ImageIcon size={48} strokeWidth={1} />
              <span className="text-[10px] font-bold uppercase tracking-widest mt-2">
                <VoiceglotText translationKey="admin.photo.upload_cta" defaultText="Upload Foto" />
              </span>
            </div>
          )}
          
          <div className="absolute inset-0 bg-va-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <Upload className="text-white" size={24} />
          </div>
        </div>

        <input 
          type="file" 
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="image/*"
          className="hidden" 
        />
      </div>

      {/* Cropping Modal Overlay */}
      <AnimatePresence>
        {image && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[400] flex items-center justify-center p-6 bg-va-black/90 backdrop-blur-xl"
          >
            <ContainerInstrument plain className="relative w-full max-w-xl bg-white rounded-[40px] overflow-hidden shadow-2xl flex flex-col h-[80vh]">
              <div className="p-8 border-b border-black/5 flex justify-between items-center">
                <HeadingInstrument level={3} className="text-2xl font-light tracking-tighter">
                  <VoiceglotText translationKey="admin.photo.crop_title" defaultText="Foto" /> <span className="text-primary italic"><VoiceglotText translationKey="admin.photo.crop_subtitle" defaultText="Kadreren" /></span>
                </HeadingInstrument>
                <button onClick={() => setImage(null)} className="p-2 hover:bg-va-off-white rounded-full transition-colors">
                  <X size={20} />
                </button>
              </div>

              <div className="flex-1 relative bg-va-black">
                <Cropper
                  image={image}
                  crop={crop}
                  zoom={zoom}
                  aspect={1}
                  onCropChange={setCrop}
                  onCropComplete={onCropComplete}
                  onZoomChange={setZoom}
                />
              </div>

              <div className="p-8 space-y-6">
                <div className="space-y-2">
                  <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-va-black/40">
                    <span>
                      <VoiceglotText translationKey="admin.photo.zoom" defaultText="Zoom" />
                    </span>
                    <span>{Math.round(zoom * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    value={zoom}
                    min={1}
                    max={3}
                    step={0.1}
                    aria-labelledby="Zoom"
                    onChange={(e) => setZoom(Number(e.target.value))}
                    className="w-full h-1.5 bg-va-off-white rounded-lg appearance-none cursor-pointer accent-primary"
                  />
                </div>

                <div className="flex gap-4">
                  <ButtonInstrument 
                    variant="outline" 
                    onClick={() => setImage(null)}
                    className="flex-1 rounded-2xl py-4"
                  >
                    {t('action.cancel', 'Annuleren')}
                  </ButtonInstrument>
                  <ButtonInstrument 
                    onClick={handleUpload}
                    disabled={isUploading}
                    className="flex-1 bg-va-black text-white hover:bg-primary rounded-2xl py-4 flex items-center justify-center gap-2 shadow-lg transition-all"
                  >
                    {isUploading ? (
                      <Loader2 size={20} className="animate-spin" />
                    ) : (
                      <>
                        <Check size={20} />
                        {t('action.confirm_save', 'Bevestigen & Opslaan')}
                      </>
                    )}
                  </ButtonInstrument>
                </div>
              </div>
            </ContainerInstrument>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
