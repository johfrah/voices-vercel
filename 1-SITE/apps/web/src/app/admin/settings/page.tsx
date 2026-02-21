"use client";

import React, { useState, useEffect } from 'react';
import { 
  PageWrapperInstrument, 
  SectionInstrument, 
  ContainerInstrument, 
  HeadingInstrument, 
  TextInstrument, 
  ButtonInstrument, 
  InputInstrument,
  LabelInstrument,
  FixedActionDockInstrument
} from '@/components/ui/LayoutInstruments';
import { BentoGrid, BentoCard } from '@/components/ui/BentoGrid';
import { VoiceglotText } from '@/components/ui/VoiceglotText';
import { useSonicDNA } from '@/lib/sonic-dna';
import { useEditMode } from '@/contexts/EditModeContext';
import { useAdminTracking } from '@/hooks/useAdminTracking';
import { 
  Settings, 
  Building2, 
  Clock, 
  Palmtree, 
  Save, 
  Shield, 
  ArrowLeft,
  Loader2,
  Globe
} from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';

/**
 *  ADMIN SETTINGS (NUCLEAR 2026)
 * 
 * Beheer van bedrijfsinformatie, algemene instellingen en vakantieregelingen.
 */
export default function AdminSettingsPage() {
  const { playClick } = useSonicDNA();
  const { isEditMode, toggleEditMode } = useEditMode();
  const { logAction } = useAdminTracking();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [configs, setConfigs] = useState<any>({
    company_info: {
      name: 'Voices.be',
      address: 'Gent, België',
      email: 'hello@voices.be',
      phone: '+32 9 000 00 00',
      vat: 'BE0000.000.000',
      iban: 'BE00 0000 0000 0000'
    },
    general_settings: {
      opening_hours: {
        mon: { active: true, start: '09:00', end: '18:00' },
        tue: { active: true, start: '09:00', end: '18:00' },
        wed: { active: true, start: '09:00', end: '18:00' },
        thu: { active: true, start: '09:00', end: '18:00' },
        fri: { active: true, start: '09:00', end: '18:00' },
        sat: { active: false, start: '09:00', end: '12:00' },
        sun: { active: false, start: '09:00', end: '12:00' }
      },
      phone_hours: {
        mon: { active: true, start: '09:00', end: '17:00' },
        tue: { active: true, start: '09:00', end: '17:00' },
        wed: { active: true, start: '09:00', end: '17:00' },
        thu: { active: true, start: '09:00', end: '17:00' },
        fri: { active: true, start: '09:00', end: '17:00' },
        sat: { active: false, start: '09:00', end: '12:00' },
        sun: { active: false, start: '09:00', end: '12:00' }
      },
      default_delivery_days: 2,
      ai_enabled: true,
      system_working_days: ['mon', 'tue', 'wed', 'thu', 'fri']
    },
    vacation_rules: {
      is_active: false,
      start_date: '',
      end_date: '',
      return_date: '',
      message_nl: 'Wij zijn momenteel met vakantie.',
      message_en: 'We are currently on vacation.'
    }
  });

  useEffect(() => {
    const fetchConfigs = async () => {
      try {
        const res = await fetch('/api/admin/config');
        if (res.ok) {
          const data = await res.json();
          if (Object.keys(data).length > 0) {
            setConfigs((prev: any) => ({ ...prev, ...data }));
          }
        }
      } catch (e) {
        console.error('Failed to fetch configs', e);
      } finally {
        setLoading(false);
      }
    };
    fetchConfigs();
  }, []);

  const handleSave = async (key: string) => {
    setSaving(true);
    playClick('pro');
    try {
      const res = await fetch('/api/admin/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key, value: configs[key] })
      });
      if (res.ok) {
        toast.success('Instellingen opgeslagen!');
        playClick('success');
        logAction('save_settings', { section: key });
      } else {
        throw new Error('Save failed');
      }
    } catch (e) {
      toast.error('Fout bij opslaan.');
    } finally {
      setSaving(false);
    }
  };

  const updateConfig = (section: string, field: string, value: any) => {
    setConfigs((prev: any) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  if (loading) return (
    <ContainerInstrument className="min-h-screen flex items-center justify-center">
      <Loader2 strokeWidth={1.5} className="animate-spin text-primary" size={40} />
    </ContainerInstrument>
  );

  return (
    <PageWrapperInstrument className="p-12 space-y-12 max-w-[1600px] mx-auto min-h-screen">
      {/* Header */}
      <SectionInstrument className="flex justify-between items-end">
        <ContainerInstrument className="space-y-4">
          <Link  href="/admin/dashboard" className="flex items-center gap-2 text-va-black/30 hover:text-primary transition-colors text-[15px] font-light tracking-widest">
            <ArrowLeft strokeWidth={1.5} size={12} /> 
            <VoiceglotText  translationKey="admin.back_to_dashboard" defaultText="Terug" />
          </Link>
          <HeadingInstrument level={1} className="text-6xl font-light tracking-tighter ">
            <VoiceglotText  translationKey="admin.settings.title" defaultText="Instellingen" />
          </HeadingInstrument>
        </ContainerInstrument>

        <ButtonInstrument 
          onClick={() => {
            playClick('pro');
            toggleEditMode();
          }}
          className={`flex items-center gap-3 px-8 py-4 rounded-2xl text-[15px] font-light uppercase tracking-widest transition-all shadow-lg ${
            isEditMode 
              ? 'bg-primary text-white shadow-primary/20 scale-105' 
              : 'bg-va-black text-white hover:bg-va-black/80'
          }`}
        >
          {isEditMode ? <Shield strokeWidth={1.5} size={14} /> : <Settings strokeWidth={1.5} size={14} />}
          {isEditMode ? (
            <VoiceglotText translationKey="admin.settings.mode_active" defaultText="Beheer-modus actief" />
          ) : (
            <VoiceglotText translationKey="admin.settings.mode_inactive" defaultText="Systeem-beheer" />
          )}
        </ButtonInstrument>
      </SectionInstrument>

      <BentoGrid strokeWidth={1.5} columns={3}>
        {/*  BEDRIJFSINFORMATIE */}
        <BentoCard span="lg" className="bg-white border border-black/5 p-10 space-y-8 rounded-[20px]">
          <ContainerInstrument className="flex items-center gap-4 border-b border-black/5 pb-6">
            <ContainerInstrument className="w-12 h-12 bg-blue-500/10 text-blue-600 rounded-[10px] flex items-center justify-center">
              <Building2 strokeWidth={1.5} size={24} />
            </ContainerInstrument>
            <ContainerInstrument>
              <HeadingInstrument level={2} className="text-xl font-light tracking-tight"><VoiceglotText  translationKey="auto.page.bedrijfsinformatie.9a8f1d" defaultText="Bedrijfsinformatie" /></HeadingInstrument>
              <TextInstrument className="text-[15px] text-va-black/40 font-light"><VoiceglotText  translationKey="auto.page.algemene_bedrijfsgeg.3e57b1" defaultText="Algemene bedrijfsgegevens voor facturatie en contact." /></TextInstrument>
            </ContainerInstrument>
          </ContainerInstrument>

          <ContainerInstrument className="grid grid-cols-2 gap-8">
            <ContainerInstrument className="space-y-4">
              <ContainerInstrument className="space-y-1">
                <LabelInstrument className="text-[11px] font-light tracking-widest text-va-black/30 uppercase"><VoiceglotText  translationKey="auto.page.bedrijfsnaam.c3f52f" defaultText="Bedrijfsnaam" /></LabelInstrument>
                <InputInstrument 
                  value={configs.company_info.name} 
                  onChange={(e) => updateConfig('company_info', 'name', e.target.value)}
                  disabled={!isEditMode}
                  className="w-full bg-va-off-white border-none rounded-[10px] py-3 px-6 text-[15px] font-light"
                />
              </ContainerInstrument>
              <ContainerInstrument className="space-y-1">
                <LabelInstrument className="text-[11px] font-light tracking-widest text-va-black/30 uppercase"><VoiceglotText  translationKey="auto.page.e_mailadres.e1486d" defaultText="E-mailadres" /></LabelInstrument>
                <InputInstrument 
                  value={configs.company_info.email} 
                  onChange={(e) => updateConfig('company_info', 'email', e.target.value)}
                  disabled={!isEditMode}
                  className="w-full bg-va-off-white border-none rounded-[10px] py-3 px-6 text-[15px] font-light"
                />
              </ContainerInstrument>
              <ContainerInstrument className="space-y-1">
                <LabelInstrument className="text-[11px] font-light tracking-widest text-va-black/30 uppercase"><VoiceglotText  translationKey="auto.page.telefoon.fe260f" defaultText="Telefoon" /></LabelInstrument>
                <InputInstrument 
                  value={configs.company_info.phone} 
                  onChange={(e) => updateConfig('company_info', 'phone', e.target.value)}
                  disabled={!isEditMode}
                  className="w-full bg-va-off-white border-none rounded-[10px] py-3 px-6 text-[15px] font-light"
                />
              </ContainerInstrument>
            </ContainerInstrument>
            <ContainerInstrument className="space-y-4">
              <ContainerInstrument className="space-y-1">
                <LabelInstrument className="text-[11px] font-light tracking-widest text-va-black/30 uppercase"><VoiceglotText  translationKey="auto.page.btw_nummer.8dc896" defaultText="BTW Nummer" /></LabelInstrument>
                <InputInstrument 
                  value={configs.company_info.vat} 
                  onChange={(e) => updateConfig('company_info', 'vat', e.target.value)}
                  disabled={!isEditMode}
                  className="w-full bg-va-off-white border-none rounded-[10px] py-3 px-6 text-[15px] font-light"
                />
              </ContainerInstrument>
              <ContainerInstrument className="space-y-1">
                <LabelInstrument className="text-[11px] font-light tracking-widest text-va-black/30 uppercase">IBAN</LabelInstrument>
                <InputInstrument 
                  value={configs.company_info.iban} 
                  onChange={(e) => updateConfig('company_info', 'iban', e.target.value)}
                  disabled={!isEditMode}
                  className="w-full bg-va-off-white border-none rounded-[10px] py-3 px-6 text-[15px] font-light"
                />
              </ContainerInstrument>
              <ContainerInstrument className="space-y-1">
                <LabelInstrument className="text-[11px] font-light tracking-widest text-va-black/30 uppercase"><VoiceglotText  translationKey="auto.page.adres.475f66" defaultText="Adres" /></LabelInstrument>
                <InputInstrument 
                  value={configs.company_info.address} 
                  onChange={(e) => updateConfig('company_info', 'address', e.target.value)}
                  disabled={!isEditMode}
                  className="w-full bg-va-off-white border-none rounded-[10px] py-3 px-6 text-[15px] font-light"
                />
              </ContainerInstrument>
            </ContainerInstrument>
          </ContainerInstrument>
        </BentoCard>

        {/*  ALGEMENE INSTELLINGEN */}
        <BentoCard span="sm" className="bg-white border border-black/5 p-10 space-y-8 rounded-[20px]">
          <ContainerInstrument className="flex items-center gap-4 border-b border-black/5 pb-6">
            <ContainerInstrument className="w-12 h-12 bg-orange-500/10 text-orange-600 rounded-[10px] flex items-center justify-center">
              <Clock strokeWidth={1.5} size={24} />
            </ContainerInstrument>
            <ContainerInstrument>
          <HeadingInstrument level={2} className="text-xl font-light tracking-tight"><VoiceglotText  translationKey="auto.page.algemeen.c132c7" defaultText="Algemeen" /></HeadingInstrument>
          <TextInstrument className="text-[15px] text-va-black/40 font-light"><VoiceglotText  translationKey="auto.page.systeem_brede_parame.6a6443" defaultText="Systeem-brede parameters." /></TextInstrument>
        </ContainerInstrument>
      </ContainerInstrument>

      <div className="pt-4 space-y-4">
        <Link href="/admin/settings/markets" className="flex items-center justify-between p-6 bg-va-off-white rounded-2xl border border-black/5 group hover:border-primary/20 transition-all">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center text-primary">
              <Globe size={20} />
            </div>
            <div className="flex flex-col">
              <span className="text-[15px] font-bold">Markt & Taal Beheer</span>
              <span className="text-[13px] text-va-black/40">Beheer actieve landen, talen en Slimme vertaling.</span>
            </div>
          </div>
          <ArrowLeft className="rotate-180 text-va-black/20 group-hover:text-primary transition-all" size={16} />
        </Link>
      </div>

      <ContainerInstrument className="space-y-6 pt-6">
            <ContainerInstrument className="space-y-3">
              <LabelInstrument className="text-[11px] font-light tracking-widest text-va-black/30 uppercase">
                <VoiceglotText translationKey="admin.settings.opening_hours" defaultText="Openingsuren (Functioneel)" />
              </LabelInstrument>
              
              <div className="space-y-2">
                {['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'].map((day) => {
                  const config = configs.general_settings.opening_hours?.[day] || { active: false, start: '09:00', end: '18:00' };
                  return (
                    <div key={day} className="flex items-center gap-3 bg-va-off-white/50 p-2 rounded-xl border border-black/[0.03]">
                      <button
                        disabled={!isEditMode}
                        onClick={() => {
                          const next = { ...configs.general_settings.opening_hours };
                          next[day] = { ...config, active: !config.active };
                          updateConfig('general_settings', 'opening_hours', next);
                        }}
                        className={cn(
                          "w-10 h-10 rounded-lg text-[10px] font-black uppercase transition-all flex items-center justify-center shrink-0",
                          config.active ? "bg-va-black text-white" : "bg-white text-va-black/20 border border-black/5"
                        )}
                      >
                        {day.substring(0, 2)}
                      </button>
                      
                      <div className={cn("flex items-center gap-2 flex-grow transition-opacity", !config.active && "opacity-30 pointer-events-none")}>
                        <input 
                          type="text"
                          value={config.start}
                          disabled={!isEditMode}
                          onChange={(e) => {
                            const next = { ...configs.general_settings.opening_hours };
                            next[day] = { ...config, start: e.target.value };
                            updateConfig('general_settings', 'opening_hours', next);
                          }}
                          className="w-16 bg-white border border-black/5 rounded-md py-1 px-2 text-[12px] font-medium text-center"
                        />
                        <span className="text-[10px] text-va-black/20 font-bold">-</span>
                        <input 
                          type="text"
                          value={config.end}
                          disabled={!isEditMode}
                          onChange={(e) => {
                            const next = { ...configs.general_settings.opening_hours };
                            next[day] = { ...config, end: e.target.value };
                            updateConfig('general_settings', 'opening_hours', next);
                          }}
                          className="w-16 bg-white border border-black/5 rounded-md py-1 px-2 text-[12px] font-medium text-center"
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </ContainerInstrument>
            <ContainerInstrument className="space-y-1">
              <LabelInstrument className="text-[11px] font-light tracking-widest text-va-black/30 uppercase"><VoiceglotText  translationKey="auto.page.standaard_levertijd_.6d07f2" defaultText="Standaard Levertijd (Dagen)" /></LabelInstrument>
              <InputInstrument 
                type="number"
                value={configs.general_settings.default_delivery_days} 
                onChange={(e) => updateConfig('general_settings', 'default_delivery_days', parseInt(e.target.value))}
                disabled={!isEditMode}
                className="w-full bg-va-off-white border-none rounded-[10px] py-3 px-6 text-[15px] font-light"
              />
            </ContainerInstrument>
            <ContainerInstrument className="flex items-center justify-between p-4 bg-va-off-white rounded-[10px]">
              <TextInstrument as="span" className="text-[13px] font-light tracking-widest text-va-black/60 uppercase"><VoiceglotText  translationKey="auto.page.ai_assistent_actief.5e9340" defaultText="AI Assistent Actief" /></TextInstrument>
              <ButtonInstrument 
                onClick={() => updateConfig('general_settings', 'ai_enabled', !configs.general_settings.ai_enabled)}
                disabled={!isEditMode}
                className={`w-10 h-6 rounded-full relative transition-all ${configs.general_settings.ai_enabled ? 'bg-primary' : 'bg-black/10'}`}
              >
                <ContainerInstrument className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${configs.general_settings.ai_enabled ? 'left-5' : 'left-1'}`} />
              </ButtonInstrument>
            </ContainerInstrument>

            {/* Voices Kalender (System Working Days) */}
            <ContainerInstrument className="space-y-3 pt-4 border-t border-black/5">
              <LabelInstrument className="text-[11px] font-light tracking-widest text-va-black/30 uppercase">
                <VoiceglotText translationKey="admin.settings.voices_calendar" defaultText="Voices Kalender (Systeem Werkdagen)" />
              </LabelInstrument>
              <ContainerInstrument className="grid grid-cols-7 gap-1">
                {['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'].map((day) => {
                  const isActive = (configs.general_settings.system_working_days || []).includes(day);
                  return (
                    <ButtonInstrument
                      key={day}
                      disabled={!isEditMode}
                      onClick={() => {
                        const current = configs.general_settings.system_working_days || [];
                        const next = isActive 
                          ? current.filter((d: string) => d !== day)
                          : [...current, day];
                        updateConfig('general_settings', 'system_working_days', next);
                      }}
                      className={`h-10 rounded-[8px] text-[11px] font-light uppercase transition-all ${
                        isActive 
                          ? 'bg-va-black text-white' 
                          : 'bg-va-off-white text-va-black/30 hover:bg-va-black/5'
                      }`}
                    >
                      {day.substring(0, 2)}
                    </ButtonInstrument>
                  );
                })}
              </ContainerInstrument>
              <TextInstrument className="text-[12px] text-va-black/30 font-light italic">
                <VoiceglotText translationKey="admin.settings.calendar_desc" defaultText="Bepaalt wanneer de admin orders kan valideren en doorsturen." />
              </TextInstrument>
            </ContainerInstrument>

            {/* Telefonische Bereikbaarheid */}
            <ContainerInstrument className="space-y-3 pt-4 border-t border-black/5">
              <LabelInstrument className="text-[11px] font-light tracking-widest text-va-black/30 uppercase">
                <VoiceglotText translationKey="admin.settings.phone_hours" defaultText="Telefonische Bereikbaarheid (Functioneel)" />
              </LabelInstrument>
              
              <div className="space-y-2">
                {['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'].map((day) => {
                  const config = configs.general_settings.phone_hours?.[day] || { active: false, start: '09:00', end: '17:00' };
                  return (
                    <div key={day} className="flex items-center gap-3 bg-va-off-white/50 p-2 rounded-xl border border-black/[0.03]">
                      <button
                        disabled={!isEditMode}
                        onClick={() => {
                          const next = { ...configs.general_settings.phone_hours };
                          next[day] = { ...config, active: !config.active };
                          updateConfig('general_settings', 'phone_hours', next);
                        }}
                        className={cn(
                          "w-10 h-10 rounded-lg text-[10px] font-black uppercase transition-all flex items-center justify-center shrink-0",
                          config.active ? "bg-blue-500 text-white" : "bg-white text-va-black/20 border border-black/5"
                        )}
                      >
                        {day.substring(0, 2)}
                      </button>
                      
                      <div className={cn("flex items-center gap-2 flex-grow transition-opacity", !config.active && "opacity-30 pointer-events-none")}>
                        <input 
                          type="text"
                          value={config.start}
                          disabled={!isEditMode}
                          onChange={(e) => {
                            const next = { ...configs.general_settings.phone_hours };
                            next[day] = { ...config, start: e.target.value };
                            updateConfig('general_settings', 'phone_hours', next);
                          }}
                          className="w-16 bg-white border border-black/5 rounded-md py-1 px-2 text-[12px] font-medium text-center"
                        />
                        <span className="text-[10px] text-va-black/20 font-bold">-</span>
                        <input 
                          type="text"
                          value={config.end}
                          disabled={!isEditMode}
                          onChange={(e) => {
                            const next = { ...configs.general_settings.phone_hours };
                            next[day] = { ...config, end: e.target.value };
                            updateConfig('general_settings', 'phone_hours', next);
                          }}
                          className="w-16 bg-white border border-black/5 rounded-md py-1 px-2 text-[12px] font-medium text-center"
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </ContainerInstrument>
          </ContainerInstrument>
        </BentoCard>

        {/*  VAKANTIEREGELING */}
        <BentoCard span="full" className="bg-va-black text-white p-12 relative overflow-hidden group rounded-[20px]">
          <ContainerInstrument className="relative z-10 grid grid-cols-1 lg:grid-cols-3 gap-12">
            <ContainerInstrument className="space-y-6">
              <ContainerInstrument className="flex items-center gap-4">
                <ContainerInstrument className="w-14 h-14 bg-primary rounded-[10px] flex items-center justify-center text-va-black shadow-lg shadow-primary/20">
                  <Palmtree strokeWidth={1.5} size={28} />
                </ContainerInstrument>
                <ContainerInstrument>
                  <HeadingInstrument level={2} className="text-2xl font-light tracking-tighter"><VoiceglotText  translationKey="auto.page.vakantieregeling.020a59" defaultText="Vakantieregeling" /></HeadingInstrument>
                  <TextInstrument className="text-white/40 text-[15px] font-light"><VoiceglotText  translationKey="auto.page.zet_het_hele_platfor.ef4021" defaultText="Zet het hele platform in &apos;Vakantie-modus&apos;." /></TextInstrument>
                </ContainerInstrument>
              </ContainerInstrument>

              <ContainerInstrument className="flex items-center justify-between p-6 bg-white/5 rounded-[10px] border border-white/10">
                <ContainerInstrument>
                  <TextInstrument className="text-[11px] font-light tracking-widest text-primary uppercase">
                    <VoiceglotText translationKey="admin.settings.status_label" defaultText="Status" />
                  </TextInstrument>
                  <TextInstrument className="text-[15px] font-light">
                    {configs.vacation_rules.is_active ? (
                      <VoiceglotText translationKey="admin.settings.vacation_active" defaultText="Vakantie-modus actief" />
                    ) : (
                      <VoiceglotText translationKey="admin.settings.platform_operational" defaultText="Platform operationeel" />
                    )}
                  </TextInstrument>
                </ContainerInstrument>
                <ButtonInstrument 
                  onClick={() => updateConfig('vacation_rules', 'is_active', !configs.vacation_rules.is_active)}
                  disabled={!isEditMode}
                  className={`w-14 h-8 rounded-full relative transition-all ${configs.vacation_rules.is_active ? 'bg-primary' : 'bg-white/10'}`}
                >
                  <ContainerInstrument className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-all ${configs.vacation_rules.is_active ? 'left-7' : 'left-1'}`} />
                </ButtonInstrument>
              </ContainerInstrument>
            </ContainerInstrument>

            <ContainerInstrument className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <ContainerInstrument className="space-y-1">
                <LabelInstrument className="text-[11px] font-light tracking-widest text-white/30 uppercase">Van</LabelInstrument>
                <InputInstrument 
                  type="text"
                  placeholder="Bijv. 1 juli"
                  value={configs.vacation_rules.start_date} 
                  onChange={(e) => updateConfig('vacation_rules', 'start_date', e.target.value)}
                  disabled={!isEditMode}
                  className="w-full bg-white/5 border-none rounded-[10px] py-3 px-6 text-[15px] font-light text-white"
                />
              </ContainerInstrument>
              <ContainerInstrument className="space-y-1">
                <LabelInstrument className="text-[11px] font-light tracking-widest text-white/30 uppercase">Tot</LabelInstrument>
                <InputInstrument 
                  type="text"
                  placeholder="Bijv. 15 juli"
                  value={configs.vacation_rules.end_date} 
                  onChange={(e) => updateConfig('vacation_rules', 'end_date', e.target.value)}
                  disabled={!isEditMode}
                  className="w-full bg-white/5 border-none rounded-[10px] py-3 px-6 text-[15px] font-light text-white"
                />
              </ContainerInstrument>
              <ContainerInstrument className="space-y-1">
                <LabelInstrument className="text-[11px] font-light tracking-widest text-white/30 uppercase"><VoiceglotText  translationKey="auto.page.terug_op.606b13" defaultText="Terug op" /></LabelInstrument>
                <InputInstrument 
                  type="text"
                  placeholder="Bijv. 16 juli"
                  value={configs.vacation_rules.return_date} 
                  onChange={(e) => updateConfig('vacation_rules', 'return_date', e.target.value)}
                  disabled={!isEditMode}
                  className="w-full bg-white/5 border-none rounded-[10px] py-3 px-6 text-[15px] font-light text-white"
                />
              </ContainerInstrument>
            </ContainerInstrument>

            <ContainerInstrument className="space-y-6">
              <ContainerInstrument className="space-y-1">
                <LabelInstrument className="text-[11px] font-light tracking-widest text-white/30 uppercase"><VoiceglotText  translationKey="auto.page.bericht__nl_.88db3f" defaultText="Bericht (NL)" /></LabelInstrument>
                <textarea 
                  value={configs.vacation_rules.message_nl} 
                  onChange={(e) => updateConfig('vacation_rules', 'message_nl', e.target.value)}
                  disabled={!isEditMode}
                  className="w-full bg-white/5 border-none rounded-[10px] py-4 px-6 text-[15px] font-light min-h-[80px] text-white resize-none outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                />
              </ContainerInstrument>
            </ContainerInstrument>
          </ContainerInstrument>
          
          <ContainerInstrument className="absolute -bottom-20 -right-20 w-96 h-96 bg-primary/10 rounded-full blur-[100px] group-hover:bg-primary/20 transition-all duration-1000" />
        </BentoCard>
      </BentoGrid>

      {isEditMode && (
        <FixedActionDockInstrument>
          <ContainerInstrument plain className="flex items-center gap-4">
            <ButtonInstrument 
              onClick={() => handleSave('company_info')}
              disabled={saving}
              className="va-btn-pro !bg-va-black flex items-center gap-2"
            >
              {saving ? <Loader2 strokeWidth={1.5} className="animate-spin" size={16} /> : <Save strokeWidth={1.5} size={16} />}
              <VoiceglotText translationKey="admin.settings.save_all" defaultText="Alle instellingen opslaan" />
            </ButtonInstrument>
            <ButtonInstrument 
              onClick={() => toggleEditMode()}
              variant="outline"
              className="border-black/10 text-va-black hover:bg-va-black/5"
            >
              <VoiceglotText translationKey="common.cancel" defaultText="Annuleren" />
            </ButtonInstrument>
          </ContainerInstrument>
        </FixedActionDockInstrument>
      )}
    </PageWrapperInstrument>
  );
}
