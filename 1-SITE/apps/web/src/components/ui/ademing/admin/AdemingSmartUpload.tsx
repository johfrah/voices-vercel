"use client";

import { useState, useEffect } from "react";
import { 
  ContainerInstrument, 
  HeadingInstrument, 
  TextInstrument, 
  ButtonInstrument 
} from '@/components/ui/LayoutInstruments';
import { Sparkles, Upload, Check, X, Loader2, Music, Globe, FileText, Save } from "lucide-react";
import { createClient } from "@supabase/supabase-js";
import { useToast } from "@/hooks/use-toast";

// CHRIS-PROTOCOL: SDK for stability
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

interface SmartUploadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onComplete?: () => void;
}

export const AdemingSmartUpload = ({ open, onOpenChange, onComplete }: SmartUploadDialogProps) => {
  const [step, setStep] = useState<'upload' | 'review'>('upload');
  const [uploading, setUploading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [audioUrl, setAudioUrl] = useState("");
  const [editedData, setEditedData] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'content' | 'seo' | 'transcript'>('content');
  const { toast } = useToast();

  if (!open) return null;

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setAudioFile(file);
  };

  const handleUploadAndAnalyze = async () => {
    if (!audioFile) return;

    try {
      setUploading(true);
      
      // 1. Upload to Storage
      const fileName = `ademing/${Date.now()}-${audioFile.name}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("voices")
        .upload(fileName, audioFile);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from("voices")
        .getPublicUrl(uploadData.path);

      setAudioUrl(publicUrl);
      setUploading(false);
      setAnalyzing(true);

      toast({
        title: "🤖 AI Analyse gestart",
        description: "De meditatie wordt getranscribeerd en geanalyseerd...",
      });

      // 2. Invoke AI Analysis (Legacy Edge Function)
      const { data: analysisData, error: analysisError } = await supabase.functions.invoke(
        'smart-analyze-content',
        {
          body: {
            audioUrl: publicUrl,
            contentType: 'meditation'
          }
        }
      );

      if (analysisError) throw analysisError;

      if (analysisData.success) {
        setEditedData({
          ...analysisData.metadata,
          transcript: analysisData.transcript,
          audio_url: publicUrl
        });
        setStep('review');
        toast({
          title: "✨ Analyse voltooid",
          description: "Review de AI-voorstellen en pas aan waar nodig.",
        });
      } else {
        throw new Error(analysisData.error || "Analyse mislukt");
      }

    } catch (error: any) {
      console.error('Upload/Analysis error:', error);
      toast({
        title: "Fout bij verwerken",
        description: error.message || "Onbekende fout",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
      setAnalyzing(false);
    }
  };

  const handleSave = async () => {
    if (!editedData) return;
    setSaving(true);

    try {
      const slug = editedData.seo_metadata?.canonical_slug || 
                   editedData.title.toLowerCase().replace(/[^a-z0-9]+/g, "-");

      const trackData = {
        title: editedData.title,
        slug,
        short_description: editedData.short_description,
        long_description: editedData.long_description,
        theme: editedData.theme,
        element: editedData.element,
        is_public: false,
        url: audioUrl,
        transcript: editedData.transcript,
        tags: editedData.tags,
        seo_metadata: editedData.seo_metadata,
        duration: 600 // Default, should be from metadata if available
      };

      const { error } = await supabase
        .from("ademing_tracks")
        .insert([trackData]);

      if (error) throw error;

      toast({
        title: "🎉 Opgeslagen!",
        description: "De meditatie is aangemaakt als concept.",
      });

      if (onComplete) onComplete();
      onOpenChange(false);
      setStep('upload');
      setEditedData(null);
      setAudioFile(null);

    } catch (error: any) {
      console.error('Save error:', error);
      toast({
        title: "Fout bij opslaan",
        description: error.message || "Onbekende fout",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-6">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => !uploading && !analyzing && !saving && onOpenChange(false)} />
      
      <ContainerInstrument className={`relative bg-white rounded-[32px] shadow-magic w-full transition-all duration-500 overflow-hidden ${step === 'review' ? 'max-w-5xl h-[90vh]' : 'max-w-xl'}`}>
        <button 
          onClick={() => onOpenChange(false)}
          className="absolute top-8 right-8 p-2 hover:bg-va-off-white rounded-full transition-all z-10"
          disabled={uploading || analyzing || saving}
        >
          <X size={20} className="text-va-black/20" />
        </button>

        {step === 'upload' ? (
          <div className="p-12">
            <div className="text-center mb-12">
              <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center text-primary mx-auto mb-6">
                <Sparkles size={32} className={analyzing ? "animate-spin" : "animate-pulse"} />
              </div>
              <HeadingInstrument level={2} className="text-3xl font-light tracking-tighter mb-2">
                Smart Upload
              </HeadingInstrument>
              <TextInstrument className="text-va-black/40 font-light">
                AI analyseert je audio en vult automatisch alle velden in.
              </TextInstrument>
            </div>

            <div className="space-y-8">
              <div className="border-2 border-dashed border-primary/20 rounded-[24px] p-12 text-center hover:bg-primary/[0.02] transition-all cursor-pointer relative group">
                <input 
                  type="file" 
                  accept="audio/*" 
                  onChange={handleFileSelect}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                  disabled={uploading || analyzing}
                />
                <Upload className="h-12 w-12 mx-auto mb-4 text-primary/40 group-hover:scale-110 transition-transform" />
                <p className="text-lg font-medium text-va-black/60">
                  {audioFile ? audioFile.name : "Klik of sleep audio hierheen"}
                </p>
                <p className="text-sm text-va-black/20 mt-2">MP3, WAV of M4A (max 50MB)</p>
              </div>

              {audioFile && (
                <div className="flex items-center gap-3 p-4 bg-green-50 rounded-xl border border-green-100">
                  <Check className="h-5 w-5 text-green-500" />
                  <span className="text-sm font-medium text-green-700 flex-1 truncate">{audioFile.name}</span>
                  <button onClick={() => setAudioFile(null)} className="text-green-700/40 hover:text-green-700">
                    <X size={16} />
                  </button>
                </div>
              )}

              <ButtonInstrument 
                onClick={handleUploadAndAnalyze}
                disabled={!audioFile || uploading || analyzing}
                className="w-full !py-6 !text-lg !rounded-[16px] flex items-center justify-center gap-3"
              >
                {uploading ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Audio uploaden...
                  </>
                ) : analyzing ? (
                  <>
                    <Sparkles className="h-5 w-5 animate-pulse" />
                    AI analyseert content...
                  </>
                ) : (
                  <>
                    <Sparkles size={20} />
                    Start Smart Upload
                  </>
                )}
              </ButtonInstrument>
            </div>
          </div>
        ) : (
          <div className="flex flex-col h-full">
            {/* Review Header */}
            <div className="p-12 pb-6 border-b border-black/5">
              <div className="flex items-center gap-4 mb-2">
                <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center text-green-600">
                  <Check size={20} />
                </div>
                <HeadingInstrument level={2} className="text-3xl font-light tracking-tighter">
                  AI Review
                </HeadingInstrument>
              </div>
              <TextInstrument className="text-va-black/40 font-light">
                Controleer de gegenereerde content en pas aan waar nodig.
              </TextInstrument>

              {/* Tabs */}
              <div className="flex gap-8 mt-8">
                {[
                  { id: 'content', label: 'Content', icon: Music },
                  { id: 'seo', label: 'SEO', icon: Globe },
                  { id: 'transcript', label: 'Transcript', icon: FileText },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex items-center gap-2 pb-4 text-sm font-medium transition-all border-b-2 ${activeTab === tab.id ? 'border-primary text-va-black' : 'border-transparent text-va-black/30 hover:text-va-black/60'}`}
                  >
                    <tab.icon size={16} />
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Review Content */}
            <div className="flex-1 overflow-y-auto p-12 pt-8">
              {activeTab === 'content' && (
                <div className="grid grid-cols-2 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="space-y-6">
                    <div>
                      <label className="text-[11px] font-bold uppercase tracking-widest text-va-black/40 mb-2 block ml-1">Titel</label>
                      <input 
                        type="text" 
                        value={editedData.title}
                        onChange={(e) => setEditedData({ ...editedData, title: e.target.value })}
                        className="w-full px-4 py-3 bg-va-off-white rounded-[12px] border-none focus:ring-2 focus:ring-primary/20 transition-all font-light"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-[11px] font-bold uppercase tracking-widest text-va-black/40 mb-2 block ml-1">Thema</label>
                        <select 
                          value={editedData.theme}
                          onChange={(e) => setEditedData({ ...editedData, theme: e.target.value })}
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
                          value={editedData.element}
                          onChange={(e) => setEditedData({ ...editedData, element: e.target.value })}
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
                        value={editedData.short_description}
                        onChange={(e) => setEditedData({ ...editedData, short_description: e.target.value })}
                        className="w-full px-4 py-3 bg-va-off-white rounded-[12px] border-none focus:ring-2 focus:ring-primary/20 transition-all font-light min-h-[100px]"
                      />
                    </div>
                  </div>
                  <div className="space-y-6">
                    <div>
                      <label className="text-[11px] font-bold uppercase tracking-widest text-va-black/40 mb-2 block ml-1">Lange Beschrijving</label>
                      <textarea 
                        value={editedData.long_description}
                        onChange={(e) => setEditedData({ ...editedData, long_description: e.target.value })}
                        className="w-full px-4 py-3 bg-va-off-white rounded-[12px] border-none focus:ring-2 focus:ring-primary/20 transition-all font-light min-h-[200px]"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-bold uppercase tracking-widest text-va-black/40 mb-2 block ml-1">Tags</label>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {editedData.tags?.map((tag: string, i: number) => (
                          <span key={i} className="px-3 py-1 bg-va-black/5 rounded-full text-[11px] font-bold uppercase tracking-widest text-va-black/40">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'seo' && (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-2xl mx-auto">
                  <div>
                    <label className="text-[11px] font-bold uppercase tracking-widest text-va-black/40 mb-2 block ml-1">SEO Titel</label>
                    <input 
                      type="text" 
                      value={editedData.seo_metadata?.seo_title}
                      onChange={(e) => setEditedData({ 
                        ...editedData, 
                        seo_metadata: { ...editedData.seo_metadata, seo_title: e.target.value } 
                      })}
                      className="w-full px-4 py-3 bg-va-off-white rounded-[12px] border-none focus:ring-2 focus:ring-primary/20 transition-all font-light"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold uppercase tracking-widest text-va-black/40 mb-2 block ml-1">Meta Beschrijving</label>
                    <textarea 
                      value={editedData.seo_metadata?.meta_description}
                      onChange={(e) => setEditedData({ 
                        ...editedData, 
                        seo_metadata: { ...editedData.seo_metadata, meta_description: e.target.value } 
                      })}
                      className="w-full px-4 py-3 bg-va-off-white rounded-[12px] border-none focus:ring-2 focus:ring-primary/20 transition-all font-light min-h-[120px]"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold uppercase tracking-widest text-va-black/40 mb-2 block ml-1">Focus Keyword</label>
                    <input 
                      type="text" 
                      value={editedData.seo_metadata?.focus_keyword}
                      onChange={(e) => setEditedData({ 
                        ...editedData, 
                        seo_metadata: { ...editedData.seo_metadata, focus_keyword: e.target.value } 
                      })}
                      className="w-full px-4 py-3 bg-va-off-white rounded-[12px] border-none focus:ring-2 focus:ring-primary/20 transition-all font-light"
                    />
                  </div>
                </div>
              )}

              {activeTab === 'transcript' && (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 h-full">
                  <textarea 
                    value={editedData.transcript}
                    onChange={(e) => setEditedData({ ...editedData, transcript: e.target.value })}
                    className="w-full h-full px-8 py-6 bg-va-off-white rounded-[24px] border-none focus:ring-2 focus:ring-primary/20 transition-all font-mono text-sm leading-relaxed"
                  />
                </div>
              )}
            </div>

            {/* Review Footer */}
            <div className="p-12 pt-6 border-t border-black/5 bg-va-off-white/30 flex justify-between items-center">
              <button 
                onClick={() => setStep('upload')}
                className="text-va-black/40 hover:text-va-black font-medium transition-all"
                disabled={saving}
              >
                Opnieuw uploaden
              </button>
              <ButtonInstrument 
                onClick={handleSave}
                disabled={saving}
                className="px-12 py-4 !rounded-xl flex items-center gap-2 shadow-aura-lg"
              >
                {saving ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    Opslaan...
                  </>
                ) : (
                  <>
                    <Save size={18} />
                    Opslaan als Concept
                  </>
                )}
              </ButtonInstrument>
            </div>
          </div>
        )}
      </ContainerInstrument>
    </div>
  );
};
