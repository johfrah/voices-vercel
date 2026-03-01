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
import { Save, Plus, Trash2, Globe, ShoppingBag, Bell, User, Menu, Heart, Loader2, ArrowLeft, Image as ImageIcon, Search, Check, X } from 'lucide-react';
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

const ROUTING_TYPES = [
  { id: 'article', label: 'Pagina (CMS)' },
  { id: 'actor', label: 'Stemacteur' },
  { id: 'workshop', label: 'Workshop' },
  { id: 'artist', label: 'Artiest' },
  { id: 'blog', label: 'Blogpost' }
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

  // DNA-PICKER STATE
  const [isPickerOpen, setIsPickerOpen] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);

  const fetchConfig = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/config?type=navigation&journey=${selectedJourney}`);
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

  // DNA-SEARCH LOGIC
  useEffect(() => {
    if (searchQuery.length < 2) {
      setSearchResults([]);
      return;
    }

    const searchDNA = async () => {
      setSearching(true);
      try {
        // We zoeken in de slug_registry voor matches
        const res = await fetch(`/api/admin/slugs?q=${encodeURIComponent(searchQuery)}`);
        const data = await res.json();
        setSearchResults(data.results || []);
      } catch (err) {
        console.error('DNA Search failed', err);
      } finally {
        setSearching(false);
      }
    };

    const timer = setTimeout(searchDNA, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const selectDNA = (index: number, item: any) => {
    const newLinks = [...config.links];
    newLinks[index] = { 
      ...newLinks[index], 
      entityId: item.entityId, 
      routingType: item.routingType,
      href: item.slug, // Fallback
      name: link.name || item.title || item.slug // Houd bestaande naam of gebruik slug
    };
    setConfig({ ...config, links: newLinks });
    setIsPickerOpen(null);
    setSearchQuery('');
    toast.success(`Gekoppeld aan ${item.routingType}: ${item.slug}`);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // Gebruik de ConfigBridge via de API route
      const res = await fetch(`/api/admin/config`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          key: `nav_${selectedJourney}`,
          value: config
        })
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
    if (config.links.length >= 6) {
      toast.error('Maximaal 6 links toegestaan in de hoofdnavigatie.');
      return;
    }
    setConfig({
      ...config,
      links: [...config.links, { name: '', href: '', key: '', entityId: null, routingType: null }]
    });
  };

  const removeLink = (index: number) => {
    const newLinks = [...config.links];
    newLinks.splice(index, 1);
    setConfig({ ...config, links: newLinks });
  };

  const updateLink = (index: number, field: string, value: any) => {
    const newLinks = [...config.links];
    newLinks[index] = { ...newLinks[index], [field]: value };
    // Als we handmatig de href aanpassen, wissen we de DNA koppeling
    if (field === 'href') {
      newLinks[index].entityId = null;
      newLinks[index].routingType = null;
    }
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
          {/*  LOGO CONFIG */}
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

          {/*  LINKS CONFIG */}
          <BentoCard span="lg" className="bg-white p-10 border border-black/5 shadow-aura">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <Menu strokeWidth={1.5} size={24} className="text-primary" />
                <TextInstrument className="text-[15px] font-black tracking-widest uppercase text-black/40">Hoofdmenu Links (Max 6)</TextInstrument>
              </div>
              <ButtonInstrument onClick={addLink} className="p-2 bg-primary/10 text-primary rounded-lg hover:bg-primary hover:text-white transition-all">
                <Plus size={20} strokeWidth={2.5} />
              </ButtonInstrument>
            </div>

            <div className="space-y-4">
              {config.links.map((link: any, idx: number) => (
                <div key={idx} className="flex flex-col gap-3 p-6 bg-va-off-white rounded-2xl border border-black/5 group relative">
                  <div className="flex items-center gap-4">
                    <div className="w-8 h-8 rounded-full bg-va-black text-white flex items-center justify-center text-[13px] font-black shrink-0">{idx + 1}</div>
                    <InputInstrument 
                      placeholder="Naam (bijv. Workshops)"
                      value={link.name}
                      onChange={(e) => updateLink(idx, 'name', e.target.value)}
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

                  <div className="flex items-center gap-3">
                    <div className="flex-1 relative">
                      <InputInstrument 
                        placeholder="URL (bijv. /studio) of koppel via DNA"
                        value={link.entityId ? `[DNA] ${link.routingType}:${link.entityId} (${link.href})` : link.href}
                        readOnly={!!link.entityId}
                        onChange={(e) => updateLink(idx, 'href', e.target.value)}
                        className={cn(
                          "w-full p-3 bg-white border border-black/5 rounded-xl text-[14px] font-light pl-10",
                          link.entityId && "bg-primary/5 border-primary/20 text-primary font-medium"
                        )}
                      />
                      <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-black/20" />
                      {link.entityId && (
                        <button 
                          onClick={() => updateLink(idx, 'href', link.href)} 
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-primary hover:text-red-500"
                        >
                          <X size={14} />
                        </button>
                      )}
                    </div>
                    
                    <ButtonInstrument 
                      onClick={() => setIsPickerOpen(idx)}
                      variant="plain"
                      size="none"
                      className="px-4 py-3 bg-va-black text-white rounded-xl text-[12px] font-black tracking-widest uppercase hover:bg-primary transition-all flex items-center gap-2"
                    >
                      DNA KOPPELEN
                    </ButtonInstrument>
                  </div>

                  {/* DNA PICKER POPOVER */}
                  {isPickerOpen === idx && (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-black/10 p-6 z-[100] animate-in fade-in slide-in-from-top-2">
                      <div className="flex items-center justify-between mb-4">
                        <TextInstrument className="text-[13px] font-black tracking-widest uppercase text-black/40">DNA Picker: Zoek Pagina of Entiteit</TextInstrument>
                        <button onClick={() => setIsPickerOpen(null)}><X size={20} className="text-black/20 hover:text-black" /></button>
                      </div>
                      
                      <div className="relative mb-6">
                        <InputInstrument 
                          autoFocus
                          placeholder="Typ naam van acteur, workshop of pagina..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="w-full p-4 pl-12 bg-va-off-white border border-black/5 rounded-xl text-[15px]"
                        />
                        <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-black/20" />
                        {searching && <Loader2 size={20} className="absolute right-4 top-1/2 -translate-y-1/2 animate-spin text-primary" />}
                      </div>

                      <div className="max-h-[300px] overflow-y-auto space-y-2 no-scrollbar">
                        {searchResults.map((result: any, rIdx: number) => (
                          <button
                            key={rIdx}
                            onClick={() => selectDNA(idx, result)}
                            className="w-full flex items-center justify-between p-4 hover:bg-va-off-white rounded-xl transition-all group border border-transparent hover:border-black/5"
                          >
                            <div className="flex items-center gap-4">
                              <div className="px-2 py-1 bg-va-black text-white text-[10px] font-black rounded uppercase tracking-widest">
                                {result.routingType}
                              </div>
                              <div className="text-left">
                                <div className="text-[15px] font-medium text-va-black">{result.title || result.slug}</div>
                                <div className="text-[12px] text-va-black/40 font-light">{result.slug}</div>
                              </div>
                            </div>
                            <Plus size={18} className="text-black/10 group-hover:text-primary transition-colors" />
                          </button>
                        ))}
                        {searchQuery.length >= 2 && searchResults.length === 0 && !searching && (
                          <div className="py-8 text-center text-black/20 italic">Geen resultaten gevonden voor "{searchQuery}"</div>
                        )}
                        {searchQuery.length < 2 && (
                          <div className="py-8 text-center text-black/20 italic">Typ minimaal 2 tekens om te zoeken...</div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}
              {config.links.length === 0 && (
                <div className="py-12 text-center text-black/20 italic font-light">Geen links geconfigureerd.</div>
              )}
            </div>
          </BentoCard>

          {/*  ICONS CONFIG */}
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
