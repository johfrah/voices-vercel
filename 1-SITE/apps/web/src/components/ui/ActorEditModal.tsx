"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Save, Loader2, AlertCircle, CheckCircle2, Play, Pause, Music, Tag, Briefcase, Globe, Clock, Camera } from 'lucide-react';
import { 
  ContainerInstrument, 
  HeadingInstrument, 
  TextInstrument, 
  ButtonInstrument 
} from './LayoutInstruments';
import { Actor, Demo } from '@/types';
import { cn } from '@/lib/utils';
import { useSonicDNA } from '@/lib/sonic-dna';
import { PhotoUploader } from './PhotoUploader';

interface ActorEditModalProps {
  actor: Actor;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  onUpdate?: (updatedActor: any) => void;
}

export const ActorEditModal: React.FC<ActorEditModalProps> = ({ 
  actor, 
  isOpen, 
  onClose,
  onSuccess,
  onUpdate
}) => {
  const { playClick } = useSonicDNA();
  const [taxonomies, setTaxonomies] = useState<{ tones: any[], languages: any[] }>({ tones: [], languages: [] });
  const [formData, setFormData] = useState({
    display_name: actor.display_name || '',
    tagline: actor.tagline || '',
    bio: actor.bio || '',
    tone_of_voice: actor.tone_of_voice || '',
    clients: actor.clients || '',
    voice_score: actor.voice_score || 10,
    status: actor.status || 'live',
    delivery_days: actor.delivery_days_max || 1,
    cutoff_time: actor.cutoff_time || '18:00',
    native_lang: actor.native_lang || '',
    extra_langs: actor.extra_langs || '',
    native_lang_label: (actor as any).native_lang_label || '',
    photo_url: actor.photo_url || '',
    photo_id: actor.photo_id || (actor as any).photoId || null,
    demos: actor.demos || [],
    firstName: actor.first_name || actor.firstName || '',
    lastName: actor.last_name || actor.lastName || '',
    email: actor.email || (actor as any).user?.email || '',
    gender: actor.gender || 'male',
    experienceLevel: actor.experienceLevel || 'pro',
    holiday_from: (actor as any).holidayFrom || (actor as any).holiday_from || '',
    holiday_till: (actor as any).holidayTill || (actor as any).holiday_till || ''
  });

  //  CHRIS-PROTOCOL: If native_lang is a label (like "Vlaams"), try to find the code in taxonomies
  useEffect(() => {
    if (taxonomies.languages.length > 0 && formData.native_lang) {
      // 1. Check if it's already a valid code (contains a dash like 'nl-be' or is a known code)
      const isKnownCode = taxonomies.languages.some(l => l.code === formData.native_lang);
      
      if (!isKnownCode || !formData.native_lang.includes('-')) {
        const found = taxonomies.languages.find(l => 
          l.label.toLowerCase() === formData.native_lang.toLowerCase() || 
          l.code === formData.native_lang
        );
        if (found && found.code !== formData.native_lang) {
          console.log(` CHRIS-PROTOCOL: Resolving native_lang "${formData.native_lang}" to code "${found.code}"`);
          setFormData(prev => ({ ...prev, native_lang: found.code }));
        }
      }
    }
  }, [taxonomies.languages, formData.native_lang]);

  //  CHRIS-PROTOCOL: Resolve extra_langs labels to codes
  useEffect(() => {
    if (taxonomies.languages.length > 0 && formData.extra_langs) {
      const currentLangs = formData.extra_langs.split(',').map(l => l.trim()).filter(Boolean);
      let hasChanges = false;
      const newLangs = currentLangs.map(lang => {
        const found = taxonomies.languages.find(l => 
          l.label.toLowerCase() === lang.toLowerCase() || 
          l.code === lang
        );
        if (found && found.code !== lang) {
          hasChanges = true;
          return found.code;
        }
        return lang;
      });

      if (hasChanges) {
        console.log(` CHRIS-PROTOCOL: Resolving extra_langs to codes:`, newLangs);
        setFormData(prev => ({ ...prev, extra_langs: newLangs.join(', ') }));
      }
    }
  }, [taxonomies.languages, formData.extra_langs]);

  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [playingDemoId, setPlayingDemoId] = useState<number | null>(null);
  const audioRef = React.useRef<HTMLAudioElement | null>(null);

  //  Load Taxonomies for better UI
  useEffect(() => {
    const loadTaxonomies = async () => {
      try {
        const res = await fetch('/api/taxonomies');
        if (res.ok) {
          const data = await res.json();
          setTaxonomies(data);
        }
      } catch (e) {
        console.error("Failed to load taxonomies", e);
      }
    };
    if (isOpen) loadTaxonomies();
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      setFormData({
        display_name: actor.display_name || '',
        tagline: actor.tagline || '',
        bio: actor.bio || '',
        tone_of_voice: actor.tone_of_voice || '',
        clients: actor.clients || '',
        voice_score: actor.voice_score || 10,
        status: actor.status || 'live',
        delivery_days: actor.delivery_days_max || 1,
        cutoff_time: actor.cutoff_time || '18:00',
    native_lang: actor.native_lang || '',
    extra_langs: actor.extra_langs || '',
    native_lang_label: (actor as any).native_lang_label || '',
    photo_url: actor.photo_url || '',
        demos: actor.demos || [],
        firstName: actor.firstName || actor.first_name || (actor as any).display_name || '',
        lastName: actor.lastName || actor.last_name || '',
        email: actor.email || (actor as any).user?.email || '',
    gender: actor.gender || 'male',
    experienceLevel: actor.experienceLevel || 'pro',
    holiday_from: (actor as any).holidayFrom || (actor as any).holiday_from || '',
    holiday_till: (actor as any).holidayTill || (actor as any).holiday_till || ''
  });
      setMessage(null);
    }
  }, [isOpen, actor]);

  const handlePhotoUploadSuccess = (newUrl: string, mediaId: number) => {
    setFormData({ ...formData, photo_url: newUrl, photo_id: mediaId });
    playClick('success');
  };

  const toggleTone = (toneLabel: string) => {
    const currentTones = formData.tone_of_voice ? formData.tone_of_voice.split(',').map(t => t.trim()).filter(Boolean) : [];
    let newTones;
    if (currentTones.includes(toneLabel)) {
      newTones = currentTones.filter(t => t !== toneLabel);
    } else {
      newTones = [...currentTones, toneLabel];
    }
    setFormData({ ...formData, tone_of_voice: newTones.join(', ') });
    playClick('light');
  };

  const toggleExtraLang = (langCode: string) => {
    const currentLangs = formData.extra_langs ? formData.extra_langs.split(',').map(t => t.trim()).filter(Boolean) : [];
    let newLangs;
    if (currentLangs.includes(langCode)) {
      newLangs = currentLangs.filter(t => t !== langCode);
    } else {
      newLangs = [...currentLangs, langCode];
    }
    setFormData({ ...formData, extra_langs: newLangs.join(', ') });
    playClick('light');
  };

  const toggleDemoPlay = (demo: Demo) => {
    if (playingDemoId === demo.id) {
      audioRef.current?.pause();
      setPlayingDemoId(null);
    } else {
      if (audioRef.current) {
        audioRef.current.src = demo.audio_url;
        audioRef.current.play();
        setPlayingDemoId(demo.id);
      }
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    setMessage(null);

    //  CHRIS-PROTOCOL: Map frontend fields to backend expected fields
    const payload = {
      ...formData,
      photo_id: formData.photo_id,
      photo_url: formData.photo_url
    };

    try {
      const response = await fetch(`/api/admin/actors/${actor.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) throw new Error('Failed to update actor');

      const data = await response.json();
      setMessage({ type: 'success', text: 'Stem succesvol bijgewerkt!' });
      
      //  CHRIS-PROTOCOL: Trigger immediate UI update without reload
      if (onUpdate && data.actor) {
        onUpdate(data.actor);
      }
      
      if (onSuccess) onSuccess();
      
      // Auto close after success
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (error) {
      setMessage({ type: 'error', text: 'Fout bij opslaan. Probeer het opnieuw.' });
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 md:p-10">
        {/* Backdrop */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-va-black/60 backdrop-blur-md"
        />

        {/* Modal */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="relative w-full max-w-2xl bg-white rounded-[30px] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        >
          {/* Header */}
          <div className="px-8 py-6 border-b border-black/5 flex justify-between items-center bg-va-off-white/50">
            <div>
              <HeadingInstrument level={3} className="text-2xl font-light tracking-tighter">
                Bewerk <span className="text-primary italic">{actor.display_name}</span>
              </HeadingInstrument>
              <TextInstrument className="text-[11px] font-bold text-va-black/20 uppercase tracking-widest mt-1">
                Admin God Mode
              </TextInstrument>
            </div>
            <button 
              onClick={onClose}
              className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center text-va-black/40 hover:text-primary transition-colors"
            >
              <X size={20} strokeWidth={1.5} />
            </button>
          </div>

          {/* Form Content */}
          <div className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar">
            {message && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className={cn(
                  "p-4 rounded-2xl flex items-center gap-3",
                  message.type === 'success' ? "bg-green-50 text-green-600" : "bg-red-50 text-red-600"
                )}
              >
                {message.type === 'success' ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
                <TextInstrument className="text-sm font-medium">{message.text}</TextInstrument>
              </motion.div>
            )}

            {/*  PHOTO UPLOAD SECTION */}
            <div className="flex flex-col md:flex-row gap-8 items-start bg-va-off-white/30 p-6 rounded-[30px] border border-black/[0.02]">
              <PhotoUploader 
                currentPhotoUrl={formData.photo_url} 
                onUploadSuccess={handlePhotoUploadSuccess}
                actorName={formData.display_name}
              />
              <div className="flex-1 space-y-6 w-full">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-va-black/40 uppercase tracking-widest px-1">Voornaam (Publiek)</label>
                    <input 
                      type="text"
                      value={formData.firstName}
                      onChange={(e) => setFormData({ ...formData, firstName: e.target.value, display_name: e.target.value })}
                      className="w-full px-4 py-3 bg-white rounded-xl border border-black/5 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-light"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-va-black/40 uppercase tracking-widest px-1 italic">Familienaam (Priv)</label>
                    <input 
                      type="text"
                      value={formData.lastName}
                      onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                      className="w-full px-4 py-3 bg-white rounded-xl border border-black/5 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-light"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-va-black/40 uppercase tracking-widest px-1 italic">E-mail (Priv)</label>
                    <input 
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-4 py-3 bg-white rounded-xl border border-black/5 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-light"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-va-black/40 uppercase tracking-widest px-1">Status</label>
                    <select 
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                      className="w-full px-4 py-3 bg-white rounded-xl border border-black/5 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-light appearance-none"
                    >
                      <option value="live">Live</option>
                      <option value="away">Afwezig (Verborgen)</option>
                      <option value="pending">Pending</option>
                      <option value="archived">Archived</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-va-black/40 uppercase tracking-widest px-1">Geslacht</label>
                    <select 
                      value={formData.gender}
                      onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                      className="w-full px-4 py-3 bg-white rounded-xl border border-black/5 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-light appearance-none"
                    >
                      <option value="male">Mannelijk</option>
                      <option value="female">Vrouwelijk</option>
                      <option value="non-binary">Non-binair</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-va-black/40 uppercase tracking-widest px-1">Ervaring</label>
                    <select 
                      value={formData.experienceLevel}
                      onChange={(e) => setFormData({ ...formData, experienceLevel: e.target.value })}
                      className="w-full px-4 py-3 bg-white rounded-xl border border-black/5 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-light appearance-none"
                    >
                      <option value="junior">Junior</option>
                      <option value="pro">Pro</option>
                      <option value="senior">Senior</option>
                      <option value="legend">Legend</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-va-black/40 uppercase tracking-widest px-1">Vakantie Van</label>
                    <input 
                      type="date"
                      value={formData.holiday_from ? formData.holiday_from.split('T')[0] : ''}
                      onChange={(e) => setFormData({ ...formData, holiday_from: e.target.value })}
                      className="w-full px-4 py-3 bg-white rounded-xl border border-black/5 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-light"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-va-black/40 uppercase tracking-widest px-1">Vakantie Tot</label>
                    <input 
                      type="date"
                      value={formData.holiday_till ? formData.holiday_till.split('T')[0] : ''}
                      onChange={(e) => setFormData({ ...formData, holiday_till: e.target.value })}
                      className="w-full px-4 py-3 bg-white rounded-xl border border-black/5 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-light"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-va-black/40 uppercase tracking-widest px-1">Tagline</label>
                  <input 
                    type="text"
                    value={formData.tagline}
                    onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                    className="w-full px-4 py-3 bg-white rounded-xl border border-black/5 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-light"
                    placeholder="Korte krachtige omschrijving..."
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-va-black/40 uppercase tracking-widest px-1">Bio</label>
              <textarea 
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                rows={4}
                className="w-full px-6 py-4 bg-va-off-white rounded-[20px] border border-black/5 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-light resize-none text-[15px]"
                placeholder="Uitgebreide biografie..."
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <label className="text-[11px] font-bold text-va-black/40 uppercase tracking-[0.2em] px-1 flex items-center gap-2">
                  <Tag size={14} className="text-primary" />
                  Tone of Voice
                </label>
                
                {/*  Smart Tone Chips */}
                <div className="flex flex-wrap gap-2 mb-3 min-h-[80px] p-4 bg-va-off-white/50 rounded-[20px] border border-black/[0.02]">
                  {taxonomies.tones.map((tone) => {
                    const isActive = formData.tone_of_voice.split(',').map(t => t.trim()).includes(tone.label);
                    return (
                      <button
                        key={tone.id}
                        type="button"
                        onClick={() => toggleTone(tone.label)}
                        className={cn(
                          "px-4 py-2 rounded-full text-[12px] font-medium transition-all duration-500 border",
                          isActive 
                            ? "bg-primary text-white border-primary shadow-aura-sm scale-105" 
                            : "bg-white border-black/5 text-va-black/40 hover:border-black/10 hover:text-va-black"
                        )}
                      >
                        {tone.label}
                      </button>
                    );
                  })}
                </div>

                <input 
                  type="text"
                  value={formData.tone_of_voice}
                  onChange={(e) => setFormData({ ...formData, tone_of_voice: e.target.value })}
                  className="w-full px-6 py-4 bg-va-off-white rounded-[20px] border border-black/5 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-light text-[15px] placeholder:opacity-20"
                  placeholder="Warm, Zakelijk, Energiek..."
                />
              </div>

              <div className="space-y-3">
                <label className="text-[11px] font-bold text-va-black/40 uppercase tracking-[0.2em] px-1 flex items-center gap-2">
                  <Clock size={14} className="text-primary" />
                  Levering & Cutoff
                </label>
                
                <div className="grid grid-cols-1 gap-4 p-4 bg-va-off-white/50 rounded-[20px] border border-black/[0.02]">
                  <div className="space-y-2">
                    <span className="text-[10px] text-va-black/30 uppercase font-bold tracking-widest px-1">Aantal Werkdagen</span>
                    <div className="flex gap-2">
                      {[0, 1, 2, 3].map((days) => (
                        <button
                          key={days}
                          type="button"
                          onClick={() => {
                            setFormData({ ...formData, delivery_days: days });
                            playClick('light');
                          }}
                          className={cn(
                            "flex-1 py-3 rounded-xl text-[13px] font-bold transition-all border",
                            formData.delivery_days === days
                              ? "bg-primary text-white border-primary shadow-aura-sm"
                              : "bg-white border-black/5 text-va-black/40 hover:border-black/10"
                          )}
                        >
                          {days === 0 ? 'Sameday' : `${days} d.`}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <span className="text-[10px] text-va-black/30 uppercase font-bold tracking-widest px-1">Cutoff Tijd</span>
                    <input 
                      type="time"
                      value={formData.cutoff_time}
                      onChange={(e) => setFormData({ ...formData, cutoff_time: e.target.value })}
                      className="w-full px-5 py-3 bg-white rounded-xl border border-black/5 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-light text-[15px]"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/*  LANGUAGES SECTION */}
            <div className="space-y-3 pt-8 border-t border-black/5">
              <label className="text-[11px] font-bold text-va-black/40 uppercase tracking-[0.2em] px-1 flex items-center gap-2">
                <Globe size={14} className="text-primary" />
                Talen & Moedertaal
              </label>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-va-off-white/30 p-6 rounded-[30px] border border-black/[0.02]">
                <div className="space-y-3">
                  <span className="text-[10px] text-va-black/30 uppercase font-bold tracking-widest px-1">Moedertaal</span>
                  <select 
                    value={formData.native_lang}
                    onChange={(e) => setFormData({ ...formData, native_lang: e.target.value })}
                    className="w-full px-6 py-4 bg-white rounded-[20px] border border-black/5 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-light text-[15px] appearance-none cursor-pointer shadow-sm"
                  >
                    <option value="">Kies taal...</option>
                    {taxonomies.languages.map(lang => (
                      <option key={lang.id} value={lang.code}>{lang.label} ({lang.code})</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-3">
                  <span className="text-[10px] text-va-black/30 uppercase font-bold tracking-widest px-1">Extra Talen</span>
                  <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto p-4 bg-white rounded-[20px] border border-black/5 custom-scrollbar shadow-inner">
                    {taxonomies.languages.map((lang) => {
                      const isActive = formData.extra_langs.split(',').map(l => l.trim()).includes(lang.code);
                      const isNative = formData.native_lang === lang.code;
                      if (isNative) return null;

                      return (
                        <button
                          key={lang.id}
                          type="button"
                          onClick={() => toggleExtraLang(lang.code)}
                          className={cn(
                            "px-4 py-2 rounded-full text-[11px] font-medium transition-all duration-300 border",
                            isActive 
                              ? "bg-va-black text-white border-va-black shadow-aura-sm scale-105" 
                              : "bg-va-off-white border-black/5 text-va-black/40 hover:border-black/10"
                          )}
                        >
                          {lang.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-3 pt-8 border-t border-black/5">
              <label className="text-[11px] font-bold text-va-black/40 uppercase tracking-[0.2em] px-1 flex items-center gap-2">
                <Briefcase size={14} className="text-primary" />
                Klanten
              </label>
              
              <div className="flex flex-wrap gap-2 mb-3 min-h-[45px] p-4 bg-va-off-white/50 rounded-[20px] border border-black/[0.02]">
                {formData.clients.split(',').map(t => t.trim()).filter(Boolean).map((client, i) => (
                  <span key={i} className="px-4 py-2 bg-white rounded-full text-[12px] font-medium text-va-black/60 border border-black/5 shadow-sm animate-in fade-in zoom-in duration-300">
                    {client}
                  </span>
                ))}
              </div>

              <input 
                type="text"
                value={formData.clients}
                onChange={(e) => setFormData({ ...formData, clients: e.target.value })}
                className="w-full px-6 py-4 bg-va-off-white rounded-[20px] border border-black/5 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-light text-[15px] placeholder:opacity-20"
                placeholder="BMW, Coca-Cola, Nike..."
              />
            </div>

            {/*  DEMOS SECTION (VOICES DNA) */}
            <div className="pt-8 border-t border-black/5">
              <div className="flex items-center justify-between mb-6">
                <label className="text-[11px] font-bold text-va-black/40 uppercase tracking-[0.2em] px-1 flex items-center gap-2">
                  <Music size={14} className="text-primary" />
                  Demo&apos;s & Audio
                </label>
                <div className="flex items-center gap-3">
                  <TextInstrument className="text-[11px] font-light text-va-black/30 italic">
                    {formData.demos.length} fragmenten
                  </TextInstrument>
                  <ButtonInstrument 
                    type="button"
                    onClick={() => {
                      const newId = Math.max(0, ...formData.demos.map(d => d.id)) + 1;
                      setFormData({
                        ...formData,
                        demos: [...formData.demos, { id: newId, title: 'Nieuwe Demo', audio_url: '', category: 'video' }]
                      });
                    }}
                    className="px-3 py-1 bg-primary/10 text-primary rounded-lg text-[10px] font-bold uppercase tracking-widest hover:bg-primary hover:text-white transition-all"
                  >
                    + Toevoegen
                  </ButtonInstrument>
                </div>
              </div>

              <div className="space-y-3">
                {formData.demos.length > 0 ? (
                  formData.demos.map((demo, idx) => (
                    <div 
                      key={demo.id || idx} 
                      className="group flex items-center gap-4 p-4 bg-va-off-white/50 rounded-[20px] border border-black/[0.02] hover:bg-white hover:shadow-aura-sm transition-all duration-500"
                    >
                      <button 
                        type="button"
                        onClick={() => toggleDemoPlay(demo)}
                        className={cn(
                          "w-12 h-12 rounded-full flex items-center justify-center transition-all duration-500 shadow-sm",
                          playingDemoId === demo.id ? "bg-primary text-white scale-110" : "bg-white text-va-black/40 hover:text-primary"
                        )}
                      >
                        {playingDemoId === demo.id ? <Pause size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" className="ml-0.5" />}
                      </button>
                      
                      <div className="flex-1 min-w-0 space-y-1">
                        <input 
                          type="text"
                          value={demo.title}
                          onChange={(e) => {
                            const newDemos = [...formData.demos];
                            newDemos[idx] = { ...newDemos[idx], title: e.target.value };
                            setFormData({ ...formData, demos: newDemos });
                          }}
                          className="w-full bg-transparent border-none p-0 text-[15px] font-light text-va-black focus:ring-0 truncate placeholder:opacity-20"
                          placeholder="Titel van de demo..."
                        />
                        <div className="flex items-center gap-3">
                          <span className="text-[10px] font-bold text-primary/40 uppercase tracking-[0.15em]">
                            {demo.category || 'Online'}
                          </span>
                          <input 
                            type="text"
                            value={demo.audio_url}
                            onChange={(e) => {
                              const newDemos = [...formData.demos];
                              newDemos[idx] = { ...newDemos[idx], audio_url: e.target.value };
                              setFormData({ ...formData, demos: newDemos });
                            }}
                            className="flex-1 bg-transparent border-none p-0 text-[10px] text-va-black/20 focus:ring-0 truncate font-mono"
                            placeholder="url/naar/audio.mp3"
                          />
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <select 
                          value={demo.category}
                          onChange={(e) => {
                            const newDemos = [...formData.demos];
                            newDemos[idx] = { ...newDemos[idx], category: e.target.value };
                            setFormData({ ...formData, demos: newDemos });
                          }}
                          className="text-[10px] font-bold uppercase tracking-widest bg-white border border-black/5 rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-primary/10 transition-all appearance-none cursor-pointer"
                        >
                          <option value="commercial">Commercial</option>
                          <option value="video">Corporate</option>
                          <option value="telephony">Telefonie</option>
                          <option value="e-learning">E-learning</option>
                          <option value="meditatie">Meditatie</option>
                        </select>
                        
                        <button 
                          type="button"
                          onClick={() => {
                            const newDemos = formData.demos.filter((_, i) => i !== idx);
                            setFormData({ ...formData, demos: newDemos });
                          }}
                          className="p-2 text-va-black/10 hover:text-red-500 transition-colors"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-12 border-2 border-dashed border-black/5 rounded-[30px] flex flex-col items-center justify-center text-center bg-va-off-white/20">
                    <Music size={40} className="text-va-black/5 mb-4" />
                    <TextInstrument className="text-[15px] text-va-black/30 font-light">
                      Geen demo&apos;s gekoppeld aan deze stem.
                    </TextInstrument>
                    <ButtonInstrument 
                      type="button"
                      onClick={() => {
                        setFormData({
                          ...formData,
                          demos: [{ id: Date.now(), title: 'Eerste Demo', audio_url: '', category: 'video' }]
                        });
                      }}
                      className="mt-4 va-btn-pro py-2 px-6 text-[12px]"
                    >
                      Demo Toevoegen
                    </ButtonInstrument>
                  </div>
                )}
              </div>
            </div>
            <audio ref={audioRef} onEnded={() => setPlayingDemoId(null)} className="hidden" />
          </div>

          {/* Footer */}
          <div className="px-8 py-6 border-t border-black/5 bg-va-off-white/30 flex justify-end gap-4">
            <ButtonInstrument 
              variant="outline"
              onClick={onClose}
              disabled={isSaving}
              className="rounded-xl px-6"
            >
              Annuleren
            </ButtonInstrument>
            <ButtonInstrument 
              onClick={handleSave}
              disabled={isSaving}
              className="bg-va-black text-white hover:bg-primary rounded-xl px-8 flex items-center gap-2 shadow-lg hover:shadow-primary/20 transition-all"
            >
              {isSaving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
              Opslaan
            </ButtonInstrument>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
