"use client";

import React, { useState, useEffect } from 'react';
import { 
  X, 
  Loader2, 
  Save, 
  Music, 
  Image as ImageIcon, 
  Plus, 
  Trash2, 
  Settings, 
  Globe, 
  Youtube, 
  Instagram, 
  Linkedin,
  CheckCircle2,
  Clock
} from 'lucide-react';
import { 
  HeadingInstrument, 
  TextInstrument, 
  ButtonInstrument, 
  InputInstrument,
  ContainerInstrument,
  LabelInstrument,
  SelectInstrument,
  OptionInstrument
} from '@/components/ui/LayoutInstruments';
import Image from 'next/image';
import toast from 'react-hot-toast';

interface ActorEditDrawerProps {
  actorId: number;
  onClose: () => void;
  onSaveSuccess: (updatedActor: any) => void;
}

export const ActorEditDrawer: React.FC<ActorEditDrawerProps> = ({ 
  actorId, 
  onClose, 
  onSaveSuccess 
}) => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [actor, setActor] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'general' | 'media' | 'pricing'>('general');

  useEffect(() => {
    const fetchActor = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/admin/actors/${actorId}`);
        const data = await res.json();
        if (data.success && data.actor) {
          setActor(data.actor);
        } else {
          toast.error('Stemacteur niet gevonden');
          onClose();
        }
      } catch (error) {
        console.error('Failed to fetch actor:', error);
        toast.error('Fout bij laden data');
      } finally {
        setLoading(false);
      }
    };

    fetchActor();
  }, [actorId, onClose]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/actors/${actorId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(actor)
      });

      const data = await res.json();
      if (res.ok && data.success) {
        toast.success('Wijzigingen opgeslagen');
        onSaveSuccess(data.actor);
      } else {
        throw new Error(data.error || 'Save failed');
      }
    } catch (error: any) {
      toast.error(`Opslaan mislukt: ${error.message}`);
    } finally {
      setSaving(false);
    }
  };

  if (loading || !actor) {
    return (
      <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/20 backdrop-blur-sm">
        <div className="bg-white p-12 rounded-[32px] shadow-2xl flex flex-col items-center gap-4">
          <Loader2 className="animate-spin text-primary" size={40} />
          <TextInstrument className="text-va-black/40 font-bold uppercase tracking-widest text-[11px]">Data laden...</TextInstrument>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 z-[150] bg-va-black/10 backdrop-blur-md animate-in fade-in duration-500" 
        onClick={onClose}
      />
      
      {/* Drawer */}
      <div className="fixed inset-y-4 right-4 w-full max-w-2xl bg-white z-[160] rounded-[40px] shadow-[0_32px_128px_-16px_rgba(0,0,0,0.3)] flex flex-col overflow-hidden animate-in slide-in-from-right-full duration-700 ease-va-bezier">
        
        {/* Header */}
        <div className="p-10 border-b border-black/[0.03] flex justify-between items-center bg-va-off-white/30">
          <div className="flex items-center gap-6">
            <div className="w-16 h-16 rounded-2xl bg-white overflow-hidden shadow-sm border border-black/5 relative">
              {actor.photo_url ? (
                <Image src={actor.photo_url} alt="" fill className="object-cover" />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center text-va-black/10 text-2xl font-light">
                  {actor.first_name?.charAt(0)}
                </div>
              )}
            </div>
            <div>
              <HeadingInstrument level={2} className="text-3xl font-light tracking-tighter">
                {actor.first_name} {actor.last_name}
              </HeadingInstrument>
              <TextInstrument className="text-[13px] font-light text-va-black/30 tracking-widest uppercase mt-1">
                ID: #{actor.wp_product_id || actor.id}
              </TextInstrument>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="w-12 h-12 rounded-full bg-white border border-black/5 flex items-center justify-center text-va-black/20 hover:text-va-black hover:scale-110 transition-all shadow-sm"
          >
            <X size={20} strokeWidth={1.5} />
          </button>
        </div>

        {/* Tabs */}
        <div className="px-10 py-6 flex gap-2 border-b border-black/[0.03]">
          {[
            { id: 'general', label: 'Algemeen', icon: Settings },
            { id: 'media', label: 'Media & Demos', icon: Music },
            { id: 'pricing', label: 'Tarieven', icon: Globe }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all ${
                activeTab === tab.id 
                  ? 'bg-va-black text-white shadow-lg' 
                  : 'text-va-black/30 hover:text-va-black hover:bg-va-off-white'
              }`}
            >
              <tab.icon size={14} strokeWidth={2} />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-10 custom-scrollbar space-y-10">
          
          {activeTab === 'general' && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <LabelInstrument>Voornaam</LabelInstrument>
                  <InputInstrument 
                    value={actor.first_name || ''} 
                    onChange={(e) => setActor({...actor, first_name: e.target.value})}
                    className="w-full"
                  />
                </div>
                <div className="space-y-2">
                  <LabelInstrument>Achternaam</LabelInstrument>
                  <InputInstrument 
                    value={actor.last_name || ''} 
                    onChange={(e) => setActor({...actor, last_name: e.target.value})}
                    className="w-full"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <LabelInstrument>Status</LabelInstrument>
                <SelectInstrument 
                  value={actor.status} 
                  onChange={(e) => setActor({...actor, status: e.target.value, is_public: e.target.value === 'live'})}
                  className="w-full"
                >
                  <OptionInstrument value="live">Live</OptionInstrument>
                  <OptionInstrument value="pending">Wachtend (Pending)</OptionInstrument>
                  <OptionInstrument value="archived">Gearchiveerd</OptionInstrument>
                </SelectInstrument>
              </div>

              <div className="space-y-2">
                <LabelInstrument>E-mailadres</LabelInstrument>
                <InputInstrument 
                  value={actor.email || ''} 
                  onChange={(e) => setActor({...actor, email: e.target.value})}
                  className="w-full"
                />
              </div>

              <div className="space-y-2">
                <LabelInstrument>Biografie</LabelInstrument>
                <textarea 
                  value={actor.bio || ''} 
                  onChange={(e) => setActor({...actor, bio: e.target.value})}
                  className="w-full min-h-[150px] bg-va-off-white border-none rounded-[10px] px-6 py-4 text-[15px] font-medium focus:ring-2 focus:ring-va-black/10 transition-all resize-none"
                />
              </div>
            </div>
          )}

          {activeTab === 'media' && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
              <div className="flex justify-between items-center">
                <HeadingInstrument level={3} className="text-xl font-light tracking-tight">Audio Demos</HeadingInstrument>
                <ButtonInstrument className="!bg-primary/10 !text-primary !rounded-full !px-6 !py-2 flex items-center gap-2 hover:!bg-primary hover:!text-white transition-all">
                  <Plus size={14} />
                  <span className="text-[10px] font-black uppercase tracking-widest">Demo toevoegen</span>
                </ButtonInstrument>
              </div>

              <div className="space-y-4">
                {(actor.demos || []).map((demo: any, i: number) => (
                  <div key={demo.id || i} className="p-4 bg-va-off-white rounded-2xl flex items-center justify-between group border border-transparent hover:border-black/5 transition-all">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-primary shadow-sm">
                        <Music size={16} />
                      </div>
                      <div>
                        <TextInstrument className="font-bold text-[14px]">{demo.name || demo.title}</TextInstrument>
                        <TextInstrument className="text-[11px] text-va-black/30 uppercase tracking-widest font-black">{demo.type || demo.category}</TextInstrument>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="p-2 text-va-black/20 hover:text-va-black transition-colors"><Settings size={14} /></button>
                      <button className="p-2 text-va-black/20 hover:text-red-500 transition-colors"><Trash2 size={14} /></button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'pricing' && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <LabelInstrument>Tarief (Basis)</LabelInstrument>
                  <InputInstrument 
                    value={actor.price_unpaid || ''} 
                    onChange={(e) => setActor({...actor, price_unpaid: e.target.value})}
                    className="w-full"
                  />
                </div>
                <div className="space-y-2">
                  <LabelInstrument>Voice Score (1-10)</LabelInstrument>
                  <InputInstrument 
                    type="number"
                    min="1"
                    max="10"
                    value={actor.voice_score || 10} 
                    onChange={(e) => setActor({...actor, voice_score: parseInt(e.target.value)})}
                    className="w-full"
                  />
                </div>
              </div>

              <div className="p-8 bg-primary/5 rounded-[32px] border border-primary/10 space-y-4">
                <div className="flex items-center gap-3 text-primary">
                  <CheckCircle2 size={18} />
                  <TextInstrument className="font-bold uppercase tracking-widest text-[11px]">Chris-Protocol: Pricing</TextInstrument>
                </div>
                <TextInstrument className="text-[13px] font-light leading-relaxed opacity-60">
                  Wijzigingen in tarieven worden direct doorgevoerd voor super-admins. Voor reguliere admins worden deze eerst ter goedkeuring voorgelegd.
                </TextInstrument>
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-10 border-t border-black/[0.03] bg-va-off-white/30 flex justify-end gap-4">
          <ButtonInstrument 
            onClick={onClose}
            variant="outline"
            className="border-black/5 hover:bg-white"
          >
            Annuleren
          </ButtonInstrument>
          <ButtonInstrument 
            onClick={handleSave}
            disabled={saving}
            className="!bg-va-black !text-white px-12 py-4 shadow-xl shadow-va-black/10 flex items-center gap-2 group"
          >
            {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} className="group-hover:scale-110 transition-transform" />}
            <span className="text-xs font-black uppercase tracking-widest">Wijzigingen Opslaan</span>
          </ButtonInstrument>
        </div>

      </div>
    </>
  );
};
