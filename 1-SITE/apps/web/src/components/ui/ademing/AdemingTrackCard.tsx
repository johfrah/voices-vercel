"use client";

import { Play, Heart, MessageCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface AdemingTrackCardProps {
  track: any;
  onClick?: () => void;
}

const elementColors: Record<string, string> = {
  aarde: "bg-element-aarde text-white",
  water: "bg-element-water text-white",
  lucht: "bg-element-lucht text-white",
  vuur: "bg-element-vuur text-white",
};

export const AdemingTrackCard = ({ track, onClick }: AdemingTrackCardProps) => {
  return (
    <motion.div 
      whileHover={{ y: -5 }}
      onClick={onClick}
      className="bg-white rounded-2xl overflow-hidden shadow-soft hover:shadow-medium transition-all cursor-pointer group"
    >
      <div className="relative aspect-square">
        <img 
          src={track.cover_image_url} 
          alt="" 
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000" 
        />
        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors" />
        
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="w-12 h-12 rounded-full bg-white text-black flex items-center justify-center shadow-lg">
            <Play size={20} fill="currentColor" className="ml-1" />
          </div>
        </div>

        {track.element && (
          <div className={cn(
            "absolute bottom-3 left-3 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest",
            elementColors[track.element] || "bg-primary text-white"
          )}>
            {track.element}
          </div>
        )}
      </div>

      <div className="p-5 space-y-2">
        <h3 className="font-serif text-xl font-semibold text-foreground line-clamp-1">
          {track.title}
        </h3>
        <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
          {track.short_description || "Een moment van rust."}
        </p>
        
        <div className="pt-2 flex items-center justify-between">
          <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest">
            {track.maker || "Julie"}
          </span>
          <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest">
            {track.duration ? `${Math.floor(track.duration / 60)} min` : "10 min"}
          </span>
        </div>
      </div>
    </motion.div>
  );
};
