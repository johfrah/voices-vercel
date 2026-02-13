"use client";

import { ButtonInstrument, ContainerInstrument, HeadingInstrument, InputInstrument, LabelInstrument, TextInstrument } from '@/components/ui/LayoutInstruments';
import { Check, Rocket, X } from 'lucide-react';
import { useState } from 'react';

interface PromotionModalProps {
  file: {
    id: number;
    filename: string;
    category: string;
  };
  actorId?: number;
  onClose: () => void;
  onSuccess: () => void;
}

export const PromotionModal = ({ file, actorId, onClose, onSuccess }: PromotionModalProps) => {
  const [demoName, setDemoName] = useState(file.filename.split('.')[0]);
  const [demoType, setDemoType] = useState('demo');
  const [isPromoting, setIsPromoting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handlePromote = async () => {
    setIsPromoting(true);
    try {
      const res = await fetch('/api/vault/promote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          vaultFileId: file.id,
          actorId: actorId,
          demoName,
          demoType
        })
      });

      if (res.ok) {
        setIsSuccess(true);
        setTimeout(() => {
          onSuccess();
          onClose();
        }, 2000);
      }
    } catch (error) {
      console.error('❌ Promotion Error:', error);
    } finally {
      setIsPromoting(false);
    }
  };

  return (
    <ContainerInstrument className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-va-black/40 backdrop-blur-sm">
      <ContainerInstrument className="w-full max-w-md bg-white rounded-[32px] shadow-2xl overflow-hidden border border-gray-100">
        <ContainerInstrument className="p-8">
          <ContainerInstrument className="flex justify-between items-start mb-6">
            <ContainerInstrument className="w-12 h-12 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center">
              <Rocket strokeWidth={1.5} size={24} />
            </ContainerInstrument>
            <ButtonInstrument onClick={onClose} className="p-2 hover:bg-gray-50 rounded-xl transition-colors">
              <X strokeWidth={1.5} size={20} className="text-gray-400" />
            </ButtonInstrument>
          </ContainerInstrument>

          <HeadingInstrument level={3} className="text-2xl font-light tracking-tight text-gray-900 mb-2">
            Promoot naar Profiel
          </HeadingInstrument>
          <TextInstrument className="text-gray-500 text-[15px] mb-8 font-light">
            Verplaats deze demo van de privé kluis naar het publieke profiel van de stem.
          </TextInstrument>

          {isSuccess ? (
            <ContainerInstrument className="py-12 text-center space-y-4">
              <ContainerInstrument className="w-16 h-16 bg-green-50 text-green-500 rounded-full flex items-center justify-center mx-auto animate-bounce">
                <Check strokeWidth={1.5} size={32} />
              </ContainerInstrument>
              <TextInstrument className="font-bold text-green-600">Succesvol gepromoveerd!</TextInstrument>
            </ContainerInstrument>
          ) : (
            <ContainerInstrument className="space-y-6">
              <ContainerInstrument>
                <LabelInstrument className="text-[15px] font-black tracking-widest text-gray-400 mb-2 block">Demo Naam</LabelInstrument>
                <InputInstrument 
                  value={demoName}
                  onChange={(e) => setDemoName(e.target.value)}
                  className="w-full bg-gray-50 border-none rounded-2xl py-3 px-4 text-[15px] font-bold"
                />
              </ContainerInstrument>

              <ContainerInstrument>
                <LabelInstrument className="text-[15px] font-black tracking-widest text-gray-400 mb-2 block">Type</LabelInstrument>
                <select 
                  value={demoType}
                  onChange={(e) => setDemoType(e.target.value)}
                  className="w-full bg-gray-50 border-none rounded-2xl py-3 px-4 text-[15px] font-bold appearance-none cursor-pointer"
                >
                  <option value="demo">Algemene Demo</option>
                  <option value="commercial">Commercial</option>
                  <option value="corporate">Corporate</option>
                  <option value="telephony">Telephony</option>
                </select>
              </ContainerInstrument>

              <ContainerInstrument className="pt-4">
                <ButtonInstrument 
                  onClick={handlePromote}
                  disabled={isPromoting || !actorId}
                  className="w-full bg-va-black text-white rounded-2xl py-4 font-black tracking-widest text-[15px] flex items-center justify-center gap-2 hover:scale-[1.02] transition-all disabled:opacity-50"
                >
                  {isPromoting ? 'Bezig...' : (
                    <>
                      <Rocket strokeWidth={1.5} size={16} />
                      Nu Promoveren
                    </>
                  )}
                </ButtonInstrument>
                {!actorId && (
                  <TextInstrument className="text-[15px] text-red-500 mt-2 text-center font-bold">⚠️ Geen acteur gekoppeld aan deze mail.</TextInstrument>
                )}
              </ContainerInstrument>
            </ContainerInstrument>
          )}
        </ContainerInstrument>
      </ContainerInstrument>
    </ContainerInstrument>
  );
};
