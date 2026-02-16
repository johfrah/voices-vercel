'use client';

import React, { useState } from 'react';
import { ButtonInstrument, TextInstrument } from "@/components/ui/LayoutInstruments";
import { Award, Loader2, CheckCircle2 } from "lucide-react";
import { VoiceglotText } from '@/components/ui/VoiceglotText';

interface CertificateTriggerProps {
  editionId: number;
  participantCount: number;
}

export const CertificateTrigger: React.FC<CertificateTriggerProps> = ({ editionId, participantCount }) => {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const handleTrigger = async () => {
    if (participantCount === 0) return;
    
    setStatus('loading');
    try {
      const response = await fetch(`/api/admin/studio/edities/${editionId}/certificates`, {
        method: 'POST',
      });

      if (response.ok) {
        setStatus('success');
        setTimeout(() => setStatus('idle'), 3000);
      } else {
        setStatus('error');
        setTimeout(() => setStatus('idle'), 3000);
      }
    } catch (error) {
      setStatus('error');
      setTimeout(() => setStatus('idle'), 3000);
    }
  };

  return (
    <div className="w-full">
    <ButtonInstrument 
      onClick={handleTrigger} 
      disabled={status === 'loading' || participantCount === 0}
      className={`w-full py-4 flex items-center justify-center gap-3 rounded-xl text-[15px] font-light tracking-widest transition-all ${
        status === 'success' 
          ? 'bg-emerald-500 text-white' 
          : status === 'error'
          ? 'bg-red-500 text-white'
          : 'bg-va-black text-white hover:bg-primary shadow-aura'
      }`}
    >
      {status === 'loading' ? (
        <>
          <Loader2 className="animate-spin" size={18} strokeWidth={1.5} />
          <VoiceglotText translationKey="admin.studio.trigger.processing" defaultText="Verwerken..." />
        </>
      ) : status === 'success' ? (
        <>
          <CheckCircle2 size={18} strokeWidth={1.5} />
          <VoiceglotText translationKey="admin.studio.trigger.sent" defaultText="Alles Verzonden!" />
        </>
      ) : (
        <>
          <Award size={18} strokeWidth={1.5} />
          <VoiceglotText translationKey="admin.studio.trigger.full_followup" defaultText="Volledige Follow-up (Audio, Certificaat, Review)" />
        </>
      )}
    </ButtonInstrument>
      
      {participantCount === 0 && (
        <TextInstrument className="text-[11px] text-black/30 mt-2 text-center uppercase tracking-widest">
          Geen deelnemers om certificaten naar te sturen
        </TextInstrument>
      )}
    </div>
  );
};
