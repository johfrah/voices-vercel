"use client";

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { PageWrapperInstrument, ContainerInstrument, HeadingInstrument, TextInstrument, ButtonInstrument } from '@/components/ui/LayoutInstruments';
import ReactCrop, { centerCrop, makeAspectCrop, Crop, PixelCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';

export default function PhotoCropPage() {
  const [manifest, setManifest] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [currentVoiceId, setCurrentVoiceId] = useState<string | null>(null);
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
  const [aspect, setAspect] = useState<number | undefined>(1); // Default Square
  const [saving, setSaving] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    fetch('/assets/visuals/photo-manifest.json')
      .then(res => res.json())
      .then(data => {
        setManifest(data);
        const firstId = Object.keys(data.voices)[0];
        setCurrentVoiceId(firstId);
        setLoading(false);
      });
  }, []); // Lege array is prima hier voor eenmalige fetch

  // Reset crop en aspect als de stem verandert
  useEffect(() => {
    if (currentVoiceId) {
      setCompletedCrop(undefined);
      // We laten aspect staan op wat de gebruiker gekozen heeft (square of secundair)
    }
  }, [currentVoiceId]);

  function onImageLoad(e: React.SyntheticEvent<HTMLImageElement>) {
    const { width, height } = e.currentTarget;
    const initialAspect = aspect || 1;
    
    const newCrop = centerCrop(
      makeAspectCrop(
        { unit: '%', width: 90 },
        initialAspect,
        width,
        height
      ),
      width,
      height
    );
    setCrop(newCrop);
  }

  async function saveCrop() {
    if (!completedCrop || !currentVoiceId || !manifest) return;
    
    setSaving(true);
    const currentVoice = manifest.voices[currentVoiceId];
    const sourcePhoto = currentVoice.portfolio[0];

    try {
      const response = await fetch('/api/admin/save-crop', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          voiceId: currentVoiceId,
          fileName: sourcePhoto.file,
          crop: completedCrop,
          aspect: aspect
        })
      });

      const result = await response.json();
      if (result.success) {
        alert('✅ Crop opgeslagen naar optimised!');
      } else {
        alert('❌ Fout bij opslaan: ' + result.error);
      }
    } catch (e) {
      alert('❌ Netwerkfout');
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <PageWrapperInstrument><ContainerInstrument><TextInstrument>Laden...</TextInstrument></ContainerInstrument></PageWrapperInstrument>;

  const voices = Object.values(manifest.voices);
  const currentVoice = manifest.voices[currentVoiceId!];
  const sourcePhoto = currentVoice.portfolio[0];

  // Bepaal automatisch het tweede formaat op basis van de bron
  const isVerticalSource = sourcePhoto?.orientation === 'vertical';
  const secondaryFormat = isVerticalSource ? '9/16 (Vertical)' : '16/9 (Horizontal)';
  const secondaryAspect = isVerticalSource ? 9/16 : 16/9;

  return (
    <PageWrapperInstrument>
      <ContainerInstrument className="py-20">
        <HeadingInstrument level={1} className="mb-10">📸 Photo-Crop Masterclass</HeadingInstrument>
        
        <div className="grid grid-cols-12 gap-10">
          {/* Sidebar */}
          <div className="col-span-3 h-[80vh] overflow-y-auto bg-va-off-white p-5 rounded-[20px] shadow-aura">
            <TextInstrument className="mb-4 font-bold opacity-50 uppercase tracking-widest text-[10px]">Stemacteurs</TextInstrument>
            {voices.map((v: any) => (
              <button 
                key={v.id}
                onClick={() => {
                    setCurrentVoiceId(v.id);
                    setCompletedCrop(undefined);
                }}
                className={`w-full text-left p-3 rounded-[10px] mb-2 transition-all ${currentVoiceId === v.id ? 'bg-primary text-white' : 'hover:bg-white'}`}
              >
                <TextInstrument className={currentVoiceId === v.id ? 'text-white' : ''}>
                  {v.namePart}
                </TextInstrument>
              </button>
            ))}
          </div>

          {/* Main Workspace */}
          <div className="col-span-9 bg-white p-10 rounded-[20px] shadow-aura-lg">
            <div className="flex justify-between items-center mb-8">
              <HeadingInstrument level={2}>{currentVoice.namePart}</HeadingInstrument>
              <div className="flex gap-3">
                <ButtonInstrument 
                  onClick={() => setAspect(1)}
                  className={aspect === 1 ? 'bg-primary text-white px-4 py-2' : 'border border-black/10 px-4 py-2'}
                >
                  1:1 Square
                </ButtonInstrument>
                <ButtonInstrument 
                  onClick={() => setAspect(secondaryAspect)}
                  className={aspect === secondaryAspect ? 'bg-primary text-white px-4 py-2' : 'border border-black/10 px-4 py-2'}
                >
                  {secondaryFormat}
                </ButtonInstrument>
              </div>
            </div>
            
            <div className="flex gap-10">
              {/* Crop Area */}
              <div className="flex-1 bg-va-off-white rounded-[20px] p-5 flex items-center justify-center min-h-[500px] relative">
                {sourcePhoto && (
                  <div className="relative">
                    <ReactCrop
                      crop={crop}
                      onChange={(c) => setCrop(c)}
                      onComplete={(c) => setCompletedCrop(c)}
                      aspect={aspect}
                      className="max-h-[600px]"
                    >
                      <Image 
                        ref={imgRef}
                        src={sourcePhoto.path} 
                        alt="Source"
                        width={1200}
                        height={1200}
                        onLoad={(e) => onImageLoad({ currentTarget: e.target } as any)}
                        className="max-h-[600px] w-auto object-contain"
                        unoptimized
                      />
                    </ReactCrop>
                    
                    {/* Passport Overlay (Hulplijnen bovenop de crop) */}
                    {crop && (
                        <div 
                            className="absolute pointer-events-none border border-primary/30"
                            style={{
                                top: `${crop.unit === '%' ? crop.y : (crop.y / (imgRef.current?.height || 1)) * 100}%`,
                                left: `${crop.unit === '%' ? crop.x : (crop.x / (imgRef.current?.width || 1)) * 100}%`,
                                width: `${crop.unit === '%' ? crop.width : (crop.width / (imgRef.current?.width || 1)) * 100}%`,
                                height: `${crop.unit === '%' ? crop.height : (crop.height / (imgRef.current?.height || 1)) * 100}%`,
                            }}
                        >
                            <div className="absolute top-[35%] left-0 w-full border-t border-primary/60 border-dashed" />
                            <div className="absolute top-[50%] left-0 w-full border-t border-primary/20 border-dashed" />
                            <div className="absolute left-[50%] top-0 h-full border-l border-primary/20 border-dashed" />
                        </div>
                    )}
                  </div>
                )}
              </div>

              {/* Preview Sidebar */}
              <div className="w-[250px] space-y-8">
                <div className="p-5 bg-primary/5 rounded-[15px] border border-primary/10">
                  <TextInstrument className="text-primary italic">
                    &quot;Moby: Lijn de ogen uit op de bovenste hulplijn (35%) voor een consistente flow in de VoiceCards.&quot;
                  </TextInstrument>
                </div>

                <ButtonInstrument 
                    className="w-full py-4 bg-va-black text-white" 
                    onClick={saveCrop}
                    disabled={saving || !completedCrop}
                >
                  {saving ? 'Opslaan...' : 'Opslaan naar optimised'}
                </ButtonInstrument>
                
                <TextInstrument className="opacity-50 text-center">
                    De foto wordt direct verwerkt naar de optimised map zonder vervorming.
                </TextInstrument>
              </div>
            </div>
          </div>
        </div>
      </ContainerInstrument>
    </PageWrapperInstrument>
  );
}
