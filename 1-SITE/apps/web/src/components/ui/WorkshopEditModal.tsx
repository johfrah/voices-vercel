"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Save, Loader2, AlertCircle, CheckCircle2, Video, FileText, Info, Plus, Trash2, Clock, User, Globe, Tag } from 'lucide-react';
import { 
  ContainerInstrument, 
  HeadingInstrument, 
  TextInstrument, 
  ButtonInstrument 
} from './LayoutInstruments';
import { cn } from '@/lib/utils';
import { useSonicDNA } from '@/lib/sonic-dna';

interface WorkshopEditModalProps {
  workshop: any;
  isOpen: boolean;
  onClose: () => void;
  onUpdate?: (updatedWorkshop: any) => void;
}

export const WorkshopEditModal: React.FC<WorkshopEditModalProps> = ({ 
  workshop, 
  isOpen, 
  onClose,
  onUpdate
}) => {
  const { playClick } = useSonicDNA();
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [activeTab, setActiveTab] = useState<'base' | 'media' | 'program'>('base');
  const [instructors, setInstructors] = useState<any[]>([]);

  const [formData, setFormData] = useState({
    title: workshop.title || "",
    slug: workshop.slug || "",
    description: workshop.description || "",
    price: workshop.price || "0",
    duration: workshop.duration || "",
    instructorId: workshop.instructorId || "",
    program: workshop.program || [],
    meta: workshop.meta || {
      aftermovie_url: "",
      aftermovie_beschrijving: "",
      intro_video_url: "",
      benefits: []
    }
  });

  useEffect(() => {
    if (isOpen) {
      setFormData({
        title: workshop.title || "",
        slug: workshop.slug || "",
        description: workshop.description || "",
        price: workshop.price || "0",
        duration: workshop.duration || "",
        instructorId: workshop.instructorId || "",
        program: workshop.program || [],
        meta: workshop.meta || {
          aftermovie_url: "",
          aftermovie_beschrijving: "",
          intro_video_url: "",
          benefits: []
        }
      });
      
      // Load instructors
      fetch('/api/admin/studio/instructors')
        .then(res => res.json())
        .then(data => setInstructors(data))
        .catch(err => console.error("Failed to load instructors", err));
    }
  }, [isOpen, workshop]);

  const handleSave = async () => {
    setIsSaving(true);
    setMessage(null);
    playClick('deep');

    try {
      const response = await fetch(`/api/admin/studio/workshops/catalog/${workshop.id}`, {
        method: 'POST', // The existing API uses POST for updates
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (!response.ok) throw new Error('Failed to update workshop');

      const data = await response.json();
      setMessage({ type: 'success', text: 'Workshop succesvol bijgewerkt!' });
      playClick('success');
      
      if (onUpdate) {
        onUpdate({ ...workshop, ...formData });
      }
      
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (error) {
      setMessage({ type: 'error', text: 'Fout bij opslaan. Probeer het opnieuw.' });
      playClick('error');
    } finally {
      setIsSaving(false);
    }
  };

  const addProgramItem = () => {
    const newProgram = [...(formData.program || []), { time: "", activity: "" }];
    setFormData({ ...formData, program: newProgram });
    playClick('light');
  };

  const updateProgramItem = (index: number, field: string, value: string) => {
    const newProgram = [...(formData.program || [])];
    newProgram[index] = { ...newProgram[index], [field]: value };
    setFormData({ ...formData, program: newProgram });
  };

  const removeProgramItem = (index: number) => {
    const newProgram = formData.program.filter((_: any, i: number) => i !== index);
    setFormData({ ...formData, program: newProgram });
    playClick('light');
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 md:p-10">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-va-black/60 backdrop-blur-md"
        />

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
                Bewerk <span className="text-primary italic">{workshop.title}</span>
              </HeadingInstrument>
              <TextInstrument className="text-[11px] font-bold text-va-black/20 uppercase tracking-widest mt-1">
                Workshop Catalogus Beheer
              </TextInstrument>
            </div>
            <div className="flex items-center gap-2 bg-white rounded-full p-1 shadow-sm border border-black/5">
              <button 
                onClick={() => setActiveTab('base')}
                className={cn(
                  "px-4 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-widest transition-all",
                  activeTab === 'base' ? "bg-va-black text-white" : "text-va-black/40 hover:text-va-black"
                )}
              >
                Basis
              </button>
              <button 
                onClick={() => setActiveTab('media')}
                className={cn(
                  "px-4 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-widest transition-all",
                  activeTab === 'media' ? "bg-va-black text-white" : "text-va-black/40 hover:text-va-black"
                )}
              >
                Media
              </button>
              <button 
                onClick={() => setActiveTab('program')}
                className={cn(
                  "px-4 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-widest transition-all",
                  activeTab === 'program' ? "bg-va-black text-white" : "text-va-black/40 hover:text-va-black"
                )}
              >
                Programma
              </button>
            </div>
            <button 
              onClick={onClose}
              className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center text-va-black/40 hover:text-primary transition-colors"
            >
              <X size={20} strokeWidth={1.5} />
            </button>
          </div>

          {/* Content */}
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

            {activeTab === 'base' && (
              <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-va-black/40 uppercase tracking-widest px-1">Titel</label>
                    <input 
                      type="text" 
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className="w-full px-4 py-3 bg-va-off-white rounded-xl border border-black/5 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-light"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-va-black/40 uppercase tracking-widest px-1">Slug</label>
                    <input 
                      type="text" 
                      value={formData.slug}
                      onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                      className="w-full px-4 py-3 bg-va-off-white rounded-xl border border-black/5 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-light"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-va-black/40 uppercase tracking-widest px-1">Beschrijving</label>
                  <textarea 
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={5}
                    className="w-full px-4 py-3 bg-va-off-white rounded-xl border border-black/5 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-light resize-none"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-va-black/40 uppercase tracking-widest px-1">Prijs (€)</label>
                    <input 
                      type="number" 
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      className="w-full px-4 py-3 bg-va-off-white rounded-xl border border-black/5 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-light"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-va-black/40 uppercase tracking-widest px-1">Duur</label>
                    <input 
                      type="text" 
                      value={formData.duration}
                      onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                      className="w-full px-4 py-3 bg-va-off-white rounded-xl border border-black/5 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-light"
                      placeholder="bijv. 1 dag"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-va-black/40 uppercase tracking-widest px-1">Docent</label>
                    <select 
                      value={formData.instructorId || ""}
                      onChange={(e) => setFormData({ ...formData, instructorId: e.target.value ? parseInt(e.target.value) : "" })}
                      className="w-full px-4 py-3 bg-va-off-white rounded-xl border border-black/5 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-light appearance-none"
                    >
                      <option value="">Geen vaste docent</option>
                      {instructors.map(ins => (
                        <option key={ins.id} value={ins.id}>{ins.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'media' && (
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-va-black/40 uppercase tracking-widest px-1">Intro Video URL</label>
                  <input 
                    type="text" 
                    value={formData.meta?.intro_video_url || ""}
                    onChange={(e) => setFormData({ ...formData, meta: { ...formData.meta, intro_video_url: e.target.value } })}
                    className="w-full px-4 py-3 bg-va-off-white rounded-xl border border-black/5 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-light"
                    placeholder="https://youtube.com/..."
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-va-black/40 uppercase tracking-widest px-1">Aftermovie URL</label>
                  <input 
                    type="text" 
                    value={formData.meta?.aftermovie_url || ""}
                    onChange={(e) => setFormData({ ...formData, meta: { ...formData.meta, aftermovie_url: e.target.value } })}
                    className="w-full px-4 py-3 bg-va-off-white rounded-xl border border-black/5 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-light"
                    placeholder="https://youtube.com/..."
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-va-black/40 uppercase tracking-widest px-1">Aftermovie Beschrijving</label>
                  <textarea 
                    value={formData.meta?.aftermovie_beschrijving || ""}
                    onChange={(e) => setFormData({ ...formData, meta: { ...formData.meta, aftermovie_beschrijving: e.target.value } })}
                    rows={3}
                    className="w-full px-4 py-3 bg-va-off-white rounded-xl border border-black/5 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-light resize-none"
                  />
                </div>
              </motion.div>
            )}

            {activeTab === 'program' && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] font-bold text-va-black/40 uppercase tracking-widest px-1">Programma Items</label>
                  <button onClick={addProgramItem} className="text-[10px] font-bold text-primary uppercase tracking-widest flex items-center gap-1 hover:opacity-70 transition-opacity">
                    <Plus size={14} /> Toevoegen
                  </button>
                </div>
                
                <div className="space-y-3">
                  {formData.program?.map((item: any, idx: number) => (
                    <div key={idx} className="flex gap-3 items-center bg-va-off-white/50 p-3 rounded-xl border border-black/[0.02]">
                      <input 
                        type="text" 
                        value={item.time} 
                        onChange={(e) => updateProgramItem(idx, 'time', e.target.value)}
                        placeholder="09:00"
                        className="w-24 px-3 py-2 bg-white rounded-lg border border-black/5 text-sm font-medium"
                      />
                      <input 
                        type="text" 
                        value={item.activity} 
                        onChange={(e) => updateProgramItem(idx, 'activity', e.target.value)}
                        placeholder="Activiteit..."
                        className="flex-1 px-3 py-2 bg-white rounded-lg border border-black/5 text-sm"
                      />
                      <button onClick={() => removeProgramItem(idx)} className="p-2 text-va-black/20 hover:text-red-500 transition-colors">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </div>

          {/* Footer */}
          <div className="px-8 py-6 border-t border-black/5 bg-va-off-white/30 flex justify-between items-center">
            <div className="flex items-center gap-2 text-[11px] text-va-black/40 font-medium italic">
              <Info size={14} className="text-primary shrink-0" />
              Wijzigingen zijn direct zichtbaar in de catalogus.
            </div>
            <div className="flex gap-4">
              <ButtonInstrument variant="outline" onClick={onClose} disabled={isSaving} className="rounded-xl px-6">
                Annuleren
              </ButtonInstrument>
              <ButtonInstrument onClick={handleSave} disabled={isSaving} className="bg-va-black text-white hover:bg-primary rounded-xl px-8 flex items-center gap-2 shadow-lg transition-all">
                {isSaving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                Opslaan
              </ButtonInstrument>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
