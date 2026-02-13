"use client";

import { useState } from 'react';
import { ButtonInstrument, ContainerInstrument, HeadingInstrument, InputInstrument, TextInstrument } from '@/components/ui/LayoutInstruments';
import { Rocket, X, Mic, Check } from 'lucide-react';

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
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-va-black/40 backdrop-blur-sm">
      <ContainerInstrument className="w-full max-w-md bg-white rounded-[32px] shadow-2xl overflow-hidden border border-gray-100">
        <div className="p-8">
          <div className="flex justify-between items-start mb-6">
            <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center">
              <Rocket size={24} />
            </div>
            <ButtonInstrument onClick={onClose} className="p-2 hover:bg-gray-50 rounded-xl transition-colors">
              <X strokeWidth={1.5} size={20} className="text-gray-400" />
            </ButtonInstrument>
          </div>

          <HeadingInstrument level={3} className="text-2xl font-black tracking-tight text-gray-900 mb-2">
            Promoot naar Profiel
          </HeadingInstrument>
          <TextInstrument className="text-gray-500 text-sm mb-8 font-light">
            Verplaats deze demo van de privé kluis naar het publieke profiel van de stem.
          </TextInstrument>

          {isSuccess ? (
            <div className="py-12 text-center space-y-4">
              <div className="w-16 h-16 bg-green-50 text-green-500 rounded-full flex items-center justify-center mx-auto animate-bounce">
                <Check strokeWidth={1.5} size={32} />
              </div>
              <p className="font-bold text-green-600">Succesvol gepromoveerd!</p>
            </div>
          ) : (
            <div className="space-y-6">
              <div>
                <label className="text-[15px] font-black tracking-widest text-gray-400 mb-2 block">Demo Naam</label>
                <InputInstrument 
                  value={demoName}
                  onChange={(e) => setDemoName(e.target.value)}
                  className="w-full bg-gray-50 border-none rounded-2xl py-3 px-4 text-sm font-bold"
                />
              </div>

              <div>
                <label className="text-[15px] font-black tracking-widest text-gray-400 mb-2 block">Type</label>
                <select 
                  value={demoType}
                  onChange={(e) => setDemoType(e.target.value)}
                  className="w-full bg-gray-50 border-none rounded-2xl py-3 px-4 text-sm font-bold appearance-none cursor-pointer"
                >
                  <option value="demo">Algemene Demo</option>
                  <option value="commercial">Commercial</option>
                  <option value="corporate">Corporate</option>
                  <option value="telephony">Telephony</option>
                </select>
              </div>

              <div className="pt-4">
                <ButtonInstrument 
                  onClick={handlePromote}
                  disabled={isPromoting || !actorId}
                  className="w-full bg-va-black text-white rounded-2xl py-4 font-black tracking-widest text-[15px] flex items-center justify-center gap-2 hover:scale-[1.02] transition-all disabled:opacity-50"
                >
                  {isPromoting ? 'Bezig...' : (
                    <>
                      <Rocket size={16} />
                      Nu Promoveren
                    </>
                  )}
                </ButtonInstrument>
                {!actorId && (
                  <p className="text-[15px] text-red-500 mt-2 text-center font-bold">⚠️ Geen acteur gekoppeld aan deze mail.</p>
                )}
              </div>
            </div>
          )}
        </div>
      </ContainerInstrument>
    </div>
  );
};
