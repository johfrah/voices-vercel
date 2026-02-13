"use client";

import { Mic2, Music, Phone, Play, Plus, Save, Trash2 } from 'lucide-react';
import React, { useState } from 'react';
import { VoiceglotText } from '../ui/VoiceglotText';
import { 
  ContainerInstrument, 
  HeadingInstrument, 
  TextInstrument,
  ButtonInstrument,
  InputInstrument
} from '@/components/ui/LayoutInstruments';

/**
 * IVR CONFIGURATOR (GOD MODE 2026)
 * Persona: 'Gastvrije Expert'
 * UI: Professional Telephony Cockpit
 */

interface IVRStep {
  id: string;
  label: string;
  action: 'message' | 'menu' | 'transfer';
  value: string;
}

export const IVROverview: React.FC = () => {
  const [steps, setSteps] = useState<IVRStep[]>([
    { id: '1', label: 'Welkomstboodschap', action: 'message', value: 'Welkom bij Voices.be' },
    { id: '2', label: 'Hoofdmenu', action: 'menu', value: 'Druk 1 voor sales, 2 voor support' }
  ]);

  const addStep = () => {
    const newStep: IVRStep = {
      id: Math.random().toString(36).substring(7),
      label: 'Nieuwe Stap',
      action: 'message',
      value: ''
    };
    setSteps([...steps, newStep]);
  };

  const removeStep = (id: string) => {
    setSteps(steps.filter(s => s.id !== id));
  };

  return (
    <ContainerInstrument className="bg-white rounded-[40px] p-8 md:p-12 border border-black/5 shadow-aura">
      <ContainerInstrument className="flex items-center justify-between mb-8 md:mb-12">
        <ContainerInstrument className="flex items-center gap-4">
          <ContainerInstrument className="w-14 h-14 bg-black rounded-2xl flex items-center justify-center text-white shadow-xl">
            <Phone strokeWidth={1.5} size={28} />
          </ContainerInstrument>
          <ContainerInstrument>
            <HeadingInstrument level={2} className="text-2xl md:text-3xl font-light tracking-tighter ">
              <VoiceglotText  translationKey="ivr.configurator.title" defaultText="IVR Configurator" />
            </HeadingInstrument>
            <TextInstrument className="text-[15px] font-light tracking-widest text-black/30">
              <VoiceglotText  translationKey="ivr.configurator.subtitle" defaultText="Telephony OS 2026 • Active" />
            </TextInstrument>
          </ContainerInstrument>
        </ContainerInstrument>
        <ButtonInstrument className="va-btn-pro flex items-center gap-2" data-voices-sonic-dna="click-premium">
          <Save strokeWidth={1.5} size={16} /> <VoiceglotText  translationKey="common.save" defaultText="OPSLAAN" />
        </ButtonInstrument>
      </ContainerInstrument>

      {/* IVR Flow Builder */}
      <ContainerInstrument className="space-y-3 md:space-y-4">
        {steps.map((step, index) => (
          <ContainerInstrument key={step.id} className="flex items-center gap-4 md:gap-6 p-4 md:p-6 bg-black/5 rounded-2xl border border-black/5 group hover:bg-black/10 transition-all">
            <ContainerInstrument className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center font-light text-[15px]">
              {index + 1}
            </ContainerInstrument>
            
            <ContainerInstrument className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
              <InputInstrument 
                type="text" 
                value={step.label}
                onChange={(e: any) => {
                  const newSteps = [...steps];
                  newSteps[index].label = e.target.value;
                  setSteps(newSteps);
                }}
                className="bg-transparent font-light text-[15px] focus:outline-none"
                placeholder="Naam van de stap"
              />
              <select 
                value={step.action}
                onChange={(e) => {
                  const newSteps = [...steps];
                  newSteps[index].action = e.target.value as any;
                  setSteps(newSteps);
                }}
                className="bg-transparent text-[15px] font-light tracking-widest focus:outline-none"
              >
                <option value="message">Boodschap</option>
                <option value="menu">Keuzemenu</option>
                <option value="transfer">Doorverbinden</option>
              </select>
              <InputInstrument 
                type="text" 
                value={step.value}
                onChange={(e: any) => {
                  const newSteps = [...steps];
                  newSteps[index].value = e.target.value;
                  setSteps(newSteps);
                }}
                className="bg-transparent text-[15px] text-black/60 focus:outline-none font-light"
                placeholder="Waarde / Tekst"
              />
            </ContainerInstrument>

            <ContainerInstrument className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <ButtonInstrument className="p-2 hover:text-primary transition-colors"><Play strokeWidth={1.5} size={18} /></ButtonInstrument>
              <ButtonInstrument onClick={() => removeStep(step.id)} className="p-2 hover:text-red-500 transition-colors"><Trash2 strokeWidth={1.5} size={18} /></ButtonInstrument>
            </ContainerInstrument>
          </ContainerInstrument>
        ))}

        <ButtonInstrument 
          onClick={addStep}
          className="w-full py-4 border-2 border-dashed border-black/10 rounded-2xl flex items-center justify-center gap-2 text-black/30 hover:text-black hover:border-black/20 transition-all font-light text-[15px] tracking-widest"
        >
          <Plus strokeWidth={1.5} size={16} /> <VoiceglotText  translationKey="ivr.configurator.add_step" defaultText="STAP TOEVOEGEN" />
        </ButtonInstrument>
      </ContainerInstrument>

      {/* Audio Mixer Integration */}
      <ContainerInstrument className="mt-8 md:mt-12 pt-8 md:pt-12 border-t border-black/5 grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
        <ContainerInstrument className="bg-va-off-white rounded-[32px] p-4 md:p-6 border-none shadow-none">
          <ContainerInstrument className="flex items-center gap-3 mb-4 text-black/40">
            <Music strokeWidth={1.5} size={18} />
            <TextInstrument className="text-[15px] font-light tracking-widest">
              <VoiceglotText  translationKey="ivr.configurator.hold_music" defaultText="Wachtmuziek" />
            </TextInstrument>
          </ContainerInstrument>
          <TextInstrument className="font-light text-[15px] mb-4 italic">&quot;Corporate Minimalist V1&quot;</TextInstrument>
          <ButtonInstrument className="text-[15px] font-light underline tracking-widest bg-transparent p-0"><VoiceglotText  translationKey="ivr.configurator.change_music" defaultText="Wijzig muziek" /></ButtonInstrument>
        </ContainerInstrument>
        <ContainerInstrument className="bg-va-off-white rounded-[32px] p-4 md:p-6 border-none shadow-none">
          <ContainerInstrument className="flex items-center gap-3 mb-4 text-black/40">
            <Mic2 strokeWidth={1.5} size={18} />
            <TextInstrument className="text-[15px] font-light tracking-widest">
              <VoiceglotText  translationKey="ivr.configurator.voice_actor" defaultText="Stemacteur" />
            </TextInstrument>
          </ContainerInstrument>
          <TextInstrument className="font-bold text-[15px] mb-4 italic">&quot;Sarah (Vlaams, Zakelijk)&quot;</TextInstrument>
          <ButtonInstrument className="text-[15px] font-light underline tracking-widest bg-transparent p-0"><VoiceglotText  translationKey="ivr.configurator.change_voice" defaultText="Wijzig stem" /></ButtonInstrument>
        </ContainerInstrument>
      </ContainerInstrument>
    </ContainerInstrument>
  );
};
