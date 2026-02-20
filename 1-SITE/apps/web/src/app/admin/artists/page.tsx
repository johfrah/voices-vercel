"use client";

import { useState, useEffect } from 'react';
import { 
  PageWrapperInstrument, 
  SectionInstrument, 
  ContainerInstrument, 
  HeadingInstrument, 
  TextInstrument, 
  ButtonInstrument 
} from '@/components/ui/LayoutInstruments';
import { VoiceglotText } from '@/components/ui/VoiceglotText';
import { ArrowLeft, Loader2, CheckCircle2, AlertCircle, Music, Users, Heart, ExternalLink, Settings } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

export default function ArtistAdminPage() {
  const { isAdmin, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [artists, setArtists] = useState<any[]>([]);

  useEffect(() => {
    if (!authLoading && !isAdmin) {
      router.push('/admin/dashboard');
      return;
    }
    
    if (isAdmin) {
      fetchArtists();
    }
  }, [isAdmin, authLoading, router]);

  const fetchArtists = async () => {
    setLoading(true);
    try {
      // We gebruiken de bestaande actors API maar filteren op 'artist' type of specifieke slugs
      const res = await fetch('/api/admin/actors');
      const data = await res.json();
      if (data.success) {
        // Voor nu filteren we handmatig op Youssef of anderen die als artist gemarkeerd zijn
        // In de toekomst kunnen we een 'type' kolom toevoegen aan de actors tabel
        const artistList = data.actors.filter((a: any) => 
          a.slug === 'youssef' || a.styles?.includes('Artist')
        );
        setArtists(artistList);
      }
    } catch (error) {
      console.error('Failed to fetch artists:', error);
      toast.error('Fout bij laden artists');
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || !isAdmin) return null;

  return (
    <PageWrapperInstrument className="min-h-screen bg-va-off-white p-8 pt-24">
      <ContainerInstrument className="max-w-6xl mx-auto">
        <SectionInstrument className="mb-12">
          <Link href="/admin/dashboard" className="flex items-center gap-2 text-va-black/30 hover:text-primary transition-colors text-[15px] font-black tracking-widest mb-8">
            <ArrowLeft strokeWidth={1.5} size={12} /> 
            <VoiceglotText translationKey="admin.back_to_dashboard" defaultText="Terug naar Dashboard" />
          </Link>
          
          <ContainerInstrument className="flex items-center justify-between mb-6">
            <ContainerInstrument className="inline-block bg-primary/10 text-primary text-[13px] font-black px-3 py-1 rounded-full tracking-widest uppercase">
              Music Label Management
            </ContainerInstrument>
          </ContainerInstrument>
          
          <HeadingInstrument level={1} className="text-6xl font-light tracking-tighter mb-4">
            Voices Artists
          </HeadingInstrument>
          
          <TextInstrument className="text-xl text-black/40 font-medium tracking-tight max-w-2xl">
            Beheer de story-pagina&apos;s, releases en support-doelen van je label-artiesten.
          </TextInstrument>
        </SectionInstrument>

        <ContainerInstrument className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {loading ? (
            [1, 2].map(i => (
              <div key={i} className="bg-white rounded-[32px] p-8 shadow-sm border border-black/[0.03] animate-pulse h-64" />
            ))
          ) : (
            <>
              {artists.map((artist) => (
                <div key={artist.id} className="bg-white rounded-[32px] p-8 shadow-sm border border-black/[0.03] hover:shadow-aura transition-all group">
                  <div className="flex justify-between items-start mb-6">
                    <div className="w-16 h-16 rounded-2xl bg-va-off-white overflow-hidden relative">
                      {artist.photo_url ? (
                        <img src={artist.photo_url} alt={artist.firstName} className="object-cover w-full h-full" />
                      ) : (
                        <Users className="absolute inset-0 m-auto text-va-black/10" size={24} />
                      )}
                    </div>
                    <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${artist.status === 'live' ? 'bg-green-500/10 text-green-600' : 'bg-amber-500/10 text-amber-600'}`}>
                      {artist.status}
                    </div>
                  </div>
                  
                  <HeadingInstrument level={3} className="text-2xl font-light tracking-tight mb-2">
                    {artist.firstName} {artist.lastName}
                  </HeadingInstrument>
                  
                  <div className="flex items-center gap-4 mb-8 text-va-black/40 text-sm font-medium">
                    <div className="flex items-center gap-1">
                      <Music size={14} />
                      {artist.demos?.length || 0} Releases
                    </div>
                    <div className="flex items-center gap-1">
                      <Heart size={14} className="text-primary" />
                      €{artist.priceUnpaid || 0} support
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <Link 
                      href={`/artist/${artist.slug}`}
                      className="flex items-center justify-center gap-2 py-3 bg-va-off-white hover:bg-va-black hover:text-white rounded-[12px] text-[11px] font-black uppercase tracking-widest transition-all"
                    >
                      <ExternalLink size={14} />
                      Bekijk
                    </Link>
                    <Link 
                      href={`/admin/artists/${artist.id}`}
                      className="flex items-center justify-center gap-2 py-3 bg-primary text-white rounded-[12px] text-[11px] font-black uppercase tracking-widest transition-all shadow-lg shadow-primary/20"
                    >
                      <Settings size={14} />
                      Beheer
                    </Link>
                  </div>
                </div>
              ))}

              {/* Add New Artist Placeholder */}
              <div className="bg-va-off-white/50 border-2 border-dashed border-black/5 rounded-[32px] p-8 flex flex-col items-center justify-center text-center group hover:border-primary/20 transition-all cursor-not-allowed opacity-60">
                <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center mb-4 shadow-sm group-hover:scale-110 transition-transform">
                  <Users className="text-va-black/20" size={24} />
                </div>
                <TextInstrument className="text-sm font-black uppercase tracking-widest text-va-black/20">
                  Nieuwe artiest toevoegen
                </TextInstrument>
                <TextInstrument className="text-xs text-va-black/20 mt-2">
                  Binnenkort beschikbaar via de Page Architect
                </TextInstrument>
              </div>
            </>
          )}
        </ContainerInstrument>
      </ContainerInstrument>
    </PageWrapperInstrument>
  );
}
