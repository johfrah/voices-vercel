"use client";

import { cn } from "@/lib/utils";
import Link from "next/link";

interface LogoProps {
  className?: string;
}

import { VoiceglotText } from "../VoiceglotText";
import { useEditMode } from "@/contexts/EditModeContext";
import { Lock } from "lucide-react";

interface LogoProps {
  className?: string;
}

export const Logo = ({ className }: LogoProps) => {
  const { isEditMode } = useEditMode();
  const letters = "ademing".split("");
  
  const getAnimationClass = (index: number) => {
    if (index === 0 || index === 6) {
      return "animate-breathe-wave-subtle";
    }
    return "animate-breathe-wave";
  };
  
  return (
    <Link href="/" className={cn("flex items-end gap-0.5 relative group/logo", className)} aria-label="Ga naar homepage">
      {isEditMode && (
        <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover/logo:opacity-100 transition-opacity bg-va-black text-white px-2 py-0.5 rounded text-[10px] font-black tracking-widest flex items-center gap-1 z-50 whitespace-nowrap">
          <Lock size={8} className="text-primary" />
          LOGO EDIT
        </div>
      )}
      {letters.map((letter, index) => (
        <span
          key={index}
          className={cn(
            "text-3xl italic font-medium text-foreground inline-block font-serif",
            getAnimationClass(index)
          )}
          style={{
            animationDelay: `${index * 0.15}s`,
          }}
        >
          {letter === 'a' ? (
            <VoiceglotText 
              translationKey="ademing.logo.a" 
              defaultText="a" 
              noTranslate 
              className="p-0 m-0 border-none hover:bg-transparent"
            />
          ) : letter}
        </span>
      ))}
    </Link>
  );
};
