"use client";

import { useState, useEffect } from "react";
import { 
  ContainerInstrument, 
  HeadingInstrument, 
  TextInstrument, 
  ButtonInstrument 
} from '@/components/ui/LayoutInstruments';
import { X, Loader2, Save, Music, Image as ImageIcon, Video } from "lucide-react";
import { createClient } from "@supabase/supabase-js";
import { useToast } from "@/hooks/use-toast";

// CHRIS-PROTOCOL: SDK for stability
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

interface AdemingTrackEditProps {
  track: any | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaved?: () => void;
}

export const AdemingTrackEdit = ({ track, open, onOpenChange, onSaved }: AdemingTrackEditProps) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<any>({
    title: "",
    slug: "",
    short_description: "",
    long_description: "",
    theme: "rust",
    element: "aarde",
    is_public: false,
    audio_url: "",
    cover_image_url: "",
    video_background_url: "",
    duration: 0
  });
  const { toast } = useToast();

  useEffect(() => {
    if (track) {
      setFormData({
        title: track.title || "",
        slug: track.slug || "",
        short_description: track.short_description || "",
        long_description: track.long_description || "",
        theme: track.theme || "rust",
        element: track.element || "aarde",
        is_public: track.is_public || false,
        audio_url: track.url || "", // Note: legacy column was 'url'
        cover_image_url: track.cover_image_url || "",
        video_background_url: track.video_background_url || "",
        duration: track.duration || 0
      });
    } else {
      setFormData({
        title: "",
        slug: "",
        short_description: "",
        long_description: "",
        theme: "rust",
        element: "aarde",
        is_public: false,
        audio_url: "",
        cover_image_url: "",
        video_background_url: "",
        duration: 0
      });
    }
  }, [track, open]);

  if (!open) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const trackData = {
        title: formData.title,
        slug: formData.slug || formData.title.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
        short_description: formData.short_description,
        long_description: formData.long_description,
        theme: formData.theme,
        element: formData.element,
        is_public: formData.is_public,
        url: formData.audio_url,
        cover_image_url: formData.cover_image_url,
        video_background_url: formData.video_background_url,
        duration: parseInt(formData.duration) || 0
      };

      let error;
      if (track?.id) {
        const { error: updateError } = await supabase
          .from("ademing_tracks")
          .update(trackData)
          .eq("id", track.id);
        error = updateError;
      } else {
        const { error: insertError } = await supabase
          .from("ademing_tracks")
          .insert([trackData]);
        error = insertError;
      }

      if (error) throw error;

      toast({
        title: "Succes",
        description: "Meditatie is succesvol opgeslagen.",
      });

      if (onSaved) onSaved();
      onOpenChange(false);

    } catch (error: any) {
      console.error('Save error:', error);
      toast({
        title: "Fout bij opslaan",
        description: error.message || "Onbekende fout",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-6">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => !loading && onOpenChange(false)} />
      
      <ContainerInstrument className="relative bg-white rounded-[32px] shadow-magic max-w-4xl w-full max-h-[90vh] overflow-y-auto p-12 animate-in fade-in zoom-in-95 duration-300">
        <button 
          onClick={() => onOpenChange(false)}
          className="absolute top-8 right-8 p-2 hover:bg-va-off-white rounded-full transition-all"
          disabled={loading}
        >
          <X size={20} className="text-va-black/20" />
        </button>

        <div className="mb-12">
          <HeadingInstrument level={2} className="text-3xl font-light tracking-tighter mb-2">
            {track ? "Meditatie Bewerken" : "Nieuwe Meditatie"}
          </HeadingInstrument>
          <TextInstrument className="text-va-black/40 font-light">
            Pas de details en media van de meditatie aan.
          </TextInstrument>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Left Column: Info */}
            <div className="space-y-6">
              <div>
                <label className="text-[11px] font-bold uppercase tracking-widest text-va-black/40 mb-2 block ml-1">Titel</label>
                <input 
                  type="text" 
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-3 bg-va-off-white rounded-[12px] border-none focus:ring-2 focus:ring-primary/20 transition-all font-light"
                  required
                />
              </div>

              <div>
                <label className="text-[11px] font-bold uppercase tracking-widest text-va-black/40 mb-2 block ml-1">Slug (URL)</label>
                <input 
                  type="text" 
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  className="w-full px-4 py-3 bg-va-off-white rounded-[12px] border-none focus:ring-2 focus:ring-primary/20 transition-all font-light"
                  placeholder="bijv. ochtend-rust"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[11px] font-bold uppercase tracking-widest text-va-black/40 mb-2 block ml-1">Thema</label>
                  <select 
                    value={formData.theme}
                    onChange={(e) => setFormData({ ...formData, theme: e.target.value })}
                    className="w-full px-4 py-3 bg-va-off-white rounded-[12px] border-none focus:ring-2 focus:ring-primary/20 transition-all font-light appearance-none"
                  >
                    <option value="rust">Rust</option>
                    <option value="energie">Energie</option>
                    <option value="ritme">Ritme</option>
                  </select>
                </div>
                <div>
                  <label className="text-[11px] font-bold uppercase tracking-widest text-va-black/40 mb-2 block ml-1">Element</label>
                  <select 
                    value={formData.element}
                    onChange={(e) => setFormData({ ...formData, element: e.target.value })}
                    className="w-full px-4 py-3 bg-va-off-white rounded-[12px] border-none focus:ring-2 focus:ring-primary/20 transition-all font-light appearance-none"
                  >
                    <option value="aarde">Aarde</option>
                    <option value="water">Water</option>
                    <option value="lucht">Lucht</option>
                    <option value="vuur">Vuur</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold uppercase tracking-widest text-va-black/40 mb-2 block ml-1">Korte Beschrijving</label>
                <textarea 
                  value={formData.short_description}
                  onChange={(e) => setFormData({ ...formData, short_description: e.target.value })}
                  className="w-full px-4 py-3 bg-va-off-white rounded-[12px] border-none focus:ring-2 focus:ring-primary/20 transition-all font-light min-h-[80px]"
                />
              </div>

              <div className="flex items-center gap-3 p-4 bg-primary/5 rounded-2xl border border-primary/10">
                <input 
                  type="checkbox" 
                  id="is_public"
                  checked={formData.is_public}
                  onChange={(e) => setFormData({ ...formData, is_public: e.target.checked })}
                  className="w-5 h-5 rounded-md border-primary/20 text-primary focus:ring-primary/20"
                />
                <label htmlFor="is_public" className="text-sm font-medium text-va-black/60 cursor-pointer">
                  Deze meditatie is publiek zichtbaar op de site
                </label>
              </div>
            </div>

            {/* Right Column: Media */}
            <div className="space-y-6">
              <div>
                <label className="text-[11px] font-bold uppercase tracking-widest text-va-black/40 mb-2 block ml-1 flex items-center gap-2">
                  <Music size={14} /> Audio URL
                </label>
                <input 
                  type="text" 
                  value={formData.audio_url}
                  onChange={(e) => setFormData({ ...formData, audio_url: e.target.value })}
                  className="w-full px-4 py-3 bg-va-off-white rounded-[12px] border-none focus:ring-2 focus:ring-primary/20 transition-all font-light"
                  placeholder="https://..."
                />
              </div>

              <div>
                <label className="text-[11px] font-bold uppercase tracking-widest text-va-black/40 mb-2 block ml-1 flex items-center gap-2">
                  <ImageIcon size={14} /> Cover Image URL
                </label>
                <input 
                  type="text" 
                  value={formData.cover_image_url}
                  onChange={(e) => setFormData({ ...formData, cover_image_url: e.target.value })}
                  className="w-full px-4 py-3 bg-va-off-white rounded-[12px] border-none focus:ring-2 focus:ring-primary/20 transition-all font-light"
                  placeholder="https://..."
                />
              </div>

              <div>
                <label className="text-[11px] font-bold uppercase tracking-widest text-va-black/40 mb-2 block ml-1 flex items-center gap-2">
                  <Video size={14} /> Video Background URL
                </label>
                <input 
                  type="text" 
                  value={formData.video_background_url}
                  onChange={(e) => setFormData({ ...formData, video_background_url: e.target.value })}
                  className="w-full px-4 py-3 bg-va-off-white rounded-[12px] border-none focus:ring-2 focus:ring-primary/20 transition-all font-light"
                  placeholder="https://..."
                />
              </div>

              <div>
                <label className="text-[11px] font-bold uppercase tracking-widest text-va-black/40 mb-2 block ml-1 flex items-center gap-2">
                  <Clock size={14} /> Duur (seconden)
                </label>
                <input 
                  type="number" 
                  value={formData.duration}
                  onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                  className="w-full px-4 py-3 bg-va-off-white rounded-[12px] border-none focus:ring-2 focus:ring-primary/20 transition-all font-light"
                />
              </div>

              <div className="p-6 bg-va-off-white rounded-2xl border border-black/[0.03]">
                <p className="text-[11px] font-bold uppercase tracking-widest text-va-black/20 mb-4">Media Preview</p>
                <div className="aspect-video bg-white rounded-xl border border-black/5 flex items-center justify-center overflow-hidden relative">
                  {formData.cover_image_url ? (
                    <img src={formData.cover_image_url} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <TextInstrument className="text-va-black/10 italic">Geen preview</TextInstrument>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-center gap-4 pt-8 border-t border-black/5">
            <button 
              type="button"
              onClick={() => onOpenChange(false)}
              className="px-8 py-4 rounded-xl font-medium text-va-black/40 hover:bg-va-off-white transition-all"
              disabled={loading}
            >
              Annuleren
            </button>
            <ButtonInstrument 
              type="submit"
              disabled={loading || !formData.title}
              className="px-12 py-4 !rounded-xl flex items-center gap-2 shadow-aura-lg"
            >
              {loading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Opslaan...
                </>
              ) : (
                <>
                  <Save size={18} />
                  Meditatie Opslaan
                </>
              )}
            </ButtonInstrument>
          </div>
        </form>
      </ContainerInstrument>
    </div>
  );
};
