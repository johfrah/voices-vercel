"use client";

import { Play, Heart, MessageCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

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
  if (variant === "compact") {
    return (
      <div 
        onClick={onClick}
        className="flex items-center gap-3 p-3 bg-white rounded-xl hover:shadow-soft transition-all cursor-pointer group animate-fade-in"
      >
        <div className="relative flex-shrink-0 w-16 h-16 overflow-hidden rounded-lg">
          <img
            src={track.cover_image_url}
            alt=""
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-opacity" />
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <Play size={16} fill="currentColor" className="text-white ml-0.5" />
          </div>
        </div>
        
        <div className="flex-1 min-w-0">
          <h3 className="font-serif font-semibold text-sm truncate">{track.title}</h3>
          <p className="text-xs text-muted-foreground truncate">
            {track.short_description}
          </p>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-[9px] font-bold uppercase tracking-widest text-primary/60">
              {track.maker || "Julie"}
            </span>
            <span className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">
              {track.duration ? `${Math.floor(track.duration / 60)} min` : "10 min"}
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <motion.div 
      whileHover={{ y: -8, scale: 1.02 }}
      onClick={onClick}
      className="bg-white rounded-[32px] overflow-hidden shadow-soft hover:shadow-medium transition-all duration-500 cursor-pointer group"
    >
      <div className="relative aspect-[4/5]">
        <img 
          src={track.cover_image_url} 
          alt="" 
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" 
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />
        
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all scale-75 group-hover:scale-100 duration-500">
          <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-white flex items-center justify-center shadow-2xl">
            <Play size={28} fill="currentColor" className="ml-1" />
          </div>
        </div>

        {track.element && (
          <div className={cn(
            "absolute top-6 left-6 px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-[0.2em] z-10 backdrop-blur-md border border-white/20",
            elementColors[track.element] || "bg-primary/20 text-white"
          )}>
            {track.element}
          </div>
        )}
      </div>

      <div className="p-8 space-y-4">
        <h3 className="font-serif text-2xl font-bold text-foreground line-clamp-1 group-hover:text-primary transition-colors">
          {track.title}
        </h3>
        <p className="text-muted-foreground line-clamp-2 leading-relaxed font-light">
          {track.short_description || "Een moment van rust."}
        </p>
        
        <div className="pt-4 flex items-center justify-between border-t border-black/5">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
              <User size={12} className="text-primary" />
            </div>
            <span className="text-[11px] font-bold text-va-black/40 uppercase tracking-widest">
              {track.maker || "Julie"}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Clock size={12} className="text-va-black/20" />
            <span className="text-[11px] font-bold text-va-black/40 uppercase tracking-widest">
              {track.duration ? `${Math.floor(track.duration / 60)} min` : "10 min"}
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
