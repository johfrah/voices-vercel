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
  Euro, 
  Save, 
  Shield, 
  ArrowLeft,
  Loader2,
  AlertTriangle,
  Database
} from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { DEFAULT_KASSA_CONFIG } from '@/lib/pricing-engine';

/**
 *  ADMIN TELEPHONY SETTINGS (NUCLEAR 2026)
 * 
 * Beheer van telefonie tarieven en prijs-parameters.
 */
export default function AdminTelephonyPage() {
  const { playClick } = useSonicDNA();
  const { isEditMode, toggleEditMode } = useEditMode();
  const { logAction } = useAdminTracking();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [config, setConfig] = useState<any>(DEFAULT_KASSA_CONFIG);

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const res = await fetch('/api/pricing/config');
        if (res.ok) {
          const data = await res.json();
          setConfig(data);
        }
      } catch (e) {
        console.error('Failed to fetch pricing config', e);
      } finally {
        setLoading(false);
      }
    };
    fetchConfig();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    playClick('pro');
    try {
      const res = await fetch('/api/admin/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: 'pricing_config', value: config })
      });
      if (res.ok) {
        toast.success('Tarieven opgeslagen!');
        playClick('success');
        logAction('save_telephony_pricing', { config });
      } else {
        throw new Error('Save failed');
      }
    } catch (e) {
      toast.error('Fout bij opslaan.');
    } finally {
      setSaving(false);
    }
  };

  const updateConfig = (field: string, value: any) => {
    setConfig((prev: any) => ({
      ...prev,
      [field]: value
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
          <Link href="/admin/dashboard" className="flex items-center gap-2 text-va-black/30 hover:text-primary transition-colors text-[15px] font-light tracking-widest">
            <ArrowLeft strokeWidth={1.5} size={12} /> 
            <VoiceglotText translationKey="admin.back_to_dashboard" defaultText="Terug" />
          </Link>
          <HeadingInstrument level={1} className="text-6xl font-light tracking-tighter ">
            <VoiceglotText translationKey="admin.telephony.title" defaultText="Telefonie Tarieven" />
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
          {isEditMode ? "Beheer-modus actief" : "Systeem-beheer"}
        </ButtonInstrument>
      </SectionInstrument>

      {/* Warning */}
      {!isEditMode && (
        <ContainerInstrument className="p-6 bg-amber-500/5 border border-amber-500/10 rounded-[20px] flex items-center gap-4">
          <AlertTriangle className="text-amber-500" size={24} />
          <TextInstrument className="text-[15px] text-amber-900/60 font-medium">
            Je bekijkt de huidige tarieven. Activeer de beheer-modus om wijzigingen aan te brengen.
          </TextInstrument>
        </ContainerInstrument>
      )}

      <BentoGrid strokeWidth={1.5} columns={3}>
        {/* STANDAARD TARIEVEN */}
        <BentoCard span="lg" className="bg-white border border-black/5 p-10 space-y-8 rounded-[20px]">
          <ContainerInstrument className="flex items-center gap-4 border-b border-black/5 pb-6">
            <ContainerInstrument className="w-12 h-12 bg-primary/10 text-primary rounded-[10px] flex items-center justify-center">
              <Euro strokeWidth={1.5} size={24} />
            </ContainerInstrument>
            <ContainerInstrument>
              <HeadingInstrument level={2} className="text-xl font-light tracking-tight">Standaard Telefonie</HeadingInstrument>
              <TextInstrument className="text-[15px] text-va-black/40 font-light">Basis tarieven voor telefonie opnames.</TextInstrument>
            </ContainerInstrument>
          </ContainerInstrument>

          <ContainerInstrument className="grid grid-cols-2 gap-8">
            <ContainerInstrument className="space-y-4">
              <ContainerInstrument className="space-y-1">
                <LabelInstrument className="text-[11px] font-light tracking-widest text-va-black/30 uppercase">Basis Prijs (Centen)</LabelInstrument>
                <InputInstrument 
                  type="number"
                  value={config.telephonyBasePrice} 
                  onChange={(e) => updateConfig('telephonyBasePrice', parseInt(e.target.value))}
                  disabled={!isEditMode}
                  className="w-full bg-va-off-white border-none rounded-[10px] py-3 px-6 text-[15px] font-light"
                />
                <TextInstrument className="text-[11px] text-va-black/20 italic">Huidig: {config.telephonyBasePrice / 100} EUR</TextInstrument>
              </ContainerInstrument>
              <ContainerInstrument className="space-y-1">
                <LabelInstrument className="text-[11px] font-light tracking-widest text-va-black/30 uppercase">Setup Fee (Centen)</LabelInstrument>
                <InputInstrument 
                  type="number"
                  value={config.telephonySetupFee} 
                  onChange={(e) => updateConfig('telephonySetupFee', parseInt(e.target.value))}
                  disabled={!isEditMode}
                  className="w-full bg-va-off-white border-none rounded-[10px] py-3 px-6 text-[15px] font-light"
                />
                <TextInstrument className="text-[11px] text-va-black/20 italic">Huidig: {config.telephonySetupFee / 100} EUR</TextInstrument>
              </ContainerInstrument>
            </ContainerInstrument>
            <ContainerInstrument className="space-y-4">
              <ContainerInstrument className="space-y-1">
                <LabelInstrument className="text-[11px] font-light tracking-widest text-va-black/30 uppercase">Woord Tarief (Centen)</LabelInstrument>
                <InputInstrument 
                  type="number"
                  value={config.telephonyWordPrice} 
                  onChange={(e) => updateConfig('telephonyWordPrice', parseInt(e.target.value))}
                  disabled={!isEditMode}
                  className="w-full bg-va-off-white border-none rounded-[10px] py-3 px-6 text-[15px] font-light"
                />
                <TextInstrument className="text-[11px] text-va-black/20 italic">Huidig: {config.telephonyWordPrice / 100} EUR</TextInstrument>
              </ContainerInstrument>
              <ContainerInstrument className="space-y-1">
                <LabelInstrument className="text-[11px] font-light tracking-widest text-va-black/30 uppercase">Woord Threshold</LabelInstrument>
                <InputInstrument 
                  type="number"
                  value={config.telephonyWordThreshold} 
                  onChange={(e) => updateConfig('telephonyWordThreshold', parseInt(e.target.value))}
                  disabled={!isEditMode}
                  className="w-full bg-va-off-white border-none rounded-[10px] py-3 px-6 text-[15px] font-light"
                />
              </ContainerInstrument>
            </ContainerInstrument>
          </ContainerInstrument>
        </BentoCard>

        {/* BULK TARIEVEN */}
        <BentoCard span="sm" className="bg-white border border-black/5 p-10 space-y-8 rounded-[20px]">
          <ContainerInstrument className="flex items-center gap-4 border-b border-black/5 pb-6">
            <ContainerInstrument className="w-12 h-12 bg-va-black/5 text-va-black rounded-[10px] flex items-center justify-center">
              <Database strokeWidth={1.5} size={24} />
            </ContainerInstrument>
            <ContainerInstrument>
              <HeadingInstrument level={2} className="text-xl font-light tracking-tight">Bulk Telefonie</HeadingInstrument>
              <TextInstrument className="text-[15px] text-va-black/40 font-light">Tarieven voor grote volumes.</TextInstrument>
            </ContainerInstrument>
          </ContainerInstrument>

          <ContainerInstrument className="space-y-6">
            <ContainerInstrument className="space-y-1">
              <LabelInstrument className="text-[11px] font-light tracking-widest text-va-black/30 uppercase">Bulk Threshold (Woorden)</LabelInstrument>
              <InputInstrument 
                type="number"
                value={config.telephonyBulkThreshold} 
                onChange={(e) => updateConfig('telephonyBulkThreshold', parseInt(e.target.value))}
                disabled={!isEditMode}
                className="w-full bg-va-off-white border-none rounded-[10px] py-3 px-6 text-[15px] font-light"
              />
            </ContainerInstrument>
            <ContainerInstrument className="space-y-1">
              <LabelInstrument className="text-[11px] font-light tracking-widest text-va-black/30 uppercase">Bulk Basis Prijs (Centen)</LabelInstrument>
              <InputInstrument 
                type="number"
                value={config.telephonyBulkBasePrice} 
                onChange={(e) => updateConfig('telephonyBulkBasePrice', parseInt(e.target.value))}
                disabled={!isEditMode}
                className="w-full bg-va-off-white border-none rounded-[10px] py-3 px-6 text-[15px] font-light"
              />
              <TextInstrument className="text-[11px] text-va-black/20 italic">Huidig: {config.telephonyBulkBasePrice / 100} EUR</TextInstrument>
            </ContainerInstrument>
            <ContainerInstrument className="space-y-1">
              <LabelInstrument className="text-[11px] font-light tracking-widest text-va-black/30 uppercase">Bulk Woord Tarief (Centen)</LabelInstrument>
              <InputInstrument 
                type="number"
                value={config.telephonyBulkWordRate} 
                onChange={(e) => updateConfig('telephonyBulkWordRate', parseInt(e.target.value))}
                disabled={!isEditMode}
                className="w-full bg-va-off-white border-none rounded-[10px] py-3 px-6 text-[15px] font-light"
              />
              <TextInstrument className="text-[11px] text-va-black/20 italic">Huidig: {config.telephonyBulkWordRate / 100} EUR</TextInstrument>
            </ContainerInstrument>
          </ContainerInstrument>
        </BentoCard>

        {/* OVERIGE TARIEVEN */}
        <BentoCard span="full" className="bg-va-off-white p-12 rounded-[20px]">
          <ContainerInstrument className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <ContainerInstrument className="space-y-6">
              <HeadingInstrument level={2} className="text-xl font-light tracking-tight">Extra Opties</HeadingInstrument>
              <ContainerInstrument className="space-y-4">
                <ContainerInstrument className="space-y-1">
                  <LabelInstrument className="text-[11px] font-light tracking-widest text-va-black/30 uppercase">Muziek Surcharge (Centen)</LabelInstrument>
                  <InputInstrument 
                    type="number"
                    value={config.musicSurcharge} 
                    onChange={(e) => updateConfig('musicSurcharge', parseInt(e.target.value))}
                    disabled={!isEditMode}
                    className="w-full bg-white border-none rounded-[10px] py-3 px-6 text-[15px] font-light"
                  />
                </ContainerInstrument>
                <ContainerInstrument className="space-y-1">
                  <LabelInstrument className="text-[11px] font-light tracking-widest text-va-black/30 uppercase">Live Session Surcharge (Centen)</LabelInstrument>
                  <InputInstrument 
                    type="number"
                    value={config.liveSessionSurcharge} 
                    onChange={(e) => updateConfig('liveSessionSurcharge', parseInt(e.target.value))}
                    disabled={!isEditMode}
                    className="w-full bg-white border-none rounded-[10px] py-3 px-6 text-[15px] font-light"
                  />
                </ContainerInstrument>
              </ContainerInstrument>
            </ContainerInstrument>

            <ContainerInstrument className="space-y-6">
              <HeadingInstrument level={2} className="text-xl font-light tracking-tight">Platform Tarieven</HeadingInstrument>
              <ContainerInstrument className="space-y-4">
                <ContainerInstrument className="space-y-1">
                  <LabelInstrument className="text-[11px] font-light tracking-widest text-va-black/30 uppercase">Video Basis Prijs (Centen)</LabelInstrument>
                  <InputInstrument 
                    type="number"
                    value={config.videoBasePrice} 
                    onChange={(e) => updateConfig('videoBasePrice', parseInt(e.target.value))}
                    disabled={!isEditMode}
                    className="w-full bg-white border-none rounded-[10px] py-3 px-6 text-[15px] font-light"
                  />
                </ContainerInstrument>
                <ContainerInstrument className="space-y-1">
                  <LabelInstrument className="text-[11px] font-light tracking-widest text-va-black/30 uppercase">Standaard Basis Prijs (Centen)</LabelInstrument>
                  <InputInstrument 
                    type="number"
                    value={config.basePrice} 
                    onChange={(e) => updateConfig('basePrice', parseInt(e.target.value))}
                    disabled={!isEditMode}
                    className="w-full bg-white border-none rounded-[10px] py-3 px-6 text-[15px] font-light"
                  />
                </ContainerInstrument>
              </ContainerInstrument>
            </ContainerInstrument>

            <ContainerInstrument className="space-y-6">
              <HeadingInstrument level={2} className="text-xl font-light tracking-tight">Fiscaal</HeadingInstrument>
              <ContainerInstrument className="space-y-4">
                <ContainerInstrument className="space-y-1">
                  <LabelInstrument className="text-[11px] font-light tracking-widest text-va-black/30 uppercase">BTW Tarief (bijv. 0.21)</LabelInstrument>
                  <InputInstrument 
                    type="number"
                    step="0.01"
                    value={config.vatRate} 
                    onChange={(e) => updateConfig('vatRate', parseFloat(e.target.value))}
                    disabled={!isEditMode}
                    className="w-full bg-white border-none rounded-[10px] py-3 px-6 text-[15px] font-light"
                  />
                </ContainerInstrument>
              </ContainerInstrument>
            </ContainerInstrument>
          </ContainerInstrument>
        </BentoCard>
      </BentoGrid>

      {isEditMode && (
        <FixedActionDockInstrument>
          <ContainerInstrument plain className="flex items-center gap-4">
            <ButtonInstrument 
              onClick={handleSave}
              disabled={saving}
              className="va-btn-pro !bg-va-black flex items-center gap-2"
            >
              {saving ? <Loader2 strokeWidth={1.5} className="animate-spin" size={16} /> : <Save strokeWidth={1.5} size={16} />}
              Tarieven Opslaan
            </ButtonInstrument>
            <ButtonInstrument 
              onClick={() => toggleEditMode()}
              variant="outline"
              className="border-black/10 text-va-black hover:bg-va-black/5"
            >
              Annuleren
            </ButtonInstrument>
          </ContainerInstrument>
        </FixedActionDockInstrument>
      )}
    </PageWrapperInstrument>
  );
}
