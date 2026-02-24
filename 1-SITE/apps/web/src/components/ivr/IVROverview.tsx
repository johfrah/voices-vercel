"use client";

import { Mic2, Music, Phone, Play, Plus, Save, Trash2 } from 'lucide-react';
import React, { useState } from 'react';
import { VoiceglotText } from '../ui/VoiceglotText';
import { useTranslation } from '@/contexts/TranslationContext';

/**
 * IVR CONFIGURATOR (GOD MODE 2026)
 * Persona: 'Gastvrije Expert'
 * UI: Professional Telephony Dashboard
 */

interface IVRStep {
  id: string;
  label: string;
  action: 'message' | 'menu' | 'transfer';
  value: string;
}

export const IVROverview: React.FC = () => {
  const { t, market } = useTranslation();
  const [steps, setSteps] = useState<IVRStep[]>([
    { id: '1', label: t('ivr.step.welcome', 'Welkomstboodschap'), action: 'message', value: `Welkom bij ${market.name}` },
    { id: '2', label: t('ivr.step.main_menu', 'Hoofdmenu'), action: 'menu', value: 'Druk 1 voor sales, 2 voor support' }
  ]);

  const addStep = () => {
    const newStep: IVRStep = {
      id: Math.random().toString(36).substring(7),
      label: t('ivr.step.new', 'Nieuwe Stap'),
      action: 'message',
      value: ''
    };
    setSteps([...steps, newStep]);
  };

  const removeStep = (id: string) => {
    setSteps(steps.filter(s => s.id !== id));
  };

  return (
    <div className="bg-white rounded-[40px] p-12 border border-black/5 shadow-aura">
      <div className="flex items-center justify-between mb-12">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-black rounded-2xl flex items-center justify-center text-white shadow-xl">
            <Phone strokeWidth={1.5} size={28} />
          </div>
          <div>
            <h2 className="text-3xl font-light tracking-tighter ">
              <VoiceglotText  translationKey="ivr.configurator.title" defaultText="IVR Configurator" />
            </h2>
            <p className="text-[15px] font-light tracking-widest text-black/30">
              <VoiceglotText  translationKey="ivr.configurator.subtitle" defaultText="Telephony OS 2026  Active" />
            </p>
          </div>
        </div>
        <button className="va-btn-pro flex items-center gap-2" data-voices-sonic-dna="click-premium">
          <Save strokeWidth={1.5} size={16} /> <VoiceglotText  translationKey="common.save" defaultText="OPSLAAN" />
        </button>
      </div>

      {/* IVR Flow Builder */}
      <div className="space-y-4">
        {steps.map((step, index) => (
          <div key={step.id} className="flex items-center gap-6 p-6 bg-black/5 rounded-2xl border border-black/5 group hover:bg-black/10 transition-all">
            <div className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center font-light text-[15px]">
              {index + 1}
            </div>
            
            <div className="flex-1 grid grid-cols-3 gap-4">
              <input 
                type="text" 
                value={step.label}
                onChange={(e) => {
                  const newSteps = [...steps];
                  newSteps[index].label = e.target.value;
                  setSteps(newSteps);
                }}
                className="bg-transparent font-light text-[15px] focus:outline-none"
                placeholder={t('ivr.placeholder.step_name', "Naam van de stap")}
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
                <option value="message">{t('ivr.action.message', 'Boodschap')}</option>
                <option value="menu">{t('ivr.action.menu', 'Keuzemenu')}</option>
                <option value="transfer">{t('ivr.action.transfer', 'Doorverbinden')}</option>
              </select>
              <input 
                type="text" 
                value={step.value}
                onChange={(e) => {
                  const newSteps = [...steps];
                  newSteps[index].value = e.target.value;
                  setSteps(newSteps);
                }}
                className="bg-transparent text-[15px] text-black/60 focus:outline-none font-light"
                placeholder={t('ivr.placeholder.value', "Waarde / Tekst")}
              />
            </div>

            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <button className="p-2 hover:text-primary transition-colors"><Play strokeWidth={1.5} size={18} /></button>
              <button onClick={() => removeStep(step.id)} className="p-2 hover:text-red-500 transition-colors"><Trash2 strokeWidth={1.5} size={18} /></button>
            </div>
          </div>
        ))}

        <button 
          onClick={addStep}
          className="w-full py-4 border-2 border-dashed border-black/10 rounded-2xl flex items-center justify-center gap-2 text-black/30 hover:text-black hover:border-black/20 transition-all font-light text-[15px] tracking-widest"
        >
          <Plus strokeWidth={1.5} size={16} /> <VoiceglotText  translationKey="ivr.configurator.add_step" defaultText="STAP TOEVOEGEN" />
        </button>
      </div>

      {/* Audio Mixer Integration */}
      <div className="mt-12 pt-12 border-t border-black/5 grid grid-cols-2 gap-8">
        <div className="bg-va-off-white rounded-[32px] p-6 border-none shadow-none">
          <div className="flex items-center gap-3 mb-4 text-black/40">
            <Music strokeWidth={1.5} size={18} />
            <span className="text-[15px] font-light tracking-widest">
              <VoiceglotText  translationKey="ivr.configurator.hold_music" defaultText="Wachtmuziek" />
            </span>
          </div>
          <p className="font-light text-[15px] mb-4 italic">&quot;Corporate Minimalist V1&quot;</p>
          <button className="text-[15px] font-light underline tracking-widest"><VoiceglotText  translationKey="ivr.configurator.change_music" defaultText="Wijzig muziek" /></button>
        </div>
        <div className="bg-va-off-white rounded-[32px] p-6 border-none shadow-none">
          <div className="flex items-center gap-3 mb-4 text-black/40">
            <Mic2 strokeWidth={1.5} size={18} />
            <span className="text-[15px] font-light tracking-widest">
              <VoiceglotText  translationKey="ivr.configurator.voice_actor" defaultText="Stemacteur" />
            </span>
          </div>
          <p className="font-bold text-[15px] mb-4 italic">&quot;Sarah (Vlaams, Zakelijk)&quot;</p>
          <button className="text-[15px] font-light underline tracking-widest"><VoiceglotText  translationKey="ivr.configurator.change_voice" defaultText="Wijzig stem" /></button>
        </div>
      </div>
    </div>
  );
};
