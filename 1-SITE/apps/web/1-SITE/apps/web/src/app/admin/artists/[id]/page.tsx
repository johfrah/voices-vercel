"use client";

import { useState, useEffect } from 'react';
import { 
  PageWrapperInstrument, 
  SectionInstrument, 
  ContainerInstrument, 
  HeadingInstrument, 
  TextInstrument, 
  ButtonInstrument,
  InputInstrument
} from '@/components/ui/LayoutInstruments';
import { VoiceglotText } from '@/components/ui/VoiceglotText';
import { 
  ArrowLeft, 
  Loader2, 
  Save, 
  Music, 
  Image as ImageIcon, 
  Plus, 
  Trash2, 
  ExternalLink, 
  Globe, 
  Youtube, 
  Instagram, 
  Linkedin,
  Heart,
  Settings,
  Users
} from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import Image from 'next/image';

export default function ArtistDetailAdminPage({ params }: { params: { id: string } }) {
  const { isAdmin, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [artist, setArtist] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'general' | 'music' | 'gallery' | 'streaming'>('general');

  useEffect(() => {
    if (!authLoading && !isAdmin) {
      router.push('/admin/dashboard');
      return;
    }
    
    if (isAdmin) {
      fetchArtist();
    }
  }, [isAdmin, authLoading, router, params.id]);

  const fetchArtist = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/actors');
      const data = await res.json();
      if (data.success) {
        const found = data.actors.find((a: any) => a.slug === params.slug || a.id.toString() === params.id);
        if (found) {
          // Parse extra metadata if stored in extraLangs or similar
          let metadata = {};
          try {
            if (found.extraLangs && found.extraLangs.startsWith('{')) {
              metadata = JSON.parse(found.extraLangs);
            }
          } catch (e) {}
          
          // Map demos to songs for the UI
          const songs = (found.demos || []).map((d: any) => ({
            id: d.id,
            title: d.title || d.name,
            category: d.category || d.type,
            audio_url: d.audio_url || d.url
          }));

          setArtist({ ...found, metadata, demos: songs });
        } else {
          toast.error('Artist niet gevonden');
          router.push('/admin/artists');
        }
      }
    } catch (error) {
      console.error('Failed to fetch artist:', error);
      toast.error('Fout bij laden data');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/actors/${params.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...artist,
          extra_langs: JSON.stringify(artist.metadata)
        })
      });

      if (res.ok) {
        toast.success('Artist succesvol bijgewerkt');
        router.refresh();
      } else {
        throw new Error('Save failed');
      }
    } catch (error) {
      toast.error('Opslaan mislukt');
    } finally {
      setSaving(false);
    }
  };

  if (authLoading || !isAdmin || !artist) {
    if (loading) return (
      <div className="min-h-screen bg-va-off-white flex items-center justify-center">
        <Loader2 className="animate-spin text-primary" size={40} />
      </div>
    );
    return null;
  }

  return (
    <PageWrapperInstrument className="min-h-screen bg-va-off-white p-8 pt-24">
      <ContainerInstrument className="max-w-6xl mx-auto">
        {/* Header */}
        <SectionInstrument className="mb-12 flex justify-between items-end">
          <div className="space-y-4">
            <Link href="/admin/artists" className="flex items-center gap-2 text-va-black/30 hover:text-primary transition-colors text-[15px] font-black tracking-widest">
              <ArrowLeft strokeWidth={1.5} size={12} /> 
              Terug naar overzicht
            </Link>
            <div className="flex items-center gap-6">
              <div className="w-20 h-20 rounded-2xl bg-white overflow-hidden shadow-sm border border-black/5 relative">
                {artist.photo_url ? (
                  <Image src={artist.photo_url} alt="" fill className="object-cover" />
                ) : (
                  <Users className="absolute inset-0 m-auto text-va-black/10" size={32} />
                )}
              </div>
              <div>
                <HeadingInstrument level={1} className="text-5xl font-light tracking-tighter">
                  {artist.firstName} {artist.lastName}
                </HeadingInstrument>
                <div className="flex items-center gap-4 mt-2">
                  <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-[10px] font-black uppercase tracking-widest">
                    {artist.slug}
                  </span>
                  <Link href={`/artist/${artist.slug}`} target="_blank" className="text-va-black/40 hover:text-primary transition-all flex items-center gap-1 text-xs font-medium">
                    <ExternalLink size={12} />
                    Bekijk live pagina
                  </Link>
                </div>
              </div>
            </div>
          </div>

          <ButtonInstrument 
            onClick={handleSave}
            disabled={saving}
            className="!bg-va-black !text-white !rounded-full !px-10 !py-4 flex items-center gap-2 shadow-lg group"
          >
            {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
            <span className="text-xs font-black uppercase tracking-widest">Opslaan</span>
          </ButtonInstrument>
        </SectionInstrument>

        {/* Tabs */}
        <div className="flex gap-2 mb-8 bg-white/50 p-1.5 rounded-2xl border border-black/[0.03] w-fit">
          {[
            { id: 'general', label: 'Algemeen', icon: Settings },
            { id: 'music', label: 'Songs & Releases', icon: Music },
            { id: 'gallery', label: 'Gallery', icon: ImageIcon },
            { id: 'streaming', label: 'Streaming & Socials', icon: Globe }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                activeTab === tab.id 
                  ? 'bg-white text-va-black shadow-sm' 
                  : 'text-va-black/30 hover:text-va-black hover:bg-white/50'
              }`}
            >
              <tab.icon size={14} />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="bg-white rounded-[32px] p-10 shadow-sm border border-black/[0.03]">
          {activeTab === 'general' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              <div className="space-y-8">
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-va-black/30 mb-3 ml-1">Voornaam</label>
                  <InputInstrument 
                    value={artist.firstName}
                    onChange={(e) => setArtist({...artist, firstName: e.target.value})}
                    className="bg-va-off-white border-none rounded-xl p-4 w-full focus:ring-2 focus:ring-primary/20"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-va-black/30 mb-3 ml-1">Achternaam</label>
                  <InputInstrument 
                    value={artist.lastName}
                    onChange={(e) => setArtist({...artist, lastName: e.target.value})}
                    className="bg-va-off-white border-none rounded-xl p-4 w-full focus:ring-2 focus:ring-primary/20"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-va-black/30 mb-3 ml-1">E-mailadres (Beheer)</label>
                  <InputInstrument 
                    value={artist.email}
                    onChange={(e) => setArtist({...artist, email: e.target.value})}
                    className="bg-va-off-white border-none rounded-xl p-4 w-full focus:ring-2 focus:ring-primary/20"
                  />
                </div>
              </div>
              <div className="space-y-8">
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-va-black/30 mb-3 ml-1">Support Doel (€)</label>
                  <InputInstrument 
                    type="number"
                    value={artist.metadata.donation_goal || 1500}
                    onChange={(e) => setArtist({...artist, metadata: { ...artist.metadata, donation_goal: parseInt(e.target.value) }})}
                    className="bg-va-off-white border-none rounded-xl p-4 w-full focus:ring-2 focus:ring-primary/20"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-va-black/30 mb-3 ml-1">Huidige Support (€)</label>
                  <InputInstrument 
                    type="number"
                    value={artist.priceUnpaid || 0}
                    onChange={(e) => setArtist({...artist, priceUnpaid: e.target.value})}
                    className="bg-va-off-white border-none rounded-xl p-4 w-full focus:ring-2 focus:ring-primary/20"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-va-black/30 mb-3 ml-1">Biografie (Short)</label>
                  <textarea 
                    value={artist.bio}
                    onChange={(e) => setArtist({...artist, bio: e.target.value})}
                    className="bg-va-off-white border-none rounded-xl p-4 w-full focus:ring-2 focus:ring-primary/20 min-h-[120px] resize-none text-sm font-medium"
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'music' && (
            <div className="space-y-8">
              <div className="flex justify-between items-center mb-4">
                <HeadingInstrument level={3} className="text-2xl font-light tracking-tight">Songs & Releases</HeadingInstrument>
                <ButtonInstrument className="!bg-primary/10 !text-primary !rounded-full !px-6 !py-2.5 flex items-center gap-2 hover:!bg-primary hover:!text-white transition-all">
                  <Plus size={14} />
                  <span className="text-[10px] font-black uppercase tracking-widest">Nieuwe song</span>
                </ButtonInstrument>
              </div>
              
              <div className="grid grid-cols-1 gap-4">
                {artist.demos?.map((song: any, i: number) => (
                  <div key={i} className="flex items-center justify-between p-6 bg-va-off-white rounded-2xl group hover:bg-white hover:shadow-aura transition-all border border-transparent hover:border-black/5">
                    <div className="flex items-center gap-6">
                      <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center text-primary font-black shadow-sm">
                        {i + 1}
                      </div>
                      <div>
                        <HeadingInstrument level={4} className="text-base font-bold tracking-tight">{song.title}</HeadingInstrument>
                        <TextInstrument className="text-xs text-va-black/30 font-medium uppercase tracking-widest mt-1">{song.category}</TextInstrument>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="p-2.5 text-va-black/20 hover:text-va-black transition-colors"><Settings size={16} /></button>
                      <button className="p-2.5 text-va-black/20 hover:text-red-500 transition-colors"><Trash2 size={16} /></button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'gallery' && (
            <div className="space-y-8">
              <div className="flex justify-between items-center mb-4">
                <HeadingInstrument level={3} className="text-2xl font-light tracking-tight">Visual Journey</HeadingInstrument>
                <ButtonInstrument className="!bg-primary/10 !text-primary !rounded-full !px-6 !py-2.5 flex items-center gap-2 hover:!bg-primary hover:!text-white transition-all">
                  <Plus size={14} />
                  <span className="text-[10px] font-black uppercase tracking-widest">Foto uploaden</span>
                </ButtonInstrument>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
                {/* We simulate gallery from photo_url and placeholder logic for now */}
                {[1, 2, 3, 4, 5, 6, 7].map((num) => (
                  <div key={num} className="relative aspect-[3/4] rounded-2xl overflow-hidden group border border-black/5 shadow-sm">
                    <img 
                      src={`https://vcbxyyjsxuquytcsskpj.supabase.co/storage/v1/object/public/voices/2026/01/youssef-zaki-${num}.webp`} 
                      alt="" 
                      className="object-cover w-full h-full transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-va-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <button className="w-10 h-10 rounded-full bg-white text-va-black flex items-center justify-center hover:scale-110 transition-transform shadow-lg"><Trash2 size={16} /></button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'streaming' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              <div className="space-y-8">
                <HeadingInstrument level={3} className="text-xl font-light tracking-tight mb-4">Streaming Links</HeadingInstrument>
                <div>
                  <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-va-black/30 mb-3 ml-1">
                    <Music size={12} /> Spotify URL
                  </label>
                  <InputInstrument 
                    value={artist.metadata.spotifyUrl || ''}
                    onChange={(e) => setArtist({...artist, metadata: { ...artist.metadata, spotifyUrl: e.target.value }})}
                    placeholder="https://open.spotify.com/artist/..."
                    className="bg-va-off-white border-none rounded-xl p-4 w-full focus:ring-2 focus:ring-primary/20"
                  />
                </div>
                <div>
                  <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-va-black/30 mb-3 ml-1">
                    <Music size={12} /> Apple Music URL
                  </label>
                  <InputInstrument 
                    value={artist.metadata.appleMusicUrl || ''}
                    onChange={(e) => setArtist({...artist, metadata: { ...artist.metadata, appleMusicUrl: e.target.value }})}
                    placeholder="https://music.apple.com/artist/..."
                    className="bg-va-off-white border-none rounded-xl p-4 w-full focus:ring-2 focus:ring-primary/20"
                  />
                </div>
                <div>
                  <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-va-black/30 mb-3 ml-1">
                    <Youtube size={12} /> YouTube Channel
                  </label>
                  <InputInstrument 
                    value={artist.youtubeUrl || ''}
                    onChange={(e) => setArtist({...artist, youtubeUrl: e.target.value})}
                    className="bg-va-off-white border-none rounded-xl p-4 w-full focus:ring-2 focus:ring-primary/20"
                  />
                </div>
              </div>
              <div className="space-y-8">
                <HeadingInstrument level={3} className="text-xl font-light tracking-tight mb-4">Social Media</HeadingInstrument>
                <div>
                  <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-va-black/30 mb-3 ml-1">
                    <Instagram size={12} /> Instagram
                  </label>
                  <InputInstrument 
                    value={artist.website || ''}
                    onChange={(e) => setArtist({...artist, website: e.target.value})}
                    className="bg-va-off-white border-none rounded-xl p-4 w-full focus:ring-2 focus:ring-primary/20"
                  />
                </div>
                <div>
                  <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-va-black/30 mb-3 ml-1">
                    <Linkedin size={12} /> LinkedIn
                  </label>
                  <InputInstrument 
                    value={artist.linkedin || ''}
                    onChange={(e) => setArtist({...artist, linkedin: e.target.value})}
                    className="bg-va-off-white border-none rounded-xl p-4 w-full focus:ring-2 focus:ring-primary/20"
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </ContainerInstrument>
    </PageWrapperInstrument>
  );
}
