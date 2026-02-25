"use client";

import { 
  PageWrapperInstrument, 
  SectionInstrument, 
  ContainerInstrument, 
  HeadingInstrument, 
  TextInstrument, 
  ButtonInstrument,
  LoadingScreenInstrument
} from '@/components/ui/LayoutInstruments';
import { VoiceglotText } from '@/components/ui/VoiceglotText';
import { useState, useEffect } from "react";
import { Plus, Search, Edit, Trash2, Eye, EyeOff, Sparkles, Music, Clock, User, LayoutGrid, List } from "lucide-react";
import { createClient } from "@supabase/supabase-js";
import { useToast } from "@/hooks/use-toast";
import { AdemingSmartUpload } from "@/components/ui/ademing/admin/AdemingSmartUpload";
import { AdemingTrackEdit } from "@/components/ui/ademing/admin/AdemingTrackEdit";

// CHRIS-PROTOCOL: SDK for stability
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export default function AdemingAdminPage() {
  const [tracks, setTracks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSmartUploadOpen, setIsSmartUploadOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingTrack, setEditingTrack] = useState<any | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('table');
  const { toast } = useToast();

  useEffect(() => {
    loadTracks();
  }, []);

  const loadTracks = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("ademing_tracks")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setTracks(data || []);
    } catch (error: any) {
      console.error("Error loading tracks:", error);
      toast({
        title: "Fout",
        description: "Kon meditaties niet laden: " + error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredTracks = tracks.filter(t => 
    t.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) return <LoadingScreenInstrument message="Ademing content laden..." />;

  return (
    <PageWrapperInstrument className="min-h-screen bg-va-off-white p-8 pt-24">
      <ContainerInstrument className="max-w-7xl mx-auto">
        {/* Header */}
        <SectionInstrument className="mb-12 flex justify-between items-end">
          <div>
            <HeadingInstrument level={1} className="text-5xl font-light tracking-tighter mb-4">
              Ademing Beheer
            </HeadingInstrument>
            <TextInstrument className="text-va-black/40 font-light">
              Beheer meditaties, muziek en content voor Ademing.be
            </TextInstrument>
          </div>
          <div className="flex gap-4">
            <ButtonInstrument 
              onClick={() => setIsSmartUploadOpen(true)}
              className="!bg-white !text-va-black border border-black/5 flex items-center gap-2"
            >
              <Sparkles size={18} className="text-primary" />
              Smart Upload
            </ButtonInstrument>
            <ButtonInstrument 
              onClick={() => {
                setEditingTrack(null);
                setIsEditOpen(true);
              }}
              className="!bg-va-black !text-white flex items-center gap-2"
            >
              <Plus size={18} />
              Nieuwe Meditatie
            </ButtonInstrument>
          </div>
        </SectionInstrument>

        <AdemingSmartUpload 
          open={isSmartUploadOpen} 
          onOpenChange={setIsSmartUploadOpen} 
          onComplete={loadTracks}
        />

        <AdemingTrackEdit 
          track={editingTrack}
          open={isEditOpen}
          onOpenChange={setIsEditOpen}
          onSaved={loadTracks}
        />

        {/* Stats & Search */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          <ContainerInstrument className="bg-white p-6 rounded-[20px] shadow-sm border border-black/[0.03]">
            <TextInstrument className="text-[11px] font-bold uppercase tracking-widest text-va-black/20 mb-2">Totaal</TextInstrument>
            <TextInstrument className="text-3xl font-light">{tracks.length}</TextInstrument>
          </ContainerInstrument>
          <ContainerInstrument className="bg-white p-6 rounded-[20px] shadow-sm border border-black/[0.03]">
            <TextInstrument className="text-[11px] font-bold uppercase tracking-widest text-va-black/20 mb-2">Publiek</TextInstrument>
            <TextInstrument className="text-3xl font-light text-green-600">{tracks.filter(t => t.is_public).length}</TextInstrument>
          </ContainerInstrument>
          <ContainerInstrument className="md:col-span-2 bg-white p-6 rounded-[20px] shadow-sm border border-black/[0.03] flex items-center">
            <div className="relative w-full">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-va-black/20" size={20} />
              <input 
                type="text" 
                placeholder="Zoek in meditaties..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-va-off-white rounded-[12px] border-none focus:ring-2 focus:ring-primary/20 transition-all font-light"
              />
            </div>
          </ContainerInstrument>
        </div>

        {/* Tracks Table */}
        <div className="bg-white rounded-[24px] border border-black/[0.03] shadow-aura overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-va-off-white/50 border-b border-black/[0.03]">
                <th className="px-8 py-5 text-[11px] font-bold tracking-[0.2em] text-va-black/30 uppercase">Meditatie</th>
                <th className="px-8 py-5 text-[11px] font-bold tracking-[0.2em] text-va-black/30 uppercase">Thema / Element</th>
                <th className="px-8 py-5 text-[11px] font-bold tracking-[0.2em] text-va-black/30 uppercase">Duur</th>
                <th className="px-8 py-5 text-[11px] font-bold tracking-[0.2em] text-va-black/30 uppercase">Status</th>
                <th className="px-8 py-5 text-[11px] font-bold tracking-[0.2em] text-va-black/30 uppercase text-right">Acties</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/[0.02]">
              {filteredTracks.map((track) => (
                <tr key={track.id} className="group hover:bg-va-off-white/30 transition-colors">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-primary/5 flex items-center justify-center text-primary overflow-hidden">
                        {track.cover_image_url ? (
                          <img src={track.cover_image_url} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <Music size={20} />
                        )}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[15px] font-medium text-va-black tracking-tight">{track.title}</span>
                        <span className="text-[11px] text-va-black/30 font-light italic">{track.slug}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-2">
                      <span className="px-3 py-1 bg-va-black/5 rounded-full text-[11px] font-bold uppercase tracking-widest text-va-black/40">
                        {track.theme || 'Geen'}
                      </span>
                      <span className="px-3 py-1 bg-primary/5 rounded-full text-[11px] font-bold uppercase tracking-widest text-primary/60">
                        {track.element || 'Geen'}
                      </span>
                    </div>
                  </td>
                  <td className="px-8 py-6 text-va-black/40 font-light">
                    {Math.floor(track.duration / 60)}:{(track.duration % 60).toString().padStart(2, '0')}
                  </td>
                  <td className="px-8 py-6">
                    {track.is_public ? (
                      <span className="flex items-center gap-2 text-green-600 text-[13px] font-medium">
                        <div className="w-1.5 h-1.5 rounded-full bg-green-600 animate-pulse" />
                        Live
                      </span>
                    ) : (
                      <span className="flex items-center gap-2 text-va-black/20 text-[13px] font-medium">
                        <div className="w-1.5 h-1.5 rounded-full bg-va-black/20" />
                        Concept
                      </span>
                    )}
                  </td>
                  <td className="px-8 py-6 text-right">
                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => {
                          setEditingTrack(track);
                          setIsEditOpen(true);
                        }}
                        className="p-2 hover:bg-va-black hover:text-white rounded-lg transition-all"
                      >
                        <Edit size={16} />
                      </button>
                      <button 
                        onClick={async () => {
                          const { error } = await supabase
                            .from("ademing_tracks")
                            .update({ is_public: !track.is_public })
                            .eq("id", track.id);
                          if (!error) loadTracks();
                        }}
                        className="p-2 hover:bg-va-black hover:text-white rounded-lg transition-all"
                      >
                        {track.is_public ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                      <button 
                        onClick={async () => {
                          if (confirm("Weet je zeker dat je deze meditatie wilt verwijderen?")) {
                            const { error } = await supabase
                              .from("ademing_tracks")
                              .delete()
                              .eq("id", track.id);
                            if (!error) loadTracks();
                          }
                        }}
                        className="p-2 hover:bg-red-500 hover:text-white rounded-lg transition-all"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </ContainerInstrument>
    </PageWrapperInstrument>
  );
}
