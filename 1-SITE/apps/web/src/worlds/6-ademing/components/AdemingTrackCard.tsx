"use client";

import { Play, Heart, MessageCircle, Clock, UserCircle } from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { ElementIcon } from "./ElementIcon";

import { VoiceglotText } from "@/components/ui/VoiceglotText";
import { useEditMode } from "@/contexts/EditModeContext";
import { Lock } from "lucide-react";
import { 
  ContainerInstrument, 
  HeadingInstrument, 
  TextInstrument 
} from "@/components/ui/LayoutInstruments";

interface AdemingTrackCardProps {
  track: any;
  onClick?: () => void;
  variant?: "default" | "compact";
}

const elementColors: Record<string, string> = {
  aarde: "bg-element-aarde-soft text-element-aarde",
  water: "bg-element-water-soft text-element-water",
  lucht: "bg-element-lucht-soft text-element-lucht",
  vuur: "bg-element-vuur-soft text-element-vuur",
};

export const AdemingTrackCard = ({ track, onClick, variant = "default" }: AdemingTrackCardProps) => {
  const { isEditMode } = useEditMode();

  if (variant === "compact") {
    return (
      <ContainerInstrument 
        onClick={onClick}
        className="flex items-center gap-3 p-3 bg-white rounded-xl hover:shadow-soft transition-all cursor-pointer group animate-fade-in"
      >
        <ContainerInstrument className="relative flex-shrink-0 w-16 h-16 overflow-hidden rounded-lg">
          <Image
            src={track.cover_image_url}
            alt=""
            fill
            sizes="64px"
            className="w-full h-full object-cover"
          />
          <ContainerInstrument className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-opacity" />
          <ContainerInstrument className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <Play size={16} fill="currentColor" className="text-white ml-0.5" />
          </ContainerInstrument>
        </ContainerInstrument>
        
        <ContainerInstrument className="flex-1 min-w-0">
          <HeadingInstrument level={3} className="font-serif font-semibold text-sm truncate">
            <VoiceglotText 
              translationKey={`ademing.track.${track.id}.title`} 
              defaultText={track.title} 
            />
          </HeadingInstrument>
          <TextInstrument className="text-xs text-muted-foreground truncate">
            <VoiceglotText 
              translationKey={`ademing.track.${track.id}.short_description`} 
              defaultText={track.short_description} 
            />
          </TextInstrument>
          <ContainerInstrument className="flex items-center gap-2 mt-1">
            <TextInstrument as="span" className="text-[9px] font-bold uppercase tracking-widest text-primary/60">
              <VoiceglotText 
                translationKey={`ademing.track.${track.id}.maker`} 
                defaultText={track.maker || "Julie"} 
              />
            </TextInstrument>
            <TextInstrument as="span" className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">
              {track.duration ? `${Math.floor(track.duration / 60)} min` : "10 min"}
            </TextInstrument>
          </ContainerInstrument>
        </ContainerInstrument>
      </ContainerInstrument>
    );
  }

  return (
    <motion.div 
      whileHover={{ y: -8, scale: 1.02 }}
      onClick={onClick}
      className={cn(
        "bg-white rounded-[32px] overflow-hidden shadow-soft hover:shadow-medium transition-all duration-500 cursor-pointer group relative",
        isEditMode && "ring-2 ring-primary/20"
      )}
    >
      {isEditMode && (
        <ContainerInstrument className="absolute top-4 right-4 z-50 bg-va-black text-white px-3 py-1 rounded-full text-[10px] font-black tracking-widest flex items-center gap-2 shadow-aura">
          <Lock size={10} className="text-primary" />
          EDIT MODE: {track.id}
        </ContainerInstrument>
      )}
      <ContainerInstrument className="relative aspect-[4/5]">
        <Image 
          src={track.cover_image_url} 
          alt="" 
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" 
        />
        <ContainerInstrument className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />
        
        <ContainerInstrument className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all scale-75 group-hover:scale-100 duration-500">
          <ContainerInstrument className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-white flex items-center justify-center shadow-2xl">
            <Play size={28} fill="currentColor" className="ml-1" />
          </ContainerInstrument>
        </ContainerInstrument>

        {track.element && (
          <ContainerInstrument className={cn(
            "absolute top-6 left-6 px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-[0.2em] z-10 backdrop-blur-md border border-white/20 flex items-center gap-2",
            elementColors[track.element] || "bg-primary/20 text-white"
          )}>
            <ElementIcon element={track.element} size={12} animated={false} className="text-current" />
            {track.element}
          </ContainerInstrument>
        )}
      </ContainerInstrument>

      <ContainerInstrument className="p-6 space-y-3">
        <HeadingInstrument level={3} className="font-serif text-xl font-bold text-foreground line-clamp-1 group-hover:text-primary transition-colors">
          <VoiceglotText 
            translationKey={`ademing.track.${track.id}.title`} 
            defaultText={track.title} 
          />
        </HeadingInstrument>
        <TextInstrument className="text-sm text-muted-foreground line-clamp-2 leading-relaxed font-light">
          <VoiceglotText 
            translationKey={`ademing.track.${track.id}.short_description`} 
            defaultText={track.short_description || "Een moment van rust."} 
          />
        </TextInstrument>
        
        <ContainerInstrument className="pt-3 flex items-center justify-between border-t border-black/5">
          <ContainerInstrument className="flex items-center gap-2">
            <ContainerInstrument className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center">
              <UserCircle size={10} className="text-primary" />
            </ContainerInstrument>
            <TextInstrument as="span" className="text-[9px] font-bold text-va-black/40 uppercase tracking-widest">
              <VoiceglotText 
                translationKey={`ademing.track.${track.id}.maker`} 
                defaultText={track.maker || "Julie"} 
              />
            </TextInstrument>
          </ContainerInstrument>
          <ContainerInstrument className="flex items-center gap-2">
            <Clock size={10} className="text-va-black/20" />
            <TextInstrument as="span" className="text-[9px] font-bold text-va-black/40 uppercase tracking-widest">
              {track.duration ? `${Math.floor(track.duration / 60)} min` : "10 min"}
            </TextInstrument>
          </ContainerInstrument>
        </ContainerInstrument>
      </ContainerInstrument>
    </motion.div>
  );
};
