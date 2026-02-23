"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ButtonInstrument, 
  ContainerInstrument, 
  HeadingInstrument, 
  InputInstrument, 
  LabelInstrument, 
  TextInstrument,
  SelectInstrument,
  OptionInstrument
} from '@/components/ui/LayoutInstruments';
import { VoiceglotText } from '@/components/ui/VoiceglotText';
import { useTranslation } from '@/contexts/TranslationContext';
import { 
  User, 
  Globe, 
  Mic2, 
  ChevronRight, 
  ChevronLeft, 
  Check,
  Languages,
  Sparkles,
  Clock,
  AlertCircle
} from 'lucide-react';
import { cn } from '@/lib/utils/utils';

/**
 *  CHRIS-PROTOCOL: ActorProfileForm (God Mode 2026)
 * Master component voor Signup & Settings.
 * Volgt Progressive Disclosure & Island Filosofie.
 */

interface Taxonomy {
  languages: any[];
  tones: any[];
  countries: any[];
}

interface ActorProfileFormProps {
  initialData?: any;
  mode: 'signup' | 'settings';
  onSave: (data: any) => Promise<void>;
}

export const ActorProfileForm = ({ initialData, mode, onSave }: ActorProfileFormProps) => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    firstName: initialData?.first_name || '',
    lastName: initialData?.last_name || '',
    gender: initialData?.gender || '',
    countryId: initialData?.country_id || '',
    nativeLangId: initialData?.native_lang_id || '',
    extraLangIds: initialData?.extra_lang_ids || [] as number[],
    toneIds: initialData?.tone_ids || [] as number[],
    deliveryDaysMin: initialData?.deliveryDaysMin || 1,
    deliveryDaysMax: initialData?.deliveryDaysMax || 3,
    cutoffTime: initialData?.cutoffTime || '18:00',
    allowFreeTrial: initialData?.allowFreeTrial ?? true,
    ...initialData
  });

  const [taxonomies, setTaxonomies] = useState<Taxonomy>({
    languages: [],
    tones: [],
    countries: []
  });

  const [loading, setLoading] = useState(true);
  const { t } = useTranslation();

  useEffect(() => {
    async function loadTaxonomies() {
      try {
        const res = await fetch('/api/taxonomies');
        const data = await res.json();
        setTaxonomies(data);
      } catch (err) {
        console.error('Failed to load taxonomies:', err);
      } finally {
        setLoading(false);
      }
    }
    loadTaxonomies();
  }, []);

  const updateField = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const toggleSelection = (field: 'extraLangIds' | 'toneIds', id: number) => {
    setFormData(prev => {
      const current = prev[field] as number[];
      const next = current.includes(id) 
        ? current.filter(i => i !== id)
        : [...current, id];
      return { ...prev, [field]: next };
    });
  };

  const nextStep = () => setStep(s => s + 1);
  const prevStep = () => setStep(s => s - 1);

  const vaBezier = [0.23, 1, 0.32, 1];

  if (loading) return <div className="p-20 text-center font-light opacity-40">
    <VoiceglotText translationKey="form.loading_taxonomies" defaultText="Laden van Master Taxonomies..." />
  </div>;

  return (
    <ContainerInstrument plain className="max-w-4xl mx-auto">
      {/*  Progress Indicator */}
      <ContainerInstrument plain className="flex justify-between mb-12 px-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="flex flex-col items-center gap-2 group">
            <div className={cn(
              "w-10 h-10 rounded-full flex items-center justify-center transition-all duration-500 border",
              step >= i ? "bg-primary border-primary text-white shadow-aura" : "bg-white border-black/10 text-va-black/20"
            )}>
              {step > i ? <Check size={16} strokeWidth={3} /> : i}
            </div>
            <TextInstrument className={cn(
              "text-[11px] tracking-widest uppercase transition-colors duration-500",
              step >= i ? "text-primary font-medium" : "text-va-black/20"
            )}>
              {i === 1 && <VoiceglotText translationKey="form.step.identity" defaultText="Identiteit" />}
              {i === 2 && <VoiceglotText translationKey="form.step.languages" defaultText="Talen" />}
              {i === 3 && <VoiceglotText translationKey="form.step.character" defaultText="Karakter" />}
              {i === 4 && <VoiceglotText translationKey="form.step.delivery" defaultText="Levering" />}
            </TextInstrument>
          </div>
        ))}
      </ContainerInstrument>

      <AnimatePresence mode="wait">
        {step === 1 && (
          <motion.div
            key="step1"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.6, ease: vaBezier }}
            className="bg-white p-12 rounded-[40px] shadow-aura border border-black/[0.02] space-y-8"
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
                <User size={24} strokeWidth={1.5} />
              </div>
              <div>
                <HeadingInstrument level={2} className="text-3xl tracking-tighter">
                  <VoiceglotText translationKey="form.identity.title" defaultText="Wie ben je?" />
                </HeadingInstrument>
                <TextInstrument className="text-va-black/40">
                  <VoiceglotText translationKey="form.identity.subtitle" defaultText="Laten we beginnen met de basis." />
                </TextInstrument>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <LabelInstrument>
                  <VoiceglotText translationKey="form.label.first_name" defaultText="Voornaam" />
                </LabelInstrument>
                <InputInstrument 
                  value={formData.firstName}
                  onChange={(e) => updateField('firstName', e.target.value)}
                  placeholder={t('form.placeholder.first_name_example', "Bijv. Serge")}
                />
              </div>
              <div className="space-y-2">
                <LabelInstrument>
                  <VoiceglotText translationKey="form.label.last_name" defaultText="Achternaam" />
                </LabelInstrument>
                <InputInstrument 
                  value={formData.lastName}
                  onChange={(e) => updateField('lastName', e.target.value)}
                  placeholder={t('form.placeholder.last_name_example', "Bijv. Heyninck")}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <LabelInstrument>
                  <VoiceglotText translationKey="form.label.gender" defaultText="Geslacht" />
                </LabelInstrument>
                <SelectInstrument 
                  value={formData.gender}
                  onChange={(e) => updateField('gender', e.target.value)}
                  className="w-full"
                >
                  <OptionInstrument value="">{t('form.placeholder.gender', "Kies geslacht...")}</OptionInstrument>
                  <OptionInstrument value="male">{t('common.gender.male', "Mannelijk")}</OptionInstrument>
                  <OptionInstrument value="female">{t('common.gender.female', "Vrouwelijk")}</OptionInstrument>
                  <OptionInstrument value="non-binary">{t('common.gender.non_binary', "Non-binair")}</OptionInstrument>
                </SelectInstrument>
              </div>
              <div className="space-y-2">
                <LabelInstrument>
                  <VoiceglotText translationKey="form.label.country" defaultText="Uitzendgebied (Land)" />
                </LabelInstrument>
                <SelectInstrument 
                  value={formData.countryId}
                  onChange={(e) => updateField('countryId', e.target.value)}
                  className="w-full"
                >
                  <OptionInstrument value="">{t('form.placeholder.country', "Kies land...")}</OptionInstrument>
                  {taxonomies.countries.map(c => (
                    <OptionInstrument key={c.id} value={c.id}>{c.label}</OptionInstrument>
                  ))}
                </SelectInstrument>
              </div>
            </div>

            <div className="pt-8 flex justify-end">
              <ButtonInstrument onClick={nextStep} className="va-btn-pro group">
                <VoiceglotText translationKey="common.next_step" defaultText="Volgende stap" />
                <ChevronRight size={18} className="ml-2 group-hover:translate-x-1 transition-transform" />
              </ButtonInstrument>
            </div>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div
            key="step2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.6, ease: vaBezier }}
            className="bg-white p-12 rounded-[40px] shadow-aura border border-black/[0.02] space-y-8"
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
                <Languages size={24} strokeWidth={1.5} />
              </div>
              <div>
                <HeadingInstrument level={2} className="text-3xl tracking-tighter">
                  <VoiceglotText translationKey="form.linguistics.title" defaultText="Lingustiek" />
                </HeadingInstrument>
                <TextInstrument className="text-va-black/40">
                  <VoiceglotText translationKey="form.linguistics.subtitle" defaultText="In welke talen blink je uit?" />
                </TextInstrument>
              </div>
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <LabelInstrument>
                  <VoiceglotText translationKey="form.label.native_language" defaultText="Wat is je moedertaal?" />
                </LabelInstrument>
                <SelectInstrument 
                  value={formData.nativeLangId}
                  onChange={(e) => updateField('nativeLangId', e.target.value)}
                  className="w-full"
                >
                  <OptionInstrument value="">{t('form.placeholder.native_language', "Kies je moedertaal...")}</OptionInstrument>
                  {taxonomies.languages.map(l => (
                    <OptionInstrument key={l.id} value={l.id}>{l.label}</OptionInstrument>
                  ))}
                </SelectInstrument>
              </div>

              {formData.nativeLangId && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-4 pt-4 border-t border-black/[0.03]"
                >
                  <LabelInstrument>
                    <VoiceglotText translationKey="form.label.extra_languages" defaultText="Welke andere talen spreek je vloeiend?" />
                  </LabelInstrument>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {taxonomies.languages
                      .filter(l => l.id.toString() !== formData.nativeLangId.toString() && !l.isNativeOnly)
                      .map(l => {
                        const isSelected = formData.extraLangIds.includes(l.id);
                        return (
                          <button
                            key={l.id}
                            onClick={() => toggleSelection('extraLangIds', l.id)}
                            className={cn(
                              "px-4 py-3 rounded-xl border text-[14px] font-light transition-all duration-300 text-left flex items-center justify-between group",
                              isSelected 
                                ? "bg-primary border-primary text-white shadow-md" 
                                : "bg-va-off-white border-transparent text-va-black/60 hover:border-primary/20"
                            )}
                          >
                            {l.label}
                            {isSelected && <Check size={14} />}
                          </button>
                        );
                      })}
                  </div>
                </motion.div>
              )}
            </div>

            <div className="pt-8 flex justify-between">
              <ButtonInstrument variant="ghost" onClick={prevStep} className="text-va-black/40 hover:text-va-black">
                <ChevronLeft size={18} className="mr-2" />
                <VoiceglotText translationKey="common.previous" defaultText="Vorige" />
              </ButtonInstrument>
              <ButtonInstrument onClick={nextStep} className="va-btn-pro group">
                <VoiceglotText translationKey="common.next_step" defaultText="Volgende stap" />
                <ChevronRight size={18} className="ml-2 group-hover:translate-x-1 transition-transform" />
              </ButtonInstrument>
            </div>
          </motion.div>
        )}

        {step === 3 && (
          <motion.div
            key="step3"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.6, ease: vaBezier }}
            className="bg-white p-12 rounded-[40px] shadow-aura border border-black/[0.02] space-y-8"
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
                <Sparkles size={24} strokeWidth={1.5} />
              </div>
              <div>
                <HeadingInstrument level={2} className="text-3xl tracking-tighter">
                  <VoiceglotText translationKey="form.character.title" defaultText="Karakter & Toon" />
                </HeadingInstrument>
                <TextInstrument className="text-va-black/40">
                  <VoiceglotText translationKey="form.character.subtitle" defaultText="Hoe omschrijven klanten jouw stem?" />
                </TextInstrument>
              </div>
            </div>

            <div className="space-y-4">
              <LabelInstrument>
                <VoiceglotText translationKey="form.label.tones" defaultText="Kies de toonhoogtes die bij je passen (max. 5)" />
              </LabelInstrument>
              <div className="flex flex-wrap gap-3">
                {taxonomies.tones.map(t => {
                  const isSelected = formData.toneIds.includes(t.id);
                  return (
                    <button
                      key={t.id}
                      onClick={() => toggleSelection('toneIds', t.id)}
                      className={cn(
                        "px-6 py-3 rounded-full border text-[14px] font-light transition-all duration-500",
                        isSelected 
                          ? "bg-va-black border-va-black text-white shadow-lg scale-105" 
                          : "bg-white border-black/10 text-va-black/60 hover:border-primary/40"
                      )}
                    >
                      {t.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="pt-12 flex justify-between">
              <ButtonInstrument variant="ghost" onClick={prevStep} className="text-va-black/40 hover:text-va-black">
                <ChevronLeft size={18} className="mr-2" />
                <VoiceglotText translationKey="common.previous" defaultText="Vorige" />
              </ButtonInstrument>
              <ButtonInstrument onClick={nextStep} className="va-btn-pro group">
                <VoiceglotText translationKey="common.next_step" defaultText="Volgende stap" />
                <ChevronRight size={18} className="ml-2 group-hover:translate-x-1 transition-transform" />
              </ButtonInstrument>
            </div>
          </motion.div>
        )}

        {step === 4 && (
          <motion.div
            key="step4"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.6, ease: vaBezier }}
            className="bg-white p-12 rounded-[40px] shadow-aura border border-black/[0.02] space-y-8"
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
                <Clock size={24} strokeWidth={1.5} />
              </div>
              <div>
                <HeadingInstrument level={2} className="text-3xl tracking-tighter">
                  <VoiceglotText translationKey="form.delivery.title" defaultText="Levering" />
                </HeadingInstrument>
                <TextInstrument className="text-va-black/40">
                  <VoiceglotText translationKey="form.delivery.subtitle" defaultText="Hoe snel kun je leveren?" />
                </TextInstrument>
              </div>
            </div>

            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <LabelInstrument>
                    <VoiceglotText translationKey="form.label.delivery_min" defaultText="Min. Levertijd (dagen)" />
                  </LabelInstrument>
                  <InputInstrument 
                    type="number"
                    min={1}
                    value={formData.deliveryDaysMin}
                    onChange={(e) => updateField('deliveryDaysMin', parseInt(e.target.value))}
                  />
                </div>
                <div className="space-y-2">
                  <LabelInstrument>
                    <VoiceglotText translationKey="form.label.delivery_max" defaultText="Max. Levertijd (dagen)" />
                  </LabelInstrument>
                  <InputInstrument 
                    type="number"
                    min={1}
                    value={formData.deliveryDaysMax}
                    onChange={(e) => updateField('deliveryDaysMax', parseInt(e.target.value))}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <LabelInstrument>
                  <VoiceglotText translationKey="form.label.cutoff_time" defaultText="Dagelijkse Deadline (Cutoff)" />
                </LabelInstrument>
                <InputInstrument 
                  type="time"
                  value={formData.cutoffTime}
                  onChange={(e) => updateField('cutoffTime', e.target.value)}
                />
              </div>
            </div>

            <div className="pt-12 flex justify-between">
              <ButtonInstrument variant="ghost" onClick={prevStep} className="text-va-black/40 hover:text-va-black">
                <ChevronLeft size={18} className="mr-2" />
                <VoiceglotText translationKey="common.previous" defaultText="Vorige" />
              </ButtonInstrument>
              <ButtonInstrument onClick={() => onSave(formData)} className="va-btn-pro group">
                <VoiceglotText translationKey="common.save_profile" defaultText="Profiel Opslaan" />
                <Check size={18} className="ml-2" />
              </ButtonInstrument>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </ContainerInstrument>
  );
};
