"use client";

import React, { useState, useEffect, useCallback } from 'react';
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
import { Save, Plus, Trash2, Globe, ShoppingBag, Bell, User, Menu, Heart, Loader2, ArrowLeft, Image as ImageIcon } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import toast from 'react-hot-toast';

const JOURNEYS = [
  { id: 'agency', label: 'Agency (Stemmen Zoeken)' },
  { id: 'studio', label: 'Studio (Workshops)' },
  { id: 'academy', label: 'Academy (LMS)' },
  { id: 'johfrah', label: 'Johfrah Portfolio' },
  { id: 'ademing', label: 'Ademing' }
];

export default function NavigationAdminPage() {
  const [selectedJourney, setSelectedJourney] = useState('agency');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [config, setConfig] = useState<any>({
    logo: { src: '', width: 200, height: 80 },
    links: [],
    icons: {
      favorites: true,
      cart: true,
      notifications: true,
      language: true,
      account: true,
      menu: true
    }
  });

  const fetchConfig = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/navigation/${selectedJourney}`);
      const data = await res.json();
      if (data.links) {
        setConfig(data);
      } else {
        // Default empty state
        setConfig({
          logo: { src: '', width: 200, height: 80 },
          links: [],
          icons: { favorites: true, cart: true, notifications: true, language: true, account: true, menu: true }
        });
      }
    } catch (error) {
      toast.error('Kon configuratie niet laden.');
    } finally {
      setLoading(false);
    }
  }, [selectedJourney]);

  useEffect(() => {
    fetchConfig();
  }, [selectedJourney, fetchConfig]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/navigation/${selectedJourney}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config)
      });
      if (res.ok) {
        toast.success('Navigatie succesvol opgeslagen!');
      } else {
        toast.error('Fout bij het opslaan.');
      }
    } catch (error) {
      toast.error('Er is een fout opgetreden.');
    } finally {
      setSaving(false);
    }
  };

  const addLink = () => {
    if (config.links.length >= 5) {
      toast.error('Maximaal 5 links toegestaan in de hoofdnavigatie.');
      return;
    }
    setConfig({
      ...config,
      links: [...config.links, { name: '', href: '', key: '' }]
    });
  };

  const removeLink = (index: number) => {
    const newLinks = [...config.links];
    newLinks.splice(index, 1);
    setConfig({ ...config, links: newLinks });
  };

  const updateLink = (index: number, field: string, value: string) => {
    const newLinks = [...config.links];
    newLinks[index] = { ...newLinks[index], [field]: value };
    setConfig({ ...config, links: newLinks });
  };

  const toggleIcon = (icon: string) => {
    setConfig({
      ...config,
      icons: { ...config.icons, [icon]: !config.icons[icon] }
    });
  };

  return (
    <PageWrapperInstrument className="min-h-screen pt-24 pb-32 px-6 md:px-12 max-w-[1400px] mx-auto">
      <ContainerInstrument className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12">
        <ContainerInstrument>
          <Link href="/admin/dashboard" className="inline-flex items-center gap-2 text-[13px] font-black tracking-widest text-black/30 hover:text-primary transition-colors mb-4 uppercase">
            <ArrowLeft size={14} strokeWidth={2.5} /> Terug naar Dashboard
          </Link>
          <HeadingInstrument level={1} className="text-5xl font-light tracking-tighter">
            Navigatie <TextInstrument as="span" className="text-primary font-light">Beheer.</TextInstrument>
          </HeadingInstrument>
        </ContainerInstrument>

        <ContainerInstrument className="flex gap-2 bg-va-off-white p-1.5 rounded-2xl border border-black/5">
          {JOURNEYS.map((j) => (
            <button
              key={j.id}
              onClick={() => setSelectedJourney(j.id)}
              className={cn(
                "px-4 py-2 rounded-xl text-[13px] font-black tracking-widest uppercase transition-all",
                selectedJourney === j.id ? "bg-va-black text-white shadow-lg" : "text-black/40 hover:bg-black/5"
              )}
            >
              {j.id}
            </button>
          ))}
        </ContainerInstrument>
      </ContainerInstrument>

      {loading ? (
        <div className="flex items-center justify-center py-32">
          <Loader2 className="animate-spin text-primary" size={40} />
        </div>
      ) : (
        <BentoGrid columns={3} className="gap-8">
          {/* 🖼️ LOGO CONFIG */}
          <BentoCard span="sm" className="bg-white p-10 border border-black/5 shadow-aura">
            <div className="flex items-center gap-3 mb-8">
              <ImageIcon strokeWidth={1.5} size={24} className="text-primary" />
              <TextInstrument className="text-[15px] font-black tracking-widest uppercase text-black/40">Logo Instellingen</TextInstrument>
            </div>
            
            <div className="space-y-6">
              <ContainerInstrument plain className="space-y-2">
                <TextInstrument className="text-[13px] font-black tracking-widest text-black/20 uppercase">Logo URL (Assets)</TextInstrument>
                <InputInstrument 
                  placeholder="/assets/studio/common/branding/VSTUDIO.webp"
                  value={config.logo?.src || ''}
                  onChange={(e) => setConfig({ ...config, logo: { ...config.logo, src: e.target.value } })}
                  className="w-full p-4 bg-va-off-white border border-black/5 rounded-xl text-[15px] font-light"
                />
              </ContainerInstrument>
              
              <div className="grid grid-cols-2 gap-4">
                <ContainerInstrument plain className="space-y-2">
                  <TextInstrument className="text-[13px] font-black tracking-widest text-black/20 uppercase">Breedte</TextInstrument>
                  <InputInstrument 
                    type="number"
                    value={config.logo?.width || 200}
                    onChange={(e) => setConfig({ ...config, logo: { ...config.logo, width: parseInt(e.target.value) } })}
                    className="w-full p-4 bg-va-off-white border border-black/5 rounded-xl text-[15px] font-light"
                  />
                </ContainerInstrument>
                <ContainerInstrument plain className="space-y-2">
                  <TextInstrument className="text-[13px] font-black tracking-widest text-black/20 uppercase">Hoogte</TextInstrument>
                  <InputInstrument 
                    type="number"
                    value={config.logo?.height || 80}
                    onChange={(e) => setConfig({ ...config, logo: { ...config.logo, height: parseInt(e.target.value) } })}
                    className="w-full p-4 bg-va-off-white border border-black/5 rounded-xl text-[15px] font-light"
                  />
                </ContainerInstrument>
              </div>
            </div>
          </BentoCard>

          {/* 🔗 LINKS CONFIG */}
          <BentoCard span="lg" className="bg-white p-10 border border-black/5 shadow-aura">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <Menu strokeWidth={1.5} size={24} className="text-primary" />
                <TextInstrument className="text-[15px] font-black tracking-widest uppercase text-black/40">Hoofdmenu Links (Max 5)</TextInstrument>
              </div>
              <ButtonInstrument onClick={addLink} className="p-2 bg-primary/10 text-primary rounded-lg hover:bg-primary hover:text-white transition-all">
                <Plus size={20} strokeWidth={2.5} />
              </ButtonInstrument>
            </div>

            <div className="space-y-4">
              {config.links.map((link: any, idx: number) => (
                <div key={idx} className="flex items-center gap-4 p-4 bg-va-off-white rounded-2xl border border-black/5 group">
                  <div className="w-8 h-8 rounded-full bg-va-black text-white flex items-center justify-center text-[13px] font-black shrink-0">{idx + 1}</div>
                  <InputInstrument 
                    placeholder="Naam (bijv. Workshops)"
                    value={link.name}
                    onChange={(e) => updateLink(idx, 'name', e.target.value)}
                    className="flex-1 p-3 bg-white border border-black/5 rounded-xl text-[15px] font-light"
                  />
                  <InputInstrument 
                    placeholder="URL (bijv. /studio)"
                    value={link.href}
                    onChange={(e) => updateLink(idx, 'href', e.target.value)}
                    className="flex-1 p-3 bg-white border border-black/5 rounded-xl text-[15px] font-light"
                  />
                  <InputInstrument 
                    placeholder="Voiceglot Key"
                    value={link.key}
                    onChange={(e) => updateLink(idx, 'key', e.target.value)}
                    className="w-40 p-3 bg-white border border-black/5 rounded-xl text-[13px] font-light italic"
                  />
                  <button onClick={() => removeLink(idx)} className="p-2 text-black/10 hover:text-red-500 transition-colors">
                    <Trash2 size={18} strokeWidth={1.5} />
                  </button>
                </div>
              ))}
              {config.links.length === 0 && (
                <div className="py-12 text-center text-black/20 italic font-light">Geen links geconfigureerd.</div>
              )}
            </div>
          </BentoCard>

          {/* 🔘 ICONS CONFIG */}
          <BentoCard span="full" className="bg-va-black text-white p-12">
            <div className="flex items-center gap-3 mb-12">
              <Plus strokeWidth={1.5} size={24} className="text-primary" />
              <TextInstrument className="text-[15px] font-black tracking-widest uppercase text-white/30">Header Icons Zichtbaarheid</TextInstrument>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8">
              {[
                { id: 'favorites', label: 'Favorieten', icon: Heart },
                { id: 'cart', label: 'Winkelmand', icon: ShoppingBag },
                { id: 'notifications', label: 'Meldingen', icon: Bell },
                { id: 'language', label: 'Taal', icon: Globe },
                { id: 'account', label: 'Account', icon: User },
                { id: 'menu', label: 'Menu (Burger)', icon: Menu }
              ].map((icon) => (
                <button
                  key={icon.id}
                  onClick={() => toggleIcon(icon.id)}
                  className={cn(
                    "flex flex-col items-center gap-4 p-8 rounded-[32px] border transition-all duration-500 group",
                    config.icons[icon.id] 
                      ? "bg-primary/10 border-primary/20 text-primary" 
                      : "bg-white/5 border-white/5 text-white/20 grayscale"
                  )}
                >
                  <icon.icon size={32} strokeWidth={1.5} className={cn("transition-transform duration-500", config.icons[icon.id] && "scale-110")} />
                  <span className="text-[13px] font-black tracking-widest uppercase">{icon.label}</span>
                  <div className={cn(
                    "w-10 h-5 rounded-full relative transition-colors",
                    config.icons[icon.id] ? "bg-primary" : "bg-white/10"
                  )}>
                    <div className={cn(
                      "absolute top-1 w-3 h-3 rounded-full bg-white transition-all",
                      config.icons[icon.id] ? "right-1" : "left-1"
                    )} />
                  </div>
                </button>
              ))}
            </div>
          </BentoCard>
        </BentoGrid>
      )}

      <div className="fixed bottom-12 left-1/2 -translate-x-1/2 z-50">
        <ButtonInstrument 
          onClick={handleSave}
          disabled={saving}
          className={cn(
            "px-12 py-6 rounded-full font-black tracking-[0.2em] text-[15px] uppercase transition-all shadow-2xl flex items-center gap-3",
            saving ? "bg-va-black/80 cursor-wait" : "bg-primary text-va-black hover:scale-105 active:scale-95"
          )}
        >
          {saving ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} strokeWidth={1.5} />}
          OPSLAAN VOOR {selectedJourney.toUpperCase()}
        </ButtonInstrument>
      </div>
    </PageWrapperInstrument>
  );
}
