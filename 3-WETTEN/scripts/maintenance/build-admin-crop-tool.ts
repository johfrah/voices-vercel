import fs from 'fs';
import path from 'path';

const PAGE_PATH = './1-SITE/apps/web/src/app/admin/photo-crop/page.tsx';

const pageContent = `"use client";

import React, { useState, useEffect, useRef } from 'react';
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
  }, []);

  function onImageLoad(e: React.SyntheticEvent<HTMLImageElement>) {
    const { width, height } = e.currentTarget;
    const initialAspect = 1;
    setAspect(initialAspect);
    
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
                onClick={() => setCurrentVoiceId(v.id)}
                className={\`w-full text-left p-3 rounded-[10px] mb-2 transition-all \${currentVoiceId === v.id ? 'bg-primary text-white' : 'hover:bg-white'}\`}
              >
                <TextInstrument size="sm" className={currentVoiceId === v.id ? 'text-white' : ''}>
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
                  variant={aspect === 1 ? 'default' : 'outline'} 
                  size="sm" 
                  onClick={() => setAspect(1)}
                >
                  1:1 Square
                </ButtonInstrument>
                <ButtonInstrument 
                  variant={aspect === secondaryAspect ? 'default' : 'outline'} 
                  size="sm" 
                  onClick={() => setAspect(secondaryAspect)}
                >
                  {secondaryFormat}
                </ButtonInstrument>
              </div>
            </div>
            
            <div className="flex gap-10">
              {/* Crop Area */}
              <div className="flex-1 bg-va-off-white rounded-[20px] p-5 flex items-center justify-center min-h-[500px] relative">
                {sourcePhoto && (
                  <ReactCrop
                    crop={crop}
                    onChange={(c) => setCrop(c)}
                    onComplete={(c) => setCompletedCrop(c)}
                    aspect={aspect}
                    className="max-h-[600px]"
                  >
                    <img 
                      ref={imgRef}
                      src={sourcePhoto.path} 
                      alt="Source"
                      onLoad={onImageLoad}
                      className="max-h-[600px] object-contain"
                    />
                    
                    {/* Passport Overlay (Hulplijnen) */}
                    <div className="absolute inset-0 pointer-events-none border border-white/20">
                       <div className="absolute top-[30%] left-0 w-full border-t border-primary/40 border-dashed" />
                       <div className="absolute top-[45%] left-0 w-full border-t border-primary/40 border-dashed" />
                       <div className="absolute left-[50%] top-0 h-full border-l border-primary/40 border-dashed" />
                    </div>
                  </ReactCrop>
                )}
              </div>

              {/* Preview Sidebar */}
              <div className="w-[250px] space-y-8">
                <div>
                  <TextInstrument className="mb-2 font-bold text-xs uppercase opacity-50">Live Preview</TextInstrument>
                  <div className="aspect-square bg-va-off-white rounded-[20px] overflow-hidden shadow-inner border border-primary/10">
                    {/* Hier komt de canvas preview */}
                    <div className="w-full h-full flex items-center justify-center text-center p-5">
                      <TextInstrument size="xs">Crop om preview te genereren</TextInstrument>
                    </div>
                  </div>
                </div>
                
                <div className="p-5 bg-primary/5 rounded-[15px] border border-primary/10">
                  <TextInstrument size="xs" className="text-primary italic">
                    "Moby: Lijn de ogen uit op de bovenste hulplijn voor een consistente flow in de VoiceCards."
                  </TextInstrument>
                </div>

                <ButtonInstrument className="w-full" onClick={() => alert('Opslaan naar optimised map...')}>
                  Opslaan & Volgende
                </ButtonInstrument>
              </div>
            </div>
          </div>
        </div>
      </ContainerInstrument>
    </PageWrapperInstrument>
  );
}
`;

fs.writeFileSync(PAGE_PATH, pageContent);
console.log(`✅ Admin crop tool verfijnd met multi-format support op ${PAGE_PATH}`);
