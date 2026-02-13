"use client";

import React, { useState, useEffect } from 'react';
import { 
  PageWrapperInstrument, 
  SectionInstrument, 
  ContainerInstrument, 
  HeadingInstrument, 
  TextInstrument, 
  ButtonInstrument, 
  InputInstrument 
} from '@/components/ui/LayoutInstruments';
import { BentoGrid, BentoCard } from '@/components/ui/BentoGrid';
import { VoiceglotText } from '@/components/ui/VoiceglotText';
import { useSonicDNA } from '@/lib/sonic-dna';
import { useEditMode } from '@/contexts/EditModeContext';
import { 
  Settings, 
  Building2, 
  Clock, 
  Palmtree, 
  Save, 
  Shield, 
  ArrowLeft,
  Loader2,
  CheckCircle2
} from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';

/**
 * ⚙️ ADMIN SETTINGS (NUCLEAR 2026)
 * 
 * Beheer van bedrijfsinformatie, algemene instellingen en vakantieregelingen.
 */
export default function AdminSettingsPage() {
  const { playClick } = useSonicDNA();
  const { isEditMode, toggleEditMode } = useEditMode();
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
      opening_hours: '09:00 - 18:00',
      default_delivery_days: 2,
      ai_enabled: true
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
    <div className="min-h-screen flex items-center justify-center">
      <Loader2 className="animate-spin text-primary" size={40} />
    </div>
  );

  return (
    <PageWrapperInstrument className="p-12 space-y-12 max-w-[1600px] mx-auto min-h-screen">
      {/* Header */}
      <SectionInstrument className="flex justify-between items-end">
        <ContainerInstrument className="space-y-4">
          <Link href="/admin/dashboard" className="flex items-center gap-2 text-va-black/30 hover:text-primary transition-colors text-[15px] font-black tracking-widest">
            <ArrowLeft size={12} /> 
            <VoiceglotText translationKey="admin.back_to_cockpit" defaultText="Terug" />
          </Link>
          <HeadingInstrument level={1} className="text-6xl font-black tracking-tighter ">
            <VoiceglotText translationKey="admin.settings.title" defaultText="Instellingen" />
          </HeadingInstrument>
        </ContainerInstrument>

        <ButtonInstrument 
          onClick={() => {
            playClick('pro');
            toggleEditMode();
          }}
          className={`flex items-center gap-3 px-8 py-4 rounded-2xl text-[15px] font-black uppercase tracking-widest transition-all shadow-lg ${
            isEditMode 
              ? 'bg-primary text-white shadow-primary/20 scale-105' 
              : 'bg-va-black text-white hover:bg-va-black/80'
          }`}
        >
          {isEditMode ? <Shield size={14} /> : <Settings size={14} />}
          {isEditMode ? 'Beheer Modus Actief' : 'Systeem Beheer'}
        </ButtonInstrument>
      </SectionInstrument>

      <BentoGrid columns={3}>
        {/* 🏢 BEDRIJFSINFORMATIE */}
        <BentoCard span="lg" className="bg-white border border-black/5 p-10 space-y-8">
          <ContainerInstrument className="flex items-center gap-4 border-b border-black/5 pb-6">
            <div className="w-12 h-12 bg-blue-500/10 text-blue-600 rounded-2xl flex items-center justify-center">
              <Building2 strokeWidth={1.5} size={24} />
            </div>
            <div>
              <HeadingInstrument level={2} className="text-xl font-black tracking-tight">Bedrijfsinformatie</HeadingInstrument>
              <TextInstrument className="text-[15px] text-va-black/40 font-medium">Algemene bedrijfsgegevens voor facturatie en contact.</TextInstrument>
            </div>
          </ContainerInstrument>

          <div className="grid grid-cols-2 gap-8">
            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-[15px] font-black tracking-widest text-va-black/30 ml-4">Bedrijfsnaam</label>
                <InputInstrument 
                  value={configs.company_info.name} 
                  onChange={(e) => updateConfig('company_info', 'name', e.target.value)}
                  disabled={!isEditMode}
                  className="w-full bg-va-off-white border-none rounded-xl py-3 px-6 text-sm font-bold"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[15px] font-black tracking-widest text-va-black/30 ml-4">E-mailadres</label>
                <InputInstrument 
                  value={configs.company_info.email} 
                  onChange={(e) => updateConfig('company_info', 'email', e.target.value)}
                  disabled={!isEditMode}
                  className="w-full bg-va-off-white border-none rounded-xl py-3 px-6 text-sm font-bold"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[15px] font-black tracking-widest text-va-black/30 ml-4">Telefoon</label>
                <InputInstrument 
                  value={configs.company_info.phone} 
                  onChange={(e) => updateConfig('company_info', 'phone', e.target.value)}
                  disabled={!isEditMode}
                  className="w-full bg-va-off-white border-none rounded-xl py-3 px-6 text-sm font-bold"
                />
              </div>
            </div>
            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-[15px] font-black tracking-widest text-va-black/30 ml-4">BTW Nummer</label>
                <InputInstrument 
                  value={configs.company_info.vat} 
                  onChange={(e) => updateConfig('company_info', 'vat', e.target.value)}
                  disabled={!isEditMode}
                  className="w-full bg-va-off-white border-none rounded-xl py-3 px-6 text-sm font-bold"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[15px] font-black tracking-widest text-va-black/30 ml-4">IBAN</label>
                <InputInstrument 
                  value={configs.company_info.iban} 
                  onChange={(e) => updateConfig('company_info', 'iban', e.target.value)}
                  disabled={!isEditMode}
                  className="w-full bg-va-off-white border-none rounded-xl py-3 px-6 text-sm font-bold"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[15px] font-black tracking-widest text-va-black/30 ml-4">Adres</label>
                <InputInstrument 
                  value={configs.company_info.address} 
                  onChange={(e) => updateConfig('company_info', 'address', e.target.value)}
                  disabled={!isEditMode}
                  className="w-full bg-va-off-white border-none rounded-xl py-3 px-6 text-sm font-bold"
                />
              </div>
            </div>
          </div>

          {isEditMode && (
            <ButtonInstrument 
              onClick={() => handleSave('company_info')}
              disabled={saving}
              className="va-btn-pro !bg-va-black w-full flex items-center justify-center gap-2"
            >
              {saving ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
              Bedrijfsinfo Opslaan
            </ButtonInstrument>
          )}
        </BentoCard>

        {/* 🕒 ALGEMENE INSTELLINGEN */}
        <BentoCard span="sm" className="bg-white border border-black/5 p-10 space-y-8">
          <ContainerInstrument className="flex items-center gap-4 border-b border-black/5 pb-6">
            <div className="w-12 h-12 bg-orange-500/10 text-orange-600 rounded-2xl flex items-center justify-center">
              <Clock size={24} />
            </div>
            <div>
              <HeadingInstrument level={2} className="text-xl font-black tracking-tight">Algemeen</HeadingInstrument>
              <TextInstrument className="text-[15px] text-va-black/40 font-medium">Systeem-brede parameters.</TextInstrument>
            </div>
          </ContainerInstrument>

          <div className="space-y-6">
            <div className="space-y-1">
              <label className="text-[15px] font-black tracking-widest text-va-black/30 ml-4">Openingsuren</label>
              <InputInstrument 
                value={configs.general_settings.opening_hours} 
                onChange={(e) => updateConfig('general_settings', 'opening_hours', e.target.value)}
                disabled={!isEditMode}
                className="w-full bg-va-off-white border-none rounded-xl py-3 px-6 text-sm font-bold"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[15px] font-black tracking-widest text-va-black/30 ml-4">Standaard Levertijd (Dagen)</label>
              <InputInstrument 
                type="number"
                value={configs.general_settings.default_delivery_days} 
                onChange={(e) => updateConfig('general_settings', 'default_delivery_days', parseInt(e.target.value))}
                disabled={!isEditMode}
                className="w-full bg-va-off-white border-none rounded-xl py-3 px-6 text-sm font-bold"
              />
            </div>
            <div className="flex items-center justify-between p-4 bg-va-off-white rounded-2xl">
              <span className="text-[15px] font-black tracking-widest text-va-black/60">AI Assistent Actief</span>
              <button 
                onClick={() => updateConfig('general_settings', 'ai_enabled', !configs.general_settings.ai_enabled)}
                disabled={!isEditMode}
                className={`w-10 h-6 rounded-full relative transition-all ${configs.general_settings.ai_enabled ? 'bg-primary' : 'bg-black/10'}`}
              >
                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${configs.general_settings.ai_enabled ? 'left-5' : 'left-1'}`} />
              </button>
            </div>
          </div>

          {isEditMode && (
            <ButtonInstrument 
              onClick={() => handleSave('general_settings')}
              disabled={saving}
              className="va-btn-pro !bg-va-black w-full flex items-center justify-center gap-2"
            >
              {saving ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
              Instellingen Opslaan
            </ButtonInstrument>
          )}
        </BentoCard>

        {/* 🌴 VAKANTIEREGELING */}
        <BentoCard span="full" className="bg-va-black text-white p-12 relative overflow-hidden group">
          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-3 gap-12">
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-primary rounded-2xl flex items-center justify-center text-va-black shadow-lg shadow-primary/20">
                  <Palmtree size={28} />
                </div>
                <div>
                  <HeadingInstrument level={2} className="text-2xl font-black tracking-tighter">Vakantieregeling</HeadingInstrument>
                  <TextInstrument className="text-white/40 text-[15px] font-medium">Zet het hele platform in &apos;Vakantie-modus&apos;.</TextInstrument>
                </div>
              </div>

              <div className="flex items-center justify-between p-6 bg-white/5 rounded-3xl border border-white/10">
                <div>
                  <TextInstrument className="text-[15px] font-black tracking-widest text-primary">Status</TextInstrument>
                  <TextInstrument className="text-sm font-bold">{configs.vacation_rules.is_active ? 'Vakantie Modus ACTIEF' : 'Platform Operationeel'}</TextInstrument>
                </div>
                <button 
                  onClick={() => updateConfig('vacation_rules', 'is_active', !configs.vacation_rules.is_active)}
                  disabled={!isEditMode}
                  className={`w-14 h-8 rounded-full relative transition-all ${configs.vacation_rules.is_active ? 'bg-primary' : 'bg-white/10'}`}
                >
                  <div className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-all ${configs.vacation_rules.is_active ? 'left-7' : 'left-1'}`} />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-1">
                <label className="text-[15px] font-black tracking-widest text-white/30 ml-4">Van</label>
                <InputInstrument 
                  type="text"
                  placeholder="Bijv. 1 juli"
                  value={configs.vacation_rules.start_date} 
                  onChange={(e) => updateConfig('vacation_rules', 'start_date', e.target.value)}
                  disabled={!isEditMode}
                  className="w-full bg-white/5 border-none rounded-xl py-3 px-6 text-sm font-bold text-white"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[15px] font-black tracking-widest text-white/30 ml-4">Tot</label>
                <InputInstrument 
                  type="text"
                  placeholder="Bijv. 15 juli"
                  value={configs.vacation_rules.end_date} 
                  onChange={(e) => updateConfig('vacation_rules', 'end_date', e.target.value)}
                  disabled={!isEditMode}
                  className="w-full bg-white/5 border-none rounded-xl py-3 px-6 text-sm font-bold text-white"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[15px] font-black tracking-widest text-white/30 ml-4">Terug op</label>
                <InputInstrument 
                  type="text"
                  placeholder="Bijv. 16 juli"
                  value={configs.vacation_rules.return_date} 
                  onChange={(e) => updateConfig('vacation_rules', 'return_date', e.target.value)}
                  disabled={!isEditMode}
                  className="w-full bg-white/5 border-none rounded-xl py-3 px-6 text-sm font-bold text-white"
                />
              </div>
            </div>

            <div className="space-y-6">
              <div className="space-y-1">
                <label className="text-[15px] font-black tracking-widest text-white/30 ml-4">Bericht (NL)</label>
                <textarea 
                  value={configs.vacation_rules.message_nl} 
                  onChange={(e) => updateConfig('vacation_rules', 'message_nl', e.target.value)}
                  disabled={!isEditMode}
                  className="w-full bg-white/5 border-none rounded-2xl py-4 px-6 text-sm font-medium min-h-[80px] text-white resize-none outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                />
              </div>
              {isEditMode && (
                <ButtonInstrument 
                  onClick={() => handleSave('vacation_rules')}
                  disabled={saving}
                  className="va-btn-pro !bg-primary !text-va-black w-full flex items-center justify-center gap-2"
                >
                  {saving ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
                  Vakantieregeling Activeren
                </ButtonInstrument>
              )}
            </div>
          </div>
          
          <div className="absolute -bottom-20 -right-20 w-96 h-96 bg-primary/10 rounded-full blur-[100px] group-hover:bg-primary/20 transition-all duration-1000" />
        </BentoCard>
      </BentoGrid>
    </PageWrapperInstrument>
  );
}
