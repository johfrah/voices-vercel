"use client";

import { useState, useEffect } from "react";
import { 
  ContainerInstrument, 
  HeadingInstrument, 
  TextInstrument, 
  ButtonInstrument 
} from '@/components/ui/LayoutInstruments';
import { Sparkles, Upload, Check, X, Loader2 } from "lucide-react";
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
  const [uploading, setUploading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [audioFile, setAudioFile] = useState<File | null>(null);
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

      setUploading(false);
      setAnalyzing(true);

      toast({
        title: "🤖 AI Analyse gestart",
        description: "De meditatie wordt getranscribeerd en geanalyseerd...",
      });

      // 2. Invoke AI Analysis (Legacy Edge Function)
      // Note: We use the existing 'smart-analyze-content' if available
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

      toast({
        title: "✨ Analyse voltooid",
        description: "De meditatie is succesvol geanalyseerd en opgeslagen als concept.",
      });

      if (onComplete) onComplete();
      onOpenChange(false);

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

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-6">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => !uploading && !analyzing && onOpenChange(false)} />
      
      <ContainerInstrument className="relative bg-white rounded-[32px] shadow-magic max-w-xl w-full p-12 animate-in fade-in zoom-in-95 duration-300">
        <button 
          onClick={() => onOpenChange(false)}
          className="absolute top-8 right-8 p-2 hover:bg-va-off-white rounded-full transition-all"
          disabled={uploading || analyzing}
        >
          <X size={20} className="text-va-black/20" />
        </button>

        <div className="text-center mb-12">
          <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center text-primary mx-auto mb-6">
            <Sparkles size={32} className="animate-pulse" />
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
      </ContainerInstrument>
    </div>
  );
};
