"use client";

import React, { useState, useEffect } from 'react';
import { 
  ContainerInstrument, 
  HeadingInstrument, 
  TextInstrument, 
  ButtonInstrument,
  InputInstrument
} from '@/components/ui/LayoutInstruments';
import { VoiceglotText } from '@/components/ui/VoiceglotText';
import { Save, Calendar, MapPin, User, DollarSign, Users, Clock, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils/utils';

interface WorkshopEditionEditorProps {
  edition: any;
  onSave?: (updatedEdition: any) => void;
}

export const WorkshopEditionEditor: React.FC<WorkshopEditionEditorProps> = ({ edition, onSave }) => {
  const [loading, setLoading] = useState(false);
  const [metadata, setMetadata] = useState<{ locations: any[], instructors: any[] }>({ locations: [], instructors: [] });
  const [formData, setFormData] = useState({
    date: edition.date ? new Date(edition.date).toISOString().slice(0, 16) : '',
    endDate: edition.endDate ? new Date(edition.endDate).toISOString().slice(0, 16) : '',
    locationId: edition.locationId || '',
    instructorId: edition.instructorId || '',
    price: edition.price || '',
    capacity: edition.capacity || 8,
    status: edition.status || 'upcoming'
  });

  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        const res = await fetch('/api/admin/studio/metadata');
        const data = await res.json();
        setMetadata(data);
      } catch (error) {
        console.error('Failed to fetch metadata:', error);
      }
    };
    fetchMetadata();
  }, []);

  const handleSave = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/studio/editions/${edition.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      if (res.ok) {
        const updated = await res.json();
        if (onSave) onSave(updated);
        alert('Editie succesvol bijgewerkt!');
      } else {
        alert('Fout bij het bijwerken van de editie.');
      }
    } catch (error) {
      console.error('Save error:', error);
      alert('Er is een fout opgetreden.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ContainerInstrument plain className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/*  DATUM & TIJD */}
        <ContainerInstrument plain className="space-y-4">
          <div className="flex items-center gap-2 text-black/40">
            <Calendar size={16} strokeWidth={1.5} />
            <TextInstrument className="text-[13px] font-black tracking-widest uppercase">Datum & Starttijd</TextInstrument>
          </div>
          <input 
            type="datetime-local"
            value={formData.date}
            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            className="w-full p-4 bg-va-off-white border border-black/5 rounded-xl text-[15px] font-light focus:border-primary/30 outline-none transition-all"
          />
        </ContainerInstrument>

        <ContainerInstrument plain className="space-y-4">
          <div className="flex items-center gap-2 text-black/40">
            <Clock size={16} strokeWidth={1.5} />
            <TextInstrument className="text-[13px] font-black tracking-widest uppercase">Eindtijd</TextInstrument>
          </div>
          <input 
            type="datetime-local"
            value={formData.endDate}
            onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
            className="w-full p-4 bg-va-off-white border border-black/5 rounded-xl text-[15px] font-light focus:border-primary/30 outline-none transition-all"
          />
        </ContainerInstrument>

        {/*  LOCATIE */}
        <ContainerInstrument plain className="space-y-4">
          <div className="flex items-center gap-2 text-black/40">
            <MapPin size={16} strokeWidth={1.5} />
            <TextInstrument className="text-[13px] font-black tracking-widest uppercase">Locatie</TextInstrument>
          </div>
          <select 
            value={formData.locationId}
            onChange={(e) => setFormData({ ...formData, locationId: e.target.value ? parseInt(e.target.value) : null })}
            className="w-full p-4 bg-va-off-white border border-black/5 rounded-xl text-[15px] font-light focus:border-primary/30 outline-none transition-all appearance-none"
          >
            <option value="">Selecteer Locatie...</option>
            {metadata.locations.map((loc) => (
              <option key={loc.id} value={loc.id}>{loc.name}</option>
            ))}
          </select>
        </ContainerInstrument>

        {/*  INSTRUCTEUR */}
        <ContainerInstrument plain className="space-y-4">
          <div className="flex items-center gap-2 text-black/40">
            <User size={16} strokeWidth={1.5} />
            <TextInstrument className="text-[13px] font-black tracking-widest uppercase">Instructeur</TextInstrument>
          </div>
          <select 
            value={formData.instructorId}
            onChange={(e) => setFormData({ ...formData, instructorId: e.target.value ? parseInt(e.target.value) : null })}
            className="w-full p-4 bg-va-off-white border border-black/5 rounded-xl text-[15px] font-light focus:border-primary/30 outline-none transition-all appearance-none"
          >
            <option value="">Selecteer Instructeur...</option>
            {metadata.instructors.map((inst) => (
              <option key={inst.id} value={inst.id}>{inst.name}</option>
            ))}
          </select>
        </ContainerInstrument>

        {/*  PRIJS */}
        <ContainerInstrument plain className="space-y-4">
          <div className="flex items-center gap-2 text-black/40">
            <DollarSign size={16} strokeWidth={1.5} />
            <TextInstrument className="text-[13px] font-black tracking-widest uppercase">
              <VoiceglotText translationKey="common.price_excl_vat" defaultText="Prijs (Excl. BTW)" />
            </TextInstrument>
          </div>
          <InputInstrument 
            type="number"
            value={formData.price}
            onChange={(e) => setFormData({ ...formData, price: e.target.value })}
            className="w-full p-4 bg-va-off-white border border-black/5 rounded-xl text-[15px] font-light focus:border-primary/30 outline-none transition-all"
          />
        </ContainerInstrument>

        {/*  CAPACITEIT */}
        <ContainerInstrument plain className="space-y-4">
          <div className="flex items-center gap-2 text-black/40">
            <Users size={16} strokeWidth={1.5} />
            <TextInstrument className="text-[13px] font-black tracking-widest uppercase">Capaciteit</TextInstrument>
          </div>
          <InputInstrument 
            type="number"
            value={formData.capacity}
            onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value) })}
            className="w-full p-4 bg-va-off-white border border-black/5 rounded-xl text-[15px] font-light focus:border-primary/30 outline-none transition-all"
          />
        </ContainerInstrument>
      </div>

      <ButtonInstrument 
        onClick={handleSave}
        disabled={loading}
        className={cn(
          "w-full py-6 rounded-2xl font-black tracking-[0.2em] text-[15px] uppercase transition-all shadow-aura flex items-center justify-center gap-3",
          loading ? "bg-black/20 cursor-wait" : "bg-primary text-va-black hover:bg-va-black hover:text-white"
        )}
      >
        {loading ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} strokeWidth={1.5} />}
        <VoiceglotText translationKey="admin.studio.save_changes" defaultText="WIJZIGINGEN OPSLAAN" />
      </ButtonInstrument>
    </ContainerInstrument>
  );
};
