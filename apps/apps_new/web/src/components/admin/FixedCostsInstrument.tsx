'use client';

import React, { useState } from 'react';
import { ButtonInstrument, ContainerInstrument, TextInstrument, HeadingInstrument } from "@/components/ui/LayoutInstruments";
import { Plus, X, Loader2, Euro, Calendar, Tag } from "lucide-react";
import { VoiceglotText } from '@/components/ui/VoiceglotText';

export const FixedCostsInstrument = () => {
  const [isOpen, setIsState] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    amount: '',
    type: 'marketing',
    note: '',
    date: new Date().toISOString().split('T')[0],
    isPartnerPayout: false
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const response = await fetch('/api/admin/studio/costs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          journey: 'studio',
          status: 'betaald'
        }),
      });

      if (response.ok) {
        setIsState(false);
        setFormData({ amount: '', type: 'marketing', note: '', date: new Date().toISOString().split('T')[0] });
        window.location.reload(); // Simpele refresh om stats bij te werken
      }
    } catch (error) {
      console.error("Fout bij opslaan kosten:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) {
    return (
      <ButtonInstrument 
        onClick={() => setIsState(true)}
        className="w-full py-4 flex items-center justify-center gap-3 bg-white border border-black/5 rounded-xl text-[13px] font-black tracking-widest hover:bg-primary hover:text-white transition-all shadow-sm"
      >
        <Plus size={16} strokeWidth={2.5} />
        VASTE KOSTEN INVOEREN
      </ButtonInstrument>
    );
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-va-black/40 backdrop-blur-sm">
      <ContainerInstrument className="bg-white rounded-[30px] shadow-aura-lg w-full max-w-md overflow-hidden">
        <div className="p-8 border-b border-black/5 flex justify-between items-center bg-va-off-white/50">
          <HeadingInstrument level={3} className="text-xl font-light tracking-tighter">Vaste Kost Invoeren</HeadingInstrument>
          <button onClick={() => setIsState(false)} className="text-black/20 hover:text-primary transition-colors">
            <X size={24} strokeWidth={1.5} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="space-y-2">
            <TextInstrument className="text-[11px] font-black tracking-widest text-black/30 uppercase flex items-center gap-2">
              <Euro size={12} /> Bedrag
            </TextInstrument>
            <input 
              type="number" 
              step="0.01"
              required
              value={formData.amount}
              onChange={(e) => setFormData({...formData, amount: e.target.value})}
              placeholder="0.00"
              className="w-full p-4 bg-va-off-white border border-black/5 rounded-xl text-lg font-light focus:outline-none focus:border-primary transition-all"
            />
          </div>

          <div className="space-y-2">
            <TextInstrument className="text-[11px] font-black tracking-widest text-black/30 uppercase flex items-center gap-2">
              <Tag size={12} /> Type & Omschrijving
            </TextInstrument>
            <select 
              value={formData.type}
              onChange={(e) => setFormData({...formData, type: e.target.value})}
              className="w-full p-4 bg-va-off-white border border-black/5 rounded-xl text-[15px] font-light focus:outline-none focus:border-primary transition-all mb-3"
            >
              <option value="marketing">Marketing (Google/Insta)</option>
              <option value="instructeur">Staff / Freelance</option>
              <option value="materiaal">Materiaal / Equipment</option>
              <option value="overig">Overig</option>
            </select>
            <input 
              type="text" 
              required
              value={formData.note}
              onChange={(e) => setFormData({...formData, note: e.target.value})}
              placeholder="Bijv. Instagram Ads Februari"
              className="w-full p-4 bg-va-off-white border border-black/5 rounded-xl text-[15px] font-light focus:outline-none focus:border-primary transition-all"
            />
          </div>

          <div className="space-y-2">
            <TextInstrument className="text-[11px] font-black tracking-widest text-black/30 uppercase flex items-center gap-2">
              <Calendar size={12} /> Datum
            </TextInstrument>
            <input 
              type="date" 
              required
              value={formData.date}
              onChange={(e) => setFormData({...formData, date: e.target.value})}
              className="w-full p-4 bg-va-off-white border border-black/5 rounded-xl text-[15px] font-light focus:outline-none focus:border-primary transition-all"
            />
          </div>

          <div className="flex items-center gap-3 p-4 bg-va-off-white border border-black/5 rounded-xl">
            <input 
              type="checkbox" 
              id="isPartnerPayout"
              checked={formData.isPartnerPayout}
              onChange={(e) => setFormData({...formData, isPartnerPayout: e.target.checked})}
              className="w-5 h-5 accent-primary"
            />
            <label htmlFor="isPartnerPayout" className="text-[13px] font-bold tracking-widest text-black/60 cursor-pointer uppercase">
              Partner Uitbetaling (Johfrah/Bernadette)
            </label>
          </div>

          <ButtonInstrument 
            disabled={isLoading}
            className="w-full py-5 bg-va-black text-white rounded-2xl font-black tracking-widest text-[13px] hover:bg-primary transition-all flex items-center justify-center gap-3 shadow-aura mt-4"
          >
            {isLoading ? <Loader2 className="animate-spin" size={18} /> : <Plus size={18} />}
            KOST OPSLAAN IN SUPABASE
          </ButtonInstrument>
        </form>
      </ContainerInstrument>
    </div>
  );
};
