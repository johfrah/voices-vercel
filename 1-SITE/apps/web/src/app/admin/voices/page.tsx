"use client";

import React, { useState, useEffect } from 'react';
import { useEditMode } from '@/contexts/EditModeContext';
import { useSonicDNA } from '@/lib/sonic-dna';
import { 
  Mic, 
  Search, 
  Filter, 
  MoreVertical, 
  Lock, 
  Unlock, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  Save,
  ArrowLeft
} from 'lucide-react';
import { BentoGrid, BentoCard } from '@/components/ui/BentoGrid';
import { PageWrapperInstrument, SectionInstrument, ContainerInstrument, HeadingInstrument, TextInstrument, ButtonInstrument, InputInstrument } from '@/components/ui/LayoutInstruments';
import { VoiceglotText } from '@/components/ui/VoiceglotText';
import Link from 'next/link';

interface ActorRecord {
  id: number;
  firstName: string;
  lastName: string;
  status: 'live' | 'pending' | 'unavailable';
  priceUnpaid: string;
  voiceScore: number;
  nativeLang: string;
}

/**
 * 🎙️ VOICE MANAGER
 * Beheer-modus: Alleen bewerkbaar als 'Edit Mode' aan staat.
 */
export default function VoiceManagerPage() {
  const { isEditMode, toggleEditMode } = useEditMode();
  const { playClick, playSwell } = useSonicDNA();
  const [search, setSearch] = useState('');
  
  // Mock data - in realiteit komt dit uit de /api/backoffice/actors route
  const [actors, setActors] = useState<ActorRecord[]>([
    { id: 1, firstName: 'Johfrah', lastName: 'Voices', status: 'live', priceUnpaid: '250.00', voiceScore: 98, nativeLang: 'NL' },
    { id: 2, firstName: 'Julie', lastName: 'Vocal', status: 'pending', priceUnpaid: '180.00', voiceScore: 85, nativeLang: 'FR' },
    { id: 3, firstName: 'Marc', lastName: 'Studio', status: 'live', priceUnpaid: '210.00', voiceScore: 92, nativeLang: 'EN' },
  ]);

  const handleStatusToggle = (id: number) => {
    if (!isEditMode) return;
    playClick('pop');
    setActors(prev => prev.map(a => 
      a.id === id ? { ...a, status: a.status === 'live' ? 'pending' : 'live' } : a
    ));
  };

  return (
    <PageWrapperInstrument className="p-12 space-y-12 max-w-[1600px] mx-auto min-h-screen">
      {/* Header */}
      <SectionInstrument className="flex justify-between items-end">
        <ContainerInstrument className="space-y-4">
          <Link href="/admin/dashboard" className="flex items-center gap-2 text-va-black/30 hover:text-primary transition-colors text-[10px] font-black uppercase tracking-widest">
            <ArrowLeft size={12} /> 
            <VoiceglotText translationKey="admin.back_to_cockpit" defaultText="Terug" />
          </Link>
          <HeadingInstrument level={1} className="text-6xl font-black tracking-tighter uppercase">
            <VoiceglotText translationKey="admin.voice_manager.title" defaultText="Stemmen" />
          </HeadingInstrument>
        </ContainerInstrument>

        <ContainerInstrument className="flex gap-4 items-center">
          <ContainerInstrument className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-va-black/20" size={18} />
            <InputInstrument 
              type="text" 
              placeholder="Zoek..."
              className="bg-white border border-black/5 rounded-2xl pl-12 pr-6 py-4 text-sm font-medium focus:ring-2 focus:ring-primary/20 transition-all w-80 shadow-sm"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </ContainerInstrument>
          
          <ButtonInstrument 
            onClick={() => {
              playClick('pro');
              toggleEditMode();
            }}
            className={`flex items-center gap-3 px-8 py-4 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all shadow-lg ${
              isEditMode 
                ? 'bg-primary text-white shadow-primary/20 scale-105' 
                : 'bg-va-black text-white hover:bg-va-black/80'
            }`}
          >
            {isEditMode ? <Unlock size={14} /> : <Lock size={14} />}
            {isEditMode ? <VoiceglotText translationKey="admin.edit_mode_on" defaultText="Bewerken" /> : <VoiceglotText translationKey="admin.edit_mode" defaultText="Bewerken" />}
          </ButtonInstrument>
        </ContainerInstrument>
      </SectionInstrument>

      {/* Actor Grid */}
      <ContainerInstrument className="grid grid-cols-1 gap-4">
        {actors.map((actor) => (
          <ContainerInstrument 
            key={actor.id}
            className={`bg-white border border-black/5 p-6 rounded-[32px] flex items-center gap-8 transition-all hover:shadow-aura group ${
              isEditMode ? 'ring-2 ring-primary/5 hover:ring-primary/20' : ''
            }`}
          >
            {/* Avatar & Basic Info */}
            <ContainerInstrument className="w-16 h-16 bg-va-off-white rounded-2xl flex items-center justify-center font-black text-va-black/20 text-xl">
              {actor.firstName.charAt(0)}
            </ContainerInstrument>

            <ContainerInstrument className="flex-1">
              <ContainerInstrument className="flex items-center gap-2">
                <HeadingInstrument level={3} className="text-xl font-black uppercase tracking-tight">
                  <VoiceglotText translationKey={`admin.actor.${actor.id}.name`} defaultText={`${actor.firstName} ${actor.lastName}`} noTranslate={true} />
                </HeadingInstrument>
                <TextInstrument as="span" className="text-[10px] font-bold text-va-black/20 uppercase tracking-widest">#{actor.id}</TextInstrument>
              </ContainerInstrument>
              <TextInstrument className="text-[10px] font-black text-primary uppercase tracking-[0.2em] mt-1">
                <VoiceglotText translationKey="admin.voice_manager.native" defaultText={`${actor.nativeLang} NATIVE`} />
              </TextInstrument>
            </ContainerInstrument>

            {/* Status - Clickable in Edit Mode */}
            <ContainerInstrument 
              onClick={() => handleStatusToggle(actor.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all ${
                isEditMode ? 'cursor-pointer hover:scale-105' : 'pointer-events-none'
              } ${
                actor.status === 'live' ? 'bg-green-500/10 text-green-600' : 'bg-yellow-500/10 text-yellow-600'
              }`}
            >
              {actor.status === 'live' ? <CheckCircle2 size={14} /> : <Clock size={14} />}
              <TextInstrument as="span" className="text-[10px] font-black uppercase tracking-widest">{actor.status}</TextInstrument>
            </ContainerInstrument>

            {/* Price - Editable in Edit Mode */}
            <ContainerInstrument className="w-32">
              <TextInstrument className="text-[8px] font-black text-va-black/30 uppercase tracking-widest mb-1">
                <VoiceglotText translationKey="admin.voice_manager.rate_label" defaultText="Tarief" />
              </TextInstrument>
              <ContainerInstrument className={`flex items-center gap-1 text-lg font-black tracking-tighter transition-all ${
                isEditMode ? 'text-primary' : 'text-va-black'
              }`}>
                €
                {isEditMode ? (
                  <InputInstrument 
                    type="text" 
                    value={actor.priceUnpaid}
                    onChange={(e) => {
                      const val = e.target.value;
                      setActors(prev => prev.map(a => a.id === actor.id ? { ...a, priceUnpaid: val } : a));
                    }}
                    onBlur={() => playClick('success')}
                    className="bg-primary/5 border-none p-0 w-20 focus:ring-0 text-lg font-black"
                  />
                ) : (
                  <TextInstrument as="span">{actor.priceUnpaid}</TextInstrument>
                )}
              </ContainerInstrument>
            </ContainerInstrument>

            {/* Score */}
            <ContainerInstrument className="text-right pr-4">
              <TextInstrument className="text-[8px] font-black text-va-black/30 uppercase tracking-widest mb-1">
                <VoiceglotText translationKey="admin.voice_manager.score_label" defaultText="Score" />
              </TextInstrument>
              <ContainerInstrument className="flex items-center gap-2 justify-end">
                <ContainerInstrument className="w-24 h-1.5 bg-va-off-white rounded-full overflow-hidden">
                  <ContainerInstrument className="h-full bg-primary" {...({ style: { width: `${actor.voiceScore}%` } } as any)} />
                </ContainerInstrument>
                <TextInstrument as="span" className="text-xs font-black">{actor.voiceScore}</TextInstrument>
              </ContainerInstrument>
            </ContainerInstrument>

            {/* Actions */}
            <ContainerInstrument className="flex gap-2">
              {isEditMode && (
                <ButtonInstrument 
                  onMouseEnter={() => playSwell()}
                  onClick={() => playClick('success')}
                  className="w-10 h-10 bg-primary text-white rounded-xl flex items-center justify-center hover:scale-110 transition-all shadow-lg shadow-primary/20"
                >
                  <Save size={16} />
                </ButtonInstrument>
              )}
              <ButtonInstrument className="w-10 h-10 bg-va-off-white text-va-black/20 rounded-xl flex items-center justify-center hover:text-va-black transition-all">
                <MoreVertical size={16} />
              </ButtonInstrument>
            </ContainerInstrument>
          </ContainerInstrument>
        ))}
      </ContainerInstrument>

      {/* Sync Indicator */}
      {isEditMode && (
        <ContainerInstrument className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-va-black text-white px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-3 animate-bounce">
          <ContainerInstrument className="w-2 h-2 bg-primary rounded-full animate-pulse" />
          <TextInstrument as="span" className="text-[9px] font-black uppercase tracking-widest">
            <VoiceglotText translationKey="admin.db_sync_active" defaultText="Sync Actief" />
          </TextInstrument>
        </ContainerInstrument>
      )}
    </PageWrapperInstrument>
  );
}
